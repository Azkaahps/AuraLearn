import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kuis',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
