import { apiClient } from '../client';
import { CEFRLevel, CambridgeExamCode, SpeakingPrompt } from '../../../types';

export interface SpeakingQueryParams {
  cefr_level?: CEFRLevel;
  target_exam?: CambridgeExamCode;
  part?: number;
  page?: number;
  limit?: number;
}

export interface SpeakingPromptDTO {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  part: number;
  prompt_th: string;
  prompt_en: string;
  guiding_questions_th: string[];
  target_phrases: string[];
  // model_answer is explicitly excluded by backend to prevent premature answer disclosure
}

export interface SpeakingPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface SpeakingResponseDTO {
  prompts: SpeakingPromptDTO[];
  pagination: SpeakingPaginationDTO;
}

/**
 * Adapter function mapping backend SpeakingPromptDTO to frontend SpeakingPrompt model
 */
export function mapSpeakingDtoToPrompt(dto: SpeakingPromptDTO): SpeakingPrompt {
  return {
    id: dto.id,
    title: dto.title,
    cefrLevel: dto.cefr_level,
    targetExam: dto.target_exam,
    part: dto.part,
    promptTh: dto.prompt_th,
    promptEn: dto.prompt_en,
    guidingQuestionsTh: dto.guiding_questions_th || [],
    targetPhrases: dto.target_phrases || [],
    modelAnswer: '', // Intentionally empty: revealed only post-evaluation/submission
  };
}

/**
 * GET /api/content/speaking
 * Fetches speaking prompts with optional CEFR, exam, and part filters.
 */
export async function getSpeakingPrompts(params: SpeakingQueryParams = {}): Promise<SpeakingResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.target_exam) queryParts.push(`target_exam=${encodeURIComponent(params.target_exam)}`);
  if (params.part !== undefined) queryParts.push(`part=${params.part}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<SpeakingResponseDTO>(`/api/content/speaking${queryString}`, { skipAuth: true });
}
