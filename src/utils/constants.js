import { Platform } from 'react-native';

// API Base URL
// iOS Simulator: localhost çalışır
// Android Emulator: 10.0.2.2 kullan
export const API_BASE_URL = Platform.select({
    ios: 'http://localhost:8080/api',
    android: 'http://10.0.2.2:8080/api',
    default: 'http://localhost:8080/api',
});

// Token expiration buffer (5 minutes before actual expiration)
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in ms

// Storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
};

// API endpoints
export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    GOOGLE_LOGIN: '/auth/google',
    APPLE_LOGIN: '/auth/apple',
    ONBOARDING: '/onboarding',
    STORIES: '/stories',
};

// App Colors
export const COLORS = {
    BACKGROUND: '#92487A',
    MAIN: '#E0C36C', // Altın/sarı tonu
    SECOND: '#F8F4EC', // BEYAZ
};

// App Fonts
export const FONTS = {
    REGULAR: 'RedHatDisplay-Regular',
};

// Transition Screen Messages
export const TRANSITION_MESSAGES = [
    'Hazırsan başlıyoruz...',
    'Yıldız haritan çıkarılıyor...',
    'Enerjin analiz ediliyor...',
    'Bugünün rehberi hazırlanıyor...',
    'Her şey hazır! ✨',
];
