import { FC, ReactNode } from "react";

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
    icon: string;
}

export const SettingsSection: FC<SettingsSectionProps> = ({
    title,
    children,
    icon
}) => {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-green-light text-xl">
                    {icon}
                </span>
                <h2 className="text-lg font-medium text-green-light/90">{title}</h2>
            </div>
            <div className="divide-y divide-green-light/10">
                {children}
            </div>
        </div>
    );
}; 