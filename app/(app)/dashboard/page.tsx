import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { DocumentCardGrid } from '@/components/dashboard/DocumentCardGrid';
import { QuotaProgressBar } from '@/components/dashboard/QuotaProgressBar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Inbox, Sparkles, Terminal, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Tarik profil (tier, usage)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Tarik dokumen riwayat
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, page_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const isFree = profile?.tier === 'free';
  const isEmpty = !documents || documents.length === 0;

  return (
    <div className="p-6 md:p-10 w-full max-w-[1600px] mx-auto min-h-screen animate-in fade-in duration-300">
      
      {/* Console Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#362d59]">
         <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
              STUDY CONSOLE
            </h1>
         </div>

         <Button className="button-cap h-11 px-6 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase shadow-md transition-all shrink-0" asChild>
           <Link href="/upload"><Plus className="w-4 h-4 mr-2 text-[#150f23]" /> UPLOAD DOKUMEN</Link>
         </Button>
      </div>

      {/* Quota Telemetry Banner Console Panel */}
      <div className="bg-[#150f23] border border-[#362d59] rounded-[18px] p-6 md:p-8 shadow-xl mb-10 relative overflow-hidden">
         <div className="relative z-10">
           <div className="flex items-center justify-between mb-4">
             <h2 className="micro-cap text-white/70 flex items-center gap-2">
               <Terminal className="w-4 h-4 text-[#c2ef4e]" />
               <span>PEMAKAIAN KUOTA DOKUMEN BULAN INI</span>
             </h2>
             <span className="font-mono text-xs text-[#fa7faa] bg-[#fa7faa]/10 border border-[#fa7faa]/20 px-3 py-1 rounded-[4px] font-bold uppercase tracking-wider">
               {profile?.tier?.toUpperCase() || 'FREE'} TIER
             </span>
           </div>

           <QuotaProgressBar profile={profile || { tier: 'free', docs_used: 0 }} variant="banner" />
           
           {isFree && (
              <div className="mt-8 pt-6 border-t border-[#362d59] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1f1633] -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-[18px]">
                 <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-[8px] bg-[#422082] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-base mb-1 flex items-center gap-2">
                        UPGRADE KE PRO TIER (Rp 29.000 / bln)
                      </p>
                      <p className="font-sans text-sm text-white/70 max-w-xl leading-[1.5]">
                        Dapatkan kuota 50 dokumen/bulan, kuis tanpa batas, dan akses penuh ke Chat AI Tutor berkonteks & Penjelasan Logika Soal.
                      </p>
                    </div>
                 </div>
                 <Button className="button-cap h-11 px-6 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase shrink-0 transition-all" asChild>
                   <Link href="/settings">TINGKATKAN SEKARANG</Link>
                 </Button>
              </div>
           )}
         </div>
      </div>

      {/* Documents Area Header */}
      <div className="flex items-center justify-between mb-6 pb-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Code2 className="w-6 h-6 text-[#6a5fc1]" />
          <span>DOKUMEN SAYA</span>
        </h2>
        <span className="font-mono text-xs font-bold text-[#c2ef4e] bg-[#c2ef4e]/10 border border-[#c2ef4e]/30 px-3 py-1 rounded-[4px] uppercase tracking-wider">
          TOTAL: {documents?.length || 0} FILES
        </span>
      </div>

      {isEmpty ? (
         <div className="flex flex-col items-center justify-center p-12 md:p-20 bg-[#150f23] border border-dashed border-[#362d59] rounded-[18px] text-center shadow-xl">
            <div className="w-16 h-16 bg-[#1f1633] border border-[#362d59] rounded-[12px] flex items-center justify-center text-[#c2ef4e] mb-6">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2 uppercase">BELUM ADA DOKUMEN INDEX</h3>
            <p className="font-sans text-sm text-white/70 max-w-md mb-8 leading-[1.5]">
              Pilih file presentasi (PPTX) atau buku cetak (PDF) lalu saksikan keajaiban AI menyusun kuis adaptif untuk Anda.
            </p>
            <Button className="button-cap h-12 px-8 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all" asChild>
              <Link href="/upload"><Plus className="w-4 h-4 mr-2 text-[#150f23]" /> UPLOAD DOKUMEN PERTAMA</Link>
            </Button>
         </div>
      ) : (
         <DocumentCardGrid documents={documents} />
      )}

     </div>
  );
}
