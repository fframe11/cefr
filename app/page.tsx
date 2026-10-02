'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingView } from '../components/views/LandingView';

export default function RootLandingPage() {
  const router = useRouter();

  const handleStartLearning = () => {
    router.push('/assessment');
  };

  return <LandingView onStartLearning={handleStartLearning} />;
}
