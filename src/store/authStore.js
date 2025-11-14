import { create } from 'zustand';
import * as authApi from '../api/authApi';
import { saveTokens, deleteTokens, saveUser, deleteUser, getTokens, getUser } from '../utils/storage';

const useAuthStore = create((set, get) => ({
    // State
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Actions

    /**
     * Initialize auth state from storage (on app start)
     */
    initAuth: async () => {
        set({ isLoading: true });
        try {
            const tokens = await getTokens();
            const user = await getUser();

            if (tokens && user) {
                set({
                    user,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Init auth error:', error);
            set({ isLoading: false });
        }
    },

    /**
     * Login with email and password
     */
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(email, password);

            const { accessToken, refreshToken, user } = response.data;

            // Save to secure storage
            await saveTokens(accessToken, refreshToken);
            await saveUser(user);

            // Update state
            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            set({
                isLoading: false,
                error: error.message || 'Login failed',
            });
            return { success: false, error: error.message || 'Login failed' };
        }
    },

    /**
     * Register new user
     */
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.register(userData);

            const { accessToken, refreshToken, user } = response.data;

            // Save to secure storage
            await saveTokens(accessToken, refreshToken);
            await saveUser(user);

            // Update state
            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            set({
                isLoading: false,
                error: error.message || 'Registration failed',
            });
            return { success: false, error: error.message || 'Registration failed' };
        }
    },

    /**
     * Logout
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
            await deleteTokens();
            await deleteUser();

            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            await deleteTokens();
            await deleteUser();

            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });

            return { success: true };
        }
    },

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),

    /**
     * Update user data
     */
    updateUser: async (userData) => {
        const updatedUser = { ...get().user, ...userData };
        await saveUser(updatedUser);
        set({ user: updatedUser });
    },
}));

export default useAuthStore;
