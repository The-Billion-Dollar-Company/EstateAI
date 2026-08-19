import type { RequestHandler } from 'express';

import type { UserRole } from '@/types/user.js';
import { AppError } from '@/utils/app-error.js';
import { verifyAccessToken } from '@/utils/jwt.js';

/** Verifies the Bearer access token and attaches req.user, else 401. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    return;
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    next(new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
    return;
  }
  req.user = { id: payload.sub, role: payload.role };
  next();
};

/** Attaches req.user when a valid token is present, but never rejects the request. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) req.user = { id: payload.sub, role: payload.role };
  }
  next();
};

/** Requires the authenticated user to hold one of the given roles, else 403. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
      return;
    }
    next();
  };
}
