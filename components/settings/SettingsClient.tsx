'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuotaProgressBar } from '@/components/dashboard/QuotaProgressBar';
import { CheckCircle2, Loader2, User, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SettingsClient({ user, profile }: { user: any, profile: any }) {
  const [view, setView] = useState<'settings' | 'plan' | 'form' | 'success'>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const isPro = profile.tier === 'pro';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/upgrade', { method: 'POST' });
      if (!res.ok) throw new Error('Gagal memproses pembayaran');
      
      toast.success('PEMBAYARAN BERHASIL! KAMU SEKARANG PRO STUDENT.');
      setView('success');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Gagal memproses pembayaran');
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'settings') {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
         
         {/* Grid 2 Kolom: Kolom Utama (Pengaturan) & Kolom Samping (Langganan) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri & Tengah (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Profile Telemetry Card */}
               <div className="bg-[#150f23] border border-[#362d59] rounded-[18px] p-6 md:p-8 shadow-xl relative overflow-hidden text-white">
                  <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-4 flex items-center justify-between">
                     <span>// USER PROFILE DATA</span>
                     <span className="font-mono text-[11px] text-white/50">UUID: {user.id.slice(0, 8)}...</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#362d59]">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[12px] bg-[#1f1633] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center font-display font-bold text-2xl shrink-0">
                           {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                           <h3 className="font-display font-bold text-xl text-white mb-1">
                              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna AuraLearn'}
                           </h3>
                           <p className="font-mono text-sm text-white/70">{user.email}</p>
                        </div>
                     </div>
                     <div className={`px-4 py-1.5 rounded-[4px] font-mono text-xs font-bold uppercase tracking-wider shrink-0 border ${
                       isPro 
                         ? 'bg-[#c2ef4e]/15 text-[#c2ef4e] border-[#c2ef4e]/30' 
                         : 'bg-[#1f1633] text-white/70 border-[#362d59]'
                     }`}>
                        TIER STATUS: {profile.tier?.toUpperCase()}
                     </div>
                  </div>

                  <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-white/70">
                     <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#6a5fc1]" />
                        <span>ROLE: REGULAR STUDENT</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#c2ef4e]" />
                        <span>SECURITY: SUPABASE RLS VERIFIED</span>
                     </div>
                  </div>
               </div>

               {/* Quota Telemetry Card */}
               <div className="bg-[#150f23] border border-[#362d59] rounded-[18px] p-6 md:p-8 shadow-xl text-white">
                  <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-4 flex items-center justify-between">
                     <span className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#c2ef4e]" />
                        <span>ALOKASI KUOTA DOKUMEN</span>
                     </span>
                     <span className="text-white/50">RESET: TIAP TANGGAL 1</span>
                  </div>
                  
                  <QuotaProgressBar profile={profile} variant="settings" />

                  <div className="mt-8 pt-6 border-t border-[#362d59] grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-white/70">
                     <div className="bg-[#1f1633] border border-[#362d59] p-3.5 rounded-[8px]">
                        <span className="block text-white/50 text-[10px] uppercase mb-1">ENGINE IRT</span>
                        <span className="font-bold text-[#c2ef4e]">RASCH 1PL ACTIVE</span>
                     </div>
                     <div className="bg-[#1f1633] border border-[#362d59] p-3.5 rounded-[8px]">
                        <span className="block text-white/50 text-[10px] uppercase mb-1">MEMORI LEITNER</span>
                        <span className="font-bold text-[#a89fe0]">3-BOX REPETITION</span>
                     </div>
                     <div className="bg-[#1f1633] border border-[#362d59] p-3.5 rounded-[8px]">
                        <span className="block text-white/50 text-[10px] uppercase mb-1">CHAT TUTOR</span>
                        <span className="font-bold text-[#fa7faa]">CONTEXT-LOCKED AI</span>
                     </div>
                  </div>
               </div>

            </div>

            {/* Kolom Kanan (1/3 width) - Subscription Plan Card */}
            <div className="space-y-8">
               
               {/* Pro Tier Subscription Box */}
               <div className={`bg-[#150f23] border-2 rounded-[18px] p-6 md:p-8 shadow-2xl relative flex flex-col justify-between text-white ${
                 isPro ? 'border-[#c2ef4e]' : 'border-[#6a5fc1]'
               }`}>
                  {isPro && (
                     <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#c2ef4e] text-[#150f23] px-3.5 py-1 rounded-[4px] font-mono text-xs font-bold uppercase tracking-wider">
                        PRO AKTIF
                     </div>
                  )}

                  <div>
                     <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-2">
                        // PLAN STATUS
                     </div>
                     <h3 className="font-display text-2xl font-bold text-white mb-2">
                        {isPro ? 'PAKET PRO STUDENT' : 'PAKET BASIC STUDENT'}
                     </h3>
                     <p className="font-sans text-sm text-white/70 mb-6 leading-[1.5]">
                        {isPro 
                          ? 'Selamat! Semua kapabilitas kuis adaptif, flashcard unlimited, dan Chat AI Tutor telah terbuka penuh.'
                          : 'Tingkatkan akun Anda ke Pro Tier untuk menikmati ekstraksi 50 dokumen/bulan dan fitur penjelasan AI.'}
                     </p>

                     <div className="mb-6 pb-6 border-b border-[#362d59]">
                        <span className="font-display text-4xl font-bold tracking-tight text-white">
                           {isPro ? 'Rp 29.000' : 'Rp 0'}
                        </span>
                        <span className="font-mono text-xs text-white/50 font-bold uppercase ml-2">
                           {isPro ? '/ BULAN' : '/ SELAMANYA'}
                        </span>
                     </div>

                     <ul className="space-y-3 font-sans text-sm mb-8">
                        <li className="flex items-center gap-3">
                           <CheckCircle2 className="w-4 h-4 text-[#c2ef4e] shrink-0" />
                           <span className="text-white/90">50 Dokumen / bulan</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <CheckCircle2 className="w-4 h-4 text-[#c2ef4e] shrink-0" />
                           <span className="text-white/90">Kuis Adaptif IRT tanpa batas</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <CheckCircle2 className="w-4 h-4 text-[#c2ef4e] shrink-0" />
                           <span className="text-white/90">Flashcard Spaced Repetition</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <CheckCircle2 className="w-4 h-4 text-[#c2ef4e] shrink-0" />
                           <span className="text-white font-bold text-[#c2ef4e]">Penjelasan Detail Logika Soal AI</span>
                        </li>
                     </ul>
                  </div>

                  {!isPro ? (
                     <Button 
                        onClick={() => setView('plan')}
                        className="button-cap w-full h-12 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all flex items-center justify-center gap-2"
                     >
                        <span>TINGKATKAN KE PRO</span>
                        <ArrowRight className="w-4 h-4 text-[#150f23]" />
                     </Button>
                  ) : (
                     <div className="p-4 bg-[#1f1633] border border-[#362d59] rounded-[8px] text-center font-mono text-xs text-[#c2ef4e] font-bold uppercase">
                        ✓ LANGGANAN PRO AKTIF
                     </div>
                  )}
               </div>

            </div>

         </div>
      </div>
    );
  }

  if (view === 'plan') {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
         <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#362d59]">
            <div>
               <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px]">
                  // SUBSCRIPTION COMPARISON
               </div>
               <h2 className="font-display text-2xl font-bold text-white">PILIH PLAN PENGGUNA</h2>
            </div>
            <Button variant="outline" onClick={() => setView('settings')} className="button-cap h-9 text-xs bg-[#1f1633] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] px-4 font-bold uppercase">
               KEMBALI
            </Button>
         </div>

         <div className="bg-[#150f23] border border-[#362d59] rounded-[18px] p-8 shadow-2xl text-white">
            <table className="w-full text-left font-sans text-sm mb-8">
               <thead>
                  <tr className="border-b border-[#362d59] font-mono text-xs text-white/60">
                     <th className="pb-4 uppercase tracking-wider">FITUR AKUN</th>
                     <th className="pb-4 text-center uppercase tracking-wider">FREE STUDENT</th>
                     <th className="pb-4 text-center uppercase tracking-wider text-[#c2ef4e]">PRO STUDENT</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#362d59]/50">
                  <tr>
                     <td className="py-4 text-white font-medium">Kuota Dokumen / bulan</td>
                     <td className="py-4 text-center font-mono text-white/70">3 Dokumen</td>
                     <td className="py-4 text-center font-mono font-bold text-[#c2ef4e]">50 Dokumen</td>
                  </tr>
                  <tr>
                     <td className="py-4 text-white font-medium">Batas Halaman / file</td>
                     <td className="py-4 text-center font-mono text-white/70">10 Halaman</td>
                     <td className="py-4 text-center font-mono font-bold text-[#c2ef4e]">100 Halaman</td>
                  </tr>
                  <tr>
                     <td className="py-4 text-white font-medium">Kuis Adaptif IRT 1PL</td>
                     <td className="py-4 text-center font-mono text-white/70">Maks 10 Soal</td>
                     <td className="py-4 text-center font-mono font-bold text-[#c2ef4e]">Tanpa Batas</td>
                  </tr>
                  <tr>
                     <td className="py-4 text-white font-medium">Penjelasan Logika Soal AI</td>
                     <td className="py-4 text-center font-mono text-white/40">-</td>
                     <td className="py-4 text-center text-[#c2ef4e]"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
                  </tr>
               </tbody>
            </table>

            <div className="bg-[#1f1633] border border-[#362d59] rounded-[12px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                 <p className="font-display text-3xl font-bold tracking-tight text-white">Rp 29.000 <span className="font-mono text-xs font-normal text-white/50 uppercase">/ bulan</span></p>
                 <p className="font-sans text-xs text-white/70 mt-1">Tanpa kontrak terikat. Bisa dibatalkan kapan saja.</p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  <Button variant="outline" onClick={() => setView('settings')} className="button-cap h-11 px-5 bg-[#150f23] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] font-bold uppercase text-xs">
                     BATAL
                  </Button>
                  <Button onClick={() => setView('form')} className="button-cap h-11 px-6 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold uppercase text-xs">
                     PILIH PRO STUDENT
                  </Button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="max-w-lg mx-auto animate-in slide-in-from-right-8 fade-in duration-300">
         <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-2 text-center">
            // SIMULATED GATEWAY CHECKOUT
         </div>
         <h2 className="font-display text-2xl font-bold text-white text-center mb-6">PEMBAYARAN SIMULASI</h2>
         
         <div className="bg-[#150f23] border border-[#362d59] rounded-[18px] p-8 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#362d59]">
               <div>
                  <span className="font-display font-bold text-lg text-white block">Pro Student Plan</span>
                  <span className="font-mono text-xs text-white/50">BERLANGGANAN BULANAN</span>
               </div>
               <span className="font-display font-bold text-2xl text-[#c2ef4e]">Rp 29.000</span>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
               <div>
                 <label className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider block mb-1.5">
                   NAMA PEMEGANG KARTU
                 </label>
                 <input 
                   type="text" 
                   defaultValue={user.email?.split('@')[0]} 
                   required 
                   className="w-full h-11 px-4 rounded-[8px] border border-[#362d59] bg-[#1f1633] text-white font-sans text-sm focus:border-[#6a5fc1] outline-none" 
                 />
               </div>

               <div>
                 <label className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider block mb-1.5">
                   NOMOR KARTU (DUMMY TEST)
                 </label>
                 <input 
                   type="text" 
                   defaultValue="4242 4242 4242 4242" 
                   required 
                   className="w-full h-11 px-4 rounded-[8px] border border-[#362d59] bg-[#1f1633] text-white font-mono text-sm focus:border-[#6a5fc1] outline-none" 
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider block mb-1.5">
                      EXPIRED
                    </label>
                    <input 
                      type="text" 
                      defaultValue="12/29" 
                      required 
                      className="w-full h-11 px-4 rounded-[8px] border border-[#362d59] bg-[#1f1633] text-white font-mono text-sm focus:border-[#6a5fc1] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider block mb-1.5">
                      CVV
                    </label>
                    <input 
                      type="text" 
                      defaultValue="123" 
                      required 
                      className="w-full h-11 px-4 rounded-[8px] border border-[#362d59] bg-[#1f1633] text-white font-mono text-sm focus:border-[#6a5fc1] outline-none" 
                    />
                  </div>
               </div>

               <Button 
                 type="submit" 
                 className="button-cap w-full h-12 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all mt-6" 
                 disabled={isLoading}
               >
                  {isLoading ? (
                     <><Loader2 className="w-4 h-4 mr-2 animate-spin text-[#150f23]" /> MEMPROSES...</>
                  ) : (
                     'PROSES PEMBAYARAN PRO'
                  )}
               </Button>
               
               <p className="text-center font-mono text-xs text-white/40 mt-4 italic">
                  *Simulasi sandbox — tidak ada transaksi uang nyata.
               </p>
               
               <Button 
                 type="button" 
                 variant="ghost" 
                 className="button-cap w-full h-10 text-xs text-white/70 hover:text-white uppercase font-bold" 
                 onClick={() => setView('plan')} 
                 disabled={isLoading}
               >
                  KEMBALI KE PILIHAN PLAN
               </Button>
            </form>
         </div>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center pt-8 text-center animate-in zoom-in-95 fade-in duration-500">
         <div className="w-20 h-20 bg-[#1f1633] text-[#c2ef4e] border border-[#362d59] rounded-[18px] flex items-center justify-center mb-6 shadow-2xl">
            <CheckCircle2 className="w-10 h-10" />
         </div>
         <h2 className="font-display text-3xl font-bold mb-3 text-white">SELAMAT! KAMU PRO STUDENT.</h2>
         <p className="font-sans text-sm text-white/70 text-center mb-8 max-w-sm leading-[1.5]">
            50 dokumen/bulan · 100 halaman/file · Fitur "Jelaskan Logika Soal" AI kini terbuka penuh.
         </p>
         <Button 
           className="button-cap h-12 px-8 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all" 
           onClick={() => router.push('/dashboard')}
         >
            KEMBALI KE DASBOR
         </Button>
      </div>
    );
  }

  return null;
}
