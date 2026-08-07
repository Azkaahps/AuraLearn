'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileHeader } from '@/components/dashboard/MobileHeader';

interface AppShellProps {
  children: React.ReactNode;
  user: any;
  profile: any;
}

/**
 * AppShell — client wrapper untuk app layout.
 * Mengelola state sidebar mobile (open/close).
 * Dipisah dari server layout agar layout.tsx tetap bisa jadi Server Component.
 */
export function AppShell({ children, user, profile }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden selection:bg-[#6a5fc1]/30 transition-colors duration-300">
      <Sidebar
        user={user}
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar (hamburger + logo) — hanya tampil di mobile */}
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-console-grid text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}
