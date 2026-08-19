import { createApp } from '@/app.js';
import { connectDb } from '@/config/db.js';
import { env } from '@/config/env.js';
import { startPersistence } from '@/config/persistence.js';
import { backfillPropertyEmbeddings } from '@/services/rag.service.js';
import { logger } from '@/utils/logger.js';

async function main(): Promise<void> {
  const connected = await connectDb();
  if (connected) {
    // Load durable data from Mongo (or seed it on first run) and keep it in sync.
    await startPersistence();
  }
  // Non-blocking: embeds any property missing a vector (e.g. the seed data).
  void backfillPropertyEmbeddings();
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
