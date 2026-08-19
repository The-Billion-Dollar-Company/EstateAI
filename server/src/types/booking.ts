export const BOOKING_TYPES = ['visit', 'reservation', 'purchase-request'] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface NegotiationEntry {
  by: string; // user id
  amount: number;
  note?: string;
  at: string; // ISO
}

export interface Booking {
  id: string;
  property: string; // property id
  user: string; // buyer id
  type: BookingType;
  scheduledAt?: string; // ISO, for visits
  status: BookingStatus;
  message?: string;
  ownerMessage?: string; // owner's reply when confirming or declining
  negotiation: NegotiationEntry[];
  createdAt: string;
  respondedAt?: string; // ISO, when owner confirmed/declined
}

/** Booking with a small populated property summary for list views. */
export interface BookingWithProperty extends Omit<Booking, 'property'> {
  property: {
    id: string;
    title: string;
    price: number;
    listingType: string;
    image?: string;
    city: string;
    area: string;
  };
  ownerContact?: { name: string; phone: string }; // revealed when confirmed
}
