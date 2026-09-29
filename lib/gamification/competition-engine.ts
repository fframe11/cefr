import crypto from 'crypto';
import { VOCABULARY_BANK } from '../../data/vocabularyBank';
import {
  CompetitionDifficultyStage,
  CompetitionQuestionClient,
  CompetitionAnswerResult,
  CompetitionSummary,
} from '../../types/gamification';
import { CEFRLevel, VocabularyWord } from '../../types';
import { sampleRandomVocabulary, recordToVocabularyWord } from '../vocabulary/production-vocabulary';

interface ServerSessionQuestion {
  questionId: string;
  word: VocabularyWord;
  prompt: string;
  options: string[];
  correctAnswer: string;
  issuedAt: number; // Server timestamp in ms (T0)
  answered: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  timeTakenMs?: number;
  isLate?: boolean;
  stage: CompetitionDifficultyStage;
}

interface ServerCompetitionSession {
  sessionId: string;
  userId: string;
  currentStage: CompetitionDifficultyStage;
  score: number;
  streak: number;
  maxStreak: number;
  questions: ServerSessionQuestion[];
  missedWords: VocabularyWord[];
  createdAt: number;
  isFinished: boolean;
  totalXpEarned: number;
}

// In-memory competition sessions store
const sessionsStore = new Map<string, ServerCompetitionSession>();

const STAGE_CEFR_MAP: Record<CompetitionDifficultyStage, string> = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
};

const STAGE_NAMES: Record<CompetitionDifficultyStage, string> = {
  1: 'Stage 1 — Novice (A1)',
  2: 'Stage 2 — Explorer (A2)',
  3: 'Stage 3 — Intermediate (B1)',
  4: 'Stage 4 — Advanced (B2)',
  5: 'Stage 5 — Apex (C1)',
};



/**
 * Filter vocabulary bank by CEFR stage, sourced from verified production catalog
 */
function getWordsForStage(stage: CompetitionDifficultyStage): VocabularyWord[] {
  const targetCefr = STAGE_CEFR_MAP[stage] as CEFRLevel;
  const prodItems = sampleRandomVocabulary(targetCefr, 50);
  if (prodItems.length >= 4) {
    return prodItems.map((r) => recordToVocabularyWord(r));
  }
  const matching = VOCABULARY_BANK.filter((w) => w.cefrLevel === targetCefr);
  if (matching.length >= 4) return matching;
  return VOCABULARY_BANK;
}

/**
 * Generate a single question with shuffled options and answer key strictly hidden on server
 */
function generateQuestion(stage: CompetitionDifficultyStage): ServerSessionQuestion {
  const words = getWordsForStage(stage);
  const targetWord = words[Math.floor(Math.random() * words.length)];

  // Pick 3 distractors from same level if possible
  const otherWords = words.filter((w) => w.id !== targetWord.id);
  const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
  const distractors = shuffledOthers.slice(0, 3).map((w) => w.meaningTh);

  // If not enough distractors from same stage, pull from general bank
  while (distractors.length < 3) {
    const randomWord = VOCABULARY_BANK[Math.floor(Math.random() * VOCABULARY_BANK.length)];
    if (randomWord.id !== targetWord.id && !distractors.includes(randomWord.meaningTh)) {
      distractors.push(randomWord.meaningTh);
    }
  }

  const correctAnswer = targetWord.meaningTh;
  const options = [...distractors, correctAnswer].sort(() => 0.5 - Math.random());

  return {
    questionId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    word: targetWord,
    prompt: `เลือกความหมายที่ถูกต้องที่สุดของคำว่า "${targetWord.word}" (${targetWord.partOfSpeech})`,
    options,
    correctAnswer,
    issuedAt: Date.now(),
    answered: false,
    stage,
  };
}

/**
 * Format question for client: removes correctAnswer to prevent inspection in devtools
 */
function sanitizeForClient(q: ServerSessionQuestion): CompetitionQuestionClient {
  return {
    questionId: q.questionId,
    word: q.word.word,
    partOfSpeech: q.word.partOfSpeech,
    ipa: q.word.ipa,
    prompt: q.prompt,
    options: q.options,
    stage: q.stage,
    stageName: STAGE_NAMES[q.stage],
  };
}

/**
 * Start a new competition battle session
 */
