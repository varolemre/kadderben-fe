import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get user profile
 * @returns {Promise<{success: boolean, data?: ProfileResponse, message?: string}>}
 */
export const getUserProfile = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.PROFILE_GET);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Profil bilgileri yüklenirken bir hata oluştu',
        };
    }
};

/**
 * Update user profile
 * @param {ProfileUpdateRequest} profileData - Profile update data
 * @returns {Promise<{success: boolean, data?: ProfileResponse, message?: string}>}
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.put(API_ENDPOINTS.PROFILE_UPDATE, profileData);
        return {
            success: true,
            data: response.data.data,
            message: response.data.message || 'Profil başarıyla güncellendi',
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Profil güncellenirken bir hata oluştu',
        };
    }
};

/**
 * Delete user account
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const deleteAccount = async () => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE_ACCOUNT);
        return {
            success: true,
            message: response.data.message || 'Hesap başarıyla silindi',
        };
    } catch (error) {
        console.error('Error deleting account:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Hesap silinirken bir hata oluştu',
        };
    }
};

