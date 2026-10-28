import { createApiHandler } from '../_lib/handler/api-handler';
import { DemoExamService } from '../_lib/demo/demo-exam.service';
import { UnauthorizedError } from '../_lib/errors/api-error';

/**
 * POST /api/mock-exams/reset
 * Resets the demo exam session for the authenticated demo user.
 * Enables the Lead to start completely fresh without lingering state.
 * Real learner data is guaranteed untouched.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to reset demo session.');
    }

    DemoExamService.resetDemoSession(user.id);

    return {
      success: true,
      message: 'Demo exam session successfully reset.',
      is_demo: true,
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
  }
);
