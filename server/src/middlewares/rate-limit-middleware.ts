import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export const loginRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in one minute.',
  },
});
