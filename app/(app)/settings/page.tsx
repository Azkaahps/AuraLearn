import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { SettingsClient } from '@/components/settings/SettingsClient';

export const metadata: Metadata = {
  title: 'Pengaturan',
};

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in duration-300">
      <div className="mb-8 pb-6 border-b border-[#362d59]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">PENGATURAN AKUN</h1>
      </div>
      <SettingsClient user={user} profile={profile || { tier: 'free', docs_used: 0 }} />
    </div>
  );
}
