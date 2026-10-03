import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody, validateQuery } from '../_lib/validation/validator';
import { uuidSchema, paginationSchema } from '../_lib/validation/common-schemas';
import { UnauthorizedError, NotFoundError } from '../_lib/errors/api-error';

const vocabMasteryQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'mastered', 'learning', 'due', 'weak']).default('all'),
});

const singleReviewSchema = z.object({
  vocabulary_id: uuidSchema,
  is_correct: z.boolean(),
});

const updateVocabMasterySchema = z.union([
  singleReviewSchema,
  z.object({
    reviews: z.array(singleReviewSchema).min(1).max(50),
  }),
]);

function calculateNextReviewDate(consecutiveCorrect: number, isCorrect: boolean, now: Date): string {
  if (!isCorrect) {
    // If missed, review again tomorrow
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  // Spaced repetition schedule based on consecutive correct recall
  let days = 1;
  if (consecutiveCorrect === 1) days = 1;
  else if (consecutiveCorrect === 2) days = 3;
  else if (consecutiveCorrect === 3) days = 7;
  else if (consecutiveCorrect === 4) days = 14;
  else days = 30;

  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * GET /api/user/vocabulary-mastery
 * Returns paginated vocabulary mastery records for the authenticated user,
 * supporting filters for 'all', 'mastered', 'learning', 'due', 'weak'.
 *
 * POST /api/user/vocabulary-mastery
 * Records spaced-repetition review results (single or batch), updates mastery percentage,
 * calculates next review windows, records weaknesses, and awards XP.
 */
export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required for vocabulary mastery.');
    }

    const supabase = createServiceRoleClient();
    const now = new Date();
    const nowIso = now.toISOString();

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
      } else if (query.status === 'due') {
        dbQuery = dbQuery.lte('next_review_at', nowIso);
      } else if (query.status === 'weak') {
        dbQuery = dbQuery.lt('mastery_percentage', 60);
      }

      const offset = (query.page - 1) * query.limit;
      dbQuery = dbQuery
        .order('last_reviewed_at', { ascending: false })
        .range(offset, offset + query.limit - 1);

      const { data: records, count, error } = await dbQuery;

      if (error) {
        throw error;
      }

      // Fetch summary statistics
      const [dueRes, masteredRes, totalRes] = await Promise.all([
        supabase
          .from('user_vocabulary_mastery')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('next_review_at', nowIso),
        supabase
          .from('user_vocabulary_mastery')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('mastery_percentage', 80),
        supabase
          .from('user_vocabulary_mastery')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      return {
        mastery_records: records || [],
        summary: {
          total_learned: totalRes.count || 0,
          mastered_count: masteredRes.count || 0,
          due_count: dueRes.count || 0,
        },
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
      const reviews = 'reviews' in body ? body.reviews : [body];

      const results = [];
      let totalXpEarned = 0;
      let correctCount = 0;
      let incorrectCount = 0;

      for (const item of reviews) {
        // Verify vocabulary exists
        const { data: vocab, error: vError } = await supabase
          .from('vocabularies')
          .select('id, word')
          .eq('id', item.vocabulary_id)
          .single();

        if (vError || !vocab) {
          continue; // Skip invalid IDs gracefully
        }

        const { data: existing } = await supabase
          .from('user_vocabulary_mastery')
          .select('*')
          .eq('user_id', user.id)
          .eq('vocabulary_id', item.vocabulary_id)
          .single();

        let consecutive = existing ? existing.consecutive_correct : 0;
        let mastery = existing ? existing.mastery_percentage : 0;
        let reviewCount = existing ? existing.review_count + 1 : 1;

        if (item.is_correct) {
          consecutive += 1;
          mastery = Math.min(100, mastery + 20);
          totalXpEarned += 10;
          correctCount += 1;
        } else {
          consecutive = 0;
          mastery = Math.max(0, mastery - 15);
          totalXpEarned += 2; // Effort XP
          incorrectCount += 1;

          // Track in user_weaknesses table
          await supabase.from('user_weaknesses').upsert(
            {
              user_id: user.id,
              weakness_tag: 'vocabulary_meaning',
              error_count: 1,
              last_failed_at: nowIso,
            },
            { onConflict: 'user_id,weakness_tag' }
          );
        }

        const nextReview = calculateNextReviewDate(consecutive, item.is_correct, now);

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

          if (!uError && updated) results.push(updated);
        } else {
          const { data: inserted, error: iError } = await supabase
            .from('user_vocabulary_mastery')
            .insert({
              user_id: user.id,
              vocabulary_id: item.vocabulary_id,
              mastery_percentage: mastery,
              review_count: 1,
              consecutive_correct: consecutive,
              next_review_at: nextReview,
              first_learned_at: nowIso,
              last_reviewed_at: nowIso,
            })
            .select()
            .single();

          if (!iError && inserted) results.push(inserted);
        }
      }

      // Update user_skill_progress for vocabulary
      if (results.length > 0) {
        const { data: currentProgress } = await supabase
          .from('user_skill_progress')
          .select('questions_completed, proficiency_score')
          .eq('user_id', user.id)
          .eq('skill', 'vocabulary')
          .single();

        const completed = (currentProgress?.questions_completed || 0) + results.length;
        const newProficiency = Math.min(
          100,
          Math.round(
            (currentProgress?.proficiency_score || 50) * 0.9 + (correctCount / results.length) * 100 * 0.1
          )
        );

        await supabase.from('user_skill_progress').upsert(
          {
            user_id: user.id,
            skill: 'vocabulary',
            proficiency_score: newProficiency,
            questions_completed: completed,
            updated_at: nowIso,
          },
          { onConflict: 'user_id,skill' }
        );

        // Update streak in user_profiles
        const todayDate = now.toISOString().split('T')[0];
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('streak_days, last_active_date')
          .eq('id', user.id)
          .single();

        if (profile) {
          let streak = profile.streak_days;
          if (profile.last_active_date !== todayDate) {
            streak += 1;
            await supabase
              .from('user_profiles')
              .update({
                streak_days: streak,
                last_active_date: todayDate,
                updated_at: nowIso,
              })
              .eq('id', user.id);
          }
        }
      }

      return {
        success: true,
        processed_count: results.length,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        xp_earned: totalXpEarned,
        mastery_records: results,
        mastery_record: results[0],
      };
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
