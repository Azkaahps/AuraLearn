import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parsePDF } from '@/lib/parsers/pdf';
import { parseDOCX } from '@/lib/parsers/docx';
import { parsePPTX } from '@/lib/parsers/pptx';
import { parseImage } from '@/lib/parsers/image';
import { selectGeminiModel } from '@/lib/gemini/model-selector';
import { getGeminiModel } from '@/lib/gemini/client';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'image/jpeg', // JPG
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
    // 1. Verifikasi Autentikasi
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ekstrak FormData
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

    // 3. Validasi Tipe Ekstensi
    if (!ALLOWED_MIME_TYPES.includes(normalizedMimeType)) {
      return NextResponse.json({ 
        error: `Format berkas "${file.name}" tidak didukung. Harap unggah PDF, DOCX, PPTX, JPG, PNG, atau WEBP.` 
      }, { status: 400 });
    }

    // 4. Validasi Ukuran File (Maksimal 50MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ 
        error: `Ukuran berkas melebihi batas ${MAX_FILE_SIZE_MB}MB.` 
      }, { status: 400 });
    }

    // 5. Cek Kuota & Lazy Evaluation (Quota Reset)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier, docs_used, quota_reset')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil akun tidak ditemukan.' }, { status: 500 });
    }

    let { tier, docs_used, quota_reset } = profile;
    const now = new Date();
    const quotaDate = new Date(quota_reset);

    // Lazy evaluation: Jika bulan/tahun berbeda, reset docs_used menjadi 0
    if (now.getMonth() !== quotaDate.getMonth() || now.getFullYear() !== quotaDate.getFullYear()) {
      docs_used = 0;
      await supabase
        .from('user_profiles')
        .update({
          docs_used: 0,
          quota_reset: now.toISOString(),
        })
        .eq('id', user.id);
    }

    const maxDocs = tier === 'pro' ? 50 : 3;
    if (docs_used >= maxDocs) {
      return NextResponse.json({ 
        error: `Kuota dokumen bulanan Anda (${docs_used}/${maxDocs}) telah habis untuk paket ${tier.toUpperCase()}.` 
      }, { status: 403 });
    }

    // 6. Konversi In-Memory Buffer (ZERO STORAGE PHYSICAL FILES)
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
      return NextResponse.json({ error: 'Gagal mengekstrak teks dari dokumen.' }, { status: 500 });
    }

    // 7. Cek Batas Halaman (tergantung limitasi tier)
    const maxPages = tier === 'pro' ? 100 : 10;
    if (parserResult.pageCount > maxPages) {
      return NextResponse.json({ 
        error: `Jumlah halaman (${parserResult.pageCount} hlm) melebihi batas paket ${tier.toUpperCase()} (maks ${maxPages} hlm).` 
      }, { status: 400 });
    }

    // 8. OCR Ekstraksi via Gemini (hanya jika berkas berupa gambar atau hasil scan PDF)
    let finalExtractedText = typeof parserResult.text === 'string' ? parserResult.text : String(parserResult.text || '');

    if (parserResult.isScanned || normalizedMimeType.startsWith('image/')) {
      try {
        const ocrModel = getGeminiModel('gemini-3-flash');
        const base64Data = normalizedMimeType.startsWith('image/') 
          ? parserResult.metadata?.base64 
          : buffer.toString('base64');

        const prompt = "Please extract all text from this document accurately. Preserve the layout and structure as much as possible. If it's a diagram or presentation, describe the key points and text. If there is no text, describe the image.";
        
        const result = await ocrModel.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: normalizedMimeType
            }
          },
          prompt
        ]);
        
        finalExtractedText = String(result.response.text() || '');
      } catch (ocrError) {
        console.error("OCR Gemini Error:", ocrError);
        return NextResponse.json({ error: 'Gagal melakukan OCR teks dengan Gemini AI.' }, { status: 500 });
      }
    }

    finalExtractedText = String(finalExtractedText || '');

    if (!finalExtractedText || finalExtractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Dokumen tidak mengandung teks yang dapat dibaca.' }, { status: 400 });
    }

    // 9. Pilih Model Gemini (untuk pembuatan kuis nanti)
    const modelUsed = selectGeminiModel({
      mimeType: normalizedMimeType,
      isScanned: parserResult.isScanned,
      pageCount: parserResult.pageCount,
      textLength: finalExtractedText.length,
    });

    const dbModelUsed = modelUsed === 'gemini-3-flash' ? 'pro' : 'flash';

    // 10. Simpan HANYA TEKS dan Metadata (zero storage) ke database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: file.name,
        extracted_text: finalExtractedText,
        page_count: parserResult.pageCount,
        model_used: dbModelUsed,
      })
      .select('id')
      .single();

    if (docError || !document) {
      console.error("DB Insert Error:", docError);
      return NextResponse.json({ error: 'Gagal menyimpan konteks dokumen ke database.' }, { status: 500 });
    }

    // 11. Potong Kuota Bulanan User
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ docs_used: docs_used + 1 })
      .eq('id', user.id);

    if (updateError) {
      console.error("Failed to update user quota:", updateError);
    }

    return NextResponse.json({ 
      success: true, 
      document_id: document.id,
      model_used: modelUsed
    });

  } catch (err: any) {
    console.error("Upload API Error:", err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem di server.' }, { status: 500 });
  }
}
