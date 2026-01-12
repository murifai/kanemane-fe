import { api } from '../api';
import type { AssetsResponse, Asset, CreateAssetData } from '../types';

export const assetsService = {
    // Get all assets (personal + family)
    getAll: async (): Promise<AssetsResponse> => {
        const response = await api.get('/assets');
        return response.data;
    },

    // Get single asset
    getById: async (id: number): Promise<Asset> => {
        const response = await api.get(`/assets/${id}`);
        return response.data;
    },

    // Create new asset
    create: async (data: CreateAssetData): Promise<Asset> => {
        const response = await api.post('/assets', data);
        return response.data;
    },

    // Update asset
    update: async (id: number, data: Partial<CreateAssetData>): Promise<Asset> => {
        const response = await api.put(`/assets/${id}`, data);
        return response.data;
    },

    // Delete asset
    delete: async (id: number): Promise<void> => {
        await api.delete(`/assets/${id}`);
    },

    // Set primary asset for a currency
    setPrimaryAsset: async (assetId: number, currency: 'JPY' | 'IDR'): Promise<void> => {
        await api.post('/user/primary-asset', { asset_id: assetId, currency });
    },
};
