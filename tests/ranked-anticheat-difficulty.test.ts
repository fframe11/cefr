import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueuePlayer,
  getClientQuestion,
  submitRankedAnswer,
  finishRankedMatch,
  resetRankedEngineState,
} from '../lib/ranked/matchmaking-engine';
import { MatchmakingQueueEntry, RankedProfile } from '../types/ranked';

describe('Ranked Mode Anti-Cheat & Progressive Difficulty', () => {
  beforeEach(() => {
    resetRankedEngineState();
  });

  const createDummyPlayer = (
    userId: string,
    tier: any = 'Gold',
    rating = 1500
  ): MatchmakingQueueEntry => ({
    userId,
    username: `User_${userId}`,
    avatar: 'avatar_1',
    rankFrame: 'frame_gold',
    rating,
    tier,
    division: 'II',
    queuedAt: Date.now() - 5000, // Trigger auto-challenger matchmaking
    mode: 'vocabulary',
  });

  const createDummyProfile = (userId: string, rating = 1500): RankedProfile => ({
    userId,
    username: `User_${userId}`,
    avatar: 'avatar_1',
    rankFrame: 'frame_gold',
    rating,
    tier: 'Gold',
    division: 'II',
    peakRating: rating,
    peakTier: 'Gold',
    peakDivision: 'II',
    seasonId: 'season_1_2026',
    placementMatchesPlayed: 5,
    placementRequired: 5,
    isPlaced: true,
    wins: 10,
    losses: 5,
    draws: 1,
    streak: 2,
    demotionProtectedMatches: 0,
  });

  it('generates progressive difficulty questions across the 6 match questions', () => {
    const p1 = createDummyPlayer('p_diff_1', 'Gold', 1500);
    // Enqueue player, then wait or poll
    const result = enqueuePlayer(p1);
    expect(result.status).toBe('QUEUED');

    // Simulate opponent matching
    const p2 = createDummyPlayer('p_diff_2', 'Gold', 1510);
    const matchResult = enqueuePlayer(p2);
    expect(matchResult.status).toBe('MATCHED');
    expect(matchResult.match).toBeDefined();

    const match = matchResult.match!;
    expect(match.questions).toHaveLength(6);

    // Questions 0-1 are Early, 2-3 are Mid, 4-5 are Late
    const earlyCefr = [match.questions[0].cefrLevel, match.questions[1].cefrLevel];
    const lateCefr = [match.questions[4].cefrLevel, match.questions[5].cefrLevel];

    // For Gold tier: Early is B1, Late is B2 or C1
    expect(earlyCefr.every((lvl) => lvl === 'B1' || lvl === 'B2')).toBe(true);
    expect(lateCefr.every((lvl) => lvl === 'B2' || lvl === 'C1')).toBe(true);
  });

  it('rejects impossible reflex (<180ms) as suspicious bot activity and awards zero score', () => {
    const p1 = createDummyPlayer('p_bot_1', 'Platinum', 1800);
    const p2 = createDummyPlayer('p_bot_2', 'Platinum', 1820);
    const match = enqueuePlayer(p2).match || enqueuePlayer(p1).match!;

    const clientQ = getClientQuestion(match.matchId, p1.userId);
    expect(clientQ).not.toBeNull();

    // Fast-forward questionIssuedAt so that response time is only 50ms (< 180ms threshold)
    match.questionIssuedAt = Date.now() - 50;

    const currentQ = match.questions[0];
    const submitRes = submitRankedAnswer(
      match.matchId,
      p1.userId,
      currentQ.correctIndex, // Correct answer, but impossible speed!
      match.sessionToken
    );

    expect(submitRes).not.toBeNull();
    expect(submitRes!.isCorrect).toBe(false);
    expect(submitRes!.scoreAwarded).toBe(0);

    // Verify stored answer record contains isImpossibleReflex = true
    const recordedAns = match.player1.answers[0];
    expect(recordedAns.isImpossibleReflex).toBe(true);
    expect(recordedAns.isCorrect).toBe(false);
  });

  it('prevents replay attacks by rejecting duplicate answer submissions for the same question', () => {
    const p1 = createDummyPlayer('p_replay_1', 'Silver', 1100);
    const p2 = createDummyPlayer('p_replay_2', 'Silver', 1120);
    const match = enqueuePlayer(p2).match || enqueuePlayer(p1).match!;

    getClientQuestion(match.matchId, p1.userId);
    match.questionIssuedAt = Date.now() - 1500; // Realistic 1.5s response

    const currentQ = match.questions[0];

    // First submission: should succeed
    const firstRes = submitRankedAnswer(
      match.matchId,
      p1.userId,
      currentQ.correctIndex,
      match.sessionToken,
      currentQ.id
    );
    expect(firstRes).not.toBeNull();
    expect(firstRes!.isCorrect).toBe(true);

    // Second submission for the same question: should be rejected (returns null)
    const replayRes = submitRankedAnswer(
      match.matchId,
      p1.userId,
      currentQ.correctIndex,
      match.sessionToken,
      currentQ.id
    );
    expect(replayRes).toBeNull();
  });

  it('marks answers arriving after 4300ms as isLate and awards zero points', () => {
    const p1 = createDummyPlayer('p_late_1', 'Bronze', 700);
    const p2 = createDummyPlayer('p_late_2', 'Bronze', 720);
    const match = enqueuePlayer(p2).match || enqueuePlayer(p1).match!;

    getClientQuestion(match.matchId, p1.userId);
    match.questionIssuedAt = Date.now() - 4800; // 4.8 seconds elapsed (timeout)

    const currentQ = match.questions[0];
    const lateRes = submitRankedAnswer(
      match.matchId,
      p1.userId,
      currentQ.correctIndex,
      match.sessionToken
    );

    expect(lateRes).not.toBeNull();
    expect(lateRes!.isCorrect).toBe(false);
    expect(lateRes!.scoreAwarded).toBe(0);

    const recordedAns = match.player1.answers[0];
    expect(recordedAns.isLate).toBe(true);
    expect(recordedAns.isCorrect).toBe(false);
  });
});
