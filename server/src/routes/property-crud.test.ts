import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

const newListing = {
  title: 'Test listing in Banani',
  description: 'A well-lit test unit for the CRUD suite.',
  type: 'apartment',
  listingType: 'rent',
  price: 45000,
  location: { address: 'Road 12, Banani', city: 'Dhaka', area: 'Banani' },
  beds: 2,
  baths: 2,
  sizeSqft: 1000,
  amenities: ['Elevator'],
};

describe('property CRUD', () => {
  it('forbids buyers from creating listings', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/properties')
      .set(...bearer(token))
      .send(newListing);
    expect(res.status).toBe(403);
  });

  it("lists the owner's own listings (all statuses) via /mine", async () => {
    const { token } = await loginAs(app, AUTH.owner);
    const before = await request(app).get('/api/v1/properties/mine').set(...bearer(token));
    expect(before.status).toBe(200);
    const beforeCount = before.body.data.length;

    await request(app)
      .post('/api/v1/properties')
      .set(...bearer(token))
      .send(newListing);

    const after = await request(app).get('/api/v1/properties/mine').set(...bearer(token));
    // The new pending listing shows in /mine even though it's absent from the public list.
    expect(after.body.data.length).toBe(beforeCount + 1);
    expect(after.body.data.some((p: { status: string }) => p.status === 'pending')).toBe(true);
  });

  it('requires auth for /mine', async () => {
    const res = await request(app).get('/api/v1/properties/mine');
    expect(res.status).toBe(401);
  });

  it('lets an owner create a pending listing', async () => {
    const { token } = await loginAs(app, AUTH.owner);
    const res = await request(app)
      .post('/api/v1/properties')
      .set(...bearer(token))
      .send(newListing);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.id).toBeTruthy();
  });

  it('lets the owner update and delete their listing; admin can approve', async () => {
    const owner = await loginAs(app, AUTH.owner);
    const created = await request(app)
      .post('/api/v1/properties')
      .set(...bearer(owner.token))
      .send(newListing);
    const id = created.body.data.id;

    const admin = await loginAs(app, AUTH.admin);
    const approved = await request(app)
      .patch(`/api/v1/admin/properties/${id}/approve`)
      .set(...bearer(admin.token));
    expect(approved.body.data.status).toBe('active');

    const updated = await request(app)
      .patch(`/api/v1/properties/${id}`)
      .set(...bearer(owner.token))
      .send({ price: 50000 });
    expect(updated.body.data.price).toBe(50000);

    const media = await request(app)
      .post(`/api/v1/properties/${id}/media`)
      .set(...bearer(owner.token))
      .send({ images: ['https://cdn.example.com/a.jpg'] });
    expect(media.body.data.images).toContain('https://cdn.example.com/a.jpg');

    const removed = await request(app)
      .delete(`/api/v1/properties/${id}`)
      .set(...bearer(owner.token));
    expect(removed.status).toBe(200);
    expect((await request(app).get(`/api/v1/properties/${id}`)).status).toBe(404);
  });

  it("forbids an owner from editing someone else's listing", async () => {
    const buyerTurnedOwner = await request(app).post('/api/v1/auth/register').send({
      name: 'Other Owner',
      email: 'other@estateai.test',
      password: 'password123',
      role: 'owner',
    });
    const token = buyerTurnedOwner.body.data.accessToken;
    const res = await request(app)
      .patch('/api/v1/properties/p1') // owned by "Rahim Chowdhury"
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1 });
    expect(res.status).toBe(403);
  });

  describe('owner contact privacy', () => {
    it('hides the phone number from an anonymous viewer', async () => {
      const res = await request(app).get('/api/v1/properties/p1');
      expect(res.body.data.owner).toEqual({ name: 'Rahim Chowdhury' });
      expect(res.body.data.ownerContact).toBeUndefined();
    });

    it('hides the phone number from a signed-in buyer with no confirmed booking', async () => {
      const { token } = await loginAs(app, AUTH.buyer);
      const res = await request(app).get('/api/v1/properties/p1').set(...bearer(token));
      expect(res.body.data.ownerContact).toBeUndefined();
    });

    it('reveals the phone number to the listing owner', async () => {
      const { token } = await loginAs(app, AUTH.owner);
      const res = await request(app).get('/api/v1/properties/p1').set(...bearer(token));
      expect(res.body.data.ownerContact).toEqual({
        name: 'Rahim Chowdhury',
        phone: '+880 17 1234 5678',
      });
    });

    it('reveals the phone number to admins', async () => {
      const { token } = await loginAs(app, AUTH.admin);
      const res = await request(app).get('/api/v1/properties/p1').set(...bearer(token));
      expect(res.body.data.ownerContact?.phone).toBeTruthy();
    });

    it('reveals the phone number once a booking on it is confirmed', async () => {
      const buyer = await loginAs(app, AUTH.buyer);
      const booking = await request(app)
        .post('/api/v1/bookings')
        .set(...bearer(buyer.token))
        .send({ property: 'p1', type: 'visit', scheduledAt: '2026-08-01T10:00:00.000Z' });

      const before = await request(app).get('/api/v1/properties/p1').set(...bearer(buyer.token));
      expect(before.body.data.ownerContact).toBeUndefined();

      const owner = await loginAs(app, AUTH.owner);
      await request(app)
        .patch(`/api/v1/bookings/${booking.body.data.id}/status`)
        .set(...bearer(owner.token))
        .send({ status: 'confirmed' });

      const after = await request(app).get('/api/v1/properties/p1').set(...bearer(buyer.token));
      expect(after.body.data.ownerContact?.phone).toBeTruthy();
    });
  });

  describe('owner-set listing status', () => {
    it('lets the owner mark their own listing as rented', async () => {
      const { token } = await loginAs(app, AUTH.owner);
      const res = await request(app)
        .patch('/api/v1/properties/p2/status') // rent listing owned by Rahim Chowdhury
        .set(...bearer(token))
        .send({ status: 'rented' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rented');
    });

    it('forbids a buyer from changing listing status', async () => {
      const { token } = await loginAs(app, AUTH.buyer);
      const res = await request(app)
        .patch('/api/v1/properties/p2/status')
        .set(...bearer(token))
        .send({ status: 'rented' });
      expect(res.status).toBe(403);
    });

    it('rejects the system-only "pending" status from an owner', async () => {
      const { token } = await loginAs(app, AUTH.owner);
      const res = await request(app)
        .patch('/api/v1/properties/p2/status')
        .set(...bearer(token))
        .send({ status: 'pending' });
      expect(res.status).toBe(400);
    });

    it('blocks new booking requests with a specific message once marked rented', async () => {
      const owner = await loginAs(app, AUTH.owner);
      await request(app)
        .patch('/api/v1/properties/p2/status')
        .set(...bearer(owner.token))
        .send({ status: 'rented' });

      const { token } = await loginAs(app, AUTH.buyer);
      const res = await request(app)
        .post('/api/v1/bookings')
        .set(...bearer(token))
        .send({ property: 'p2', type: 'visit', scheduledAt: '2026-08-01T10:00:00.000Z' });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/already been rented/i);
    });
  });
});
