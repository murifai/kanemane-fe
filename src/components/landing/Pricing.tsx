import { Check } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PricingProps {
    onLogin: () => void;
    loading?: boolean;
}

export default function Pricing({ onLogin, loading }: PricingProps) {
    return (
        <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 bg-[#f2eda0] inline-block px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] transform -rotate-1">Pilih Paketmu</h2>
                <p className="text-xl mt-4 font-bold">Investasi kecil untuk masa depan dompetmu.</p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8 items-stretch pt-4 px-4 max-w-5xl mx-auto">
                {/* Basic Card */}
                <Card className="flex flex-col border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Basic</CardTitle>
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
                            onClick={onLogin}
                            disabled={loading}
                        >
                            Pilih Basic
                        </Button>
                    </CardContent>
                </Card>

                {/* Pro Card */}
                <Card className="flex flex-col border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-[#f2eda0]">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Pro</CardTitle>
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
                            onClick={onLogin}
                            disabled={loading}
                        >
                            Gaspol Pro
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
