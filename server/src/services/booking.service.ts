import { nextId, store } from '@/data/store.js';
import { getPropertyById } from '@/services/property.service.js';
import type {
  Booking,
  BookingStatus,
  BookingType,
  BookingWithProperty,
} from '@/types/booking.js';
import { AppError } from '@/utils/app-error.js';

export interface CreateBookingInput {
  property: string;
  type: BookingType;
  scheduledAt?: string;
  message?: string;
}

function withProperty(booking: Booking): BookingWithProperty {
  const property = getPropertyById(booking.property);
  return {
    ...booking,
    property: {
      id: booking.property,
      title: property?.title ?? 'Unknown property',
      price: property?.price ?? 0,
      listingType: property?.listingType ?? 'sale',
      image: property?.images[0],
      city: property?.location.city ?? '',
      area: property?.location.area ?? '',
    },
    // Only reveal owner contact details when booking is confirmed
    ownerContact: booking.status === 'confirmed' && property
      ? { name: property.owner.name, phone: property.owner.phone }
      : undefined,
  };
}

const UNAVAILABLE_MESSAGES: Partial<Record<string, string>> = {
  sold: 'This property has already been sold.',
  rented: 'This property has already been rented.',
  pending: 'This property is awaiting approval and is not open for booking yet.',
  inactive: 'This property is no longer available.',
};

export function createBooking(userId: string, input: CreateBookingInput): Booking {
  const property = getPropertyById(input.property);
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  if (property.status !== 'active') {
    const message = UNAVAILABLE_MESSAGES[property.status] ?? 'Property is not available for booking';
    throw new AppError(400, message, 'PROPERTY_UNAVAILABLE');
  }
  if (input.type === 'visit' && !input.scheduledAt) {
    throw new AppError(400, 'scheduledAt is required for a visit', 'VALIDATION_ERROR');
  }
  const booking: Booking = {
    id: nextId('booking'),
    property: input.property,
    user: userId,
    type: input.type,
    scheduledAt: input.scheduledAt,
    status: 'pending',
    message: input.message,
    negotiation: [],
    createdAt: new Date().toISOString(),
  };
  store.bookings.push(booking);
  return booking;
}

export function listMyBookings(userId: string): BookingWithProperty[] {
  return store.bookings.filter((b) => b.user === userId).map(withProperty);
}

/** Whether this user has a confirmed (or completed) booking on this property — the
 * bar for revealing the owner's phone number on the property detail page. */
export function hasConfirmedBooking(userId: string, propertyId: string): boolean {
  return store.bookings.some(
    (b) =>
      b.user === userId &&
      b.property === propertyId &&
      (b.status === 'confirmed' || b.status === 'completed'),
  );
}

export function listOwnerBookings(ownerId: string): BookingWithProperty[] {
  const ownedIds = new Set(
    store.properties.filter((p) => p.ownerId === ownerId).map((p) => p.id),
  );
  return store.bookings.filter((b) => ownedIds.has(b.property)).map(withProperty);
}

export function updateStatus(
  bookingId: string,
  status: BookingStatus,
  actorId: string,
  isAdmin: boolean,
  ownerMessage?: string,
): Booking {
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  const property = getPropertyById(booking.property);
  const isOwner = property?.ownerId === actorId;
  if (!isAdmin && !isOwner) {
    throw new AppError(403, 'Only the listing owner can change this booking', 'FORBIDDEN');
  }
  booking.status = status;
  if (ownerMessage !== undefined) booking.ownerMessage = ownerMessage;
  booking.respondedAt = new Date().toISOString();
  return booking;
}

export function addNegotiation(
  bookingId: string,
  userId: string,
  amount: number,
  note: string | undefined,
  isAdmin: boolean,
): Booking {
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  const property = getPropertyById(booking.property);
  const isParticipant = booking.user === userId || property?.ownerId === userId || isAdmin;
  if (!isParticipant) {
    throw new AppError(403, 'You are not part of this negotiation', 'FORBIDDEN');
  }
  booking.negotiation.push({ by: userId, amount, note, at: new Date().toISOString() });
  return booking;
}

export function cancelBooking(bookingId: string, userId: string): Booking {
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  if (booking.user !== userId) {
    throw new AppError(403, 'You can only cancel your own bookings', 'FORBIDDEN');
  }
  if (booking.status === 'completed') {
    throw new AppError(400, 'Cannot cancel a completed booking', 'VALIDATION_ERROR');
  }
  booking.status = 'cancelled';
  return booking;
}
