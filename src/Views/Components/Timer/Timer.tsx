import { FC, useState, useEffect, useRef } from "react";
import { DigitalTimer } from "./DigitalTimer.tsx";
import { IndicatorGroup } from "./ProgressIndicators/IndicatorGroup.tsx";
import { IndicatorState } from "./ProgressIndicators/IndicatorState.tsx";
import { Icon } from "../Utilities/Icon.tsx";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { notificationService } from '../../../services/NotificationService';
import { timerService } from '../../../services/TimerService';

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    manualMode: boolean;
}

export const Timer: FC = () => {
    const { t } = useTranslation();
    
    // Local states for rendering
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isWorkCycle, setIsWorkCycle] = useState<boolean>(true);
    const [needsLongBreak, setNeedsLongBreak] = useState<boolean>(false);
    const [indicators, setIndicators] = useState<IndicatorState[]>([]);
    const [settings, setSettings] = useState<PomodoroSettings>({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        cyclesBeforeLongBreak: 4,
        manualMode: false,
    });
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

    // Audio refs
    const startSoundRef = useRef<HTMLAudioElement | null>(null);
    const breakSoundRef = useRef<HTMLAudioElement | null>(null);
    const completeSoundRef = useRef<HTMLAudioElement | null>(null);
    
    // To track previous state
    const prevRunningRef = useRef(false);
    const prevWorkCycleRef = useRef(true);
    const prevNeedsLongBreakRef = useRef(false);

    // Synchronize local state with service
    useEffect(() => {
        const syncWithService = () => {
            const state = timerService.getState();
            setTimeLeft(state.timeLeft);
            setIsRunning(state.isRunning);
            setIsWorkCycle(state.isWorkCycle);
            setNeedsLongBreak(state.needsLongBreak);
            setIndicators(state.indicators);
            setSettings(state.settings);
        };
        
        // Initial synchronization
        syncWithService();
        
        // Subscribe to updates
        const unsubscribe = timerService.subscribe(syncWithService);
        
        // Unsubscribe on cleanup
        return unsubscribe;
    }, []);

    // Load sound state from cookies
    useEffect(() => {
        const savedSound = Cookies.get("soundEnabled");
        if (savedSound !== undefined) {
            setSoundEnabled(savedSound === "true");
        }
    }, []);

    // Initialize audio elements
    useEffect(() => {
        // Create audio elements
        startSoundRef.current = new Audio("/sounds/start.mp3");
        breakSoundRef.current = new Audio("/sounds/break.mp3");
        completeSoundRef.current = new Audio("/sounds/complete.mp3");

        // Optional: Preload audio
        if (startSoundRef.current) startSoundRef.current.load();
        if (breakSoundRef.current) breakSoundRef.current.load();
        if (completeSoundRef.current) completeSoundRef.current.load();

        // Cleanup function
        return () => {
            startSoundRef.current = null;
            breakSoundRef.current = null;
            completeSoundRef.current = null;
        };
    }, []);

    // Function to play sounds
    const playSound = (soundType: 'start' | 'break' | 'complete') => {
        if (!soundEnabled) return;

        try {
            if (soundType === 'start' && startSoundRef.current) {
                startSoundRef.current.currentTime = 0;
                startSoundRef.current.play();
            } else if (soundType === 'break' && breakSoundRef.current) {
                breakSoundRef.current.currentTime = 0;
                breakSoundRef.current.play();
            } else if (soundType === 'complete' && completeSoundRef.current) {
                completeSoundRef.current.currentTime = 0;
                completeSoundRef.current.play();
            }
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    // Play sounds on timer state change
    useEffect(() => {
        // Don't play sound on first render
        if (prevRunningRef.current === isRunning && 
            prevWorkCycleRef.current === isWorkCycle && 
            prevNeedsLongBreakRef.current === needsLongBreak) {
            return;
        }
        
        // Update references
        prevRunningRef.current = isRunning;
        prevWorkCycleRef.current = isWorkCycle;
        prevNeedsLongBreakRef.current = needsLongBreak;
        
        // Play sound based on current state
        if (isRunning) {
            if (isWorkCycle) {
                playSound('start');
            } else if (needsLongBreak) {
                playSound('break');
            } else {
                playSound('break');
            }
        }
    }, [isRunning, isWorkCycle, needsLongBreak]);

    // Calculate progress percentage for the circle
    const calculateProgress = () => {
        const totalTime = isWorkCycle
            ? settings.workDuration * 60
            : needsLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60;
        return 1 - (timeLeft / totalTime);
    };

    const toggleTimer = () => {
        timerService.toggleTimer();
    };

    const resetAll = () => {
        timerService.resetAll();
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleSound = () => {
        setSoundEnabled(prev => {
            const newValue = !prev;
            Cookies.set("soundEnabled", String(newValue), { expires: 365 });
            return newValue;
        });
    };

    // SVG Circle parameters
    const circleSize = 320;
    const circleRadius = circleSize / 2;
    const strokeWidth = 14;
    const normalizedRadius = circleRadius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Calculate the stroke dashoffset based on progress
    const progress = calculateProgress();
    const strokeDashoffset = circumference * (1 - progress);

    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if we're in a text input
            if (event.target instanceof HTMLInputElement) return;

            // Space for play/pause
            if (event.code === 'Space') {
                event.preventDefault();
                toggleTimer();
            }
            
            // R to reset timer
            if (event.code === 'KeyR') {
                event.preventDefault();
                resetAll();
            }

            // M to toggle sound
            if (event.code === 'KeyM') {
                event.preventDefault();
                toggleSound();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleTimer, resetAll, toggleSound]);

    // Notify state changes
    useEffect(() => {
        if (!isRunning) return;

        const notifyState = async () => {
            if (isWorkCycle) {
                await notificationService.notifyPomodoroState('work');
            } else if (needsLongBreak) {
                await notificationService.notifyPomodoroState('longBreak');
            } else {
                await notificationService.notifyPomodoroState('shortBreak');
            }
        };

        notifyState();
    }, [isWorkCycle, needsLongBreak, isRunning]);

    // Update document title with timer progress
    useEffect(() => {
        const totalTime = isWorkCycle
            ? settings.workDuration * 60
            : needsLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60;
        
        const progress = Math.round((1 - timeLeft / totalTime) * 100);
        const timeString = formatTime(timeLeft);
        const cycleType = isWorkCycle 
            ? t('timer.workTime')
            : needsLongBreak 
                ? t('timer.longBreak')
                : t('timer.shortBreak');
        
        document.title = `${timeString} - ${cycleType} (${progress}%)`;
        
        // Reset title when timer is not running
        if (!isRunning) {
            document.title = 'Pomodoro Timer';
        }
    }, [timeLeft, isRunning, isWorkCycle, needsLongBreak, settings, t]);

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto flex items-center justify-center">
                    {/* SVG Circle for progress */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full -rotate-90"
                        viewBox={`0 0 ${circleSize} ${circleSize}`}
                    >
                        {/* Background circle */}
                        <circle
                            cx={circleRadius}
                            cy={circleRadius}
                            r={normalizedRadius}
                            fill="transparent"
                            stroke="#053D38"
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress circle */}
                        <circle
                            cx={circleRadius}
                            cy={circleRadius}
                            r={normalizedRadius}
                            fill="transparent"
                            stroke="#A3CCAB"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="z-10 flex flex-col gap-3 sm:gap-5 items-center">
                        <DigitalTimer value={formatTime(timeLeft)} />
                        <div className="text-sm text-center">
                            {isWorkCycle 
                                ? t('timer.workTime')
                                : needsLongBreak 
                                    ? t('timer.longBreak')
                                    : t('timer.shortBreak')
                            }
                        </div>
                        <IndicatorGroup indicators={indicators} />
                    </div>
                </div>
                <div className="flex justify-center gap-10 mt-8">
                    <div className="hover:cursor-pointer flex flex-col justify-center" onClick={resetAll}>
                        <Icon
                            code="refresh"
                            fill={false}
                            className="text-3xl! sm:text-4xl!"
                        />
                    </div>
                    <div className="hover:cursor-pointer" onClick={toggleTimer}>
                        <Icon
                            code={isRunning ? "pause" : "play_arrow"}
                            fill={false}
                            className="text-5xl! sm:text-7xl!"
                        />
                    </div>
                    <div className="hover:cursor-pointer flex flex-col justify-center" onClick={toggleSound}>
                        <Icon
                            code={soundEnabled ? "volume_up" : "volume_off"}
                            fill={false}
                            className="text-3xl! sm:text-4xl!"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};