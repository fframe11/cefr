import { apiClient } from '../client';
import { CEFRLevel, GrammarTopic, GrammarRule, GrammarMistake } from '../../../types';

export interface GrammarQueryParams {
  cefr_level?: CEFRLevel;
  slug?: string;
  page?: number;
  limit?: number;
}

export interface GrammarTopicDTO {
  id: string;
  slug: string;
  title_en: string;
  title_th: string;
  cefr_level: CEFRLevel;
  summary_th: string;
  concept_th: string;
  concept_en: string;
  rules: GrammarRule[];
  common_mistakes: GrammarMistake[];
}

export interface GrammarPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface GrammarResponseDTO {
  topics: GrammarTopicDTO[];
  pagination: GrammarPaginationDTO;
}

/**
 * Adapter function mapping backend GrammarTopicDTO to frontend GrammarTopic model
 */
export function mapGrammarDtoToTopic(dto: GrammarTopicDTO): GrammarTopic {
  return {
    id: dto.id,
    titleEn: dto.title_en,
    titleTh: dto.title_th,
    cefrLevel: dto.cefr_level,
    summaryTh: dto.summary_th || '',
    conceptTh: dto.concept_th || '',
    conceptEn: dto.concept_en || '',
    rules: dto.rules || [],
    commonMistakes: dto.common_mistakes || [],
    practiceQuestions: [], // Loaded dynamically via Questions API
  };
}

/**
 * GET /api/content/grammar
 * Fetches grammar topics with optional CEFR and slug filters.
 */
export async function getGrammarTopics(params: GrammarQueryParams = {}): Promise<GrammarResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.slug) queryParts.push(`slug=${encodeURIComponent(params.slug)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<GrammarResponseDTO>(`/api/content/grammar${queryString}`, { skipAuth: true });
}
