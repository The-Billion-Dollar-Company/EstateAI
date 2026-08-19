import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmetImport from 'helmet';
import { pinoHttp } from 'pino-http';

import { env } from '@/config/env.js';
import { snapshotAfterMutation } from '@/config/persistence.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { apiLimiter } from '@/middleware/rate-limiter.js';
import { adminRouter } from '@/routes/admin.routes.js';
import { assistantRouter } from '@/routes/assistant.routes.js';
import { authRouter } from '@/routes/auth.routes.js';
import { bookingRouter } from '@/routes/booking.routes.js';
import { healthRouter } from '@/routes/health.routes.js';
import { propertyRouter } from '@/routes/property.routes.js';
import { reviewRouter } from '@/routes/review.routes.js';
import { uploadRouter } from '@/routes/upload.routes.js';
import { userRouter } from '@/routes/user.routes.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

// helmet's declared type resolves inconsistently across platforms under NodeNext's
// dual ESM/CJS export map (callable locally on Windows, a non-callable namespace on
// Vercel's Linux build with the same package + TS versions) — assert the runtime
// shape directly instead of trusting whichever declaration file gets picked.
const helmet = helmetImport as unknown as (
  options?: unknown,
) => (req: Request, res: Response, next: NextFunction) => void;

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const configuredOrigins = env.CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Allows any localhost/127.0.0.1 port (frontend dev) plus configured production origins. */
function corsOriginCheck(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  if (!origin || LOCALHOST_ORIGIN.test(origin) || configuredOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`Origin not allowed by CORS: ${origin}`));
}

export function createApp(): express.Express {
  const app = express();

  // Vercel (and Render) put the app behind a reverse proxy that sets X-Forwarded-For.
  // Without this, express-rate-limit's IP-based keyGenerator throws
  // ERR_ERL_UNEXPECTED_X_FORWARDED_FOR, and req.ip/req.secure would reflect the proxy
  // rather than the real client. `1` trusts exactly one hop, matching that setup.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: corsOriginCheck, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());
  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }
  app.use('/api', apiLimiter);
  // In serverless (Vercel), the interval-based snapshot in startPersistence() never
  // runs — the process can be frozen/killed between invocations. Persist immediately
  // after any mutating request instead; snapshot() is a cheap no-op when Mongo isn't
  // connected or nothing changed since the last save.
  //
  // Awaited *before* the response goes out, not fired-and-forgotten after: a client
  // that acts on a mutation's response (e.g. logs in right after registering) can
  // land on a different warm container within milliseconds, and that container only
  // ever learns about writes by reading MongoDB — so if the write hasn't reached
  // MongoDB yet, no amount of read-side freshness helps. This trades a bit of extra
  // latency per write for the response only landing once the change is durable.
  app.use('/api', (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      next();
      return;
    }
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      void snapshotAfterMutation().finally(() => {
        originalJson(body);
      });
      return res;
    }) as typeof res.json;
    next();
  });

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/properties', propertyRouter);
  app.use('/api/v1', reviewRouter); // /properties/:id/reviews (POST) + /reviews/:id (DELETE)
  app.use('/api/v1/bookings', bookingRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/assistant', assistantRouter);
  app.use('/api/v1/upload', uploadRouter);
  app.use('/api/v1/admin', adminRouter);

  app.use((req, _res, next) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.path}`, 'NOT_FOUND'));
  });
  app.use(errorHandler);

  return app;
}
