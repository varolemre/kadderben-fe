import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Open lucky cookie
 * @returns {Promise<{success: boolean, data?: CookieFortuneResponse, message?: string}>}
 */
export const openCookie = async () => {
    try {
        const response = await api.post(API_ENDPOINTS.COOKIE_OPEN);
        return {
            success: true,
            data: response.data.data,
            message: response.data.message || 'Kurabiye açıldı! Şanslı mesajınızı görün.',
        };
    } catch (error) {
        console.error('Error opening cookie:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Kurabiye açılırken bir hata oluştu',
        };
    }
};

