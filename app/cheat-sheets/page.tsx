'use client';
import React from 'react';
import { CheatSheetsView } from '../../components/views/CheatSheetsView';
import { useRouter } from 'next/navigation';

export default function CheatSheetsPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CheatSheetsView
        onNavigatePractice={() => router.push('/oopt-practice')}
      />
    </div>
  );
}
