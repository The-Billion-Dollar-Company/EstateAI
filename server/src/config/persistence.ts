import mongoose from 'mongoose';

import { disconnectDb } from '@/config/db.js';
import { store } from '@/data/store.js';
import { logger } from '@/utils/logger.js';

/**
 * MongoDB persistence for the in-memory store. The store stays the runtime working
 * set (fast, synchronous), and this module keeps it durable in MongoDB:
 *   - on boot: load every collection from Mongo into the store;
 *   - if the database is empty: seed it from the store's defaults (this is what
 *     first creates the `estateai` database + its collections in Atlas);
 *   - periodically + on shutdown: snapshot the store back to Mongo.
 *
 * This makes MongoDB the durable source of truth without rewriting every service.
 * The clean next step is per-model Mongoose queries — this keeps the app working now.
 */

const COLLECTIONS = ['users', 'properties', 'reviews', 'bookings', 'conversations'] as const;
type CollectionName = (typeof COLLECTIONS)[number];

const SNAPSHOT_INTERVAL_MS = 3_000;
let lastSignature = '';
let saving = false;

function db(): mongoose.mongo.Db {
  const conn = mongoose.connection.db;
  if (!conn) throw new Error('MongoDB connection is not ready');
  return conn;
}

/**
 * Loads all collections from MongoDB into the store, replacing each one outright —
 * including with an empty array when Mongo genuinely has zero docs for it (e.g. every
 * booking on a listing got cancelled). Skipping the assignment on an empty result
 * would leave this container serving whatever it had cached before, forever. Returns
 * the total doc count across all collections, used by loadOrSeed() to tell "database
 * is genuinely empty, seed it" apart from "this one collection happens to be empty."
 */
export async function loadStoreFromDb(): Promise<number> {
  let total = 0;
  for (const name of COLLECTIONS) {
    const docs = await db()
      .collection(name)
      .find({}, { projection: { _id: 0 } })
      .toArray();
    // Store collections are strongly typed; the DB is schemaless. Assign through a
    // loosened view of the store to avoid the per-key intersection type.
    (store as unknown as Record<CollectionName, unknown[]>)[name] = docs;
    total += docs.length;
  }
  const meta = await db().collection('meta').findOne({ key: 'sequences' });
  if (meta?.value) store.sequences = meta.value as Record<string, number>;
  return total;
}

/**
 * Guards against a stale/uninitialized container overwriting real data: if Mongo
 * currently holds a meaningful number of docs for a collection and this container's
 * in-memory copy would more than halve it, this container's view is untrustworthy
 * (e.g. it never finished loading, or fell back to seed defaults) — refuse to write
 * anything this tick rather than risk wiping the database. Normal deletions (removing
 * one property/review/etc. out of many) never cross a 50% drop, so real user actions
 * are unaffected.
 */
async function wouldCatastrophicallyShrink(): Promise<false | { name: CollectionName; mongoCount: number; localCount: number }> {
  for (const name of COLLECTIONS) {
    const mongoCount = await db().collection(name).countDocuments();
    const localCount = store[name].length;
    if (mongoCount >= 3 && localCount < mongoCount / 2) {
      return { name, mongoCount, localCount };
    }
  }
  return false;
}

/** Replaces every MongoDB collection with the current store contents. */
export async function saveStoreToDb(): Promise<void> {
  const shrink = await wouldCatastrophicallyShrink();
  if (shrink) {
    logger.error(
      shrink,
      `Refusing to snapshot: "${shrink.name}" would drop from ${shrink.mongoCount} to ${shrink.localCount} ` +
        'docs — this container\'s store looks stale/uninitialized, not a real deletion. Skipping this tick.',
    );
    return;
  }
  for (const name of COLLECTIONS) {
    const collection = db().collection(name);
    await collection.deleteMany({});
    const rows = store[name];
    if (rows.length > 0) {
      // Clone so insertMany's injected _id doesn't leak into the in-memory objects.
      await collection.insertMany(rows.map((row) => ({ ...row })));
    }
  }
  await db()
    .collection('meta')
    .replaceOne({ key: 'sequences' }, { key: 'sequences', value: store.sequences }, { upsert: true });
}

async function snapshot(): Promise<void> {
  if (saving || mongoose.connection.readyState !== 1) return;
  const signature = JSON.stringify(store);
  if (signature === lastSignature) return;
  saving = true;
  try {
    await saveStoreToDb();
    lastSignature = signature;
  } catch (err) {
    logger.warn({ err }, 'MongoDB snapshot failed — will retry on the next tick');
  } finally {
    saving = false;
  }
}

async function loadOrSeed(): Promise<void> {
  const loaded = await loadStoreFromDb();
  if (loaded === 0) {
    logger.info('MongoDB is empty — seeding the estateai database from defaults');
    await saveStoreToDb();
  } else {
    logger.info(`Loaded ${loaded} documents from MongoDB into the store`);
  }
  lastSignature = JSON.stringify(store);
}

/** Boots persistence: load-or-seed, then snapshot on an interval and on shutdown. */
export async function startPersistence(): Promise<void> {
  await loadOrSeed();

  const timer = setInterval(() => void snapshot(), SNAPSHOT_INTERVAL_MS);
  timer.unref();

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — saving to MongoDB before exit`);
    void snapshot()
      .then(() => disconnectDb())
      .finally(() => process.exit(0));
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

// How long a warm container trusts its own in-memory copy before re-checking Mongo.
// Vercel routes requests across many warm containers with no session affinity, and
// each one only ever pushes its own writes outward (via snapshotAfterMutation) — it
// never used to pull other containers' writes back in. A container that created a
// listing five minutes ago and one that's never seen it would disagree forever, so a
// refresh could show or hide the same listing purely depending on which container
// answered. Re-loading on a short TTL bounds that staleness window to a few seconds
// instead of "however long this container happens to stay warm."
const STALE_AFTER_MS = 5_000;
let lastLoadedAt = 0;
let loadPromise: Promise<void> | null = null;

/**
 * Serverless variant of {@link startPersistence}: no interval/signal handlers (a
 * function invocation can be frozen or killed at any time, so neither is reliable).
 * Loads the store from MongoDB on this container's first request, then re-loads it
 * whenever the last load is more than {@link STALE_AFTER_MS} old, so this container
 * converges on writes made by other containers instead of serving a stale snapshot
 * for its entire (possibly long) warm lifetime.
 */
export function ensureStoreFresh(): Promise<void> {
  const isStale = Date.now() - lastLoadedAt > STALE_AFTER_MS;
  if (!loadPromise || isStale) {
    loadPromise = loadOrSeed().then(() => {
      lastLoadedAt = Date.now();
    });
  }
  return loadPromise;
}

/** Persists the store immediately; call after a mutating request in serverless. */
export async function snapshotAfterMutation(): Promise<void> {
  await snapshot();
}
