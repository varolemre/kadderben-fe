import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get user notifications with pagination
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 20)
 * @returns {Promise<{success: boolean, data?: NotificationListResponse, message?: string}>}
 */
export const getUserNotifications = async (page = 0, size = 20) => {
    try {
        const response = await api.get(API_ENDPOINTS.NOTIFICATIONS, {
            params: { page, size },
        });
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Bildirimler yüklenirken bir hata oluştu',
        };
    }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.NOTIFICATION_MARK_READ}/${notificationId}/read`);
        return {
            success: true,
            message: response.data.message || 'Bildirim okundu olarak işaretlendi',
        };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Bildirim işaretlenirken bir hata oluştu',
        };
    }
};

