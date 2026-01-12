'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import { assetsService } from '@/lib/services/assets';
import type { Asset, CreateAssetData } from '@/lib/types';
import { Wallet, Edit, Trash2, PlusCircle } from 'lucide-react';

export default function AssetsPage() {
    const [assets, setAssets] = useState<{ personal: Asset[]; family: Asset[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'JPY' | 'IDR'>('JPY');
    const [totalCurrency, setTotalCurrency] = useState<'JPY' | 'IDR'>('JPY');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    // Approximate exchange rate
    const JPY_TO_IDR = 107;

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
                    total += amount * JPY_TO_IDR;
                } else {
                    total += amount / JPY_TO_IDR;
                }
            }
        });
        return total;
    };
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
            const data = await assetsService.getAll();
            setAssets(data);
        } catch (error) {
            console.error('Gagal memuat aset:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAsset) {
                await assetsService.update(editingAsset.id, formData);
            } else {
                await assetsService.create(formData);
            }
            setIsModalOpen(false);
            resetForm();
            loadAssets();
        } catch (error) {
            console.error('Gagal menyimpan aset:', error);
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

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            type: asset.type,
            country: asset.country,
            currency: asset.currency,
            balance: asset.balance,
        });
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
        };
        return labels[type] || type;
    };

    if (loading) {
        return <div className="text-xl md:text-2xl font-bold">Memuat...</div>;
    }

    const allAssets = [...(assets?.personal || []), ...(assets?.family || [])];

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
                            *Estimasi konversi: 1 JPY = {JPY_TO_IDR} IDR
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Currency Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-full sm:w-fit border-2 border-black">
                <button
                    onClick={() => setActiveTab('JPY')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'JPY'
                        ? 'bg-[#73cfd9] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    Aset JPY
                </button>
                <button
                    onClick={() => setActiveTab('IDR')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${activeTab === 'IDR'
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
                    .map((asset) => (
                        <Card key={asset.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base md:text-lg">{asset.name}</CardTitle>
                                        <p className="text-xs md:text-sm text-[#737373] mt-1">
                                            {getAssetTypeLabel(asset.type)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold px-2 py-1 bg-gray-100 rounded border border-black">
                                        {asset.currency}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl md:text-3xl font-bold text-[#ff5e75] mb-4">
                                    {formatCurrency(Number(asset.balance), asset.currency)}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => openEditModal(asset)}
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <Edit className="w-3 h-3" />
                                        <span className="text-xs md:text-sm">Edit</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(asset.id)}
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        <span className="text-xs md:text-sm">Hapus</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

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
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Nama Aset"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Jenis"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        options={[
                            { value: 'tabungan', label: 'Tabungan' },
                            { value: 'e-money', label: 'E-Money' },
                            { value: 'investasi', label: 'Investasi' },
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
                    <Input
                        label="Saldo"
                        type="number"
                        step="0.01"
                        value={formData.balance || 0}
                        onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                        required
                    />
                </form>
            </Modal>
        </div>
    );
}
