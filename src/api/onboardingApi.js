import api from './axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Save onboarding data
 */
export const saveOnboarding = async (onboardingData) => {
    try {
        const response = await api.post(API_ENDPOINTS.ONBOARDING, onboardingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

