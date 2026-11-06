import { apiClient } from '../client';
import { CEFRLevel, CambridgeExamCode, WritingPrompt } from '../../../types';

export interface WritingQueryParams {
  cefr_level?: CEFRLevel;
  target_exam?: CambridgeExamCode;
  task_type?: 'Email' | 'Essay' | 'Article' | 'Story' | 'Review';
  page?: number;
  limit?: number;
}

export interface WritingPromptDTO {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  task_type: 'Email' | 'Essay' | 'Article' | 'Story' | 'Review';
  prompt_th: string;
  prompt_en: string;
  min_words: number;
  max_words: number;
  guidelines_th: string[] | string;
  useful_phrases: { phrase: string; meaningTh: string }[];
  rubrics: { criterion: string; descriptionTh: string; maxScore: number }[];
  // sample_model_answer is explicitly excluded by the backend to prevent cheating
}

export interface WritingPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface WritingResponseDTO {
  prompts: WritingPromptDTO[];
  pagination: WritingPaginationDTO;
}

/**
 * Adapter function mapping backend WritingPromptDTO to frontend WritingPrompt model
 */
export function mapWritingDtoToPrompt(dto: WritingPromptDTO): WritingPrompt {
  const guidelines: string[] = Array.isArray(dto.guidelines_th)
    ? dto.guidelines_th
    : typeof dto.guidelines_th === 'string' && dto.guidelines_th
    ? [dto.guidelines_th]
    : [];

  return {
    id: dto.id,
    title: dto.title,
    cefrLevel: dto.cefr_level,
    targetExam: dto.target_exam,
    taskType: dto.task_type,
    promptTh: dto.prompt_th,
    promptEn: dto.prompt_en,
    minWords: dto.min_words,
    maxWords: dto.max_words,
    guidelinesTh: guidelines,
    usefulPhrases: dto.useful_phrases || [],
    sampleModelAnswer: '', // Intentionally empty: revealed only post-evaluation/submission
    rubrics: dto.rubrics || [],
  };
}

/**
 * GET /api/content/writing
 * Fetches writing practice prompts with optional CEFR, exam, and task type filters.
 */
export async function getWritingPrompts(params: WritingQueryParams = {}): Promise<WritingResponseDTO> {
  const query = new URLSearchParams();
  if (params.cefr_level) query.set('cefr_level', params.cefr_level);
  if (params.target_exam) query.set('target_exam', params.target_exam);
  if (params.task_type) query.set('task_type', params.task_type);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const queryString = query.toString();
  const endpoint = `/api/content/writing${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<WritingResponseDTO>(endpoint, { skipAuth: true });
}
