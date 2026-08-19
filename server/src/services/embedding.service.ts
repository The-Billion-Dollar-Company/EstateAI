import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

const VOYAGE_ENDPOINT = 'https://api.voyageai.com/v1/embeddings';

export type EmbeddingInputType = 'document' | 'query';

interface VoyageEmbeddingResponse {
  data: { embedding: number[]; index: number }[];
}

export function isVoyageConfigured(): boolean {
  return Boolean(env.VOYAGE_API_KEY);
}

/** Embeds a batch of texts in one request. Throws if Voyage is unconfigured or the call fails. */
export async function embedTexts(
  texts: string[],
  inputType: EmbeddingInputType,
): Promise<number[][]> {
  if (!env.VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY not set');
  if (texts.length === 0) return [];

  const res = await fetch(VOYAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: env.VOYAGE_MODEL, input_type: inputType }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Voyage embeddings request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as VoyageEmbeddingResponse;
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** Convenience wrapper for a single text. */
export async function embedText(text: string, inputType: EmbeddingInputType): Promise<number[]> {
  const [vector] = await embedTexts([text], inputType);
  if (!vector) throw new Error('Voyage returned no embedding');
  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function logEmbeddingFailure(context: string, err: unknown): void {
  logger.warn({ err }, `Embedding step failed (${context}) — falling back`);
}
