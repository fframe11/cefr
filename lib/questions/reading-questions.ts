/**
 * ==============================================================================
 * GLOVA Server-Authoritative Reading Comprehension Engine
 * ==============================================================================
 *
 * Provides CEFR-graded reading passages (A1–C2, 16 passages, 74 items)
 * calibrated with 3PL Item Response Theory (IRT) parameters.
 *
 * Security Invariant:
 * Server-authoritative answer keys and `isCorrect` flags are never sent to
 * client frontends before submission.
 * ==============================================================================
 */

import { CEFRLevel, Question, QuestionOption, QuestionType } from '../../types';
import readingData from '../../data/reading-passages.json';

export interface RawReadingQuestion {
  id: string;
  question_type: 'main_idea' | 'detail' | 'inference' | 'vocabulary_in_context' | 'true_false_not_given';
  difficulty_b: number;
  discrimination_a: number;
  guessing_c: number;
  stem_en: string;
  correct_answer: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  explanation_en: string;
  explanation_th: string;
  evidence_line?: string;
  weakness_tag: string;
}

export interface RawReadingPassage {
  id: string;
  cefr_level: CEFRLevel;
  title_en: string;
  title_th: string;
  topic: string;
  word_count: number;
  passage_en: string;
  questions: RawReadingQuestion[];
}

export interface GeneratedReadingQuestion extends Question {
  passageId: string;
  passageTitleEn: string;
  passageTitleTh: string;
  passageEn: string;
  evidenceLine?: string;
  serverAnswerKey: string;
  difficulty_b: number;
  discrimination_a: number;
  guessing_c: number;
}

export interface ClientSanitizedReadingQuestion {
  id: string;
  skill: 'reading';
  cefrLevel: CEFRLevel;
  type: QuestionType;
  passageId: string;
  passageTitleEn: string;
  passageTitleTh: string;
  passageEn: string;
  promptEn: string;
  promptTh: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  difficultyWeight: number;
}

const ALL_PASSAGES: RawReadingPassage[] = readingData as RawReadingPassage[];

/**
 * Retrieve all reading passages.
 */
export function getAllReadingPassages(): RawReadingPassage[] {
  return ALL_PASSAGES;
}

/**
 * Filter reading passages by CEFR level.
 */
export function getReadingPassagesByCefr(level: CEFRLevel): RawReadingPassage[] {
  return ALL_PASSAGES.filter((p) => p.cefr_level === level);
}

/**
 * Find a specific passage by ID.
 */
export function getReadingPassageById(id: string): RawReadingPassage | undefined {
  return ALL_PASSAGES.find((p) => p.id === id);
}

/**
 * Retrieve all raw reading questions across all passages.
 */
export function getAllReadingQuestions(): Array<{ passage: RawReadingPassage; question: RawReadingQuestion }> {
  const result: Array<{ passage: RawReadingPassage; question: RawReadingQuestion }> = [];
  for (const passage of ALL_PASSAGES) {
    for (const q of passage.questions) {
      result.push({ passage, question: q });
    }
  }
  return result;
}

/**
 * Format a raw reading question into a server-authoritative GeneratedReadingQuestion.
 */
export function formatGeneratedReadingQuestion(
  passage: RawReadingPassage,
  q: RawReadingQuestion
): GeneratedReadingQuestion {
  const correctOption = q.options.find((opt) => opt.text === q.correct_answer) || q.options[0];
  const serverAnswerKey = correctOption.key;

  const options: QuestionOption[] = q.options.map((opt) => ({
    key: opt.key,
    text: opt.text,
    isCorrect: opt.key === serverAnswerKey,
    feedbackTh:
      opt.key === serverAnswerKey
        ? 'ถูกต้อง! ' + q.explanation_th
        : `ยังไม่ถูกต้อง คำตอบที่ถูกต้องคือ "${q.correct_answer}" (${q.explanation_th})`,
  }));

  const difficultyWeight =
    passage.cefr_level === 'A1'
      ? 1
      : passage.cefr_level === 'A2'
      ? 2
      : passage.cefr_level === 'B1'
      ? 3
      : passage.cefr_level === 'B2'
      ? 4
      : passage.cefr_level === 'C1'
      ? 5
      : 6;

  return {
    id: `rq_${q.id}_${Date.now()}`,
    passageId: passage.id,
    passageTitleEn: passage.title_en,
    passageTitleTh: passage.title_th,
    passageEn: passage.passage_en,
    evidenceLine: q.evidence_line,
    serverAnswerKey,
    skill: 'reading',
    cefrLevel: passage.cefr_level,
    type: 'multiple_choice',
    promptEn: q.stem_en,
    promptTh: q.stem_en,
    options,
    explanationEn: q.explanation_en,
    explanationTh: q.explanation_th,
    weaknessTag: q.weakness_tag,
    difficultyWeight,
    difficulty_b: q.difficulty_b,
    discrimination_a: q.discrimination_a,
    guessing_c: q.guessing_c,
  };
}

/**
 * Generate a reading practice session.
 */
export function generateReadingSession(params: {
  cefrLevel?: CEFRLevel;
  passageCount?: number;
}): {
  questions: GeneratedReadingQuestion[];
  clientQuestions: ClientSanitizedReadingQuestion[];
} {
  const level = params.cefrLevel || 'B1';
  const passages = getReadingPassagesByCefr(level);
  if (passages.length === 0) {
    return { questions: [], clientQuestions: [] };
  }

  const chosenPassage = passages[Math.floor(Math.random() * passages.length)];
  const questions = chosenPassage.questions.map((q) => formatGeneratedReadingQuestion(chosenPassage, q));

  return {
    questions,
    clientQuestions: questions.map(sanitizeReadingQuestionForClient),
  };
}

/**
 * Sanitizes a reading question before client transmission.
 */
export function sanitizeReadingQuestionForClient(q: GeneratedReadingQuestion): ClientSanitizedReadingQuestion {
  return {
    id: q.id,
    skill: 'reading',
    cefrLevel: q.cefrLevel,
    type: q.type,
    passageId: q.passageId,
    passageTitleEn: q.passageTitleEn,
    passageTitleTh: q.passageTitleTh,
    passageEn: q.passageEn,
    promptEn: q.promptEn,
    promptTh: q.promptTh,
    options: (q.options || []).map((opt) => ({
      key: opt.key,
      text: opt.text,
    })),
    difficultyWeight: q.difficultyWeight,
  };
}
