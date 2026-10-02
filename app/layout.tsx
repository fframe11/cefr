import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'CEFR English & Cambridge Exam Preparation Platform',
  description: 'Production-ready CEFR English proficiency and Cambridge exam preparation platform (A1-C2).',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen bg-game-canvas text-slate-900 dark:text-slate-100 antialiased selection:bg-[#FA5D5D]/25 selection:text-white relative font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
