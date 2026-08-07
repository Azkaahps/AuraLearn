'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface SessionTopBarProps {
  /** Label breadcrumb kiri (mis. "QUIZ", "FLASHCARD", "TUTOR AI") */
  sessionLabel: string;
  /** Nama dokumen / judul konteks (opsional, mis. nama file) */
  contextTitle?: string;
  /** Href tombol kembali, default "/dashboard" */
  backHref?: string;
  /** Label tombol kembali, default "DASBOR" */
  backLabel?: string;
  /** Aksion tambahan di sebelah kanan bar (mis. tombol cetak) */
  rightAction?: React.ReactNode;
  /** Kelas tambahan untuk container */
  className?: string;
}

/**
 * SessionTopBar — bar navigasi tipis untuk halaman sesi (quiz, flashcard, chat).
 *
 * Desain: sticky top-0, height 52px, transparan + blur, 1px border-bottom.
 * Di mobile: hanya ikon kembali + label sesi.
 * Di desktop: logo kiri, breadcrumb tengah, tombol kembali kanan.
 */
export function SessionTopBar({
  sessionLabel,
  contextTitle,
  backHref = '/dashboard',
  backLabel = 'DASBOR',
  rightAction,
  className = '',
}: SessionTopBarProps) {
  const router = useRouter();

  return (
    <header
      className={`sticky top-0 z-40 h-[52px] w-full bg-[#150f23]/90 backdrop-blur-md border-b border-[#362d59] flex items-center px-4 md:px-6 select-none print-hidden ${className}`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-4">

        {/* Kiri: Logo (desktop) + Tombol Kembali */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo — hanya desktop */}
          <div className="hidden md:block shrink-0">
            <Logo href="/dashboard" size="sm" />
          </div>

          {/* Separator — hanya desktop */}
          <div className="hidden md:block w-px h-5 bg-[#362d59]" />

          {/* Tombol Kembali */}
          <button
            onClick={() => router.push(backHref)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-transparent text-white/70 hover:text-white hover:bg-[#1f1633] border border-transparent hover:border-[#362d59] transition-all font-mono text-xs font-bold uppercase tracking-[0.2px] group"
            aria-label={`Kembali ke ${backLabel}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>
        </div>

        {/* Tengah: Breadcrumb / Label Sesi */}
        <div className="hidden sm:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="font-mono text-[10px] font-bold text-[#fa7faa] uppercase tracking-widest">
            {sessionLabel}
          </span>
          {contextTitle && (
            <>
              <span className="text-[#362d59] font-mono text-xs">/</span>
              <span
                className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-wider max-w-[140px] md:max-w-[260px] truncate"
                title={contextTitle}
              >
                {contextTitle}
              </span>
            </>
          )}
        </div>

        {/* Kanan: Action Tambahan & Shortcut Dashboard */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1f1633] text-white/60 hover:text-white hover:bg-[#422082] border border-[#362d59] hover:border-[#6a5fc1] transition-all font-mono text-xs font-bold uppercase tracking-[0.2px] shrink-0"
            aria-label="Kembali ke Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">DASHBOARD</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
