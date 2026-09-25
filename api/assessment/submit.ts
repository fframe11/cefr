import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { UnauthorizedError, BadRequestError } from '../_lib/errors/api-error';
import { estimatePlatformCefr } from '../_lib/assessment/cefr-calculator';
import { updateStreakOnActivity } from '../_lib/assessment/streak';

export const assessmentAnswerItemSchema = z
  .object({
    question_id: uuidSchema.or(z.string().min(1).max(100)),
    selected_option_key: z.string().trim().max(5).optional().nullable(),
    text_answer: z.string().trim().max(2000).optional().nullable(),
    time_spent_seconds: z.coerce.number().int().min(0).default(0),
  })
  .refine((data) => data.selected_option_key || data.text_answer, {
    message: 'Either selected_option_key or text_answer must be provided for evaluation.',
    path: ['selected_option_key'],
  });

export const assessmentSubmitSchema = z.object({
  answers: z.array(assessmentAnswerItemSchema).min(1, 'At least one answer must be provided').max(50),
  // Strict non-trust of client claims
  user_id: z.unknown().optional(),
  cefr_level: z.unknown().optional(),
  score: z.unknown().optional(),
  proficiency: z.unknown().optional(),
});

export interface AssessmentResultDTO {
  total_questions: number;
  correct_count: number;
  percentage_score: number;
  estimated_cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  estimated_cambridge_score: number;
  recommended_exam: 'KET' | 'PET' | 'FCE' | 'CAE';
  target_exam: string;
  estimation_method: 'platform_diagnostic_heuristic';
  skill_breakdown: Record<string, number>;
  identified_weaknesses: Array<{ tag: string; label_th: string; error_count: number }>;
  is_official: false;
  disclaimer: string;
  submitted_at: string;
}

