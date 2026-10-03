'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentView } from '../../components/views/AssessmentView';
import { useApp } from '../../context/AppContext';

export default function AssessmentPage() {
  const router = useRouter();
  const { handleAssessmentComplete } = useApp();

  return (
    <AssessmentView
      onComplete={handleAssessmentComplete}
      onNavigateDashboard={() => router.push('/dashboard')}
    />
  );
}
