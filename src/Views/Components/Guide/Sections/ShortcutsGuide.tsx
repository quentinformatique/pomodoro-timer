import { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const ShortcutsGuide: FC = () => {
    const { t } = useTranslation();

    const shortcuts = [
        { key: 'Space', label: 'shortcuts.space', description: 'guide.shortcuts.playPause' },
        { key: 'R', label: 'shortcuts.r', description: 'guide.shortcuts.reset' },
        { key: 'M', label: 'shortcuts.m', description: 'guide.shortcuts.mute' },
        { key: 'Esc', label: 'shortcuts.esc', description: 'guide.shortcuts.back' }
    ];

    return (
        <section className="space-y-3">
            <h2 className="text-xl font-medium text-green-light">{t('guide.shortcuts.title')}</h2>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {shortcuts.map(({ key, description }) => (
                    <>
                        <kbd className="px-2 py-1 bg-green-dark/20 rounded text-green-light text-center">
                            {key}
                        </kbd>
                        <span className="text-green-light/70">{t(description)}</span>
                    </>
                ))}
            </div>
        </section>
    );
}; 