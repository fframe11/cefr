import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { validateQuery } from '../_lib/validation/validator';
import { cefrLevelSchema, cambridgeExamCodeSchema, paginationSchema } from '../_lib/validation/common-schemas';
import { LISTENING_BANK } from '../../data/listeningBank';

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

    try {
      const { data: exercises, count, error } = await dbQuery;

      if (!error && exercises && exercises.length > 0) {
        return {
          exercises,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || exercises.length,
            total_pages: Math.ceil((count || exercises.length) / query.limit),
          },
        };
      }
    } catch {
      // Fallback gracefully below
    }

    // Local fallback to comprehensive LISTENING_BANK
    let filtered = LISTENING_BANK;
    if (query.cefr_level) {
      filtered = filtered.filter((ex) => ex.cefrLevel === query.cefr_level);
    }
    if (query.target_exam) {
      filtered = filtered.filter((ex) => ex.targetExam === query.target_exam);
    }

    const mapped = filtered.map((ex) => ({
      id: ex.id,
      title: ex.title,
      cefr_level: ex.cefrLevel,
      target_exam: ex.targetExam,
      speaker_accents: ex.speakerAccents,
      audio_storage_path: ex.audioStoragePath || null,
      speed_options: ex.audioSpeedOptions,
      audio_script: ex.audioScript,
    }));

    const offset = (query.page - 1) * query.limit;
    const paginated = mapped.slice(offset, offset + query.limit);

    return {
      exercises: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: mapped.length,
        total_pages: Math.ceil(mapped.length / query.limit),
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
