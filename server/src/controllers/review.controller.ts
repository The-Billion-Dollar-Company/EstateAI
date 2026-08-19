import type { RequestHandler } from 'express';

import { getUserById } from '@/services/auth.service.js';
import * as reviewService from '@/services/review.service.js';
import type { Review } from '@/types/property.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';

/**
 * Strips the internal authorId before sending a review to clients, replacing it with
 * a plain `isMine` flag — enough for the client to offer a delete button on the
 * viewer's own review without ever learning who wrote anyone else's.
 */
export function toPublicReview(
  review: Review,
  viewerId?: string,
): Omit<Review, 'authorId'> & { isMine: boolean } {
  const { authorId, ...pub } = review;
  return { ...pub, isMine: Boolean(viewerId) && authorId === viewerId };
}

export const createReview: RequestHandler = asyncHandler(async (req, res) => {
  const user = getUserById(req.user?.id ?? '');
  if (!user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  const review = reviewService.createReview(user.id, {
    propertyId: req.params.id ?? '',
    userName: user.name,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json({ success: true, data: toPublicReview(review, user.id) });
});

export const deleteReview: RequestHandler = asyncHandler(async (req, res) => {
  reviewService.deleteReview(req.params.id ?? '', req.user?.id ?? '', req.user?.role === 'admin');
  res.json({ success: true, data: { id: req.params.id } });
});
