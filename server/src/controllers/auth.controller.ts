import type { CookieOptions, RequestHandler, Response } from 'express';

import { env } from '@/config/env.js';
import { verifyGoogleToken } from '@/config/firebase.js';
import * as authService from '@/services/auth.service.js';
import type { User } from '@/types/user.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt.js';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Issues an access token + refresh cookie and returns the session payload.
 * Exported so role changes (e.g. become-owner) can re-issue a token whose embedded
 * role matches the new value.
 */
export function issueSession(res: Response, user: User): { user: User; accessToken: string } {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user.id), refreshCookieOptions);
  return { user, accessToken: signAccessToken({ sub: user.id, role: user.role }) };
}

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: issueSession(res, user) });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const user = await authService.verifyCredentials(req.body.email, req.body.password);
  res.json({ success: true, data: issueSession(res, user) });
});

export const google: RequestHandler = asyncHandler(async (req, res) => {
  const identity = await verifyGoogleToken(req.body.idToken);
  const user = await authService.findOrCreateGoogleUser(identity);
  res.json({ success: true, data: issueSession(res, user) });
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  const token = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
  const payload = token ? verifyRefreshToken(token) : null;
  const user = payload ? authService.getUserById(payload.sub) : undefined;
  if (!user) throw new AppError(401, 'Invalid or expired session', 'UNAUTHORIZED');
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  res.json({ success: true, data: { accessToken } });
});

export const logout: RequestHandler = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
  res.json({ success: true, data: { ok: true } });
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  const user = authService.getUserById(req.user?.id ?? '');
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  res.json({ success: true, data: user });
});
