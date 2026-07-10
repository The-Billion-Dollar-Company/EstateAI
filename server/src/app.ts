import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from '@/config/env.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { apiLimiter } from '@/middleware/rate-limiter.js';
import { healthRouter } from '@/routes/health.routes.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }
  app.use('/api', apiLimiter);

  app.use('/api/v1/health', healthRouter);

  app.use((req, _res, next) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.path}`, 'NOT_FOUND'));
  });
  app.use(errorHandler);

  return app;
}
