import { rateLimit } from 'express-rate-limit';

import { env } from '@/config/env.js';

// Rate limiting would make integration tests flaky; disable it under NODE_ENV=test.
const skipInTest = (): boolean => env.NODE_ENV === 'test';

const rateLimitMessage = {
  success: false,
  error: { message: 'Too many requests, try again later', code: 'RATE_LIMITED' },
};

/** Global limiter: generous ceiling across the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: skipInTest,
});

/** Strict limiter for auth routes (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: skipInTest,
});

/** Assistant limiter: caps expensive RAG calls per window. */
export const assistantLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
  skip: skipInTest,
});
