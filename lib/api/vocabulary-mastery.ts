import { apiClient } from './client';
import {
  VocabularyMasteryQuery,
  VocabularyMasteryResponse,
  UpdateVocabularyMasteryInput,
  UpdateVocabularyMasteryResponse,
} from './types';

/**
 * GET /api/user/vocabulary-mastery
 * Retrieves paginated vocabulary mastery records for the authenticated user.
 */
export async function getVocabularyMastery(
  query: VocabularyMasteryQuery = {}
): Promise<VocabularyMasteryResponse> {
  const queryParts: string[] = [];
  if (query.status) queryParts.push(`status=${encodeURIComponent(query.status)}`);
  if (query.page !== undefined) queryParts.push(`page=${query.page}`);
  if (query.limit !== undefined) queryParts.push(`limit=${query.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<VocabularyMasteryResponse>(`/api/user/vocabulary-mastery${queryString}`);
}

/**
 * POST /api/user/vocabulary-mastery
 * Records a spaced-repetition review result and updates mastery percentage on the server.
 */
export async function updateVocabularyMastery(
  input: UpdateVocabularyMasteryInput
): Promise<UpdateVocabularyMasteryResponse> {
  return apiClient.post<UpdateVocabularyMasteryResponse>('/api/user/vocabulary-mastery', {
    vocabulary_id: input.vocabulary_id,
    is_correct: input.is_correct,
  });
}
