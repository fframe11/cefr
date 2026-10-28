'use client';
import React from 'react';
import { GrammarView } from '../../components/views/GrammarView';
import { useApp } from '../../context/AppContext';

export default function VocabularyPage() {
  const { handleQuestionCompleted, remediationTopic } = useApp();

  return (
    <GrammarView
      initialSkill="vocabulary"
      onQuestionCompleted={handleQuestionCompleted}
      activeTopicId={remediationTopic}
    />
  );
}

