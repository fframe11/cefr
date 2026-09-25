import crypto from 'crypto';
import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError } from '../_lib/errors/api-error';

export const mockExamStartSchema = z.object({
  mock_exam_id: uuidSchema,
  // Strict non-trust of client claims
  user_id: z.unknown().optional(),
  session_token: z.unknown().optional(),
  status: z.unknown().optional(),
  started_at: z.unknown().optional(),
});

export interface MockExamStartResponseDTO {
  session_token: string;
  mock_exam_id: string;
  exam_code: string;
  name: string;
  started_at: string;
  expires_at: string;
  duration_minutes: number;
  status: 'in_progress';
  disclaimer: string;
}

/**
 * POST /api/mock-exams/start
 * Initializes a new timed mock exam attempt session.
 * 
 * SERVER-AUTHORITATIVE INVARIANTS:
 * 1. user_id is derived strictly from verified JWT token.
 * 2. session_token is a cryptographically secure random UUID.
 * 3. started_at and expires_at are determined strictly on the server.
 * 4. status is initialized strictly to 'in_progress'.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to start a mock exam.');
    }

    const body = validateBody(mockExamStartSchema, req.body);
    const supabase = createServiceRoleClient();

    // 1. Verify mock exam exists and is published
    const { data: exam, error: examError } = await supabase
      .from('mock_exams')
      .select('id, exam_code, name, target_cefr, total_duration_minutes, is_published')
      .eq('id', body.mock_exam_id)
      .eq('is_published', true)
      .single();

    if (examError || !exam) {
      throw new NotFoundError('Mock exam not found or is currently not available.');
    }

    // 2. Generate cryptographically unpredictable session token
    const sessionToken = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const durationMs = exam.total_duration_minutes * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    // 3. Persist attempt record
    const { data: attempt, error: insertError } = await supabase
      .from('user_mock_exam_attempts')
      .insert({
        user_id: user.id,
        mock_exam_id: exam.id,
        session_token: sessionToken,
        started_at: startedAt,
        status: 'in_progress',
      })
      .select('id, session_token, started_at, status')
      .single();

    if (insertError || !attempt) {
      throw insertError || new Error('Failed to create mock exam attempt session.');
    }

    const response: MockExamStartResponseDTO = {
      session_token: attempt.session_token,
      mock_exam_id: exam.id,
      exam_code: exam.exam_code,
      name: exam.name,
      started_at: attempt.started_at,
      expires_at: expiresAt,
      duration_minutes: exam.total_duration_minutes,
      status: 'in_progress',
      disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
    };

    return response;
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'mock_exam_start',
      maxRequests: 20,
      windowMs: 60_000,
    },
  }
);
