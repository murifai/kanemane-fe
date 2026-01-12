import { api } from '../api';
import type { DashboardSummary, DashboardCharts } from '../types';

export const dashboardService = {
    // Get dashboard summary
    getSummary: async (currency: 'JPY' | 'IDR' = 'JPY'): Promise<DashboardSummary> => {
        const response = await api.get('/dashboard/summary', { params: { currency } });
        return response.data;
    },

    // Get chart data
    getCharts: async (currency: 'JPY' | 'IDR' = 'JPY'): Promise<DashboardCharts> => {
        const response = await api.get('/dashboard/charts', { params: { currency } });
        return response.data;
    },
};
