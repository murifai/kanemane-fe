'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input, { Select, Textarea } from '@/components/ui/Input';
import { transactionsService } from '@/lib/services/transactions';
import { assetsService } from '@/lib/services/assets';
import type { Asset, CreateIncomeData, CreateExpenseData, ReceiptScanResult } from '@/lib/types';
import { BanknoteArrowDown, BanknoteArrowUp, ScanLine } from 'lucide-react';
import { useTransactionModal } from '@/context/TransactionModalContext';
import ReceiptScanner from './ReceiptScanner';

export default function TransactionFlowModal() {
    const { isOpen, closeModal, onTransactionCreated } = useTransactionModal();
    const [step, setStep] = useState<'type-selection' | 'income' | 'expense'>('type-selection');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [showReceiptScanner, setShowReceiptScanner] = useState(false);

    // Forms
    const [incomeForm, setIncomeForm] = useState<CreateIncomeData>({
        asset_id: 0, category: '', amount: 0, date: new Date().toISOString().split('T')[0], note: '',
    });
    const [expenseForm, setExpenseForm] = useState<CreateExpenseData>({
        asset_id: 0, category: '', amount: 0, date: new Date().toISOString().split('T')[0], note: '',
    });

    // Form errors
    const [incomeErrors, setIncomeErrors] = useState<Record<string, string>>({});
    const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});

    // Categories
    const incomeCategories = ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Lainnya'];
    const expenseCategories = ['Makanan', 'Transportasi', 'Hiburan', 'Utilitas', 'Sewa', 'Belanja', 'Lainnya'];

    useEffect(() => {
        if (isOpen) {
            setStep('type-selection');
            loadAssets();
        }
    }, [isOpen]);

    const loadAssets = async () => {
        try {
            const data = await assetsService.getAll();
            setAssets([...data.personal, ...data.family]);
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
    };

    const resetForms = () => {
        const today = new Date().toISOString().split('T')[0];
        setIncomeForm({ asset_id: 0, category: '', amount: 0, date: today, note: '' });
        setExpenseForm({ asset_id: 0, category: '', amount: 0, date: today, note: '' });
        setIncomeErrors({});
        setExpenseErrors({});
    };

    const validateIncomeForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!incomeForm.asset_id || incomeForm.asset_id === 0) {
            errors.asset_id = 'Aset harus dipilih';
        }
        if (!incomeForm.category) {
            errors.category = 'Kategori harus dipilih';
        }
        if (!incomeForm.amount || incomeForm.amount <= 0) {
            errors.amount = 'Jumlah harus lebih dari 0';
        }
        if (!incomeForm.date) {
            errors.date = 'Tanggal harus diisi';
        }

        setIncomeErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateExpenseForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!expenseForm.asset_id || expenseForm.asset_id === 0) {
            errors.asset_id = 'Aset harus dipilih';
        }
        if (!expenseForm.category) {
            errors.category = 'Kategori harus dipilih';
        }
        if (!expenseForm.amount || expenseForm.amount <= 0) {
            errors.amount = 'Jumlah harus lebih dari 0';
        }
        if (!expenseForm.date) {
            errors.date = 'Tanggal harus diisi';
        }

        setExpenseErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleClose = () => {
        closeModal();
        resetForms();
        setStep('type-selection');
        setShowReceiptScanner(false);
    };

    const handleScanComplete = (result: ReceiptScanResult) => {
        // Map category from Japanese to Indonesian
        const categoryMap: Record<string, string> = {
            '食費': 'Makanan',
            '交通費': 'Transportasi',
            '家賃': 'Sewa',
            '光熱費': 'Utilitas',
            'その他': 'Lainnya',
        };

        // Update expense form with scanned data
        setExpenseForm({
            ...expenseForm,
            category: categoryMap[result.category] || 'Lainnya',
            amount: result.amount,
            date: result.date,
            note: `${result.merchant}\n\n${result.items.map(item => `${item.name}: ¥${item.price}`).join('\n')}`,
        });

        setShowReceiptScanner(false);
    };

    const handleIncomeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateIncomeForm()) {
            return;
        }

        try {
            await transactionsService.createIncome(incomeForm);
            onTransactionCreated(); // Trigger refresh
            handleClose();
        } catch (error) {
            console.error('Failed to create income:', error);
            alert('Gagal menambah pemasukan');
        }
    };

    const handleExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateExpenseForm()) {
            return;
        }

        try {
            await transactionsService.createExpense(expenseForm);
            onTransactionCreated(); // Trigger refresh
            handleClose();
        } catch (error: any) {
            console.error('Failed to create expense:', error);
            if (error.response?.data?.error === 'Insufficient balance') {
                alert('Saldo tidak mencukupi');
            } else {
                alert('Gagal menambah pengeluaran');
            }
        }
    };

    // Render Steps
    if (step === 'type-selection') {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Pilih Jenis Transaksi">
                <div className="flex flex-col gap-4 p-4">
                    <button
                        onClick={() => setStep('income')}
                        className="flex flex-row items-center gap-4 p-6 bg-[#e6f4ff] border-[3px] border-black rounded-xl hover:bg-[#d0eaff] active:scale-95 transition-all shadow-[4px_4px_0px_0px_#000000] w-full"
                    >
                        <div className="bg-[#4da6ff] p-4 rounded-full border-2 border-black text-white flex items-center justify-center">
                            <BanknoteArrowDown className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-[#4da6ff]">Pemasukan</span>
                    </button>
                    <button
                        onClick={() => setStep('expense')}
                        className="flex flex-row items-center gap-4 p-6 bg-[#ffebe6] border-[3px] border-black rounded-xl hover:bg-[#ffded6] active:scale-95 transition-all shadow-[4px_4px_0px_0px_#000000] w-full"
                    >
                        <div className="bg-[#f2727d] p-4 rounded-full border-2 border-black text-white flex items-center justify-center">
                            <BanknoteArrowUp className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-[#f2727d]">Pengeluaran</span>
                    </button>
                </div>
            </Modal>
        );
    }

    if (step === 'income') {
        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Tambah Pemasukan"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleClose} className="flex-1">Batal</Button>
                        <Button variant="primary" onClick={handleIncomeSubmit} className="flex-1">Tambah</Button>
                    </>
                }
            >
                <form onSubmit={handleIncomeSubmit}>
                    <Select
                        label="Aset"
                        value={incomeForm.asset_id.toString()}
                        onChange={(e) => setIncomeForm({ ...incomeForm, asset_id: parseInt(e.target.value) })}
                        options={[{ value: '0', label: 'Pilih Aset' }, ...assets.map(a => ({ value: a.id.toString(), label: `${a.name} (${a.currency})` }))]}
                        error={incomeErrors.asset_id}
                        required
                    />
                    <Select
                        label="Kategori"
                        value={incomeForm.category}
                        onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                        options={[{ value: '', label: 'Pilih Kategori' }, ...incomeCategories.map(c => ({ value: c, label: c }))]}
                        error={incomeErrors.category}
                        required
                    />
                    <Input
                        label="Jumlah"
                        type="number"
                        step="0.01"
                        value={incomeForm.amount || 0}
                        onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                        error={incomeErrors.amount}
                        required
                    />
                    <Input
                        label="Tanggal"
                        type="date"
                        value={incomeForm.date}
                        onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                        error={incomeErrors.date}
                        required
                    />
                    <Textarea
                        label="Catatan (opsional)"
                        value={incomeForm.note}
                        onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })}
                        rows={3}
                    />
                </form>
            </Modal>
        );
    }

    if (step === 'expense') {
        return (
            <>
                <Modal
                    isOpen={isOpen}
                    onClose={handleClose}
                    title="Tambah Pengeluaran"
                    footer={
                        <>
                            <Button variant="secondary" onClick={handleClose} className="flex-1">Batal</Button>
                            <Button variant="primary" onClick={handleExpenseSubmit} className="flex-1">Tambah</Button>
                        </>
                    }
                >
                    <form onSubmit={handleExpenseSubmit}>
                        {/* Scan Receipt Button */}
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => setShowReceiptScanner(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-[#73cfd9] text-black rounded-lg hover:bg-[#5fb9c4] transition-colors border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-bold"
                            >
                                <ScanLine className="w-5 h-5" />
                                <span>Scan Resi</span>
                            </button>
                        </div>

                        <Select
                            label="Aset"
                            value={expenseForm.asset_id.toString()}
                            onChange={(e) => setExpenseForm({ ...expenseForm, asset_id: parseInt(e.target.value) })}
                            options={[{ value: '0', label: 'Pilih Aset' }, ...assets.map(a => ({ value: a.id.toString(), label: `${a.name} (${a.currency})` }))]}
                            error={expenseErrors.asset_id}
                            required
                        />
                        <Select
                            label="Kategori"
                            value={expenseForm.category}
                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            options={[{ value: '', label: 'Pilih Kategori' }, ...expenseCategories.map(c => ({ value: c, label: c }))]}
                            error={expenseErrors.category}
                            required
                        />
                        <Input
                            label="Jumlah"
                            type="number"
                            step="0.01"
                            value={expenseForm.amount || 0}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                            error={expenseErrors.amount}
                            required
                        />
                        <Input
                            label="Tanggal"
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                            error={expenseErrors.date}
                            required
                        />
                        <Textarea
                            label="Catatan (opsional)"
                            value={expenseForm.note}
                            onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                            rows={3}
                        />
                    </form>
                </Modal>

                {/* Receipt Scanner Modal */}
                {showReceiptScanner && (
                    <ReceiptScanner
                        onScanComplete={handleScanComplete}
                        onClose={() => setShowReceiptScanner(false)}
                    />
                )}
            </>
        );
    }

    return null;
}
