import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all tarot readers
 */
export const getAllReaders = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.TAROT_READERS);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Create a new tarot reading
 * @param {Object} requestData - { readerId: number, category: FalCategory }
 */
export const createTarotReading = async (requestData) => {
    try {
        const response = await api.post(API_ENDPOINTS.TAROT_READINGS, requestData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user's tarot readings with pagination
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 */
export const getUserTarotReadings = async (page = 0, size = 10) => {
    try {
        const response = await api.get(API_ENDPOINTS.TAROT_READINGS, {
            params: {
                page,
                size,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get a specific tarot reading by ID
 * @param {number} readingId
 */
export const getTarotReading = async (readingId) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.TAROT_READINGS}/${readingId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
