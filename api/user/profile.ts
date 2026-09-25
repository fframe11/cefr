import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { cambridgeExamCodeSchema } from '../_lib/validation/common-schemas';
import { NotFoundError, UnauthorizedError } from '../_lib/errors/api-error';

export const updateProfileSchema = z
  .object({
    target_exam: cambridgeExamCodeSchema.optional(),
    daily_goal_minutes: z.coerce
      .number()
      .int()
      .min(5, 'Minimum daily goal is 5 minutes')
      .max(180, 'Maximum daily goal is 180 minutes')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one editable field (target_exam, daily_goal_minutes) must be provided for update.',
  });

/**
 * GET /api/user/profile
 * Returns the authenticated user's own profile.
 * 
 * PATCH /api/user/profile
 * Updates only client-whitelisted profile fields (target_exam, daily_goal_minutes).
 * Rejects any mutations to server-owned fields.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to access profile.');
    }

    const supabase = createServiceRoleClient();

    if (req.method === 'GET') {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        throw new NotFoundError('User profile not found.');
      }

      return {
        profile: {
          id: profile.id,
          current_cefr_level: profile.current_cefr_level,
          target_exam: profile.target_exam,
          estimated_cambridge_score: profile.estimated_cambridge_score,
          streak_days: profile.streak_days,
          daily_goal_minutes: profile.daily_goal_minutes,
          last_active_date: profile.last_active_date,
          assessment_completed: profile.assessment_completed,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        },
      };
    }

    if (req.method === 'PATCH') {
      const validated = validateBody(updateProfileSchema, req.body);

      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (validated.target_exam !== undefined) {
        updatePayload.target_exam = validated.target_exam;
      }
      if (validated.daily_goal_minutes !== undefined) {
        updatePayload.daily_goal_minutes = validated.daily_goal_minutes;
      }

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single();

      if (error || !updatedProfile) {
        throw new NotFoundError('User profile not found or update failed.');
      }

      return {
        profile: {
          id: updatedProfile.id,
          current_cefr_level: updatedProfile.current_cefr_level,
          target_exam: updatedProfile.target_exam,
          estimated_cambridge_score: updatedProfile.estimated_cambridge_score,
          streak_days: updatedProfile.streak_days,
          daily_goal_minutes: updatedProfile.daily_goal_minutes,
          last_active_date: updatedProfile.last_active_date,
          assessment_completed: updatedProfile.assessment_completed,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at,
        },
      };
    }
  },
  {
    allowedMethods: ['GET', 'PATCH'],
    requireAuth: true,
    rateLimit: {
      action: 'user_profile',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
