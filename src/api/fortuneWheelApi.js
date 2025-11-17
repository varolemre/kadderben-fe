import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get wheel status
 */
export const getWheelStatus = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.WHEEL_STATUS);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Spin the wheel
 */
export const spinWheel = async (requestData) => {
    try {
        const response = await api.post(API_ENDPOINTS.WHEEL_SPIN, requestData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

