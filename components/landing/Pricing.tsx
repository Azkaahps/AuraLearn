import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 md:px-8 bg-[#150f23] text-white border-b border-[#362d59] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <div className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-3">
            PILIHAN PAKET BELAJAR
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Investasi Belajar Terbaik
          </h2>
          <p className="font-sans text-base text-white/70 max-w-xl mx-auto leading-[1.6]">
            Harga jujur, tanpa biaya tersembunyi. Mulai gratis, berlangganan saat Anda siap beralih ke Pro.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Free Tier Card - Dark Console Surface */}
          <div className="flex flex-col p-8 md:p-10 bg-[#1f1633] text-white border border-[#362d59] rounded-[18px] hover:border-[#6a5fc1] transition-all shadow-xl">
             <div className="font-mono text-xs font-bold text-[#fa7faa] uppercase tracking-wider mb-2">PAKET BASIC</div>
             <h3 className="font-display text-3xl font-bold mb-2 text-white">FREE STUDENT</h3>
             <p className="font-sans text-sm text-white/70 mb-6 h-12 leading-[1.5]">
               Cocok untuk pengujian kemampuan dasar kuis & ekstraksi AI.
             </p>
             
             <div className="mb-8 pb-6 border-b border-[#362d59]">
               <span className="font-display text-5xl font-bold tracking-tight text-white">Rp 0</span>
               <span className="font-mono text-xs text-white/50 font-bold uppercase ml-2">/ SELAMANYA</span>
             </div>
             
             <ul className="space-y-4 mb-10 flex-1 font-sans text-sm">
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Upload 3 Dokumen / bulan</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Kuis Adaptif (Maks 10 soal)</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Chat AI Materi (5 Pesan / hari)</span>
               </li>
               <li className="flex items-start gap-3 opacity-40">
                 <X className="w-5 h-5 text-[#fa7faa] shrink-0 mt-0.5" />
                 <span className="text-white/40 line-through">Penjelasan Detail Logika Soal</span>
               </li>
             </ul>
             
             <Button variant="outline" className="button-cap w-full h-12 bg-[#150f23] text-white border border-[#362d59] hover:border-[#6a5fc1] rounded-[8px] font-bold tracking-[0.2px] uppercase" asChild>
                <Link href="/register">MULAI GRATIS</Link>
             </Button>
          </div>

          {/* Pro Tier Card - High Contrast Dark Console Card */}
          <div className="flex flex-col p-8 md:p-10 bg-[#1f1633] text-white border-2 border-[#6a5fc1] rounded-[18px] relative shadow-2xl">
             <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#c2ef4e] text-[#150f23] px-3.5 py-1 rounded-[4px] border border-[#150f23]">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">PALING POPULER</span>
             </div>
             
             <div className="font-mono text-xs font-bold text-[#fa7faa] uppercase tracking-wider mb-2">PRO TIER</div>
             <h3 className="font-display text-3xl font-bold mb-2 text-white">PRO STUDENT</h3>
             <p className="font-sans text-sm text-white/70 mb-6 h-12 leading-[1.5]">
               Alat tempur lengkap dengan Penjelasan Logika Soal & Export PDF.
             </p>
             
             <div className="mb-8 pb-6 border-b border-[#362d59]">
               <span className="font-display text-5xl font-bold tracking-tight text-white">Rp 29.000</span>
               <span className="font-mono text-xs text-white/50 font-bold uppercase ml-2">/ BULAN</span>
             </div>
             
             <ul className="space-y-4 mb-10 flex-1 font-sans text-sm">
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Upload Hingga 50 Dokumen / bln</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Flashcards Unlimited (Semua Box)</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium">Chat AI Unlimited Prioritas</span>
               </li>
               <li className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#c2ef4e] shrink-0 mt-0.5" />
                 <span className="text-white font-medium font-bold text-[#c2ef4e]">Akses "Jelaskan Logika Soal" AI</span>
               </li>
             </ul>
             
             <Button className="button-cap w-full h-12 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all" asChild>
                <Link href="/register">BERLANGGANAN PRO</Link>
             </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
}
