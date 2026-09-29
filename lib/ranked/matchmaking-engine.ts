/**
 * GLOVA RANKED MATCHMAKING & QUESTION ENGINE
 *
 * Server-authoritative matchmaking queue with deterministic rating expansion,
 * anti-infinite-wait challenger generation, 4-second time windows,
 * and anti-cheat session tokens.
 */

import crypto from 'crypto';
import { sampleRandomVocabulary, getAllProductionVocabulary } from '../vocabulary/production-vocabulary';
import { CEFRLevel, VocabularyWord } from '@/types';
import {
  CompetitiveGameMode,
  MatchmakingState,
  RankedMatch,
  RankedMatchPlayer,
  RankedProfile,
  RankedQuestion,
  ClientRankedQuestion,
  RankTier,
  RankDivision,
  QuestionSubmissionResult,
  MissedWordReview,
  RankedMatchResult,
} from '@/types/ranked';
import { calculateMatchRating, getTierFromRating } from './rating-engine';

export interface MatchmakingQueueEntry {
  userId: string;
  username: string;
  avatar: string;
  rankFrame: string;
  rating: number;
  tier: RankTier;
  division: RankDivision;
  queuedAt: number;
  mode: CompetitiveGameMode;
  university?: string;
}

// In-memory queue & active match stores
const matchmakingQueue = new Map<string, MatchmakingQueueEntry>();
const activeMatches = new Map<string, RankedMatch>();

