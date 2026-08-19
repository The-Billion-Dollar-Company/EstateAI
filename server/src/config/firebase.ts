import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';

import { env } from '@/config/env.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export interface GoogleIdentity {
  email: string;
  name: string;
  picture?: string;
}

let app: App | null = null;

/** True when all three FIREBASE_* env vars are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

function getFirebaseApp(): App {
  if (app) return app;
  if (!isFirebaseConfigured()) {
    throw new AppError(
      503,
      'Google sign-in is not configured on the server (set FIREBASE_* in server/.env)',
      'FIREBASE_NOT_CONFIGURED',
    );
  }
  app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // .env stores newlines as literal \n; restore them for the PEM parser.
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  logger.info('Firebase Admin initialized');
  return app;
}

/**
 * Verifies a Firebase ID token and returns the Google identity, or throws.
 * `firebase-admin/auth` is imported dynamically: one of its dependencies
 * (jwks-rsa) does a synchronous `require()` of the ESM-only `jose` package,
 * which throws ERR_REQUIRE_ESM at module-evaluation time on Vercel's runtime.
 * A static top-level import would crash the whole app on cold start instead
 * of just Google sign-in.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleIdentity> {
  const { getAuth } = await import('firebase-admin/auth');
  const decoded = await getAuth(getFirebaseApp())
    .verifyIdToken(idToken)
    .catch(() => {
      throw new AppError(401, 'Invalid Google sign-in token', 'INVALID_GOOGLE_TOKEN');
    });
  if (!decoded.email) {
    throw new AppError(401, 'Google account has no email', 'INVALID_GOOGLE_TOKEN');
  }
  return {
    email: decoded.email,
    name: decoded.name ?? decoded.email.split('@')[0] ?? 'User',
    picture: decoded.picture,
  };
}
