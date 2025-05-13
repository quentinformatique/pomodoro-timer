import { FC } from 'react';
import { ThemeSelector } from '../ThemeSelector';
import { LanguageSelector } from '../LanguageSelector';

export const AppearanceSettings: FC = () => {
    return (
        <div className="space-y-4">
            <ThemeSelector />
            <LanguageSelector />
        </div>
    );
}; 