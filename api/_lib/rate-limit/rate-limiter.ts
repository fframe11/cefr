import { TooManyRequestsError } from '../errors/api-error';

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number; // Duration in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window bucket for single-instance serverless lifecycle
// (Can be swapped with Redis / Upstash in Phase 4+ without changing the interface)
const rateLimitStore = new Map<string, RequestRecord>();

export class RateLimiter {
  /**
   * Checks whether an action from a given identifier (IP or User ID) is within rate limits.
   * If exceeded, throws TooManyRequestsError (429).
   */
  public static check(
    identifier: string,
    action: string,
    options: RateLimitOptions
  ): RateLimitResult {
    const key = `${action}:${identifier}`;
    const now = Date.now();
    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      // First request or window expired
      const resetTime = now + options.windowMs;
      rateLimitStore.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        limit: options.maxRequests,
        remaining: options.maxRequests - 1,
        resetAt: Math.ceil(resetTime / 1000),
      };
    }

    if (existing.count >= options.maxRequests) {
      throw new TooManyRequestsError(
        `Rate limit exceeded for ${action}. Please retry after ${Math.ceil(
          (existing.resetTime - now) / 1000
        )} seconds.`
      );
    }

    existing.count += 1;
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - existing.count,
      resetAt: Math.ceil(existing.resetTime / 1000),
    };
  }

  /**
   * Helper to clear expired entries periodically to prevent memory leaks
   */
  public static cleanup(): void {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }

  /**
   * Resets all rate limit buckets (used for test isolation)
   */
  public static reset(): void {
    rateLimitStore.clear();
  }
}
