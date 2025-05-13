import { FC, useState, ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../Utilities/Icon";
import { BaseLayout } from "../../Layouts/BaseLayout";
import { Introduction } from "./Sections/Introduction";
import { TimerGuide } from "./Sections/TimerGuide";
import { ShortcutsGuide } from "./Sections/ShortcutsGuide";

type GuidePage = 'intro' | 'timer' | 'shortcuts';

export const Guide: FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState<GuidePage>('intro');

    const pages: Record<GuidePage, { icon: string, component: ReactElement }> = {
        intro: { icon: 'info', component: <Introduction /> },
        timer: { icon: 'timer', component: <TimerGuide /> },
        shortcuts: { icon: 'keyboard', component: <ShortcutsGuide /> }
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
                    <h1 className="text-2xl font-medium text-green-light">{t('guide.title')}</h1>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between p-6 w-sm sm:w-lg">
                    <div className="flex-1">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="max-w-screen-sm mx-auto">
                                {pages[currentPage].component}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="pt-4 border-t border-green-light/10">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="max-w-screen-sm mx-auto">
                                <div className="grid grid-cols-3">
                                    {(Object.entries(pages) as [GuidePage, { icon: string }][]).map(([page, { icon }]) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex items-center justify-center p-3 transition-colors ${
                                                currentPage === page
                                                    ? 'text-green-light bg-green-dark/20'
                                                    : 'text-green-light/50 hover:text-green-light hover:bg-green-dark/10'
                                            }`}
                                        >
                                            <Icon code={icon} fill={false} className="text-2xl" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </BaseLayout>
    );
}; 