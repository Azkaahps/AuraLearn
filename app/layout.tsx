/**
 * app/layout.tsx
 * Root layout — dibungkus Providers untuk ThemeProvider + Toaster.
 *
 * Font: Plus Jakarta Sans via next/font/google
 * Source: docs/DESIGN.md §Typography, docs/AI-CONTEXT.md §Dark Mode
 *
 * SEO: title template ditetapkan di sini, setiap page override via generateMetadata.
 */
import type { Metadata } from 'next';
import { Rubik, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AuraLearn - Home',
    template: 'AuraLearn - %s',
  },
  description:
    'Upload dokumen PDF, DOCX, atau gambar dan dapatkan kuis adaptif serta flashcard siap pakai dalam hitungan detik. Didukung AI Gemini.',
  keywords: ['kuis AI', 'belajar aktif', 'flashcard', 'active recall', 'mahasiswa'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${rubik.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#150f23] text-white selection:bg-[#6a5fc1]/40`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
