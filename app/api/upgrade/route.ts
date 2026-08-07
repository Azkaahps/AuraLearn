import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Melakukan simulasi upgrade tier menjadi 'pro' di database
    const { error } = await supabase
      .from('user_profiles')
      .update({ tier: 'pro' })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Berhasil upgrade ke Pro' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
