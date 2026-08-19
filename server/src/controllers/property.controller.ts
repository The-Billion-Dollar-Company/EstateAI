import type { RequestHandler } from 'express';

import { toPublicReview } from '@/controllers/review.controller.js';
import { getUserById } from '@/services/auth.service.js';
import { hasConfirmedBooking } from '@/services/booking.service.js';
import * as propertyService from '@/services/property.service.js';
import type { PropertyQuery } from '@/services/property.service.js';
import type { Property } from '@/types/property.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';

/**
 * Strips the internal Voyage embedding vector and the owner's phone number before a
 * property reaches a client — the phone is only ever attached via {@link withOwnerContact}
 * for viewers who've actually earned it (the owner themselves, an admin, or a buyer
 * with a confirmed booking on it).
 */
export function toPublicProperty(
  property: Property,
): Omit<Property, 'embedding' | 'owner'> & { owner: { name: string } } {
  const { embedding: _embedding, owner, ...rest } = property;
  return { ...rest, owner: { name: owner.name } };
}

/** Attaches the owner's contact details only when the viewer has actually earned them. */
export function withOwnerContact(
  property: Property,
  viewerId: string | undefined,
  isAdmin: boolean,
): ReturnType<typeof toPublicProperty> & { ownerContact?: { name: string; phone: string } } {
  const isOwner = Boolean(viewerId) && viewerId === property.ownerId;
  const earned = isOwner || isAdmin || (Boolean(viewerId) && hasConfirmedBooking(viewerId ?? '', property.id));
  return {
    ...toPublicProperty(property),
    ...(earned ? { ownerContact: { name: property.owner.name, phone: property.owner.phone } } : {}),
  };
}

function assertCanEdit(propertyId: string, userId: string, role: string): Property {
  const property = propertyService.getPropertyById(propertyId);
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  if (role !== 'admin' && property.ownerId !== userId) {
    throw new AppError(403, 'You can only modify your own listings', 'FORBIDDEN');
  }
  return property;
}

export const listProperties: RequestHandler = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = propertyService.listProperties(
    req.query as unknown as PropertyQuery,
  );
  res.json({
    success: true,
    data: items.map(toPublicProperty),
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const listMyProperties: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? '';
  if (!userId) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  const items = propertyService.listPropertiesByOwner(userId);
  res.json({ success: true, data: items.map(toPublicProperty), meta: { total: items.length } });
});

export const getProperty: RequestHandler = asyncHandler(async (req, res) => {
  const property = propertyService.getPropertyById(req.params.id ?? '');
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  const data = withOwnerContact(property, req.user?.id, req.user?.role === 'admin');
  res.json({ success: true, data });
});

export const getPropertyReviews: RequestHandler = asyncHandler(async (req, res) => {
  const property = propertyService.getPropertyById(req.params.id ?? '');
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  res.json({
    success: true,
    data: propertyService
      .getReviewsForProperty(property.id)
      .map((review) => toPublicReview(review, req.user?.id)),
  });
});

export const createProperty: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user?.id ?? '';
  const user = getUserById(userId);
  if (!user) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  const property = propertyService.createProperty({
    ...req.body,
    ownerId: userId,
    owner: { name: user.name, phone: user.phone ?? '' },
  });
  res.status(201).json({ success: true, data: toPublicProperty(property) });
});

export const updateProperty: RequestHandler = asyncHandler(async (req, res) => {
  assertCanEdit(req.params.id ?? '', req.user?.id ?? '', req.user?.role ?? '');
  const property = propertyService.updateProperty(req.params.id ?? '', req.body);
  res.json({ success: true, data: property ? toPublicProperty(property) : property });
});

export const deleteProperty: RequestHandler = asyncHandler(async (req, res) => {
  assertCanEdit(req.params.id ?? '', req.user?.id ?? '', req.user?.role ?? '');
  propertyService.deleteProperty(req.params.id ?? '');
  res.json({ success: true, data: { id: req.params.id } });
});

/** Owner (or admin) marks their own listing sold/rented/active/inactive. */
export const updateListingStatus: RequestHandler = asyncHandler(async (req, res) => {
  assertCanEdit(req.params.id ?? '', req.user?.id ?? '', req.user?.role ?? '');
  const property = propertyService.setPropertyStatus(req.params.id ?? '', req.body.status);
  res.json({ success: true, data: property ? toPublicProperty(property) : property });
});

export const addMedia: RequestHandler = asyncHandler(async (req, res) => {
  assertCanEdit(req.params.id ?? '', req.user?.id ?? '', req.user?.role ?? '');
  const property = propertyService.addPropertyImages(req.params.id ?? '', req.body.images);
  res.json({ success: true, data: { images: property?.images ?? [] } });
});

export const addDocuments: RequestHandler = asyncHandler(async (req, res) => {
  assertCanEdit(req.params.id ?? '', req.user?.id ?? '', req.user?.role ?? '');
  const property = propertyService.addPropertyDocuments(req.params.id ?? '', req.body.documents);
  res.json({ success: true, data: { documents: property?.documents ?? [] } });
});
