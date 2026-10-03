'use client';
import React from 'react';
import { GrammarView } from '../../components/views/GrammarView';
import { useApp } from '../../context/AppContext';

export default function ReadingPage() {
  const { handleQuestionCompleted, remediationTopic } = useApp();

  return (
    <GrammarView
      initialSkill="reading"
      onQuestionCompleted={handleQuestionCompleted}
      activeTopicId={remediationTopic}
    />
  );
}
