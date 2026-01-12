import { api } from '../api';

export interface ExportReportParams {
    start_date: string;
    end_date: string;
    currency: 'JPY' | 'IDR';
    format?: 'xlsx' | 'csv';
}

export const reportsService = {
    // Export report
    exportReport: async (params: ExportReportParams): Promise<Blob> => {
        const response = await api.get('/reports/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },

    // Download report file
    downloadReport: async (params: ExportReportParams): Promise<void> => {
        const blob = await reportsService.exportReport(params);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename
        const start = params.start_date.replace(/-/g, '');
        const end = params.end_date.replace(/-/g, '');
        const format = params.format || 'xlsx';
        link.download = `laporan_${params.currency}_${start}_to_${end}.${format}`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};
