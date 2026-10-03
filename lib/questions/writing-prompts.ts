/**
 * ==============================================================================
 * GLOVA Server-Authoritative Writing Prompt Engine
 * ==============================================================================
 *
 * Provides CEFR-benchmarked writing prompts (A1–C2, 12 tasks) with multi-axis
 * analytic scoring rubrics, official can-do descriptors, and model answers.
 * ==============================================================================
 */

import { CEFRLevel } from '../../types';
import promptsData from '../../data/writing-prompts.json';

export interface WritingRubric {
  task_achievement: string;
  coherence_cohesion: string;
  lexical_resource: string;
  grammatical_accuracy: string;
}

export interface WritingPromptItem {
  id: string;
  cefr_level: CEFRLevel;
  task_type: string;
  title_en: string;
  title_th: string;
  instruction_en: string;
  instruction_th: string;
  min_words: number;
  max_words: number;
  scoring_rubric: WritingRubric;
  sample_answer_en: string;
  cefr_descriptors: string[];
}

export interface ClientSanitizedWritingPrompt {
  id: string;
  cefr_level: CEFRLevel;
  task_type: string;
  title_en: string;
  title_th: string;
  instruction_en: string;
  instruction_th: string;
  min_words: number;
  max_words: number;
  rubric_summary: {
    criteria: string[];
  };
}

const ALL_WRITING_PROMPTS: WritingPromptItem[] = promptsData as WritingPromptItem[];

/**
 * Retrieve all writing prompts.
 */
export function getAllWritingPrompts(): WritingPromptItem[] {
  return ALL_WRITING_PROMPTS;
}

/**
 * Filter writing prompts by CEFR level.
 */
export function getWritingPromptsByCefr(level: CEFRLevel): WritingPromptItem[] {
  return ALL_WRITING_PROMPTS.filter((p) => p.cefr_level === level);
}

/**
 * Find writing prompt by ID.
 */
export function getWritingPromptById(id: string): WritingPromptItem | undefined {
  return ALL_WRITING_PROMPTS.find((p) => p.id === id);
}

/**
 * Select a random prompt for assessment or practice.
 */
export function getRandomWritingPrompt(level?: CEFRLevel): WritingPromptItem {
  const pool = level ? getWritingPromptsByCefr(level) : ALL_WRITING_PROMPTS;
  const list = pool.length > 0 ? pool : ALL_WRITING_PROMPTS;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Sanitize prompt for client display, hiding sample answer.
 */
export function sanitizeWritingPromptForClient(prompt: WritingPromptItem): ClientSanitizedWritingPrompt {
  return {
    id: prompt.id,
    cefr_level: prompt.cefr_level,
    task_type: prompt.task_type,
    title_en: prompt.title_en,
    title_th: prompt.title_th,
    instruction_en: prompt.instruction_en,
    instruction_th: prompt.instruction_th,
    min_words: prompt.min_words,
    max_words: prompt.max_words,
    rubric_summary: {
      criteria: [
        'Task Achievement & Fulfillment',
        'Coherence & Cohesive Devices',
        'Lexical Diversity & Precision',
        'Grammatical Range & Accuracy',
      ],
    },
  };
}
