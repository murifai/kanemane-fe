'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/context/SubscriptionContext';
import { subscriptionService } from '@/lib/services/subscription';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { SubscriptionTier } from '@/lib/types';

export default function SubscriptionPage() {
    const { subscriptionStatus, refreshSubscription } = useSubscription();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<SubscriptionTier | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async (plan: SubscriptionTier) => {
        try {
            setLoadingPlan(plan);
            setError(null);

            // Create pending subscription & get payment URL
            const data = await subscriptionService.checkout(plan);

            if (data.redirect_url) {
                // Redirect user to Midtrans payment page
                window.location.href = data.redirect_url;
            } else if (data.snap_token) {
                // Fallback if we decided to implement snap popup later
                // For now assumes redirect_url is present
                console.log("Snap token received:", data.snap_token);
                // You might want to implement snap.pay here if you added the script
                // But backend seems to prefer redirect URL for simplicity
                if (data.payment_url) {
                    window.location.href = data.payment_url;
                }
            }
        } catch (err: any) {
            console.error('Checkout failed:', err);
            setError('Gagal memproses pembayaran. Silakan coba lagi.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const currentPlan = subscriptionStatus?.current_plan;

    // Helper to check if this is the current active plan
    const isCurrentPlan = (plan: string) => currentPlan === plan;

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-black mb-2">Langganan</h1>
            <p className="text-gray-600 mb-8 font-bold">Pilih paket yang sesuai dengan kebutuhanmu.</p>

            {!currentPlan && (
                <div className="mb-8 p-4 bg-red-100 border-2 border-red-500 rounded text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">Kamu belum memiliki langganan aktif. Silakan pilih paket untuk melanjutkan akses.</span>
                </div>
            )}

            {error && (
                <div className="mb-8 p-4 bg-red-100 border-2 border-red-500 rounded text-red-700 font-bold">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-8 items-stretch pt-4">
                {/* Basic Card */}
                <Card className={`flex flex-col border-2 border-black shadow-[4px_4px_0px_0px_#000000] ${isCurrentPlan('basic') ? 'bg-gray-100' : 'bg-white'}`}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex justify-between items-center">
                            Basic
                            {isCurrentPlan('basic') && <span className="text-sm bg-green-200 px-2 py-1 border border-black rounded">Aktif</span>}
                        </CardTitle>
                        <p className="text-sm text-gray-600">Akses Penuh Aplikasi</p>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <div className="mb-6">
                            <span className="text-4xl font-bold">Rp 19.000</span>
                            <span className="text-xl text-gray-600">/bulan</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Akses Web Dashboard',
                                'Input Transaksi Manual',
                                'Visualisasi Grafik',
                                '2 Aset per Mata Uang'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-[#ff5e75] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                                        <Check className="w-4 h-4 text-white stroke-[3]" />
                                    </div>
                                    <span className="font-bold text-sm md:text-base">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className="w-full py-3 mt-auto"
                            onClick={() => handleCheckout('basic')}
                            disabled={loadingPlan !== null || isCurrentPlan('basic')}
                            variant={isCurrentPlan('basic') ? 'secondary' : 'primary'}
                        >
                            {loadingPlan === 'basic' ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : isCurrentPlan('basic') ? (
                                'Paket Saat Ini'
                            ) : (
                                'Pilih Basic'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Pro Card */}
                <Card className={`flex flex-col border-2 border-black shadow-[4px_4px_0px_0px_#000000] ${isCurrentPlan('pro') ? 'bg-[#f2eda0]/50' : 'bg-[#f2eda0]'}`}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex justify-between items-center">
                            Pro
                            {isCurrentPlan('pro') && <span className="text-sm bg-green-200 px-2 py-1 border border-black rounded">Aktif</span>}
                        </CardTitle>
                        <p className="text-sm text-gray-600">Power User & Automasi</p>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                        <div className="mb-6">
                            <span className="text-4xl font-bold">Rp 49.000</span>
                            <span className="text-xl text-gray-600">/bulan</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Semua Fitur Basic',
                                'Integrasi WhatsApp Bot',
                                'Scan Foto Resi',
                                'Laporan Keuangan Excel/CSV',
                                'Unlimited Aset'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-[#ff5e75] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                                        <Check className="w-4 h-4 text-white stroke-[3]" />
                                    </div>
                                    <span className="font-bold text-sm md:text-base">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className="w-full py-3 mt-auto"
                            onClick={() => handleCheckout('pro')}
                            disabled={loadingPlan !== null || isCurrentPlan('pro')}
                            variant={isCurrentPlan('pro') ? 'secondary' : 'primary'}
                        >
                            {loadingPlan === 'pro' ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : isCurrentPlan('pro') ? (
                                'Paket Saat Ini'
                            ) : (
                                'Gaspol Pro'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
