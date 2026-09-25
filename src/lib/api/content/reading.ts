import { apiClient } from '../client';
import { CEFRLevel, CambridgeExamCode, ReadingPassage } from '../../../types';

export interface ReadingQueryParams {
  cefr_level?: CEFRLevel;
  target_exam?: CambridgeExamCode;
  topic?: string;
  page?: number;
  limit?: number;
}

export interface ReadingPassageDTO {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  topic: string;
  content: string;
  word_count: number;
  vocabulary_glossary: { word: string; meaningTh: string }[];
}

export interface ReadingPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ReadingResponseDTO {
  passages: ReadingPassageDTO[];
  pagination: ReadingPaginationDTO;
}

/**
 * Adapter function mapping backend ReadingPassageDTO to frontend ReadingPassage model
 */
export function mapReadingDtoToPassage(dto: ReadingPassageDTO): ReadingPassage {
  return {
    id: dto.id,
    title: dto.title,
    cefrLevel: dto.cefr_level,
    targetExam: dto.target_exam,
    topic: dto.topic || 'General',
    content: dto.content,
    wordCount: dto.word_count || dto.content.split(/\s+/).length,
    vocabularyGlossary: dto.vocabulary_glossary || [],
    questions: [], // Loaded dynamically via Questions API
  };
}

/**
 * GET /api/content/reading
 * Fetches reading comprehension passages with optional CEFR, target exam, and topic filters.
 */
export async function getReadingPassages(params: ReadingQueryParams = {}): Promise<ReadingResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.target_exam) queryParts.push(`target_exam=${encodeURIComponent(params.target_exam)}`);
  if (params.topic) queryParts.push(`topic=${encodeURIComponent(params.topic)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<ReadingResponseDTO>(`/api/content/reading${queryString}`, { skipAuth: true });
}
