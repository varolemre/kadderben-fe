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
    shouldShowOnboarding: false, // Only true after fresh login/register, not on app restart

    // Actions

    /**
     * Initialize auth state from storage (on app start)
     * If user hasn't completed onboarding, logout and redirect to login
     */
    initAuth: async () => {
        set({ isLoading: true });
        try {
            const tokens = await getTokens();
            const user = await getUser();

            if (tokens && user) {
                // If user hasn't completed onboarding, logout and redirect to login
                if (!user.onboardingCompleted) {
                    // Clear storage and state
                    await deleteTokens();
                    await deleteUser();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        shouldShowOnboarding: false,
                    });
                } else {
                    // User completed onboarding, allow access
                    set({
                        user,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        shouldShowOnboarding: false,
                    });
                    
                    // Refresh user info from backend to get latest jeton count
                    try {
                        const refreshResponse = await authApi.getUserInfo();
                        if (refreshResponse.success && refreshResponse.data) {
                            const freshUserInfo = refreshResponse.data;
                            await saveUser(freshUserInfo);
                            set({ user: freshUserInfo });
                        }
                    } catch (error) {
                        console.error('Error refreshing user on init:', error);
                        // Don't fail init if refresh fails, use cached user
                    }
                }
            } else {
                set({ isLoading: false, shouldShowOnboarding: false });
            }
        } catch (error) {
            console.error('Init auth error:', error);
            set({ isLoading: false, shouldShowOnboarding: false });
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
            // Show onboarding only if user hasn't completed it (fresh login)
            const needsOnboarding = !user.onboardingCompleted;
            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                shouldShowOnboarding: needsOnboarding,
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
            // Show onboarding only if user hasn't completed it (fresh register)
            const needsOnboarding = !user.onboardingCompleted;
            set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                shouldShowOnboarding: needsOnboarding,
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
                shouldShowOnboarding: false,
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
                shouldShowOnboarding: false,
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

    /**
     * Refresh user info from backend
     */
    refreshUser: async () => {
        try {
            const response = await authApi.getUserInfo();
            if (response.success && response.data) {
                const userInfo = response.data;
                // Update user in storage and state
                await saveUser(userInfo);
                set({ user: userInfo });
                return { success: true, user: userInfo };
            }
            return { success: false };
        } catch (error) {
            console.error('Error refreshing user:', error);
            return { success: false, error: error.message || 'Failed to refresh user' };
        }
    },

    /**
     * Complete onboarding (hide onboarding screens)
     */
    completeOnboarding: () => {
        set({ shouldShowOnboarding: false });
    },
}));

export default useAuthStore;
