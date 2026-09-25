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
  guidelines_th: string[];
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
    guidelinesTh: dto.guidelines_th || [],
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
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.target_exam) queryParts.push(`target_exam=${encodeURIComponent(params.target_exam)}`);
  if (params.task_type) queryParts.push(`task_type=${encodeURIComponent(params.task_type)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<WritingResponseDTO>(`/api/content/writing${queryString}`, { skipAuth: true });
}
