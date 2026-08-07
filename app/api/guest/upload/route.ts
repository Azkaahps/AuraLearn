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

export async function POST(request: Request) {
  try {
    // 1. Ekstrak FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Validasi Tipe Ekstensi
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Only PDF, DOCX, PPTX, JPG, PNG, WEBP are allowed.' }, { status: 400 });
    }

    // Validasi Ukuran File
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` }, { status: 400 });
    }

    // 3. Konversi ke Memori (Zero Storage)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let parserResult;
    try {
      if (file.type === 'application/pdf') {
        parserResult = await parsePDF(buffer);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        parserResult = await parseDOCX(buffer);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        parserResult = await parsePPTX(buffer);
      } else if (file.type.startsWith('image/')) {
        parserResult = await parseImage(buffer, file.type);
      } else {
        throw new Error("Mime type validation bypassed logic error.");
      }
    } catch (parseError) {
      console.error("Parse Error:", parseError);
      return NextResponse.json({ error: 'Failed to parse document.' }, { status: 500 });
    }

    // Guest max 10 pages (Free tier rules)
    if (parserResult.pageCount > 10) {
      return NextResponse.json({ error: 'Guest upload is limited to 10 pages.' }, { status: 400 });
    }

    // 4. OCR via Gemini jika perlu
    let finalExtractedText = parserResult.text;

    if (parserResult.isScanned || file.type.startsWith('image/')) {
      try {
        const ocrModel = getGeminiModel('gemini-3-flash'); // Vision/OCR: gunakan gemini-3-flash
        const base64Data = file.type.startsWith('image/') 
          ? parserResult.metadata?.base64 
          : buffer.toString('base64');

        const prompt = "Please extract all text from this document accurately. Preserve the layout and structure as much as possible. If it's a diagram or presentation, describe the key points and text. If there is no text, describe the image.";
        const result = await ocrModel.generateContent([{ inlineData: { data: base64Data, mimeType: file.type } }, prompt]);
        finalExtractedText = result.response.text();
      } catch (ocrError) {
        console.error("OCR Error:", ocrError);
        return NextResponse.json({ error: 'Failed to perform OCR.' }, { status: 500 });
      }
    }

    if (!finalExtractedText || finalExtractedText.trim().length === 0) {
      return NextResponse.json({ error: 'No text could be extracted.' }, { status: 400 });
    }

    // 5. Select Model untuk Kuis
    const modelUsed = selectGeminiModel({
      mimeType: file.type,
      isScanned: parserResult.isScanned,
      pageCount: parserResult.pageCount,
      textLength: finalExtractedText.length,
    });

    // 6. Generate Kuis Langsung (Maks 10 soal untuk guest)
    let questions = [];
    try {
      const quizPrompt = buildQuizPrompt(finalExtractedText, 10);
      const quizModel = getGeminiModel(modelUsed, true); // true for JSON response
      const quizResult = await quizModel.generateContent(quizPrompt);
      const responseText = quizResult.response.text();
      questions = JSON.parse(responseText);
    } catch (quizError) {
      console.error("Generate Quiz Error:", quizError);
      return NextResponse.json({ error: 'Failed to generate quiz.' }, { status: 500 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
