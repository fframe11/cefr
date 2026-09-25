import React, { useState, useEffect, useCallback } from 'react';
import {
  loadUserProgress,
  saveUserProgress,
  recordQuestionResult,
  updateWordMastery,
  loadGuestAttempts,
  saveGuestAttempt,
  clearGuestAttempts,
} from './services/storageService';
import { UserProgressState } from './types';
import { Header } from './components/common/Header';
import { Sidebar, NavView } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ToastProvider, useToast } from './components/common/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileModal } from './components/common/ProfileModal';

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

import { getUserProgress } from './lib/api/progress';
import { getUserWeaknesses } from './lib/api/weaknesses';
import { updateVocabularyMastery } from './lib/api/vocabulary-mastery';
import { syncGuestProgress } from './lib/api/guest-sync';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();
  const { status, user, profile, refreshProfile } = useAuth();
  const [progress, setProgress] = useState<UserProgressState>(loadUserProgress);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [remediationTopic, setRemediationTopic] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Function to load canonical progress from API when authenticated
  const loadCanonicalProgress = useCallback(async () => {
    try {
      const serverData = await getUserProgress();
      const weaknessesData = await getUserWeaknesses({ limit: 10 }).catch(() => null);

      setProgress((prev) => ({
        ...prev,
        currentLevel: serverData.profile.current_cefr_level || prev.currentLevel,
        targetExam: serverData.profile.target_exam || prev.targetExam,
        estimatedCambridgeScore:
          serverData.profile.estimated_cambridge_score || prev.estimatedCambridgeScore,
        streakDays: serverData.profile.streak_days ?? prev.streakDays,
        dailyGoalMinutes: serverData.profile.daily_goal_minutes || prev.dailyGoalMinutes,
        assessmentCompleted:
          serverData.profile.assessment_completed ?? prev.assessmentCompleted,
        skillStats: {
          vocabulary:
            serverData.skills?.vocabulary?.proficiency_score ?? prev.skillStats.vocabulary,
          grammar: serverData.skills?.grammar?.proficiency_score ?? prev.skillStats.grammar,
          reading: serverData.skills?.reading?.proficiency_score ?? prev.skillStats.reading,
          listening:
            serverData.skills?.listening?.proficiency_score ?? prev.skillStats.listening,
          writing: serverData.skills?.writing?.proficiency_score ?? prev.skillStats.writing,
          speaking:
            serverData.skills?.speaking?.proficiency_score ?? prev.skillStats.speaking,
        },
        weakTopics:
          weaknessesData?.weaknesses?.map((w) => ({
            tag: w.weakness_tag,
            labelTh: w.weakness_tag.replace(/_/g, ' '),
            errorCount: w.error_count,
            lastFailedAt: w.last_failed_at,
          })) || prev.weakTopics,
      }));
    } catch (err) {
      console.warn('[App] Failed to load canonical user progress from server:', err);
    }
  }, []);

  // When user is authenticated: Sync guest attempts if any, then load canonical progress
  useEffect(() => {
    if (status === 'authenticated') {
      const guestAttempts = loadGuestAttempts();
      if (guestAttempts.length > 0) {
        syncGuestProgress({ practice_attempts: guestAttempts })
          .then((syncRes) => {
            clearGuestAttempts();
            showToast(
              'ซิงค์ประวัติการเรียนสำเร็จ',
              `อัปเดตสถิติ ${syncRes.synced_count} รายการลงในบัญชีของคุณแล้ว`,
              'success'
            );
            return loadCanonicalProgress();
          })
          .catch((syncErr) => {
            console.error('[App] Guest sync failed:', syncErr);
            showToast(
              'ไม่สามารถซิงค์ประวัติการเรียนแบบผู้เยี่ยมชมได้',
              'ระบบเก็บข้อมูลไว้ในเครื่องเพื่อลองใหม่อีกครั้งในภายหลัง',
              'info'
            );
            loadCanonicalProgress();
          });
      } else {
        loadCanonicalProgress();
      }
    }
  }, [status, loadCanonicalProgress, showToast]);

  // Synchronize server profile into progress state if profile changes
  useEffect(() => {
    if (profile) {
      setProgress((prev) => ({
        ...prev,
        targetExam: profile.target_exam,
        dailyGoalMinutes: profile.daily_goal_minutes,
        currentLevel: profile.current_cefr_level,
        streakDays: profile.streak_days,
        estimatedCambridgeScore: profile.estimated_cambridge_score,
        assessmentCompleted: profile.assessment_completed,
      }));
    }
  }, [profile]);

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
    if (status === 'authenticated') {
      // In authenticated mode, server is updated via practice submission; refresh progress
      loadCanonicalProgress();
    } else {
      // In guest mode, record locally and queue for guest sync
      const updated = recordQuestionResult(
        progress,
        questionId,
        isCorrect,
        'grammar',
        weaknessTag
      );
      setProgress(updated);
      saveGuestAttempt({
        client_attempt_id: `guest-${questionId}-${Date.now()}`,
        question_id: questionId,
        time_spent_seconds: 15,
        context_type: 'practice',
        attempted_at: new Date().toISOString(),
      });
    }

    if (isCorrect) {
      showToast('เยี่ยมมาก! ตอบถูกต้อง', 'ทักษะของคุณพัฒนาขึ้น', 'success');
    } else {
      showToast('ข้อนี้ยังไม่ถูกต้อง', 'บันทึกจุดอ่อนลงในระบบวิเคราะห์แล้ว', 'info');
    }
  };

  const handleToggleWordMastery = async (wordId: string, isMastered: boolean) => {
    if (status === 'authenticated') {
      try {
        await updateVocabularyMastery({ vocabulary_id: wordId, is_correct: isMastered });
        loadCanonicalProgress();
      } catch (err) {
        console.warn('[App] Failed to update vocabulary mastery via API:', err);
      }
    }

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
    if (status !== 'authenticated') {
      saveUserProgress(updated);
    } else {
      // Refresh profile and canonical progress
      refreshProfile();
      loadCanonicalProgress();
    }
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
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isAuthenticated={status === 'authenticated'}
        userEmail={user?.email || null}
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

      {/* User Profile & Authentication Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentLocalTargetExam={progress.targetExam}
        currentLocalDailyGoal={progress.dailyGoalMinutes}
        onProfileUpdated={({ targetExam, dailyGoalMinutes }) => {
          const updated: UserProgressState = {
            ...progress,
            targetExam,
            dailyGoalMinutes,
          };
          setProgress(updated);
          if (status !== 'authenticated') {
            saveUserProgress(updated);
          }
          showToast('บันทึกการตั้งค่าเป้าหมายเรียบร้อย', `เป้าหมาย: ${targetExam}, ${dailyGoalMinutes} นาที/วัน`, 'success');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
