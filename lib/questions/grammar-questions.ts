/**
 * ==============================================================================
 * GLOVA Server-Authoritative Grammar Question Engine
 * ==============================================================================
 *
 * Provides CEFR-calibrated grammar questions across A1–C2 from the curated
 * question bank (160 items) with Item Response Theory (IRT) parameterization.
 *
 * Security Invariant:
 * Server-authoritative answer keys are preserved; client-facing questions
 * are strictly sanitized via `sanitizeGrammarQuestionForClient` to eliminate
 * `isCorrect` and internal IRT answer metrics prior to network dispatch.
 * ==============================================================================
 */

import { CEFRLevel, Question, QuestionOption, QuestionType } from '../../types';
import grammarData from '../../data/grammar-question-bank.json';

export interface RawGrammarItem {
  id: string;
  cefr_level: CEFRLevel;
  grammar_topic: string;
  question_type: 'gap_fill' | 'multiple_choice' | 'error_correction';
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
  weakness_tag: string;
  source: string;
}

export interface GeneratedGrammarQuestion extends Question {
  targetQuestionId: string;
  grammarTopic: string;
  serverAnswerKey: string; // 'A' | 'B' | 'C' | 'D'
  difficulty_b: number;
  discrimination_a: number;
  guessing_c: number;
}

export interface ClientSanitizedGrammarQuestion {
  id: string;
  skill: 'grammar';
  cefrLevel: CEFRLevel;
  type: QuestionType;
  grammarTopic: string;
  promptEn: string;
  promptTh: string;
  contextPassage?: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  difficultyWeight: number;
}

const ALL_GRAMMAR_ITEMS: RawGrammarItem[] = grammarData as RawGrammarItem[];

/**
 * Retrieve all raw grammar question items.
 */
export function getAllGrammarItems(): RawGrammarItem[] {
  return ALL_GRAMMAR_ITEMS;
}

/**
 * Filter grammar question items by CEFR level.
 */
export function getGrammarItemsByCefr(level: CEFRLevel): RawGrammarItem[] {
  return ALL_GRAMMAR_ITEMS.filter((item) => item.cefr_level === level);
}

/**
 * Find a specific grammar question item by ID.
 */
export function getGrammarItemById(id: string): RawGrammarItem | undefined {
  return ALL_GRAMMAR_ITEMS.find((item) => item.id === id);
}

/**
 * Convert a RawGrammarItem into a server-authoritative GeneratedGrammarQuestion.
 */
export function formatGeneratedGrammarQuestion(raw: RawGrammarItem): GeneratedGrammarQuestion {
  const correctOption = raw.options.find((opt) => opt.text === raw.correct_answer) || raw.options[0];
  const serverAnswerKey = correctOption.key;

  const options: QuestionOption[] = raw.options.map((opt) => ({
    key: opt.key,
    text: opt.text,
    isCorrect: opt.key === serverAnswerKey,
    feedbackTh:
      opt.key === serverAnswerKey
        ? 'ถูกต้อง! ' + raw.explanation_th
        : `ยังไม่ถูกต้อง คำตอบที่ถูกต้องคือ "${raw.correct_answer}" (${raw.explanation_th})`,
  }));

  const difficultyWeight =
    raw.cefr_level === 'A1'
      ? 1
      : raw.cefr_level === 'A2'
      ? 2
      : raw.cefr_level === 'B1'
      ? 3
      : raw.cefr_level === 'B2'
      ? 4
      : raw.cefr_level === 'C1'
      ? 5
      : 6;

  return {
    id: `gq_${raw.id}_${Date.now()}`,
    targetQuestionId: raw.id,
    grammarTopic: raw.grammar_topic,
    serverAnswerKey,
    skill: 'grammar',
    cefrLevel: raw.cefr_level,
    type: 'multiple_choice',
    promptEn: 'Choose the grammatically correct word or phrase to complete the sentence:',
    promptTh: 'เลือกคำหรือโครงสร้างไวยากรณ์ที่ถูกต้องที่สุดเพื่อเติมในช่องว่าง:',
    contextPassage: raw.stem_en,
    options,
    explanationEn: raw.explanation_en,
    explanationTh: raw.explanation_th,
    weaknessTag: raw.weakness_tag,
    difficultyWeight,
    difficulty_b: raw.difficulty_b,
    discrimination_a: raw.discrimination_a,
    guessing_c: raw.guessing_c,
  };
}

/**
 * Pick a random question for a given CEFR level and optional topic.
 */
export function generateGrammarQuestion(
  cefrLevel: CEFRLevel,
  topic?: string,
  excludeIds: string[] = []
): GeneratedGrammarQuestion | null {
  let candidates = getGrammarItemsByCefr(cefrLevel);
  if (topic) {
    const topicFiltered = candidates.filter((item) => item.grammar_topic === topic);
    if (topicFiltered.length > 0) {
      candidates = topicFiltered;
    }
  }

  const available = candidates.filter((c) => !excludeIds.includes(c.id));
  const pool = available.length > 0 ? available : candidates;

  if (pool.length === 0) return null;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return formatGeneratedGrammarQuestion(picked);
}

/**
 * Generate a practice grammar session.
 */
export function generateGrammarSession(params: {
  cefrLevel?: CEFRLevel;
  count?: number;
  topics?: string[];
}): {
  questions: GeneratedGrammarQuestion[];
  clientQuestions: ClientSanitizedGrammarQuestion[];
} {
  const count = Math.max(1, Math.min(30, params.count || 5));
  const level = params.cefrLevel || 'B1';
  let pool = getGrammarItemsByCefr(level);

  if (params.topics && params.topics.length > 0) {
    const topicMatches = pool.filter((item) => params.topics!.includes(item.grammar_topic));
    if (topicMatches.length >= count) {
      pool = topicMatches;
    }
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count).map(formatGeneratedGrammarQuestion);

  return {
    questions: selected,
    clientQuestions: selected.map(sanitizeGrammarQuestionForClient),
  };
}

/**
 * Sanitizes a GeneratedGrammarQuestion before dispatching to client viewports.
 * Guaranteed zero leakage of `isCorrect` or `serverAnswerKey`.
 */
export function sanitizeGrammarQuestionForClient(q: GeneratedGrammarQuestion): ClientSanitizedGrammarQuestion {
  return {
    id: q.id,
    skill: 'grammar',
    cefrLevel: q.cefrLevel,
    type: q.type,
    grammarTopic: q.grammarTopic,
    promptEn: q.promptEn,
    promptTh: q.promptTh,
    contextPassage: q.contextPassage,
    options: (q.options || []).map((opt) => ({
      key: opt.key,
      text: opt.text,
    })),
    difficultyWeight: q.difficultyWeight,
  };
}
