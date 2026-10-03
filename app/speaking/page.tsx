'use client';
import React from 'react';
import { GrammarView } from '../../components/views/GrammarView';
import { useApp } from '../../context/AppContext';

export default function SpeakingPage() {
  const { handleQuestionCompleted, remediationTopic } = useApp();

  return (
    <GrammarView
      initialSkill="speaking"
      onQuestionCompleted={handleQuestionCompleted}
      activeTopicId={remediationTopic}
    />
  );
}
