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
    <html lang="th" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground bg-studio-grid antialiased selection:bg-primary/25 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
