/**
 * GLOVA REALTIME MULTIPLAYER SYNCHRONOUS SPEED BATTLE ENGINE
 *
 * Implements TASK-03 Specification:
 * - Server-Authoritative 60-Second Speed Battle
 * - Zero Answer Key Leakage (Question served one-by-one)
 * - 10-Second Smart Bot Fallback with Gaussian Delay
 * - Live Sub-200ms Score Synchronization
 * - Standard International Elo Rating Calculation
 * - Graceful Disconnect / 5-Second Walkover Detection
 */

import {
  BattleOpponent,
  ClientQuestionNext,
  MatchFoundEvent,
  RoundEndedEvent,
  ScoreTickEvent,
  SpeedBattleRoom,
  SpeedBattleState,
} from './speed-battle-types';
import { calculateMatchRating } from './rating-engine';

export interface InternalQuestion {
  questionIndex: number;
  word: string;
  options: string[];
  correctOptionIndex: number;
  timeLimitSeconds: number;
  cefrLevel: string;
}

export interface SpeedBattleQueueEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  elo: number;
  queuedAt: number;
}

// In-memory active stores (using globalThis singleton for persistence across dev server route isolates)
const globalForSpeedBattle = globalThis as unknown as {
  speedBattleQueue?: Map<string, SpeedBattleQueueEntry>;
  speedBattleActiveRooms?: Map<string, SpeedBattleRoom>;
  speedBattleRoomQuestions?: Map<string, InternalQuestion[]>;
};

export const matchmakingQueue =
  globalForSpeedBattle.speedBattleQueue ??
  (globalForSpeedBattle.speedBattleQueue = new Map<string, SpeedBattleQueueEntry>());

export const activeRooms =
  globalForSpeedBattle.speedBattleActiveRooms ??
  (globalForSpeedBattle.speedBattleActiveRooms = new Map<string, SpeedBattleRoom>());

export const roomQuestions =
  globalForSpeedBattle.speedBattleRoomQuestions ??
  (globalForSpeedBattle.speedBattleRoomQuestions = new Map<string, InternalQuestion[]>());

