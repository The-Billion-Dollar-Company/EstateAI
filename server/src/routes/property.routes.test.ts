import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';

const app = createApp();

describe('GET /api/v1/properties', () => {
  it('returns paginated active properties with meta', async () => {
    const res = await request(app).get('/api/v1/properties');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 12 });
  });

  it('filters by listingType and beds', async () => {
    const res = await request(app).get('/api/v1/properties?listingType=rent&beds=2');
    expect(res.status).toBe(200);
    for (const p of res.body.data) {
      expect(p.listingType).toBe('rent');
      expect(p.beds).toBeGreaterThanOrEqual(2);
    }
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/v1/properties?sort=price-asc');
    const prices = res.body.data.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });

  it('rejects an invalid sort value with 400', async () => {
    const res = await request(app).get('/api/v1/properties?sort=bogus');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/properties/:id', () => {
  it('returns a property by id', async () => {
    const res = await request(app).get('/api/v1/properties/p1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('p1');
  });

  it('404s for unknown ids', async () => {
    const res = await request(app).get('/api/v1/properties/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PROPERTY_NOT_FOUND');
  });

  it('returns reviews for a property', async () => {
    const res = await request(app).get('/api/v1/properties/p1/reviews');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].propertyId).toBe('p1');
  });
});
