import { createApiHandler } from './_lib/handler/api-handler';
import { getServerConfig } from './_lib/supabase/config';

/**
 * GET /api/health
 * Public health check and serverless environment readiness probe.
 */
export default createApiHandler(
  async () => {
    const config = getServerConfig();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      runtime: 'Vercel Serverless (Node.js)',
      services: {
        database_configured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
        auth_configured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
      },
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
    rateLimit: {
      action: 'health_check',
      maxRequests: 60,
      windowMs: 60_000,
    },
  }
);