export function startCompetitionSession(userId: string): {
  sessionId: string;
  initialQuestion: CompetitionQuestionClient;
} {
  const sessionId = `comp_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const initialQuestion = generateQuestion(1);

  const session: ServerCompetitionSession = {
    sessionId,
    userId,
    currentStage: 1,
    score: 0,
    streak: 0,
    maxStreak: 0,
    questions: [initialQuestion],
    missedWords: [],
    createdAt: Date.now(),
    isFinished: false,
    totalXpEarned: 0,
  };

  sessionsStore.set(sessionId, session);

  return {
    sessionId,
    initialQuestion: sanitizeForClient(initialQuestion),
  };
}

/**
 * Validate answer against 4-second window (server-authoritative) and calculate adaptive transition
 */
export function submitCompetitionAnswer(params: {
  sessionId: string;
  userId: string;
  questionId: string;
  selectedOption: string;
}): CompetitionAnswerResult {
  const { sessionId, userId, questionId, selectedOption } = params;
  const session = sessionsStore.get(sessionId);

  if (!session || session.userId !== userId) {
    throw new Error('Invalid or unauthorized competition session');
  }

  if (session.isFinished) {
    throw new Error('Competition session is already completed');
  }

  const question = session.questions.find((q) => q.questionId === questionId);
  if (!question) {
    throw new Error('Question not found in this session');
  }

  if (question.answered) {
    throw new Error('Replay detected: question has already been answered');
  }

  // 4-SECOND TIMING CHECK (Server Authoritative)
  const now = Date.now();
  const timeTakenMs = now - question.issuedAt;
  const ALLOWED_LIMIT_MS = 4000;
  const NETWORK_GRACE_MS = 300; // 300ms grace for legitimate network ping
  const isLate = timeTakenMs > ALLOWED_LIMIT_MS + NETWORK_GRACE_MS;

  question.answered = true;
  question.userAnswer = selectedOption;
  question.timeTakenMs = timeTakenMs;
  question.isLate = isLate;

  const isExactMatch = selectedOption === question.correctAnswer;
  const isCorrect = isExactMatch && !isLate;
  question.isCorrect = isCorrect;

  let xpEarned = 0;

  if (isCorrect) {
    session.streak++;
    if (session.streak > session.maxStreak) {
      session.maxStreak = session.streak;
    }
    // Score based on stage and speed bonus
    const stageMultiplier = question.stage * 10;
    const speedBonus = timeTakenMs < 2000 ? 5 : 0;
    const questionScore = stageMultiplier + speedBonus;
    session.score += questionScore;

    xpEarned = Math.round(question.stage * 4 + speedBonus);
    session.totalXpEarned += xpEarned;

    // Adaptive promotion: 2 consecutive correct answers advance stage
    if (session.streak >= 2 && session.currentStage < 5) {
      session.currentStage = (session.currentStage + 1) as CompetitionDifficultyStage;
    }
  } else {
    // Incorrect or Late
    session.streak = 0;
    session.missedWords.push(question.word);

    // Adaptive demotion: error drops stage if above 1
    if (session.currentStage > 1) {
      session.currentStage = (session.currentStage - 1) as CompetitionDifficultyStage;
    }
  }

  // Generate next question if battle continues (e.g. 10 questions per match)
  let nextQuestionClient: CompetitionQuestionClient | undefined;
  if (session.questions.length < 10) {
    const nextQ = generateQuestion(session.currentStage);
    session.questions.push(nextQ);
    nextQuestionClient = sanitizeForClient(nextQ);
  }

  return {
    correct: isCorrect,
    timeTakenMs,
    isLate,
    xpEarned,
    newStreak: session.streak,
    newScore: session.score,
    nextStage: session.currentStage,
    correctAnswerText: question.correctAnswer,
    nextQuestion: nextQuestionClient,
  };
}

/**
 * Conclude competition battle, tally final statistics and return missed words for review
 */
export function finishCompetitionSession(sessionId: string, userId: string): CompetitionSummary {
  const session = sessionsStore.get(sessionId);
  if (!session || session.userId !== userId) {
    throw new Error('Session not found or invalid');
  }

  session.isFinished = true;

  const answeredQuestions = session.questions.filter((q) => q.answered);
  const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;
  const accuracyPercent = answeredQuestions.length > 0
    ? Math.round((correctCount / answeredQuestions.length) * 100)
    : 0;

  // Find highest stage reached
  const highestStageReached = Math.max(
    ...session.questions.map((q) => q.stage),
    1
  ) as CompetitionDifficultyStage;

  return {
    sessionId: session.sessionId,
    finalScore: session.score,
    accuracyPercent,
    maxStreak: session.maxStreak,
    totalXpEarned: session.totalXpEarned,
    highestStageReached,
    missedWords: session.missedWords.map((w) => ({
      word: w.word,
      meaningTh: w.meaningTh,
      meaningEn: w.meaningEn,
      cefrLevel: w.cefrLevel,
    })),
    previousRank: 18,
    newRank: Math.max(1, 18 - Math.floor(session.score / 60)),
  };
}
