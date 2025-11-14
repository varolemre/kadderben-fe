import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from './constants';

/**
 * Save tokens securely
 */
export const saveTokens = async (accessToken, refreshToken) => {
    try {
        await Keychain.setGenericPassword(
            STORAGE_KEYS.ACCESS_TOKEN,
            JSON.stringify({
                accessToken,
                refreshToken,
                timestamp: Date.now(),
            }),
            {
                service: 'auth',
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            }
        );
        return true;
    } catch (error) {
        console.error('Error saving tokens:', error);
        return false;
    }
};

/**
 * Get tokens from secure storage
 */
export const getTokens = async () => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: 'auth' });
        if (credentials) {
            const data = JSON.parse(credentials.password);
            return {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting tokens:', error);
        return null;
    }
};

/**
 * Delete tokens from secure storage
 */
export const deleteTokens = async () => {
    try {
        await Keychain.resetGenericPassword({ service: 'auth' });
        return true;
    } catch (error) {
        console.error('Error deleting tokens:', error);
        return false;
    }
};

/**
 * Save user data
 */
export const saveUser = async (user) => {
    try {
        await Keychain.setGenericPassword(
            STORAGE_KEYS.USER,
            JSON.stringify(user),
            {
                service: 'user',
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            }
        );
        return true;
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
};

/**
 * Get user data
 */
export const getUser = async () => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: 'user' });
        if (credentials) {
            return JSON.parse(credentials.password);
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

/**
 * Delete user data
 */
export const deleteUser = async () => {
    try {
        await Keychain.resetGenericPassword({ service: 'user' });
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
};

/**
 * Clear all secure storage
 */
export const clearAll = async () => {
    try {
        await deleteTokens();
        await deleteUser();
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
};
