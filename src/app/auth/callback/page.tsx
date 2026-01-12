'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Gagal login. Silakan coba lagi.');
                return;
            }

            if (!token) {
                setError('Token tidak ditemukan');
                return;
            }

            try {
                // Store token
                localStorage.setItem('auth_token', token);
                // Redirect to dashboard
                router.push('/dashboard');
            } catch (err: any) {
                console.error('Auth error:', err);
                setError('Autentikasi gagal');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
                <div className="max-w-md w-full bg-[#fafafa] border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 text-center">
                    <img src="/assets/logo-transparent.svg" alt="Kanemane Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#ef4343] mb-4">Error Autentikasi</h2>
                    <p className="text-[#171717] mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-[#ff5e75] text-white py-2 px-4 border-[3px] border-black font-bold shadow-[4px_4px_0px_0px_#000000] hover:bg-[#ff7a8a] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#ff5e75] mx-auto mb-4"></div>
                <p className="text-lg font-bold text-[#171717]">Memproses login...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
