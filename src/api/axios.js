import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import { getTokens, saveTokens, deleteTokens } from '../utils/storage';
import useAuthStore from '../store/authStore';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - Add token to headers
api.interceptors.request.use(
    async config => {
        const tokens = await getTokens();
        if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;

        // Skip refresh for auth endpoints
        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        // Handle 401 and 403 errors (both indicate authentication issues)
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;
        
        // If not auth error, request already retried, or auth endpoint, reject
        if (!isAuthError || originalRequest._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        // If already refreshing, queue the request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch(err => {
                    // If refresh failed, logout user
                    const { logout } = useAuthStore.getState();
                    logout();
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const tokens = await getTokens();

            if (!tokens?.refreshToken) {
                // No refresh token available, logout user
                await deleteTokens();
                const { logout } = useAuthStore.getState();
                await logout();
                return Promise.reject(new Error('No refresh token available'));
            }

            // Call refresh token endpoint
            const response = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.REFRESH}`,
                { refreshToken: tokens.refreshToken }
            );

            const { accessToken, refreshToken } = response.data.data;

            // Save new tokens
            await saveTokens(accessToken, refreshToken);

            // Update authorization header
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Process queued requests
            processQueue(null, accessToken);

            isRefreshing = false;

            // Retry original request
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            // Clear tokens and logout user
            await deleteTokens();
            
            // Logout from auth store to update app state
            const { logout } = useAuthStore.getState();
            await logout();

            return Promise.reject(refreshError);
        }
    }
);

export default api;
