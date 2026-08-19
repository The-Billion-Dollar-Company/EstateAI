export const USER_ROLES = ['buyer', 'owner', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: string;
  facebookId?: string;
  savedProperties: string[];
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}
