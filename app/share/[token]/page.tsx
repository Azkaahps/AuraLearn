import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import crypto from 'crypto';
import Link from 'next/link';
import { SharedQuizClient } from '@/components/share/SharedQuizClient';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Sparkles } from 'lucide-react';

// Mode Statis dinamis (karena butuh headers)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bagikan Kuis',
};

export default async function SharedQuizPage({ params }: { params: { token: string } }) {
  const token = params.token;
  
  // Menggunakan Service Role Key mutlak dibutuhkan di sini
  // karena RLS melarang operasi SELECT ke 'share_attempts' bagi pengunjung publik
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Validasi Token UUID
  const { data: link, error: linkErr } = await supabaseAdmin
    .from('share_links')
    .select('quiz_id')
    .eq('token', token)
    .single();

  if (linkErr || !link || !link.quiz_id) {
    notFound();
  }

  // 2. IP Tracking & Rate Limiting (Maks 3 attempt per hari)
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
  
  // HACK ARSITEKTUR: Karena DB schema memaksakan UNIQUE(token, ip_hash, attempt_date)
  // dan tidak mengizinkan kolom 'attempt_count', kita mengakali limitasi 3 attempts
  // dengan mendaftarkan IP ke dalam 3 slot hash berbeda per harinya.
  const hashes = [
    crypto.createHash('sha256').update(`${ip}-slot1`).digest('hex'),
    crypto.createHash('sha256').update(`${ip}-slot2`).digest('hex'),
    crypto.createHash('sha256').update(`${ip}-slot3`).digest('hex')
  ];
  const today = new Date().toISOString().split('T')[0];

  const { data: attempts } = await supabaseAdmin
    .from('share_attempts')
    .select('ip_hash')
    .eq('token', token)
    .eq('attempt_date', today)
    .in('ip_hash', hashes);

  const usedSlots = attempts?.map(a => a.ip_hash) || [];
  
  if (usedSlots.length >= 3) {
     return (
       <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
         {/* Top Nav */}
         <header className="sticky top-0 z-40 h-[52px] w-full bg-white/90 dark:bg-[#150f23]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#362d59] flex items-center px-4 md:px-6">
           <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <Logo href="/" size="sm" />
               <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-[#362d59]" />
               <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 dark:text-white/70 dark:hover:text-white dark:hover:bg-[#1f1633] dark:hover:border-[#362d59] transition-all font-mono text-xs font-bold uppercase tracking-[0.2px]">
                 <ArrowLeft className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">HALAMAN UTAMA</span>
               </Link>
             </div>
             <span className="font-mono text-[10px] font-bold text-[#d946ef] dark:text-[#fa7faa] uppercase tracking-widest">SHARED QUIZ</span>
           </div>
         </header>
         <div className="flex-1 flex flex-col items-center justify-center p-4">
           <div className="max-w-md text-center space-y-6 bg-white dark:bg-[#150f23] border border-slate-200 dark:border-[#362d59] p-10 rounded-[18px] shadow-xl text-slate-900 dark:text-white">
             <div className="w-16 h-16 bg-rose-100 dark:bg-[#fa7faa]/10 text-rose-600 dark:text-[#fa7faa] rounded-[12px] flex items-center justify-center mx-auto border border-rose-200 dark:border-[#fa7faa]/30">
                <span className="text-2xl font-bold font-display">!</span>
             </div>
             <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Limit Akses Tercapai</h1>
             <p className="font-sans text-sm text-slate-600 dark:text-white/70 leading-[1.5]">Anda telah mencapai batas <strong className="text-slate-900 dark:text-white">3 kali percobaan</strong> mengakses tautan ini untuk hari ini.</p>
             <p className="font-mono text-xs text-slate-500 dark:text-white/50">Silakan kembali lagi besok atau daftarkan akun AuraLearn secara gratis.</p>
             <Link href="/register" className="button-cap inline-flex items-center gap-2 px-6 py-2.5 bg-[#150f23] text-white hover:bg-slate-800 dark:bg-white dark:text-[#150f23] dark:hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase text-xs transition-all">
               DAFTAR GRATIS
             </Link>
           </div>
         </div>
       </div>
     );
  }

  // Tentukan slot mana yang kosong lalu catat attempt baru
  const emptySlot = hashes.find(h => !usedSlots.includes(h));
  if (emptySlot) {
     await supabaseAdmin.from('share_attempts').insert({
        token,
        ip_hash: emptySlot,
        attempt_date: today
     });
  }

  // 3. Ambil Data Kuis (Penerima tidak memotong kuota siapapun, hanya membaca jsonb)
  const { data: quiz } = await supabaseAdmin
    .from('quizzes')
    .select('questions')
    .eq('id', link.quiz_id)
    .single();

  if (!quiz) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground bg-console-grid flex flex-col">
      {/* Sticky Top Nav */}
      <header className="sticky top-0 z-40 h-[52px] w-full bg-white/90 dark:bg-[#150f23]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#362d59] flex items-center px-4 md:px-6">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" />
            <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-[#362d59]" />
            <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 dark:text-white/70 dark:hover:text-white dark:hover:bg-[#1f1633] dark:hover:border-[#362d59] transition-all font-mono text-xs font-bold uppercase tracking-[0.2px] group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">HALAMAN UTAMA</span>
            </Link>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#d946ef] dark:text-[#fa7faa] uppercase tracking-widest">SHARED QUIZ</span>
          <Link href="/register" className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 dark:bg-[#1f1633] dark:text-white/60 dark:hover:text-white dark:hover:bg-[#422082] dark:border-[#362d59] dark:hover:border-[#6a5fc1] transition-all font-mono text-xs font-bold uppercase tracking-[0.2px] shrink-0">
            DAFTAR GRATIS
          </Link>
        </div>
      </header>

       <div className="flex-1 p-4 md:p-8 pt-10 md:pt-16">
         <div className="max-w-3xl mx-auto mb-10 text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-slate-100 dark:bg-[#1f1633] border border-slate-200 dark:border-[#362d59] text-xs font-mono font-bold text-slate-600 dark:text-white/70 mb-2">
              <Sparkles className="w-4 h-4 text-[#65a30d] dark:text-[#c2ef4e]" /> KUIS BERBAGI AURALEARN
           </div>
           <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Uji Pengetahuan Anda</h1>
           <p className="font-sans text-sm text-slate-600 dark:text-white/70">
             Tautan ini bersifat publik. Jawaban Anda tidak akan dikaitkan ke profil manapun.
           </p>
         </div>
         
         <SharedQuizClient questions={quiz.questions as any[]} />
       </div>
    </div>
  );
}
