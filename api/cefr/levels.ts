import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';

/**
 * GET /api/cefr/levels
 * Returns reference data for all 6 CEFR levels (A1, A2, B1, B2, C1, C2) from the database.
 * Public access.
 */
export default createApiHandler(
  async () => {
    const supabase = createPublicServerClient();

    const { data: levels, error } = await supabase
      .from('cefr_levels')
      .select('code, name, cambridge_scale_min, cambridge_scale_max, description_en, description_th, order_index')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      levels: levels || [],
      total: levels?.length || 0,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'cefr_levels',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
