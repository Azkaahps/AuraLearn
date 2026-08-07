import { NextResponse } from 'next/server';
import { parsePDF } from '@/lib/parsers/pdf';
import { parseDOCX } from '@/lib/parsers/docx';
import { parsePPTX } from '@/lib/parsers/pptx';
import { parseImage } from '@/lib/parsers/image';
import { selectGeminiModel } from '@/lib/gemini/model-selector';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildQuizPrompt } from '@/lib/gemini/prompts';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp'
];

/**
 * Infer MIME type from file extension if browser sends generic or empty file.type
 */
function getNormalizedMimeType(file: File): string {
  let type = file.type?.toLowerCase() || '';
  const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';

  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === 'pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';

  return type;
}

export async function POST(request: Request) {
  try {
    // 1. Ekstrak FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Format data pengiriman tidak valid.' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    const normalizedMimeType = getNormalizedMimeType(file);

    // 2. Validasi Tipe Ekstensi
    if (!ALLOWED_MIME_TYPES.includes(normalizedMimeType)) {
      return NextResponse.json({ 
        error: `Format berkas "${file.name}" tidak didukung. Harap unggah PDF, DOCX, PPTX, JPG, PNG, atau WEBP.` 
      }, { status: 400 });
    }

    // Validasi Ukuran File
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ 
        error: `Ukuran berkas melebihi batas ${MAX_FILE_SIZE_MB}MB.` 
      }, { status: 400 });
    }

    // 3. Konversi ke Memori (Zero Storage)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let parserResult;
    try {
      if (normalizedMimeType === 'application/pdf') {
        parserResult = await parsePDF(buffer);
      } else if (normalizedMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        parserResult = await parseDOCX(buffer);
      } else if (normalizedMimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        parserResult = await parsePPTX(buffer);
      } else if (normalizedMimeType.startsWith('image/')) {
        parserResult = await parseImage(buffer, normalizedMimeType);
      } else {
        return NextResponse.json({ error: 'Format berkas tidak dikenali.' }, { status: 400 });
      }
    } catch (parseError) {
      console.error("Parse Error:", parseError);
      return NextResponse.json({ error: 'Gagal mengekstrak teks dari berkas.' }, { status: 500 });
    }

    // Guest max 10 pages (Free tier rules)
    if (parserResult.pageCount > 10) {
      return NextResponse.json({ 
        error: `Jumlah halaman (${parserResult.pageCount} hlm) melebihi batas demo gratis (maks 10 halaman).` 
      }, { status: 400 });
    }

    // 4. OCR via Gemini jika perlu
    let finalExtractedText = parserResult.text;

    if (parserResult.isScanned || normalizedMimeType.startsWith('image/')) {
      try {
        const ocrModel = getGeminiModel('gemini-3-flash');
        const base64Data = normalizedMimeType.startsWith('image/') 
          ? parserResult.metadata?.base64 
          : buffer.toString('base64');

        const prompt = "Please extract all text from this document accurately. Preserve the layout and structure as much as possible. If it's a diagram or presentation, describe the key points and text. If there is no text, describe the image.";
        const result = await ocrModel.generateContent([
          { inlineData: { data: base64Data, mimeType: normalizedMimeType } }, 
          prompt
        ]);
        finalExtractedText = result.response.text();
      } catch (ocrError) {
        console.error("OCR Error:", ocrError);
        return NextResponse.json({ error: 'Gagal melakukan OCR teks pada dokumen hasil scan.' }, { status: 500 });
      }
    }

    if (!finalExtractedText || finalExtractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Dokumen tidak mengandung teks yang dapat dibaca.' }, { status: 400 });
    }

    // 5. Select Model untuk Kuis
    const modelUsed = selectGeminiModel({
      mimeType: normalizedMimeType,
      isScanned: parserResult.isScanned,
      pageCount: parserResult.pageCount,
      textLength: finalExtractedText.length,
    });

    // 6. Generate Kuis Langsung (Maks 10 soal untuk guest)
    let questions = [];
    try {
      const quizPrompt = buildQuizPrompt(finalExtractedText, 10);
      const quizModel = getGeminiModel(modelUsed, true);
      const quizResult = await quizModel.generateContent(quizPrompt);
      const responseText = quizResult.response.text();
      
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      questions = JSON.parse(cleanJson);
    } catch (quizError) {
      console.error("Generate Quiz Error:", quizError);
      return NextResponse.json({ error: 'Gagal menyusun kuis otomatis via AI.' }, { status: 500 });
    }

    // 7. Kembalikan semua data untuk disimpan ke sessionStorage
    return NextResponse.json({ 
      success: true, 
      questions,
      extracted_text: finalExtractedText,
      title: file.name,
      page_count: parserResult.pageCount,
      model_used: modelUsed
    });

  } catch (err: any) {
    console.error("Guest Upload API Error:", err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem di server.' }, { status: 500 });
  }
}
