import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { startAdaptiveExamSession } from '../../lib/assessment/adaptive-exam-engine';

const adaptiveStartSchema = z.object({
  // Optional client metadata
  preferred_start_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
});

/**
 * POST /api/assessment/adaptive/start
 * Initializes a new adaptive CEFR placement test session based on the Oxford OOPT model.
 * 
 * SERVER-AUTHORITATIVE INVARIANTS:
 * 1. Initial theta is calibrated to 0.0 (B1 baseline).
 * 2. Questions are selected dynamically to maximize Fisher Information.
 * 3. Secret answer keys and isCorrect booleans are strictly removed from client output.
 */
export default createApiHandler(
  async ({ req, user }) => {
    const userId = user?.id || 'guest_user';
    const sessionData = startAdaptiveExamSession(userId);

    return {
      success: true,
      session_id: sessionData.sessionId,
      test_type: 'adaptive_cefr_placement',
      max_items: 56,
      current_question: sessionData.firstQuestion,
      disclaimer: 'GLOVA Adaptive Placement Test follows the Oxford OOPT Item Response Theory framework.',
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: false, // Allows diagnostic test for prospective users/guests
    rateLimit: {
      action: 'assessment_adaptive_start',
      maxRequests: 20,
      windowMs: 60_000,
    },
  }
);
