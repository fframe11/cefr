'use client';
import React from 'react';
import { ReadingView } from '../../components/views/ReadingView';
import { useApp } from '../../context/AppContext';

export default function ReadingPage() {
  const { handleQuestionCompleted } = useApp();

  return <ReadingView onQuestionCompleted={handleQuestionCompleted} />;
}
