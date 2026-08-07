'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tutup drawer saat resize ke desktop
  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock scroll body saat drawer terbuka
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Home', id: 'top' },
    { label: 'Fitur', id: 'features' },
    { label: 'Cara Kerja', id: 'how-it-works' },
    { label: 'Harga', id: 'pricing' },
  ];

  return (
    <>
      {/* ─── Top Bar ─── */}
      {/* ─── Top Bar ─── */}
      <nav className="fixed top-0 w-full h-16 bg-[#1f1633]/90 backdrop-blur-md z-50 border-b border-[#362d59] flex items-center justify-between px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-full">
          {/* Logo */}
          <Logo href="/" size="md" />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-mono text-xs">
            {navLinks.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleSmoothScroll(e, id)}
                className="eyebrow-cap text-xs text-white/80 hover:text-[#c2ef4e] transition-colors cursor-pointer"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="button-cap text-xs text-white/80 hover:text-white hover:bg-[#1f1633] rounded-[8px]" asChild>
              <Link href="/login">MASUK</Link>
            </Button>
            <Button className="button-cap text-xs bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] px-5 py-2 transition-all font-bold" asChild>
              <Link href="/register">DAFTAR GRATIS</Link>
            </Button>
          </div>

          {/* Mobile: CTA kecil + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button className="button-cap text-xs bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] px-4 py-2 font-bold h-9" asChild>
              <Link href="/register">DAFTAR</Link>
            </Button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#150f23] border border-[#362d59] text-white hover:border-[#6a5fc1] transition-all"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Drawer Overlay ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile Drawer Panel ─── */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden bg-[#150f23] border-b border-[#362d59] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col p-4 gap-1">
          {/* Nav Links */}
          <div className="pb-3 mb-3 border-b border-[#362d59]">
            <p className="font-mono text-[10px] font-bold text-[#fa7faa] tracking-widest uppercase px-3 pb-2">
              // NAVIGASI
            </p>
            {navLinks.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleSmoothScroll(e, id)}
                className="flex items-center px-3 py-3 rounded-[8px] font-mono text-sm font-bold text-white/80 hover:text-white hover:bg-[#1f1633] transition-all"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="button-cap w-full h-11 text-sm text-white/80 hover:text-white hover:bg-[#1f1633] border border-[#362d59] rounded-[8px] font-bold"
              asChild
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/login">MASUK</Link>
            </Button>
            <Button
              className="button-cap w-full h-11 text-sm bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold"
              asChild
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/register">DAFTAR GRATIS</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
