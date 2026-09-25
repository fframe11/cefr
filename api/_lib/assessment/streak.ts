import { SupabaseClient } from '@supabase/supabase-js';

export interface StreakResult {
  streak_days: number;
  last_active_date: string;
  is_new_day: boolean;
}

/**
 * Pure helper to compute new streak based on calendar day differences.
 * Timezone-aware and idempotent.
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  activityDate: Date = new Date(),
  timezoneOffsetMinutes?: number
): StreakResult {
  let effectiveTime = activityDate.getTime();
  if (typeof timezoneOffsetMinutes === 'number' && !isNaN(timezoneOffsetMinutes)) {
    // Client timezone offset: minutes behind UTC (e.g. Bangkok UTC+7 is -420)
    effectiveTime -= timezoneOffsetMinutes * 60 * 1000;
  }
  const effectiveDate = new Date(effectiveTime);
  const todayStr = effectiveDate.toISOString().slice(0, 10);

  if (!lastActiveDate) {
    return {
      streak_days: 1,
      last_active_date: todayStr,
      is_new_day: true,
    };
  }

  if (lastActiveDate === todayStr) {
    return {
      streak_days: Math.max(1, currentStreak),
      last_active_date: todayStr,
      is_new_day: false,
    };
  }

  const dLast = new Date(lastActiveDate + 'T00:00:00Z');
  const dToday = new Date(todayStr + 'T00:00:00Z');
  const diffDays = Math.round((dToday.getTime() - dLast.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return {
      streak_days: (currentStreak || 0) + 1,
      last_active_date: todayStr,
      is_new_day: true,
    };
  } else if (diffDays > 1) {
    return {
      streak_days: 1,
      last_active_date: todayStr,
      is_new_day: true,
    };
  } else {
    // Historical date submitted (e.g. syncing older offline attempts)
    return {
      streak_days: Math.max(1, currentStreak),
      last_active_date: lastActiveDate,
      is_new_day: false,
    };
  }
}

/**
 * Server-authoritative streak updater.
 * Reads user_profiles, recalculates streak, and persists updates.
 */
export async function updateStreakOnActivity(
  supabase: SupabaseClient,
  userId: string,
  activityDate: Date = new Date(),
  timezoneOffsetMinutes?: number
): Promise<StreakResult> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('streak_days, last_active_date')
    .eq('id', userId)
    .single();

  const currentStreak = profile?.streak_days ?? 0;
  const lastActiveDate = profile?.last_active_date ?? null;

  const result = calculateNewStreak(currentStreak, lastActiveDate, activityDate, timezoneOffsetMinutes);

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

  return result;
}
