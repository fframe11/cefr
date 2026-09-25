import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';

const speakingQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
  part: z.coerce.number().int().min(1).max(4).optional(),
});

/**
 * GET /api/content/speaking
 * Public endpoint to fetch speaking practice tasks.
 * 
 * SECURITY INVARIANT:
 * Explicitly excludes `model_answer` to prevent premature answer disclosure.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(speakingQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('speaking_prompts')
      .select('id, title, cefr_level, target_exam, part, prompt_th, prompt_en, guiding_questions_th, target_phrases', {
        count: 'exact',
      })
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.target_exam) {
      dbQuery = dbQuery.eq('target_exam', query.target_exam);
    }
    if (query.part !== undefined) {
      dbQuery = dbQuery.eq('part', query.part);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('part', { ascending: true })
      .range(offset, offset + query.limit - 1);

    const { data: prompts, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return {
      prompts: prompts || [],
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
      action: 'content_speaking',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
