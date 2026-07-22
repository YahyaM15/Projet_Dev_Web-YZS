import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export const authRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in fifteen minutes.',
  },
});

/** @deprecated Apply authRateLimit to the complete auth router instead. */
export const loginRateLimit = authRateLimit;
