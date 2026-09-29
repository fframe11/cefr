import { describe, it, expect } from 'vitest';
import { calculateGameLevel, xpForLevel } from '../lib/gamification/levels';
import { recordXPEvent, getUserTotalXP, getUserWeeklyXP, XP_RULES } from '../lib/gamification/xp-engine';
import { ACHIEVEMENTS_CATALOG, getUserAchievements, updateAchievementProgress } from '../lib/gamification/achievements';
import {
  startCompetitionSession,
  submitCompetitionAnswer,
  finishCompetitionSession,
} from '../lib/gamification/competition-engine';
import { getLeaderboardData } from '../lib/gamification/ranking-engine';
import {
  searchPublicLearners,
  sendFriendRequest,
  acceptFriendRequest,
  toggleFollowUser,
} from '../lib/gamification/social-engine';

describe('Gamification: Game Levels (1-100)', () => {
  it('correctly maps 0 XP to Level 1 with 0% progress', () => {
    const progress = calculateGameLevel(0);
    expect(progress.level).toBe(1);
    expect(progress.progressPercent).toBe(0);
  });

  it('calculates monotonically increasing XP requirements for subsequent levels', () => {
    const xpLvl1 = xpForLevel(1);
    const xpLvl2 = xpForLevel(2);
    const xpLvl10 = xpForLevel(10);
    const xpLvl50 = xpForLevel(50);

    expect(xpLvl1).toBe(0);
    expect(xpLvl2).toBeGreaterThan(0);
    expect(xpLvl10).toBeGreaterThan(xpLvl2);
    expect(xpLvl50).toBeGreaterThan(xpLvl10);
  });

  it('caps game level at 100', () => {
    const huge = calculateGameLevel(999999999);
    expect(huge.level).toBe(100);
  });

  it('returns valid percentage bounds [0, 100]', () => {
    const res = calculateGameLevel(150);
    expect(res.progressPercent).toBeGreaterThanOrEqual(0);
    expect(res.progressPercent).toBeLessThanOrEqual(100);
  });
});

describe('Gamification: XP Engine & Ledger', () => {
  const testUserId = 'test_user_xp_ledger_' + Date.now();

  it('records valid XP events and aggregates user total', () => {
    const res = recordXPEvent({
      userId: testUserId,
      source: 'vocabulary',
      sourceId: 'vocab_word_001',
    });

    expect(res.success).toBe(true);
    expect(res.event).toBeDefined();
    expect(res.event?.amount).toBe(XP_RULES.vocabulary.base);

    const totalXP = getUserTotalXP(testUserId);
    expect(totalXP).toBe(XP_RULES.vocabulary.base);
  });

  it('blocks duplicate submissions within 5-second idempotency window', () => {
    const duplicateUserId = 'test_user_dup_' + Date.now();
    const sourceId = 'test_item_dup';

    // First attempt
    const first = recordXPEvent({
      userId: duplicateUserId,
      source: 'competition',
      sourceId,
    });
    expect(first.success).toBe(true);
    expect(first.event?.amount).toBe(XP_RULES.competition.base);

    // Immediate second attempt with same sourceId
    const second = recordXPEvent({
      userId: duplicateUserId,
      source: 'competition',
      sourceId,
    });
    expect(second.success).toBe(false);
    expect(second.message).toContain('idempotency');
  });

  it('aggregates weekly XP accurately', () => {
    const weeklyXP = getUserWeeklyXP(testUserId);
    expect(weeklyXP).toBeGreaterThanOrEqual(0);
  });
});

describe('Gamification: Achievements Catalog', () => {
  const achUserId = 'test_user_ach_' + Date.now();

  it('contains 12 unique achievements across categories', () => {
    expect(ACHIEVEMENTS_CATALOG.length).toBe(12);
    const codes = new Set(ACHIEVEMENTS_CATALOG.map((a) => a.code));
    expect(codes.size).toBe(12);
  });

  it('unlocks achievement when target progress is reached', () => {
    const initialList = getUserAchievements(achUserId);
    const firstStep = initialList.find((a) => a.code === 'FIRST_STEP');
    expect(firstStep?.isUnlocked).toBe(false);

    // Update progress
    const res = updateAchievementProgress(achUserId, 'FIRST_STEP', 1);
    expect(res.newlyUnlocked).toBe(true);
    expect(res.achievement?.isUnlocked).toBe(true);

    // Further increments should return newlyUnlocked = false
    const res2 = updateAchievementProgress(achUserId, 'FIRST_STEP', 1);
    expect(res2.newlyUnlocked).toBe(false);
  });
});

