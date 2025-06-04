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
        // Initialize state with default values
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

        // Load saved settings
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
                // Don't reset indicators if we're in the middle of a session
                if (this.state.indicators.every(state => state === IndicatorState.NotStarted)) {
                    this.state.indicators = Array(parsedSettings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        }

        // Load timer state if available
        const savedTimerState = Cookies.get("timerState");
        if (savedTimerState) {
            try {
                const parsedState = JSON.parse(savedTimerState) as Partial<TimerState>;
                const lastUpdatedAt = parsedState.lastUpdatedAt || Date.now();
                
                // If timer was running, calculate elapsed time
                if (parsedState.isRunning && parsedState.timeLeft) {
                    const elapsedSeconds = Math.floor((Date.now() - lastUpdatedAt) / 1000);
                    const newTimeLeft = Math.max(0, parsedState.timeLeft - elapsedSeconds);
                    
                    // If time is up, handle next cycle on next start
                    if (newTimeLeft <= 0) {
                        parsedState.isRunning = false;
                        parsedState.timeLeft = 1; // Leave 1 second for handleCycleEnd to be triggered
                    } else {
                        parsedState.timeLeft = newTimeLeft;
                    }
                }
                
                // Update state with saved values
                Object.assign(this.state, parsedState, { lastUpdatedAt: Date.now() });
                
                // Restart interval if timer is running
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
            Cookies.set("timerState", JSON.stringify(stateToSave), { expires: 1 }); // Expires in 1 day
        } catch (error) {
            console.error("Error saving timer state:", error);
        }
    }

    // Start interval to count down time
    private startInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = window.setInterval(() => {
            this.updateTimeLeft();
        }, 1000);
    }

    // Stop interval
    private stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    // Update remaining time
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

    // Handle cycle end
    private handleCycleEnd() {
        if (this.state.isWorkCycle) {
            // End of work cycle
            const updatedIndicators: IndicatorState[] = [...this.state.indicators];
            updatedIndicators[this.state.currentCycle] = IndicatorState.Completed;
            this.state.indicators = updatedIndicators;

            // Check if all cycles are completed
            if (this.state.currentCycle >= this.state.settings.cyclesBeforeLongBreak - 1) {
                // All cycles completed, start long break
                this.state.needsLongBreak = true;
                this.state.timeLeft = this.state.settings.longBreakDuration * 60;
            } else {
                // Start standard break
                this.state.timeLeft = this.state.settings.shortBreakDuration * 60;
            }

            this.state.isWorkCycle = false;
            
            // Auto-restart only if not in manual mode
            if (!this.state.settings.manualMode) {
                this.toggleTimer();
            } else {
                // Play notification sound in manual mode
                this.playNotificationSound();
            }
        } else {
            // End of break cycle
            if (this.state.needsLongBreak) {
                // End of long break, reset everything
                this.resetAll();
                
                // Auto-restart new complete cycle only if not in manual mode
                if (!this.state.settings.manualMode) {
                    const updatedIndicators: IndicatorState[] = [...this.state.indicators];
                    updatedIndicators[0] = IndicatorState.InProgress;
                    this.state.indicators = updatedIndicators;
                    this.state.timeLeft = this.state.settings.workDuration * 60;
                    this.toggleTimer();
                } else {
                    // Play notification sound in manual mode
                    this.playNotificationSound();
                }
            } else {
                // Move to next work cycle
                const nextCycle = this.state.currentCycle + 1;
                this.state.currentCycle = nextCycle;

                // Mark next cycle as in progress
                const updatedIndicators: IndicatorState[] = [...this.state.indicators];
                if (nextCycle < this.state.settings.cyclesBeforeLongBreak) {
                    updatedIndicators[nextCycle] = IndicatorState.InProgress;
                }
                this.state.indicators = updatedIndicators;

                this.state.timeLeft = this.state.settings.workDuration * 60;
                this.state.isWorkCycle = true;

                // Auto-restart only if not in manual mode
                if (!this.state.settings.manualMode) {
                    this.toggleTimer();
                } else {
                    // Play notification sound in manual mode
                    this.playNotificationSound();
                }
            }
        }
        
        this.saveState();
        this.notifyListeners();
    }

    // Play notification sound
    private playNotificationSound() {
        try {
            const audio = new Audio("/sounds/complete.mp3");
            audio.play();
        } catch (error) {
            console.error("Error playing notification sound:", error);
        }
    }

    // Public API
    public getState(): TimerState {
        return { ...this.state };
    }

    public toggleTimer() {
        if (!this.state.isRunning) {
            // Start timer
            if (this.state.indicators.every(state => state === IndicatorState.NotStarted)) {
                // First start
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
            // Stop timer
            this.state.isRunning = false;
            this.stopInterval();
        }
        
        this.saveState();
        this.notifyListeners();
    }

    public resetAll() {
        // Stop timer
        this.stopInterval();
        
        // Reset all states
        this.state.isRunning = false;
        this.state.timeLeft = this.state.settings.workDuration * 60;
        this.state.isWorkCycle = true;
        this.state.currentCycle = 0;
        this.state.needsLongBreak = false;
        this.state.indicators = Array(this.state.settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
        
        this.saveState();
        this.notifyListeners();
    }

    public skipStep() {
        // Stop current timer
        this.stopInterval();
        this.state.isRunning = false;
        
        // Handle the current cycle end
        this.handleCycleEnd();
        
        this.saveState();
        this.notifyListeners();
    }

    public updateSettings(settings: PomodoroSettings) {
        this.state.settings = { ...settings };
        
        // Update remaining time based on current cycle type
        if (this.state.isWorkCycle) {
            this.state.timeLeft = settings.workDuration * 60;
        } else if (this.state.needsLongBreak) {
            this.state.timeLeft = settings.longBreakDuration * 60;
        } else {
            this.state.timeLeft = settings.shortBreakDuration * 60;
        }
        
        // Update indicators if necessary
        if (settings.cyclesBeforeLongBreak !== this.state.indicators.length) {
            // Preserve existing states during resize
            const newIndicators: IndicatorState[] = Array(settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted) as IndicatorState[];
            
            // Copy existing states
            for (let i = 0; i < Math.min(this.state.indicators.length, newIndicators.length); i++) {
                newIndicators[i] = this.state.indicators[i];
            }
            
            this.state.indicators = newIndicators;
        }
        
        this.saveState();
        this.notifyListeners();
    }

    // Subscription system for components
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