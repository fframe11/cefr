/**
 * GLOVA RANKED COMPETITIVE ARCHITECTURE - TYPE DEFINITIONS
 * Strict separation between competitive Rank Rating (MMR) and learning XP.
 */

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
export type RankDivision = 'III' | 'II' | 'I';

export interface TierInfo {
  tier: RankTier;
  division: RankDivision;
  ratingMin: number;
  ratingMax: number;
  color: string;
  badgeBg: string;
  iconName: string;
}

export interface RankedProfile {
  userId: string;
  username: string;
  avatar: string;
  rankFrame: string;
  rating: number; // e.g. 1284
  tier: RankTier;
  division: RankDivision;
  peakRating: number;
  peakTier: RankTier;
  peakDivision: RankDivision;
  seasonId: string;
  placementMatchesPlayed: number; // 0..5
  placementRequired: number; // 5
  isPlaced: boolean;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  demotionProtectedMatches: number;
  lastMatchOutcome?: 'WIN' | 'LOSS' | 'DRAW';
  lastPlayedAt?: string;
  university?: string;
}

export type CompetitiveGameMode = 'vocabulary' | 'grammar' | 'reading';

export type MatchmakingState =
  | 'IDLE'
  | 'SEARCHING'
  | 'MATCHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface RankedAnswerRecord {
  questionId: string;
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  responseTimeMs: number;
  isLate: boolean;
  scoreAwarded: number;
}

export interface RankedMatchPlayer {
  userId: string;
  username: string;
  avatar: string;
  rankFrame: string;
  tier: RankTier;
  division: RankDivision;
  rating: number;
  score: number;
  correctCount: number;
  streak: number;
  maxStreak: number;
  answers: RankedAnswerRecord[];
  isBot?: boolean;
  university?: string;
}

export interface RankedQuestion {
  id: string;
  prompt: string;
  targetWord: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  options: string[];
  correctIndex: number; // Server-only, stripped for client
  definition: string;
  exampleSentence: string;
  thaiMeaning: string;
}

export interface ClientRankedQuestion {
  id: string;
  prompt: string;
  targetWord: string;
  cefrLevel: string;
  options: string[];
  questionIndex: number;
  totalQuestions: number;
  timeLimitMs: number; // 4000
  issuedAt: number;
}

export interface RankedMatch {
  matchId: string;
  mode: CompetitiveGameMode;
  seasonId: string;
  player1: RankedMatchPlayer;
  player2: RankedMatchPlayer;
  questions: RankedQuestion[];
  currentQuestionIndex: number;
  questionIssuedAt: number;
  state: MatchmakingState;
  startedAt: number;
  endedAt?: number;
  winnerId?: string | 'DRAW';
  sessionToken: string;
}

export interface RankedAnswerSubmission {
  matchId: string;
  questionId: string;
  chosenIndex: number;
  sessionToken: string;
}

export interface QuestionSubmissionResult {
  matchId: string;
  questionIndex: number;
  isCorrect: boolean;
  correctIndex: number; // Returned only after submission
  scoreAwarded: number;
  currentStreak: number;
  playerScore: number;
  opponentScore: number;
  opponentChoseCorrect: boolean;
  opponentResponseTimeMs: number;
  isMatchFinished: boolean;
  nextQuestion?: ClientRankedQuestion;
}

export interface MissedWordReview {
  word: string;
  definition: string;
  thaiMeaning: string;
  exampleSentence: string;
  chosenAnswer: string;
  correctAnswer: string;
  cefrLevel: string;
}

export interface RankedMatchResult {
  matchId: string;
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  winnerId: string | 'DRAW';
  player1: {
    userId: string;
    username: string;
    ratingBefore: number;
    ratingAfter: number;
    ratingDelta: number;
    tierBefore: { tier: RankTier; division: RankDivision };
    tierAfter: { tier: RankTier; division: RankDivision };
    isPromotion: boolean;
    isDemotion: boolean;
    score: number;
    accuracy: number;
    bestStreak: number;
    xpEarned: number;
  };
  player2: {
    userId: string;
    username: string;
    ratingBefore: number;
    ratingAfter: number;
    ratingDelta: number;
    tierBefore: { tier: RankTier; division: RankDivision };
    tierAfter: { tier: RankTier; division: RankDivision };
    isPromotion: boolean;
    isDemotion: boolean;
    score: number;
    accuracy: number;
  };
  missedWords: MissedWordReview[];
  seasonId: string;
  completedAt: string;
}

export interface RankedSeason {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CONCLUDED';
  rewards: {
    tier: RankTier;
    frameId: string;
    xpReward: number;
    achievementId?: string;
  }[];
}

export interface RankedLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  rankFrame: string;
  tier: RankTier;
  division: RankDivision;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  university?: string;
  isCurrentUser?: boolean;
}
