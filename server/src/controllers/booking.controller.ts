import type { RequestHandler } from 'express';

import * as bookingService from '@/services/booking.service.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';

function requireUserId(req: Parameters<RequestHandler>[0]): string {
  const id = req.user?.id;
  if (!id) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  return id;
}

export const createBooking: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  const booking = bookingService.createBooking(userId, req.body);
  res.status(201).json({ success: true, data: booking });
});

export const listMine: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  res.json({ success: true, data: bookingService.listMyBookings(userId) });
});

export const listOwner: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  res.json({ success: true, data: bookingService.listOwnerBookings(userId) });
});

export const updateStatus: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  const booking = bookingService.updateStatus(
    req.params.id ?? '',
    req.body.status,
    userId,
    req.user?.role === 'admin',
    req.body.ownerMessage,
  );
  res.json({ success: true, data: booking });
});

export const negotiate: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  const booking = bookingService.addNegotiation(
    req.params.id ?? '',
    userId,
    req.body.amount,
    req.body.note,
    req.user?.role === 'admin',
  );
  res.json({ success: true, data: booking });
});

export const cancelBooking: RequestHandler = asyncHandler(async (req, res) => {
  const userId = requireUserId(req);
  const booking = bookingService.cancelBooking(req.params.id ?? '', userId);
  res.json({ success: true, data: booking });
});
