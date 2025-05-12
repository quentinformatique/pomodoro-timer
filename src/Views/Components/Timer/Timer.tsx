  import { FC, useState, useEffect, useRef } from "react";
import { DigitalTimer } from "./DigitalTimer.tsx";
import { IndicatorGroup } from "./ProgressIndicators/IndicatorGroup.tsx";
import { IndicatorState } from "./ProgressIndicators/IndicatorState.tsx";
import { Icon } from "../Utilities/Icon.tsx";

export const Timer: FC = () => {
    const WORK_TIME = 20 * 60;
    const BREAK_TIME = 5 * 60;
    const LONG_BREAK_TIME = 15 * 60;
    const WORK_CYCLES = 4; // Number of work cycles before a long break

    const [timeLeft, setTimeLeft] = useState<number>(WORK_TIME);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isWorkCycle, setIsWorkCycle] = useState<boolean>(true); // true = work, false = break
    const [currentCycle, setCurrentCycle] = useState<number>(0); // Index of current cycle
    const [needsLongBreak, setNeedsLongBreak] = useState<boolean>(false); // Indicates if a long break is needed
    const soundEnabled = useRef<boolean>(true); // Sound toggle state
    const [indicators, setIndicators] = useState<IndicatorState[]>(
        Array(WORK_CYCLES).fill(IndicatorState.NotStarted)
    );

    // Calculate progress percentage for the circle
    const calculateProgress = () => {
        const totalTime = isWorkCycle
            ? WORK_TIME
            : needsLongBreak ? LONG_BREAK_TIME : BREAK_TIME;
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
        if (!soundEnabled.current) return;

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
        setIsRunning((prev) => {
            if (!prev) {
                // Start the first work cycle if not running
                if (!isRunning && indicators.every(state => state === IndicatorState.NotStarted)) {
                    // If starting for the first time, set the first indicator to InProgress
                    setIndicators(prev => {
                        const updated = [...prev];
                        updated[0] = IndicatorState.InProgress;
                        return updated;
                    });
                    setCurrentCycle(0);
                    setIsWorkCycle(true);
                    setTimeLeft(WORK_TIME);
                    // Play start sound
                    playSound('start');
                } else {
                    // Resume from pause
                    playSound('start');
                }
            }
            return !prev;
        });
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
            if (currentCycle >= WORK_CYCLES - 1) {
                // All cycles are done, start the long break
                setNeedsLongBreak(true);
                setTimeLeft(LONG_BREAK_TIME);
                // Play break sound
                playSound('break');
            } else {
                // Start a standard break
                setTimeLeft(BREAK_TIME);
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
                    setTimeLeft(WORK_TIME);
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
                    if (nextCycle < WORK_CYCLES) {
                        updated[nextCycle] = IndicatorState.InProgress;
                    }
                    return updated;
                });

                setTimeLeft(WORK_TIME);
                setIsWorkCycle(true);
                // Play start sound
                playSound('start');

                // Automatically start the next cycle
                setTimeout(() => setIsRunning(true), 0);
            }
        }
    };

    const resetAll = () => {
        setTimeLeft(WORK_TIME);
        setIsRunning(false);
        setIsWorkCycle(true);
        setCurrentCycle(0);
        setNeedsLongBreak(false);
        setIndicators(Array(WORK_CYCLES).fill(IndicatorState.NotStarted));
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const toggleSound = () => {
        soundEnabled.current = !soundEnabled.current;
    };

    // SVG Circle parameters
    const circleSize = 320; //  div size
    const circleRadius = circleSize / 2;
    const strokeWidth = 14; // border width
    const normalizedRadius = circleRadius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Calculate the stroke dashoffset based on progress
    const progress = calculateProgress();
    const strokeDashoffset = circumference * (1 - progress);


    return (
        <div className="flex-1 flex flex-col justify-center">
            <div className="relative flex flex-col gap-10 sm:gap-15 items-center justify-center w-[320px] h-[320px] sm:w-[450px] sm:h-[450px]">
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
                        stroke="#053D38" // green-dark tailwind color
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={circleRadius}
                        cy={circleRadius}
                        r={normalizedRadius}
                        fill="transparent"
                        stroke="#A3CCAB" // green-light tailwind color
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="z-10 flex flex-col gap-3 sm:gap-5 items-center mt-10">
                    <DigitalTimer value={formatTime(timeLeft)} />
                    <div className="text-sm text-center">
                        {isWorkCycle ? "Work Time" : needsLongBreak ? "Long Break" : "Short Break"}
                    </div>
                    <IndicatorGroup indicators={indicators} />
                </div>
                <div className="z-10 flex gap-4">
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
                            code={soundEnabled.current ? "volume_up" : "volume_off"}
                            fill={false}
                            className="text-3xl! sm:text-4xl!"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};