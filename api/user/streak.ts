import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { UnauthorizedError } from '../_lib/errors/api-error';
import { STREAK_MILESTONES } from '../_lib/assessment/streak';

/**
 * GET /api/user/streak
 * Returns current streak days, last active date, streak freeze status, and milestone progress.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to view streak.');
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('streak_days, last_active_date')
      .eq('id', user.id)
      .single();

    // 2. Fetch notification settings for streak freeze
    const { data: settings } = await supabase
      .from('user_notification_settings')
      .select('streak_freeze_available, streak_freeze_used_this_month, last_freeze_reset_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const streakDays = profile?.streak_days ?? 0;
    const lastActiveDate = profile?.last_active_date ?? null;

    // Check if practiced today
    const todayStr = new Date().toISOString().slice(0, 10);
    const practicedToday = lastActiveDate === todayStr;

    // Determine milestones reached and next milestone
    const milestones = Object.values(STREAK_MILESTONES);
    const completedMilestones = milestones.filter((m) => streakDays >= m.days);
    const nextMilestone = milestones.find((m) => streakDays < m.days) || null;

    return {
      streak_days: streakDays,
      last_active_date: lastActiveDate,
      practiced_today: practicedToday,
      freeze: {
        available: settings?.streak_freeze_available ?? 1,
        used_this_month: settings?.streak_freeze_used_this_month ?? 0,
      },
      milestones: {
        completed: completedMilestones,
        next: nextMilestone,
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
  }
);
