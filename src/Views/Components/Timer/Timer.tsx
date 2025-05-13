import { FC, useState, useEffect, useRef } from "react";
import { DigitalTimer } from "./DigitalTimer.tsx";
import { IndicatorGroup } from "./ProgressIndicators/IndicatorGroup.tsx";
import { IndicatorState } from "./ProgressIndicators/IndicatorState.tsx";
import { Icon } from "../Utilities/Icon.tsx";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { notificationService } from '../../../services/NotificationService';
import { useNavigate } from "react-router-dom";

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
}

const defaultSettings: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
};

export const Timer: FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
    const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration * 60);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isWorkCycle, setIsWorkCycle] = useState<boolean>(true);
    const [currentCycle, setCurrentCycle] = useState<number>(0);
    const [needsLongBreak, setNeedsLongBreak] = useState<boolean>(false);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [indicators, setIndicators] = useState<IndicatorState[]>(
        Array(settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted)
    );

    // Load settings from cookies
    useEffect(() => {
        const savedSettings = Cookies.get("pomodoroSettings");
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(parsedSettings);
            setIndicators(Array(parsedSettings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted));
        }
        // Load sound state from cookies
        const savedSound = Cookies.get("soundEnabled");
        if (savedSound !== undefined) {
            setSoundEnabled(savedSound === "true");
        }
    }, []);

    // Update timeLeft when settings change
    useEffect(() => {
        if (isWorkCycle) {
            setTimeLeft(settings.workDuration * 60);
        } else if (needsLongBreak) {
            setTimeLeft(settings.longBreakDuration * 60);
        } else {
            setTimeLeft(settings.shortBreakDuration * 60);
        }
    }, [settings, isWorkCycle, needsLongBreak]);

    // Calculate progress percentage for the circle
    const calculateProgress = () => {
        const totalTime = isWorkCycle
            ? settings.workDuration * 60
            : needsLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60;
        return 1 - (timeLeft / totalTime);
    };

    // Audio refs
    const startSoundRef = useRef<HTMLAudioElement | null>(null);
    const breakSoundRef = useRef<HTMLAudioElement | null>(null);
    const completeSoundRef = useRef<HTMLAudioElement | null>(null);

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

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        let timer: NodeJS.Timeout | null = null;

        if (isRunning) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer!);
                        // Brief pause before starting the next cycle
                        setIsRunning(false);
                        handleCycleEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning]);

    const toggleTimer = () => {
        if (!isRunning) {
            // Start timer
            if (indicators.every(state => state === IndicatorState.NotStarted)) {
                // First start
                setIndicators(prev => {
                    const updated = [...prev];
                    updated[0] = IndicatorState.InProgress;
                    return updated;
                });
                setCurrentCycle(0);
                setIsWorkCycle(true);
                setTimeLeft(settings.workDuration * 60);
                playSound('start');
            } else {
                // Resume after pause
                playSound('start');
            }
        }
        setIsRunning(prev => !prev);
    };

    const handleCycleEnd = () => {
        if (isWorkCycle) {
            // End of a work cycle
            setIndicators(prev => {
                const updated = [...prev];
                updated[currentCycle] = IndicatorState.Completed;
                return updated;
            });

            // Check if all work cycles are completed
            if (currentCycle >= settings.cyclesBeforeLongBreak - 1) {
                // All cycles are done, start the long break
                setNeedsLongBreak(true);
                setTimeLeft(settings.longBreakDuration * 60);
                // Play break sound
                playSound('break');
            } else {
                // Start a standard break
                setTimeLeft(settings.shortBreakDuration * 60);
                // Play break sound
                playSound('break');
            }

            setIsWorkCycle(false);

            // Automatically start the next cycle
            setTimeout(() => setIsRunning(true), 0);
        } else {
            // End of a break cycle
            if (needsLongBreak) {
                // End of long break, reset everything
                resetAll();
                // Play complete sound
                playSound('complete');
                // Automatically start a new complete cycle
                setTimeout(() => {
                    setIndicators(prev => {
                        const updated = [...prev];
                        updated[0] = IndicatorState.InProgress;
                        return updated;
                    });
                    setTimeLeft(settings.workDuration * 60);
                    setIsRunning(true);
                    // Play start sound for new cycle
                    playSound('start');
                }, 0);
                return;
            } else {
                // Move to the next work cycle
                const nextCycle = currentCycle + 1;
                setCurrentCycle(nextCycle);

                // Mark the next cycle as in progress
                setIndicators(prev => {
                    const updated = [...prev];
                    if (nextCycle < settings.cyclesBeforeLongBreak) {
                        updated[nextCycle] = IndicatorState.InProgress;
                    }
                    return updated;
                });

                setTimeLeft(settings.workDuration * 60);
                setIsWorkCycle(true);
                // Play start sound
                playSound('start');

                // Automatically start the next cycle
                setTimeout(() => setIsRunning(true), 0);
            }
        }
    };

    const resetAll = () => {
        // Stop timer
        setIsRunning(false);
        
        // Reset all states
        setTimeLeft(settings.workDuration * 60);
        setIsWorkCycle(true);
        setCurrentCycle(0);
        setNeedsLongBreak(false);
        setIndicators(Array(settings.cyclesBeforeLongBreak).fill(IndicatorState.NotStarted));
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
                if (!isRunning) {
                    playSound('start');
                }
                setIsRunning(!isRunning);
            }
            
            // R to reset timer
            if (event.code === 'KeyR') {
                event.preventDefault();
                resetAll();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isRunning, playSound, resetAll]);

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
                    <div className="z-10 flex flex-col gap-3 sm:gap-5 items-center mt-10">
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
                <div className="flex justify-center gap-10 mt-10">
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