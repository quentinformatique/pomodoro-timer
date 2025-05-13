import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { InitOptions } from 'i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import Cookies from 'js-cookie';

const config: InitOptions = {
    resources: {
        en: { translation: en },
        fr: { translation: fr }
    },
    fallbackLng: 'en',
    detection: {
        order: ['cookie', 'navigator'],
        caches: ['cookie']
    },
    interpolation: {
        escapeValue: false
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(config);

export const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    Cookies.set('i18next', lang, { expires: 365 });
};

export default i18n; 