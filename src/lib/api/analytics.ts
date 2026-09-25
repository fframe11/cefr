import { apiClient } from './client';
import { UserAnalyticsResponse } from './types';

/**
 * GET /api/user/analytics
 * Provides comprehensive learning analytics, 6-skill breakdown, weakness tracking, and performance trajectory.
 * Strictly uses authenticated user context.
 */
export async function getUserAnalytics(): Promise<UserAnalyticsResponse> {
  return apiClient.get<UserAnalyticsResponse>('/api/user/analytics');
}
