import { SupabaseClient } from '@supabase/supabase-js';

export interface StreakMilestone {
  days: number;
  badge: string;
  xp: number;
}

export const STREAK_MILESTONES: Record<number, StreakMilestone> = {
  7: { days: 7, badge: 'Weekly Warrior', xp: 100 },
  30: { days: 30, badge: 'Monthly Master', xp: 500 },
  100: { days: 100, badge: 'Century Polyglot', xp: 2000 },
};

export interface StreakResult {
  streak_days: number;
  last_active_date: string;
  is_new_day: boolean;
  freeze_used?: boolean;
  milestone?: StreakMilestone | null;
}

/**
 * Pure helper to compute new streak based on calendar day differences.
 * Timezone-aware, idempotent, and supports streak freeze retention & milestones.
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  activityDate: Date = new Date(),
  timezoneOffsetMinutesOrOptions?: number | { timezoneOffsetMinutes?: number; streakFreezeAvailable?: number }
): StreakResult {
  let timezoneOffsetMinutes: number | undefined;
  let streakFreezeAvailable = 0;

  if (typeof timezoneOffsetMinutesOrOptions === 'number') {
    timezoneOffsetMinutes = timezoneOffsetMinutesOrOptions;
  } else if (timezoneOffsetMinutesOrOptions && typeof timezoneOffsetMinutesOrOptions === 'object') {
    timezoneOffsetMinutes = timezoneOffsetMinutesOrOptions.timezoneOffsetMinutes;
    streakFreezeAvailable = timezoneOffsetMinutesOrOptions.streakFreezeAvailable ?? 0;
  }

  let effectiveTime = activityDate.getTime();
  if (typeof timezoneOffsetMinutes === 'number' && !isNaN(timezoneOffsetMinutes)) {
    // Client timezone offset: minutes behind UTC (e.g. Bangkok UTC+7 is -420)
    effectiveTime -= timezoneOffsetMinutes * 60 * 1000;
  }
  const effectiveDate = new Date(effectiveTime);
  const todayStr = effectiveDate.toISOString().slice(0, 10);

  if (!lastActiveDate) {
    const milestone = STREAK_MILESTONES[1] || null;
    return {
      streak_days: 1,
      last_active_date: todayStr,
      is_new_day: true,
      freeze_used: false,
      milestone,
    };
  }

  if (lastActiveDate === todayStr) {
    return {
      streak_days: Math.max(1, currentStreak),
      last_active_date: todayStr,
      is_new_day: false,
      freeze_used: false,
      milestone: null,
    };
  }

  const dLast = new Date(lastActiveDate + 'T00:00:00Z');
  const dToday = new Date(todayStr + 'T00:00:00Z');
  const diffDays = Math.round((dToday.getTime() - dLast.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    const newStreak = (currentStreak || 0) + 1;
    return {
      streak_days: newStreak,
      last_active_date: todayStr,
      is_new_day: true,
      freeze_used: false,
      milestone: STREAK_MILESTONES[newStreak] || null,
    };
  } else if (diffDays === 2 && streakFreezeAvailable > 0) {
    // Missed exactly 1 day, but streak freeze is available: streak is preserved and incremented!
    const newStreak = (currentStreak || 0) + 1;
    return {
      streak_days: newStreak,
      last_active_date: todayStr,
      is_new_day: true,
      freeze_used: true,
      milestone: STREAK_MILESTONES[newStreak] || null,
    };
  } else if (diffDays > 1) {
    // Broken streak, resets to 1
    return {
      streak_days: 1,
      last_active_date: todayStr,
      is_new_day: true,
      freeze_used: false,
      milestone: STREAK_MILESTONES[1] || null,
    };
  } else {
    // Historical date submitted (e.g. syncing older offline attempts)
    return {
      streak_days: Math.max(1, currentStreak),
      last_active_date: lastActiveDate,
      is_new_day: false,
      freeze_used: false,
      milestone: null,
    };
  }
}

/**
 * Server-authoritative streak updater.
 * Reads user_profiles & user_notification_settings, recalculates streak with freeze & milestone XP,
 * and persists updates.
 */
export async function updateStreakOnActivity(
  supabase: SupabaseClient,
  userId: string,
  activityDate: Date = new Date(),
  timezoneOffsetMinutes?: number
): Promise<StreakResult> {
  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('streak_days, last_active_date, current_cefr_level')
    .eq('id', userId)
    .single();

  const currentStreak = profile?.streak_days ?? 0;
  const lastActiveDate = profile?.last_active_date ?? null;

  // 2. Fetch user notification settings (for streak freeze eligibility)
  const { data: settings } = await supabase
    .from('user_notification_settings')
    .select('streak_freeze_available, streak_freeze_used_this_month, last_freeze_reset_at')
    .eq('user_id', userId)
    .maybeSingle();

  // Monthly freeze reset check (1 freeze available per calendar month)
  let freezeAvailable = settings?.streak_freeze_available ?? 1;
  const lastReset = settings?.last_freeze_reset_at ? new Date(settings.last_freeze_reset_at) : null;
  const now = new Date();

  if (lastReset && (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear())) {
    // New calendar month: reset to 1 free freeze
    freezeAvailable = 1;
    await supabase
      .from('user_notification_settings')
      .update({
        streak_freeze_available: 1,
        streak_freeze_used_this_month: 0,
        last_freeze_reset_at: now.toISOString(),
      })
      .eq('user_id', userId);
  }

  // 3. Calculate new streak with freeze support
  const result = calculateNewStreak(currentStreak, lastActiveDate, activityDate, {
    timezoneOffsetMinutes,
    streakFreezeAvailable: freezeAvailable,
  });

  // 4. Persist profile update
  if (profile) {
    if (result.is_new_day || profile.streak_days !== result.streak_days) {
      await supabase
        .from('user_profiles')
        .update({
          streak_days: result.streak_days,
          last_active_date: result.last_active_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
  }

  // 5. If freeze was used, decrement available freeze in settings
  if (result.freeze_used && settings) {
    await supabase
      .from('user_notification_settings')
      .update({
        streak_freeze_available: Math.max(0, freezeAvailable - 1),
        streak_freeze_used_this_month: (settings.streak_freeze_used_this_month ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  return result;
}
