'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '../../components/views/DashboardView';
import { useApp } from '../../context/AppContext';
import { NavView } from '../../components/common/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const { progress, handleStartRemediation } = useApp();

  const handleNavigate = (view: NavView) => {
    const route = view === 'dashboard' ? '/dashboard' : view === 'mockExam' ? '/mock-exams' : `/${view}`;
    router.push(route);
  };

  return (
    <DashboardView
      progress={progress}
      onNavigate={handleNavigate}
      onStartRemediation={handleStartRemediation}
    />
  );
}
