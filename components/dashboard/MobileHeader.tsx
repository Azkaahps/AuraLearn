'use client';

import { Menu } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

/**
 * MobileHeader — top bar yang hanya tampil di mobile (md:hidden).
 * Berisi hamburger button + logo.
 * Dipasang di app layout di atas <main>.
 */
export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 h-14 bg-[#150f23]/95 backdrop-blur-md border-b border-[#362d59] flex items-center justify-between px-4 shrink-0">
      {/* Hamburger */}
      <button
        onClick={onOpenSidebar}
        className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#1f1633] border border-[#362d59] text-white hover:border-[#6a5fc1] transition-all"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Logo Tengah */}
      <Logo href="/dashboard" size="sm" />

      {/* Spacer kanan agar logo tetap center */}
      <div className="w-9" aria-hidden="true" />
    </header>
  );
}
