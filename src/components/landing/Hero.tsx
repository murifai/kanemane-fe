'use client';

import { LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';

interface HeroProps {
    onLogin: () => void;
    loading?: boolean;
}

export default function Hero({ onLogin, loading }: HeroProps) {
    return (
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="bg-[#f2eda0] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] p-3 inline-block rotate-[-2deg] mb-8">
                <h2 className="text-xl font-bold font-mono">Keuangan Simpel & Seru!</h2>
            </div>

            <div className="mb-6">
                <img src="/assets/logo-transparent.svg" alt="Kanemane Logo" className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#171717]">
                Kanemane
            </h1>

            <p className="text-xl md:text-2xl text-[#171717] max-w-2xl mb-10 font-bold leading-relaxed">
                Aplikasi manajemen keuangan untuk yang suka <span className="bg-[#ff5e75] text-white px-2 py-0.5 transform -rotate-1 inline-block border-2 border-black">Jepang</span> & <span className="bg-[#73cfd9] text-black px-2 py-0.5 transform rotate-1 inline-block border-2 border-black">Indonesia</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                    onClick={onLogin}
                    disabled={loading}
                    size="lg"
                    className="text-xl py-4 px-8 flex items-center gap-3"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <LogIn className="w-6 h-6" />
                            Masuk dengan Google
                        </>
                    )}
                </Button>
            </div>
        </section>
    );
}
