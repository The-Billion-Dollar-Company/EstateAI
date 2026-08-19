import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthSession, User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

/**
 * Client auth state. The access token lives here (persisted to localStorage so a
 * refresh keeps you signed in); the refresh token is an httpOnly cookie the browser
 * sends automatically. The axios interceptor reads getState().accessToken.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (session) =>
        set({ user: session.user, accessToken: session.accessToken, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'estateai-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isAuthenticated = Boolean(state.accessToken);
      },
    },
  ),
);
