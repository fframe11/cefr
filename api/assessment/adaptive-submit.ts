import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { validateBody } from '../_lib/validation/validator';
import { submitAdaptiveExamAnswer } from '../../lib/assessment/adaptive-exam-engine';
import { createServiceRoleClient } from '../_lib/supabase/client';

const adaptiveSubmitSchema = z.object({
  session_id: z.string().min(5),
  question_id: z.string().min(1),
  selected_option_key: z.string().min(1).max(5),
  time_spent_seconds: z.coerce.number().int().min(0).default(0),
});

/**
 * POST /api/assessment/adaptive/submit
 * Submits an answer for the active adaptive question, updates theta using Bayesian EAP,
 * and either dispatches the next sanitized item or returns the finalized CEFR diagnostic report.
 */
export default createApiHandler(
  async ({ req, user }) => {
    const body = validateBody(adaptiveSubmitSchema, req.body);

    const result = submitAdaptiveExamAnswer({
      sessionId: body.session_id,
      questionId: body.question_id,
      selectedOptionKey: body.selected_option_key,
      timeSpentSeconds: body.time_spent_seconds,
    });

    // If test is completed and user is authenticated, persist into user_profiles
    if (result.isComplete && result.report && user) {
      try {
        const supabase = createServiceRoleClient();
        await supabase
          .from('user_profiles')
          .update({
            current_cefr_level: result.report.overallLevel,
            estimated_cambridge_score: result.report.overallScore,
            assessment_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } catch {
        // Non-blocking telemetry
      }
    }

    if (result.isComplete && result.report) {
      return {
        is_complete: true,
        report: result.report,
      };
    }

    return {
      is_complete: false,
      next_question: result.nextQuestion,
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: false,
    rateLimit: {
      action: 'assessment_adaptive_submit',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
