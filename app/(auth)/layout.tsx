import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'AuraLearn - Login',
    template: 'AuraLearn - %s',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-[#150f23] bg-console-grid text-white p-4">
      {children}
    </main>
  );
}
