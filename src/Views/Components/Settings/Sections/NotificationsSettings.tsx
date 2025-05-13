import { FC } from 'react';
import { NotificationToggle } from '../NotificationToggle';

export const NotificationsSettings: FC = () => {
    return (
        <div className="space-y-4">
            <NotificationToggle />
        </div>
    );
}; 