import { createApiHandler } from '../_lib/handler/api-handler';
import { getVapidPublicKey } from '../_lib/notifications/web-push';

/**
 * GET /api/notifications/vapid-public-key
 * Returns the VAPID public key needed by the browser to subscribe to Web Push.
 */
export default createApiHandler(
  async () => {
    const publicKey = getVapidPublicKey();
    return {
      publicKey,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
  }
);
