import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { AUTH, bearer, loginAs } from '@/test/helpers.js';

const app = createApp();

describe('assistant', () => {
  it('lets anonymous visitors chat (no persistence)', async () => {
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .send({ message: 'a 2-bed rental near Dhanmondi' });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/"type":"token"/);
    expect(res.text).toMatch(/"conversationId":null/);
  });

  it('requires auth to read conversation history', async () => {
    const res = await request(app).get('/api/v1/assistant/conversations');
    expect(res.status).toBe(401);
  });

  it('streams a grounded SSE reply that cites real property ids', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    const res = await request(app)
      .post('/api/v1/assistant/chat')
      .set(...bearer(token))
      .send({ message: 'a 2-bed rental near Dhanmondi under 40000' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
    expect(res.text).toMatch(/"type":"token"/);
    expect(res.text).toMatch(/"type":"properties"/);
    expect(res.text).toMatch(/"type":"done"/);
    // Grounding: any cited [P:id] must be a real property.
    const cited = [...res.text.matchAll(/\[P:(p\d+)\]/g)].map((m) => m[1]);
    for (const id of cited) {
      const prop = await request(app).get(`/api/v1/properties/${id}`);
      expect(prop.status).toBe(200);
    }
  });

  it('persists the conversation turn', async () => {
    const { token } = await loginAs(app, AUTH.buyer);
    await request(app)
      .post('/api/v1/assistant/chat')
      .set(...bearer(token))
      .send({ message: 'family house in Uttara' });
    const list = await request(app)
      .get('/api/v1/assistant/conversations')
      .set(...bearer(token));
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].messages.length).toBe(2);
  });
});
