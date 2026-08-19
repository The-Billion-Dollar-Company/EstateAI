import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, type ApiResponse } from '@/lib/api';
import { completeGoogleRedirectSignIn, signInWithGoogleGetIdToken } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthSession } from '@/types/user';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'owner';
}

async function postSession(url: string, body: unknown): Promise<AuthSession> {
  const res = await api.post<ApiResponse<AuthSession>>(url, body);
  return res.data.data;
}

export function useLogin(): UseMutationResult<AuthSession, unknown, LoginInput> {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => postSession('/auth/login', input),
    onSuccess: (session) => setSession(session),
  });
}

export function useRegister(): UseMutationResult<AuthSession, unknown, RegisterInput> {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => postSession('/auth/register', input),
    onSuccess: (session) => setSession(session),
  });
}

/** Runs the Firebase Google popup, then exchanges the ID token for our session. */
export function useGoogleSignIn(): UseMutationResult<AuthSession, unknown, void> {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async () => {
      const idToken = await signInWithGoogleGetIdToken();
      return postSession('/auth/google', { idToken });
    },
    onSuccess: (session) => setSession(session),
  });
}

/** Upgrades the signed-in buyer to an owner and refreshes the stored session. */
export function useBecomeOwner(): UseMutationResult<AuthSession, unknown, void> {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: () => postSession('/users/me/become-owner', undefined),
    onSuccess: (session) => setSession(session),
  });
}

/**
 * Runs once on app load to pick up a signInWithRedirect() fallback (see firebase.ts) —
 * desktop browsers that block the Google popup get redirected to Google and back instead,
 * so the session has to be completed after the page reloads rather than in a click handler.
 * A no-op on every load that isn't returning from that redirect.
 */
export function useCompleteGoogleRedirect(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode double-invokes effects; getRedirectResult isn't idempotent
    ran.current = true;
    void (async () => {
      let idToken: string | null;
      try {
        idToken = await completeGoogleRedirectSignIn();
      } catch (err) {
        console.error('Google redirect sign-in failed to complete:', err);
        return;
      }
      if (!idToken) return; // normal case: this load isn't returning from a redirect
      try {
        setSession(await postSession('/auth/google', { idToken }));
        navigate('/');
      } catch (err) {
        console.error('Exchanging the Google ID token for a session failed:', err);
      }
    })();
  }, [setSession, navigate]);
}

export function useLogout(): () => Promise<void> {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return async () => {
    await api.post('/auth/logout').catch(() => undefined);
    clear();
    queryClient.clear();
  };
}
