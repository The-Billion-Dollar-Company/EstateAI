import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: err.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; '),
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
};
