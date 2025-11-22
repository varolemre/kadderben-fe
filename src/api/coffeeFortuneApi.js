import api from './axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import { getTokens } from '../utils/storage';

/**
 * Create a new coffee fortune
 * @param {Object} requestData - { category: FalCategory }
 * @param {Object} photo - { uri: string, name?: string, type?: string }
 */
export const createCoffeeFortune = async (requestData, photo) => {
    try {
        const formData = new FormData();
        
        // Add request as JSON part
        formData.append('request', JSON.stringify(requestData));
        
        // Add photo as file part
        // React Native FormData format for file uploads
        formData.append('photo', {
            uri: photo.uri,
            name: photo.name || 'coffee-cup.jpg',
            type: photo.type || 'image/jpeg',
        });

        // Get access token
        const tokens = await getTokens();
        const accessToken = tokens?.accessToken;

        // Use fetch API for FormData upload in React Native
        // Axios has issues with FormData in React Native
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COFFEE_FORTUNE}`, {
            method: 'POST',
            headers: {
                'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                // Don't set Content-Type - let fetch set it automatically with boundary
            },
            body: formData,
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `Request failed with status ${response.status}` };
            }
            throw { response: { data: errorData } };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // If error already has response.data, return it
        if (error.response?.data) {
            throw error.response.data;
        }
        // Otherwise wrap the error
        throw { message: error.message || 'Request failed' };
    }
};

/**
 * Get a specific coffee fortune by ID
 * @param {number} fortuneId
 */
export const getCoffeeFortune = async (fortuneId) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.COFFEE_FORTUNE}/${fortuneId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get user's coffee fortunes with pagination
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 */
export const getUserCoffeeFortunes = async (page = 0, size = 10) => {
    try {
        const response = await api.get(API_ENDPOINTS.COFFEE_FORTUNE, {
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

