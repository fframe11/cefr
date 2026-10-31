'use client';
import React from 'react';
import { ListeningView } from '../../components/views/ListeningView';
import { useApp } from '../../context/AppContext';

export default function ListeningPage() {
  const { handleQuestionCompleted } = useApp();

  return (
    <ListeningView
      onQuestionCompleted={handleQuestionCompleted}
    />
  );
}
