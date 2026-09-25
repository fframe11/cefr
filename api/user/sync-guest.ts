import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { UnauthorizedError } from '../_lib/errors/api-error';
import { updateStreakOnActivity, StreakResult } from '../_lib/assessment/streak';

export const guestPracticeAttemptSchema = z
  .object({
    client_attempt_id: z.string().uuid().optional(),
    question_id: uuidSchema,
    selected_option_key: z.string().trim().max(5).optional().nullable(),
    text_answer: z.string().trim().max(2000).optional().nullable(),
    time_spent_seconds: z.coerce.number().int().min(0).max(3600).default(0),
    context_type: z.enum(['practice', 'placement']).default('practice'),
    attempted_at: z.string().datetime().optional(),
    // Client cannot supply grading results - silently strip or ignore
    is_correct: z.unknown().optional(),
    score_awarded: z.unknown().optional(),
    evaluation_status: z.unknown().optional(),
    user_id: z.unknown().optional(),
  })
  .refine((data) => data.selected_option_key || data.text_answer, {
    message: 'Either selected_option_key or text_answer must be provided for evaluation.',
    path: ['selected_option_key'],
  });

export const syncGuestPayloadSchema = z.object({
  practice_attempts: z.array(guestPracticeAttemptSchema).max(100),
  timezone_offset_minutes: z.coerce.number().int().optional(),
});

export interface SyncGuestResultDTO {
  synced_count: number;
  skipped_duplicate_count: number;
  total_processed: number;
  streak: StreakResult;
  is_official: false;
  disclaimer: string;
}

