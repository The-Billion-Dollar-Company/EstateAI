import { Router } from 'express';
import { z } from 'zod';

import {
  cancelBooking,
  createBooking,
  listMine,
  listOwner,
  negotiate,
  updateStatus,
} from '@/controllers/booking.controller.js';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { validate } from '@/middleware/validate.js';
import { BOOKING_TYPES } from '@/types/booking.js';

const createSchema = z.object({
  property: z.string().min(1),
  type: z.enum(BOOKING_TYPES),
  scheduledAt: z.string().datetime().optional(),
  message: z.string().trim().max(1000).optional(),
});

const statusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
  ownerMessage: z.string().trim().max(1000).optional(),
});

const negotiateSchema = z.object({
  amount: z.coerce.number().positive(),
  note: z.string().trim().max(500).optional(),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.post('/', validate({ body: createSchema }), createBooking);
bookingRouter.get('/mine', listMine);
bookingRouter.get('/owner', requireRole('owner', 'admin'), listOwner);
bookingRouter.patch(
  '/:id/status',
  validate({ params: idParamsSchema, body: statusSchema }),
  updateStatus,
);
bookingRouter.post(
  '/:id/negotiate',
  validate({ params: idParamsSchema, body: negotiateSchema }),
  negotiate,
);
bookingRouter.patch('/:id/cancel', validate({ params: idParamsSchema }), cancelBooking);
