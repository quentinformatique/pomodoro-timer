import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsInput } from '../SettingsInput';
import { Icon } from '../../Utilities/Icon';

interface PomodoroSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    manualMode: boolean;
}

interface TimerSettingsProps {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    manualMode: boolean;
    onSettingChange: (key: keyof PomodoroSettings, value: number | boolean) => void;
}

export const TimerSettings: FC<TimerSettingsProps> = ({
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    cyclesBeforeLongBreak,
    manualMode,
    onSettingChange
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-0 sm:space-y-4 min-h-[16rem]">
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
            <div className="flex items-center justify-between py-3">
                <div className="flex-1 md:mr-16 lg:mr-24">
                    <div className="flex items-center gap-2">
                        <Icon 
                            code={manualMode ? "touch_app" : "autorenew"} 
                            fill={manualMode}
                            className="text-xl text-green-light"
                        />
                        <span className="text-green-light block">
                            {manualMode 
                                ? t('settings.mode.manualMode')
                                : t('settings.mode.autoMode')}
                        </span>
                    </div>
                    <span className="text-green-light/70 text-sm block mt-1 ml-7">
                        {manualMode 
                            ? t('settings.mode.manualModeDescription')
                            : t('settings.mode.autoModeDescription')}
                    </span>
                </div>
                <button
                    onClick={() => onSettingChange("manualMode", !manualMode)}
                    className={`p-2 rounded-lg transition-colors ${
                        manualMode 
                            ? 'text-green-light bg-green-light/10' 
                            : 'text-green-light/50 hover:text-green-light hover:bg-green-light/10'
                    }`}
                >
                    <Icon 
                        code={manualMode ? "touch_app" : "autorenew"} 
                        fill={manualMode}
                        className="text-2xl"
                    />
                </button>
            </div>
        </div>
    );
}; 