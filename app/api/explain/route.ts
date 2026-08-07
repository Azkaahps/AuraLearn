import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildExplainPrompt } from '@/lib/gemini/prompts';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quiz_id, question_idx, jawaban_user } = await request.json();
    
    // 1. Cek pembatasan tier (Hanya Pro yang bisa Explain)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    if (profile?.tier !== 'pro') {
      return NextResponse.json({ error: 'Fitur eksklusif Pro. Silakan upgrade untuk mengakses Penjelasan AI.' }, { status: 403 });
    }

    // 2. Ambil dokumen referensi berdasarkan quiz_id & validasi kepemilikan kuis
    const { data: quiz, error: quizErr } = await supabase
      .from('quizzes')
      .select('document_id, questions')
      .eq('id', quiz_id)
      .eq('user_id', user.id) // Security Check: pastikan kuis milik user
      .single();

    if (quizErr || !quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan atau bukan milik Anda.' }, { status: 404 });
    }

    // 3. Ekstrak soal secara presisi dari JSONB questions array berdasarkan index
    const questionsList = quiz.questions as any[];
    const targetQuestion = questionsList.find(q => q.idx === question_idx);
    
    if (!targetQuestion) {
      return NextResponse.json({ error: 'Indeks soal tidak valid.' }, { status: 404 });
    }

    // 4. Muat teks dasar dari tabel documents
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('extracted_text, model_used')
      .eq('id', quiz.document_id)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: 'Teks dokumen sumber (konteks memori) tidak ditemukan.' }, { status: 404 });
    }

    // 5. Proses penjelasan via LLM
    const prompt = buildExplainPrompt(
      targetQuestion.question,
      targetQuestion.answer,
      targetQuestion.options,
      jawaban_user,
      targetQuestion.source_hint || '',
      doc.extracted_text
    );
    
    // Explain: teks → teks. Pakai gemini-3.1-flash-lite (15 RPM, 500 RPD).
    const modelName = 'gemini-3.1-flash-lite';
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);

    return NextResponse.json({ explanation: result.response.text() });
  } catch (err: any) {
    console.error("Explain API Error:", err);
    return NextResponse.json({ error: 'Server AI gagal merangkum penjelasan.' }, { status: 500 });
  }
}
