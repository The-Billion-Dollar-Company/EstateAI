import { Router } from 'express';
import { z } from 'zod';

import { google, login, logout, me, refresh, register } from '@/controllers/auth.controller.js';
import { requireAuth } from '@/middleware/auth.js';
import { authLimiter } from '@/middleware/rate-limiter.js';
import { validate } from '@/middleware/validate.js';

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(['buyer', 'owner']),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

const googleSchema = z.object({
  idToken: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), login);
authRouter.post('/google', authLimiter, validate({ body: googleSchema }), google);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
