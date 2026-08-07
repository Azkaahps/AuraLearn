

export interface ParserResult {
  text: string;
  pageCount: number;
  metadata?: Record<string, any>;
  isScanned: boolean;
}

export async function parsePDF(buffer: Buffer): Promise<ParserResult> {
  // Melewati index.js bawaan pdf-parse v1 yang memiliki bug evaluasi testing di webpack (module.parent)
  const pdf = require('pdf-parse/lib/pdf-parse.js');
  const data = await pdf(buffer);
  
  const text = data.text || '';
  const pageCount = data.numpages || 1;
  const metadata = data.info || {};
  
  // Heuristic untuk deteksi dokumen hasil scan: 
  // Jika rata-rata karakter per halaman kurang dari 50, maka kemungkinan besar adalah hasil scan 
  const avgCharPerPage = pageCount > 0 ? text.length / pageCount : 0;
  const isScanned = avgCharPerPage < 50;
  
  return {
    text,
    pageCount,
    metadata,
    isScanned
  };
}
