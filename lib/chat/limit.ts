import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Mengecek apakah pengguna masih memiliki kuota pesan hari ini.
 * Pro: Unlimited.
 * Free: 5 Pesan / Hari.
 */
export async function checkChatLimit(supabase: SupabaseClient, userId: string, tier: string): Promise<boolean> {
  if (tier === 'pro') return true;

  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('chat_daily_usage')
    .select('msg_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  // PGRST116 = Data tidak ditemukan (artinya 0 pesan hari ini)
  if (error && error.code !== 'PGRST116') {
    console.error("Gagal mengecek limit harian:", error);
    return false; // Fail-safe: Blokir akses bila error baca DB selain "not found"
  }

  const count = data?.msg_count || 0;
  return count < 5;
}

/**
 * Memotong kuota harian (increments daily usage).
 */
export async function incrementChatLimit(supabase: SupabaseClient, userId: string, tier: string): Promise<void> {
  if (tier === 'pro') return;

  const today = new Date().toISOString().split('T')[0];
  
  // Baca angka saat ini
  const { data, error } = await supabase
    .from('chat_daily_usage')
    .select('msg_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  if (error && error.code !== 'PGRST116') return;

  const newCount = (data?.msg_count || 0) + 1;
  
  // Upsert (Insert jika belum ada, Update jika hari dan user_id sudah ada)
  await supabase
    .from('chat_daily_usage')
    .upsert(
      { user_id: userId, usage_date: today, msg_count: newCount },
      { onConflict: 'user_id, usage_date' }
    );
}
