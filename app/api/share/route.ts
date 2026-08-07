import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildQuizPrompt } from '@/lib/gemini/prompts';
import { z } from 'zod';

const QuizSchema = z.array(
  z.object({
    idx: z.number(),
    type: z.string(),
    difficulty_b: z.number(),
    difficulty_label: z.string(),
    question: z.string(),
    options: z.array(z.string()).min(2),
    answer: z.string(),
    source_hint: z.string(),
  })
);

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleQuestionOptions<T extends { options: string[]; answer: string }>(questions: T[]): T[] {
  return questions.map((q) => ({
    ...q,
    options: fisherYatesShuffle(q.options),
  }));
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Sesi login Anda telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const { quiz_id, document_id } = body;

    if (!quiz_id && !document_id) {
      return NextResponse.json({ error: 'quiz_id atau document_id dibutuhkan' }, { status: 400 });
    }

    let targetQuizId = quiz_id;

    // Jika dipanggil menggunakan document_id
    if (!targetQuizId && document_id) {
      // 1. Cari kuis yang sudah ada untuk dokumen ini
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('document_id', document_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingQuiz) {
        targetQuizId = existingQuiz.id;
      } else {
        // 2. Jika kuis belum ada, buat kuis secara otomatis
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .select('extracted_text')
          .eq('id', document_id)
          .eq('user_id', user.id)
          .single();

        if (docError || !doc) {
          return NextResponse.json({ error: 'Dokumen tidak ditemukan atau Anda tidak memiliki akses.' }, { status: 404 });
        }

        const model = getGeminiModel('gemini-3.1-flash-lite', true);
        const prompt = buildQuizPrompt(doc.extracted_text, 10);
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        let cleanJson = textResponse.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        const rawData = JSON.parse(cleanJson);
        const parsed = QuizSchema.safeParse(rawData);

        if (!parsed.success) {
          return NextResponse.json({ error: 'Gagal menyusun kuis otomatis untuk dibagikan.' }, { status: 500 });
        }

        const shuffledQuestions = shuffleQuestionOptions(parsed.data);

        const { data: newQuiz, error: insertQuizErr } = await supabase
          .from('quizzes')
          .insert({
            document_id,
            user_id: user.id,
            questions: shuffledQuestions,
          })
          .select('id')
          .single();

        if (insertQuizErr || !newQuiz) {
          throw insertQuizErr || new Error('Gagal menyimpan kuis baru');
        }

        targetQuizId = newQuiz.id;
      }
    }

    // Pastikan kuis tersebut benar-benar milik pengguna
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', targetQuizId)
      .eq('user_id', user.id)
      .single();

    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan atau Anda tidak memiliki akses.' }, { status: 404 });
    }

    // Dapatkan URL Origin untuk membuat full share_url
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin') || `${requestUrl.protocol}//${requestUrl.host}`;

    // Cek apakah share link sudah pernah dibuat
    const { data: existingLink } = await supabase
      .from('share_links')
      .select('token')
      .eq('quiz_id', targetQuizId)
      .maybeSingle();

    if (existingLink) {
      const shareUrl = `${origin}/share/${existingLink.token}`;
      return NextResponse.json({ 
        token: existingLink.token,
        share_url: shareUrl 
      });
    }

    // Buat token baru (UUID v4)
    const { data: shareLink, error: shareErr } = await supabase
      .from('share_links')
      .insert({ quiz_id: targetQuizId, owner_id: user.id })
      .select('token')
      .single();

    if (shareErr) throw shareErr;

    const shareUrl = `${origin}/share/${shareLink.token}`;
    return NextResponse.json({ 
      token: shareLink.token,
      share_url: shareUrl 
    });

  } catch (e: any) {
    console.error('API Create Share Link Error:', e);
    return NextResponse.json({ error: e?.message || 'Gagal membuat tautan berbagi.' }, { status: 500 });
  }
}
