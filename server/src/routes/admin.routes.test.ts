import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

describe('admin', () => {
  it('forbids non-admins from stats', async () => {
    const { token } = await loginAs(app, AUTH.owner);
    const res = await request(app).get('/api/v1/admin/stats').set(...bearer(token));
    expect(res.status).toBe(403);
  });

  it('returns stats for an admin', async () => {
    const { token } = await loginAs(app, AUTH.admin);
    const res = await request(app).get('/api/v1/admin/stats').set(...bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('activeListings');
    expect(res.body.data).toHaveProperty('totalUsers');
  });

  it('lists users without leaking password hashes', async () => {
    const { token } = await loginAs(app, AUTH.admin);
    const res = await request(app).get('/api/v1/admin/users').set(...bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].passwordHash).toBeUndefined();
  });
});
