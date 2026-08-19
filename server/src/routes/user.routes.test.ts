import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

describe('users', () => {
  it('updates the profile', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set(...bearer(token))
      .send({ phone: '+880 19 0000 0000' });
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('+880 19 0000 0000');
  });

  it('toggles a saved property on and off', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const on = await request(app)
      .post('/api/v1/users/me/saved/p1')
      .set(...bearer(token));
    expect(on.body.data.savedProperties).toContain('p1');

    const off = await request(app)
      .post('/api/v1/users/me/saved/p1')
      .set(...bearer(token));
    expect(off.body.data.savedProperties).not.toContain('p1');
  });

  it('404s when saving a missing property', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/users/me/saved/nope')
      .set(...bearer(token));
    expect(res.status).toBe(404);
  });

  it('upgrades a buyer to owner and returns a token that can create listings', async () => {
    const { token } = await loginAs(app, AUTH.buyer);

    // Buyer cannot create a listing.
    const listing = {
      title: 'My first listing',
      description: 'A great place to live for the become-owner test.',
      type: 'apartment',
      listingType: 'rent',
      price: 30000,
      location: { address: 'Rd 1', city: 'Dhaka', area: 'Banani' },
      beds: 1,
      baths: 1,
      sizeSqft: 600,
    };
    const blocked = await request(app)
      .post('/api/v1/properties')
      .set(...bearer(token))
      .send(listing);
    expect(blocked.status).toBe(403);

    // Become an owner → new session with owner role.
    const upgrade = await request(app)
      .post('/api/v1/users/me/become-owner')
      .set(...bearer(token));
    expect(upgrade.status).toBe(200);
    expect(upgrade.body.data.user.role).toBe('owner');
    const ownerToken = upgrade.body.data.accessToken;

    // The new token can now create listings.
    const created = await request(app)
      .post('/api/v1/properties')
      .set(...bearer(ownerToken))
      .send(listing);
    expect(created.status).toBe(201);
  });
});
