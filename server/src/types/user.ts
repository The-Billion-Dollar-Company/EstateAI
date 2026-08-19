export const USER_ROLES = ['buyer', 'owner', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Public-facing user shape (never leaks passwordHash). */
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

/** Internal record persisted in the store — includes the password hash. */
export interface UserRecord extends User {
  passwordHash: string;
  /** How the account authenticates. Google accounts have no usable password. */
  provider?: 'password' | 'google';
}

export function toPublicUser(record: UserRecord): User {
  const { passwordHash: _passwordHash, ...user } = record;
  return user;
}
