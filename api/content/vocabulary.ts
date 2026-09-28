import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, paginationSchema } from '../_lib/validation/common-schemas';

const vocabularyQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  part_of_speech: z.string().max(40).optional(),
  topic: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
});

/**
 * GET /api/content/vocabulary
 * Public endpoint to fetch vocabulary content bank items with CEFR, POS, and topic filters.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(vocabularyQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('vocabularies')
      .select(
        'id, word, lemma, cefr_level, part_of_speech, ipa, meaning_th, meaning_en, example_sentence_en, example_sentence_th, topic, synonyms, antonyms',
        { count: 'exact' }
      )
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.part_of_speech) {
      dbQuery = dbQuery.eq('part_of_speech', query.part_of_speech);
    }
    if (query.topic) {
      dbQuery = dbQuery.eq('topic', query.topic);
    }
    if (query.search) {
      dbQuery = dbQuery.ilike('word', `%${query.search}%`);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('word', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + query.limit - 1);

    const { data: items, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return {
      items: items || [],
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
      action: 'content_vocabulary',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
