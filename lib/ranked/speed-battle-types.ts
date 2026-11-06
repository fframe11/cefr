/**
 * GLOVA REALTIME MULTIPLAYER SYNCHRONOUS SPEED BATTLE TYPES
 * Mapped to TASK-03 Notion Specification
 */

export type SpeedBattleState =
  | 'LOBBY'
  | 'MATCHMAKING'
  | 'COUNTDOWN'
  | 'ROUND_ACTIVE'
  | 'ROUND_ENDED'
  | 'LEADERBOARD_REWARDS';

export interface BattleOpponent {
  user_id: string;
  username: string;
  avatar_url: string;
  elo: number;
  is_bot?: boolean;
}

export interface ClientQuestionNext {
  event: 'QUESTION_NEXT';
  question_index: number;
  word: string;
  options: string[];
  time_limit_seconds: number;
}

export interface MatchFoundEvent {
  event: 'MATCH_FOUND';
  room_id: string;
  opponent: BattleOpponent;
  countdown_seconds: number;
  server_start_timestamp: number;
}

export interface AnswerSubmitPayload {
  room_id: string;
  user_id: string;
  question_index: number;
  selected_option_index: number;
  response_time_ms: number;
}

export interface ScoreTickEvent {
  event: 'SCORE_TICK';
  scores: {
    player_1: number;
    player_2: number;
  };
  streak: {
    player_1: number;
    player_2: number;
  };
  last_answer?: {
    user_id: string;
    is_correct: boolean;
    points_awarded: number;
  };
}

export interface RoundEndedEvent {
  event: 'ROUND_ENDED';
  room_id: string;
  winner_id: string | null; // null for draw
  is_walkover: boolean;
  final_scores: {
    player_1: number;
    player_2: number;
  };
  elo_updates: {
    player1_id: string;
    player1_old_elo: number;
    player1_new_elo: number;
    player1_delta: number;
    player2_id: string;
    player2_old_elo: number;
    player2_new_elo: number;
    player2_delta: number;
  };
}

export interface SpeedBattleRoom {
  roomId: string;
  state: SpeedBattleState;
  player1: BattleOpponent;
  player2: BattleOpponent;
  createdAt: number;
  countdownStartAt?: number;
  roundStartAt?: number;
  roundEndAt?: number;
  durationSeconds: number; // 60s
  player1Score: number;
  player2Score: number;
  player1Streak: number;
  player2Streak: number;
  player1CurrentQuestionIndex: number;
  player2CurrentQuestionIndex: number;
  player1LastHeartbeat: number;
  player2LastHeartbeat: number;
  winnerId?: string | null;
  isWalkover?: boolean;
  isBotMatch: boolean;
}
