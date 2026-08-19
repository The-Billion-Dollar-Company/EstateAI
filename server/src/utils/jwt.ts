import jwt from 'jsonwebtoken';

import { env } from '@/config/env.js';
import type { UserRole } from '@/types/user.js';
import { logger } from '@/utils/logger.js';

export interface AccessPayload {
  sub: string; // user id
  role: UserRole;
}

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

// Fall back to an ephemeral secret in dev/test so the server boots without a
// configured .env. Tokens won't survive a restart — set real secrets for prod.
function secretFor(kind: 'access' | 'refresh'): string {
  const configured = kind === 'access' ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
  if (configured) return configured;
  if (env.NODE_ENV === 'production') {
    throw new Error(`JWT_${kind.toUpperCase()}_SECRET must be set in production`);
  }
  return `dev-only-${kind}-secret-do-not-use-in-production-0000000000`;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, secretFor('access'), { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, secretFor('refresh'), { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const decoded = jwt.verify(token, secretFor('access'));
    if (typeof decoded === 'string' || !decoded.sub) return null;
    return { sub: String(decoded.sub), role: decoded.role as UserRole };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, secretFor('refresh'));
    if (typeof decoded === 'string' || !decoded.sub) return null;
    return { sub: String(decoded.sub) };
  } catch {
    return null;
  }
}

if (!env.JWT_ACCESS_SECRET && env.NODE_ENV !== 'test') {
  logger.warn('JWT secrets not set — using ephemeral dev secrets. Set them in .env for stable sessions.');
}
