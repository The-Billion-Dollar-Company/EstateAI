import mongoose from 'mongoose';

import { store } from '@/data/store.js';
import { embedText, isVoyageConfigured } from '@/services/embedding.service.js';
import type { Property } from '@/types/property.js';
import { logger } from '@/utils/logger.js';

const VECTOR_INDEX_NAME = 'property_vector_index';

export function buildEmbeddingText(p: Property): string {
  return [
    p.title,
    p.description,
    p.type,
    p.listingType === 'rent' ? 'for rent' : 'for sale',
    `${p.location.area}, ${p.location.city}`,
    `৳${p.price}`,
    `${p.beds} bed`,
    `${p.baths} bath`,
    ...p.amenities,
  ].join(' — ');
}

/** Embeds one property and mutates `property.embedding` in place. Never throws. */
export async function indexProperty(property: Property): Promise<void> {
  if (!isVoyageConfigured()) return;
  try {
    property.embedding = await embedText(buildEmbeddingText(property), 'document');
  } catch (err) {
    logger.warn({ err, propertyId: property.id }, 'Failed to embed property — leaving unindexed');
  }
}

/** Embeds every store property that doesn't have an embedding yet. Never throws. */
export async function backfillPropertyEmbeddings(): Promise<void> {
  if (!isVoyageConfigured()) return;
  const missing = store.properties.filter((p) => !p.embedding);
  if (missing.length === 0) return;
  logger.info(`Embedding ${missing.length} propert${missing.length === 1 ? 'y' : 'ies'} without a vector yet`);
  for (const property of missing) {
    await indexProperty(property);
  }
  logger.info('Property embedding backfill complete');
}

interface VectorFilters {
  type?: string;
  listingType?: string;
  city?: string;
  beds?: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Runs Atlas `$vectorSearch` against the `properties` collection. Returns `null`
 * (instead of throwing) whenever the vector path isn't usable — Voyage unconfigured,
 * DB not connected, or the `property_vector_index` search index doesn't exist yet —
 * so callers can fall back to keyword search.
 */
export async function vectorSearchProperties(
  queryText: string,
  filters: VectorFilters,
  limit: number,
): Promise<Property[] | null> {
  if (!isVoyageConfigured()) return null;
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return null;

  try {
    const queryVector = await embedText(queryText, 'query');
    const matchFilter: Record<string, unknown> = { status: 'active' };
    if (filters.type) matchFilter.type = filters.type;
    if (filters.listingType) matchFilter.listingType = filters.listingType;
    if (filters.city) matchFilter['location.city'] = new RegExp(`^${filters.city}$`, 'i');
    if (filters.beds !== undefined) matchFilter.beds = { $gte: filters.beds };
    // Price isn't a registered filter field on the Atlas Search index, so it can't go
    // in `filter` (Atlas rejects/ignores unindexed filter fields — sometimes with a
    // hard error, sometimes by silently returning zero hits). Over-fetch candidates
    // and apply the price bound in application code instead.
    const hasPriceBound = filters.minPrice !== undefined || filters.maxPrice !== undefined;

    const docs = await mongoose.connection.db
      .collection('properties')
      .aggregate([
        {
          $vectorSearch: {
            index: VECTOR_INDEX_NAME,
            path: 'embedding',
            queryVector,
            numCandidates: 100,
            limit: hasPriceBound ? Math.max(limit * 5, 20) : limit,
            filter: matchFilter,
          },
        },
        { $project: { _id: 0, embedding: 0 } },
      ])
      .toArray();

    const results = docs as unknown as Property[];
    const filtered = hasPriceBound
      ? results.filter(
          (p) =>
            (filters.minPrice === undefined || p.price >= filters.minPrice) &&
            (filters.maxPrice === undefined || p.price <= filters.maxPrice),
        )
      : results;
    return filtered.slice(0, limit);
  } catch (err) {
    logger.warn({ err }, 'Atlas $vectorSearch failed — falling back to keyword search');
    return null;
  }
}
