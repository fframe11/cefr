'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingView } from '../../components/views/LandingView';

export default function LandingPage() {
  const router = useRouter();

  const handleStartLearning = () => {
    router.push('/dashboard');
  };

  return <LandingView onStartLearning={handleStartLearning} />;
}
