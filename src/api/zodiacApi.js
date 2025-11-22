// @ts-nocheck
import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get user's zodiac information
 * @returns {Promise<{success: boolean, data?: ZodiacResponse, message?: string}>}
 */
export const getMyZodiac = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.MY_ZODIAC);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error('Error fetching zodiac info:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Burç bilgisi alınamadı',
        };
    }
};

