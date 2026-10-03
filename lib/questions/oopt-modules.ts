/**
 * ==============================================================================
 * GLOVA Server-Authoritative OOPT Part 2 & Part 3 Engine
 * ==============================================================================
 *
 * Implements Oxford Online Placement Test (OOPT) standards:
 * - Part 2: Focus on Meaning in Conversation (3 options, pragmatics & idioms)
 * - Part 3: Open Cloze Gap-Fill in Connected Text (structural words)
 *
 * Security Invariant:
 * Server-authoritative answer verification. Answers and explanations are
 * strictly withheld from client viewports until evaluation.
 * ==============================================================================
 */

import part2Data from '../../data/ooptPart2Meaning.json';
import part3Data from '../../data/ooptPart3Cloze.json';
import { CEFRLevel } from '../../types';

export interface RawPart2Item {
  id: string;
  speaker_1: string;
  dialogue_1: string;
  speaker_2: string;
  dialogue_2: string;
  question_prompt: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  correct_answer: string;
  explanation_th: string;
  explanation_en: string;
  idiom_tag: string;
  cefr_level: CEFRLevel;
}

export interface ClientSanitizedPart2Item {
  id: string;
  speaker_1: string;
  dialogue_1: string;
  speaker_2: string;
  dialogue_2: string;
  question_prompt: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  idiom_tag: string;
  cefr_level: CEFRLevel;
}

export interface RawPart3Gap {
  gap_number: number;
  target_word: string;
  acceptable_answers: string[];
  word_type: string;
  hint_th: string;
  explanation_th: string;
}

export interface RawPart3Passage {
  id: string;
  title: string;
  genre: string;
  cefr_level: CEFRLevel;
  introduction_th: string;
  passage_template: string;
  gaps: RawPart3Gap[];
}

export interface ClientSanitizedPart3Passage {
  id: string;
  title: string;
  genre: string;
  cefr_level: CEFRLevel;
  introduction_th: string;
  passage_template: string;
  gaps: Array<{
    gap_number: number;
    word_type: string;
    hint_th: string;
  }>;
}

const ALL_PART2_ITEMS: RawPart2Item[] = part2Data as RawPart2Item[];
const ALL_PART3_PASSAGES: RawPart3Passage[] = part3Data as RawPart3Passage[];

/**
 * Retrieve all Part 2 meaning questions.
 */
export function getAllPart2MeaningQuestions(): RawPart2Item[] {
  return ALL_PART2_ITEMS;
}

/**
 * Find Part 2 question by ID.
 */
export function getPart2MeaningQuestionById(id: string): RawPart2Item | undefined {
  return ALL_PART2_ITEMS.find((it) => it.id === id);
}

/**
 * Sanitize Part 2 item for safe transmission to client.
 */
export function sanitizePart2ForClient(raw: RawPart2Item): ClientSanitizedPart2Item {
  return {
    id: raw.id,
    speaker_1: raw.speaker_1,
    dialogue_1: raw.dialogue_1,
    speaker_2: raw.speaker_2,
    dialogue_2: raw.dialogue_2,
    question_prompt: raw.question_prompt,
    options: raw.options.map((opt) => ({
      key: opt.key,
      text: opt.text,
    })),
    idiom_tag: raw.idiom_tag,
    cefr_level: raw.cefr_level,
  };
}

/**
 * Evaluate a Part 2 response server-side.
 */
export function evaluatePart2Answer(questionId: string, selectedKey: string): {
  isCorrect: boolean;
  correctAnswer: string;
  explanationTh: string;
  explanationEn: string;
} {
  const item = getPart2MeaningQuestionById(questionId);
  if (!item) {
    throw new Error(`Part 2 question not found: ${questionId}`);
  }

  const isCorrect = selectedKey.trim().toUpperCase() === item.correct_answer.trim().toUpperCase();
  return {
    isCorrect,
    correctAnswer: item.correct_answer,
    explanationTh: item.explanation_th,
    explanationEn: item.explanation_en,
  };
}

/**
 * Retrieve all Part 3 cloze passages.
 */
export function getAllPart3ClozePassages(): RawPart3Passage[] {
  return ALL_PART3_PASSAGES;
}

/**
 * Find Part 3 passage by ID.
 */
export function getPart3ClozePassageById(id: string): RawPart3Passage | undefined {
  return ALL_PART3_PASSAGES.find((p) => p.id === id);
}

/**
 * Sanitize Part 3 passage for client, withholding answers.
 */
export function sanitizePart3ForClient(p: RawPart3Passage): ClientSanitizedPart3Passage {
  return {
    id: p.id,
    title: p.title,
    genre: p.genre,
    cefr_level: p.cefr_level,
    introduction_th: p.introduction_th,
    passage_template: p.passage_template,
    gaps: p.gaps.map((g) => ({
      gap_number: g.gap_number,
      word_type: g.word_type,
      hint_th: g.hint_th,
    })),
  };
}

/**
 * Evaluate Part 3 cloze submissions server-side.
 */
export function evaluatePart3Answers(
  passageId: string,
  userAnswers: Record<number, string>
): {
  score: number;
  totalGaps: number;
  results: Array<{
    gap_number: number;
    user_answer: string;
    is_correct: boolean;
    accepted_answers: string[];
    explanation_th: string;
  }>;
} {
  const passage = getPart3ClozePassageById(passageId);
  if (!passage) {
    throw new Error(`Part 3 passage not found: ${passageId}`);
  }

  let correctCount = 0;
  const results = passage.gaps.map((gap) => {
    const rawUser = (userAnswers[gap.gap_number] || '').trim().toLowerCase();
    const isCorrect = gap.acceptable_answers.some((ans) => ans.trim().toLowerCase() === rawUser);
    if (isCorrect) correctCount++;

    return {
      gap_number: gap.gap_number,
      user_answer: userAnswers[gap.gap_number] || '',
      is_correct: isCorrect,
      accepted_answers: gap.acceptable_answers,
      explanation_th: gap.explanation_th,
    };
  });

  return {
    score: correctCount,
    totalGaps: passage.gaps.length,
    results,
  };
}
