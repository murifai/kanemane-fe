'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { transactionsService } from '@/lib/services/transactions';
import { compressImage, formatFileSize } from '@/lib/utils/imageCompression';
import type { ReceiptScanResult } from '@/lib/types';

interface ReceiptScannerProps {
    onScanComplete: (result: ReceiptScanResult) => void;
    onClose: () => void;
}

export default function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Separate refs for gallery and camera inputs
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (including HEIC for iPhone)
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar');
            return;
        }

        // Show original file size for very large files
        if (file.size > 5 * 1024 * 1024) {
            console.log(`Large file detected: ${formatFileSize(file.size)}, will compress...`);
        }

        setError(null);
        setIsCompressing(true);
        setCompressionProgress(0);

        try {
            // Compress image before upload
            const compressedFile = await compressImage(file, (progress) => {
                setCompressionProgress(progress);
            });

            console.log(`Compression complete: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);

            setSelectedImage(compressedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
        } catch (err: any) {
            console.error('Compression error:', err);
            setError(err.message || 'Gagal mengompres gambar. Silakan coba lagi.');
        } finally {
            setIsCompressing(false);
            setCompressionProgress(0);
        }
    };

    const handleScan = async () => {
        if (!selectedImage) return;

        setIsScanning(true);
        setError(null);

        // Create timeout promise (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Proses scan terlalu lama')), 30000);
        });

        try {
            // Race between API call and timeout
            const response = await Promise.race([
                transactionsService.scanReceipt(selectedImage),
                timeoutPromise
            ]) as any;

            if (response.success) {
                // Simpan resi ke localStorage
                const savedReceipts = JSON.parse(localStorage.getItem('scannedReceipts') || '[]');
                const receiptWithTimestamp = {
                    ...response.data,
                    scannedAt: new Date().toISOString(),
                    id: Date.now(), // Unique ID berdasarkan timestamp
                };
                savedReceipts.push(receiptWithTimestamp);
                localStorage.setItem('scannedReceipts', JSON.stringify(savedReceipts));

                onScanComplete(response.data);
            } else {
                setError('Gagal memindai resi. Silakan coba lagi.');
            }
        } catch (err: any) {
            console.error('Receipt scan error:', err);

            // More specific error messages
            if (err.message?.includes('Timeout')) {
                setError('Proses scan terlalu lama. Coba gunakan gambar yang lebih kecil atau koneksi yang lebih baik.');
            } else if (err.response?.status === 422) {
                setError('Format gambar tidak didukung. Gunakan JPEG, PNG, atau HEIC.');
            } else {
                setError(`Terjadi kesalahan: ${err.message || 'Pastikan gambar jelas dan terbaca.'}`);
            }
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setError(null);

        // Reset both inputs
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Scan Resi</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Separate File Inputs for Gallery and Camera */}
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!imagePreview ? (
                        <div className="space-y-3">
                            {/* Compression Progress */}
                            {isCompressing && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-sm text-blue-600 font-medium">
                                            Mengompres gambar... {compressionProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${compressionProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                disabled={isCompressing}
                                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Pilih dari Galeri</span>
                            </button>

                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                disabled={isCompressing}
                                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Camera className="w-5 h-5" />
                                <span>Ambil Foto</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Image Preview */}
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Receipt preview"
                                    className="w-full rounded-lg border"
                                />
                                <button
                                    onClick={handleReset}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Scan Button */}
                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="w-full flex items-center justify-center gap-2 bg-[#73cfd9] text-black px-4 py-3 rounded-lg hover:bg-[#5fb9c4] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed border-2 border-black shadow-[3px_3px_0px_0px_#000000] font-bold"
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Memindai...</span>
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" />
                                        <span>Scan Resi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• Format: JPEG, PNG, HEIC (iPhone)</p>
                        <p>• Gambar akan dikompres otomatis (~1MB)</p>
                        <p>• Pastikan gambar resi jelas dan terbaca</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
