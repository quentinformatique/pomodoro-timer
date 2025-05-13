import { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Introduction: FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-2">
            <h2 className="text-xl font-medium text-green-light">{t('guide.introduction.title')}</h2>
            <p className="text-green-light/70 text-sm">{t('guide.introduction.description')}</p>
        </section>
    );
}; 