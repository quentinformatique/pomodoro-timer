import Cookies from 'js-cookie';

export type Theme = 'default' | 'light';

interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
}

const themes: Record<Theme, ThemeColors> = {
    default: {
        primary: '#A3CCAB',
        secondary: '#053D38',
        background: '#1A1A1A',
        text: '#A3CCAB',
        border: 'rgba(163, 204, 171, 0.1)'
    },
    light: {
        primary: '#2F855A',
        secondary: '#1C4532',
        background: '#F7FAFC',
        text: '#2D3748',
        border: 'rgba(45, 55, 72, 0.1)'
    }
};

class ThemeService {
    private currentTheme: Theme = 'default';

    constructor() {
        this.loadTheme();
    }

    private loadTheme() {
        const savedTheme = Cookies.get('theme') as Theme;
        if (savedTheme && themes[savedTheme]) {
            this.setTheme(savedTheme);
        }
    }

    setTheme(theme: Theme) {
        if (!themes[theme]) return;

        this.currentTheme = theme;
        const colors = themes[theme];

        document.documentElement.style.setProperty('--color-primary', colors.primary);
        document.documentElement.style.setProperty('--color-secondary', colors.secondary);
        document.documentElement.style.setProperty('--color-background', colors.background);
        document.documentElement.style.setProperty('--color-text', colors.text);
        document.documentElement.style.setProperty('--color-border', colors.border);

        Cookies.set('theme', theme, { expires: 365 });
    }

    getCurrentTheme(): Theme {
        return this.currentTheme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'default' ? 'light' : 'default';
        this.setTheme(newTheme);
        return newTheme;
    }
}

export const themeService = new ThemeService(); 