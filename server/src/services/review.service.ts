import { nextId, store } from '@/data/store.js';
import { getPropertyById, recomputeRating } from '@/services/property.service.js';
import type { Review } from '@/types/property.js';
import { AppError } from '@/utils/app-error.js';

export interface CreateReviewInput {
  propertyId: string;
  userName: string;
  rating: number;
  comment: string;
}

export function createReview(userId: string, input: CreateReviewInput): Review {
  if (!getPropertyById(input.propertyId)) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }
  if (store.reviews.some((r) => r.propertyId === input.propertyId && r.authorId === userId)) {
    throw new AppError(409, 'You have already reviewed this property', 'CONFLICT');
  }
  const review: Review & { authorId: string } = {
    id: nextId('review'),
    propertyId: input.propertyId,
    userName: input.userName,
    rating: input.rating,
    comment: input.comment,
    date: new Date().toISOString().slice(0, 10),
    authorId: userId,
  };
  store.reviews.push(review);
  recomputeRating(input.propertyId);
  return review;
}

export function deleteReview(reviewId: string, userId: string, isAdmin: boolean): void {
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
  if (!isAdmin && review.authorId !== userId) {
    throw new AppError(403, 'You can only delete your own reviews', 'FORBIDDEN');
  }
  store.reviews = store.reviews.filter((r) => r.id !== reviewId);
  recomputeRating(review.propertyId);
}
