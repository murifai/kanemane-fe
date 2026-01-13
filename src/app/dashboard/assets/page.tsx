'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Combobox from '@/components/ui/Combobox';
import { assetsService } from '@/lib/services/assets';
import { dashboardService } from '@/lib/services/dashboard';
import type { Asset, CreateAssetData } from '@/lib/types';
import { Wallet, Edit, Trash2, PlusCircle, Star, MoreVertical } from 'lucide-react';

import banksJp from '@/data/banks-jp.json';
import banksId from '@/data/banks-id.json';
import ewallets from '@/data/ewallets.json';

export default function AssetsPage() {
    const [assets, setAssets] = useState<{ personal: Asset[]; family: Asset[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'JPY' | 'IDR'>('JPY');
    const [totalCurrency, setTotalCurrency] = useState<'JPY' | 'IDR'>('JPY');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [exchangeRate, setExchangeRate] = useState(107);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateAssetData>({
        name: '',
        type: 'tabungan',
        country: 'JP',
        currency: 'JPY',
        balance: 0,
    });

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const [assetsData, summaryData] = await Promise.all([
                assetsService.getAll(),
                dashboardService.getSummary('JPY')
            ]);
            setAssets(assetsData);
            if (summaryData.exchange_rate) {
                setExchangeRate(summaryData.exchange_rate);
            }
        } catch (error) {
            console.error('Gagal memuat data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAllAssets = () => {
        if (!assets) return [];
        return [...assets.personal, ...assets.family];
    };

    const calculateGrandTotal = (targetCurrency: 'JPY' | 'IDR') => {
        const all = calculateAllAssets();
        let total = 0;
        all.forEach(asset => {
            const amount = Number(asset.balance);
            if (asset.currency === targetCurrency) {
                total += amount;
            } else {
                if (targetCurrency === 'IDR') {
                    total += amount * exchangeRate;
                } else {
                    total += amount / exchangeRate;
                }
            }
        });
        return total;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError(null);
            if (editingAsset) {
                await assetsService.update(editingAsset.id, formData);
            } else {
                await assetsService.create(formData);
            }
            setIsModalOpen(false);
            resetForm();
            loadAssets();
        } catch (err: any) {
            console.error('Gagal menyimpan aset:', err);
            if (err.response?.data?.code === 'ASSET_LIMIT_REACHED') {
                setError(err.response.data.message);
            } else {
                setError('Gagal menyimpan aset. Silakan coba lagi.');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus aset ini?')) return;
        try {
            await assetsService.delete(id);
            loadAssets();
        } catch (error) {
            console.error('Gagal menghapus aset:', error);
        }
    };

    const handleSetPrimary = async (id: number, currency: 'JPY' | 'IDR') => {
        if (!confirm(`Jadikan aset ini sebagai dompet utama ${currency}?`)) return;
        try {
            await assetsService.setPrimaryAsset(id, currency);
            loadAssets();
        } catch (error) {
            console.error('Gagal mengatur dompet utama:', error);
        }
    };

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            type: asset.type,
            country: asset.country,
            currency: asset.currency,
            balance: asset.balance,
        });
        setError(null);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingAsset(null);
        setFormData({
            name: '',
            type: 'tabungan',
            country: 'JP',
            currency: 'JPY',
            balance: 0,
        });
        setError(null);
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

    const getAssetTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            tabungan: 'Tabungan',
            'e-money': 'E-Money',
            investasi: 'Investasi',
            cash: 'Cash',
        };
        return labels[type] || type;
    };

    // Helper to get options based on type and country
    const getNameOptions = () => {
        const { type, country } = formData;
        if (type === 'tabungan') {
            return country === 'JP' ? banksJp : banksId;
        }
        if (type === 'e-money') {
            return country === 'JP' ? ewallets.JP : ewallets.ID;
        }
        return [];
    };

    const showCombobox = formData.type === 'tabungan' || formData.type === 'e-money';

    if (loading) {
        return <div className="text-xl md:text-2xl font-bold">Memuat...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Aset</h1>
                    <p className="text-sm md:text-base text-[#737373]">Kelola aset Anda</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    Tambah Aset
                </Button>
            </div>

            {/* Grand Total Section */}
            <div className="mb-8">
                <Card className="bg-[#fff5f5] border-[#ff5e75]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[#737373] flex items-center gap-2 text-base font-medium">
                            <Wallet className="w-5 h-5" />
                            Total Estimasi Kekayaan
                        </CardTitle>
                        <div className="flex gap-1 bg-white/50 p-1 rounded-md border border-black/10">
                            <button
                                onClick={() => setTotalCurrency('JPY')}
                                className={`px-2 py-1 text-xs font-bold rounded ${totalCurrency === 'JPY' ? 'bg-[#ff5e75] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                JPY
                            </button>
                            <button
                                onClick={() => setTotalCurrency('IDR')}
                                className={`px-2 py-1 text-xs font-bold rounded ${totalCurrency === 'IDR' ? 'bg-[#ff5e75] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                IDR
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl md:text-6xl font-extrabold text-[#ff5e75]">
                            {formatCurrency(calculateGrandTotal(totalCurrency), totalCurrency)}
                        </p>
                        <p className="text-sm text-[#737373] mt-2">
                            *Rate: 1 JPY = {new Intl.NumberFormat('id-ID').format(exchangeRate)} IDR
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Currency Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-full border-2 border-black">
                <button
                    onClick={() => setActiveTab('JPY')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'JPY'
                        ? 'bg-[#73cfd9] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    Aset JPY
                </button>
                <button
                    onClick={() => setActiveTab('IDR')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'IDR'
                        ? 'bg-[#73cfd9] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    Aset IDR
                </button>
            </div>

            {/* Assets List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {calculateAllAssets()
                    .filter(asset => asset.currency === activeTab)
                    .map((asset) => {
                        const isPrimary = activeTab === 'JPY' ? asset.is_primary_jpy : asset.is_primary_idr;
                        return (
                            <Card key={asset.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base md:text-lg">{asset.name}</CardTitle>
                                                {isPrimary && (
                                                    <div title="Dompet Utama">
                                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs md:text-sm text-[#737373] mt-1">
                                                {getAssetTypeLabel(asset.type)}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === asset.id ? null : asset.id)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Menu"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl md:text-3xl font-bold text-[#ff5e75]">
                                        {formatCurrency(Number(asset.balance), asset.currency)}
                                    </p>

                                </CardContent>
                                {/* Dropdown Menu */}
                                {openMenuId === asset.id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setOpenMenuId(null)}
                                        />
                                        <div className="absolute right-4 top-16 w-48 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
                                            {!isPrimary && (
                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        handleSetPrimary(asset.id, asset.currency);
                                                    }}
                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-b border-gray-200 rounded-t-md"
                                                >
                                                    <Star className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Set Dompet Utama</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    openEditModal(asset);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-b border-gray-200"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="text-sm font-medium">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    handleDelete(asset.id);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600 rounded-b-md"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Hapus</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        );
                    })}

                {calculateAllAssets().filter(asset => asset.currency === activeTab).length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-lg md:text-xl text-[#737373] mb-4">Belum ada aset {activeTab}</p>
                        <Button onClick={() => {
                            setFormData(prev => ({ ...prev, country: activeTab === 'JPY' ? 'JP' : 'ID', currency: activeTab }));
                            setIsModalOpen(true);
                        }} className="flex items-center gap-2 mx-auto">
                            <PlusCircle className="w-4 h-4" />
                            Tambah Aset {activeTab}
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editingAsset ? 'Edit Aset' : 'Tambah Aset'}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} className="flex-1">
                            {editingAsset ? 'Perbarui' : 'Tambah'}
                        </Button>
                    </>
                }
            >
                <div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded text-red-700 text-sm font-bold flex flex-col gap-2">
                            <p>{error}</p>
                            {error.includes('Upgrade') && (
                                <a href="/dashboard/subscription" className="underline text-red-800">
                                    Klik di sini untuk upgrade ke Pro
                                </a>
                            )}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Select
                            label="Jenis"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            options={[
                                { value: 'tabungan', label: 'Tabungan' },
                                { value: 'e-money', label: 'E-Money' },
                                { value: 'investasi', label: 'Investasi' },
                                { value: 'cash', label: 'Cash' },
                            ]}
                        />

                        <Select
                            label="Negara"
                            value={formData.country}
                            onChange={(e) => {
                                const country = e.target.value as 'JP' | 'ID';
                                setFormData({
                                    ...formData,
                                    country,
                                    currency: country === 'JP' ? 'JPY' : 'IDR'
                                });
                            }}
                            options={[
                                { value: 'JP', label: 'Jepang' },
                                { value: 'ID', label: 'Indonesia' },
                            ]}
                            required
                        />

                        {showCombobox ? (
                            <Combobox
                                label="Nama Aset"
                                value={formData.name}
                                onChange={(value) => setFormData({ ...formData, name: value })}
                                options={getNameOptions()}
                                placeholder="Pilih atau ketik nama aset..."
                                required
                            />
                        ) : (
                            <Input
                                label="Nama Aset"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        )}

                        <Input
                            label="Saldo"
                            type="number"
                            step="0.01"
                            value={formData.balance || 0}
                            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </form>
                </div>
            </Modal>
        </div>
    );
}
