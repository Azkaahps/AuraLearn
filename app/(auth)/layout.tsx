import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'AuraLearn - Login',
    template: 'AuraLearn - %s',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#150f23] bg-console-grid text-white p-4 relative">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white/70 hover:text-[#c2ef4e] transition-colors py-2 px-3.5 rounded-[8px] bg-[#1f1633] border border-[#362d59] hover:border-[#6a5fc1] group shadow-lg uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-[#c2ef4e] group-hover:-translate-x-1 transition-transform" />
          <span>KEMBALI KE BERANDA</span>
        </Link>
      </div>
      {children}
    </main>
  );
}
