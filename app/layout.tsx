import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEFR Speaking Lab: AI Speech Evaluation Engine",
  description: "Realtime Pronunciation Scoring, Fluency, and CEFR Band Evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
