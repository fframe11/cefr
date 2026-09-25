import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';

/**
 * GET /api/mock-exams
 * Returns list of all published Cambridge-style mock examinations.
 * Public endpoint for exam selection.
 */
export default createApiHandler(
  async () => {
    const supabase = createPublicServerClient();

    const { data: exams, error } = await supabase
      .from('mock_exams')
      .select('id, exam_code, name, target_cefr, description_th, total_duration_minutes, passing_score, version')
      .eq('is_published', true)
      .order('exam_code', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      exams: (exams || []).map((exam) => ({
        id: exam.id,
        exam_code: exam.exam_code,
        name: exam.name,
        target_cefr: exam.target_cefr,
        description_th: exam.description_th,
        total_duration_minutes: exam.total_duration_minutes,
        passing_score: exam.passing_score,
        version: exam.version,
      })),
      total: exams?.length || 0,
      disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'mock_exams_list',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
