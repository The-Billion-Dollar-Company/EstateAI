import type { IncomingMessage, ServerResponse } from 'node:http';

import { createApp } from '@/app.js';
import { connectDb } from '@/config/db.js';
import { ensureStoreFresh } from '@/config/persistence.js';
import { backfillPropertyEmbeddings } from '@/services/rag.service.js';
import { logger } from '@/utils/logger.js';

/**
 * Vercel serverless entry point. Unlike src/index.ts (a long-running process on
 * Render), this module's top-level code runs once per cold start and is reused
 * across warm invocations of the same container — so the app instance and DB
 * connection are memoized at module scope instead of being driven by a single
 * main()/listen() call. The store itself is re-freshened on a short TTL on every
 * request (see ensureStoreFresh) rather than loaded once forever, since this
 * container is one of many and needs to converge on writes the others make.
 *
 * This lives in src/ (not api/) so it goes through the project's own `tsc &&
 * tsc-alias` build like everything else — Vercel's zero-config builder compiles
 * files under api/ directly from source without resolving the `@/*` tsconfig
 * path aliases, which crashes at runtime with ERR_MODULE_NOT_FOUND. api/index.js
 * re-exports the already-alias-resolved compiled output instead.
 */
const app = createApp();

let dbConnectPromise: Promise<boolean> | null = null;

function ensureDbConnected(): Promise<boolean> {
  dbConnectPromise ??= connectDb();
  return dbConnectPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const connected = await ensureDbConnected();
    if (connected) {
      await ensureStoreFresh();
    }
  } catch (err) {
    dbConnectPromise = null; // allow retry on the next invocation
    logger.error({ err }, 'Serverless request initialization failed');
  }
  void backfillPropertyEmbeddings();
  app(req, res);
}
