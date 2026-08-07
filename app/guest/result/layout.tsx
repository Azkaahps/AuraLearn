import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hasil Demo Kuis',
};

export default function GuestResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
