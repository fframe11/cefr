import { apiClient } from './client';
import { UserProgressResponse } from './types';

/**
 * GET /api/user/progress
 * Retrieves canonical student learning progress, skill proficiencies, telemetry, and study streak.
 * Strictly uses JWT user context as single source of truth.
 */
export async function getUserProgress(): Promise<UserProgressResponse> {
  return apiClient.get<UserProgressResponse>('/api/user/progress');
}
