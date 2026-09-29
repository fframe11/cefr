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

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export type LottieFrameId =
  | 'lottie_cyber_apex'
  | 'lottie_solar_radiance'
  | 'lottie_mystic_emerald'
  | 'lottie_sakura_starlight';

export type RankFrameId =
  | 'cute_1'
  | 'cute_2'
  | 'cute_3'
  | 'gaming_1'
  | 'gaming_2'
  | 'gaming_3'
  | LottieFrameId;

export interface LottieFrameMetadata {
  id: LottieFrameId;
  nameEn: string;
  nameTh: string;
  category: 'gaming' | 'cute';
  rank: 1 | 2 | 3;
  color: string;
  animationUrl: string;
  fallbackJsonPath: string;
  license: string;
  licenseUrl: string;
  author: string;
}

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

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

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
  rarity: ItemRarity;
  maxProgress: number;
  unlockedAt?: string;
  currentProgress?: number;
  isUnlocked?: boolean;
}

export interface DailyQuest {
  id: string;
  code: string;
  titleEn: string;
  titleTh: string;
  descEn: string;
  descTh: string;
  xpReward: number;
  category: 'vocabulary' | 'competition' | 'social' | 'review';
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt: string;
}

export interface PersonalBest {
  bestVocabularyScore: number;
  bestStreak: number;
  fastestCorrectMs: number;
  highestRankRating: number;
  longestLearningStreakDays: number;
  weeklyXpRecord: number;
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

export interface DuoQuestion {
  id: string;
  word: string;
  meaning_th: string;
  meaning_en: string;
  options: string[];
  correctIndex: number;
}

export interface DuoStudySession {
  sessionId: string;
  hostUser: PublicUserProfile;
  partnerUser: PublicUserProfile;
  cefrLevel: CEFRLevel;
  targetExam?: string;
  status: 'INVITED' | 'ACTIVE' | 'COMPLETED';
  questions: DuoQuestion[];
  hostAnswers: Array<{ questionIndex: number; isCorrect: boolean; timeMs: number; chosenIndex: number }>;
  partnerAnswers: Array<{ questionIndex: number; isCorrect: boolean; timeMs: number; chosenIndex: number }>;
  hostScore: number;
  partnerScore: number;
  createdAt: number;
  completedAt?: number;
}

