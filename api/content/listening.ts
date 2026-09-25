import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';

const listeningQuerySchema = paginationSchema.extend({
  cefr_level: cefrLevelSchema.optional(),
  target_exam: cambridgeExamCodeSchema.optional(),
});

/**
 * GET /api/content/listening
 * Public endpoint to fetch listening exercises and audio metadata.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(listeningQuerySchema, req.query);
    const supabase = createPublicServerClient();

    let dbQuery = supabase
      .from('listening_exercises')
      .select('id, title, cefr_level, target_exam, speaker_accents, audio_storage_path, speed_options, audio_script', {
        count: 'exact',
      })
      .eq('is_active', true);

    if (query.cefr_level) {
      dbQuery = dbQuery.eq('cefr_level', query.cefr_level);
    }
    if (query.target_exam) {
      dbQuery = dbQuery.eq('target_exam', query.target_exam);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('title', { ascending: true })
      .range(offset, offset + query.limit - 1);

    const { data: exercises, count, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return {
      exercises: exercises || [],
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
      action: 'content_listening',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
