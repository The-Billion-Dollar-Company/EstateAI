import type { Express } from 'express';
import request from 'supertest';

/** Logs in a seeded demo account and returns its access token + user. */
export async function loginAs(
  app: Express,
  email: string,
): Promise<{ token: string; userId: string }> {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'password123' });
  return { token: res.body.data.accessToken, userId: res.body.data.user.id };
}

export const AUTH = {
  admin: 'admin@estateai.test',
  owner: 'owner@estateai.test',
  buyer: 'buyer@estateai.test',
} as const;

export function bearer(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`];
}
