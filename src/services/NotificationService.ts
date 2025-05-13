import i18n from '../i18n/config';
import Cookies from 'js-cookie';

class NotificationService {
    private permission: NotificationPermission = 'default';

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        this.permission = await Notification.requestPermission();
        return this.permission === 'granted';
    }

    private isEnabled(): boolean {
        return Cookies.get('notificationsEnabled') === 'true' && this.permission === 'granted';
    }

    async notify(title: string, options?: NotificationOptions) {
        if (!('Notification' in window) || !this.isEnabled()) {
            return;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.svg',
                ...options
            });

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    async notifyPomodoroState(state: 'work' | 'shortBreak' | 'longBreak') {
        if (!this.isEnabled()) {
            return;
        }

        const messages = {
            work: i18n.t('notifications.workStart'),
            shortBreak: i18n.t('notifications.shortBreakStart'),
            longBreak: i18n.t('notifications.longBreakStart')
        };

        await this.notify(messages[state]);
    }
}

export const notificationService = new NotificationService(); 