/**
 * POST /api/assessment/submit
 * Evaluates full diagnostic/placement assessment submissions server-side.
 * Calculates deterministic platform CEFR estimate and updates user profile atomically.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to submit assessment.');
    }

    const body = validateBody(assessmentSubmitSchema, req.body);
    const supabase = createServiceRoleClient();

    let correctCount = 0;
    const skillCounts: Record<string, { total: number; correct: number }> = {
      vocabulary: { total: 0, correct: 0 },
      grammar: { total: 0, correct: 0 },
      reading: { total: 0, correct: 0 },
      listening: { total: 0, correct: 0 },
      writing: { total: 0, correct: 0 },
      speaking: { total: 0, correct: 0 },
    };

    const identifiedWeaknesses: Record<string, { tag: string; label_th: string; error_count: number }> = {};
    const submittedAt = new Date().toISOString();

    // Iterate through submitted answers and evaluate
    for (const ans of body.answers) {
      // 1. Fetch Question from DB
      const { data: question } = await supabase
        .from('questions')
        .select('id, skill, cefr_level, type, prompt_th, prompt_en, correct_answer_text, weakness_tag, difficulty_weight')
        .eq('id', ans.question_id)
        .eq('is_active', true)
        .single();

      // If question is not found in database, we check options or skip safely
      if (!question) {
        continue;
      }

      const { data: options } = await supabase
        .from('question_options')
        .select('id, key, text, is_correct, feedback_th')
        .eq('question_id', question.id);

      const maxPoints = question.difficulty_weight || 1;
      let isCorrect = false;

      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const selected = options?.find((opt) => opt.key === ans.selected_option_key);
        isCorrect = Boolean(selected && selected.is_correct);
      } else if (question.type === 'fill_blank') {
        const expected = (question.correct_answer_text || '').trim().toLowerCase();
        const actual = (ans.text_answer || '').trim().toLowerCase();
        isCorrect = expected.length > 0 && actual === expected;
      }

      if (isCorrect) {
        correctCount += 1;
      } else if (question.weakness_tag) {
        if (!identifiedWeaknesses[question.weakness_tag]) {
          identifiedWeaknesses[question.weakness_tag] = {
            tag: question.weakness_tag,
            label_th: question.prompt_th ? question.prompt_th.slice(0, 80) : question.weakness_tag,
            error_count: 1,
          };
        } else {
          identifiedWeaknesses[question.weakness_tag].error_count += 1;
        }

        // Upsert into user_weaknesses table
        try {
          const { data: existingWeakness } = await supabase
            .from('user_weaknesses')
            .select('id, error_count')
            .eq('user_id', user.id)
            .eq('weakness_tag', question.weakness_tag)
            .single();

          if (existingWeakness) {
            await supabase
              .from('user_weaknesses')
              .update({
                error_count: existingWeakness.error_count + 1,
                last_failed_at: submittedAt,
              })
              .eq('id', existingWeakness.id);
          } else {
            await supabase.from('user_weaknesses').insert({
              user_id: user.id,
              weakness_tag: question.weakness_tag,
              error_count: 1,
              last_failed_at: submittedAt,
            });
          }
        } catch {
          // Non-blocking telemetry
        }
      }

      // Track skill counts
      if (skillCounts[question.skill]) {
        skillCounts[question.skill].total += 1;
        if (isCorrect) {
          skillCounts[question.skill].correct += 1;
        }
      }

      // Record attempt in user_question_attempts with context_type = 'placement'
      try {
        await supabase.from('user_question_attempts').insert({
          user_id: user.id,
          question_id: question.id,
          selected_key: ans.selected_option_key || null,
          text_answer: ans.text_answer || null,
          is_correct: isCorrect,
          score_awarded: isCorrect ? maxPoints : 0,
          evaluation_status: 'completed',
          time_spent_seconds: ans.time_spent_seconds || 0,
          context_type: 'placement',
          context_attempt_id: null,
          attempted_at: submittedAt,
        });
      } catch {
        // Non-blocking attempt record
      }
    }

    const totalQuestions = body.answers.length;
    const estimation = estimatePlatformCefr(correctCount, totalQuestions);

    // Compute skill breakdown percentage (0-100)
    const skillBreakdown: Record<string, number> = {};
    for (const [skillKey, stat] of Object.entries(skillCounts)) {
      if (stat.total > 0) {
        skillBreakdown[skillKey] = Math.round((stat.correct / stat.total) * 100);
      } else {
        // Default baseline aligned with overall score
        skillBreakdown[skillKey] = estimation.percentage;
      }

      // Update user_skill_progress
      try {
        const { data: existingSkill } = await supabase
          .from('user_skill_progress')
          .select('id, proficiency_score, questions_completed')
          .eq('user_id', user.id)
          .eq('skill', skillKey)
          .single();

        if (existingSkill) {
          await supabase
            .from('user_skill_progress')
            .update({
              proficiency_score: skillBreakdown[skillKey],
              questions_completed: existingSkill.questions_completed + stat.total,
              updated_at: submittedAt,
            })
            .eq('id', existingSkill.id);
        } else {
          await supabase.from('user_skill_progress').insert({
            user_id: user.id,
            skill: skillKey,
            proficiency_score: skillBreakdown[skillKey],
            questions_completed: stat.total,
            updated_at: submittedAt,
          });
        }
      } catch {
        // Non-blocking skill update
      }
    }

    // Fetch existing user profile to preserve user-owned target_exam
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('target_exam')
      .eq('id', user.id)
      .single();
    const userTargetExam = profile?.target_exam || 'PET';

    // Atomically update user_profiles (Server-owned fields ONLY - DO NOT mutate user-owned target_exam)
    const todayDate = submittedAt.split('T')[0];
    await supabase
      .from('user_profiles')
      .update({
        current_cefr_level: estimation.estimatedLevel,
        estimated_cambridge_score: estimation.estimatedCambridgeScore,
        assessment_completed: true,
        last_active_date: todayDate,
        updated_at: submittedAt,
      })
      .eq('id', user.id);

    try {
      await updateStreakOnActivity(supabase, user.id, new Date(submittedAt));
    } catch {
      // Non-blocking telemetry
    }

    const result: AssessmentResultDTO = {
      total_questions: totalQuestions,
      correct_count: correctCount,
      percentage_score: estimation.percentage,
      estimated_cefr_level: estimation.estimatedLevel,
      estimated_cambridge_score: estimation.estimatedCambridgeScore,
      recommended_exam: estimation.recommendedExam,
      target_exam: userTargetExam,
      estimation_method: 'platform_diagnostic_heuristic',
      skill_breakdown: skillBreakdown,
      identified_weaknesses: Object.values(identifiedWeaknesses),
      is_official: false,
      disclaimer: estimation.disclaimer,
      submitted_at: submittedAt,
    };

    return result;
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
    rateLimit: {
      action: 'assessment_submit',
      maxRequests: 10,
      windowMs: 60_000,
    },
  }
);
