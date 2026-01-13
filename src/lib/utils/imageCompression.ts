import imageCompression from 'browser-image-compression';

/**
 * Compress an image file for upload
 * Reduces file size while maintaining quality sufficient for OCR
 * 
 * @param file - The image file to compress
 * @param onProgress - Optional callback for compression progress (0-100)
 * @returns Compressed image file
 */
export async function compressImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<File> {
    const options = {
        maxSizeMB: 1, // Target max file size: 1MB
        maxWidthOrHeight: 1920, // Max dimension: 1920px (sufficient for OCR)
        useWebWorker: true, // Use web worker for better performance
        fileType: 'image/jpeg', // Convert to JPEG for better compression
        initialQuality: 0.8, // Good balance between quality and size
        onProgress: onProgress ? (progress: number) => onProgress(progress) : undefined,
    };

    try {
        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

        const compressedFile = await imageCompression(file, options);

        console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');

        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        throw new Error('Gagal mengompres gambar. Silakan coba lagi.');
    }
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
