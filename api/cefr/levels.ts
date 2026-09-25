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
      .select('code, name_en, name_th, cambridge_scale_min, cambridge_scale_max, description_en, description_th, order_index')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    const mappedLevels = (levels || []).map((l: any) => ({
      code: l.code,
      name: l.name_en,
      name_en: l.name_en,
      name_th: l.name_th,
      cambridge_scale_min: l.cambridge_scale_min,
      cambridge_scale_max: l.cambridge_scale_max,
      description_en: l.description_en,
      description_th: l.description_th,
      order_index: l.order_index,
    }));

    return {
      levels: mappedLevels,
      total: mappedLevels.length,
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
