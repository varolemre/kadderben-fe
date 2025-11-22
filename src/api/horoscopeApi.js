import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get daily horoscope for user
 * @returns {Promise<{success: boolean, data?: DailyHoroscopeResponse, message?: string}>}
 */
export const getDailyHoroscope = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.DAILY_HOROSCOPE);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error('Error fetching daily horoscope:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Burç yorumu yüklenirken bir hata oluştu',
        };
    }
};

