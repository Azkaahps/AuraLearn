import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildQuizPrompt } from '@/lib/gemini/prompts';
import { z } from 'zod';

// 1. Zod Schema untuk memvalidasi output Gemini secara ketat
const QuizSchema = z.array(
  z.object({
    idx: z.number(),
    type: z.string(),
    difficulty_b: z.number().min(-2.0).max(2.0),
    difficulty_label: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(2), // Setidaknya 2 opsi (idealnya 4)
    answer: z.string(),
    source_hint: z.string(),
  })
);

/**
 * Fisher-Yates shuffle: mengacak urutan elemen array secara in-place.
 * Digunakan sebagai safeguard posisi jawaban di luar kendali AI.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle opsi jawaban setiap soal menggunakan Fisher-Yates.
 * Field `answer` diperbarui agar tetap menunjuk ke teks yang benar.
 * Tanpa ini, AI cenderung menaruh jawaban benar selalu di posisi 1 atau 2.
 */
function shuffleQuestionOptions<T extends { options: string[]; answer: string }>(questions: T[]): T[] {
  return questions.map(q => {
    const shuffled = fisherYatesShuffle(q.options);
    return { ...q, options: shuffled }; // answer string tetap sama, options posisinya yang berubah
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { document_id, num_questions } = body;

    if (!document_id) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 });
    }

    // 2. Verifikasi kepemilikan dokumen (RLS / backend check) & ambil context
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('extracted_text, model_used')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    // 3. Cek Tier User (Penentuan Limit Soal)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.tier || 'free';
    const maxLimit = tier === 'pro' ? 30 : 10;
    
    let requestedQuestions = num_questions ? parseInt(num_questions, 10) : maxLimit;
    if (isNaN(requestedQuestions) || requestedQuestions <= 0) {
      requestedQuestions = 10;
    }
    
    const count = Math.min(requestedQuestions, maxLimit);

    // 4. Inisialisasi Model Gemini
    // generate/quiz: teks → JSON. Pakai gemini-3.1-flash-lite (15 RPM, 500 RPD).
    const model = getGeminiModel('gemini-3.1-flash-lite', true);
    const prompt = buildQuizPrompt(doc.extracted_text, count);

    // 5. Eksekusi dengan Mekanisme Retry (Maks 1x retry -> total 2 attempt)
    let questions = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 2; 

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      try {
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        let rawData;
        try {
           rawData = JSON.parse(textResponse);
        } catch (e) {
           throw new Error("Invalid JSON format returned from model");
        }

        // Validasi struktur dan constraint tipe data menggunakan Zod
        const parsed = QuizSchema.safeParse(rawData);
        
        if (parsed.success) {
          // Shuffle posisi opsi setelah validasi Zod — safeguard bias posisi AI
          questions = shuffleQuestionOptions(parsed.data);
          break;
        } else {
          console.warn(`Zod Validation Failed on attempt ${attempts}:`, parsed.error);
          if (attempts >= MAX_ATTEMPTS) {
            throw new Error("Validation failed after retries.");
          }
        }
      } catch (err) {
        console.warn(`Generation attempt ${attempts} failed:`, err);
        if (attempts >= MAX_ATTEMPTS) {
          return NextResponse.json({ 
            error: 'Sistem AI gagal mengonstruksi struktur kuis yang valid. Silakan coba lagi.' 
          }, { status: 500 });
        }
      }
    }

    if (!questions) {
      return NextResponse.json({ error: 'Sistem AI gagal mengonstruksi kuis yang valid.' }, { status: 500 });
    }

    // 6. Simpan hasil kuis ke Supabase JSONB
    const { data: quizResult, error: insertError } = await supabase
      .from('quizzes')
      .insert({
        document_id,
        user_id: user.id,
        questions: questions // Inserted as JSONB directly
      })
      .select('id')
      .single();

    if (insertError || !quizResult) {
      console.error("Quiz Insert Error:", insertError);
      return NextResponse.json({ error: 'Failed to save quiz to database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quiz_id: quizResult.id,
      questions
    });

  } catch (err: any) {
    console.error("Quiz Generator API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
