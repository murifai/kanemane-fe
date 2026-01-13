'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BudgetEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBudget: number;
    currency: 'JPY' | 'IDR';
    onSave: (amount: number) => Promise<void>;
}

export default function BudgetEditModal({
    isOpen,
    onClose,
    currentBudget,
    currency,
    onSave
}: BudgetEditModalProps) {
    const [amount, setAmount] = useState(currentBudget.toString());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 0) {
            setError('Jumlah budget harus berupa angka positif');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSave(numAmount);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan budget');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: string) => {
        // Remove non-numeric characters except decimal point
        const cleaned = value.replace(/[^\d.]/g, '');
        return cleaned;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-black">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-black">
                    <h3 className="text-lg font-bold">Edit Budget</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Budget Bulan Ini ({currency})
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                                {currency === 'JPY' ? '¥' : 'Rp'}
                            </span>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#73cfd9] font-bold text-lg"
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Budget saat ini: {currency === 'JPY' ? '¥' : 'Rp'}
                            {new Intl.NumberFormat('id-ID').format(currentBudget)}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
