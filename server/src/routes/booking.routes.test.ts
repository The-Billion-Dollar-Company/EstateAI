import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

async function createVisit(token: string): Promise<string> {
  const res = await request(app)
    .post('/api/v1/bookings')
    .set(...bearer(token))
    .send({ property: 'p1', type: 'visit', scheduledAt: '2026-08-01T10:00:00.000Z' });
  return res.body.data.id;
}

describe('bookings', () => {
  it('requires auth', async () => {
    const res = await request(app).post('/api/v1/bookings').send({ property: 'p1', type: 'visit' });
    expect(res.status).toBe(401);
  });

  it('creates a visit booking', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/bookings')
      .set(...bearer(token))
      .send({ property: 'p1', type: 'visit', scheduledAt: '2026-08-01T10:00:00.000Z' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('requires scheduledAt for a visit', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/bookings')
      .set(...bearer(token))
      .send({ property: 'p1', type: 'visit' });
    expect(res.status).toBe(400);
  });

  it('lists the buyer own bookings', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    await createVisit(token);
    const res = await request(app).get('/api/v1/bookings/mine').set(...bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].property.title).toBeTruthy();
  });

  it('lets the owner see bookings on their listings and update status', async () => {
    const buyer = await loginAs(app, AUTH.buyer);
    const bookingId = await createVisit(buyer.token);

    const owner = await loginAs(app, AUTH.owner);
    const ownerList = await request(app).get('/api/v1/bookings/owner').set(...bearer(owner.token));
    expect(ownerList.body.data.length).toBe(1);

    const patched = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set(...bearer(owner.token))
      .send({ status: 'confirmed' });
    expect(patched.status).toBe(200);
    expect(patched.body.data.status).toBe('confirmed');
  });

  it('forbids a buyer from changing booking status', async () => {
    const buyer = await loginAs(app, AUTH.buyer);
    const bookingId = await createVisit(buyer.token);
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/status`)
      .set(...bearer(buyer.token))
      .send({ status: 'confirmed' });
    expect(res.status).toBe(403);
  });

  it('appends a negotiation entry', async () => {
    const buyer = await loginAs(app, AUTH.buyer);
    const bookingId = await createVisit(buyer.token);
    const res = await request(app)
      .post(`/api/v1/bookings/${bookingId}/negotiate`)
      .set(...bearer(buyer.token))
      .send({ amount: 30000000, note: 'Would you take this?' });
    expect(res.status).toBe(200);
    expect(res.body.data.negotiation).toHaveLength(1);
  });
});
