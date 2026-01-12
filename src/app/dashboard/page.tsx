'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { dashboardService } from '@/lib/services/dashboard';
import type { DashboardSummary, DashboardCharts, Transaction } from '@/lib/types';
import { TrendingUp, TrendingDown, PlusCircle, ArrowRight, BanknoteArrowDown, BanknoteArrowUp, FileText } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useRouter } from 'next/navigation';
import { useTransactionModal } from '@/context/TransactionModalContext';

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [charts, setCharts] = useState<DashboardCharts | null>(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [currency, setCurrency] = useState<'JPY' | 'IDR'>('JPY');
    const router = useRouter();
    const { openModal, setOnTransactionCreated } = useTransactionModal();

    const loadDashboardData = useCallback(async () => {
        try {
            const [summaryData, chartsData] = await Promise.all([
                dashboardService.getSummary(currency),
                dashboardService.getCharts(currency),
            ]);

            // Mock data for new features if backend doesn't provide them yet
            // recent_transactions might be empty initially, but backend now supports it.
            if (!summaryData.recent_transactions) {
                summaryData.recent_transactions = [];
            }

            // Sort transaksi berdasarkan tanggal terbaru
            if (summaryData.recent_transactions) {
                summaryData.recent_transactions.sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
            }

            setSummary(summaryData);
            setCharts(chartsData);
        } catch (error) {
            console.error('Gagal memuat dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [currency]);

    useEffect(() => {
        loadDashboardData();
        setGreeting(getGreeting());
    }, [loadDashboardData, currency]);

    useEffect(() => {
        // Set callback untuk refresh data setelah transaksi dibuat
        setOnTransactionCreated(loadDashboardData);
    }, [setOnTransactionCreated, loadDashboardData]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Ohayou!'; // Pagi
        if (hour >= 12 && hour < 18) return 'Konnichiwa!'; // Siang/Sore
        if (hour >= 18 || hour < 5) return 'Konbanwa!'; // Malam
        return 'Yahoo!'; // Default/Fallback just in case
    };

    const formatCurrency = (amount: number, currency: string) => {
        // Force '¥' symbol for JPY with id-ID number formatting
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

    const formatCompactNumber = (number: number) => {
        if (number >= 1000) {
            return (number / 1000).toFixed(number % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
        }
        return number.toString();
    };

    const isIncome = (transaction: Transaction): boolean => {
        // Backend now reliably sends 'type'
        return transaction.type === 'income';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl md:text-2xl font-bold">Memuat...</div>
            </div>
        );
    }

    const COLORS = ['#f2727d', '#73cfd9', '#7fbf50', '#f2eda0', '#d99ad5'];

    // Progress Bar Data
    const incomeTotal = summary?.monthly_income || 0;
    const expenseTotal = summary?.monthly_expense || 0;
    const expensePercentage = incomeTotal > 0 ? Math.min((expenseTotal / incomeTotal) * 100, 100) : 0;

    // User Name Logic: Backend sends 'user_name' in summary now
    // We'll define a type extension locally or just cast since we modified backend
    const userName = (summary as any)?.user_name || 'User';

    const CustomTooltip = ({ active, payload, coordinate }: any) => {
        if (!active || !payload || !payload.length || !coordinate) return null;

        const data = payload[0].payload;
        // Pie chart payload usually contains cx, cy, midAngle, outerRadius etc.
        const cx = payload[0].cx || 0;
        const cy = payload[0].cy || 0;

        // Calculate offset direction from center using mouse position
        const dx = coordinate.x - cx;
        const dy = coordinate.y - cy;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        // Push outwards by 60px
        const offset = 60;
        const tx = (dx / length) * offset;
        const ty = (dy / length) * offset;

        const style: React.CSSProperties = {
            transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '2px solid black',
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 50,
        };

        return (
            <div style={style}>
                <p className="font-bold text-black">{data.category}</p>
                <p className="text-black">{formatCurrency(Number(data.amount), currency)}</p>
            </div>
        );
    };



    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">{greeting}</h1>
                    <p className="text-lg font-bold mb-1">{userName}</p>
                    <p className="text-sm md:text-base text-[#737373]">Ringkasan keuangan kamu...</p>
                </div>
                {/* Mobile: Button on the right */}
                <div className="md:hidden flex gap-2 w-full justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => router.push('/dashboard/reports')}
                    >
                        <FileText className="w-4 h-4" />
                        Laporan Keuangan
                    </Button>
                </div>
                {/* Desktop: Buttons on the right */}
                <div className="hidden md:flex gap-2">
                    <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={() => router.push('/dashboard/reports')}>
                        <FileText className="w-4 h-4" /> Laporan Keuangan
                    </Button>
                    <Button variant="primary" size="sm" className="flex items-center gap-2" onClick={() => openModal()}>
                        <PlusCircle className="w-4 h-4" /> Tambah Transaksi
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                {/* Left Column: Charts (2/3 width) - Reordered: Cashflow (Top) -> Donut */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">

                    {/* Arus Kas (Cashflow) - No Title, Moved to Top */}
                    <Card>
                        <CardContent className="p-6">
                            {/* Summary Numbers - Horizontal Layout on ALL screens (like Transactions) */}
                            <div className="flex flex-row justify-between items-center gap-2 md:gap-6 mb-4">
                                <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                        <div className="p-1.5 bg-[#e6f4ff] rounded-full border-2 border-[#4da6ff]">
                                            <BanknoteArrowDown className="w-4 h-4 text-[#4da6ff]" />
                                        </div>
                                        <span className="text-[#737373] text-xs sm:text-sm font-medium">Total Pemasukan</span>
                                    </div>
                                    <span className="text-lg sm:text-2xl font-bold text-[#4da6ff] break-all">
                                        {formatCurrency(incomeTotal, currency)}
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
                                        {formatCurrency(expenseTotal, currency)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative pt-4">
                                <div className="h-10 w-full bg-[#e6f4ff] border-2 border-black overflow-hidden relative">
                                    {/* Income Background (Blue tint) */}
                                    {/* Expense Bar */}
                                    <div
                                        className="h-full bg-[#f2727d] relative"
                                        style={{ width: `${expensePercentage}%` }}
                                    >
                                        {/* Diagonal Stripes pattern for flair */}
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expense Categories Donut - Renamed to "Pengeluaran" */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">Pengeluaran</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center relative">
                            {charts?.category_breakdown && charts.category_breakdown.length > 0 ? (
                                <div className="w-full h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={charts.category_breakdown as any[]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={0}
                                                dataKey="amount"
                                                nameKey="category"
                                                stroke="black"
                                                strokeWidth={2}
                                                isAnimationActive={false}
                                            >
                                                {charts.category_breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={<CustomTooltip />}
                                                cursor={{ fill: 'none' }}
                                                allowEscapeViewBox={{ x: true, y: true }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">{currency === 'JPY' ? '¥' : 'Rp'}{formatCompactNumber(expenseTotal)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Belum ada data pengeluaran</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History (1/3 width) - Removed Targets */}
                <div className="lg:h-full">
                    {/* Recent History */}
                    <Card className="lg:h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between shrink-0">
                            <CardTitle className="text-lg md:text-xl">Riwayat</CardTitle>
                            <Button size="sm" variant="secondary" className="text-sm flex items-center gap-1" onClick={() => router.push('/dashboard/transactions')}>
                                Lihat Semua <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="lg:flex-1 lg:overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                {summary?.recent_transactions?.map((tx, index) => {
                                    const isIncomeType = isIncome(tx);
                                    // Use a composite key to prevent duplicates if IDs overlap between income/expense tables
                                    const uniqueKey = `${tx.type}-${tx.id}-${index}`;

                                    return (
                                        <div key={uniqueKey} className="group relative flex items-center justify-between border-b border-gray-200 last:border-0 pb-3 last:pb-0 pt-3 first:pt-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 flex items-center justify-center border-[3px] border-black ${isIncomeType ? 'bg-[#4da6ff]' : 'bg-[#f2727d]'}`}>
                                                    {isIncomeType ?
                                                        <BanknoteArrowDown className="w-5 h-5 text-white" /> :
                                                        <BanknoteArrowUp className="w-5 h-5 text-white" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{tx.category}</p>
                                                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold text-sm ${isIncomeType ? 'text-[#4da6ff]' : 'text-[#f2727d]'}`}>
                                                {isIncomeType ? '+' : '-'}
                                                {formatCurrency(Number(tx.amount), tx.currency)}
                                            </div>

                                            {/* Hover Detail Tooltip */}
                                            <div className="absolute left-0 top-full mt-1 w-full bg-black text-white p-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg pointer-events-none">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs">{tx.category}</span>
                                                    <span className="text-xs text-gray-300">{new Date(tx.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <p className="text-sm">{tx.note || 'Tidak ada catatan'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!summary?.recent_transactions || summary.recent_transactions.length === 0) && (
                                    <p className="text-gray-500 text-sm text-center py-4">Belum ada transaksi</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
