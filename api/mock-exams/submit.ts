import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError } from '../_lib/errors/api-error';
import { calculateExamTiming, finalizeMockExamAttempt, FinalizeExamResult } from './_engine';
import { DemoExamService } from '../_lib/demo/demo-exam.service';

export const mockExamAnswerItemSchema = z.object({
  question_id: uuidSchema,
  selected_option_key: z.string().trim().max(5).optional().nullable(),
  text_answer: z.string().trim().max(5000).optional().nullable(),
  time_spent_seconds: z.coerce.number().int().min(0).default(0),
});

export const mockExamSubmitSchema = z.object({
  session_token: uuidSchema,
  answers: z.array(mockExamAnswerItemSchema).max(200).default([]),
  // Strict non-trust of client claims
  user_id: z.unknown().optional(),
  raw_score: z.unknown().optional(),
  total_marks: z.unknown().optional(),
  percentage_score: z.unknown().optional(),
  status: z.unknown().optional(),
  estimated_cefr_level: z.unknown().optional(),
  estimated_cambridge_score: z.unknown().optional(),
  is_official: z.unknown().optional(),
});

export type MockExamSubmitResponseDTO = FinalizeExamResult;

/**
 * POST /api/mock-exams/submit
 * Submits and objectively grades a timed mock examination.
 * 
 * SERVER-AUTHORITATIVE INVARIANTS:
 * 1. 60-Second Grace Period: Submissions up to 60s past duration are accepted as 'submitted'.
 *    Submissions past grace are marked 'timed_out'.
 * 2. Concurrency & Double-Submit: Atomic conditional update (WHERE status = 'in_progress' AND user_id = :user_id)
 *    ensures exactly one worker finalizes scoring; subsequent submissions return idempotently.
 * 3. Question Ownership: Rejects any submitted questions that do not belong to this mock exam.
 * 4. Subjective Grading: Writing/Speaking questions are marked 'pending' without fabricating scores;
 *    objective percentage is calculated from evaluated questions so pending status does not penalize score.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to submit mock exam.');
    }

    const body = validateBody(mockExamSubmitSchema, req.body);

    // 1. Isolated Demo Session Branch
    if (DemoExamService.isDemoSessionToken(body.session_token)) {
      return DemoExamService.submitDemoSession(body.session_token, body.answers);
    }

    const supabase = createServiceRoleClient();

    // 2. Locate production attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, user_id, mock_exam_id, session_token, started_at, submitted_at, status, raw_score, total_marks, percentage_score, estimated_cefr_level, estimated_cambridge_score')
      .eq('session_token', body.session_token)
      .single();

    if (attemptError || !attempt) {
      throw new NotFoundError('Mock exam attempt session not found.');
    }

    if (attempt.user_id !== user.id) {
      throw new UnauthorizedError('You do not have permission to submit this exam attempt.');
    }

    // 2. Locate mock exam duration
    const { data: exam, error: examError } = await supabase
      .from('mock_exams')
      .select('id, total_duration_minutes')
      .eq('id', attempt.mock_exam_id)
      .single();

    if (examError || !exam) {
      throw new NotFoundError('Associated mock exam not found.');
    }

    // 3. Compute server-authoritative timing with 60-second grace period
    const timing = calculateExamTiming(attempt.started_at, exam.total_duration_minutes);
    const submittedAt = new Date().toISOString();

    // 4. Atomically finalize attempt and grade answers
    const result = await finalizeMockExamAttempt({
      attemptId: attempt.id,
      userId: user.id,
      sessionToken: body.session_token,
      targetStatus: timing.targetSubmitStatus,
      submittedAt,
      incomingAnswers: body.answers,
      supabase,
    });

    return result;
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'mock_exam_submit',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
