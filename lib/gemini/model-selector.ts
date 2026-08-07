export interface FileInfo {
  mimeType: string;
  isScanned?: boolean;
  pageCount?: number;
  textLength?: number;
}

/**
 * Menentukan model Gemini untuk OCR saat upload dokumen.
 * Hasil fungsi ini disimpan ke kolom `model_used` di tabel `documents`.
 *
 * Model yang tersedia di API key ini (per 06 Agustus 2026):
 *   gemini-3.1-flash-lite → dokumen teks biasa (PDF teks, DOCX/PPTX pendek)
 *   gemini-3-flash        → gambar, PDF scan, dokumen panjang (butuh Vision/multimodal)
 *                           ⚠️ Hemat: quota hanya 20 RPD — hanya pakai saat benar-benar perlu
 *
 * CATATAN: Output fungsi ini TIDAK menentukan model generate quiz/flashcard/chat/explain.
 */
export function selectGeminiModel(fileInfo: FileInfo): 'gemini-3.1-flash-lite' | 'gemini-3-flash' {
  const { mimeType, isScanned = false, pageCount = 1, textLength = 0 } = fileInfo;

  // 1. Gambar (JPG/PNG/WEBP) → gemini-3-flash (Vision diperlukan)
  if (mimeType.startsWith('image/')) {
    return 'gemini-3-flash';
  }

  // 2. PDF
  if (mimeType === 'application/pdf') {
    if (isScanned) return 'gemini-3-flash'; // PDF scan → Vision
    if (pageCount > 15) return 'gemini-3-flash'; // Dokumen panjang
    return 'gemini-3.1-flash-lite'; // PDF teks biasa
  }

  // 3. DOCX / PPTX
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    if (textLength > 25000) return 'gemini-3-flash'; // Teks sangat panjang
    return 'gemini-3.1-flash-lite';
  }

  return 'gemini-3.1-flash-lite';
}
