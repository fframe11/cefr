import React, { useState, useEffect } from 'react';
import {
  loadUserProgress,
  saveUserProgress,
  recordQuestionResult,
  updateWordMastery,
} from './services/storageService';
import { UserProgressState } from './types';
import { Header } from './components/common/Header';
import { Sidebar, NavView } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ToastProvider, useToast } from './components/common/Toast';

import { DashboardView } from './components/views/DashboardView';
import { AssessmentView } from './components/views/AssessmentView';
import { VocabularyView } from './components/views/VocabularyView';
import { GrammarView } from './components/views/GrammarView';
import { ReadingView } from './components/views/ReadingView';
import { ListeningView } from './components/views/ListeningView';
import { WritingView } from './components/views/WritingView';
import { SpeakingView } from './components/views/SpeakingView';
import { MockExamView } from './components/views/MockExamView';
import { AnalyticsView } from './components/views/AnalyticsView';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();
  const [progress, setProgress] = useState<UserProgressState>(loadUserProgress);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [remediationTopic, setRemediationTopic] = useState<string | undefined>(undefined);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleQuestionCompleted = (
    questionId: string,
    isCorrect: boolean,
    weaknessTag: string
  ) => {
    const updated = recordQuestionResult(
      progress,
      questionId,
      isCorrect,
      'grammar',
      weaknessTag
    );
    setProgress(updated);
    if (isCorrect) {
      showToast('เยี่ยมมาก! ตอบถูกต้อง', 'ทักษะของคุณพัฒนาขึ้น', 'success');
    } else {
      showToast('ข้อนี้ยังไม่ถูกต้อง', 'บันทึกจุดอ่อนลงในระบบวิเคราะห์แล้ว', 'info');
    }
  };

  const handleToggleWordMastery = (wordId: string, isMastered: boolean) => {
    const updated = updateWordMastery(progress, wordId, isMastered);
    setProgress(updated);
    showToast(
      isMastered ? 'บันทึกคำศัพท์เป็น "จำได้แล้ว"' : 'ปรับสถานะคำศัพท์เป็น "ยังไม่จำ"',
      '',
      isMastered ? 'success' : 'info'
    );
  };

  const handleAssessmentComplete = (updatedData: Partial<UserProgressState>) => {
    const updated: UserProgressState = {
      ...progress,
      ...updatedData,
    };
    setProgress(updated);
    saveUserProgress(updated);
    showToast('ปรับปรุงข้อมูลระดับ CEFR เรียบร้อยแล้ว', `ระดับของคุณคือ ${updated.currentLevel}`, 'success');
  };

  const handleStartRemediation = (weakTag: string) => {
    setRemediationTopic(weakTag);
    setCurrentView('grammar');
    showToast('เข้าสู่โหมดซ่อมจุดอ่อน', 'ฝึกทำแบบฝึกหัดที่ตรงกับข้อผิดพลาดของคุณ', 'info');
  };

  const handleExamSubmitted = (score: number) => {
    const updated: UserProgressState = {
      ...progress,
      estimatedCambridgeScore: Math.round((progress.estimatedCambridgeScore + score) / 2),
      minutesStudiedToday: progress.minutesStudiedToday + 30,
    };
    setProgress(updated);
    saveUserProgress(updated);
    showToast('บันทึกผลสอบ Cambridge แล้ว', `คะแนนเทียบเคียงใหม่: ${updated.estimatedCambridgeScore}`, 'success');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Top Universal Header */}
      <Header
        currentLevel={progress.currentLevel}
        streakDays={progress.streakDays}
        minutesStudiedToday={progress.minutesStudiedToday}
        dailyGoalMinutes={progress.dailyGoalMinutes}
        targetExam={progress.targetExam}
        onRetakeAssessment={() => setCurrentView('assessment')}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop / Tablet Sidebar (>= 768px) */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          assessmentCompleted={progress.assessmentCompleted}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden pb-24 md:pb-8">
          {currentView === 'dashboard' && (
            <DashboardView
              progress={progress}
              onNavigate={setCurrentView}
              onStartRemediation={handleStartRemediation}
            />
          )}

          {currentView === 'assessment' && (
            <AssessmentView
              onComplete={handleAssessmentComplete}
              onNavigateDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'vocabulary' && (
            <VocabularyView
              masteredWordIds={progress.masteredWordIds}
              onToggleMastery={handleToggleWordMastery}
            />
          )}

          {currentView === 'grammar' && (
            <GrammarView
              onQuestionCompleted={handleQuestionCompleted}
              activeTopicId={remediationTopic}
            />
          )}

          {currentView === 'reading' && (
            <ReadingView onQuestionCompleted={handleQuestionCompleted} />
          )}

          {currentView === 'listening' && (
            <ListeningView onQuestionCompleted={handleQuestionCompleted} />
          )}

          {currentView === 'writing' && <WritingView />}

          {currentView === 'speaking' && <SpeakingView />}

          {currentView === 'mockExam' && (
            <MockExamView onExamSubmitted={handleExamSubmitted} />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              progress={progress}
              onNavigate={setCurrentView}
              onStartRemediation={handleStartRemediation}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileBottomNav currentView={currentView} onSelectView={setCurrentView} />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
