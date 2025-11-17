import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get latest 5 stories
 */
export const getLatestStories = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.STORIES);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

