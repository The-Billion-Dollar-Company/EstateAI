import { Router } from 'express';
import { z } from 'zod';

import { createReview, deleteReview } from '@/controllers/review.controller.js';
import { requireAuth } from '@/middleware/auth.js';
import { validate } from '@/middleware/validate.js';

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

// Mounted at /api/v1 so both property-scoped create and top-level delete live here.
export const reviewRouter = Router();

reviewRouter.post(
  '/properties/:id/reviews',
  requireAuth,
  validate({ params: idParamsSchema, body: createReviewSchema }),
  createReview,
);

reviewRouter.delete(
  '/reviews/:id',
  requireAuth,
  validate({ params: idParamsSchema }),
  deleteReview,
);
