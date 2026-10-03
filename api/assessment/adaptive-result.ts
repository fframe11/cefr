import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { validateQuery } from '../_lib/validation/validator';
import { getAdaptiveExamSession } from '../../lib/assessment/adaptive-exam-engine';
import { NotFoundError } from '../_lib/errors/api-error';

const adaptiveResultQuerySchema = z.object({
  session_id: z.string().min(5),
});

/**
 * GET /api/assessment/adaptive/result?session_id=:session_id
 * Returns the comprehensive diagnostic report of a completed adaptive exam session.
 */
export default createApiHandler(
  async ({ req }) => {
    const query = validateQuery(adaptiveResultQuerySchema, req.query);
    const session = getAdaptiveExamSession(query.session_id);

    if (!session) {
      throw new NotFoundError('Adaptive assessment session not found or expired.');
    }

    if (session.status !== 'completed' || !session.report) {
      return {
        status: 'in_progress',
        items_answered: session.irtState.itemsAnswered,
        current_theta: session.irtState.theta,
        current_se: session.irtState.se,
      };
    }

    return {
      status: 'completed',
      report: session.report,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'assessment_adaptive_result',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
