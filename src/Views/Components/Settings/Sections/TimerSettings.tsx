import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsInput } from '../SettingsInput';

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
}

interface TimerSettingsProps {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    onSettingChange: (key: keyof PomodoroSettings, value: number) => void;
}

export const TimerSettings: FC<TimerSettingsProps> = ({
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    cyclesBeforeLongBreak,
    onSettingChange
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 min-h-[16rem]">
            <SettingsInput
                label={t('settings.durations.workDuration')}
                value={workDuration}
                onChange={(value) => onSettingChange("workDuration", value)}
                min={1}
                max={60}
                unit={t('settings.units.minutes')}
            />
            <SettingsInput
                label={t('settings.durations.shortBreakDuration')}
                value={shortBreakDuration}
                onChange={(value) => onSettingChange("shortBreakDuration", value)}
                min={1}
                max={30}
                unit={t('settings.units.minutes')}
            />
            <SettingsInput
                label={t('settings.durations.longBreakDuration')}
                value={longBreakDuration}
                onChange={(value) => onSettingChange("longBreakDuration", value)}
                min={1}
                max={60}
                unit={t('settings.units.minutes')}
            />
            <SettingsInput
                label={t('settings.cycles.cyclesBeforeLongBreak')}
                value={cyclesBeforeLongBreak}
                onChange={(value) => onSettingChange("cyclesBeforeLongBreak", value)}
                min={1}
                max={10}
                unit={t('settings.units.cycles')}
            />
        </div>
    );
}; 