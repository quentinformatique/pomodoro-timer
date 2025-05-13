import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { themeService } from '../../../services/ThemeService';
import { Icon } from '../Utilities/Icon';

export const ThemeSelector: FC = () => {
    const { t } = useTranslation();
    const [isLight, setIsLight] = useState(themeService.getCurrentTheme() === 'light');

    const handleToggle = () => {
        const newTheme = themeService.toggleTheme();
        setIsLight(newTheme === 'light');
    };

    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-green-light flex-1 md:mr-16 lg:mr-24">
                {t('settings.appearance.theme')}
            </span>
            <button
                onClick={handleToggle}
                className="p-2 rounded-lg transition-colors hover:bg-green-dark/20"
            >
                <Icon 
                    code={isLight ? "dark_mode" : "light_mode"} 
                    fill={false} 
                    className="text-2xl text-green-light"
                />
            </button>
        </div>
    );
}; 