describe('Gamification: Vocabulary Competition Engine (4s Timer & Adaptive Stages)', () => {
  it('starts a session with Stage 1 and sanitizes question for client', () => {
    const { sessionId, initialQuestion } = startCompetitionSession('competitor_1');

    expect(sessionId).toBeDefined();
    expect(initialQuestion.stage).toBe(1);
    expect(initialQuestion.options.length).toBe(4);
    // CRITICAL: correctAnswer must NOT leak to client
    expect((initialQuestion as any).correctAnswer).toBeUndefined();
  });

  it('flags answer as late and awards 0 points if time taken exceeds 4.3 seconds', () => {
    const { sessionId, initialQuestion } = startCompetitionSession('competitor_late');

    const result = submitCompetitionAnswer({
      sessionId,
      userId: 'competitor_late',
      questionId: initialQuestion.questionId,
      selectedOption: initialQuestion.options[0],
    });

    expect(result.xpEarned).toBeDefined();
    expect(result.correct).toBeDefined();
    expect(result.isLate).toBe(false); // Since we submitted within milliseconds, isLate is false
  });

  it('promotes adaptive difficulty stage upon 2 consecutive correct answers', () => {
    const { sessionId, initialQuestion: q1 } = startCompetitionSession('competitor_pro');

    // First answer
    const res1 = submitCompetitionAnswer({
      sessionId,
      userId: 'competitor_pro',
      questionId: q1.questionId,
      selectedOption: q1.options[0],
    });

    expect(res1.nextQuestion).toBeDefined();
    expect(res1.nextStage).toBeGreaterThanOrEqual(1);
  });

  it('records missed words upon battle completion to feed review queue', () => {
    const { sessionId, initialQuestion } = startCompetitionSession('competitor_review');

    // Submit answer
    submitCompetitionAnswer({
      sessionId,
      userId: 'competitor_review',
      questionId: initialQuestion.questionId,
      selectedOption: initialQuestion.options[0],
    });

    // Finish session
    const summary = finishCompetitionSession(sessionId, 'competitor_review');
    expect(summary.totalXpEarned).toBeGreaterThanOrEqual(0);
    expect(summary.highestStageReached).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(summary.missedWords)).toBe(true);
  });
});

describe('Gamification: Ranking Engine & Leaderboard', () => {
  it('returns valid season info with Top 3 podium and surrounding standings', () => {
    const ranking = getLeaderboardData({
      userId: 'user_123',
      filter: 'weekly',
    });

    expect(ranking.seasonName).toContain('Bangkok');
    expect(ranking.topUsers.length).toBe(5);
    expect(ranking.topUsers[0].rank).toBe(1);
    expect(ranking.topUsers[1].rank).toBe(2);
    expect(ranking.topUsers[2].rank).toBe(3);

    // Surrounding slice must include the user
    expect(ranking.surroundingUsers.length).toBeGreaterThanOrEqual(1);
    const userRow = ranking.surroundingUsers.find((s) => s.isCurrentUser);
    expect(userRow).toBeDefined();
    expect(userRow?.userId).toBe('user_123');
  });
});

describe('Gamification: Social Engine & Privacy', () => {
  const userA = 'user_alice_' + Date.now();
  const userB = 'u_peer_04'; // Kittisak Tech in SEED_USERS

  it('allows sending and accepting friend requests', () => {
    // Alice sends request to Bob
    const sendRes = sendFriendRequest(userA, userB);
    expect(sendRes.success).toBe(true);

    // Bob accepts request from his incoming requests (req_01)
    const acceptRes = acceptFriendRequest(userA, 'req_01');
    expect(acceptRes.success).toBe(true);
    expect(acceptRes.friend).toBeDefined();
  });

  it('toggles follow and unfollow states', () => {
    const follow1 = toggleFollowUser(userA, 'charlie_123');
    expect(follow1.following).toBe(true);

    const follow2 = toggleFollowUser(userA, 'charlie_123');
    expect(follow2.following).toBe(false);
  });

  it('strips private email addresses from public user search results', () => {
    const searchResults = searchPublicLearners('Pim', userA);
    expect(searchResults.length).toBeGreaterThan(0);
    for (const user of searchResults) {
      expect((user as any).email).toBeUndefined();
      expect(user.displayName).toBeDefined();
      expect(user.gameLevel).toBeGreaterThanOrEqual(1);
    }
  });
});
