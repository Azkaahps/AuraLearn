import { GoogleGenerativeAI } from '@google/generative-ai';

// Pastikan GEMINI_API_KEY tidak pernah terekspos ke sisi klien (tidak memiliki prefix NEXT_PUBLIC_)
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY tidak ditemukan di environment variables.');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Mengambil instance model Gemini berdasarkan konfigurasinya.
 *
 * ⚠️  MODEL YANG TERSEDIA DI API KEY INI (per 06 Agustus 2026):
 *
 *   gemini-3.1-flash-lite  ← UTAMA: generation teks (quiz, flashcard, chat, explain)
 *                             Quota: 15 RPM | 250K TPM | 500 RPD ✅
 *
 *   gemini-3-flash         ← OCR/Vision SAJA (upload PDF scan & gambar)
 *                             Quota: 5 RPM | 250K TPM | 20 RPD ⚠️ (hemat)
 *
 *   gemini-2.x / gemini-1.5-x ← TIDAK TERSEDIA / quota habis ❌
 *
 * PENTING: doc.model_used di DB hanya metadata OCR upload, BUKAN penentu model generation.
 * Semua route generation wajib hardcode 'gemini-3.1-flash-lite'.
 *
 * @param modelName nama model Gemini yang akan digunakan
 * @param isJson Jika true, model dikonfigurasi untuk output JSON murni.
 */
export function getGeminiModel(
  modelName: 'gemini-3.1-flash-lite' | 'gemini-3-flash',
  isJson: boolean = false
) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
  });
}
