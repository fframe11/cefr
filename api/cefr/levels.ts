import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { CEFR_LEVELS } from '../../data/cefrLevels';

/**
 * GET /api/cefr/levels
 * Returns reference data for all 6 CEFR levels (A1, A2, B1, B2, C1, C2) from the database.
 * Falls back immediately to canonical CEFR_LEVELS when database is unconfigured.
 */
export default createApiHandler(
  async () => {
    const supabase = createPublicServerClient();

    if (supabase) {
      try {
        const { data: levels, error } = await supabase
          .from('cefr_levels')
          .select('code, name_en, name_th, cambridge_scale_min, cambridge_scale_max, description_en, description_th, order_index')
          .order('order_index', { ascending: true });

        if (!error && levels && levels.length > 0) {
          const mappedLevels = levels.map((l: any) => ({
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
        }
      } catch {
        // Fallback to static CEFR_LEVELS
      }
    }

    const fallbackLevels = CEFR_LEVELS.map((lvl, idx) => ({
      code: lvl.level,
      name: lvl.nameEn,
      name_en: lvl.nameEn,
      name_th: lvl.nameTh,
      cambridge_scale_min: lvl.cambridgeScaleRange[0],
      cambridge_scale_max: lvl.cambridgeScaleRange[1],
      description_en: lvl.descriptionEn,
      description_th: lvl.descriptionTh,
      order_index: idx + 1,
    }));

    return {
      levels: fallbackLevels,
      total: fallbackLevels.length,
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
