import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  loadUserProgress,
  recordQuestionResult,
  updateWordMastery,
} from '../src/services/storageService';

// Polyfill localStorage for node environment
const storageMock: Record<string, string> = {};
beforeAll(() => {
  global.localStorage = {
    getItem: (key: string) => storageMock[key] || null,
    setItem: (key: string, value: string) => {
      storageMock[key] = value;
    },
    removeItem: (key: string) => {
      delete storageMock[key];
    },
    clear: () => {
      for (const k in storageMock) delete storageMock[k];
    },
    key: (i: number) => Object.keys(storageMock)[i] || null,
    length: 0,
  } as Storage;
});

describe('Storage & Progress Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load default user progress when localStorage is empty', () => {
    const progress = loadUserProgress();
    expect(progress.currentLevel).toBe('A1');
    expect(progress.streakDays).toBeGreaterThan(0);
    expect(progress.dailyGoalMinutes).toBe(20);
  });

  it('should record question results and adjust skill stats', () => {
    const initial = loadUserProgress();
    const updated = recordQuestionResult(
      initial,
      'test-q-1',
      true,
      'grammar',
      'test_weakness'
    );

    expect(updated.completedQuestionIds).toContain('test-q-1');
    expect(updated.skillStats.grammar).toBeGreaterThanOrEqual(initial.skillStats.grammar);
    expect(updated.minutesStudiedToday).toBe(initial.minutesStudiedToday + 1);
  });

  it('should add to weakTopics on wrong answer', () => {
    const initial = loadUserProgress();
    const updated = recordQuestionResult(
      initial,
      'test-q-2',
      false,
      'grammar',
      'conditional_clause_error',
      'ข้อผิดพลาดเรื่องประโยคเงื่อนไข'
    );

    const weakness = updated.weakTopics.find((w) => w.tag === 'conditional_clause_error');
    expect(weakness).toBeDefined();
    expect(weakness?.errorCount).toBe(1);
  });

  it('should toggle word mastery properly', () => {
    const initial = loadUserProgress();
    const withWord = updateWordMastery(initial, 'vocab-test-1', true);
    expect(withWord.masteredWordIds).toContain('vocab-test-1');

    const withoutWord = updateWordMastery(withWord, 'vocab-test-1', false);
    expect(withoutWord.masteredWordIds).not.toContain('vocab-test-1');
  });
});
