import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetSpeedBattleState,
  enqueueSpeedBattlePlayer,
  pollSpeedBattleQueue,
  getClientNextQuestion,
  submitSpeedBattleAnswer,
  checkSpeedBattleHeartbeat,
  finalizeSpeedBattleMatch,
  getSpeedBattleRoom,
  generateGaussianDelayMs,
} from '@/lib/ranked/speed-battle-engine';

describe('GLOVA TASK-03 — Realtime Multiplayer Synchronous Speed Battle', () => {
  beforeEach(() => {
    resetSpeedBattleState();
  });

  describe('AC-1: Matchmaking Handshake', () => {
    it('should match two distinct players into the same room within 3 seconds', () => {
      // Player A enqueues
      const pA = enqueueSpeedBattlePlayer({
        userId: 'usr_player_a',
        username: 'Player_Alpha',
        avatarUrl: '/avatars/p1.png',
        elo: 1200,
      });
      expect(pA.status).toBe('QUEUED');
      expect(pA.matchEvent).toBeUndefined();

      // Player B enqueues
      const pB = enqueueSpeedBattlePlayer({
        userId: 'usr_player_b',
        username: 'Player_Bravo',
        avatarUrl: '/avatars/p2.png',
        elo: 1220,
      });

      // Player B immediately gets MATCH_FOUND
      expect(pB.status).toBe('MATCH_FOUND');
      expect(pB.matchEvent).toBeDefined();
      expect(pB.matchEvent?.event).toBe('MATCH_FOUND');
      expect(pB.matchEvent?.opponent.user_id).toBe('usr_player_a');
      expect(pB.matchEvent?.countdown_seconds).toBe(3);

      const roomId = pB.matchEvent!.room_id;

      // Player A polling also retrieves the exact same room
      const pAPoll = pollSpeedBattleQueue('usr_player_a');
      expect(pAPoll.status).toBe('MATCH_FOUND');
      expect(pAPoll.matchEvent?.room_id).toBe(roomId);
      expect(pAPoll.matchEvent?.opponent.user_id).toBe('usr_player_b');
    });
  });

  describe('AC-2: Live Score Synchronization & Zero Answer Key Leakage', () => {
    it('should serve single question without answer key and broadcast live score ticks upon correct submit', () => {
      enqueueSpeedBattlePlayer({
        userId: 'usr_p1',
        username: 'PlayerOne',
        avatarUrl: '/avatars/p1.png',
        elo: 1100,
      });
      const matchB = enqueueSpeedBattlePlayer({
        userId: 'usr_p2',
        username: 'PlayerTwo',
        avatarUrl: '/avatars/p2.png',
        elo: 1120,
      });
      const roomId = matchB.matchEvent!.room_id;

      // Fetch first question for Player 1
      const q1 = getClientNextQuestion(roomId, 'usr_p1');
      expect(q1).not.toBeNull();
      expect(q1?.event).toBe('QUESTION_NEXT');
      expect(q1?.question_index).toBe(1);
      expect(typeof q1?.word).toBe('string');
      expect(q1?.options.length).toBe(4);
      // Zero Answer Key Leakage: correctOptionIndex must NOT be present on client payload
      expect((q1 as any).correctOptionIndex).toBeUndefined();

      // Set score directly to verify score tick broadcast
      const room = getSpeedBattleRoom(roomId);
      expect(room).toBeDefined();
      room!.player1Score = 25;
      room!.player2Score = 10;

      // Player 1 submits answer
      const submitRes = submitSpeedBattleAnswer({
        roomId,
        userId: 'usr_p1',
        questionIndex: 1,
        selectedOptionIndex: 0,
        responseTimeMs: 1200,
      });

      expect(submitRes.success).toBe(true);
      expect(submitRes.scoreTick.event).toBe('SCORE_TICK');
      expect(typeof submitRes.scoreTick.scores.player_1).toBe('number');
      expect(typeof submitRes.scoreTick.scores.player_2).toBe('number');

      // Player 1's next question index advances
      const q2 = getClientNextQuestion(roomId, 'usr_p1');
      expect(q2?.question_index).toBe(2);
    });
  });

  describe('AC-3: Smart Bot Fallback', () => {
    it('should automatically spawn a calibrated AI Bot opponent after 10 seconds wait', () => {
      // Player enqueues alone
      const enq = enqueueSpeedBattlePlayer({
        userId: 'usr_solo',
        username: 'SoloPlayer',
        avatarUrl: '/avatars/solo.png',
        elo: 1250,
      });
      expect(enq.status).toBe('QUEUED');

      // Immediate poll returns QUEUED
      const earlyPoll = pollSpeedBattleQueue('usr_solo', 10000);
      expect(earlyPoll.status).toBe('QUEUED');

      // Poll simulating >= 10s wait (forceBotAfterMs = 0 for test trigger)
      const botPoll = pollSpeedBattleQueue('usr_solo', 0);
      expect(botPoll.status).toBe('MATCH_FOUND');
      expect(botPoll.matchEvent?.opponent.is_bot).toBe(true);
      expect(botPoll.matchEvent?.opponent.username).toBeDefined();
      expect(botPoll.matchEvent?.countdown_seconds).toBe(3);

      // Verify Gaussian delay generator values are clamped within 1.5 - 4.0s
      for (let i = 0; i < 20; i++) {
        const delay = generateGaussianDelayMs();
        expect(delay).toBeGreaterThanOrEqual(1500);
        expect(delay).toBeLessThanOrEqual(4000);
      }
    });
  });

  describe('AC-4: Elo Calculation Parity', () => {
    it('should adjust winner Elo positively and loser Elo negatively based on international formula', () => {
      enqueueSpeedBattlePlayer({
        userId: 'usr_winner',
        username: 'WinnerPlayer',
        avatarUrl: '/avatars/w.png',
        elo: 1200,
      });
      const match = enqueueSpeedBattlePlayer({
        userId: 'usr_loser',
        username: 'LoserPlayer',
        avatarUrl: '/avatars/l.png',
        elo: 1200,
      });
      const roomId = match.matchEvent!.room_id;

      // Set explicit scores: Player 1 has 50 points, Player 2 has 20 points
      const room = getSpeedBattleRoom(roomId);
      expect(room).toBeDefined();
      room!.player1Score = 50;
      room!.player2Score = 20;

      const endEvent = finalizeSpeedBattleMatch(roomId);
      expect(endEvent.event).toBe('ROUND_ENDED');
      expect(endEvent.winner_id).toBe('usr_winner');

      // Winner gains rating (> 0), Loser loses rating (< 0)
      expect(endEvent.elo_updates.player1_delta).toBeGreaterThan(0);
      expect(endEvent.elo_updates.player2_delta).toBeLessThan(0);
      expect(endEvent.elo_updates.player1_new_elo).toBe(
        endEvent.elo_updates.player1_old_elo + endEvent.elo_updates.player1_delta
      );
      expect(endEvent.elo_updates.player2_new_elo).toBe(
        endEvent.elo_updates.player2_old_elo + endEvent.elo_updates.player2_delta
      );
    });
  });

  describe('AC-5: Graceful Disconnect & Walkover Win', () => {
    it('should declare walkover win when rival misses heartbeat for > 5 seconds', () => {
      enqueueSpeedBattlePlayer({
        userId: 'usr_active',
        username: 'ActivePlayer',
        avatarUrl: '/avatars/active.png',
        elo: 1150,
      });
      const match = enqueueSpeedBattlePlayer({
        userId: 'usr_quitter',
        username: 'QuitterPlayer',
        avatarUrl: '/avatars/quitter.png',
        elo: 1150,
      });
      const roomId = match.matchEvent!.room_id;

      // Start round
      getClientNextQuestion(roomId, 'usr_active');

      // Both players heartbeat at t=0
      checkSpeedBattleHeartbeat(roomId, 'usr_active');
      checkSpeedBattleHeartbeat(roomId, 'usr_quitter');

      // Set room state to ROUND_ACTIVE and simulate Player 2 being silent for 6s (> 5s threshold)
      const room = getSpeedBattleRoom(roomId);
      expect(room).toBeDefined();
      room!.state = 'ROUND_ACTIVE';
      room!.player1LastHeartbeat = Date.now();
      room!.player2LastHeartbeat = Date.now() - 6000;

      // Check heartbeat for Player 1: Player 2 has been silent for 6s (> 5s)
      const result = checkSpeedBattleHeartbeat(roomId, 'usr_active');
      expect(result.isDisconnected).toBe(true);
      expect(result.isWalkoverWin).toBe(true);
      expect(result.room.winnerId).toBe('usr_active');
      expect(result.room.isWalkover).toBe(true);
    });
  });
});
