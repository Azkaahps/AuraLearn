import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildFlashcardPrompt } from '@/lib/gemini/prompts';
import { z } from 'zod';

const FlashcardSchema = z.array(
  z.object({
    idx: z.number(),
    type: z.enum(['front_back', 'cloze_deletion']),
    front: z.string(),
    back: z.string(),
    cloze_text: z.string().nullable().optional(),
    leitner_box: z.number().default(1),
  })
);

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { document_id, num_flashcards } = body;

    if (!document_id) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 });
    }

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('extracted_text, model_used')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.tier || 'free';
    const maxLimit = tier === 'pro' ? 50 : 15;
    
    let requestedCount = num_flashcards ? parseInt(num_flashcards, 10) : maxLimit;
    if (isNaN(requestedCount) || requestedCount <= 0) {
      requestedCount = 15;
    }
    
    const count = Math.min(requestedCount, maxLimit);

    // generate/flashcard: teks → JSON. Pakai gemini-3.1-flash-lite (15 RPM, 500 RPD).
    const model = getGeminiModel('gemini-3.1-flash-lite', true);
    const prompt = buildFlashcardPrompt(doc.extracted_text, count);

    let flashcards = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 3; // Naikkan ke 3 untuk toleransi 503 overloaded

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      try {
        // Delay progresif antar retry: attempt 2 = 2s, attempt 3 = 4s
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, (attempts - 1) * 2000));
        }

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        // Guard: jika response kosong atau bukan JSON (misal HTML error page dari 503)
        if (!textResponse || !textResponse.trim().startsWith('[')) {
          console.warn(`Attempt ${attempts}: response bukan JSON array. Preview:`, textResponse?.slice(0, 100));
          if (attempts >= MAX_ATTEMPTS) {
            return NextResponse.json({ 
              error: 'Sistem AI mengembalikan format yang tidak valid. Coba lagi beberapa saat.' 
            }, { status: 500 });
          }
          continue;
        }

        let rawData;
        try {
           rawData = JSON.parse(textResponse);
        } catch (e) {
           console.warn(`Attempt ${attempts}: JSON.parse gagal.`);
           if (attempts >= MAX_ATTEMPTS) {
             return NextResponse.json({ 
               error: 'Format JSON tidak valid dari AI. Coba lagi.' 
             }, { status: 500 });
           }
           continue;
        }

        const parsed = FlashcardSchema.safeParse(rawData);
        
        if (parsed.success) {
          flashcards = parsed.data;
          break;
        } else {
          console.warn(`Zod Validation Failed on attempt ${attempts}:`, parsed.error);
          if (attempts >= MAX_ATTEMPTS) {
            return NextResponse.json({ 
              error: 'Struktur flashcard tidak valid setelah beberapa percobaan.' 
            }, { status: 500 });
          }
        }
      } catch (err: any) {
        const status = err?.status;
        console.warn(`Generation attempt ${attempts} failed (status ${status}):`, err?.message || err);
        // 503 = overloaded, boleh retry. Error lain langsung gagal.
        if (status !== 503 && attempts >= MAX_ATTEMPTS) {
          return NextResponse.json({ 
            error: 'Sistem AI gagal mengonstruksi flashcard. Silakan coba lagi.' 
          }, { status: 500 });
        }
        if (attempts >= MAX_ATTEMPTS) {
          return NextResponse.json({ 
            error: 'Server AI sedang sibuk. Tunggu beberapa saat dan coba lagi.' 
          }, { status: 503 });
        }
      }
    }

    if (!flashcards) {
      return NextResponse.json({ error: 'Sistem AI gagal mengonstruksi flashcard yang valid.' }, { status: 500 });
    }

    const { data: flashcardResult, error: insertError } = await supabase
      .from('flashcard_sets')
      .insert({
        document_id,
        user_id: user.id,
        cards: flashcards
      })
      .select('id')
      .single();

    if (insertError || !flashcardResult) {
      console.error("Flashcard Insert Error:", insertError);
      return NextResponse.json({ error: 'Failed to save flashcard set to database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      flashcard_set_id: flashcardResult.id,
      cards: flashcards
    });

  } catch (err: any) {
    console.error("Flashcard Generator API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
