import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody, validateQuery } from '../_lib/validation/validator';
import { uuidSchema, paginationSchema } from '../_lib/validation/common-schemas';
import { UnauthorizedError, NotFoundError } from '../_lib/errors/api-error';

const vocabMasteryQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'mastered', 'learning']).default('all'),
});

const updateVocabMasterySchema = z.object({
  vocabulary_id: uuidSchema,
  is_correct: z.boolean(),
});

/**
 * GET /api/user/vocabulary-mastery
 * Returns paginated vocabulary mastery records for the authenticated user.
 * 
 * POST /api/user/vocabulary-mastery
 * Records a spaced-repetition review result and updates mastery percentage.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required for vocabulary mastery.');
    }

    const supabase = createServiceRoleClient();

    if (req.method === 'GET') {
      const query = validateQuery(vocabMasteryQuerySchema, req.query);

      let dbQuery = supabase
        .from('user_vocabulary_mastery')
        .select(
          'id, vocabulary_id, mastery_percentage, review_count, consecutive_correct, next_review_at, last_reviewed_at, vocabularies(id, word, lemma, cefr_level, part_of_speech, meaning_th)',
          { count: 'exact' }
        )
        .eq('user_id', user.id);

      if (query.status === 'mastered') {
        dbQuery = dbQuery.gte('mastery_percentage', 80);
      } else if (query.status === 'learning') {
        dbQuery = dbQuery.lt('mastery_percentage', 80);
      }

      const offset = (query.page - 1) * query.limit;
      dbQuery = dbQuery
        .order('last_reviewed_at', { ascending: false })
        .range(offset, offset + query.limit - 1);

      const { data: records, count, error } = await dbQuery;

      if (error) {
        throw error;
      }

      return {
        mastery_records: records || [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / query.limit),
        },
      };
    }

    if (req.method === 'POST') {
      const body = validateBody(updateVocabMasterySchema, req.body);

      // Verify vocabulary exists
      const { data: vocab, error: vError } = await supabase
        .from('vocabularies')
        .select('id')
        .eq('id', body.vocabulary_id)
        .single();

      if (vError || !vocab) {
        throw new NotFoundError('Vocabulary word not found.');
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const { data: existing } = await supabase
        .from('user_vocabulary_mastery')
        .select('*')
        .eq('user_id', user.id)
        .eq('vocabulary_id', body.vocabulary_id)
        .single();

      let consecutive = existing ? existing.consecutive_correct : 0;
      let mastery = existing ? existing.mastery_percentage : 0;
      let reviewCount = existing ? existing.review_count + 1 : 1;

      if (body.is_correct) {
        consecutive += 1;
        mastery = Math.min(100, mastery + 20);
      } else {
        consecutive = 0;
        mastery = Math.max(0, mastery - 15);
      }

      // Calculate next spaced repetition review window (e.g., 1 day, 3 days, 7 days)
      const reviewIntervalDays = Math.max(1, consecutive * 2);
      const nextReview = new Date(now.getTime() + reviewIntervalDays * 24 * 60 * 60 * 1000).toISOString();

      if (existing) {
        const { data: updated, error: uError } = await supabase
          .from('user_vocabulary_mastery')
          .update({
            mastery_percentage: mastery,
            review_count: reviewCount,
            consecutive_correct: consecutive,
            next_review_at: nextReview,
            last_reviewed_at: nowIso,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (uError) throw uError;
        return { mastery_record: updated };
      } else {
        const { data: inserted, error: iError } = await supabase
          .from('user_vocabulary_mastery')
          .insert({
            user_id: user.id,
            vocabulary_id: body.vocabulary_id,
            mastery_percentage: mastery,
            review_count: 1,
            consecutive_correct: consecutive,
            next_review_at: nextReview,
            first_learned_at: nowIso,
            last_reviewed_at: nowIso,
          })
          .select()
          .single();

        if (iError) throw iError;
        return { mastery_record: inserted };
      }
    }
  },
  {
    allowedMethods: ['GET', 'POST'],
    requireAuth: true,
    rateLimit: {
      action: 'user_vocab_mastery',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
