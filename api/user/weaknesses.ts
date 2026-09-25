import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { UnauthorizedError } from '../_lib/errors/api-error';

const weaknessesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/user/weaknesses
 * Returns the authenticated user's tracked learning weaknesses and error frequencies.
 * Strict ownership enforcement via JWT session user.id.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to view weaknesses.');
    }

    const query = validateQuery(weaknessesQuerySchema, req.query);
    const supabase = createServiceRoleClient();

    const { data: weaknesses, count, error } = await supabase
      .from('user_weaknesses')
      .select('id, weakness_tag, error_count, last_failed_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('error_count', { ascending: false })
      .order('last_failed_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (error) {
      throw error;
    }

    return {
      weaknesses: weaknesses || [],
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'user_weaknesses',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
