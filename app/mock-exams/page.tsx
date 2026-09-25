'use client';
import React from 'react';
import { MockExamView } from '../../components/views/MockExamView';
import { useApp } from '../../context/AppContext';

export default function MockExamsPage() {
  const { handleExamSubmitted, setIsProfileModalOpen } = useApp();

  return (
    <MockExamView
      onExamSubmitted={handleExamSubmitted}
      onOpenProfile={() => setIsProfileModalOpen(true)}
    />
  );
}
