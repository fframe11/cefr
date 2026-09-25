'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsView } from '../../components/views/AnalyticsView';
import { useApp } from '../../context/AppContext';
import { NavView } from '../../components/common/Sidebar';

export default function AnalyticsPage() {
  const router = useRouter();
  const { progress, handleStartRemediation } = useApp();

  const handleNavigate = (view: NavView) => {
    const route = view === 'dashboard' ? '/' : view === 'mockExam' ? '/mock-exams' : `/${view}`;
    router.push(route);
  };

  return (
    <AnalyticsView
      progress={progress}
      onNavigate={handleNavigate}
      onStartRemediation={handleStartRemediation}
    />
  );
}
