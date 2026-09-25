import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../_lib/errors/api-error';
import { updateStreakOnActivity } from '../_lib/assessment/streak';

export const practiceSubmitSchema = z
  .object({
    question_id: uuidSchema,
    selected_option_key: z.string().trim().max(5).optional().nullable(),
    text_answer: z.string().trim().max(2000).optional().nullable(),
    time_spent_seconds: z.coerce.number().int().min(0).default(0),
    context_type: z.enum(['practice', 'placement']).default('practice'),
    // If client attempts to spoof user_id or grading fields, we strictly ignore or forbid them
    user_id: z.string().optional(),
    is_correct: z.unknown().optional(),
    score_awarded: z.unknown().optional(),
  })
  .refine(
    (data) => data.selected_option_key || data.text_answer,
    {
      message: 'Either selected_option_key or text_answer must be provided for evaluation.',
      path: ['selected_option_key'],
    }
  );

export interface PracticeGradingResultDTO {
  attempt_id: string;
  question_id: string;
  is_correct: boolean | null;
  score_awarded: number;
  evaluation_status: 'completed' | 'pending';
  correct_option_key: string | null;
  correct_answer_text: string | null;
  explanation_en: string;
  explanation_th: string;
  feedback_th: string;
  attempted_at: string;
}

/**
 * POST /api/practice/submit
 * Evaluates student practice submissions server-side with strict ownership and grading boundaries.
 * 
 * SECURITY INVARIANTS:
 * 1. user_id is derived EXCLUSIVELY from verified auth context (user.id). Any client-supplied user_id is ignored.
 * 2. is_correct and score_awarded are calculated by the server; client claims are discarded.
 * 3. Records attempt into public.user_question_attempts ledger (append-only).
 * 4. Updates derived learning states via Supabase Service Role Key.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to submit practice answers.');
    }

    const body = validateBody(practiceSubmitSchema, req.body);
    const supabase = createServiceRoleClient();

    // 1. Fetch Question and its Grading Keys securely via Service Role
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select(
        'id, skill, cefr_level, type, prompt_th, prompt_en, correct_answer_text, explanation_th, explanation_en, weakness_tag, difficulty_weight, is_active'
      )
      .eq('id', body.question_id)
      .eq('is_active', true)
      .single();

    if (qError || !question) {
      throw new NotFoundError('Question not found or is inactive.');
    }

    // Fetch options with is_correct and feedback_th for evaluation
    const { data: options, error: optError } = await supabase
      .from('question_options')
      .select('id, key, text, is_correct, feedback_th')
      .eq('question_id', question.id);

    if (optError) {
      throw optError;
    }

    // 2. Perform Server-Side Deterministic Grading
    let isCorrect: boolean | null = null;
    let scoreAwarded = 0;
    let evaluationStatus: 'completed' | 'pending' = 'completed';
    let correctOptionKey: string | null = null;
    let feedbackTh = '';

    const maxPoints = question.difficulty_weight || 1;
    const correctOption = options?.find((opt) => opt.is_correct);
    if (correctOption) {
      correctOptionKey = correctOption.key;
    }

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      if (!body.selected_option_key) {
        throw new BadRequestError(`selected_option_key is required for question type: ${question.type}`);
      }

      const selectedOption = options?.find((opt) => opt.key === body.selected_option_key);
      isCorrect = Boolean(selectedOption && selectedOption.is_correct);
      scoreAwarded = isCorrect ? maxPoints : 0;
      feedbackTh = selectedOption?.feedback_th || (isCorrect ? 'คำตอบถูกต้อง' : 'คำตอบยังไม่ถูกต้อง');
    } else if (question.type === 'fill_blank') {
      if (!body.text_answer) {
        throw new BadRequestError('text_answer is required for question type: fill_blank');
      }

      const expected = (question.correct_answer_text || '').trim().toLowerCase();
      const actual = body.text_answer.trim().toLowerCase();

      isCorrect = expected.length > 0 && actual === expected;
      scoreAwarded = isCorrect ? maxPoints : 0;
      feedbackTh = isCorrect
        ? 'คำตอบถูกต้อง'
        : `คำตอบที่ถูกต้องคือ: ${question.correct_answer_text || ''}`;
    } else {
      // Subjective or complex types (writing, speaking) without automated grader
      evaluationStatus = 'pending';
      isCorrect = null;
      scoreAwarded = 0;
      feedbackTh = 'ส่งคำตอบเรียบร้อยแล้ว รอการตรวจประเมิน';
    }

    // 3. Append to Audit Ledger (public.user_question_attempts)
    const { data: attempt, error: attemptError } = await supabase
      .from('user_question_attempts')
      .insert({
        user_id: user.id, // Strictly derived from server auth context
        question_id: question.id,
        selected_key: body.selected_option_key || null,
        text_answer: body.text_answer || null,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        evaluation_status: evaluationStatus,
        time_spent_seconds: body.time_spent_seconds || 0,
        context_type: body.context_type,
        context_attempt_id: null, // Null for practice attempts per constraint
        attempted_at: new Date().toISOString(),
      })
      .select('id, attempted_at')
      .single();

    if (attemptError || !attempt) {
      throw attemptError || new Error('Failed to record practice attempt ledger.');
    }

    // 4. Update Derived State: user_skill_progress (Best-effort sequential update)
    if (evaluationStatus === 'completed') {
      try {
        const { data: existingProgress } = await supabase
          .from('user_skill_progress')
          .select('id, proficiency_score, questions_completed')
          .eq('user_id', user.id)
          .eq('skill', question.skill)
          .single();

        if (existingProgress) {
          const completedCount = existingProgress.questions_completed + 1;
          const scoreDelta = isCorrect ? 2 : -1;
          const newScore = Math.max(0, Math.min(100, existingProgress.proficiency_score + scoreDelta));

          await supabase
            .from('user_skill_progress')
            .update({
              questions_completed: completedCount,
              proficiency_score: newScore,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProgress.id);
        } else {
          await supabase.from('user_skill_progress').insert({
            user_id: user.id,
            skill: question.skill,
            questions_completed: 1,
            proficiency_score: isCorrect ? 10 : 0,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        // Non-blocking log for derived state update in serverless context
      }

      // Track learning weakness if answer was incorrect
      if (isCorrect === false && question.weakness_tag) {
        try {
          const { data: existingWeakness } = await supabase
            .from('user_weaknesses')
            .select('id, error_count')
            .eq('user_id', user.id)
            .eq('weakness_tag', question.weakness_tag)
            .maybeSingle();

          if (existingWeakness) {
            await supabase
              .from('user_weaknesses')
              .update({
                error_count: existingWeakness.error_count + 1,
                last_failed_at: new Date().toISOString(),
              })
              .eq('id', existingWeakness.id);
          } else {
            await supabase.from('user_weaknesses').insert({
              user_id: user.id,
              weakness_tag: question.weakness_tag,
              error_count: 1,
              last_failed_at: new Date().toISOString(),
            });
          }
        } catch {
          // Non-blocking telemetry
        }
      }

      // Update study streak on activity
      try {
        await updateStreakOnActivity(supabase, user.id);
      } catch {
        // Non-blocking telemetry
      }
    }

    const result: PracticeGradingResultDTO = {
      attempt_id: attempt.id,
      question_id: question.id,
      is_correct: isCorrect,
      score_awarded: scoreAwarded,
      evaluation_status: evaluationStatus,
      correct_option_key: correctOptionKey,
      correct_answer_text: question.correct_answer_text || null,
      explanation_en: question.explanation_en,
      explanation_th: question.explanation_th,
      feedback_th: feedbackTh,
      attempted_at: attempt.attempted_at,
    };

    return result;
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'practice_submit',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
