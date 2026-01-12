'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { transactionsService } from '@/lib/services/transactions';
import type { Transaction } from '@/lib/types';
import { Trash2, PlusCircle, BanknoteArrowDown, BanknoteArrowUp, Pencil } from 'lucide-react';
import { useTransactionModal } from '@/context/TransactionModalContext';

function TransactionsContent() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
    const [currency, setCurrency] = useState<'JPY' | 'IDR'>('JPY');
    const { openModal, setOnTransactionCreated } = useTransactionModal();

    // Define loadData first so it can be used in useEffect
    const loadData = useCallback(async () => {
        try {
            const transactionsData = await transactionsService.getAll(currency);
            // Sort transaksi berdasarkan tanggal terbaru
            transactionsData.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Gagal memuat data:', error);
        } finally {
            setLoading(false);
        }
    }, [currency]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        // Set callback untuk refresh data setelah transaksi dibuat
        setOnTransactionCreated(() => loadData);
    }, [setOnTransactionCreated, loadData]);

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus transaksi ini?')) return;
        try {
            await transactionsService.delete(id);
            loadData();
        } catch (error) {
            console.error('Gagal menghapus transaksi:', error);
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === 'JPY') {
            return '¥' + new Intl.NumberFormat('id-ID', {
                maximumFractionDigits: 0
            }).format(amount);
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const isIncome = (transaction: Transaction): boolean => {
        return transaction.type === 'income';
    };

    // Calculate Chart Totals (Always Monthly)
    const getChartTotals = () => {
        let totalIncome = 0;
        let totalExpense = 0;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const amount = Number(tx.amount);

            // Monthly Filter
            if (month === currentMonth && year === currentYear) {
                if (isIncome(tx)) {
                    totalIncome += amount;
                } else {
                    totalExpense += amount;
                }
            }
        });

        return { income: totalIncome, expense: totalExpense };
    };

    const chartTotals = getChartTotals();

    const filteredTransactions = transactions.filter(tx =>
        activeTab === 'income' ? isIncome(tx) : !isIncome(tx)
    );

    if (loading) {
        return <div className="text-xl md:text-2xl font-bold">Memuat...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Transaksi</h1>
                    <p className="text-sm md:text-base text-[#737373]">Kelola pemasukan dan pengeluaran</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Currency Toggle Removed from Header */}
                    <Button
                        variant="primary"
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Tambah Transaksi
                    </Button>
                </div>
            </div>

            {/* Currency Tabs */}
            <div className="flex gap-2 mb-2 p-1 bg-gray-100 rounded-lg w-full border-2 border-black">
                <button
                    onClick={() => setCurrency('JPY')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${currency === 'JPY'
                        ? 'bg-[#E0B0FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                        : 'text-gray-500 hover:text-black'
                        }`}
                >
                    JPY
                </button>
                <button
                    onClick={() => setCurrency('IDR')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${currency === 'IDR'
                        ? 'bg-[#E0B0FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                        : 'text-gray-500 hover:text-black'
                        }`}
                >
                    IDR
                </button>
            </div>

            {/* Comparison Summary */}
            <Card>
                <CardContent className="p-6">
                    {/* Summary Numbers */}
                    <div className="flex flex-row justify-between items-center gap-2 md:gap-6 mb-4">
                        <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <div className="p-1.5 bg-[#e6f4ff] rounded-full border-2 border-[#4da6ff]">
                                    <BanknoteArrowDown className="w-4 h-4 text-[#4da6ff]" />
                                </div>
                                <span className="text-[#737373] text-xs sm:text-sm font-medium">Total Pemasukan</span>
                            </div>
                            <span className="text-lg sm:text-2xl font-bold text-[#4da6ff] break-all">
                                {formatCurrency(chartTotals.income, currency)}
                            </span>
                        </div>

                        <div className="h-12 w-0.5 bg-gray-200"></div>

                        <div className="flex flex-col items-center sm:items-end flex-1 text-center sm:text-right">
                            <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                                <div className="p-1.5 bg-[#ffebe6] rounded-full border-2 border-[#f2727d]">
                                    <BanknoteArrowUp className="w-4 h-4 text-[#f2727d]" />
                                </div>
                                <span className="text-[#737373] text-xs sm:text-sm font-medium">Total Pengeluaran</span>
                            </div>
                            <span className="text-lg sm:text-2xl font-bold text-[#f2727d] break-all">
                                {formatCurrency(chartTotals.expense, currency)}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-4">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>{Math.round((chartTotals.expense / (chartTotals.income || 1)) * 100)}% dari Pemasukan</span>
                            <span>{formatCurrency(chartTotals.income - chartTotals.expense, currency)} Tersisa</span>
                        </div>
                        <div className="h-10 w-full bg-[#e6f4ff] border-2 border-black overflow-hidden relative">
                            {/* Income Background (Blue tint) */}
                            {/* Expense Bar */}
                            <div
                                className="h-full bg-[#f2727d] relative"
                                style={{ width: `${Math.min((chartTotals.expense / (chartTotals.income || 1)) * 100, 100)}%` }}
                            >
                                {/* Diagonal Stripes pattern for flair */}
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-full border-2 border-black">
                <button
                    onClick={() => setActiveTab('income')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'income'
                        ? 'bg-[#73cfd9] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    Pemasukan
                </button>
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'expense'
                        ? 'bg-[#73cfd9] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    Pengeluaran
                </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-3 md:space-y-4">
                {filteredTransactions.map((transaction) => {
                    const isIncomeType = isIncome(transaction);
                    return (
                        <Card key={transaction.id}>
                            <div className="flex flex-row items-center justify-between gap-4">
                                <div className="flex items-start gap-3 md:gap-4 flex-1">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-[3px] border-black ${isIncomeType ? 'bg-[#4da6ff]' : 'bg-[#f2727d]'}`}>
                                        {isIncomeType ? (
                                            <BanknoteArrowDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        ) : (
                                            <BanknoteArrowUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base md:text-lg">{transaction.category}</h3>
                                        <p className="text-xs md:text-sm text-[#737373]">
                                            {formatDate(transaction.date)} • {transaction.asset?.name}
                                        </p>
                                        {transaction.note && (
                                            <p className="text-xs md:text-sm text-[#737373] mt-1 truncate">{transaction.note}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4 justify-end">
                                    <p className={`text-sm sm:text-xl md:text-2xl font-bold ${isIncomeType ? 'text-[#4da6ff]' : 'text-[#f2727d]'}`}>
                                        {isIncomeType ? '+' : '-'}
                                        {formatCurrency(Number(transaction.amount), transaction.currency)}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => openModal(transaction)}
                                        className="flex items-center gap-1 mr-2"
                                    >
                                        <Pencil className="w-3 h-3" />
                                        <span className="hidden sm:inline text-xs md:text-sm">Edit</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(transaction.id)}
                                        className="flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        <span className="hidden sm:inline text-xs md:text-sm">Hapus</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg md:text-xl text-[#737373] mb-4">
                            Belum ada riwayat {activeTab === 'income' ? 'pemasukan' : 'pengeluaran'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionsContent />
        </Suspense>
    );
}
