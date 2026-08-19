import bcrypt from 'bcryptjs';

import { nextId, store } from '@/data/store.js';
import { toPublicUser, type User, type UserRecord, type UserRole } from '@/types/user.js';
import { AppError } from '@/utils/app-error.js';

const BCRYPT_COST = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'buyer' | 'owner'>;
}

export async function register(input: RegisterInput): Promise<User> {
  const email = input.email.toLowerCase();
  if (store.users.some((u) => u.email === email)) {
    throw new AppError(409, 'An account with this email already exists', 'CONFLICT');
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const record: UserRecord = {
    id: nextId('user'),
    name: input.name,
    email,
    role: input.role,
    savedProperties: [],
    createdAt: new Date().toISOString(),
    passwordHash,
  };
  store.users.push(record);
  return toPublicUser(record);
}

export async function verifyCredentials(email: string, password: string): Promise<User> {
  const record = store.users.find((u) => u.email === email.toLowerCase());
  // Compare against a dummy hash when the user is missing to reduce timing leaks.
  const hash = record?.passwordHash ?? '$2a$12$0000000000000000000000000000000000000000000000000000';
  const ok = await bcrypt.compare(password, hash);
  if (!record || !ok) {
    throw new AppError(401, 'Invalid email or password', 'UNAUTHORIZED');
  }
  return toPublicUser(record);
}

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}

/** Finds an existing user by email or creates a Google-backed buyer account. */
export async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
  const email = profile.email.toLowerCase();
  const existing = store.users.find((u) => u.email === email);
  if (existing) {
    if (profile.picture && !existing.avatar) existing.avatar = profile.picture;
    return toPublicUser(existing);
  }
  // No usable password for Google accounts — store a random unguessable hash.
  const passwordHash = await bcrypt.hash(`google:${nextId('user')}:${Date.now()}`, BCRYPT_COST);
  const record: UserRecord = {
    id: nextId('user'),
    name: profile.name,
    email,
    role: 'buyer',
    avatar: profile.picture,
    savedProperties: [],
    createdAt: new Date().toISOString(),
    passwordHash,
    provider: 'google',
  };
  store.users.push(record);
  return toPublicUser(record);
}

export function getUserById(id: string): User | undefined {
  const record = store.users.find((u) => u.id === id);
  return record ? toPublicUser(record) : undefined;
}

export function getUserRecordById(id: string): UserRecord | undefined {
  return store.users.find((u) => u.id === id);
}
