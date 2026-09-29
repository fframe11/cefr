import { CEFRLevel } from './index';

export type XPEventSource =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'mockExam'
  | 'competition'
  | 'achievement'
  | 'daily_goal';

export interface XPEvent {
  id: string;
  userId: string;
  source: XPEventSource;
  sourceId?: string;
  amount: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserGameProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  gameLevel: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
  streakDays: number;
  cefrLevel: CEFRLevel;
  activeRankFrameId?: RankFrameId;
  weeklyXp: number;
  monthlyXp: number;
}

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type RankFrameId =
  | 'cute_1'
  | 'cute_2'
  | 'cute_3'
  | 'gaming_1'
  | 'gaming_2'
  | 'gaming_3';

export type FrameCategory = 'cute' | 'gaming';

export interface RankFrameInfo {
  id: RankFrameId;
  category: FrameCategory;
  rank: 1 | 2 | 3;
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  rarity: 'mythic' | 'legendary' | 'epic';
  accentColor: string;
}

export interface Achievement {
  id: string;
  code: string;
  titleEn: string;
  titleTh: string;
  descEn: string;
  descTh: string;
  icon: string;
  xpReward: number;
  category: 'learning' | 'streak' | 'competition' | 'social';
  maxProgress: number;
  unlockedAt?: string;
  currentProgress?: number;
  isUnlocked?: boolean;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  frameId?: RankFrameId;
  weeklyXp: number;
  totalXp: number;
  gameLevel: number;
  cefrLevel: CEFRLevel;
  tier: RankTier;
  isCurrentUser?: boolean;
}

export interface RankingSeasonInfo {
  seasonId: string;
  seasonName: string;
  endsInDays: number;
  userRank: number;
  userWeeklyXp: number;
  userTier: RankTier;
  topUsers: RankingEntry[];
  surroundingUsers: RankingEntry[];
}

export type CompetitionDifficultyStage = 1 | 2 | 3 | 4 | 5;

export interface CompetitionQuestionClient {
  questionId: string;
  word: string;
  partOfSpeech: string;
  ipa?: string;
  prompt: string;
  options: string[];
  stage: CompetitionDifficultyStage;
  stageName: string;
}

export interface CompetitionAnswerResult {
  correct: boolean;
  timeTakenMs: number;
  isLate: boolean;
  xpEarned: number;
  newStreak: number;
  newScore: number;
  nextStage: CompetitionDifficultyStage;
  correctAnswerText: string;
  nextQuestion?: CompetitionQuestionClient;
}

export interface CompetitionSummary {
  sessionId: string;
  finalScore: number;
  accuracyPercent: number;
  maxStreak: number;
  totalXpEarned: number;
  highestStageReached: CompetitionDifficultyStage;
  missedWords: { word: string; meaningTh: string; meaningEn: string; cefrLevel: CEFRLevel }[];
  previousRank: number;
  newRank: number;
}

export interface PublicUserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  gameLevel: number;
  totalXp: number;
  weeklyXp: number;
  cefrLevel: CEFRLevel;
  activeRankFrameId?: RankFrameId;
  achievementsCount: number;
  isFriend?: boolean;
  isFollowing?: boolean;
  isFollower?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: PublicUserProfile;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface InviteInfo {
  inviteCode: string;
  inviteUrl: string;
  invitedCount: number;
  earnedXp: number;
}
