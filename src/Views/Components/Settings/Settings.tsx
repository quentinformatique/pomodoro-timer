import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../Utilities/Icon";
import { BaseLayout } from "../../Layouts/BaseLayout";
import { TimerSettings } from "./Sections/TimerSettings";
import { AppearanceSettings } from "./Sections/AppearanceSettings";
import { NotificationsSettings } from "./Sections/NotificationsSettings";
import Cookies from "js-cookie";
import { timerService } from "../../../services/TimerService";

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

type SettingsPage = 'timer' | 'appearance' | 'notifications';

export const Settings: FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [currentPage, setCurrentPage] = useState<SettingsPage>('timer');

    // Charger les paramètres depuis le service au démarrage
    useEffect(() => {
        const timerState = timerService.getState();
        setSettings(timerState.settings);
    }, []);

    const pages: Record<SettingsPage, { icon: string, title: string }> = {
        timer: { icon: 'timer', title: t('settings.durations.title') },
        appearance: { icon: 'palette', title: t('settings.appearance.title') },
        notifications: { icon: 'notifications', title: t('settings.notifications.title') }
    };

    const handleSettingChange = (key: keyof PomodoroSettings, value: number | boolean) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            // Sauvegarder immédiatement les changements
            Cookies.set("pomodoroSettings", JSON.stringify(newSettings), { expires: 365 });
            // Mettre à jour le service avec les nouveaux paramètres
            timerService.updateSettings(newSettings);
            return newSettings;
        });
        setHasChanges(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/");
    };

    // escape key
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [navigate]);

    const renderContent = () => {
        switch (currentPage) {
            case 'timer':
                return (
                    <TimerSettings
                        {...settings}
                        onSettingChange={handleSettingChange}
                    />
                );
            case 'appearance':
                return <AppearanceSettings />;
            case 'notifications':
                return <NotificationsSettings />;
        }
    };

    return (
        <BaseLayout>
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 border-b border-green-light/10">
                    <button 
                        onClick={() => navigate("/")} 
                        className="p-2 hover:bg-green-dark/20 rounded-lg transition-colors"
                    >
                        <Icon code="arrow_back" fill={false} className="text-2xl text-green-light" />
                    </button>
                    <h1 className="text-2xl font-medium text-green-light">{t('settings.title')}</h1>
                </div>

                {/* Navigation */}
                <div className="border-b border-green-light/10">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-3 max-w-screen-sm mx-auto">
                            {(Object.entries(pages) as [SettingsPage, { icon: string, title: string }][]).map(([page, { icon, title }]) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex items-center justify-center gap-2 py-3 px-2 transition-colors ${
                                        currentPage === page
                                            ? 'text-green-light border-b-2 border-green-light'
                                            : 'text-green-light/50 hover:text-green-light hover:bg-green-dark/10'
                                    }`}
                                >
                                    <Icon code={icon} fill={false} className="text-xl" />
                                    <span className="text-sm font-medium hidden sm:block">{title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between p-6 pb-0 w-sm sm:w-lg">
                    <div className="flex-1">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="max-w-screen-sm mx-auto">
                                {renderContent()}
                            </div>
                        </div>
                    </div>

                    {/* Footer with Save Button */}
                    <div className="pt-4 border-t border-green-light/10">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="max-w-screen-sm mx-auto flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!hasChanges}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        hasChanges 
                                            ? 'bg-green-light text-gray hover:bg-green-light/90' 
                                            : 'bg-green-light/10 text-green-light/50 cursor-not-allowed'
                                    }`}
                                >
                                    {t('settings.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}; 