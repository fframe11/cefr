import { describe, it, expect, beforeEach } from 'vitest';
import { ZodError, z } from 'zod';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
} from '../api/_lib/errors/api-error';
import { ErrorCode } from '../api/_lib/errors/error-codes';
import { formatErrorResponse } from '../api/_lib/errors/error-handler';
import {
  uuidSchema,
  cefrLevelSchema,
  skillTypeSchema,
  attemptContextSchema,
} from '../api/_lib/validation/common-schemas';
import { validateBody } from '../api/_lib/validation/validator';
import { RateLimiter } from '../api/_lib/rate-limit/rate-limiter';
import { storageService } from '../api/_lib/storage/storage.service';
import { extractBearerToken } from '../api/_lib/auth/auth.helper';

describe('Backend Foundation: Error Handling', () => {
  it('should format AppError with correct status code, error code and request id', () => {
    const error = new NotFoundError('Exam not found', ErrorCode.EXAM_NOT_FOUND);
    const { statusCode, payload } = formatErrorResponse(error, 'test-req-123');

    expect(statusCode).toBe(404);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe(ErrorCode.EXAM_NOT_FOUND);
    expect(payload.error.message).toBe('Exam not found');
    expect(payload.error.request_id).toBe('test-req-123');
  });

  it('should format ZodError into 400 with detailed field paths', () => {
    const schema = z.object({ age: z.number().min(18) });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ age: 12 });
    } catch (e) {
      zodError = e as ZodError;
    }

    const { statusCode, payload } = formatErrorResponse(zodError, 'req-456');
    expect(statusCode).toBe(400);
    expect(payload.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(Array.isArray(payload.error.details)).toBe(true);
  });
});

describe('Backend Foundation: Validation Schemas', () => {
  it('should validate valid UUIDs and reject invalid ones', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(uuidSchema.safeParse(validUuid).success).toBe(true);
    expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
  });

  it('should strictly validate CEFR levels (A1 to C2)', () => {
    expect(cefrLevelSchema.safeParse('A1').success).toBe(true);
    expect(cefrLevelSchema.safeParse('B2').success).toBe(true);
    expect(cefrLevelSchema.safeParse('D1').success).toBe(false);
  });

  it('should enforce attempt context integrity (mock_exam requires attempt_id)', () => {
    // Valid mock_exam
    const validMock = {
      context_type: 'mock_exam',
      context_attempt_id: '123e4567-e89b-12d3-a456-426614174000',
    };
    expect(attemptContextSchema.safeParse(validMock).success).toBe(true);

    // Invalid mock_exam without attempt_id
    const invalidMock = {
      context_type: 'mock_exam',
      context_attempt_id: null,
    };
    expect(attemptContextSchema.safeParse(invalidMock).success).toBe(false);

    // Valid practice without attempt_id
    const validPractice = {
      context_type: 'practice',
    };
    expect(attemptContextSchema.safeParse(validPractice).success).toBe(true);

    // Invalid practice with attempt_id
    const invalidPractice = {
      context_type: 'practice',
      context_attempt_id: '123e4567-e89b-12d3-a456-426614174000',
    };
    expect(attemptContextSchema.safeParse(invalidPractice).success).toBe(false);
  });
});

describe('Backend Foundation: Rate Limiter', () => {
  it('should allow requests within limit and throw 429 when exceeded', () => {
    const action = 'test_action';
    const id = `user_${Date.now()}`;
    const opts = { maxRequests: 2, windowMs: 5000 };

    const r1 = RateLimiter.check(id, action, opts);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);

    const r2 = RateLimiter.check(id, action, opts);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);

    expect(() => RateLimiter.check(id, action, opts)).toThrowError(TooManyRequestsError);
  });
});

describe('Backend Foundation: Storage Path Builders', () => {
  it('should construct canonical speaking audio submission path', () => {
    const path = storageService.buildSpeakingSubmissionPath('user-1', 'att-2', 3);
    expect(path).toBe('user/user-1/attempt/att-2/part_3.webm');
  });

  it('should construct canonical listening exercise audio path', () => {
    const path = storageService.buildListeningAudioPath('exercise-10');
    expect(path).toBe('exercises/exercise-10.mp3');
  });
});

describe('Backend Foundation: Auth Token Extractor', () => {
  it('should extract Bearer token correctly', () => {
    const req = {
      headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
      },
    } as any;

    expect(extractBearerToken(req)).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token');
  });

  it('should return null for missing or malformed auth header', () => {
    expect(extractBearerToken({ headers: {} } as any)).toBeNull();
    expect(extractBearerToken({ headers: { authorization: 'Basic 12345' } } as any)).toBeNull();
  });
});
