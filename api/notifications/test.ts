import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, UnauthorizedError } from '../_lib/errors/api-error';
import { sendWebPushNotification } from '../_lib/notifications/web-push';

/**
 * POST /api/notifications/test
 * Sends a live test Web Push notification to all active devices registered by the user.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to send test notification.');
    }

    const supabase = createServiceRoleClient();

    const { data: subscriptions, error } = await supabase
      .from('user_push_subscriptions')
      .select('endpoint, p256dh_key, auth_key')
      .eq('user_id', user.id);

    if (error || !subscriptions || subscriptions.length === 0) {
      throw new BadRequestError('No active push subscriptions found for this account.');
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const res = await sendWebPushNotification(
        sub,
        {
          title: '🔥 GLOVA Test Notification',
          body: 'การแจ้งเตือนสำเร็จ! ระบบพร้อมแจ้งเตือนเตือนฝึกภาษาอังกฤษตามเวลาที่คุณเลือกแล้ว',
          url: '/dashboard',
          tag: 'glova-test-notification',
        },
        supabase
      );

      if (res.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return {
      success: true,
      sent,
      failed,
      message: `Dispatched test notifications: ${sent} succeeded, ${failed} failed.`,
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
  }
);
