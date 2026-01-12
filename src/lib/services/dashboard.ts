import { api } from '../api';
import type { DashboardSummary, DashboardCharts } from '../types';

export const dashboardService = {
    // Get dashboard summary
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get('/dashboard/summary');
        return response.data;
    },

    // Get chart data
    getCharts: async (): Promise<DashboardCharts> => {
        const response = await api.get('/dashboard/charts');
        return response.data;
    },
};
