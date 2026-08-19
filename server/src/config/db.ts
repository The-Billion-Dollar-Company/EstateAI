import mongoose from 'mongoose';

import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

/** Database name used regardless of whether the URI includes one. */
export const DB_NAME = 'estateai';

/** Connects to MongoDB. Returns true on success, false if unset/unreachable. */
export async function connectDb(): Promise<boolean> {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set — starting without a database connection');
    return false;
  }
  // Non-fatal: a failed/unreachable Atlas connection must not take down the server;
  // the in-memory store keeps the API working. dbName forces the target database
  // even when the connection string omits it (e.g. ".../?appName=Cluster0").
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 8000,
    });
    logger.info(`MongoDB connected (database: ${DB_NAME})`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? (err.message.split('\n')[0] ?? err.message) : String(err);
    logger.warn(`MongoDB connection failed — continuing with the in-memory store. Reason: ${message}`);
    if (message.includes('SSL') || message.includes('tlsv1')) {
      logger.warn(
        'TLS handshake was rejected. This is usually antivirus "HTTPS/SSL scanning" or a ' +
          'restrictive network intercepting the connection — try a phone hotspot to confirm, ' +
          'or use a local MongoDB (MONGODB_URI=mongodb://localhost:27017/estateai).',
      );
    }
    return false;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
