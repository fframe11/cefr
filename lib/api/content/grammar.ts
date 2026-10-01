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

import { GRAMMAR_BANK } from '../../../data/grammarBank';

/**
 * Adapter function mapping backend GrammarTopicDTO to frontend GrammarTopic model.
 * Merges with curated GRAMMAR_BANK to guarantee human-written pedagogical explanations without AI markdown symbols.
 */
export function mapGrammarDtoToTopic(dto: GrammarTopicDTO): GrammarTopic {
  const local = GRAMMAR_BANK.find(
    (g) => g.cefrLevel === dto.cefr_level || g.titleEn.toLowerCase() === dto.title_en?.toLowerCase() || g.id === dto.id
  );

  return {
    id: dto.id,
    titleEn: local?.titleEn || dto.title_en,
    titleTh: local?.titleTh || dto.title_th,
    cefrLevel: dto.cefr_level,
    summaryTh: local?.summaryTh || dto.summary_th || '',
    conceptTh: local?.conceptTh || dto.concept_th || '',
    conceptEn: local?.conceptEn || dto.concept_en || '',
    rules: local?.rules && local.rules.length > 0 ? local.rules : (dto.rules || []),
    commonMistakes: local?.commonMistakes && local.commonMistakes.length > 0 ? local.commonMistakes : (dto.common_mistakes || []),
    practiceQuestions: local?.practiceQuestions || [],
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
