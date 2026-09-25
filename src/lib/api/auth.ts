import { apiClient } from './client';
import { AuthMeResponse } from './types';

/**
 * GET /api/auth/me
 * Verifies current authenticated JWT session with server and retrieves user identity.
 */
export async function getMe(): Promise<AuthMeResponse> {
  return apiClient.get<AuthMeResponse>('/api/auth/me');
}
