import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, paginationSchema } from '../_lib/validation/common-schemas';

const grammarQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  slug: z.string().max(100).optional(),
});

/**
 * GET /api/content/grammar
 * Public endpoint to fetch grammar lessons and concept rules.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(grammarQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('grammar_topics')
      .select(
        'id, slug, title_en, title_th, cefr_level, summary_th, concept_th, concept_en, rules, common_mistakes',
        { count: 'exact' }
      )
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.slug) {
      dbQuery = dbQuery.eq('slug', query.slug);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('slug', { ascending: true })
      .range(offset, offset + query.limit - 1);

    const { data: topics, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return {
      topics: topics || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / query.limit),
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'content_grammar',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
