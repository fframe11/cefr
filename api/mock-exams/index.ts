import { createApiHandler } from '../_lib/handler/api-handler';
import { createPublicServerClient } from '../_lib/supabase/client';
import { isDemoSession } from '../_lib/auth/auth.helper';
import { DemoExamService } from '../_lib/demo/demo-exam.service';
import { CAMBRIDGE_MOCK_EXAMS_CATALOG } from '../../data/mockExamsCatalog';

/**
 * GET /api/mock-exams
 * Returns list of Cambridge-style mock examinations.
 * 
 * DETERMINISTIC ISOLATION INVARIANT:
 * - Production users receive ONLY real production mock exams.
 * - Authorized demo users/sessions receive ONLY the isolated Lead Demo Exam.
 * - Zero accidental mixing.
 */
export default createApiHandler(
  async ({ req, user }) => {
    // 1. Demo Mode Isolation Check
    if (isDemoSession(user, req)) {
      const demoItem = DemoExamService.getCatalogItem();
      return {
        exams: [demoItem],
        total: 1,
        disclaimer: 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications',
        is_demo: true,
      };
    }

    // 2. Production Database Query
    const supabase = createPublicServerClient();
    if (supabase) {
      try {
        const { data: exams, error } = await supabase
          .from('mock_exams')
          .select('id, exam_code, name, target_cefr, description_th, total_duration_minutes, passing_score, version')
          .eq('is_published', true)
          .order('exam_code', { ascending: true });

        if (!error && exams && exams.length > 0) {
          return {
            exams: exams.map((exam) => ({
              id: exam.id,
              exam_code: exam.exam_code,
              name: exam.name,
              target_cefr: exam.target_cefr,
              description_th: exam.description_th,
              total_duration_minutes: exam.total_duration_minutes,
              passing_score: exam.passing_score,
              version: exam.version,
            })),
            total: exams.length,
            disclaimer: 'Platform practice mock examination; not an official Cambridge English qualification exam.',
          };
        }
      } catch {
        // Fall through to production catalog fallback
      }
    }

    // 3. Production Static Catalog Fallback (Offline / Test Mode)
    return {
      exams: CAMBRIDGE_MOCK_EXAMS_CATALOG,
      total: CAMBRIDGE_MOCK_EXAMS_CATALOG.length,
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
