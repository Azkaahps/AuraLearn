import sharp from 'sharp';
import type { ParserResult } from './pdf';

export async function parseImage(buffer: Buffer, mimeType: string): Promise<ParserResult> {
  // Menggunakan sharp murni untuk ekstraksi dimensi dan metadata (in-memory parsing)
  const metadata = await sharp(buffer).metadata();
  
  // Konversi buffer secara langsung ke dalam base64 untuk konsumsi Gemini Pro Vision
  const base64Data = buffer.toString('base64');
  
  return {
    text: '', // Tidak perlu ekstraksi teks lokal, ini dipegang oleh model AI multimodal (Gemini)
    pageCount: 1,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      mimeType,
      base64: base64Data // Buffer fisik tidak tersimpan, diletakkan sebagai string metadata
    },
    isScanned: true // Selalu melabeli gambar sebagai pindaian/scan agar menggunakan Gemini Pro (Vision)
  };
}
