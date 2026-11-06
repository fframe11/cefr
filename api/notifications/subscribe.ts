import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, UnauthorizedError } from '../_lib/errors/api-error';

interface SubscribeBody {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
  timezone?: string;
  preferredReminderHour?: number;
}

/**
 * POST /api/notifications/subscribe
 * Registers or updates a browser Web Push subscription for the authenticated user.
 */
export default createApiHandler(
  async ({ user, req }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to register push notifications.');
    }

    const payload = req.body as SubscribeBody;
    const subscription = payload?.subscription;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new BadRequestError('Invalid push subscription payload. Missing endpoint or encryption keys.');
    }

    const supabase = createServiceRoleClient();

    // 1. Upsert subscription into user_push_subscriptions
    const { error: subError } = await supabase
      .from('user_push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          user_agent: payload.userAgent || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (subError) {
      throw new BadRequestError(`Failed to save push subscription: ${subError.message}`);
    }

    // 2. Ensure or update notification settings for the user
    const settingsUpdate: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (payload.timezone && typeof payload.timezone === 'string') {
      settingsUpdate.timezone = payload.timezone;
    }

    if (
      typeof payload.preferredReminderHour === 'number' &&
      payload.preferredReminderHour >= 0 &&
      payload.preferredReminderHour <= 23
    ) {
      settingsUpdate.preferred_reminder_hour = payload.preferredReminderHour;
    }

    await supabase
      .from('user_notification_settings')
      .upsert(settingsUpdate, { onConflict: 'user_id' });

    return {
      success: true,
      message: 'Push subscription registered successfully.',
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
  }
);
