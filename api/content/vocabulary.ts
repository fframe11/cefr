import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, paginationSchema } from '../_lib/validation/common-schemas';
import { searchProductionVocabulary } from '../../lib/vocabulary/production-vocabulary';
import { queryExamUniverse } from '../../lib/vocabulary/exam-universe';

import { sanitizeVocabularyItem } from '../../lib/vocabulary/curated-definitions';

const vocabularyQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  part_of_speech: z.string().max(40).optional(),
  topic: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  exam: z.string().max(30).optional(),
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

    // If specific exam filter is requested (DAILY, IELTS, TOEIC, TOEFL, CEFR), route to Exam Universe
    if (query.exam && query.exam !== 'ALL') {
      const examRes = queryExamUniverse({
        exam: query.exam,
        cefr: query.cefr_level,
        pos: query.part_of_speech,
        q: query.search,
        page: query.page,
        pageSize: query.limit,
      });

      return {
        items: examRes.items.map(sanitizeVocabularyItem),
        pagination: {
          page: examRes.page,
          limit: examRes.pageSize,
          total: examRes.total,
          total_pages: examRes.totalPages,
        },
        stats: examRes.stats,
      };
    }

    try {
      const { data: items, count, error } = await dbQuery;

      if (!error && items && items.length > 0) {
        return {
          items: items.map(sanitizeVocabularyItem),
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / query.limit),
          },
        };
      }
    } catch (dbErr) {
      console.warn('[ContentVocabulary] Supabase query failed, falling back to local production bank:', dbErr);
    }

    // High-performance fallback to verified exam & production universe
    const examFallback = queryExamUniverse({
      cefr: query.cefr_level,
      pos: query.part_of_speech,
      q: query.search,
      page: query.page,
      pageSize: query.limit,
    });

    if (examFallback.items.length > 0) {
      return {
        items: examFallback.items.map(sanitizeVocabularyItem),
        pagination: {
          page: examFallback.page,
          limit: examFallback.pageSize,
          total: examFallback.total,
          total_pages: examFallback.totalPages,
        },
        stats: examFallback.stats,
      };
    }

    const local = searchProductionVocabulary({
      cefr_level: query.cefr_level,
      part_of_speech: query.part_of_speech,
      topic: query.topic,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: local.items.map(sanitizeVocabularyItem),
      pagination: local.pagination,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'content_vocabulary',
      maxRequests: 600,
      windowMs: 60_000,
    },
  }
);
