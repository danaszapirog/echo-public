import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

/**
 * Create a rate limiter using Redis store
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: any) => string;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis store if available, otherwise use in-memory store
    store: redis
      ? {
          // @ts-ignore - express-rate-limit Redis store
          async increment(key: string) {
            const count = await redis.incr(key);
            if (count === 1) {
              await redis.expire(key, Math.ceil(options.windowMs / 1000));
            }
            return {
              totalHits: count,
              resetTime: new Date(Date.now() + options.windowMs),
            };
          },
          async decrement(key: string) {
            await redis.decr(key);
          },
          async resetKey(key: string) {
            await redis.del(key);
          },
        }
      : undefined,
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'unknown'),
  });
};

/**
 * Rate limiter for map endpoints (more restrictive due to viewport queries)
 * 30 requests per minute per user
 */
export const mapRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator: (req: any) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.userId ? `map:${req.user.userId}` : `map:ip:${req.ip || 'unknown'}`;
  },
  message: 'Too many map requests, please try again in a minute.',
});

/**
 * General API rate limiter
 * 100 requests per minute per user, 20 per IP for unauthenticated
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req: any) => {
    return req.user?.userId ? `api:${req.user.userId}` : `api:ip:${req.ip || 'unknown'}`;
  },
});

/**
 * Strict rate limiter for unauthenticated endpoints
 * 20 requests per minute per IP
 */
export const unauthenticatedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  keyGenerator: (req: any) => `unauth:${req.ip || 'unknown'}`,
  message: 'Too many requests from this IP, please try again in a minute.',
});

