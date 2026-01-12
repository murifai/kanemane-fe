'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/lib/services/onboarding';
import { assetsService } from '@/lib/services/assets';
import { authAPI } from '@/lib/api';
import type { Asset, CreateAssetData, User } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { CheckCircle2, Wallet, Plus, Trash2 } from 'lucide-react';

type Step = 'loading' | 'welcome' | 'user-details' | 'create-assets' | 'select-primary' | 'complete';

interface AssetForm {
    name: string;
    type: 'tabungan' | 'e-money' | 'investasi';
    country: 'JP' | 'ID';
    currency: 'JPY' | 'IDR';
    balance: number;
}

interface UserDetailsForm {
    name: string;
    phone: string;
    countryCode: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string>('');

    // Asset creation state
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetForms, setAssetForms] = useState<AssetForm[]>([
        { name: '', type: 'tabungan', country: 'JP', currency: 'JPY', balance: 0 },
        { name: '', type: 'tabungan', country: 'ID', currency: 'IDR', balance: 0 },
    ]);

    // User details state
    const [userDetails, setUserDetails] = useState<UserDetailsForm>({
        name: '',
        phone: '',
        countryCode: '+62',
    });

    // Primary asset selection
    const [selectedPrimaryAsset, setSelectedPrimaryAsset] = useState<number | null>(null);

    useEffect(() => {
        checkAuthAndStatus();
    }, []);

    const checkAuthAndStatus = async () => {
        try {
            // Check if user is authenticated
            const userData = await authAPI.getUser();
            setUser(userData);

            // Pre-fill name if available
            if (userData?.name) {
                setUserDetails(prev => ({ ...prev, name: userData.name }));
            }

            // Check onboarding status
            const status = await onboardingService.checkStatus();

            if (status.completed) {
                // Already completed, redirect to dashboard
                router.push('/dashboard');
                return;
            }

            setStep('welcome');
        } catch (err: any) {
            // Not authenticated, redirect to login
            if (err.response?.status === 401) {
                router.push('/');
                return;
            }
            setError('Gagal memuat data. Silakan coba lagi.');
            setStep('loading');
        }
    };

    const handleAddAssetForm = () => {
        setAssetForms([...assetForms, { name: '', type: 'tabungan', country: 'JP', currency: 'JPY', balance: 0 }]);
    };

    const handleRemoveAssetForm = (index: number) => {
        if (assetForms.length > 1) {
            setAssetForms(assetForms.filter((_, i) => i !== index));
        }
    };

    const handleAssetFormChange = (index: number, field: keyof AssetForm, value: any) => {
        const newForms = [...assetForms];
        newForms[index] = { ...newForms[index], [field]: value };

        // Auto-set currency based on country
        if (field === 'country') {
            newForms[index].currency = value === 'JP' ? 'JPY' : 'IDR';
        }

        setAssetForms(newForms);
    };

    const handleCreateAssets = async () => {
        try {
            setError('');

            // Validate forms
            const validForms = assetForms.filter(form => form.name.trim() !== '');
            if (validForms.length === 0) {
                setError('Silakan isi minimal satu aset.');
                return;
            }

            // Create assets
            const createdAssets: Asset[] = [];
            for (const form of validForms) {
                const assetData: CreateAssetData = {
                    name: form.name,
                    type: form.type,
                    country: form.country,
                    currency: form.currency,
                    balance: form.balance,
                    owner_type: 'user',
                };
                console.log('Creating asset with data:', assetData);
                const asset = await assetsService.create(assetData);
                console.log('Created asset:', asset);
                createdAssets.push(asset);
            }

            console.log('All created assets:', createdAssets);
            setAssets(createdAssets);
            setStep('select-primary');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat aset. Silakan coba lagi.');
        }
    };

    const handleComplete = async () => {
        if (!selectedPrimaryAsset) {
            setError('Silakan pilih dompet utama.');
            return;
        }

        try {
            await onboardingService.complete(selectedPrimaryAsset);
            setStep('complete');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal menyelesaikan onboarding.');
        }
    };

    const handleSaveUserDetails = async () => {
        try {
            setError('');

            if (!userDetails.name.trim()) {
                setError('Nama tidak boleh kosong.');
                return;
            }

            if (!userDetails.phone.trim()) {
                setError('Nomor HP tidak boleh kosong.');
                return;
            }

            // Clean phone number (remove leading 0 if present)
            let phoneClean = userDetails.phone.trim();
            if (phoneClean.startsWith('0')) {
                phoneClean = phoneClean.substring(1);
            }

            // Combine country code and phone
            const fullPhone = `${userDetails.countryCode}${phoneClean}`;

            // Update profile
            await authAPI.updateProfile({
                name: userDetails.name,
                phone: fullPhone,
            });

            // Update local user state
            if (user) {
                setUser({ ...user, name: userDetails.name, phone: fullPhone });
            }

            setStep('create-assets');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menyimpan data diri. Silakan coba lagi.');
        }
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        {error ? (
                            <>
                                <p className="text-destructive font-bold mb-4">{error}</p>
                            </>
                        ) : (
                            <p className="font-bold">Memuat...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 'complete') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-tertiary-green mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Selamat!</h2>
                        <p className="text-muted-foreground mb-4">
                            Onboarding berhasil diselesaikan. Kamu akan diarahkan ke dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Selamat Datang di Kanemane!</h1>
                    {user && <p className="text-lg text-muted-foreground">Halo, {user.name}! 👋</p>}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border-3 border-destructive rounded-lg">
                        <p className="text-destructive font-bold">{error}</p>
                    </div>
                )}

                {/* Welcome Step */}
                {step === 'welcome' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Mari Mulai!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Untuk mulai menggunakan Kanemane, kamu perlu:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                <li>Membuat minimal satu aset (dompet, tabungan, atau e-money)</li>
                                <li>Memilih dompet utama untuk transaksi default</li>
                            </ol>
                            <Button
                                variant="primary"
                                className="w-full mt-6"
                                onClick={() => setStep('user-details')}
                            >
                                Mulai Setup
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* User Details Step */}
                {step === 'user-details' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lengkapi Data Diri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Masukkan nama dan nomor HP yang terhubung dengan WhatsApp untuk integrasi fitur chat.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Nama Lengkap</label>
                                    <Input
                                        value={userDetails.name}
                                        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                        placeholder="Nama Lengkap Anda"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2">Nomor WhatsApp</label>
                                    <div className="flex gap-2 items-start">
                                        <select
                                            value={userDetails.countryCode}
                                            onChange={(e) => setUserDetails({ ...userDetails, countryCode: e.target.value })}
                                            className="px-4 py-2 bg-[#F8F8F8] border-[3px] border-black focus:outline-none focus:ring-2 focus:ring-[#ff5e75] font-bold w-[120px] h-[46px]"
                                        >
                                            <option value="+62">ID +62</option>
                                            <option value="+81">JP +81</option>
                                        </select>
                                        <div className="flex-1">
                                            <Input
                                                type="tel"
                                                value={userDetails.phone}
                                                onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                                placeholder="8123456789"
                                                className="mb-0"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pastikan nomor ini aktif di WhatsApp.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleSaveUserDetails}
                            >
                                Lanjut
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Create Assets Step */}
                {step === 'create-assets' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Buat Aset Kamu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Tambahkan aset kamu (minimal 1). Kamu bisa menambahkan lebih banyak nanti.
                            </p>

                            {assetForms.map((form, index) => (
                                <div key={index} className="p-4 border-3 border-border rounded-lg space-y-4 relative">
                                    {assetForms.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveAssetForm(index)}
                                            className="absolute top-2 right-2 p-2 text-destructive hover:bg-destructive/10 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Nama Aset</label>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => handleAssetFormChange(index, 'name', e.target.value)}
                                                placeholder="Contoh: Dompet JPY"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2">Tipe</label>
                                            <select
                                                value={form.type}
                                                onChange={(e) => handleAssetFormChange(index, 'type', e.target.value)}
                                                className="w-full px-4 py-2 border-3 border-border rounded-lg font-bold bg-background"
                                            >
                                                <option value="tabungan">Tabungan</option>
                                                <option value="e-money">E-Money</option>
                                                <option value="investasi">Investasi</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2">Negara</label>
                                            <select
                                                value={form.country}
                                                onChange={(e) => handleAssetFormChange(index, 'country', e.target.value)}
                                                className="w-full px-4 py-2 border-3 border-border rounded-lg font-bold bg-background"
                                            >
                                                <option value="JP">🇯🇵 Jepang (JPY)</option>
                                                <option value="ID">🇮🇩 Indonesia (IDR)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold mb-2">Saldo Awal</label>
                                            <Input
                                                type="number"
                                                value={form.balance || ''}
                                                onChange={(e) => handleAssetFormChange(index, 'balance', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={handleAddAssetForm}
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Aset Lain
                            </Button>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleCreateAssets}
                            >
                                Lanjut
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Select Primary Asset Step */}
                {step === 'select-primary' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pilih Dompet Utama</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Dompet utama akan digunakan sebagai default untuk transaksi via WhatsApp.
                            </p>

                            <div className="space-y-3">
                                {assets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => setSelectedPrimaryAsset(asset.id)}
                                        className={`w-full p-4 border-3 border-border rounded-lg text-left transition-all ${selectedPrimaryAsset === asset.id
                                            ? 'bg-primary text-primary-foreground shadow-lg'
                                            : 'bg-card hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Wallet className="w-6 h-6" />
                                                <div>
                                                    <p className="font-bold">{asset.name}</p>
                                                    <p className="text-sm opacity-80">
                                                        {asset.type} • {asset.currency}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedPrimaryAsset === asset.id && (
                                                <CheckCircle2 className="w-6 h-6" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleComplete}
                                disabled={!selectedPrimaryAsset}
                            >
                                Selesai
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
