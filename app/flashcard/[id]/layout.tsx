import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flashcard',
};

export default function FlashcardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
