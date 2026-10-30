import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, UnauthorizedError } from '../_lib/errors/api-error';

interface PatchSettingsBody {
  daily_reminder_enabled?: boolean;
  preferred_reminder_hour?: number;
  timezone?: string;
}

/**
 * GET & PATCH /api/notifications/settings
 * Manages user's notification preferences, timezones, and streak freeze state.
 */
export default createApiHandler(
  async ({ user, req, body }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to manage notification settings.');
    }

    const supabase = createServiceRoleClient();
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      const { data: settings } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Return existing or default settings
      const result = settings || {
        user_id: user.id,
        daily_reminder_enabled: true,
        preferred_reminder_hour: 20,
        timezone: 'Asia/Bangkok',
        streak_freeze_available: 1,
        streak_freeze_used_this_month: 0,
      };

      // Also get subscription count for user
      const { count } = await supabase
        .from('user_push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        settings: result,
        active_subscriptions_count: count ?? 0,
      };
    }

    if (method === 'PATCH' || method === 'POST') {
      const payload = (body || {}) as PatchSettingsBody;
      const updates: Record<string, unknown> = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (typeof payload.daily_reminder_enabled === 'boolean') {
        updates.daily_reminder_enabled = payload.daily_reminder_enabled;
      }

      if (typeof payload.preferred_reminder_hour === 'number') {
        if (payload.preferred_reminder_hour < 0 || payload.preferred_reminder_hour > 23) {
          throw new BadRequestError('Preferred reminder hour must be between 0 and 23.');
        }
        updates.preferred_reminder_hour = Math.floor(payload.preferred_reminder_hour);
      }

      if (typeof payload.timezone === 'string' && payload.timezone.trim()) {
        updates.timezone = payload.timezone.trim();
      }

      const { data: updated, error } = await supabase
        .from('user_notification_settings')
        .upsert(updates, { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error) {
        throw new BadRequestError(`Failed to update notification settings: ${error.message}`);
      }

      return {
        success: true,
        settings: updated,
      };
    }

    throw new BadRequestError(`Method ${method} not allowed.`);
  },
  {
    allowedMethods: ['GET', 'PATCH', 'POST'],
    requireAuth: true,
  }
);
