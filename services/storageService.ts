import { UserProgressState, CEFRLevel, CambridgeExamCode, SkillType } from '../types';

const STORAGE_KEY = 'cefr_platform_progress_v1';

export const DEFAULT_STATE: UserProgressState = {
  currentLevel: 'A1',
  estimatedCambridgeScore: 110,
  streakDays: 3,
  dailyGoalMinutes: 20,
  minutesStudiedToday: 12,
  skillStats: {
    vocabulary: 65,
    grammar: 70,
    reading: 60,
    listening: 55,
    writing: 50,
    speaking: 45,
  },
  completedQuestionIds: [],
  masteredWordIds: ['vocab-a1-1', 'vocab-a1-2'],
  weakTopics: [
    { tag: 'present_perfect_vs_past_simple', labelTh: 'Past Simple vs. Present Perfect: อดีตจบแล้ว vs ยังส่งผลถึงปัจจุบัน', errorCount: 2, lastFailedAt: new Date().toISOString() },
    { tag: 'prepositions_of_time', labelTh: 'การใช้คำบุพบทบอกเวลา: in, on, at', errorCount: 1, lastFailedAt: new Date().toISOString() },
  ],
  assessmentCompleted: false,
  targetExam: 'PET',
};

const getLocalStorage = (): Storage | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // SSR or restricted iframe
  }
  return null;
};

export function loadUserProgress(): UserProgressState {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_STATE;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    console.warn('Failed to load user progress from localStorage:', err);
    return DEFAULT_STATE;
  }
}

export function saveUserProgress(state: UserProgressState): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save user progress to localStorage:', err);
  }
}

export function recordQuestionResult(
  state: UserProgressState,
  questionId: string,
  isCorrect: boolean,
  skill: SkillType,
  weaknessTag: string,
  labelTh?: string
): UserProgressState {
  const updatedIds = state.completedQuestionIds.includes(questionId)
    ? state.completedQuestionIds
    : [...state.completedQuestionIds, questionId];

  // Adjust skill proficiency slightly
  const currentSkillScore = state.skillStats[skill] || 50;
  const delta = isCorrect ? 2 : -1;
  const newSkillScore = Math.max(10, Math.min(100, currentSkillScore + delta));

  // Update weakness list
  let updatedWeaknesses = [...state.weakTopics];
  if (!isCorrect && weaknessTag) {
    const existingIndex = updatedWeaknesses.findIndex((w) => w.tag === weaknessTag);
    if (existingIndex >= 0) {
      updatedWeaknesses[existingIndex].errorCount += 1;
      updatedWeaknesses[existingIndex].lastFailedAt = new Date().toISOString();
    } else {
      updatedWeaknesses.push({
        tag: weaknessTag,
        labelTh: labelTh || weaknessTag.replace(/_/g, ' '),
        errorCount: 1,
        lastFailedAt: new Date().toISOString(),
      });
    }
  } else if (isCorrect && weaknessTag) {
    // If answered correctly, gradually decrement weakness counter
    const existingIndex = updatedWeaknesses.findIndex((w) => w.tag === weaknessTag);
    if (existingIndex >= 0) {
      if (updatedWeaknesses[existingIndex].errorCount > 1) {
        updatedWeaknesses[existingIndex].errorCount -= 1;
      } else {
        updatedWeaknesses.splice(existingIndex, 1);
      }
    }
  }

  const newState: UserProgressState = {
    ...state,
    completedQuestionIds: updatedIds,
    skillStats: {
      ...state.skillStats,
      [skill]: newSkillScore,
    },
    weakTopics: updatedWeaknesses,
    minutesStudiedToday: state.minutesStudiedToday + 1,
  };

  saveUserProgress(newState);
  return newState;
}

export function updateWordMastery(
  state: UserProgressState,
  wordId: string,
  isMastered: boolean
): UserProgressState {
  const exists = state.masteredWordIds.includes(wordId);
  let newMastered = [...state.masteredWordIds];

  if (isMastered && !exists) {
    newMastered.push(wordId);
  } else if (!isMastered && exists) {
    newMastered = newMastered.filter((id) => id !== wordId);
  }

  const newState: UserProgressState = {
    ...state,
    masteredWordIds: newMastered,
  };
  saveUserProgress(newState);
  return newState;
}

const GUEST_ATTEMPTS_STORAGE_KEY = 'cefr_platform_guest_attempts_v1';

export interface StoredGuestAttempt {
  client_attempt_id: string;
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
  context_type?: 'practice' | 'placement';
  attempted_at?: string;
}

export function loadGuestAttempts(): StoredGuestAttempt[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(GUEST_ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load guest attempts from localStorage:', err);
    return [];
  }
}

export function saveGuestAttempt(attempt: StoredGuestAttempt): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    const current = loadGuestAttempts();
    const updated = [...current, attempt].slice(-100);
    storage.setItem(GUEST_ATTEMPTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save guest attempt to localStorage:', err);
  }
}

export function clearGuestAttempts(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(GUEST_ATTEMPTS_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear guest attempts from localStorage:', err);
  }
}
