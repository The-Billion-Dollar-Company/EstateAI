import crypto from 'node:crypto';

import { MOCK_PROPERTIES, MOCK_REVIEWS } from '@/data/seed-properties.js';
import type { Booking } from '@/types/booking.js';
import type { Property, Review } from '@/types/property.js';
import type { UserRecord } from '@/types/user.js';

/**
 * In-memory data store. This is the single source of truth for the API today and
 * the ONLY module that owns persistence — services read/write it, nothing else.
 * When MongoDB Atlas is configured, replace the collections with Mongoose models
 * and the service functions with queries; routes/controllers stay untouched.
 */
export interface Conversation {
  id: string;
  user: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    propertyRefs?: string[];
    at: string;
  }[];
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  users: UserRecord[];
  properties: Property[];
  reviews: Review[];
  bookings: Booking[];
  conversations: Conversation[];
  sequences: Record<string, number>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

// Demo accounts so protected routes are usable out of the box. All share the
// password "password123". The hash is bcrypt cost 12 (matches auth.service).
// Replace/remove once real registration data exists.
const DEMO_PASSWORD_HASH = '$2b$12$sQ06.zY8zRXe6n6LS/T/a.90CbCgoSOgdR9KXCe3wzPQJmQygpG5y';

function seedUsers(): UserRecord[] {
  const now = new Date('2026-01-01T00:00:00.000Z').toISOString();
  return [
    {
      id: 'u1',
      name: 'Admin',
      email: 'admin@estateai.test',
      role: 'admin',
      savedProperties: [],
      createdAt: now,
      passwordHash: DEMO_PASSWORD_HASH,
    },
    {
      id: 'u2',
      name: 'Rahim Chowdhury', // matches a seed property owner → owns listings
      email: 'owner@estateai.test',
      role: 'owner',
      phone: '+880 17 1234 5678',
      savedProperties: [],
      createdAt: now,
      passwordHash: DEMO_PASSWORD_HASH,
    },
    {
      id: 'u3',
      name: 'Demo Buyer',
      email: 'buyer@estateai.test',
      role: 'buyer',
      savedProperties: [],
      createdAt: now,
      passwordHash: DEMO_PASSWORD_HASH,
    },
  ];
}

function seed(): Store {
  return {
    users: seedUsers(),
    properties: clone(MOCK_PROPERTIES),
    reviews: clone(MOCK_REVIEWS),
    bookings: [],
    conversations: [],
    sequences: { property: MOCK_PROPERTIES.length, review: MOCK_REVIEWS.length, user: 3, booking: 0, conversation: 0 },
  };
}

export const store: Store = seed();

/** Reset the store to its seeded state (used by tests via beforeEach). */
export function resetStore(): void {
  const fresh = seed();
  store.users = fresh.users;
  store.properties = fresh.properties;
  store.reviews = fresh.reviews;
  store.bookings = fresh.bookings;
  store.conversations = fresh.conversations;
  store.sequences = fresh.sequences;
}

/**
 * Id generator per collection, e.g. `p3f9a2b7c`, `ub4e19d02`. The suffix is random
 * rather than the sequence counter itself: multiple serverless containers each run
 * their own copy of this store with no shared counter, so a purely sequential suffix
 * lets two containers hand the same id to two different real records. Random suffixes
 * make that collision practically impossible regardless of how many containers are
 * generating ids concurrently. `store.sequences` is still tracked (harmless bookkeeping
 * persisted alongside the collections) but no longer feeds the id itself.
 */
export function nextId(collection: 'property' | 'review' | 'user' | 'booking' | 'conversation'): string {
  const prefix = { property: 'p', review: 'r', user: 'u', booking: 'b', conversation: 'c' }[collection];
  store.sequences[collection] = (store.sequences[collection] ?? 0) + 1;
  return `${prefix}${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
