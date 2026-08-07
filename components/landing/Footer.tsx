import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function Footer() {
  return (
    <footer className="bg-[#150f23] text-white relative pt-16 pb-12 px-4 md:px-8 border-t border-[#362d59]">

      {/* Signature Electric Lime Squiggly Divider Stroke (100% Edge-to-Edge Full Screen) */}
      <div className="absolute top-0 left-0 right-0 w-full -translate-y-1/2 overflow-hidden pointer-events-none">
        <svg className="w-full h-5 text-[#c2ef4e]" viewBox="0 0 1200 20" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 10 Q 30 0, 60 10 T 120 10 T 180 10 T 240 10 T 300 10 T 360 10 T 420 10 T 480 10 T 540 10 T 600 10 T 660 10 T 720 10 T 780 10 T 840 10 T 900 10 T 960 10 T 1020 10 T 1080 10 T 1140 10 T 1200 10" stroke="currentColor" strokeWidth="3.5" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="mb-6">
            <Logo href="/" size="md" />
          </div>
          <p className="font-sans text-sm text-white/70 max-w-sm leading-[1.6]">
            Platform edtech cerdas yang mengubah dokumen statis Anda menjadi alat ukur pembelajaran aktif dan adaptif dalam hitungan detik.
          </p>
        </div>

        <div>
          <h4 className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-4">
            PRODUK
          </h4>
          <ul className="space-y-3 font-sans text-sm">
            <li><Link href="#features" className="text-white/70 hover:text-[#c2ef4e] transition-colors">Fitur Adaptif</Link></li>
            <li><Link href="#pricing" className="text-white/70 hover:text-[#c2ef4e] transition-colors">Paket Harga</Link></li>
            <li><Link href="/login" className="text-white/70 hover:text-[#c2ef4e] transition-colors">Login Area</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow-cap text-xs text-[#fa7faa] font-mono tracking-[0.2px] mb-4">
            ANGGOTA TIM
          </h4>
          <ul className="space-y-3 font-sans text-sm text-white/70">
            <li className="hover:text-[#c2ef4e] transition-colors">AzkaaHPS</li>
            <li className="hover:text-[#c2ef4e] transition-colors">AGeR</li>
            <li className="hover:text-[#c2ef4e] transition-colors">RifqiDF</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#362d59] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-white/50">
        <p>
          © {new Date().getFullYear()} AURALEARN.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-[#c2ef4e] font-bold">Created by UCHAN CYBER.</span>
        </div>
      </div>
    </footer>
  );
}
