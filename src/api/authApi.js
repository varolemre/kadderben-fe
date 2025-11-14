import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Login with email and password
 */
export const login = async (email, password) => {
    try {
        const response = await api.post(API_ENDPOINTS.LOGIN, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Register new user
 */
export const register = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.REGISTER, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
    try {
        const response = await api.post(API_ENDPOINTS.REFRESH, {
            refreshToken,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Logout (client-side only with JWT)
 */
export const logout = async () => {
    try {
        // Optional: Call backend logout endpoint if you implement it
        await api.post(API_ENDPOINTS.LOGOUT);
        return true;
    } catch (error) {
        // Even if backend call fails, we still logout client-side
        return true;
    }
};

/**
 * Google Sign-In
 */
export const googleLogin = async (idToken) => {
    try {
        const response = await api.post(API_ENDPOINTS.GOOGLE_LOGIN, {
            idToken,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Apple Sign-In
 */
export const appleLogin = async (idToken, user) => {
    try {
        const response = await api.post(API_ENDPOINTS.APPLE_LOGIN, {
            idToken,
            user,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
