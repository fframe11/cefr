import { apiClient } from './client';
import { SyncGuestInput, SyncGuestResponse } from './types';

/**
 * POST /api/user/sync-guest
 * Synchronizes offline/guest local attempts into the authenticated user profile.
 * Server re-grades answers against database keys and recalculates streak and progress.
 */
export async function syncGuestProgress(input: SyncGuestInput): Promise<SyncGuestResponse> {
  const timezoneOffset =
    input.timezone_offset_minutes !== undefined
      ? input.timezone_offset_minutes
      : new Date().getTimezoneOffset();

  const sanitizedAttempts = (input.practice_attempts || []).map((att) => ({
    client_attempt_id: att.client_attempt_id,
    question_id: att.question_id,
    selected_option_key: att.selected_option_key || undefined,
    text_answer: att.text_answer || undefined,
    time_spent_seconds: att.time_spent_seconds ?? 0,
    context_type: att.context_type || 'practice',
    attempted_at: att.attempted_at || new Date().toISOString(),
  }));

  return apiClient.post<SyncGuestResponse>('/api/user/sync-guest', {
    practice_attempts: sanitizedAttempts,
    timezone_offset_minutes: timezoneOffset,
  });
}
