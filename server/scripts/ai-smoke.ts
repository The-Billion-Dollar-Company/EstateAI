/**
 * Smoke test for external AI services.
 * Run: npm run ai-smoke  (uses GEMINI_API_KEY and VOYAGE_API_KEY from .env)
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

import { env } from '@/config/env.js';

async function testVoyage(): Promise<void> {
  if (!env.VOYAGE_API_KEY) {
    console.log('[voyage] VOYAGE_API_KEY not set — skipped');
    return;
  }
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'voyage-3', input: ['2-bed apartment in Dhanmondi, Dhaka'] }),
  });
  if (!res.ok) throw new Error(`[voyage] HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
  console.log(`[voyage] ok — embedding dims: ${json.data[0]?.embedding.length ?? 0}`);
}

async function testGemini(): Promise<void> {
  if (!env.GEMINI_API_KEY) {
    console.log('[gemini] GEMINI_API_KEY not set — skipped');
    return;
  }
  const model = new GoogleGenerativeAI(env.GEMINI_API_KEY).getGenerativeModel({
    model: env.GEMINI_MODEL,
  });
  const result = await model.generateContent('Reply with exactly: EstateAI smoke test ok');
  console.log(`[gemini] ok (${env.GEMINI_MODEL}) — reply: ${result.response.text().trim()}`);
}

Promise.all([testVoyage(), testGemini()])
  .then(() => console.log('AI smoke test finished'))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
