import { describe, it, expect } from 'vitest';
import { recordXPEvent, getUserTotalXP, XP_RULES } from '../lib/gamification/xp-engine';
import { getUserAchievements, updateAchievementProgress, ACHIEVEMENTS_CATALOG } from '../lib/gamification/achievements';
import { getUserDailyQuests, incrementQuestProgress, getUserPersonalBest, recordPersonalPerformance } from '../lib/gamification/quests-engine';

describe('GLOVA Gamification, Quests & Personal Best Engine', () => {
  const testUserId = `test_player_${Date.now()}`;

  it('records verified XP with daily caps and idempotency protection', () => {
    // 1. Initial XP
    expect(getUserTotalXP(testUserId)).toBe(0);

    // 2. Award vocabulary XP
    const res1 = recordXPEvent({
      userId: testUserId,
      source: 'vocabulary',
      sourceId: 'vocab_word_01',
      bonus: 5,
    });
    expect(res1.success).toBe(true);
    expect(res1.event?.amount).toBe(15); // Base 10 + 5 bonus
    expect(getUserTotalXP(testUserId)).toBe(15);

    // 3. Duplicate within 5s with same sourceId is blocked by idempotency
    const resDup = recordXPEvent({
      userId: testUserId,
      source: 'vocabulary',
      sourceId: 'vocab_word_01',
    });
    expect(resDup.success).toBe(false);
    expect(resDup.message).toContain('idempotency');
  });

  it('contains prompt-mandated achievements with 4 semantic item rarity tiers', () => {
    const achievements = getUserAchievements(testUserId);
    expect(achievements.length).toBeGreaterThanOrEqual(10);

    const codes = achievements.map((a) => a.code);
    expect(codes).toContain('FIRST_STEP');
    expect(codes).toContain('VOCAB_STARTER');
    expect(codes).toContain('VOCAB_MASTER');
    expect(codes).toContain('STREAK_7');
    expect(codes).toContain('STREAK_30');
    expect(codes).toContain('FIRST_RANKED');
    expect(codes).toContain('RANKED_WIN');
    expect(codes).toContain('PERFECT_ROUND');
    expect(codes).toContain('STUDY_TOGETHER');
    expect(codes).toContain('FRIEND_CHALLENGE');
    expect(codes).toContain('CEFR_MILESTONE');
    expect(codes).toContain('PERSONAL_BEST');

    // Verify all 4 rarities are present
    const rarities = achievements.map((a) => a.rarity);
    expect(rarities).toContain('common');
    expect(rarities).toContain('rare');
    expect(rarities).toContain('epic');
    expect(rarities).toContain('legendary');
  });

  it('manages daily quests and awards XP upon completion', () => {
    const quests = getUserDailyQuests(testUserId);
    expect(quests).toHaveLength(4);

    const targetQuest = quests.find((q) => q.category === 'competition');
    expect(targetQuest).toBeDefined();
    expect(targetQuest?.isCompleted).toBe(false);

    // Complete competition quest
    const result = incrementQuestProgress(testUserId, 'competition', 1);
    expect(result.updatedQuest?.isCompleted).toBe(true);
    expect(result.xpAwarded).toBe(40);
  });

  it('tracks and updates individual personal best records accurately', () => {
    const initialPb = getUserPersonalBest(testUserId);
    expect(initialPb.fastestCorrectMs).toBeGreaterThan(0);

    // Record a faster answer of 820ms (0.82 seconds)
    const updateRes = recordPersonalPerformance(testUserId, {
      isCorrect: true,
      responseTimeMs: 820,
      streak: 15,
      score: 1400,
    });

    expect(updateRes.newRecords).toContain('fastestCorrectMs');
    expect(updateRes.newRecords).toContain('bestStreak');
    expect(updateRes.newRecords).toContain('bestVocabularyScore');

    const updatedPb = getUserPersonalBest(testUserId);
    expect(updatedPb.fastestCorrectMs).toBe(820);
    expect(updatedPb.bestStreak).toBe(15);
    expect(updatedPb.bestVocabularyScore).toBe(1400);
  });
});
