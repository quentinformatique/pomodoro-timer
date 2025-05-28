import { IndicatorState } from "../Views/Components/Timer/ProgressIndicators/IndicatorState";
import Cookies from "js-cookie";

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    manualMode: boolean;
}

const defaultSettings: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    manualMode: false,
};

interface TimerState {
    timeLeft: number;
    isRunning: boolean;
    isWorkCycle: boolean;
    currentCycle: number;
    needsLongBreak: boolean;
    indicators: IndicatorState[];
    settings: PomodoroSettings;
    lastUpdatedAt: number;
}

class TimerService {
    private static instance: TimerService;
    private state: TimerState;
    private listeners: Array<() => void> = [];
    private intervalId: number | null = null;

    private constructor() {
        // Initialiser l'état avec des valeurs par défaut
        this.state = {
            timeLeft: defaultSettings.workDuration * 60,
            isRunning: false,
            isWorkCycle: true,
            currentCycle: 0,
            needsLongBreak: false,
            indicators: Array(defaultSettings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[],
            settings: { ...defaultSettings },
            lastUpdatedAt: Date.now()
        };

        // Charger les paramètres sauvegardés
        this.loadSettings();
    }

    public static getInstance(): TimerService {
        if (!TimerService.instance) {
            TimerService.instance = new TimerService();
        }
        return TimerService.instance;
    }

    private loadSettings() {
        const savedSettings = Cookies.get("pomodoroSettings");
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                this.state.settings = parsedSettings;
                // Ne réinitialise pas les indicateurs si on est en cours de session
                if (this.state.indicators.every(state => state === IndicatorState.NotStarted)) {
                    this.state.indicators = Array(parsedSettings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        }

        // Charger l'état du timer si disponible
        const savedTimerState = Cookies.get("timerState");
        if (savedTimerState) {
            try {
                const parsedState = JSON.parse(savedTimerState) as Partial<TimerState>;
                const lastUpdatedAt = parsedState.lastUpdatedAt || Date.now();
                
                // Si le timer était en cours, calculer le temps écoulé depuis
                if (parsedState.isRunning && parsedState.timeLeft) {
                    const elapsedSeconds = Math.floor((Date.now() - lastUpdatedAt) / 1000);
                    const newTimeLeft = Math.max(0, parsedState.timeLeft - elapsedSeconds);
                    
                    // Si le temps est écoulé, on gère le cycle suivant au prochain démarrage
                    if (newTimeLeft <= 0) {
                        parsedState.isRunning = false;
                        parsedState.timeLeft = 1; // On laisse 1 seconde pour que handleCycleEnd soit déclenché
                    } else {
                        parsedState.timeLeft = newTimeLeft;
                    }
                }
                
                // Mettre à jour l'état avec les valeurs sauvegardées
                Object.assign(this.state, parsedState, { lastUpdatedAt: Date.now() });
                
                // Redémarrer l'interval si le timer est en cours
                if (this.state.isRunning) {
                    this.startInterval();
                }
            } catch (error) {
                console.error("Error loading timer state:", error);
            }
        }
    }

    private saveState() {
        try {
            const stateToSave = {
                ...this.state,
                lastUpdatedAt: Date.now()
            };
            Cookies.set("timerState", JSON.stringify(stateToSave), { expires: 1 }); // Expire en 1 jour
        } catch (error) {
            console.error("Error saving timer state:", error);
        }
    }

    // Démarrer l'intervalle pour décompter le temps
    private startInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = window.setInterval(() => {
            this.updateTimeLeft();
        }, 1000);
    }

    // Arrêter l'intervalle
    private stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    // Mettre à jour le temps restant
    private updateTimeLeft() {
        if (this.state.timeLeft <= 1) {
            this.stopInterval();
            this.state.isRunning = false;
            this.state.timeLeft = 0;
            this.handleCycleEnd();
        } else {
            this.state.timeLeft -= 1;
        }
        
        this.saveState();
        this.notifyListeners();
    }

    // Gérer la fin d'un cycle
    private handleCycleEnd() {
        if (this.state.isWorkCycle) {
            // Fin d'un cycle de travail
            const updatedIndicators: IndicatorState[] = [...this.state.indicators];
            updatedIndicators[this.state.currentCycle] = IndicatorState.Completed;
            this.state.indicators = updatedIndicators;

            // Vérifier si tous les cycles sont terminés
            if (this.state.currentCycle >= this.state.settings.cyclesBeforeLongBreak - 1) {
                // Tous les cycles sont terminés, commencer la pause longue
                this.state.needsLongBreak = true;
                this.state.timeLeft = this.state.settings.longBreakDuration * 60;
            } else {
                // Commencer une pause standard
                this.state.timeLeft = this.state.settings.shortBreakDuration * 60;
            }

            this.state.isWorkCycle = false;
            
            // Redémarrer automatiquement seulement si on n'est pas en mode manuel
            if (!this.state.settings.manualMode) {
                this.toggleTimer();
            } else {
                // Jouer un son de notification en mode manuel
                this.playNotificationSound();
            }
        } else {
            // Fin d'un cycle de pause
            if (this.state.needsLongBreak) {
                // Fin de pause longue, tout réinitialiser
                this.resetAll();
                
                // Redémarrer automatiquement un nouveau cycle complet seulement si on n'est pas en mode manuel
                if (!this.state.settings.manualMode) {
                    const updatedIndicators: IndicatorState[] = [...this.state.indicators];
                    updatedIndicators[0] = IndicatorState.InProgress;
                    this.state.indicators = updatedIndicators;
                    this.state.timeLeft = this.state.settings.workDuration * 60;
                    this.toggleTimer();
                } else {
                    // Jouer un son de notification en mode manuel
                    this.playNotificationSound();
                }
            } else {
                // Passer au cycle de travail suivant
                const nextCycle = this.state.currentCycle + 1;
                this.state.currentCycle = nextCycle;

                // Marquer le cycle suivant comme en cours
                const updatedIndicators: IndicatorState[] = [...this.state.indicators];
                if (nextCycle < this.state.settings.cyclesBeforeLongBreak) {
                    updatedIndicators[nextCycle] = IndicatorState.InProgress;
                }
                this.state.indicators = updatedIndicators;

                this.state.timeLeft = this.state.settings.workDuration * 60;
                this.state.isWorkCycle = true;

                // Redémarrer automatiquement seulement si on n'est pas en mode manuel
                if (!this.state.settings.manualMode) {
                    this.toggleTimer();
                } else {
                    // Jouer un son de notification en mode manuel
                    this.playNotificationSound();
                }
            }
        }
        
        this.saveState();
        this.notifyListeners();
    }

    // Jouer un son de notification
    private playNotificationSound() {
        try {
            const audio = new Audio("/sounds/complete.mp3");
            audio.play();
        } catch (error) {
            console.error("Error playing notification sound:", error);
        }
    }

    // API publique
    public getState(): TimerState {
        return { ...this.state };
    }

    public toggleTimer() {
        if (!this.state.isRunning) {
            // Démarrer le timer
            if (this.state.indicators.every(state => state === IndicatorState.NotStarted)) {
                // Premier démarrage
                const updatedIndicators: IndicatorState[] = [...this.state.indicators];
                updatedIndicators[0] = IndicatorState.InProgress;
                this.state.indicators = updatedIndicators;
                this.state.currentCycle = 0;
                this.state.isWorkCycle = true;
                this.state.timeLeft = this.state.settings.workDuration * 60;
            }
            this.state.isRunning = true;
            this.startInterval();
        } else {
            // Arrêter le timer
            this.state.isRunning = false;
            this.stopInterval();
        }
        
        this.saveState();
        this.notifyListeners();
    }

    public resetAll() {
        // Arrêter le timer
        this.stopInterval();
        
        // Réinitialiser tous les états
        this.state.isRunning = false;
        this.state.timeLeft = this.state.settings.workDuration * 60;
        this.state.isWorkCycle = true;
        this.state.currentCycle = 0;
        this.state.needsLongBreak = false;
        this.state.indicators = Array(this.state.settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
        
        this.saveState();
        this.notifyListeners();
    }

    public updateSettings(settings: PomodoroSettings) {
        this.state.settings = { ...settings };
        
        // Mettre à jour le temps restant en fonction du type de cycle actuel
        if (this.state.isWorkCycle) {
            this.state.timeLeft = settings.workDuration * 60;
        } else if (this.state.needsLongBreak) {
            this.state.timeLeft = settings.longBreakDuration * 60;
        } else {
            this.state.timeLeft = settings.shortBreakDuration * 60;
        }
        
        // Mettre à jour les indicateurs si nécessaire
        if (settings.cyclesBeforeLongBreak !== this.state.indicators.length) {
            // Préserver les états existants lors du redimensionnement
            const newIndicators: IndicatorState[] = Array(settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
            
            // Copier les états existants
            for (let i = 0; i < Math.min(this.state.indicators.length, newIndicators.length); i++) {
                newIndicators[i] = this.state.indicators[i];
            }
            
            this.state.indicators = newIndicators;
        }
        
        this.saveState();
        this.notifyListeners();
    }

    // Système d'abonnement pour les composants
    public subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

export const timerService = TimerService.getInstance(); 