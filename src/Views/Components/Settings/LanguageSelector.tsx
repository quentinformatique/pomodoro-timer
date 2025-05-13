import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../../i18n/config';

interface Language {
    code: string;
    name: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
];

export const LanguageSelector: FC = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const handleLanguageChange = (code: string) => {
        changeLanguage(code);
    };

    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-green-light flex-1 md:mr-16 lg:mr-24">
                {t('language.title')}
            </span>
            <div className="flex gap-2">
                {languages.map(({ code, name }) => (
                    <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                            currentLanguage === code
                                ? 'bg-green-light text-gray'
                                : 'text-green-light hover:bg-green-light/10'
                        }`}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
}; 