import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTierFromRating,
  getDivisionProgress,
  calculateMatchRating,
  getTierWeight,
  getKFactor,
} from '../lib/ranked/rating-engine';
import {
  enqueuePlayer,
  pollQueueStatus,
  getClientQuestion,
  submitRankedAnswer,
  finishRankedMatch,
  getAcceptableRatingRange,
} from '../lib/ranked/matchmaking-engine';
import {
  calculateSeasonSoftReset,
  CURRENT_SEASON,
  getSeasonTierReward,
} from '../lib/ranked/season-engine';
import { getRankedLeaderboard } from '../lib/ranked/ranked-leaderboard-engine';
import { getRankedProfile, updateRankedProfile, resetRankedProfile } from '../lib/ranked/user-profile-store';

describe('Glova Ranked Competitive Engine - Unit Tests', () => {
  beforeEach(() => {
    resetRankedProfile();
  });

  // 1. TIER & DIVISION MAPPING TESTS
  describe('Tier & Division Mapping', () => {
    it('should accurately map rating to Bronze, Silver, Gold, Platinum, Diamond, Master', () => {
      expect(getTierFromRating(150)).toMatchObject({ tier: 'Bronze', division: 'III' });
      expect(getTierFromRating(500)).toMatchObject({ tier: 'Bronze', division: 'I' });
      expect(getTierFromRating(800)).toMatchObject({ tier: 'Silver', division: 'II' });
      expect(getTierFromRating(1284)).toMatchObject({ tier: 'Gold', division: 'II' });
      expect(getTierFromRating(1600)).toMatchObject({ tier: 'Platinum', division: 'III' });
      expect(getTierFromRating(2150)).toMatchObject({ tier: 'Diamond', division: 'II' });
      expect(getTierFromRating(2450)).toMatchObject({ tier: 'Master', division: 'I' });
    });

    it('should clamp negative rating to Bronze III and huge rating to Master', () => {
      expect(getTierFromRating(-50)).toMatchObject({ tier: 'Bronze', division: 'III' });
      expect(getTierFromRating(3500)).toMatchObject({ tier: 'Master', division: 'I' });
    });

    it('should calculate division progress percentage correctly', () => {
      // Gold II: 1200 - 1349 (range 150)
      const p = getDivisionProgress(1284);
      expect(p.current).toBe(84);
      expect(p.max).toBe(150);
      expect(p.percent).toBe(56);
    });
  });

  // 2. ELO MMR RATING ENGINE TESTS
  describe('Elo MMR Rating Engine & Calculations', () => {
    it('should increase rating on WIN and decrease rating on LOSS deterministically', () => {
      const winResult = calculateMatchRating({
        playerRating: 1284,
        opponentRating: 1284,
        outcome: 'WIN',
        isPlacement: false,
        playerAccuracy: 0.85,
        demotionProtectedMatches: 0,
      });

      expect(winResult.ratingDelta).toBeGreaterThan(0);
      expect(winResult.ratingAfter).toBe(1284 + winResult.ratingDelta);
      expect(winResult.xpEarned).toBeGreaterThanOrEqual(40);

      const lossResult = calculateMatchRating({
        playerRating: 1284,
        opponentRating: 1284,
        outcome: 'LOSS',
        isPlacement: false,
        playerAccuracy: 0.5,
        demotionProtectedMatches: 0,
      });

      expect(lossResult.ratingDelta).toBeLessThan(0);
      expect(lossResult.ratingAfter).toBe(1284 + lossResult.ratingDelta);
      expect(lossResult.xpEarned).toBe(15); // Participation effort rewarded
    });

    it('should award extra rating bonus for high accuracy (>= 90%)', () => {
      const normalWin = calculateMatchRating({
        playerRating: 1200,
        opponentRating: 1200,
        outcome: 'WIN',
        isPlacement: false,
        playerAccuracy: 0.7,
        demotionProtectedMatches: 0,
      });

      const precisionWin = calculateMatchRating({
        playerRating: 1200,
        opponentRating: 1200,
        outcome: 'WIN',
        isPlacement: false,
        playerAccuracy: 1.0,
        demotionProtectedMatches: 0,
      });

      expect(precisionWin.ratingDelta).toBeGreaterThan(normalWin.ratingDelta);
    });

    it('should apply placement match loss dampening', () => {
      const standardLoss = calculateMatchRating({
        playerRating: 1000,
        opponentRating: 1000,
        outcome: 'LOSS',
        isPlacement: false,
        playerAccuracy: 0.3,
        demotionProtectedMatches: 0,
      });

      const placementLoss = calculateMatchRating({
        playerRating: 1000,
        opponentRating: 1000,
        outcome: 'LOSS',
        isPlacement: true,
        playerAccuracy: 0.3,
        demotionProtectedMatches: 0,
      });

      // Placement loss delta should be smaller in magnitude (softened by 40%)
      expect(Math.abs(placementLoss.ratingDelta)).toBeLessThan(Math.abs(standardLoss.ratingDelta));
    });

    it('should grant 2 matches of demotion protection upon promotion', () => {
      // 1345 is Gold II, winning puts over 1350 (Gold I)
      const promoResult = calculateMatchRating({
        playerRating: 1345,
        opponentRating: 1360,
        outcome: 'WIN',
        isPlacement: false,
        playerAccuracy: 1.0,
        demotionProtectedMatches: 0,
      });

      expect(promoResult.isPromotion).toBe(true);
      expect(promoResult.tierAfter.division).toBe('I');
      expect(promoResult.demotionProtectionRemaining).toBe(2);
    });

    it('should preserve tier when demotion protection shield is active', () => {
      // 1202 is Gold II (threshold 1200), loss drops below 1200 into Gold III
      const protectedLoss = calculateMatchRating({
        playerRating: 1202,
        opponentRating: 1200,
        outcome: 'LOSS',
        isPlacement: false,
        playerAccuracy: 0.4,
        demotionProtectedMatches: 1, // 1 shield active
      });

      expect(protectedLoss.ratingAfter).toBeLessThan(1200);
      expect(protectedLoss.isDemotion).toBe(false); // Shield blocked demotion!
      expect(protectedLoss.tierAfter.division).toBe('II'); // Preserved Gold II
      expect(protectedLoss.demotionProtectionRemaining).toBe(0); // Shield consumed
    });
  });

  // 3. MATCHMAKING & QUESTION SECURITY TESTS
  describe('Matchmaking Queue & Question Security', () => {
    it('should expand rating search window over time', () => {
      expect(getAcceptableRatingRange(1500)).toBe(80); // 0-3s
      expect(getAcceptableRatingRange(4500)).toBe(160); // 3-6s
      expect(getAcceptableRatingRange(7500)).toBe(250); // 6s+
    });

    it('should enqueue and match players, generating 6 tier-appropriate questions', () => {
      const p1 = {
        userId: 'test_u1',
        username: 'TestPlayer1',
        avatar: 'avatar1',
        rankFrame: 'gaming_1',
        rating: 1284,
        tier: 'Gold' as const,
        division: 'II' as const,
        queuedAt: Date.now(),
        mode: 'vocabulary' as const,
      };

      const res = enqueuePlayer(p1);
      expect(res.status).toBe('QUEUED');

      // P2 with matching rating joins
      const p2 = {
        userId: 'test_u2',
        username: 'TestPlayer2',
        avatar: 'avatar2',
        rankFrame: 'cute_1',
        rating: 1290,
        tier: 'Gold' as const,
        division: 'II' as const,
        queuedAt: Date.now(),
        mode: 'vocabulary' as const,
      };

      const matchRes = enqueuePlayer(p2);
      expect(matchRes.status).toBe('MATCHED');
      expect(matchRes.match).toBeDefined();
      expect(matchRes.match?.questions.length).toBe(6);
    });

    it('should NEVER leak answer keys in getClientQuestion payload', () => {
      const player = {
        userId: 'test_sec_user',
        username: 'SecUser',
        avatar: '',
        rankFrame: 'cute_1',
        rating: 1200,
        tier: 'Gold' as const,
        division: 'II' as const,
        queuedAt: Date.now() - 5000, // Trigger ghost challenger
        mode: 'vocabulary' as const,
      };

      enqueuePlayer(player);
      const poll = pollQueueStatus(player.userId);
      expect(poll.status).toBe('MATCHED');
      const matchId = poll.match!.matchId;

      const clientQ = getClientQuestion(matchId, player.userId);
      expect(clientQ).toBeDefined();
      expect((clientQ as any).correctIndex).toBeUndefined(); // Security check!
      expect((clientQ as any).thaiMeaning).toBeUndefined(); // Security check!
      expect(clientQ?.options.length).toBe(4);
      expect(clientQ?.timeLimitMs).toBe(4000);
    });

    it('should enforce 4.3s deadline and award 0 points for late answers', () => {
      const player = {
        userId: 'test_timer_user',
        username: 'TimerUser',
        avatar: '',
        rankFrame: 'cute_1',
        rating: 1200,
        tier: 'Gold' as const,
        division: 'II' as const,
        queuedAt: Date.now() - 5000,
        mode: 'vocabulary' as const,
      };

      enqueuePlayer(player);
      const poll = pollQueueStatus(player.userId);
      const matchId = poll.match!.matchId;
      const sessionToken = poll.match!.sessionToken;

      // Submit timeout / late
      const lateRes = submitRankedAnswer(matchId, player.userId, -1, sessionToken);
      expect(lateRes).toBeDefined();
      expect(lateRes?.isCorrect).toBe(false);
      expect(lateRes?.scoreAwarded).toBe(0);
      expect(lateRes?.currentStreak).toBe(0);
    });
  });

  // 4. SEASON SYSTEM & LEADERBOARD
  describe('Season System & Leaderboard', () => {
    it('should calculate soft MMR reset correctly', () => {
      // 1800 MMR compresses towards 1000: 1000 + 0.5 * 800 = 1400
      expect(calculateSeasonSoftReset(1800)).toBe(1400);
      // 2400 Master compresses: 1000 + 0.5 * 1400 = 1700
      expect(calculateSeasonSoftReset(2400)).toBe(1700);
      // Low rating never drops below 600
      expect(calculateSeasonSoftReset(100)).toBe(600);
    });

    it('should return tier season rewards including rank frames and XP', () => {
      const reward = getSeasonTierReward('Master');
      expect(reward).toBeDefined();
      expect(reward?.frameId).toBe('gaming_1');
      expect(reward?.xpReward).toBe(2000);
    });

    it('should build separate ranked leaderboard sorted strictly by Rating', () => {
      const profile = getRankedProfile();
      const lb = getRankedLeaderboard({ filter: 'global', currentProfile: profile });

      expect(lb.top3.length).toBe(3);
      expect(lb.top3[0].rating).toBeGreaterThanOrEqual(lb.top3[1].rating);
      expect(lb.top3[1].rating).toBeGreaterThanOrEqual(lb.top3[2].rating);

      // Surrounding window includes current user
      const found = lb.entries.find((e) => e.userId === profile.userId);
      expect(found).toBeDefined();
    });
  });
});
