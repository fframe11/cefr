'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  DEFAULT_STATE,
  loadUserProgress,
  saveUserProgress,
  recordQuestionResult,
  updateWordMastery,
  loadGuestAttempts,
  saveGuestAttempt,
  clearGuestAttempts,
} from '../services/storageService';
import { UserProgressState } from '../types';
import { useToast } from '../components/common/Toast';
import { useAuth } from './AuthContext';
import { getUserProgress } from '../lib/api/progress';
import { getUserWeaknesses } from '../lib/api/weaknesses';
import { updateVocabularyMastery } from '../lib/api/vocabulary-mastery';
import { syncGuestProgress } from '../lib/api/guest-sync';
import { useRouter } from 'next/navigation';

export interface AppContextType {
  progress: UserProgressState;
  setProgress: React.Dispatch<React.SetStateAction<UserProgressState>>;
  isDark: boolean;
  toggleTheme: () => void;
  remediationTopic?: string;
  setRemediationTopic: (topic?: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  handleQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
  handleToggleWordMastery: (wordId: string, isMastered: boolean) => Promise<void>;
  handleAssessmentComplete: (updatedData: Partial<UserProgressState>) => void;
  handleStartRemediation: (weakTag: string) => void;
  handleExamSubmitted: (score: number) => void;
  loadCanonicalProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { status, profile, refreshProfile } = useAuth();
  const [progress, setProgress] = useState<UserProgressState>(DEFAULT_STATE);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [remediationTopic, setRemediationTopic] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const local = loadUserProgress();
    setProgress(local);
  }, []);

  // Load canonical progress from API when authenticated
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
      console.warn('[AppContext] Failed to load canonical user progress from server:', err);
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
            console.error('[AppContext] Guest sync failed:', syncErr);
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

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleQuestionCompleted = (
    questionId: string,
    isCorrect: boolean,
    weaknessTag: string
  ) => {
    if (status === 'authenticated') {
      loadCanonicalProgress();
    } else {
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
        console.warn('[AppContext] Failed to update vocabulary mastery via API:', err);
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
      refreshProfile();
      loadCanonicalProgress();
    }
    showToast('ปรับปรุงข้อมูลระดับ CEFR เรียบร้อยแล้ว', `ระดับของคุณคือ ${updated.currentLevel}`, 'success');
    router.push('/');
  };

  const handleStartRemediation = (weakTag: string) => {
    setRemediationTopic(weakTag);
    showToast('เข้าสู่โหมดซ่อมจุดอ่อน', 'ฝึกทำแบบฝึกหัดที่ตรงกับข้อผิดพลาดของคุณ', 'info');
    router.push('/grammar');
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
    <AppContext.Provider
      value={{
        progress,
        setProgress,
        isDark,
        toggleTheme,
        remediationTopic,
        setRemediationTopic,
        isProfileModalOpen,
        setIsProfileModalOpen,
        handleQuestionCompleted,
        handleToggleWordMastery,
        handleAssessmentComplete,
        handleStartRemediation,
        handleExamSubmitted,
        loadCanonicalProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
