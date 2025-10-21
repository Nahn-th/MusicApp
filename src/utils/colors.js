export const COLORS = {
    dark: {
        background: '#0A0E27',
        surface: '#1A1F3A',
        surfaceLight: '#252A45',
        card: '#1E2340',
        text: '#FFFFFF',
        textSecondary: '#A0A5BA',
        primary: '#00D9FF',
        primaryDark: '#00A8CC',
        secondary: '#FF0080',
        border: '#2A2F4A',
        success: '#00FF88',
        error: '#FF3B5C',
    },
    light: {
        background: '#FFFFFF',
        surface: '#F5F7FA',
        surfaceLight: '#E8ECF0',
        card: '#FFFFFF',
        text: '#1A1F3A',
        textSecondary: '#6B7280',
        primary: '#00A8CC',
        primaryDark: '#007799',
        secondary: '#FF0080',
        border: '#E5E7EB',
        success: '#00AA66',
        error: '#DC2626',
    },
};

export const getThemeColors = (theme) => COLORS[theme] || COLORS.dark;
