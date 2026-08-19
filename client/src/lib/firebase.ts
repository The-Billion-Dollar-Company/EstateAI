import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
} from 'firebase/auth';

// Firebase web config, read from Vite env (client/.env). "Sign in with Google" is
// enabled only when apiKey + authDomain + projectId are present.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error('Google sign-in is not configured (set VITE_FIREBASE_* in client/.env)');
  }
  app ??= initializeApp(firebaseConfig);
  auth ??= getAuth(app);
  return auth;
}

/** Error codes where a popup won't work and falling back to a full-page redirect can. */
const POPUP_UNAVAILABLE_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/internal-error', // Chrome/Firefox throw this when third-party storage partitioning
  // breaks the popup's postMessage handshake back to the opener — same fix as a real block.
]);

/**
 * Opens the Google popup and returns the Firebase ID token to send to our API.
 * Some desktop browsers (observed on Chrome and Firefox, not on mobile) block or silently
 * fail the popup — commonly due to storage-partitioning/COOP restrictions on the
 * opener<->popup handshake, not just a literal popup-blocker setting. When that happens,
 * fall back to a full-page redirect instead, which doesn't depend on a second window at
 * all. The redirect navigates away immediately, so this call never resolves in that branch;
 * completeGoogleRedirectSignIn() picks up the result after the page reloads.
 */
export async function signInWithGoogleGetIdToken(): Promise<string> {
  const provider = new GoogleAuthProvider();
  const auth = getFirebaseAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    return await result.user.getIdToken();
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    if (!POPUP_UNAVAILABLE_CODES.has(code)) throw err;
    await signInWithRedirect(auth, provider);
    return await new Promise<string>(() => {}); // page is navigating away; never resolves
  }
}

/**
 * Call once on app load. Picks up the result of a signInWithRedirect() fallback triggered
 * above. Returns the ID token if the user just completed a redirect sign-in, or null if
 * there's nothing to complete (the normal case on every other page load).
 */
export async function completeGoogleRedirectSignIn(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  const result = await getRedirectResult(getFirebaseAuth());
  return result ? result.user.getIdToken() : null;
}

/** Firebase auth error codes the user might hit, mapped to plain guidance. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/configuration-not-found':
    'Google sign-in isn’t enabled for this project yet. Enable it in Firebase Console → Authentication → Sign-in method → Google.',
  'auth/operation-not-allowed':
    'Google sign-in isn’t enabled for this project yet (Firebase Console → Authentication → Sign-in method).',
  'auth/unauthorized-domain':
    'This domain isn’t authorized for Google sign-in (add it under Firebase Console → Authentication → Settings → Authorized domains).',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups for this site and try again.',
  'auth/network-request-failed': 'Network error during sign-in. Check your connection and try again.',
};

/** Codes we treat as "user cancelled" — no error should be shown. */
export function isCancelledAuth(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? '';
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  return AUTH_ERROR_MESSAGES[code] ?? 'Google sign-in failed. Please try again.';
}
