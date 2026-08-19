import { nextId, store } from '@/data/store.js';
import { indexProperty } from '@/services/rag.service.js';
import type { ListingType, Property, PropertyType, Review } from '@/types/property.js';

export interface PropertyQuery {
  q?: string;
  city?: string;
  type?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page: number;
  limit: number;
}

export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePropertyInput {
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
  amenities?: string[];
  images?: string[];
  documents?: string[];
  owner: { name: string; phone: string };
}

function matches(p: Property, query: PropertyQuery): boolean {
  if (query.q) {
    const q = query.q.toLowerCase();
    const haystack = `${p.title} ${p.description} ${p.location.area} ${p.location.city}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (query.city && p.location.city.toLowerCase() !== query.city.toLowerCase()) return false;
  if (query.type && p.type !== query.type) return false;
  if (query.listingType && p.listingType !== query.listingType) return false;
  if (query.minPrice !== undefined && p.price < query.minPrice) return false;
  if (query.maxPrice !== undefined && p.price > query.maxPrice) return false;
  if (query.beds !== undefined && p.beds < query.beds) return false;
  if (query.baths !== undefined && p.baths < query.baths) return false;
  return true;
}

export function listProperties(query: PropertyQuery): PropertyListResult {
  let items = store.properties.filter((p) => p.status === 'active' && matches(p, query));

  if (query.sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (query.sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
  else if (query.sort === 'rating') items = [...items].sort((a, b) => b.avgRating - a.avgRating);
  else items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = items.length;
  const start = (query.page - 1) * query.limit;
  return { items: items.slice(start, start + query.limit), total, page: query.page, limit: query.limit };
}

export function getPropertyById(id: string): Property | undefined {
  return store.properties.find((p) => p.id === id);
}

export function listPropertiesByOwner(ownerId: string): Property[] {
  return store.properties.filter((p) => p.ownerId === ownerId);
}

export function listAllProperties(): Property[] {
  return store.properties;
}

export function createProperty(input: CreatePropertyInput): Property {
  const { ownerId, amenities, images, documents, ...rest } = input;
  const property: Property = {
    id: nextId('property'),
    ownerId,
    ...rest,
    amenities: amenities ?? [],
    images: images ?? [],
    documents: documents ?? [],
    status: 'pending',
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
  store.properties.push(property);
  void indexProperty(property);
  return property;
}

export function updateProperty(id: string, patch: Partial<Omit<CreatePropertyInput, 'ownerId'>>): Property | undefined {
  const property = store.properties.find((p) => p.id === id);
  if (!property) return undefined;
  Object.assign(property, patch);
  void indexProperty(property);
  return property;
}

export function deleteProperty(id: string): boolean {
  const index = store.properties.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.properties.splice(index, 1);
  store.reviews = store.reviews.filter((r) => r.propertyId !== id);
  return true;
}

export function setPropertyStatus(id: string, status: Property['status']): Property | undefined {
  const property = store.properties.find((p) => p.id === id);
  if (!property) return undefined;
  property.status = status;
  return property;
}

export function addPropertyImages(id: string, images: string[]): Property | undefined {
  const property = store.properties.find((p) => p.id === id);
  if (!property) return undefined;
  property.images.push(...images);
  return property;
}

export function addPropertyDocuments(id: string, documents: string[]): Property | undefined {
  const property = store.properties.find((p) => p.id === id);
  if (!property) return undefined;
  property.documents.push(...documents);
  return property;
}

export function getReviewsForProperty(propertyId: string): Review[] {
  return store.reviews.filter((r) => r.propertyId === propertyId);
}

export function recomputeRating(propertyId: string): void {
  const property = store.properties.find((p) => p.id === propertyId);
  if (!property) return;
  const reviews = getReviewsForProperty(propertyId);
  property.reviewCount = reviews.length;
  property.avgRating =
    reviews.length === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
}
