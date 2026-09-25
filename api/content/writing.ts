import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';

const writingQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
  task_type: z.enum(['Email', 'Essay', 'Article', 'Story', 'Review']).optional(),
});

/**
 * GET /api/content/writing
 * Public endpoint to fetch writing practice prompts.
 * 
 * SECURITY INVARIANT:
 * Explicitly excludes `sample_model_answer` to prevent cheating before student submission.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(writingQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('writing_prompts')
      .select('id, title, cefr_level, target_exam, task_type, prompt_th, prompt_en, min_words, max_words, guidelines_th, useful_phrases, rubrics', {
        count: 'exact',
      })
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.target_exam) {
      dbQuery = dbQuery.eq('target_exam', query.target_exam);
    }
    if (query.task_type) {
      dbQuery = dbQuery.eq('task_type', query.task_type);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('title', { ascending: true })
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
      action: 'content_writing',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
