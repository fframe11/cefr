import { ZodError } from 'zod';
import { AppError, ValidationError } from './api-error';
import { ErrorCode } from './error-codes';
import { logger } from '../logger';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id: string;
  };
}

export function formatErrorResponse(
  error: unknown,
  requestId: string
): { statusCode: number; payload: ApiErrorResponse } {
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const issues = error.issues || (error as any).errors || [];
    const details = issues.map((err: any) => ({
      field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
      message: err.message,
    }));
    return {
      statusCode: 400,
      payload: {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid request payload',
          details,
          request_id: requestId,
        },
      },
    };
  }

  // 2. Controlled AppError hierarchy
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      payload: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          request_id: requestId,
        },
      },
    };
  }

  // 3. Uncontrolled / Unexpected Errors
  logger.error('Unhandled server exception', error, { requestId });

  return {
    statusCode: 500,
    payload: {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: isProduction
          ? 'An internal error occurred. Please contact support.'
          : (error as Error)?.message || 'Internal server error',
        details: isProduction ? undefined : (error as Error)?.stack,
        request_id: requestId,
      },
    },
  };
}
