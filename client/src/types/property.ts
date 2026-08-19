export const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ['sale', 'rent'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const PROPERTY_STATUSES = ['active', 'pending', 'sold', 'rented', 'inactive'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  location: { address: string; city: string; area: string };
  beds: number;
  baths: number;
  sizeSqft: number;
  amenities: string[];
  images: string[];
  documents: string[];
  status: PropertyStatus;
  avgRating: number;
  reviewCount: number;
  /** Only the name is ever public — the phone number is a separate, gated field. */
  owner: { name: string };
  /** Present only once the viewer has earned it: the owner themselves, an admin, or a
   * buyer with a confirmed booking on this listing. */
  ownerContact?: { name: string; phone: string };
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  /** Whether the current viewer wrote this review — enough to offer a delete button
   * without the server ever revealing who wrote anyone else's. */
  isMine: boolean;
}
