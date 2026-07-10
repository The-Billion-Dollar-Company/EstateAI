/**
 * Smoke test for external AI services (phase 3 exit criterion).
 * Run: npm run ai-smoke  (requires ANTHROPIC_API_KEY and VOYAGE_API_KEY in .env)
 * Uses raw fetch to avoid SDK dependencies before the RAG phase needs them.
 */
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

async function testClaude(): Promise<void> {
  if (!env.ANTHROPIC_API_KEY) {
    console.log('[claude] ANTHROPIC_API_KEY not set — skipped');
    return;
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Reply with exactly: EstateAI smoke test ok' }],
    }),
  });
  if (!res.ok) throw new Error(`[claude] HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { content: Array<{ type: string; text?: string }> };
  console.log(`[claude] ok — reply: ${json.content[0]?.text ?? '(no text)'}`);
}

Promise.all([testVoyage(), testClaude()])
  .then(() => console.log('AI smoke test finished'))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
