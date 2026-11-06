import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, UnauthorizedError } from '../_lib/errors/api-error';

interface UnsubscribeBody {
  endpoint: string;
}

/**
 * POST /api/notifications/unsubscribe
 * Removes a push subscription endpoint for the authenticated user.
 */
export default createApiHandler(
  async ({ user, req }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to unsubscribe.');
    }

    const payload = req.body as UnsubscribeBody;
    if (!payload?.endpoint) {
      throw new BadRequestError('Subscription endpoint is required to unsubscribe.');
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('user_push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', payload.endpoint);

    if (error) {
      throw new BadRequestError(`Failed to unsubscribe: ${error.message}`);
    }

    return {
      success: true,
      message: 'Unsubscribed successfully.',
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
  }
);
