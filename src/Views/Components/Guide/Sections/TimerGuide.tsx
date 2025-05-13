import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../Utilities/Icon';

export const TimerGuide: FC = () => {
    const { t } = useTranslation();

    return (
        <section className="space-y-3">
            <h2 className="text-xl font-medium text-green-light">{t('guide.timer.title')}</h2>
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <Icon code="timer" fill={false} className="text-xl text-green-light mt-1" />
                    <p className="text-green-light/70 text-sm">{t('guide.timer.description')}</p>
                </div>
                <div className="flex items-start gap-2">
                    <Icon code="play_arrow" fill={false} className="text-xl text-green-light mt-1" />
                    <p className="text-green-light/70 text-sm">{t('guide.timer.controls')}</p>
                </div>
            </div>
        </section>
    );
}; 