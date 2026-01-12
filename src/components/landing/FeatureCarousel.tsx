'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Feature {
    id: number;
    title: string;
    description: string;
    image: string;
}

const features: Feature[] = [
    {
        id: 1,
        title: 'Catat Pemasukan dan Pengeluaran',
        description: 'Bisa catat pemasukan dan pengeluaran secara simple ga pake ribet.',
        image: '/assets/landing/feature_transaction_log.png',
    },
    {
        id: 2,
        title: 'Scan struk belanja',
        description: 'Foto struk belanjaan mu biar ga capek nulis satu satu.',
        image: '/assets/landing/feature_scan_receipt.png',
    },
    {
        id: 3,
        title: 'Multi Aset JPY dan IDR',
        description: 'Bisa bikin beberapa aset kaya tabungan, e-money, Investasi dan cash. Di pisah aset JPY dan IDR biar kamu ga bingung.',
        image: '/assets/landing/feature_multi_asset.png',
    },
    {
        id: 4,
        title: 'Laporan Keuangan Bulanan',
        description: 'Export laporan keuanganmu ke bentuk Excel/CSV biar kamu tau detail keuangan kamu.',
        image: '/assets/landing/feature_report.png',
    },
    {
        id: 5,
        title: 'Pake di Whatsapp',
        description: 'Catat Pengeluaran dan Pemasukan kamu di whatsapp biar gampang. Bisa langsugn cek saldo juga di sini.',
        image: '/assets/landing/feature_whatsapp.png',
    },
];

export default function FeatureCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === features.length - 1 ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? features.length - 1 : prevIndex - 1));
    };

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4">
            {/* Feature Content */}
            <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 min-h-[400px]">

                {/* Text Section */}
                <div className="w-full md:w-3/5 text-center md:text-left space-y-6">
                    <div className="transition-all duration-300 transform">
                        <h3 className="text-2xl md:text-4xl font-black mb-4 leading-tight tracking-tight uppercase">
                            {features[currentIndex].title}
                        </h3>
                        <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed max-w-xl">
                            {features[currentIndex].description}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                        <Button
                            onClick={prevSlide}
                            variant="secondary"
                            className="p-3 rounded-full h-12 w-12 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        <div className="flex gap-2">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full border-2 border-black transition-all ${index === currentIndex ? 'bg-[#ff5e75] w-8' : 'bg-white hover:bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={nextSlide}
                            variant="secondary"
                            className="p-3 rounded-full h-12 w-12 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-2/5 flex justify-center md:justify-end">
                    <div className="relative w-[200px] md:w-[240px] aspect-[9/19] bg-[#171717] rounded-[2.5rem] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-300">
                        {/* Phone Notch/Dynamic Island */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[20px] bg-black rounded-b-xl z-20"></div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-white relative">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.id}
                                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                        }`}
                                >
                                    <img
                                        src={feature.image.replace(/_\d+\.png$/, '.png')}
                                        alt={feature.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://placehold.co/400x800/ff5e75/white?text=Feature+' + feature.id;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
