import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { sendWebPushNotification } from '../_lib/notifications/web-push';
import { UnauthorizedError } from '../_lib/errors/api-error';

export function getUserLocalTime(
  timezone: string,
  date: Date = new Date()
): { localHour: number; localDateStr: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    let year = '';
    let month = '';
    let day = '';
    let hour = 0;
    for (const part of parts) {
      if (part.type === 'year') year = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'day') day = part.value;
      if (part.type === 'hour') hour = parseInt(part.value, 10);
    }
    return {
      localHour: hour,
      localDateStr: `${year}-${month}-${day}`,
    };
  } catch {
    // Fallback to Asia/Bangkok (UTC+7)
    const bangkokTime = new Date(date.getTime() + 7 * 3600 * 1000);
    return {
      localHour: bangkokTime.getUTCHours(),
      localDateStr: bangkokTime.toISOString().slice(0, 10),
    };
  }
}

/**
 * GET & POST /api/cron/hourly-reminders
 * Hourly Cron job triggered by Cloudflare / Vercel Cron.
 * Evaluates active user notification settings, checks local time & daily practice completion,
 * and delivers streak retention Web Push notifications.
 */
export default createApiHandler(
  async ({ req }) => {
    // 1. Cron Secret Verification (if configured)
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && process.env.NODE_ENV === 'production') {
      const authHeader = req.headers['authorization'];
      const customHeader = req.headers['x-cron-secret'];
      const token = authHeader?.replace(/^Bearer\s+/i, '') || customHeader;

      if (token !== expectedSecret) {
        throw new UnauthorizedError('Invalid or missing CRON_SECRET authorization token.');
      }
    }

    const supabase = createServiceRoleClient();
    const now = new Date();

    // 2. Fetch users with daily reminders enabled
    const { data: eligibleSettings, error: setErr } = await supabase
      .from('user_notification_settings')
      .select('user_id, preferred_reminder_hour, timezone')
      .eq('daily_reminder_enabled', true);

    if (setErr) {
      return {
        success: false,
        error: setErr.message,
      };
    }

    if (!eligibleSettings || eligibleSettings.length === 0) {
      return {
        success: true,
        evaluated: 0,
        sent: 0,
        message: 'No users with daily reminder enabled.',
      };
    }

    let evaluatedCount = 0;
    let sentCount = 0;
    let failedCount = 0;

    for (const setting of eligibleSettings) {
      evaluatedCount++;
      const tz = setting.timezone || 'Asia/Bangkok';
      const { localHour, localDateStr } = getUserLocalTime(tz, now);

      // Check if current local hour matches user's preferred reminder hour
      if (localHour !== setting.preferred_reminder_hour) {
        continue;
      }

      // Check user practice activity today in user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('streak_days, last_active_date')
        .eq('id', setting.user_id)
        .maybeSingle();

      const todayPracticed = profile?.last_active_date === localDateStr;
      if (todayPracticed) {
        // Learner already completed daily practice, skip notification
        continue;
      }

      // Query active push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from('user_push_subscriptions')
        .select('endpoint, p256dh_key, auth_key')
        .eq('user_id', setting.user_id);

      if (!subscriptions || subscriptions.length === 0) {
        continue;
      }

      const streakDays = profile?.streak_days ?? 0;
      const pushTitle = streakDays > 0
        ? `🔥 อย่าให้ไฟ Streak ${streakDays} วันดับลง!`
        : `📚 ถึงเวลาฝึกภาษาอังกฤษวันนี้แล้ว!`;
      const pushBody = streakDays > 0
        ? `เข้าฝึกภาษาอังกฤษเพียง 3-5 นาทีวันนี้เพื่อรักษาสถิติการเรียนของคุณ`
        : `ฝึกทักษะ คำศัพท์ หรือข้อสอบสั้นๆ วันนี้เพื่อเริ่มต้น Streak วันแรก!`;

      for (const sub of subscriptions) {
        const res = await sendWebPushNotification(
          sub,
          {
            title: pushTitle,
            body: pushBody,
            url: '/dashboard',
            tag: 'glova-streak-reminder',
          },
          supabase
        );

        if (res.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
    }

    return {
      success: true,
      evaluated: evaluatedCount,
      sent: sentCount,
      failed: failedCount,
      timestamp: now.toISOString(),
    };
  },
  {
    allowedMethods: ['GET', 'POST'],
    requireAuth: false,
  }
);