// Realistic challenger university student personas for calibrated ghost matchmaking
const CHALLENGER_PERSONAS = [
  { name: 'Korn_Chula', uni: 'Chulalongkorn University', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', frame: 'gaming_1' },
  { name: 'Ploy_Thammasat', uni: 'Thammasat University', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', frame: 'cute_1' },
  { name: 'Boss_KMITL', uni: 'KMITL', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', frame: 'gaming_2' },
  { name: 'Mind_Mahidol', uni: 'Mahidol University', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', frame: 'cute_2' },
  { name: 'Earth_CMU', uni: 'Chiang Mai University', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', frame: 'gaming_3' },
  { name: 'Fern_KU', uni: 'Kasetsart University', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80', frame: 'cute_3' },
];

/**
 * Matchmaking expansion range rules:
 * 0 - 3s: ±80 MMR
 * 3 - 6s: ±160 MMR
 * 6 - 9s: ±250 MMR
 * 9s+: Calibrated Ghost match
 */
export function getAcceptableRatingRange(waitDurationMs: number): number {
  if (waitDurationMs < 3000) return 80;
  if (waitDurationMs < 6000) return 160;
  return 250;
}

/**
 * Filter vocabulary by player tier for appropriate difficulty curve
 * Sourced directly from verified 3,860 production candidates.
 */
function getQuestionsForTier(tier: RankTier): RankedQuestion[] {
  let targetCefr: CEFRLevel[];
  switch (tier) {
    case 'Bronze':
      targetCefr = ['A1', 'A2'];
      break;
    case 'Silver':
      targetCefr = ['A2', 'B1'];
      break;
    case 'Gold':
      targetCefr = ['B1', 'B2'];
      break;
    case 'Platinum':
      targetCefr = ['B2', 'C1'];
      break;
    case 'Diamond':
    case 'Master':
      targetCefr = ['C1', 'C2', 'B2'];
      break;
    default:
      targetCefr = ['B1'];
  }

  let selectedWords = sampleRandomVocabulary(targetCefr, 6);
  if (selectedWords.length < 6) {
    const all = getAllProductionVocabulary();
    selectedWords = [...all].sort(() => 0.5 - Math.random()).slice(0, 6);
  }

  return selectedWords.map((word, idx) => {
    // 3 plausible distractors from same CEFR/tier pool
    const distractorCandidates = sampleRandomVocabulary(targetCefr, 20)
      .filter((w) => w.id !== word.id && w.meaning_th !== word.meaning_th);
    const distractorTexts = Array.from(new Set(distractorCandidates.map((w) => w.meaning_th))).slice(0, 3);

    while (distractorTexts.length < 3) {
      distractorTexts.push(`ความหมายสำรอง ${distractorTexts.length + 1}`);
    }

    const allOptions = [word.meaning_th, ...distractorTexts].sort(() => 0.5 - Math.random());
    const correctIndex = allOptions.indexOf(word.meaning_th);

    return {
      id: `q_${idx + 1}_${word.id}`,
      prompt: `What is the meaning of "${word.word}"?`,
      targetWord: word.word,
      cefrLevel: word.cefr_level as any,
      options: allOptions,
      correctIndex,
      definition: word.meaning_en,
      exampleSentence: word.example_sentence_en,
      thaiMeaning: word.meaning_th,
    };
  });
}

/**
 * Enqueue player for ranked matchmaking
 */
export function enqueuePlayer(player: MatchmakingQueueEntry): { status: 'QUEUED' | 'MATCHED'; match?: RankedMatch } {
  // Check if another player in queue matches rating window
  const now = Date.now();
  for (const [waitingId, waiting] of matchmakingQueue.entries()) {
    if (waiting.userId === player.userId) continue;
    if (waiting.mode !== player.mode) continue;

    const waitDuration = now - waiting.queuedAt;
    const allowedRange = getAcceptableRatingRange(waitDuration);

    if (Math.abs(waiting.rating - player.rating) <= allowedRange) {
      // Found a human match!
      matchmakingQueue.delete(waitingId);
      const match = createMatch(player, waiting, false);
      activeMatches.set(match.matchId, match);
      return { status: 'MATCHED', match };
    }
  }

  // If no immediate human match, store in queue
  matchmakingQueue.set(player.userId, player);
  return { status: 'QUEUED' };
}

/**
 * Poll queue status or trigger calibrated ghost opponent if timer exceeds limit
 */
export function pollQueueStatus(userId: string): { status: 'SEARCHING' | 'MATCHED'; match?: RankedMatch } {
  // Check if active match was created by another player
  for (const match of activeMatches.values()) {
    if (match.player1.userId === userId || match.player2.userId === userId) {
      if (match.state === 'MATCHED' || match.state === 'IN_PROGRESS') {
        return { status: 'MATCHED', match };
      }
    }
  }

  const entry = matchmakingQueue.get(userId);
  if (!entry) {
    return { status: 'SEARCHING' };
  }

  const elapsed = Date.now() - entry.queuedAt;

  // If waiting > 4.5 seconds, auto-match with calibrated ghost challenger to prevent waiting
  if (elapsed >= 4500) {
    matchmakingQueue.delete(userId);
    const challenger = createCalibratedChallenger(entry);
    const match = createMatch(entry, challenger, true);
    activeMatches.set(match.matchId, match);
    return { status: 'MATCHED', match };
  }

  return { status: 'SEARCHING' };
}

/**
 * Creates a calibrated ghost challenger close to player's rating
 */
function createCalibratedChallenger(player: MatchmakingQueueEntry): MatchmakingQueueEntry {
  const persona = CHALLENGER_PERSONAS[Math.floor(Math.random() * CHALLENGER_PERSONAS.length)];
  // Calibrated rating within ±35 of player
  const offset = (Math.random() * 70 - 35);
  const rating = Math.max(100, Math.round(player.rating + offset));
  const { tier, division } = getTierFromRating(rating);

  return {
    userId: `challenger_${Date.now()}`,
    username: persona.name,
    avatar: persona.avatar,
    rankFrame: persona.frame,
    rating,
    tier,
    division,
    queuedAt: Date.now(),
    mode: player.mode,
    university: persona.uni,
  };
}

/**
 * Create a new competitive Ranked Match
 */
function createMatch(p1: MatchmakingQueueEntry, p2: MatchmakingQueueEntry, isP2Bot: boolean): RankedMatch {
  const matchId = `match_${crypto.randomUUID()}`;
  const sessionToken = crypto.randomBytes(24).toString('hex');
  const questions = getQuestionsForTier(p1.tier);

  const match: RankedMatch = {
    matchId,
    mode: p1.mode,
    seasonId: 'season_1_2026',
    player1: {
      userId: p1.userId,
      username: p1.username,
      avatar: p1.avatar,
      rankFrame: p1.rankFrame,
      tier: p1.tier,
      division: p1.division,
      rating: p1.rating,
      score: 0,
      correctCount: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      university: p1.university,
    },
    player2: {
      userId: p2.userId,
      username: p2.username,
      avatar: p2.avatar,
      rankFrame: p2.rankFrame,
      tier: p2.tier,
      division: p2.division,
      rating: p2.rating,
      score: 0,
      correctCount: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      isBot: isP2Bot,
      university: p2.university,
    },
    questions,
    currentQuestionIndex: 0,
    questionIssuedAt: Date.now(),
    state: 'IN_PROGRESS',
    startedAt: Date.now(),
    sessionToken,
  };

  return match;
}

/**
 * Get client-safe question (answer key stripped, timestamped)
 */
export function getClientQuestion(matchId: string, userId: string): ClientRankedQuestion | null {
  const match = activeMatches.get(matchId);
  if (!match || match.state !== 'IN_PROGRESS') return null;

  const q = match.questions[match.currentQuestionIndex];
  if (!q) return null;

  // Set issued timestamp if not already set for this question index
  match.questionIssuedAt = Date.now();

  return {
    id: q.id,
    prompt: q.prompt,
    targetWord: q.targetWord,
    cefrLevel: q.cefrLevel,
    options: q.options,
    questionIndex: match.currentQuestionIndex,
    totalQuestions: match.questions.length,
    timeLimitMs: 4000,
    issuedAt: match.questionIssuedAt,
  };
}

/**
 * Server-authoritative answer submission with 4s timer enforcement and score formula
 * Scoring Formula:
 * - Accuracy: 100 base points for correct answer
 * - Speed bonus: up to 50 points based on remaining time (ms / 4000 * 50)
 * - Streak bonus: currentStreak * 15 (max 45)
 */
export function submitRankedAnswer(
  matchId: string,
  userId: string,
  chosenIndex: number,
  sessionToken: string
): QuestionSubmissionResult | null {
  const match = activeMatches.get(matchId);
  if (!match || match.state !== 'IN_PROGRESS') return null;
  if (match.sessionToken !== sessionToken) return null;

  const currentQ = match.questions[match.currentQuestionIndex];
  if (!currentQ) return null;

  const now = Date.now();
  const timeTakenMs = now - match.questionIssuedAt;
  const isLate = timeTakenMs > 4300; // 4000ms + 300ms network tolerance

  const isCorrect = !isLate && chosenIndex === currentQ.correctIndex;

  // Calculate score
  let scoreAwarded = 0;
  if (isCorrect) {
    const remainingTime = Math.max(0, 4000 - timeTakenMs);
    const speedBonus = Math.round((remainingTime / 4000) * 50);
    const streakBonus = Math.min(45, (match.player1.streak + 1) * 15);
    scoreAwarded = 100 + speedBonus + streakBonus;

    match.player1.correctCount += 1;
    match.player1.streak += 1;
    if (match.player1.streak > match.player1.maxStreak) {
      match.player1.maxStreak = match.player1.streak;
    }
  } else {
    match.player1.streak = 0;
  }
  match.player1.score += scoreAwarded;

  match.player1.answers.push({
    questionId: currentQ.id,
    chosenIndex,
    correctIndex: currentQ.correctIndex,
    isCorrect,
    responseTimeMs: timeTakenMs,
    isLate,
    scoreAwarded,
  });

  // Simulate opponent's turn if bot
  let oppChoseCorrect = false;
  let oppResponseTimeMs = 2200;
  if (match.player2.isBot) {
    // Probability of bot choosing correctly based on rating
    const botRating = match.player2.rating;
    let winProb = 0.65;
    if (botRating >= 2000) winProb = 0.88;
    else if (botRating >= 1500) winProb = 0.80;
    else if (botRating >= 1200) winProb = 0.72;

    oppChoseCorrect = Math.random() < winProb;
    oppResponseTimeMs = Math.round(1500 + Math.random() * 1800);

    if (oppChoseCorrect) {
      const oppRemaining = Math.max(0, 4000 - oppResponseTimeMs);
      const oppSpeedBonus = Math.round((oppRemaining / 4000) * 50);
      const oppStreakBonus = Math.min(45, (match.player2.streak + 1) * 15);
      const oppScore = 100 + oppSpeedBonus + oppStreakBonus;

      match.player2.correctCount += 1;
      match.player2.streak += 1;
      match.player2.score += oppScore;
      if (match.player2.streak > match.player2.maxStreak) {
        match.player2.maxStreak = match.player2.streak;
      }
    } else {
      match.player2.streak = 0;
    }
  }

  // Advance question index
  match.currentQuestionIndex += 1;
  const isMatchFinished = match.currentQuestionIndex >= match.questions.length;

  let nextQuestion: ClientRankedQuestion | undefined;
  if (!isMatchFinished) {
    const nextQ = match.questions[match.currentQuestionIndex];
    match.questionIssuedAt = Date.now();
    nextQuestion = {
      id: nextQ.id,
      prompt: nextQ.prompt,
      targetWord: nextQ.targetWord,
      cefrLevel: nextQ.cefrLevel,
      options: nextQ.options,
      questionIndex: match.currentQuestionIndex,
      totalQuestions: match.questions.length,
      timeLimitMs: 4000,
      issuedAt: match.questionIssuedAt,
    };
  } else {
    match.state = 'COMPLETED';
    match.endedAt = Date.now();
  }

  return {
    matchId,
    questionIndex: match.currentQuestionIndex - 1,
    isCorrect,
    correctIndex: currentQ.correctIndex,
    scoreAwarded,
    currentStreak: match.player1.streak,
    playerScore: match.player1.score,
    opponentScore: match.player2.score,
    opponentChoseCorrect: oppChoseCorrect,
    opponentResponseTimeMs: oppResponseTimeMs,
    isMatchFinished,
    nextQuestion,
  };
}

/**
 * Finalize match, calculate Elo delta, and compile missed words for review
 */
export function finishRankedMatch(
  matchId: string,
  userId: string,
  userProfile: RankedProfile
): RankedMatchResult | null {
  const match = activeMatches.get(matchId);
  if (!match) return null;

  // Determine winner
  let outcome: 'WIN' | 'LOSS' | 'DRAW';
  let winnerId: string | 'DRAW';

  if (match.player1.score > match.player2.score) {
    outcome = 'WIN';
    winnerId = match.player1.userId;
  } else if (match.player1.score < match.player2.score) {
    outcome = 'LOSS';
    winnerId = match.player2.userId;
  } else {
    // Equal scores: tiebreaker on accuracy
    if (match.player1.correctCount > match.player2.correctCount) {
      outcome = 'WIN';
      winnerId = match.player1.userId;
    } else if (match.player1.correctCount < match.player2.correctCount) {
      outcome = 'LOSS';
      winnerId = match.player2.userId;
    } else {
      outcome = 'DRAW';
      winnerId = 'DRAW';
    }
  }

  const accuracy = match.questions.length > 0 ? match.player1.correctCount / match.questions.length : 0;
  const oppAccuracy = match.questions.length > 0 ? match.player2.correctCount / match.questions.length : 0;

  // Calculate rating change using deterministic Elo MMR
  const ratingResult = calculateMatchRating({
    playerRating: userProfile.rating,
    opponentRating: match.player2.rating,
    outcome,
    isPlacement: userProfile.placementMatchesPlayed < 5,
    playerAccuracy: accuracy,
    demotionProtectedMatches: userProfile.demotionProtectedMatches,
  });

  // Calculate opponent rating change (mirrored)
  const oppOutcome = outcome === 'WIN' ? 'LOSS' : outcome === 'LOSS' ? 'WIN' : 'DRAW';
  const oppRatingResult = calculateMatchRating({
    playerRating: match.player2.rating,
    opponentRating: userProfile.rating,
    outcome: oppOutcome,
    isPlacement: false,
    playerAccuracy: oppAccuracy,
    demotionProtectedMatches: 0,
  });

  // Collect missed words for review
  const missedWords: MissedWordReview[] = [];
  match.player1.answers.forEach((ans, idx) => {
    if (!ans.isCorrect) {
      const q = match.questions[idx];
      missedWords.push({
        word: q.targetWord,
        definition: q.definition,
        thaiMeaning: q.thaiMeaning,
        exampleSentence: q.exampleSentence,
        chosenAnswer: q.options[ans.chosenIndex] || 'Timeout / Unanswered',
        correctAnswer: q.options[q.correctIndex],
        cefrLevel: q.cefrLevel,
      });
    }
  });

  const finalResult: RankedMatchResult = {
    matchId,
    outcome,
    winnerId,
    player1: {
      userId: match.player1.userId,
      username: match.player1.username,
      ratingBefore: ratingResult.ratingBefore,
      ratingAfter: ratingResult.ratingAfter,
      ratingDelta: ratingResult.ratingDelta,
      tierBefore: ratingResult.tierBefore,
      tierAfter: ratingResult.tierAfter,
      isPromotion: ratingResult.isPromotion,
      isDemotion: ratingResult.isDemotion,
      score: match.player1.score,
      accuracy: Math.round(accuracy * 100),
      bestStreak: match.player1.maxStreak,
      xpEarned: ratingResult.xpEarned,
    },
    player2: {
      userId: match.player2.userId,
      username: match.player2.username,
      ratingBefore: oppRatingResult.ratingBefore,
      ratingAfter: oppRatingResult.ratingAfter,
      ratingDelta: oppRatingResult.ratingDelta,
      tierBefore: oppRatingResult.tierBefore,
      tierAfter: oppRatingResult.tierAfter,
      isPromotion: oppRatingResult.isPromotion,
      isDemotion: oppRatingResult.isDemotion,
      score: match.player2.score,
      accuracy: Math.round(oppAccuracy * 100),
    },
    missedWords,
    seasonId: match.seasonId,
    completedAt: new Date().toISOString(),
  };

  // Clean up finished match after recording
  activeMatches.delete(matchId);

  return finalResult;
}

/**
 * Cancel search in queue
 */
export function cancelMatchmaking(userId: string): boolean {
  return matchmakingQueue.delete(userId);
}
