import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theta } = body;

    if (typeof theta !== 'number') {
       return NextResponse.json({ error: 'Invalid theta value. Must be a float.' }, { status: 400 });
    }

    // 1. Sinkronisasi Theta ke DB: Pembaruan user_theta di tabel user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ user_theta: theta })
      .eq('id', user.id);

    if (updateError) {
       console.error("Update theta error:", updateError);
       return NextResponse.json({ error: 'Failed to synchronize theta to DB' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_theta: theta });
  } catch (err) {
    console.error("API Theta Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
