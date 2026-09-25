import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { NotFoundError, UnauthorizedError } from '../_lib/errors/api-error';

/**
 * GET /api/assessment/result
 * Returns the authenticated user's latest diagnostic assessment results.
 * Strictly uses JWT user context.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to view assessment results.');
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch User Profile
    const { data: profile, error: pError } = await supabase
      .from('user_profiles')
      .select('current_cefr_level, target_exam, estimated_cambridge_score, assessment_completed, updated_at')
      .eq('id', user.id)
      .single();

    if (pError || !profile) {
      throw new NotFoundError('User profile not found.');
    }

    if (!profile.assessment_completed) {
      throw new NotFoundError('No completed assessment found. Please complete the diagnostic assessment first.');
    }

    // 2. Fetch Skill Progress Breakdown
    const { data: skills } = await supabase
      .from('user_skill_progress')
      .select('skill, proficiency_score, questions_completed')
      .eq('user_id', user.id);

    const skillBreakdown: Record<string, number> = {
      vocabulary: 50,
      grammar: 50,
      reading: 50,
      listening: 50,
      writing: 50,
      speaking: 50,
    };

    if (skills) {
      for (const s of skills) {
        skillBreakdown[s.skill] = s.proficiency_score;
      }
    }

    // 3. Fetch Identified Weaknesses
    const { data: weaknesses } = await supabase
      .from('user_weaknesses')
      .select('weakness_tag, error_count, last_failed_at')
      .eq('user_id', user.id)
      .order('error_count', { ascending: false })
      .limit(10);

    return {
      assessment_completed: true,
      estimated_cefr_level: profile.current_cefr_level,
      estimated_cambridge_score: profile.estimated_cambridge_score,
      target_exam: profile.target_exam,
      estimation_method: 'platform_diagnostic_heuristic',
      skill_breakdown: skillBreakdown,
      identified_weaknesses: (weaknesses || []).map((w) => ({
        tag: w.weakness_tag,
        error_count: w.error_count,
        last_failed_at: w.last_failed_at,
      })),
      is_official: false,
      disclaimer: 'Platform diagnostic estimate based on internal placement heuristics; not an official Cambridge English examination result or CEFR certificate.',
      assessed_at: profile.updated_at,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'assessment_result',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