/**
 * POST /api/user/sync-guest
 * Synchronizes offline/guest local attempts into the authenticated user profile.
 * 
 * SECURITY & ARCHITECTURAL INVARIANTS:
 * 1. Strict Server-Authoritative Grading: client answers are re-evaluated against database keys.
 * 2. Ownership Isolation: all attempts are bound to user.id extracted from verified JWT.
 * 3. Idempotency: duplicate submissions with matching client_attempt_id or (user_id, question_id, attempted_at)
 *    are safely skipped without inflating counts or corrupting streak.
 * 4. Derived State Integrity: user_skill_progress and user_weaknesses are recalculated server-side.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to sync guest progress.');
    }

    const body = validateBody(syncGuestPayloadSchema, req.body);
    const supabase = createServiceRoleClient();

    if (body.practice_attempts.length === 0) {
      const streak = await updateStreakOnActivity(supabase, user.id, new Date(), body.timezone_offset_minutes);
      return {
        synced_count: 0,
        skipped_duplicate_count: 0,
        total_processed: 0,
        streak,
        is_official: false,
        disclaimer: 'Platform diagnostic estimate for learning path guidance only; not an official Cambridge English certificate or CEFR credential.',
      };
    }

    // 1. Fetch all relevant questions and options in bulk
    const questionIds = Array.from(new Set(body.practice_attempts.map((a) => a.question_id)));
    const { data: questions } = await supabase
      .from('questions')
      .select('id, skill, type, correct_answer_text, weakness_tag, difficulty_weight')
      .in('id', questionIds);

    const questionMap = new Map<string, any>();
    if (questions) {
      for (const q of questions) {
        questionMap.set(q.id, q);
      }
    }

    const { data: options } = await supabase
      .from('question_options')
      .select('question_id, key, is_correct')
      .in('id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

    // Group options by question_id
    const optionsMap = new Map<string, any[]>();
    if (options) {
      for (const opt of options) {
        const list = optionsMap.get(opt.question_id) || [];
        list.push(opt);
        optionsMap.set(opt.question_id, list);
      }
    }

    // 2. Fetch existing user attempts for deduplication check
    const clientAttemptIds = body.practice_attempts
      .map((a) => a.client_attempt_id)
      .filter((id): id is string => Boolean(id));

    let existingAttemptIds = new Set<string>();
    if (clientAttemptIds.length > 0) {
      const { data: existingById } = await supabase
        .from('user_question_attempts')
        .select('id')
        .eq('user_id', user.id)
        .in('id', clientAttemptIds);

      if (existingById) {
        existingAttemptIds = new Set(existingById.map((e: any) => e.id));
      }
    }

    // Also fetch recent attempts for matching (user_id, question_id, attempted_at)
    const { data: existingAttempts } = await supabase
      .from('user_question_attempts')
      .select('question_id, attempted_at')
      .eq('user_id', user.id)
      .in('question_id', questionIds);

    const existingTuples = new Set<string>();
    if (existingAttempts) {
      for (const ea of existingAttempts) {
        existingTuples.add(`${ea.question_id}_${ea.attempted_at}`);
      }
    }

    let syncedCount = 0;
    let skippedDuplicateCount = 0;
    let latestAttemptDate: Date = new Date(0);

    const skillUpdates: Record<string, { total: number; correct: number }> = {};
    const weaknessIncrements: Record<string, number> = {};

    // 3. Process each attempt with deterministic grading
    for (const att of body.practice_attempts) {
      const q = questionMap.get(att.question_id);
      if (!q) {
        // Unknown or deleted question: skip safely
        skippedDuplicateCount += 1;
        continue;
      }

      const attemptedAtStr = att.attempted_at || new Date().toISOString();
      const attemptDate = new Date(attemptedAtStr);
      if (attemptDate.getTime() > latestAttemptDate.getTime()) {
        latestAttemptDate = attemptDate;
      }

      // Check deduplication
      if (att.client_attempt_id && existingAttemptIds.has(att.client_attempt_id)) {
        skippedDuplicateCount += 1;
        continue;
      }

      const tupleKey = `${att.question_id}_${attemptedAtStr}`;
      if (existingTuples.has(tupleKey)) {
        skippedDuplicateCount += 1;
        continue;
      }

      // Server-side deterministic grading
      let isCorrect: boolean | null = null;
      let scoreAwarded = 0;
      let evaluationStatus: 'completed' | 'pending' = 'completed';
      const maxPoints = q.difficulty_weight || 1;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        const qOptions = optionsMap.get(q.id) || [];
        const correctOpt = qOptions.find((o) => o.is_correct);
        isCorrect = Boolean(att.selected_option_key && correctOpt && att.selected_option_key === correctOpt.key);
        scoreAwarded = isCorrect ? maxPoints : 0;
      } else if (q.type === 'fill_blank') {
        const expected = (q.correct_answer_text || '').trim().toLowerCase();
        const actual = (att.text_answer || '').trim().toLowerCase();
        isCorrect = expected.length > 0 && actual === expected;
        scoreAwarded = isCorrect ? maxPoints : 0;
      } else {
        // Subjective (writing, speaking)
        evaluationStatus = 'pending';
        isCorrect = null;
        scoreAwarded = 0;
      }

      // Insert record into user_question_attempts
      const insertRecord: Record<string, any> = {
        user_id: user.id,
        question_id: q.id,
        selected_key: att.selected_option_key || null,
        text_answer: att.text_answer || null,
        is_correct: isCorrect,
        score_awarded: scoreAwarded,
        evaluation_status: evaluationStatus,
        time_spent_seconds: att.time_spent_seconds || 0,
        context_type: att.context_type || 'practice',
        context_attempt_id: null,
        attempted_at: attemptedAtStr,
      };

      if (att.client_attempt_id) {
        insertRecord.id = att.client_attempt_id;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('user_question_attempts')
        .insert(insertRecord)
        .select('id')
        .single();

      if (insertError) {
        // If unique constraint violation occurs concurrently, treat as duplicate
        skippedDuplicateCount += 1;
        continue;
      }

      syncedCount += 1;
      if (att.client_attempt_id && inserted) {
        existingAttemptIds.add(inserted.id);
      }
      existingTuples.add(tupleKey);

      // Track aggregate telemetry
      if (evaluationStatus === 'completed') {
        if (!skillUpdates[q.skill]) {
          skillUpdates[q.skill] = { total: 0, correct: 0 };
        }
        skillUpdates[q.skill].total += 1;
        if (isCorrect === true) {
          skillUpdates[q.skill].correct += 1;
        } else if (isCorrect === false && q.weakness_tag) {
          weaknessIncrements[q.weakness_tag] = (weaknessIncrements[q.weakness_tag] || 0) + 1;
        }
      }
    }

    // 4. Update user_skill_progress
    for (const [skillKey, stat] of Object.entries(skillUpdates)) {
      try {
        const { data: existingProgress } = await supabase
          .from('user_skill_progress')
          .select('id, proficiency_score, questions_completed')
          .eq('user_id', user.id)
          .eq('skill', skillKey)
          .maybeSingle();

        const scoreDelta = (stat.correct * 2) - (stat.total - stat.correct);

        if (existingProgress) {
          const newCompleted = existingProgress.questions_completed + stat.total;
          const newScore = Math.max(0, Math.min(100, existingProgress.proficiency_score + scoreDelta));
          await supabase
            .from('user_skill_progress')
            .update({
              questions_completed: newCompleted,
              proficiency_score: newScore,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProgress.id);
        } else {
          const initialScore = Math.max(0, Math.min(100, 50 + scoreDelta));
          await supabase.from('user_skill_progress').insert({
            user_id: user.id,
            skill: skillKey,
            questions_completed: stat.total,
            proficiency_score: initialScore,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        // Non-blocking telemetry
      }
    }

    // 5. Update user_weaknesses
    for (const [tag, count] of Object.entries(weaknessIncrements)) {
      try {
        const { data: existingWeakness } = await supabase
          .from('user_weaknesses')
          .select('id, error_count')
          .eq('user_id', user.id)
          .eq('weakness_tag', tag)
          .maybeSingle();

        if (existingWeakness) {
          await supabase
            .from('user_weaknesses')
            .update({
              error_count: existingWeakness.error_count + count,
              last_failed_at: new Date().toISOString(),
            })
            .eq('id', existingWeakness.id);
        } else {
          await supabase.from('user_weaknesses').insert({
            user_id: user.id,
            weakness_tag: tag,
            error_count: count,
            last_failed_at: new Date().toISOString(),
          });
        }
      } catch {
        // Non-blocking telemetry
      }
    }

    // 6. Update study streak
    const targetActivityDate = latestAttemptDate.getTime() > 0 ? latestAttemptDate : new Date();
    const streak = await updateStreakOnActivity(
      supabase,
      user.id,
      targetActivityDate,
      body.timezone_offset_minutes
    );

    const result: SyncGuestResultDTO = {
      synced_count: syncedCount,
      skipped_duplicate_count: skippedDuplicateCount,
      total_processed: body.practice_attempts.length,
      streak,
      is_official: false,
      disclaimer: 'Platform diagnostic estimate for learning path guidance only; not an official Cambridge English certificate or CEFR credential.',
    };

    return result;
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'sync_guest',
      maxRequests: 15,
      windowMs: 60_000,
    },
  }
);
