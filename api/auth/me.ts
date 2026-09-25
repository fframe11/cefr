import { createApiHandler } from '../_lib/handler/api-handler';
import { UnauthorizedError } from '../_lib/errors/api-error';

/**
 * GET /api/auth/me
 * Returns authenticated user identity information.
 * If anonymous or unauthenticated, returns 401 Unauthorized.
 * 
 * SECURITY INVARIANT:
 * Never returns access tokens, refresh tokens, passwords, or service role credentials.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required. Missing or invalid Bearer token.');
    }

    return {
      user: {
        id: user.id,
        email: user.email || null,
        role: user.role || 'authenticated',
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'auth_me',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
