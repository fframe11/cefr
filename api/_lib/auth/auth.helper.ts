import type { IncomingMessage } from 'http';
import { createServerUserClient } from '../supabase/client';
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
 * Deterministically checks whether the current request/user is in authorized Demo Mode.
 * Preferred order:
 * 1. Dedicated demo account/session (student@glova.demo, demo-student-id)
 * 2. Dedicated demo token (token-demo-student-id-*)
 * 3. Dedicated demo header (X-Demo-Mode: true)
 * 4. Dedicated query parameter (?demo=true)
 */
export function isDemoSession(user?: AuthUser | null, req?: IncomingMessage): boolean {
  if (user) {
    if (user.id === 'demo-student-id' || user.id.startsWith('demo-')) return true;
    if (user.email && (user.email.endsWith('@glova.demo') || user.email === 'lead@glova.demo')) return true;
    if (user.appMetadata?.demo === true || user.userMetadata?.demo === true) return true;
  }
  if (req) {
    const authHeader = req.headers?.authorization;
    if (authHeader && (authHeader.includes('demo-student-id') || authHeader.includes('lead-demo') || authHeader.includes('demo-lead'))) {
      return true;
    }
    const demoHeader = req.headers?.['x-demo-mode'];
    if (demoHeader === 'true' || demoHeader === '1') {
      return true;
    }
    const url = req.url || '';
    if (url.includes('demo=true') || url.includes('mode=demo')) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts and verifies the authenticated user from the request JWT.
 * Returns null if the request is anonymous / unauthenticated.
 */
export async function getAuthUser(req: IncomingMessage): Promise<AuthUser | null> {
  const token = extractBearerToken(req);
  if (!token) return null;

  // 1. Dedicated Demo Session / Lead Token
  if (
    token.startsWith('token-demo-student-id') ||
    token.includes('demo-student-id') ||
    token === 'demo-lead-token'
  ) {
    return {
      id: 'demo-student-id',
      email: 'candidate@cefr.edu',
      role: 'authenticated',
      appMetadata: { demo: true, provider: 'demo' },
      userMetadata: { display_name: 'Cambridge Candidate', full_name: 'Cambridge Candidate', demo: true },
    };
  }

  // 2. Production Supabase JWT Verification
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
