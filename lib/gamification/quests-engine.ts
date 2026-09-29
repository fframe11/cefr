/**
 * GLOVA DAILY QUESTS & PERSONAL BEST ENGINE
 *
 * Manages daily quest progression, cooperative study challenges,
 * and tracks individual personal best records.
 */

import { DailyQuest, PersonalBest } from '@/types/gamification';
import { recordXPEvent } from './xp-engine';
import { updateAchievementProgress } from './achievements';

// Default daily quest templates
const DAILY_QUEST_TEMPLATES = [
  {
    code: 'QUEST_VOCAB_10',
    titleEn: 'Word Collector',
    titleTh: 'สะสมคำศัพท์ 10 คำ',
    descEn: 'Learn or review 10 vocabulary items today.',
    descTh: 'เรียนรู้หรือทบทวนคำศัพท์ให้ครบ 10 คำในวันนี้',
    xpReward: 35,
    category: 'vocabulary' as const,
    maxProgress: 10,
  },
  {
    code: 'QUEST_RANKED_1',
    titleEn: 'Arena Challenger',
    titleTh: 'ลงสนามประลอง 1 แมตช์',
    descEn: 'Play at least 1 competitive ranked vocabulary match.',
    descTh: 'เข้าร่วมการแข่งขันคำศัพท์โหมดจัดอันดับอย่างน้อย 1 แมตช์',
    xpReward: 40,
    category: 'competition' as const,
    maxProgress: 1,
  },
  {
    code: 'QUEST_MISTAKE_REVIEW',
    titleEn: 'Review & Overcome',
    titleTh: 'ทบทวนจุดพลาด 5 คำ',
    descEn: 'Review 5 vocabulary mistakes in your review queue.',
    descTh: 'ทบทวนข้อผิดพลาดจากประวัติคำศัพท์ที่เคยตอบผิด 5 คำ',
    xpReward: 30,
    category: 'review' as const,
    maxProgress: 5,
  },
  {
    code: 'QUEST_STUDY_SQUAD',
    titleEn: 'Squad Power',
    titleTh: 'เรียนรู้ร่วมกับเพื่อน',
    descEn: 'Study with a friend or challenge a peer to a duel.',
    descTh: 'ส่งคำท้าประลองหรือร่วมเรียนรู้กับเพื่อนนักศึกษา 1 ครั้ง',
    xpReward: 30,
    category: 'social' as const,
    maxProgress: 1,
  },
];

// In-memory store for user daily quests & personal best
const userQuestsStore = new Map<string, { date: string; quests: DailyQuest[] }>();
const userPersonalBestStore = new Map<string, PersonalBest>();

// Default personal best record
const DEFAULT_PERSONAL_BEST: PersonalBest = {
  bestVocabularyScore: 1250,
  bestStreak: 12,
  fastestCorrectMs: 980, // 0.98 seconds
  highestRankRating: 1540, // Platinum III
  longestLearningStreakDays: 14,
  weeklyXpRecord: 2450,
};

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get active daily quests for a user (automatically resets each day)
 */
export function getUserDailyQuests(userId: string): DailyQuest[] {
  const today = getTodayString();
  const existing = userQuestsStore.get(userId);

  if (existing && existing.date === today) {
    return existing.quests;
  }

  // Generate today's quests
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const freshQuests: DailyQuest[] = DAILY_QUEST_TEMPLATES.map((tmpl, idx) => ({
    id: `dq_${today}_${tmpl.code}`,
    code: tmpl.code,
    titleEn: tmpl.titleEn,
    titleTh: tmpl.titleTh,
    descEn: tmpl.descEn,
    descTh: tmpl.descTh,
    xpReward: tmpl.xpReward,
    category: tmpl.category,
    progress: idx === 0 ? 4 : 0, // Mock initial progress for word collector
    maxProgress: tmpl.maxProgress,
    isCompleted: false,
    expiresAt: endOfDay.toISOString(),
  }));

  userQuestsStore.set(userId, { date: today, quests: freshQuests });
  return freshQuests;
}

/**
 * Increment progress on a daily quest and award XP on completion
 */
export function incrementQuestProgress(
  userId: string,
  category: 'vocabulary' | 'competition' | 'social' | 'review',
  amount: number = 1
): { updatedQuest?: DailyQuest; xpAwarded: number } {
  const quests = getUserDailyQuests(userId);
  const target = quests.find((q) => q.category === category && !q.isCompleted);

  if (!target) {
    return { xpAwarded: 0 };
  }

  target.progress = Math.min(target.maxProgress, target.progress + amount);
  let xpAwarded = 0;

  if (target.progress >= target.maxProgress && !target.isCompleted) {
    target.isCompleted = true;
    xpAwarded = target.xpReward;

    // Record verified XP event in ledger
    recordXPEvent({
      userId,
      source: 'daily_goal',
      sourceId: target.id,
      bonus: target.xpReward,
      metadata: { questCode: target.code },
    });
  }

  return { updatedQuest: { ...target }, xpAwarded };
}

/**
 * Retrieve personal best records for a user
 */
export function getUserPersonalBest(userId: string): PersonalBest {
  let pb = userPersonalBestStore.get(userId);
  if (!pb) {
    pb = { ...DEFAULT_PERSONAL_BEST };
    userPersonalBestStore.set(userId, pb);
  }
  return { ...pb };
}

/**
 * Update personal best records with new game / study performance metrics
 */
export function recordPersonalPerformance(
  userId: string,
  metrics: {
    score?: number;
    streak?: number;
    responseTimeMs?: number;
    isCorrect?: boolean;
    rating?: number;
    streakDays?: number;
    weeklyXp?: number;
  }
): { newRecords: string[] } {
  const pb = getUserPersonalBest(userId);
  const newRecords: string[] = [];

  if (metrics.score && metrics.score > pb.bestVocabularyScore) {
    pb.bestVocabularyScore = metrics.score;
    newRecords.push('bestVocabularyScore');
  }

  if (metrics.streak && metrics.streak > pb.bestStreak) {
    pb.bestStreak = metrics.streak;
    newRecords.push('bestStreak');
  }

  if (metrics.isCorrect && metrics.responseTimeMs && metrics.responseTimeMs < pb.fastestCorrectMs) {
    pb.fastestCorrectMs = metrics.responseTimeMs;
    newRecords.push('fastestCorrectMs');
    if (metrics.responseTimeMs <= 1500) {
      updateAchievementProgress(userId, 'PERSONAL_BEST', 1);
    }
  }

  if (metrics.rating && metrics.rating > pb.highestRankRating) {
    pb.highestRankRating = metrics.rating;
    newRecords.push('highestRankRating');
  }

  if (metrics.streakDays && metrics.streakDays > pb.longestLearningStreakDays) {
    pb.longestLearningStreakDays = metrics.streakDays;
    newRecords.push('longestLearningStreakDays');
  }

  if (metrics.weeklyXp && metrics.weeklyXp > pb.weeklyXpRecord) {
    pb.weeklyXpRecord = metrics.weeklyXp;
    newRecords.push('weeklyXpRecord');
  }

  userPersonalBestStore.set(userId, pb);
  return { newRecords };
}
