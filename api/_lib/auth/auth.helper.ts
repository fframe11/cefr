import type { IncomingMessage } from 'http';
import { createServerUserClient, createServiceRoleClient } from '../supabase/client';
import { UnauthorizedError, ForbiddenError } from '../errors/api-error';
import type { AuthUser } from './types';
import { logger } from '../logger';

export function extractBearerToken(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Extracts and verifies the authenticated user from the request JWT.
 * Returns null if the request is anonymous / unauthenticated.
 */
export async function getAuthUser(req: IncomingMessage): Promise<AuthUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  try {
    const supabase = createServerUserClient(token);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      logger.debug('Token verification failed', { error: error?.message });
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      appMetadata: data.user.app_metadata,
      userMetadata: data.user.user_metadata,
    };
  } catch (err) {
    logger.warn('Error verifying auth token', { error: String(err) });
    return null;
  }
}

/**
 * Enforces that the request is authenticated.
 * Throws UnauthorizedError (401) if no valid JWT is present.
 */
export async function requireAuth(req: IncomingMessage): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new UnauthorizedError('Authentication required. Missing or invalid Bearer token.');
  }
  return user;
}

/**
 * Enforces role-based authorization check.
 * Throws ForbiddenError (403) if user does not possess an allowed role.
 */
export function requireRole(user: AuthUser, allowedRoles: string[]): void {
  const userRole = user.role || 'authenticated';
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(`Access denied. Required roles: [${allowedRoles.join(', ')}]`);
  }
}
