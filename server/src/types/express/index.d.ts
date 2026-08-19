import type { UserRole } from '@/types/user.js';

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth after verifying the access token. */
      user?: { id: string; role: UserRole };
    }
  }
}

export {};
