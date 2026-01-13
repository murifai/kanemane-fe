import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kanemane.com/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Auth API
export const authAPI = {
    getGoogleAuthUrl: async () => {
        const response = await api.get('/auth/google/redirect');
        return response.data;
    },

    handleGoogleCallback: async (code: string) => {
        const response = await api.get(`/auth/google/callback?code=${code}`);
        return response.data;
    },

    getUser: async () => {
        const response = await api.get('/auth/user');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    updateProfile: async (data: { name: string; phone?: string }) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },
};

// Onboarding API
export const onboardingAPI = {
    verifyToken: async (token: string) => {
        const response = await api.post('/onboarding/verify-token', { token });
        return response.data;
    },

    complete: async (token: string, primary_asset_id: number) => {
        const response = await api.post('/onboarding/complete', { token, primary_asset_id });
        return response.data;
    },

    checkStatus: async () => {
        const response = await api.get('/onboarding/check');
        return response.data;
    },
};

// User API
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    setPrimaryAsset: async (asset_id: number) => {
        const response = await api.post('/user/primary-asset', { asset_id });
        return response.data;
    },
};
