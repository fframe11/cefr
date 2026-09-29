import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDuoStudySession,
  getDuoStudySession,
  submitDuoAnswer,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getUserSocialSummary,
} from '../lib/gamification/social-engine';

describe('Social Hub & Duo Study Together Engine', () => {
  const hostId = 'user_host_101';
  const partnerId = 'user_partner_202';

  it('creates a Duo Study session with 5 verified vocabulary questions and distractors', () => {
    const session = createDuoStudySession(hostId, partnerId, 'B1', 'PET');

    expect(session).toBeDefined();
    expect(session.sessionId).toMatch(/^duo_/);
    expect(session.status).toBe('ACTIVE');
    expect(session.cefrLevel).toBe('B1');
    expect(session.targetExam).toBe('PET');
    expect(session.questions).toHaveLength(5);

    // Each question must have valid prompt, distractors, and correctIndex
    for (const q of session.questions) {
      expect(q.id).toBeDefined();
      expect(q.word).toBeTruthy();
      expect(q.meaning_th).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.options[q.correctIndex]).toBe(q.meaning_th);
    }
  });

  it('retrieves an active session by sessionId', () => {
    const created = createDuoStudySession(hostId, partnerId, 'B2');
    const retrieved = getDuoStudySession(created.sessionId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.sessionId).toBe(created.sessionId);
    expect(retrieved?.status).toBe('ACTIVE');
  });

  it('accurately scores correct answer with speed bonus and simulates partner response', () => {
    const session = createDuoStudySession(hostId, partnerId, 'B1');
    const q0 = session.questions[0];

    // Host answers question 0 correctly in 1000ms (fast!)
    const result = submitDuoAnswer(session.sessionId, hostId, 0, q0.correctIndex, 1000);

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.session).toBeDefined();

    // Speed bonus: (4000 - 1000) / 80 = 37.5 -> 38. Total score = 100 + 38 = 138
    expect(result.session!.hostScore).toBe(138);
    expect(result.session!.hostAnswers).toHaveLength(1);
    expect(result.session!.hostAnswers[0].isCorrect).toBe(true);

    // Partner simulation should have responded automatically
    expect(result.session!.partnerAnswers).toHaveLength(1);
    expect(result.session!.partnerAnswers[0].questionIndex).toBe(0);
    expect(result.session!.partnerAnswers[0].timeMs).toBeGreaterThan(0);
  });

  it('awards zero points for incorrect answer', () => {
    const session = createDuoStudySession(hostId, partnerId, 'A2');
    const q0 = session.questions[0];
    const wrongIndex = (q0.correctIndex + 1) % q0.options.length;

    const result = submitDuoAnswer(session.sessionId, hostId, 0, wrongIndex, 1200);

    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.session!.hostScore).toBe(0);
    expect(result.session!.hostAnswers[0].isCorrect).toBe(false);
  });

  it('marks session as COMPLETED once host answers all 5 questions', () => {
    const session = createDuoStudySession(hostId, partnerId, 'C1');

    for (let i = 0; i < 5; i++) {
      const q = session.questions[i];
      submitDuoAnswer(session.sessionId, hostId, i, q.correctIndex, 1500);
    }

    const updated = getDuoStudySession(session.sessionId);
    expect(updated?.status).toBe('COMPLETED');
    expect(updated?.completedAt).toBeDefined();
    expect(updated?.hostAnswers).toHaveLength(5);
  });

  it('properly declines friend request and updates request lists', () => {
    const requester = 'user_req_alpha';
    const target = 'user_tgt_beta';

    const reqResult = sendFriendRequest(requester, target);
    expect(reqResult.success).toBe(true);

    // Verify request is pending in target's profile
    const profileBefore = getUserSocialSummary(target);
    const pendingReq = profileBefore.incomingRequests.find((r) => r.fromUser.userId === requester);
    expect(pendingReq).toBeDefined();

    // Decline the request
    const declineResult = declineFriendRequest(target, pendingReq!.id);
    expect(declineResult.success).toBe(true);

    // Verify request was removed
    const profileAfter = getUserSocialSummary(target);
    expect(profileAfter.incomingRequests.some((r) => r.fromUser.userId === requester)).toBe(false);
    expect(profileAfter.friends.some((f) => f.userId === requester)).toBe(false);
  });
});
