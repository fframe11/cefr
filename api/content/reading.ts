import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';

const readingQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
  topic: z.string().max(100).optional(),
});

/**
 * GET /api/content/reading
 * Public endpoint to fetch reading comprehension passages.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(readingQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('reading_passages')
      .select('id, title, cefr_level, target_exam, topic, content, word_count, vocabulary_glossary', {
        count: 'exact',
      })
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.target_exam) {
      dbQuery = dbQuery.eq('target_exam', query.target_exam);
    }
    if (query.topic) {
      dbQuery = dbQuery.eq('topic', query.topic);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('title', { ascending: true })
      .range(offset, offset + query.limit - 1);

    const { data: passages, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return {
      passages: passages || [],
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
      action: 'content_reading',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
