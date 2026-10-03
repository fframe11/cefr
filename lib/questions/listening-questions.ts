/**
 * ==============================================================================
 * GLOVA Server-Authoritative Listening Comprehension Engine
 * ==============================================================================
 *
 * Provides CEFR-calibrated listening questions across A1–C1 from the comprehensive
 * listening bank synthesized from Oxford Online Placement Test (OOPT) Section 2 formats.
 *
 * Security Invariant:
 * Server-authoritative answer keys are preserved; client-facing questions
 * are strictly sanitized via `sanitizeListeningQuestionForClient` to eliminate
 * `isCorrect` and internal metrics prior to network dispatch.
 * ==============================================================================
 */

import { CEFRLevel, ListeningExercise, Question, QuestionOption, QuestionType } from '../../types';
import { LISTENING_BANK } from '../../data/listeningBank';

export interface ClientSanitizedListeningQuestion {
  id: string;
  exerciseId: string;
  skill: 'listening';
  cefrLevel: CEFRLevel;
  type: QuestionType;
  promptEn: string;
  promptTh: string;
  options: Array<{
    key: string;
    text: string;
  }>;
}

export interface ListeningEvaluationResult {
  questionId: string;
  isCorrect: boolean;
  selectedKey: string;
  correctAnswerKey: string;
  explanationTh: string;
  explanationEn: string;
  weaknessTag: string;
}

/**
 * Returns all listening exercises from the curated listening bank.
 */
export function getAllListeningExercises(): ListeningExercise[] {
  return LISTENING_BANK;
}

/**
 * Returns an exercise by its unique identifier.
 */
export function getListeningExerciseById(id: string): ListeningExercise | undefined {
  return LISTENING_BANK.find((ex) => ex.id === id);
}

/**
 * Flattens all questions across all listening exercises.
 */
export function getAllListeningQuestions(): Array<Question & { exerciseId: string; exerciseTitle: string }> {
  const result: Array<Question & { exerciseId: string; exerciseTitle: string }> = [];
  for (const ex of LISTENING_BANK) {
    for (const q of ex.questions) {
      result.push({
        ...q,
        exerciseId: ex.id,
        exerciseTitle: ex.title,
      });
    }
  }
  return result;
}

/**
 * Filters listening questions by CEFR level.
 */
export function getListeningQuestionsByLevel(level: CEFRLevel): Question[] {
  const all = getAllListeningQuestions();
  return all.filter((q) => q.cefrLevel === level);
}

/**
 * Strips answer flags and explanations before sending to client.
 */
export function sanitizeListeningQuestionForClient(
  question: Question,
  exerciseId: string
): ClientSanitizedListeningQuestion {
  return {
    id: question.id,
    exerciseId,
    skill: 'listening',
    cefrLevel: question.cefrLevel,
    type: question.type,
    promptEn: question.promptEn,
    promptTh: question.promptTh,
    options: question.options.map((opt) => ({
      key: opt.key,
      text: opt.text,
    })),
  };
}

/**
 * Server-side evaluation for a submitted answer to a listening question.
 */
export function evaluateListeningAnswer(
  questionId: string,
  selectedKey: string
): ListeningEvaluationResult | null {
  const all = getAllListeningQuestions();
  const target = all.find((q) => q.id === questionId);
  if (!target) return null;

  const correctOption = target.options.find((opt) => opt.isCorrect);
  const correctKey = correctOption ? correctOption.key : 'A';
  const isCorrect = selectedKey.toUpperCase().trim() === correctKey.toUpperCase().trim();

  return {
    questionId,
    isCorrect,
    selectedKey,
    correctAnswerKey: correctKey,
    explanationTh: target.explanationTh || '',
    explanationEn: target.explanationEn || '',
    weaknessTag: target.weaknessTag || 'listening_comprehension',
  };
}
