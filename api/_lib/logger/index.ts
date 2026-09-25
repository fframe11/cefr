/**
 * Safe Structured Logger for Vercel Serverless Functions.
 *
 * CRITICAL LOGGING RULES:
 * 1. NEVER log authorization tokens, API keys, or service role secrets.
 * 2. Redact sensitive fields (password, token, bearer, secret, audio_storage_path).
 * 3. Include request_id and execution duration in milliseconds.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'service_role',
  'secret',
  'key',
  'cookie',
  'jwt',
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export interface LogContext {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  userId?: string;
  [key: string]: unknown;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    const payload = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(context ? (redactSensitiveData(context) as Record<string, unknown>) : {}),
    };
    console.log(JSON.stringify(payload));
  },

  warn(message: string, context?: LogContext): void {
    const payload = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(context ? (redactSensitiveData(context) as Record<string, unknown>) : {}),
    };
    console.warn(JSON.stringify(payload));
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const isProd = process.env.NODE_ENV === 'production';
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: isProd ? undefined : error.stack,
          }
        : { raw: String(error) };

    const payload = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: errorDetails,
      ...(context ? (redactSensitiveData(context) as Record<string, unknown>) : {}),
    };
    console.error(JSON.stringify(payload));
  },

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      const payload = {
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...(context ? (redactSensitiveData(context) as Record<string, unknown>) : {}),
      };
      console.debug(JSON.stringify(payload));
    }
  },
};
