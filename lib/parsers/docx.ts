import mammoth from 'mammoth';
import type { ParserResult } from './pdf';

export async function parseDOCX(buffer: Buffer): Promise<ParserResult> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value || '';
  
  return {
    text,
    pageCount: 1, // Mammoth tidak mendukung ekstraksi jumlah halaman secara presisi
    metadata: { messages: result.messages },
    isScanned: false
  };
}
