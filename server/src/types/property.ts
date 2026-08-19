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
  owner: { name: string; phone: string };
  createdAt: string;
  /** Voyage embedding of `buildEmbeddingText(property)`; absent until indexed. */
  embedding?: number[];
}

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  /** Internal: author's user id, used for ownership checks (not sent to clients). */
  authorId?: string;
}
