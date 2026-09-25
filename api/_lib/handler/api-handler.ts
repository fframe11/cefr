import type { IncomingMessage, ServerResponse } from 'http';
import { formatErrorResponse } from '../errors/error-handler';
import { getAuthUser, requireAuth } from '../auth/auth.helper';
import { RateLimiter } from '../rate-limit/rate-limiter';
import { logger } from '../logger';
import type { ApiRequest, ApiResponse, ControllerHandler } from './types';

export interface HandlerOptions {
  requireAuth?: boolean;
  allowedMethods?: Array<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'>;
  rateLimit?: {
    action: string;
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Universal Wrapper for Vercel Serverless Function Endpoints.
 * Standardizes:
 * 1. CORS headers & preflight OPTIONS handling
 * 2. Request ID tracing & injection
 * 3. Execution time measurement
 * 4. Authentication enforcement
 * 5. Rate limiting execution
 * 6. Error handling and standard JSON envelopes
 */
export function createApiHandler<T = unknown>(
  controller: ControllerHandler<T>,
  options: HandlerOptions = {}
) {
  return async function (req: IncomingMessage, res: ServerResponse): Promise<void> {
    const startTime = Date.now();
    const requestId =
      (req.headers['x-request-id'] as string) ||
      `req_${Math.random().toString(36).substring(2, 10)}`;

    // Decorate request and response objects
    const apiReq = req as ApiRequest;
    const apiRes = res as ApiResponse;

    apiReq.requestId = requestId;

    // Decorate response helper methods if not present in raw Node runtime
    if (!apiRes.status) {
      apiRes.status = function (code: number) {
        apiRes.statusCode = code;
        return apiRes;
      };
    }
    if (!apiRes.json) {
      apiRes.json = function (payload: unknown) {
        apiRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        apiRes.end(JSON.stringify(payload));
      };
    }

    // CORS & Observability Headers
    apiRes.setHeader('X-Request-Id', requestId);
    apiRes.setHeader('Access-Control-Allow-Origin', '*');
    apiRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    apiRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    // Handle OPTIONS Preflight
    if (req.method === 'OPTIONS') {
      apiRes.status(204).end();
      return;
    }

    // Allowed Methods Verification
    if (options.allowedMethods && req.method && !options.allowedMethods.includes(req.method as any)) {
      apiRes.setHeader('Allow', options.allowedMethods.join(', '));
      apiRes.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed. Supported: [${options.allowedMethods.join(', ')}]`,
          request_id: requestId,
        },
      });
      return;
    }

    try {
      // 1. Authentication Check
      let user = null;
      if (options.requireAuth) {
        user = await requireAuth(req);
      } else {
        user = await getAuthUser(req);
      }
      apiReq.user = user || undefined;

      // 2. Rate Limiting Check
      if (options.rateLimit) {
        const identifier = user?.id || (req.headers['x-forwarded-for'] as string) || 'anonymous';
        const rateResult = RateLimiter.check(identifier, options.rateLimit.action, {
          maxRequests: options.rateLimit.maxRequests,
          windowMs: options.rateLimit.windowMs,
        });

        apiRes.setHeader('X-RateLimit-Limit', rateResult.limit.toString());
        apiRes.setHeader('X-RateLimit-Remaining', rateResult.remaining.toString());
        apiRes.setHeader('X-RateLimit-Reset', rateResult.resetAt.toString());
      }

      // 3. Parse JSON Body if buffer exists and not already parsed
      if (!apiReq.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        apiReq.body = await parseRequestBody(req);
      }

      // 4. Parse Query params if not attached
      if (!apiReq.query) {
        const url = new URL(req.url || '/', 'http://localhost');
        const query: Record<string, string> = {};
        url.searchParams.forEach((val, key) => {
          query[key] = val;
        });
        apiReq.query = query;
      }

      // 5. Execute Controller Handler
      const data = await controller({
        req: apiReq,
        res: apiRes,
        requestId,
        user,
      });

      const durationMs = Date.now() - startTime;
      logger.info('API request completed', {
        requestId,
        method: req.method,
        path: req.url,
        statusCode: apiRes.statusCode || 200,
        durationMs,
        userId: user?.id,
      });

      // If controller hasn't already sent a response, wrap in standard success envelope
      if (!apiRes.writableEnded) {
        apiRes.status(apiRes.statusCode || 200).json({
          success: true,
          data,
          request_id: requestId,
        });
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const { statusCode, payload } = formatErrorResponse(error, requestId);

      logger.warn('API request failed', {
        requestId,
        method: req.method,
        path: req.url,
        statusCode,
        durationMs,
        errorCode: payload.error.code,
      });

      if (!apiRes.writableEnded) {
        apiRes.status(statusCode).json(payload);
      }
    }
  };
}

async function parseRequestBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
  });
}
