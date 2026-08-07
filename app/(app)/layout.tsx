import { AppShell } from '@/components/dashboard/AppShell';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile untuk sidebar
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <AppShell user={user} profile={profile || { tier: 'free', docs_used: 0 }}>
      {children}
    </AppShell>
  );
}
