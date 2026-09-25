import { apiClient } from './client';
import { UserProfileResponse, UpdateProfileInput } from './types';

/**
 * GET /api/user/profile
 * Retrieves the current authenticated user's profile and progress summary.
 */
export async function getProfile(): Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>('/api/user/profile');
}

/**
 * PATCH /api/user/profile
 * Updates allowed client-editable profile settings (target_exam, daily_goal_minutes).
 * Rejects and strips any server-owned progress fields.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UserProfileResponse> {
  const allowedPayload: UpdateProfileInput = {};
  if (input.target_exam !== undefined) {
    allowedPayload.target_exam = input.target_exam;
  }
  if (input.daily_goal_minutes !== undefined) {
    allowedPayload.daily_goal_minutes = input.daily_goal_minutes;
  }

  return apiClient.patch<UserProfileResponse>('/api/user/profile', allowedPayload);
}
