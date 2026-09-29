import { apiClient } from '../client';
import { CEFRLevel, VocabularyWord } from '../../../types';

export interface VocabularyQueryParams {
  cefr_level?: CEFRLevel;
  topic?: string;
  part_of_speech?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VocabularyItemDTO {
  id: string;
  word: string;
  lemma: string;
  cefr_level: CEFRLevel;
  part_of_speech: string;
  ipa: string;
  meaning_th: string;
  meaning_en: string;
  example_sentence_en: string;
  example_sentence_th: string;
  topic: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface VocabularyPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface VocabularyResponseDTO {
  items: VocabularyItemDTO[];
  pagination: VocabularyPaginationDTO;
}

/**
 * Adapter function mapping backend VocabularyItemDTO to frontend VocabularyWord model
 */
export function mapVocabularyDtoToWord(dto: VocabularyItemDTO, masteryIds: string[] = []): VocabularyWord {
  return {
    id: dto.id,
    word: dto.word,
    lemma: dto.lemma || dto.word,
    cefrLevel: dto.cefr_level,
    partOfSpeech: (dto.part_of_speech || 'noun') as VocabularyWord['partOfSpeech'],
    ipa: dto.ipa || '',
    meaningTh: dto.meaning_th || '',
    meaningEn: dto.meaning_en || '',
    exampleSentenceEn: dto.example_sentence_en || '',
    exampleSentenceTh: dto.example_sentence_th || '',
    topic: dto.topic || 'General',
    synonyms: dto.synonyms || [],
    antonyms: dto.antonyms || [],
    masteryPercentage: masteryIds.includes(dto.id) ? 100 : 0,
    reviewCount: 0,
  };
}

/**
 * GET /api/content/vocabulary
 * Fetches vocabulary items with optional CEFR, topic, search, and pagination filters.
 */
export async function getVocabulary(params: VocabularyQueryParams = {}): Promise<VocabularyResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.topic) queryParts.push(`topic=${encodeURIComponent(params.topic)}`);
  if (params.part_of_speech) queryParts.push(`part_of_speech=${encodeURIComponent(params.part_of_speech)}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<VocabularyResponseDTO>(`/api/content/vocabulary${queryString}`, { skipAuth: true });
}

export interface ClientVocabularyQuestionDTO {
  id: string;
  skill: 'vocabulary';
  cefrLevel: CEFRLevel;
  type: string;
  interactionType: string;
  promptTh: string;
  promptEn: string;
  contextPassage?: string;
  targetWord?: string;
  options: Array<{ key: string; text: string }>;
  difficultyWeight: number;
}

export interface VocabularyQuestionsResponseDTO {
  questions: ClientVocabularyQuestionDTO[];
  total: number;
}

export interface VocabularyAnswerSubmissionResult {
  question_id: string;
  target_word_id: string;
  selected_key: string;
  correct_key: string;
  is_correct: boolean;
  explanation_th: string;
  explanation_en: string;
}

export async function getVocabularyQuestions(params: {
  cefr_level?: CEFRLevel;
  count?: number;
  word_ids?: string;
  interaction_types?: string;
} = {}): Promise<VocabularyQuestionsResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.count) queryParts.push(`count=${params.count}`);
  if (params.word_ids) queryParts.push(`word_ids=${encodeURIComponent(params.word_ids)}`);
  if (params.interaction_types) queryParts.push(`interaction_types=${encodeURIComponent(params.interaction_types)}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<VocabularyQuestionsResponseDTO>(`/api/content/vocabulary/questions${qs}`, { skipAuth: true });
}

export async function submitVocabularyAnswer(payload: {
  question_id: string;
  selected_key: string;
  target_word_id?: string;
}): Promise<VocabularyAnswerSubmissionResult> {
  return apiClient.post<VocabularyAnswerSubmissionResult>('/api/content/vocabulary/questions', payload, { skipAuth: true });
}
