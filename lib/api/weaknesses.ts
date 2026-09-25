import { apiClient } from './client';
import { UserWeaknessesQuery, UserWeaknessesResponse } from './types';

/**
 * GET /api/user/weaknesses
 * Fetches authenticated user's tracked learning weaknesses and error frequencies.
 * Strict ownership enforcement via JWT session user.id.
 */
export async function getUserWeaknesses(query: UserWeaknessesQuery = {}): Promise<UserWeaknessesResponse> {
  const queryParts: string[] = [];
  if (query.limit !== undefined) queryParts.push(`limit=${query.limit}`);
  if (query.offset !== undefined) queryParts.push(`offset=${query.offset}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<UserWeaknessesResponse>(`/api/user/weaknesses${queryString}`);
}
