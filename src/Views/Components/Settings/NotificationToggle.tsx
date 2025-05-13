import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../../services/NotificationService';
import { Icon } from '../Utilities/Icon';
import Cookies from 'js-cookie';

export const NotificationToggle: FC = () => {
    const { t } = useTranslation();
    const [isEnabled, setIsEnabled] = useState<boolean>(false);

    useEffect(() => {
        const checkPermission = async () => {
            if ('Notification' in window) {
                const savedState = Cookies.get('notificationsEnabled');
                const permissionState = Notification.permission === 'granted';
                setIsEnabled(savedState === 'true' && permissionState);
            }
        };
        checkPermission();
    }, []);

    const handleToggle = async () => {
        if (!isEnabled) {
            const granted = await notificationService.requestPermission();
            if (granted) {
                setIsEnabled(true);
                Cookies.set('notificationsEnabled', 'true', { expires: 365 });
            }
        } else {
            setIsEnabled(false);
            Cookies.set('notificationsEnabled', 'false', { expires: 365 });
        }
    };

    if (!('Notification' in window)) {
        return null;
    }

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex-1 md:mr-16 lg:mr-24">
                <span className="text-green-light block">
                    {t('settings.notifications.title')}
                </span>
                <span className="text-green-light/70 text-sm block mt-1">
                    {isEnabled 
                        ? t('settings.notifications.enabled')
                        : t('settings.notifications.permission')
                    }
                </span>
            </div>
            <button
                onClick={handleToggle}
                className={`p-2 rounded-lg transition-colors ${
                    isEnabled 
                        ? 'text-green-light' 
                        : 'text-green-light/50 hover:text-green-light'
                }`}
            >
                <Icon 
                    code={isEnabled ? 'notifications_active' : 'notifications_off'} 
                    fill={isEnabled}
                    className="text-2xl"
                />
            </button>
        </div>
    );
}; 