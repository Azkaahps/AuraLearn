'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, LogOut, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { QuotaProgressBar } from './QuotaProgressBar';
import { Logo } from '@/components/ui/logo';

interface SidebarProps {
  user: any;
  profile: any;
  /** Mobile: apakah drawer terbuka (hanya relevan di mobile) */
  isOpen?: boolean;
  /** Mobile: callback tutup drawer */
  onClose?: () => void;
}

export function Sidebar({ user, profile, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
    { label: 'MY DOCUMENTS', href: '/documents', icon: FileText },
    { label: 'SETTINGS', href: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    // Tutup mobile drawer saat link diklik
    onClose?.();
  };

  // Konten sidebar (reuse di desktop & mobile)
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between pt-6">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="px-6 mb-6 flex items-center justify-between">
          <Logo href="/dashboard" size="md" />
          {/* Tombol tutup — hanya di mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#1f1633] border border-[#362d59] text-white/70 hover:text-white hover:border-[#6a5fc1] transition-all"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 flex flex-col gap-1.5 font-mono mb-6">
          <div className="px-2 pb-1 text-[10px] font-mono font-bold text-[#fa7faa] tracking-widest uppercase">
            // MAIN NAVIGATION
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`button-cap flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-xs font-bold tracking-[0.2px] transition-all border ${
                  isActive
                    ? 'bg-[#422082] text-white border-[#6a5fc1]'
                    : 'bg-transparent text-white/70 border-transparent hover:bg-[#1f1633] hover:text-white hover:border-[#362d59]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#c2ef4e]' : 'text-white/50'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Upload Widget */}
        <div className="px-4">
          <Link
            href="/upload"
            onClick={handleNavClick}
            className="group block bg-[#1f1633] border border-[#362d59] hover:border-[#6a5fc1] rounded-[12px] p-3.5 transition-all shadow-md"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] font-bold text-[#c2ef4e] tracking-wider uppercase flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#c2ef4e]" /> UPLOAD BARU
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2ef4e] animate-pulse" />
            </div>
            <p className="font-sans text-xs text-white/70 group-hover:text-white transition-colors leading-snug">
              Ekstrak PPTX / PDF menjadi kuis adaptif dalam 5 detik.
            </p>
          </Link>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-[#362d59] bg-[#150f23] space-y-3">
        {/* Kuota */}
        <QuotaProgressBar profile={profile} variant="sidebar" />

        {/* Profile Card */}
        <div className="bg-[#1f1633] border border-[#362d59] rounded-[8px] p-3 flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[6px] bg-[#422082] text-[#c2ef4e] border border-[#362d59] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0 font-mono text-xs overflow-hidden leading-tight">
            <span className="font-bold text-white truncate" title={user.user_metadata?.full_name || user.email?.split('@')[0]}>
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-[10px] text-white/60 truncate" title={user.email}>
              {user.email}
            </span>
            <span className="text-[10px] text-[#fa7faa] uppercase font-bold tracking-wider mt-1 truncate">
              {profile.tier} STUDENT
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="button-cap flex items-center gap-3 w-full px-4 py-2.5 rounded-[8px] text-xs font-bold text-white/70 hover:bg-[#BA1A1A]/20 hover:text-[#fa7faa] hover:border hover:border-[#BA1A1A]/40 transition-colors uppercase tracking-[0.2px]"
        >
          <LogOut className="w-4 h-4 text-[#fa7faa]" />
          <span>LOGOUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar (selalu tampil di md+) ─── */}
      <aside className="hidden md:flex w-64 h-full bg-[#150f23] border-r border-[#362d59] flex-col z-10 shrink-0 select-none overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* ─── Mobile: Overlay backdrop ─── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile: Slide-over Drawer ─── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 bg-[#150f23] border-r border-[#362d59] select-none overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi utama"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
