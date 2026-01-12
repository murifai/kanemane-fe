'use client';

import { LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CTAProps {
    onLogin: () => void;
    loading?: boolean;
}

export default function CTA({ onLogin, loading }: CTAProps) {
    return (
        <section className="py-20 px-4 border-t-[3px] border-black bg-[#73cfd9]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#171717]">
                    Siap Atur Keuangan?
                </h2>
                <p className="text-xl font-bold mb-8">
                    Yuk, mulai sekarang. Gampang banget kok!
                </p>
                <div className="flex justify-center">
                    <Button
                        onClick={onLogin}
                        disabled={loading}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-100 text-xl py-4 px-8 shadow-[6px_6px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-none"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        ) : (
                            <>
                                Masuk dengan Google
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
