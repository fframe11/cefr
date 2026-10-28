'use client';
import React from 'react';
import { GrammarView } from '../../components/views/GrammarView';
import { useApp } from '../../context/AppContext';

export default function ListeningPage() {
  const { handleQuestionCompleted, remediationTopic } = useApp();

  return (
    <GrammarView
      initialSkill="listening"
      onQuestionCompleted={handleQuestionCompleted}
      activeTopicId={remediationTopic}
    />
  );
}

