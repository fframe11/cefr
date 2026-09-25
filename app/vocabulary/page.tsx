'use client';
import React from 'react';
import { VocabularyView } from '../../components/views/VocabularyView';
import { useApp } from '../../context/AppContext';

export default function VocabularyPage() {
  const { progress, handleToggleWordMastery } = useApp();

  return (
    <VocabularyView
      masteredWordIds={progress.masteredWordIds}
      onToggleMastery={handleToggleWordMastery}
    />
  );
}
