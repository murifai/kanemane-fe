'use client';

import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { reportsService } from '@/lib/services/reports';
import { FileText, Download, Calendar } from 'lucide-react';
import { FeatureGuard } from '@/components/FeatureGuard';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        currency: 'JPY' as 'JPY' | 'IDR',
        format: 'xlsx' as 'xlsx' | 'csv',
    });

    const handleExport = async () => {
        try {
            setLoading(true);
            const params = {
                start_date: formData.start_date,
                end_date: formData.end_date,
                currency: formData.currency,
                format: formData.format,
            };
            await reportsService.downloadReport(params);
        } catch (error) {
            console.error('Gagal mengekspor laporan:', error);
            alert('Gagal mengekspor laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-[#ff5e75]" />
                    <h1 className="text-3xl md:text-4xl font-bold">Laporan Keuangan</h1>
                </div>
                <p className="text-sm md:text-base text-[#737373]">
                    Buat laporan keuangan berdasarkan periode dan Aset
                </p>
            </div>

            {/* Main Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Laporan Keuangan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FeatureGuard feature="export">
                        <div className="space-y-4">
                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Dari"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Sampai"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Currency Filter */}
                            <Select
                                label="Aset"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                                options={[
                                    { value: 'JPY', label: 'JPY (Yen Jepang)' },
                                    { value: 'IDR', label: 'IDR (Rupiah)' },
                                ]}
                                required
                            />

                            {/* Format Selection */}
                            <Select
                                label="Format File"
                                value={formData.format}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                                options={[
                                    { value: 'xlsx', label: 'Excel (.xlsx)' },
                                    { value: 'csv', label: 'CSV (.csv)' },
                                ]}
                            />

                            {/* Export Button */}
                            <Button
                                variant="primary"
                                onClick={handleExport}
                                disabled={loading || !formData.start_date || !formData.end_date}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {loading ? 'Membuat...' : 'Buat Laporan'}
                            </Button>
                        </div>
                    </FeatureGuard>
                </CardContent>
            </Card>
        </div>
    );
}
