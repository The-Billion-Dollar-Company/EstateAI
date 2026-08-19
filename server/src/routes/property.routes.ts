import { Router } from 'express';
import { z } from 'zod';

import {
  addDocuments,
  addMedia,
  createProperty,
  deleteProperty,
  getProperty,
  getPropertyReviews,
  listMyProperties,
  listProperties,
  updateListingStatus,
  updateProperty,
} from '@/controllers/property.controller.js';
import { optionalAuth, requireAuth, requireRole } from '@/middleware/auth.js';
import { validate } from '@/middleware/validate.js';
import { LISTING_TYPES, PROPERTY_TYPES } from '@/types/property.js';

const listQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  beds: z.coerce.number().int().nonnegative().optional(),
  baths: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

const locationSchema = z.object({
  address: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  area: z.string().trim().min(1).max(100),
});

const createPropertySchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(5000),
  type: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  price: z.coerce.number().positive(),
  location: locationSchema,
  beds: z.coerce.number().int().nonnegative(),
  baths: z.coerce.number().int().nonnegative(),
  sizeSqft: z.coerce.number().int().nonnegative(),
  amenities: z.array(z.string().trim().max(60)).max(40).optional(),
  images: z.array(z.string().url()).max(20).optional(),
});

const updatePropertySchema = createPropertySchema.partial();

const mediaSchema = z.object({
  images: z.array(z.string().url()).min(1).max(20),
});

// Owner-settable subset — deliberately excludes 'pending', which is the system state
// for "awaiting admin approval" and isn't something an owner can grant themselves.
const statusSchema = z.object({
  status: z.enum(['active', 'sold', 'rented', 'inactive']),
});

export const propertyRouter = Router();

// Public reads. optionalAuth on the detail/reviews routes so a signed-in viewer's
// identity is known (to reveal the owner's phone once they've earned it, or flag
// which review is theirs) without requiring login just to browse.
propertyRouter.get('/', validate({ query: listQuerySchema }), listProperties);
// Owner's own listings (all statuses) — must be declared before "/:id".
propertyRouter.get('/mine', requireAuth, listMyProperties);
propertyRouter.get('/:id', optionalAuth, validate({ params: idParamsSchema }), getProperty);
propertyRouter.get(
  '/:id/reviews',
  optionalAuth,
  validate({ params: idParamsSchema }),
  getPropertyReviews,
);

// Owner/admin writes
propertyRouter.post(
  '/',
  requireAuth,
  requireRole('owner', 'admin'),
  validate({ body: createPropertySchema }),
  createProperty,
);
propertyRouter.patch(
  '/:id',
  requireAuth,
  validate({ params: idParamsSchema, body: updatePropertySchema }),
  updateProperty,
);
propertyRouter.patch(
  '/:id/status',
  requireAuth,
  validate({ params: idParamsSchema, body: statusSchema }),
  updateListingStatus,
);
propertyRouter.delete('/:id', requireAuth, validate({ params: idParamsSchema }), deleteProperty);
propertyRouter.post(
  '/:id/media',
  requireAuth,
  validate({ params: idParamsSchema, body: mediaSchema }),
  addMedia,
);

const docsSchema = z.object({
  documents: z.array(z.string().url()).min(1).max(10),
});

propertyRouter.post(
  '/:id/documents',
  requireAuth,
  validate({ params: idParamsSchema, body: docsSchema }),
  addDocuments,
);
