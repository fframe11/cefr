'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LandingView } from '../components/views/LandingView';

export default function RootLandingPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleStartLearning = () => {
    router.push('/dashboard');
  };

  return <LandingView onStartLearning={handleStartLearning} />;
}
