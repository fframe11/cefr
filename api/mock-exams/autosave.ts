import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../_lib/errors/api-error';
import { calculateExamTiming, finalizeMockExamAttempt } from './_engine';

export const mockExamAutosaveSchema = z
  .object({
    session_token: uuidSchema,
    question_id: uuidSchema,
    selected_option_key: z.string().trim().max(5).optional().nullable(),
    text_answer: z.string().trim().max(5000).optional().nullable(),
    time_spent_seconds: z.coerce.number().int().min(0).default(0),
    // Strict non-trust of client claims
    is_correct: z.unknown().optional(),
    score_awarded: z.unknown().optional(),
  })
  .refine((data) => data.selected_option_key !== undefined || data.text_answer !== undefined, {
    message: 'Either selected_option_key or text_answer must be provided for autosave.',
  });

/**
 * POST /api/mock-exams/autosave
 * Safely persists intermediate candidate answers during an active timed mock exam.
 * 
 * INTEGRITY INVARIANTS:
 * 1. Historical Ledger Protection: Uses context_type = 'mock_exam' and context_attempt_id.
 * 2. Uniqueness: Prevents duplicate records for the same (context_attempt_id, question_id).
 * 3. 60-Second Grace: Autosave is permitted through normal duration and up to 60s grace.
 * 4. Timeout Auto-Finalization: If past grace, atomically grades saved answers and locks attempt as 'timed_out'.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to autosave mock exam answer.');
    }

    const body = validateBody(mockExamAutosaveSchema, req.body);
    const supabase = createServiceRoleClient();

    // 1. Locate active attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, user_id, mock_exam_id, session_token, started_at, status')
      .eq('session_token', body.session_token)
      .single();

    if (attemptError || !attempt) {
      throw new NotFoundError('Mock exam attempt session not found.');
    }

    if (attempt.user_id !== user.id) {
      throw new UnauthorizedError('You do not have permission to modify this exam attempt.');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestError(`Cannot autosave answers for an attempt with status '${attempt.status}'.`);
    }

    // 2. Server-authoritative timer validation with 60-second grace
    const { data: exam } = await supabase
      .from('mock_exams')
      .select('total_duration_minutes')
      .eq('id', attempt.mock_exam_id)
      .single();

    const durationMinutes = exam?.total_duration_minutes || 60;
    const timing = calculateExamTiming(attempt.started_at, durationMinutes);

    if (timing.isPastGrace) {
      // Past 60-second grace: Atomically finalize and grade saved answers
      await finalizeMockExamAttempt({
        attemptId: attempt.id,
        userId: user.id,
        sessionToken: body.session_token,
        targetStatus: 'timed_out',
        submittedAt: new Date(timing.expiresMs).toISOString(),
        supabase,
      });

      throw new BadRequestError('Mock exam session has timed out. Submission is locked.');
    }

    // 3. Verify question belongs to this mock exam
    const { data: section } = await supabase
      .from('mock_exam_sections')
      .select('id')
      .eq('mock_exam_id', attempt.mock_exam_id);

    const sectionIds = (section || []).map((s) => s.id);
    const { data: meq } = await supabase
      .from('mock_exam_questions')
      .select('id')
      .eq('question_id', body.question_id)
      .in('section_id', sectionIds.length > 0 ? sectionIds : ['00000000-0000-0000-0000-000000000000'])
      .maybeSingle();

    if (!meq) {
      throw new BadRequestError('Question does not belong to this mock exam.');
    }

    const savedAt = new Date().toISOString();

    // 4. Upsert candidate answer adhering to unique index uq_attempt_question
    const { data: existingAttempt } = await supabase
      .from('user_question_attempts')
      .select('id, time_spent_seconds')
      .eq('context_type', 'mock_exam')
      .eq('context_attempt_id', attempt.id)
      .eq('question_id', body.question_id)
      .maybeSingle();

    if (existingAttempt) {
      await supabase
        .from('user_question_attempts')
        .update({
          selected_key: body.selected_option_key || null,
          text_answer: body.text_answer || null,
          time_spent_seconds: (existingAttempt.time_spent_seconds || 0) + (body.time_spent_seconds || 0),
          attempted_at: savedAt,
        })
        .eq('id', existingAttempt.id);
    } else {
      await supabase.from('user_question_attempts').insert({
        user_id: user.id,
        question_id: body.question_id,
        selected_key: body.selected_option_key || null,
        text_answer: body.text_answer || null,
        is_correct: null, // Untrusted and unverified until final submission
        score_awarded: 0,
        evaluation_status: 'pending',
        time_spent_seconds: body.time_spent_seconds || 0,
        context_type: 'mock_exam',
        context_attempt_id: attempt.id,
        attempted_at: savedAt,
      });
    }

    return {
      success: true,
      question_id: body.question_id,
      saved_at: savedAt,
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'mock_exam_autosave',
      maxRequests: 300,
      windowMs: 60_000,
    },
  }
);
