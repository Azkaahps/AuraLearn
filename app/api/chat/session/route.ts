import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await request.json();

    // 1. Cek apabila sesi chat dengan dokumen ini sudah pernah ada
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('document_id', document_id)
      .eq('user_id', user.id)
      .single();

    if (session) {
      return NextResponse.json({ session_id: session.id });
    }

    // 2. Jika belum, buat sesi baru
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({ document_id, user_id: user.id })
      .select('id')
      .single();

    if (error) throw error;
    
    return NextResponse.json({ session_id: newSession.id });
  } catch (err) {
    console.error("Chat Session API Error:", err);
    return NextResponse.json({ error: 'Gagal inisialisasi sesi chat' }, { status: 500 });
  }
}

// GET history percakapan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const supabase = await createServerClient();
    
    if (!session_id) {
      return NextResponse.json({ error: 'Parameter session_id dibutuhkan' }, { status: 400 });
    }

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    return NextResponse.json({ messages: messages || [] });
  } catch(e) {
    return NextResponse.json({ error: 'Gagal mengambil riwayat pesan' }, { status: 500 });
  }
}
