import { type z, ZodError } from 'zod';
import { ValidationError } from '../errors/api-error';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ValidationError('Validation failed', details);
    }
    throw error;
  }
}

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  if (body === undefined || body === null || (typeof body === 'string' && body.trim() === '')) {
    throw new ValidationError('Request body cannot be empty');
  }

  // Parse JSON if received as raw string in some serverless environments
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  return validate(schema, parsedBody);
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
  return validate(schema, query || {});
}
