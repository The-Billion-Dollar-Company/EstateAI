import mongoose from 'mongoose';

import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

export async function connectDb(): Promise<void> {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set — starting without a database connection');
    return;
  }
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
