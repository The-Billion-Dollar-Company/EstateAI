import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

describe('auth', () => {
  it('registers a new user and returns an access token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'New User',
      email: 'new@estateai.test',
      password: 'password123',
      role: 'buyer',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('new@estateai.test');
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/refreshToken/);
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Dupe',
      email: AUTH.admin,
      password: 'password123',
      role: 'buyer',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Short',
      email: 'short@estateai.test',
      password: 'abc',
      role: 'buyer',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: AUTH.owner, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('owner');
  });

  it('rejects bad credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: AUTH.owner, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /me requires a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /me returns the current user with a token', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app).get('/api/v1/auth/me').set(...bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(AUTH.buyer);
  });

  it('POST /google returns 503 when Firebase is not configured', async () => {
    // No FIREBASE_* env in test, so Google sign-in is unavailable but must fail cleanly.
    const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'x.y.z' });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('FIREBASE_NOT_CONFIGURED');
  });

  it('POST /google validates the body', async () => {
    const res = await request(app).post('/api/v1/auth/google').send({});
    expect(res.status).toBe(400);
  });
});
