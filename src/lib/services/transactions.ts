import { api } from '../api';
import type { Transaction, Income, Expense, CreateIncomeData, CreateExpenseData, ReceiptScanResponse } from '../types';

export const transactionsService = {
    // Get all transactions
    getAll: async (currency: 'JPY' | 'IDR' = 'JPY'): Promise<Transaction[]> => {
        const response = await api.get('/transactions', { params: { currency } });
        return response.data;
    },

    // Get single transaction
    getById: async (id: number): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    // Create income
    createIncome: async (data: CreateIncomeData): Promise<Income> => {
        const response = await api.post('/transactions/income', data);
        return response.data;
    },

    // Create expense
    createExpense: async (data: CreateExpenseData): Promise<Expense> => {
        const response = await api.post('/transactions/expense', data);
        return response.data;
    },

    // Delete transaction
    delete: async (id: number): Promise<void> => {
        await api.delete(`/transactions/${id}`);
    },

    // Update transaction
    update: async (id: number, data: CreateIncomeData | CreateExpenseData): Promise<Transaction> => {
        const response = await api.put(`/transactions/${id}`, data);
        return response.data;
    },

    // Scan receipt
    scanReceipt: async (imageFile: File): Promise<ReceiptScanResponse> => {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await api.post('/ai/scan-receipt', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get budget
    getBudget: async (currency: 'JPY' | 'IDR', month?: string): Promise<{ amount: number; currency: 'JPY' | 'IDR'; month: string; is_fallback?: boolean }> => {
        const response = await api.get('/budgets', { params: { currency, month } });
        return response.data;
    },

    // Set budget
    setBudget: async (currency: 'JPY' | 'IDR', amount: number, month: string): Promise<{ amount: number; currency: 'JPY' | 'IDR'; month: string }> => {
        const response = await api.post('/budgets', { currency, amount, month });
        return response.data;
    },
};
