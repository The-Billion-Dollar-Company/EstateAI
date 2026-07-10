import { rateLimit } from 'express-rate-limit';

/** Global limiter: generous; auth/assistant get stricter ones in later phases. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, try again later', code: 'RATE_LIMITED' },
  },
});