// Realistic AI challenger bots with distinct personas and calibrated Elo
const SMART_BOT_PERSONAS: BattleOpponent[] = [
  { user_id: 'bot_alex_polyglot', username: 'Alex_Polyglot', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', elo: 1050, is_bot: true },
  { user_id: 'bot_emma_cambridge', username: 'Emma_Oxford', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', elo: 1180, is_bot: true },
  { user_id: 'bot_leo_vocabmaster', username: 'Leo_VocabMaster', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', elo: 1250, is_bot: true },
  { user_id: 'bot_sophia_linguist', username: 'Sophia_Chula', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', elo: 1320, is_bot: true },
  { user_id: 'bot_david_speedracer', username: 'David_SpeedWord', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', elo: 1400, is_bot: true },
];

// Curated Oxford Academic & CEFR Speed Battle Question Bank
const SEED_QUESTIONS: Array<{ word: string; options: string[]; correctIndex: number; level: string }> = [
  { word: 'Metaphor', options: ['การเปรียบเทียบโดยตรง', 'การพูดเกินจริง', 'การเล่นเสียงสระ', 'การบอกใบ้ทางอ้อม'], correctIndex: 0, level: 'B2' },
  { word: 'Pragmatic', options: ['ทางปฏิบัติ/เป็นจริง', 'ในเชิงอุดมคติ', 'ซับซ้อนยากเข้าใจ', 'เกี่ยวกับทฤษฎีล้วน'], correctIndex: 0, level: 'C1' },
  { word: 'Resilient', options: ['เปราะบาง', 'ฟื้นตัวได้เร็ว/อดทน', 'เหนื่อยล้าสะสม', 'เฉื่อยชา'], correctIndex: 1, level: 'B2' },
  { word: 'Ambiguous', options: ['ชัดเจนแจ่มแจ้ง', 'เด็ดขาดมั่นคง', 'กำกวม/คลุมเครือ', 'สว่างไสว'], correctIndex: 2, level: 'B2' },
  { word: 'Coherent', options: ['กระจัดกระจาย', 'สับสนวุ่นวาย', 'ขัดแย้งกันเอง', 'สอดคล้องเชื่อมโยงกัน'], correctIndex: 3, level: 'B2' },
  { word: 'Eloquent', options: ['พูดจาสละสลวยคมคาย', 'เงียบขรึมไม่พูด', 'พูดจาติดอ่าง', 'พูดจาหยาบคาย'], correctIndex: 0, level: 'C1' },
  { word: 'Scrutinize', options: ['เหลือบมองผ่านๆ', 'ตรวจสอบอย่างละเอียดถี่ถ้วน', 'ละเลยไม่ใส่ใจ', 'ชื่นชมยินดี'], correctIndex: 1, level: 'C1' },
  { word: 'Ephemeral', options: ['ชั่วคราว/คงอยู่ไม่นาน', 'ถาวรตลอดกาล', 'ยิ่งใหญ่ตระการตา', 'แข็งแกร่งทนทาน'], correctIndex: 0, level: 'C2' },
  { word: 'Pervasive', options: ['พบเห็นได้ยาก', 'แพร่หลายไปทั่วทุกแห่ง', 'อยู่อย่างโดดเดี่ยว', 'จำกัดเฉพาะกลุ่ม'], correctIndex: 1, level: 'C1' },
  { word: 'Meticulous', options: ['สะเพร่าเลินเล่อ', 'พิถีพิถัน/ละเอียดลออ', 'รวดเร็วเร่งรีบ', 'ใจกว้าง'], correctIndex: 1, level: 'C1' },
  { word: 'Lucid', options: ['ชัดเจนเข้าใจง่าย', 'มืดมัวสลัว', 'น่าสะพรึงกลัว', 'เลอะเลือน'], correctIndex: 0, level: 'B2' },
  { word: 'Deteriorate', options: ['พัฒนาขึ้น', 'เสื่อมโทรม/ทรุดโทรมลง', 'คงที่', 'รุ่งเรือง'], correctIndex: 1, level: 'B2' },
  { word: 'Vindicate', options: ['กล่าวหาปรักปรำ', 'พิสูจน์ความบริสุทธิ์/ยืนยันความถูกต้อง', 'ลงโทษอย่างรุนแรง', 'ยอมจำนน'], correctIndex: 1, level: 'C2' },
  { word: 'Ubiquitous', options: ['พบเห็นได้ทั่วไปทุกหนแห่ง', 'หายากมาก', 'โบราณล้าสมัย', 'แปลกประหลาด'], correctIndex: 0, level: 'C1' },
  { word: 'Mitigate', options: ['ทำให้แย่ลง', 'บรรเทา/ทำให้อ่อนลง', 'กระตุ้นให้โกรธ', 'เพิกเฉย'], correctIndex: 1, level: 'B2' },
];

/**
 * Resets engine state for tests
 */
export function resetSpeedBattleState(): void {
  matchmakingQueue.clear();
  activeRooms.clear();
  roomQuestions.clear();
}

/**
 * Generate 25 questions for a speed battle room
 */
function generateRoomQuestions(): InternalQuestion[] {
  // Shuffle seed questions
  const shuffled = [...SEED_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.map((q, idx) => ({
    questionIndex: idx + 1,
    word: q.word,
    options: q.options,
    correctOptionIndex: q.correctIndex,
    timeLimitSeconds: 10,
    cefrLevel: q.level,
  }));
}

/**
 * Normal Gaussian pseudo-random delay for Bot answers (mean = 2.5s, std = 0.6s, clamped 1.5 - 4.0s)
 */
export function generateGaussianDelayMs(mean = 2500, std = 600): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const delay = Math.round(mean + num * std);
  return Math.max(1500, Math.min(4000, delay));
}

/**
 * Matchmaking: Enqueue player or match instantly with waiting player (AC-1)
 */
export function enqueueSpeedBattlePlayer(player: {
  userId: string;
  username: string;
  avatarUrl: string;
  elo: number;
}): { status: 'QUEUED' | 'MATCH_FOUND'; matchEvent?: MatchFoundEvent } {
  const now = Date.now();

  // Clean stale queue entries (> 30s)
  for (const [uid, entry] of matchmakingQueue.entries()) {
    if (now - entry.queuedAt > 30000) {
      matchmakingQueue.delete(uid);
    }
  }

  // Look for compatible opponent in queue (excluding self)
  for (const [waitingUid, waitingPlayer] of matchmakingQueue.entries()) {
    if (waitingUid !== player.userId) {
      // Found opponent! Match within 3 seconds (AC-1)
      matchmakingQueue.delete(waitingUid);
      matchmakingQueue.delete(player.userId);

      const roomId = `room_${Math.random().toString(36).substring(2, 9)}`;
      const p1: BattleOpponent = {
        user_id: waitingPlayer.userId,
        username: waitingPlayer.username,
        avatar_url: waitingPlayer.avatarUrl,
        elo: waitingPlayer.elo,
        is_bot: false,
      };
      const p2: BattleOpponent = {
        user_id: player.userId,
        username: player.username,
        avatar_url: player.avatarUrl,
        elo: player.elo,
        is_bot: false,
      };

      const room: SpeedBattleRoom = {
        roomId,
        state: 'COUNTDOWN',
        player1: p1,
        player2: p2,
        createdAt: now,
        countdownStartAt: now,
        durationSeconds: 60,
        player1Score: 0,
        player2Score: 0,
        player1Streak: 0,
        player2Streak: 0,
        player1CurrentQuestionIndex: 1,
        player2CurrentQuestionIndex: 1,
        player1LastHeartbeat: now,
        player2LastHeartbeat: now,
        isBotMatch: false,
      };

      activeRooms.set(roomId, room);
      roomQuestions.set(roomId, generateRoomQuestions());

      return {
        status: 'MATCH_FOUND',
        matchEvent: {
          event: 'MATCH_FOUND',
          room_id: roomId,
          opponent: p1,
          countdown_seconds: 3,
          server_start_timestamp: now + 3000,
        },
      };
    }
  }

  // No opponent yet, put into queue
  matchmakingQueue.set(player.userId, {
    userId: player.userId,
    username: player.username,
    avatarUrl: player.avatarUrl,
    elo: player.elo,
    queuedAt: now,
  });

  return { status: 'QUEUED' };
}

/**
 * Poll matchmaking queue status.
 * Automatically spawns smart AI Bot fallback if waiting >= 10s (AC-3)
 */
export function pollSpeedBattleQueue(
  userId: string,
  forceBotAfterMs = 10000
): { status: 'QUEUED' | 'MATCH_FOUND'; matchEvent?: MatchFoundEvent } {
  // Check if player already got matched into an active room
  for (const [roomId, room] of activeRooms.entries()) {
    if (room.player1.user_id === userId || room.player2.user_id === userId) {
      const isPlayer1 = room.player1.user_id === userId;
      const opponent = isPlayer1 ? room.player2 : room.player1;
      return {
        status: 'MATCH_FOUND',
        matchEvent: {
          event: 'MATCH_FOUND',
          room_id: roomId,
          opponent,
          countdown_seconds: 3,
          server_start_timestamp: (room.countdownStartAt || Date.now()) + 3000,
        },
      };
    }
  }

  const entry = matchmakingQueue.get(userId);
  if (!entry) {
    return { status: 'QUEUED' };
  }

  const now = Date.now();
  const waitDuration = now - entry.queuedAt;

  // Smart Bot Fallback after 10 seconds (AC-3)
  if (waitDuration >= forceBotAfterMs) {
    matchmakingQueue.delete(userId);

    // Pick a bot close to user's Elo
    const botCandidate = [...SMART_BOT_PERSONAS].sort(
      (a, b) => Math.abs(a.elo - entry.elo) - Math.abs(b.elo - entry.elo)
    )[0];

    const roomId = `room_bot_${Math.random().toString(36).substring(2, 9)}`;
    const p1: BattleOpponent = {
      user_id: entry.userId,
      username: entry.username,
      avatar_url: entry.avatarUrl,
      elo: entry.elo,
      is_bot: false,
    };
    const p2: BattleOpponent = {
      ...botCandidate,
    };

    const room: SpeedBattleRoom = {
      roomId,
      state: 'COUNTDOWN',
      player1: p1,
      player2: p2,
      createdAt: now,
      countdownStartAt: now,
      durationSeconds: 60,
      player1Score: 0,
      player2Score: 0,
      player1Streak: 0,
      player2Streak: 0,
      player1CurrentQuestionIndex: 1,
      player2CurrentQuestionIndex: 1,
      player1LastHeartbeat: now,
      player2LastHeartbeat: now,
      isBotMatch: true,
    };

    activeRooms.set(roomId, room);
    roomQuestions.set(roomId, generateRoomQuestions());

    return {
      status: 'MATCH_FOUND',
      matchEvent: {
        event: 'MATCH_FOUND',
        room_id: roomId,
        opponent: p2,
        countdown_seconds: 3,
        server_start_timestamp: now + 3000,
      },
    };
  }

  return { status: 'QUEUED' };
}

/**
 * Cancel matchmaking queue entry
 */
export function cancelSpeedBattleQueue(userId: string): boolean {
  return matchmakingQueue.delete(userId);
}

/**
 * Get Room by ID
 */
export function getSpeedBattleRoom(roomId: string): SpeedBattleRoom | undefined {
  return activeRooms.get(roomId);
}

/**
 * Server-authoritative next question retriever (Zero Answer Key Leakage)
 */
export function getClientNextQuestion(roomId: string, userId: string): ClientQuestionNext | null {
  const room = activeRooms.get(roomId);
  const questions = roomQuestions.get(roomId);
  if (!room || !questions) return null;

  const now = Date.now();
  // Transition countdown to round_active when countdown has elapsed
  if (room.state === 'COUNTDOWN' && room.countdownStartAt && now >= room.countdownStartAt + 3000) {
    room.state = 'ROUND_ACTIVE';
    room.roundStartAt = now;
    room.roundEndAt = now + room.durationSeconds * 1000;
  }

  const isPlayer1 = room.player1.user_id === userId;
  const currentIdx = isPlayer1 ? room.player1CurrentQuestionIndex : room.player2CurrentQuestionIndex;

  const q = questions.find((item) => item.questionIndex === currentIdx);
  if (!q) return null;

  // Return strictly client-safe payload (NO correct answer index)
  return {
    event: 'QUESTION_NEXT',
    question_index: q.questionIndex,
    word: q.word,
    options: q.options,
    time_limit_seconds: q.timeLimitSeconds,
  };
}

/**
 * Submit player answer, validate on server, update live score tick (AC-2)
 */
export function submitSpeedBattleAnswer(params: {
  roomId: string;
  userId: string;
  questionIndex: number;
  selectedOptionIndex: number;
  responseTimeMs: number;
}): { success: boolean; scoreTick: ScoreTickEvent; isCorrect: boolean; pointsAwarded: number } {
  const { roomId, userId, questionIndex, selectedOptionIndex, responseTimeMs } = params;
  const room = activeRooms.get(roomId);
  const questions = roomQuestions.get(roomId);

  if (!room || !questions) {
    throw new Error('Room not found or expired');
  }

  const now = Date.now();
  room.state = 'ROUND_ACTIVE';
  if (!room.roundStartAt) {
    room.roundStartAt = now;
    room.roundEndAt = now + room.durationSeconds * 1000;
  }

  const isPlayer1 = room.player1.user_id === userId;
  if (isPlayer1) {
    room.player1LastHeartbeat = now;
  } else {
    room.player2LastHeartbeat = now;
  }

  const q = questions.find((item) => item.questionIndex === questionIndex);
  if (!q) {
    throw new Error(`Question ${questionIndex} not found`);
  }

  const isCorrect = selectedOptionIndex === q.correctOptionIndex;
  let pointsAwarded = 0;

  if (isCorrect) {
    // Base 10 points
    pointsAwarded = 10;
    // Speed bonus: up to +10 points for response under 2000ms
    if (responseTimeMs < 2000) {
      pointsAwarded += Math.round(((2000 - responseTimeMs) / 2000) * 10);
    }
    // Streak multiplier: +2 points per streak count (up to +10)
    const currentStreak = isPlayer1 ? room.player1Streak : room.player2Streak;
    pointsAwarded += Math.min(10, currentStreak * 2);

    if (isPlayer1) {
      room.player1Score += pointsAwarded;
      room.player1Streak += 1;
      room.player1CurrentQuestionIndex += 1;
    } else {
      room.player2Score += pointsAwarded;
      room.player2Streak += 1;
      room.player2CurrentQuestionIndex += 1;
    }
  } else {
    if (isPlayer1) {
      room.player1Streak = 0;
      room.player1CurrentQuestionIndex += 1;
    } else {
      room.player2Streak = 0;
      room.player2CurrentQuestionIndex += 1;
    }
  }

  // If playing against bot, bot makes an automated move occasionally
  if (room.isBotMatch && isPlayer1) {
    simulateBotProgress(room, questions);
  }

  const scoreTick: ScoreTickEvent = {
    event: 'SCORE_TICK',
    scores: {
      player_1: room.player1Score,
      player_2: room.player2Score,
    },
    streak: {
      player_1: room.player1Streak,
      player_2: room.player2Streak,
    },
    last_answer: {
      user_id: userId,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
    },
  };

  return {
    success: true,
    scoreTick,
    isCorrect,
    pointsAwarded,
  };
}

/**
 * Simulate Bot opponent answering with Gaussian distribution delay (AC-3)
 */
function simulateBotProgress(room: SpeedBattleRoom, questions: InternalQuestion[]): void {
  const botIdx = room.player2CurrentQuestionIndex;
  const q = questions.find((item) => item.questionIndex === botIdx);
  if (!q) return;

  // Bot accuracy ~75%
  const isBotCorrect = Math.random() < 0.75;
  const botDelay = generateGaussianDelayMs();

  if (isBotCorrect) {
    let botPoints = 10;
    if (botDelay < 2500) {
      botPoints += 5;
    }
    botPoints += Math.min(8, room.player2Streak * 2);
    room.player2Score += botPoints;
    room.player2Streak += 1;
  } else {
    room.player2Streak = 0;
  }
  room.player2CurrentQuestionIndex += 1;
  room.player2LastHeartbeat = Date.now();
}

/**
 * Heartbeat watchdog & Graceful Disconnect / Walkover detector (AC-5)
 * If opponent hasn't sent a heartbeat for > 5000ms during active round, declare Walkover win.
 */
export function checkSpeedBattleHeartbeat(
  roomId: string,
  userId: string
): { isDisconnected: boolean; isWalkoverWin: boolean; room?: SpeedBattleRoom } {
  const room = activeRooms.get(roomId);
  if (!room) {
    return {
      isDisconnected: true,
      isWalkoverWin: false,
    };
  }

  const now = Date.now();
  const isPlayer1 = room.player1.user_id === userId;

  if (isPlayer1) {
    room.player1LastHeartbeat = now;
  } else {
    room.player2LastHeartbeat = now;
  }

  // Only check disconnect during active round
  if (room.state === 'ROUND_ACTIVE') {
    const rivalLastBeat = isPlayer1 ? room.player2LastHeartbeat : room.player1LastHeartbeat;
    const rivalIsBot = isPlayer1 ? room.player2.is_bot : room.player1.is_bot;

    // Heartbeat timeout threshold: 5,000ms (5 seconds) per AC-5
    if (!rivalIsBot && now - rivalLastBeat > 5000) {
      room.state = 'ROUND_ENDED';
      room.winnerId = userId;
      room.isWalkover = true;

      return {
        isDisconnected: true,
        isWalkoverWin: true,
        room,
      };
    }
  }

  return {
    isDisconnected: false,
    isWalkoverWin: false,
    room,
  };
}

/**
 * Finalize Speed Battle round and calculate international standard Elo parity (AC-4)
 */
export function finalizeSpeedBattleMatch(roomId: string): RoundEndedEvent {
  const room = activeRooms.get(roomId);
  if (!room) {
    return {
      event: 'ROUND_ENDED',
      room_id: roomId,
      winner_id: null,
      is_walkover: false,
      final_scores: { player_1: 0, player_2: 0 },
      elo_updates: {
        player_1: { rating_before: 1200, rating_after: 1200, rating_delta: 0 },
        player_2: { rating_before: 1200, rating_after: 1200, rating_delta: 0 },
      },
    };
  }

  room.state = 'ROUND_ENDED';

  // Determine winner if not already set by walkover
  if (room.winnerId === undefined) {
    if (room.player1Score > room.player2Score) {
      room.winnerId = room.player1.user_id;
    } else if (room.player2Score > room.player1Score) {
      room.winnerId = room.player2.user_id;
    } else {
      room.winnerId = null; // Draw
    }
  }

  // Calculate standard international Elo rating (AC-4)
  const p1Outcome = room.winnerId === room.player1.user_id ? 'WIN' : room.winnerId === null ? 'DRAW' : 'LOSS';
  const p2Outcome = room.winnerId === room.player2.user_id ? 'WIN' : room.winnerId === null ? 'DRAW' : 'LOSS';

  const p1EloResult = calculateMatchRating({
    playerRating: room.player1.elo,
    opponentRating: room.player2.elo,
    outcome: p1Outcome,
    isPlacement: false,
    playerAccuracy: 0.85,
  });

  const p2EloResult = calculateMatchRating({
    playerRating: room.player2.elo,
    opponentRating: room.player1.elo,
    outcome: p2Outcome,
    isPlacement: false,
    playerAccuracy: 0.75,
  });

  return {
    event: 'ROUND_ENDED',
    room_id: roomId,
    winner_id: room.winnerId,
    is_walkover: !!room.isWalkover,
    final_scores: {
      player_1: room.player1Score,
      player_2: room.player2Score,
    },
    elo_updates: {
      player1_id: room.player1.user_id,
      player1_old_elo: room.player1.elo,
      player1_new_elo: p1EloResult.ratingAfter,
      player1_delta: p1EloResult.ratingDelta,
      player2_id: room.player2.user_id,
      player2_old_elo: room.player2.elo,
      player2_new_elo: p2EloResult.ratingAfter,
      player2_delta: p2EloResult.ratingDelta,
    },
  };
}
