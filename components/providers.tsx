'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        {/* Sentry Design Language Custom Console Toast System */}
        <Toaster
          position="bottom-right"
          theme="dark"
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: '#150f23',
              color: '#ffffff',
              borderColor: '#362d59',
              borderRadius: '8px',
              fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
              fontSize: '13px',
            },
            classNames: {
              toast: 'group font-mono border border-[#362d59] bg-[#150f23] text-white rounded-[8px] p-4 shadow-2xl',
              title: 'font-mono text-xs font-bold text-white uppercase tracking-wider',
              description: 'font-mono text-xs text-white/70 mt-1',
              actionButton: 'button-cap bg-white text-[#150f23] hover:bg-white/90 rounded-[4px] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2px]',
              cancelButton: 'button-cap bg-[#1f1633] text-white/70 border border-[#362d59] rounded-[4px] px-3 py-1 text-[11px] font-bold uppercase',
              closeButton: 'bg-[#1f1633] text-white/70 border border-[#362d59] hover:text-white hover:border-[#6a5fc1]',
              success: '!border-l-4 !border-l-[#c2ef4e] !bg-[#150f23] !text-white',
              error: '!border-l-4 !border-l-[#fa7faa] !bg-[#150f23] !text-white',
              info: '!border-l-4 !border-l-[#6a5fc1] !bg-[#150f23] !text-white',
              warning: '!border-l-4 !border-l-[#fa7faa] !bg-[#150f23] !text-white',
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
