import { createServerClient } from '@/lib/supabase/server';
import { getGeminiModel } from '@/lib/gemini/client';
import { buildChatSystemPrompt } from '@/lib/gemini/prompts';
import { checkChatLimit, incrementChatLimit } from '@/lib/chat/limit';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { session_id, message } = await req.json();

    // 1. Pengecekan Limit Harian User
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();
      
    const tier = profile?.tier || 'free';

    const canChat = await checkChatLimit(supabase, user.id, tier);
    if (!canChat) {
      return new Response('Chat daily limit reached', { status: 429 });
    }

    // 2. Ambil Ephemeral Context (Teks Dokumen Asli)
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('document_id')
      .eq('id', session_id)
      .single();
      
    const { data: doc } = await supabase
      .from('documents')
      .select('extracted_text, model_used')
      .eq('id', session?.document_id)
      .single();

    if (!doc) {
      return new Response('Document context not found', { status: 404 });
    }

    // 3. Ambil riwayat chat (Max 20 pesan)
    const { data: historyData } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(20);

    // 4. Simpan pesan user ke database & kurangi limit harian
    await supabase.from('chat_messages').insert({ session_id, role: 'user', content: message });
    await incrementChatLimit(supabase, user.id, tier);

    // 5. Bangun Konteks Gemini
    // Chat: teks → teks. Pakai gemini-3.1-flash-lite (15 RPM, 500 RPD).
    const systemInstruction = buildChatSystemPrompt(doc.extracted_text);

    // Gemini API: systemInstruction dipisah dari contents (bukan dimasukkan sebagai pesan pertama)
    // Memasukkan systemInstruction ke dalam contents[].parts adalah penyebab error 400:
    // "Unknown name 'role'/'parts' at contents[0].parts[0]"
    const genAI = (await import('@/lib/gemini/client')).genAI;
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
    });

    // Bangun array contents: hanya riwayat user/model + pesan baru
    const contents: { role: string; parts: { text: string }[] }[] = [];
    
    if (historyData) {
      for (const msg of historyData) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    
    // Tambahkan pesan user saat ini
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 6. Jalankan Streaming Response
    const resultStream = await model.generateContentStream({ contents });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
          // Simpan jawaban penuh AI ke database saat stream selesai
          await supabase.from('chat_messages').insert({ session_id, role: 'assistant', content: fullResponse });
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    });

  } catch (err) {
    console.error("API Streaming Chat Error:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
