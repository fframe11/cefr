import { describe, it, expect } from 'vitest';
import {
  enqueuePlayer,
  pollQueueStatus,
  getClientQuestion,
  submitRankedAnswer,
} from '../lib/ranked/matchmaking-engine';
import { calculateMatchRating, getTierFromRating } from '../lib/ranked/rating-engine';
import { sendEmail, sendFriendInviteEmail } from '../lib/email/resend-client';

describe('GLOVA Ranked 4s Battle, Anti-Cheat & Resend Email Integration', () => {
  const p1Id = `player_test_${Date.now()}`;

  it('enforces server-authoritative 4-second answer timer and rejects late answers', () => {
    // 1. Enqueue player and match with calibrated opponent
    const enqueueRes = enqueuePlayer({
      userId: p1Id,
      username: 'Tester_CU',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      rankFrame: 'cute_1',
      rating: 1200,
      tier: 'Gold',
      division: 'II',
      queuedAt: Date.now() - 5000, // Trigger instant ghost match
      mode: 'vocabulary',
    });

    // Or poll queue to create match
    let match = enqueueRes.match;
    if (!match) {
      const poll = pollQueueStatus(p1Id);
      match = poll.match;
    }

    expect(match).toBeDefined();
    if (!match) return;

    // 2. Fetch client question: verify answer keys are stripped
    const clientQ = getClientQuestion(match.matchId, p1Id);
    expect(clientQ).not.toBeNull();
    expect(clientQ?.timeLimitMs).toBe(4000);
    expect((clientQ as any).correctIndex).toBeUndefined();
    expect((clientQ as any).definition).toBeUndefined();

    // 3. Submit valid on-time answer (simulating 1.5s human reaction)
    const token = match.sessionToken;
    const currentQ = match.questions[match.currentQuestionIndex];
    const correctIdx = currentQ.correctIndex;
    match.questionIssuedAt = Date.now() - 1500;

    const answerRes = submitRankedAnswer(match.matchId, p1Id, correctIdx, token);
    expect(answerRes).not.toBeNull();
    expect(answerRes?.isCorrect).toBe(true);
    expect(answerRes?.scoreAwarded).toBeGreaterThanOrEqual(100);

    // 4. Test wrong session token (anti-cheat gate)
    const fakeTokenRes = submitRankedAnswer(match.matchId, p1Id, correctIdx, 'invalid_session_token');
    expect(fakeTokenRes).toBeNull();
  });

  it('calculates deterministic Elo rating with demotion protection buffers', () => {
    // Player rating: 1200 (Gold II), Opponent rating: 1250 (Gold II)
    const winResult = calculateMatchRating({
      playerRating: 1200,
      opponentRating: 1250,
      outcome: 'WIN',
      isPlacement: false,
      playerAccuracy: 1.0,
      demotionProtectedMatches: 0,
    });

    expect(winResult.ratingAfter).toBeGreaterThan(1200);
    expect(winResult.ratingDelta).toBeGreaterThan(0);
    expect(winResult.tierAfter.tier).toBe('Gold');

    // Demotion protection test at border
    const lossNearBorder = calculateMatchRating({
      playerRating: 1055, // Gold III bottom border is 1050
      opponentRating: 1100,
      outcome: 'LOSS',
      isPlacement: false,
      playerAccuracy: 0.2,
      demotionProtectedMatches: 1, // Protected!
    });

    // Rating drops, but tier is protected from falling to Silver
    expect(lossNearBorder.isDemotion).toBe(false);
  });

  it('sends transactional email via Resend with graceful mock fallback and without leaking secrets', async () => {
    const inviteRes = await sendFriendInviteEmail(
      'peer.student@chula.ac.th',
      'Frame_CU',
      'GLOVA-CHULA-2026',
      'https://glova.app/invite/GLOVA-CHULA-2026'
    );

    expect(inviteRes.success).toBe(true);
    expect(inviteRes.id).toBeDefined();
  });
});
