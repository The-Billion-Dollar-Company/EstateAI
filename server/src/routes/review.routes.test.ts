import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

describe('reviews', () => {
  it('requires auth to create a review', async () => {
    const res = await request(app)
      .post('/api/v1/properties/p2/reviews')
      .send({ rating: 5, comment: 'Great place' });
    expect(res.status).toBe(401);
  });

  it('creates a review and updates the property rating', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/properties/p2/reviews')
      .set(...bearer(token))
      .send({ rating: 5, comment: 'Loved the location' });
    expect(res.status).toBe(201);
    expect(res.body.data.propertyId).toBe('p2');
    expect(res.body.data.authorId).toBeUndefined();

    const prop = await request(app).get('/api/v1/properties/p2');
    expect(prop.body.data.reviewCount).toBeGreaterThan(0);
  });

  it('blocks a second review from the same user with 409', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const send = () =>
      request(app)
        .post('/api/v1/properties/p2/reviews')
        .set(...bearer(token))
        .send({ rating: 4, comment: 'Again' });
    await send();
    const second = await send();
    expect(second.status).toBe(409);
  });

  it('rejects an out-of-range rating with 400', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/properties/p2/reviews')
      .set(...bearer(token))
      .send({ rating: 9, comment: 'Nope' });
    expect(res.status).toBe(400);
  });

  it('flags the author\'s own review as isMine without exposing anyone else\'s identity', async () => {
    const buyer = await loginAs(app, AUTH.buyer);
    await request(app)
      .post('/api/v1/properties/p2/reviews')
      .set(...bearer(buyer.token))
      .send({ rating: 5, comment: 'Mine' });

    const asAuthor = await request(app).get('/api/v1/properties/p2/reviews').set(...bearer(buyer.token));
    expect(asAuthor.body.data[0].isMine).toBe(true);

    const owner = await loginAs(app, AUTH.owner);
    const asSomeoneElse = await request(app)
      .get('/api/v1/properties/p2/reviews')
      .set(...bearer(owner.token));
    expect(asSomeoneElse.body.data[0].isMine).toBe(false);
    expect(asSomeoneElse.body.data[0].authorId).toBeUndefined();

    const anonymous = await request(app).get('/api/v1/properties/p2/reviews');
    expect(anonymous.body.data[0].isMine).toBe(false);
  });

  it('lets the author delete their own review', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const created = await request(app)
      .post('/api/v1/properties/p2/reviews')
      .set(...bearer(token))
      .send({ rating: 3, comment: 'Deleting this' });

    const res = await request(app)
      .delete(`/api/v1/reviews/${created.body.data.id}`)
      .set(...bearer(token));
    expect(res.status).toBe(200);

    const list = await request(app).get('/api/v1/properties/p2/reviews');
    expect(list.body.data.some((r: { id: string }) => r.id === created.body.data.id)).toBe(false);
  });
});
