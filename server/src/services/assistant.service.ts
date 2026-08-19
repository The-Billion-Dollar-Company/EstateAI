import {
  generateGeneralReply,
  generateGroundedReply,
  generatePdfReply,
  generatePdfRagReply,
  isGeminiConfigured,
} from '@/config/gemini.js';
import { getPdfEntry } from '@/controllers/upload.controller.js';
import { nextId, store, type Conversation } from '@/data/store.js';
import { cosineSimilarity, embedText, isVoyageConfigured } from '@/services/embedding.service.js';
import { listProperties } from '@/services/property.service.js';
import { vectorSearchProperties } from '@/services/rag.service.js';
import type { Property } from '@/types/property.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export interface RetrievalResult {
  reply: string;
  properties: Property[];
  mode: 'property' | 'pdf' | 'general';
}

const CITY_HINTS = [
  'dhaka',
  'chattogram',
  'gulshan',
  'dhanmondi',
  'uttara',
  'banani',
  'bashundhara',
  'mirpur',
  'mohakhali',
  'purbachal',
];

interface ExtractedFilters {
  listingType?: 'rent' | 'sale';
  type?: 'apartment' | 'house' | 'land' | 'commercial';
  city?: string;
  beds?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Whatever's left of the message after stripping structural words — the actual
   * area/building/street name (e.g. "alomnogor", "savar"), which CITY_HINTS below
   * can never fully enumerate. Used to rank keyword-fallback candidates. */
  keywords: string[];
}

// Words already captured by a structured filter above, or too generic to search on —
// stripped out so what's left is the actual distinguishing location/building text.
const NOISE_WORDS = new Set([
  'a', 'an', 'the', 'in', 'at', 'near', 'for', 'of', 'with', 'to', 'is', 'are', 'i',
  'want', 'looking', 'find', 'me', 'please', 'show', 'need', 'some', 'any', 'and',
  'apartment', 'apartments', 'flat', 'flats', 'house', 'houses', 'duplex', 'villa',
  'land', 'plot', 'commercial', 'office', 'shop', 'property', 'properties', 'listing',
  'rent', 'rental', 'buy', 'sale', 'purchase', 'sell', 'bed', 'beds', 'bedroom', 'bedrooms',
  'under', 'below', 'over', 'above', 'less', 'more', 'than', 'up', 'within', 'max',
  'maximum', 'min', 'minimum', 'at', 'least', 'starting', 'from', 'between', 'and', 'k',
  'thousand', 'lakh', 'lac', 'crore', 'tk', 'bdt',
]);

/** The actual location/building text left over once structural filter words are stripped. */
function extractKeywords(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w) && !NOISE_WORDS.has(w));
}

// Bangladeshi price shorthand: 40k = 40,000; 50 lakh/lac = 5,000,000; 1 crore = 10,000,000.
const AMOUNT_UNITS: Record<string, number> = { k: 1_000, thousand: 1_000, lakh: 100_000, lac: 100_000, crore: 10_000_000 };
const CURRENCY = '(?:৳|tk\\.?|bdt)?';
const AMOUNT = `${CURRENCY}\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\s*(k|thousand|lakh|lac|crore)?`;

function parseAmount(digits: string, unit?: string): number {
  const n = Number(digits.replace(/,/g, ''));
  return unit ? n * (AMOUNT_UNITS[unit.toLowerCase()] ?? 1) : n;
}

const MAX_PRICE_RE = new RegExp(`\\b(?:under|below|less than|up ?to|within|max(?:imum)?)\\s*${AMOUNT}`, 'i');
const MIN_PRICE_RE = new RegExp(`\\b(?:over|above|more than|at least|min(?:imum)?|starting (?:from|at))\\s*${AMOUNT}`, 'i');
const BETWEEN_PRICE_RE = new RegExp(`\\bbetween\\s*${AMOUNT}\\s*(?:and|-|to)\\s*${AMOUNT}\\b`, 'i');

/** Pulls a budget (min/max price) out of phrases like "under 40k" or "between 20000 and 50000". */
function extractPriceRange(text: string): { minPrice?: number; maxPrice?: number } {
  const between = BETWEEN_PRICE_RE.exec(text);
  if (between) {
    const a = parseAmount(between[1] ?? '', between[2]);
    const b = parseAmount(between[3] ?? '', between[4]);
    return { minPrice: Math.min(a, b), maxPrice: Math.max(a, b) };
  }
  const max = MAX_PRICE_RE.exec(text);
  const min = MIN_PRICE_RE.exec(text);
  return {
    maxPrice: max ? parseAmount(max[1] ?? '', max[2]) : undefined,
    minPrice: min ? parseAmount(min[1] ?? '', min[2]) : undefined,
  };
}

function extractFilters(message: string): ExtractedFilters {
  const text = message.toLowerCase();
  const listingType = /\brent(al)?\b/.test(text)
    ? 'rent'
    : /\b(buy|sale|purchase|sell)\b/.test(text)
      ? 'sale'
      : undefined;
  const type = /\bapartment|flat\b/.test(text)
    ? 'apartment'
    : /\bhouse|duplex|villa\b/.test(text)
      ? 'house'
      : /\bland|plot\b/.test(text)
        ? 'land'
        : /\bcommercial|office|shop\b/.test(text)
          ? 'commercial'
          : undefined;
  const city = CITY_HINTS.find((c) => text.includes(c));
  const bedsMatch = /(\d+)\s*(?:-|\s)?bed/.exec(text);
  const beds = bedsMatch ? Number(bedsMatch[1]) : undefined;
  const { minPrice, maxPrice } = extractPriceRange(text);
  const keywords = extractKeywords(text);
  return { listingType, type, city, beds, minPrice, maxPrice, keywords };
}

/**
 * Keyword-filter retrieval — used whenever Atlas `$vectorSearch` isn't usable. Applies
 * the structured filters (type/rent-sale/beds/price) via listProperties(), then ranks
 * that candidate pool by how many of the message's leftover keywords (the actual area/
 * building name — "alomnogor", "savar", anything CITY_HINTS doesn't know about) appear
 * anywhere in each property's title/description/area/city, instead of requiring an
 * exact hardcoded city match.
 */
function keywordRetrieve(filters: ExtractedFilters): Property[] {
  const { items } = listProperties({
    listingType: filters.listingType,
    type: filters.type,
    beds: filters.beds,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: 'rating',
    page: 1,
    limit: 50,
  });

  let ranked = items;
  if (filters.keywords.length > 0) {
    const scored = items
      .map((p) => {
        const haystack = `${p.title} ${p.description} ${p.location.area} ${p.location.city}`.toLowerCase();
        const hits = filters.keywords.filter((k) => haystack.includes(k)).length;
        return { p, hits };
      })
      .filter((x) => x.hits > 0)
      .sort((a, b) => b.hits - a.hits);
    if (scored.length > 0) ranked = scored.map((x) => x.p);
  }

  // listProperties() reads straight from the in-memory store, which now carries the
  // Voyage embedding vector on each property — never let that reach the client.
  return ranked.slice(0, 3).map(({ embedding: _embedding, ...rest }) => rest);
}

function toReply(items: Property[]): RetrievalResult {
  if (items.length === 0) {
    return {
      reply:
        "I couldn't find active listings matching that yet. Try widening the budget or area, or tell me the city and number of bedrooms you have in mind.",
      properties: [],
      mode: 'property',
    };
  }
  const citations = items.map((p) => `[P:${p.id}]`).join(' ');
  const lead =
    items.length === 1
      ? 'Here is a listing that matches what you described.'
      : `Here are ${items.length} listings that match what you described.`;
  return { reply: `${lead} ${citations} Want me to narrow by budget or area?`, properties: items, mode: 'property' };
}

export async function retrieve(message: string): Promise<RetrievalResult> {
  const filters = extractFilters(message);
  const vectorItems = await vectorSearchProperties(message, filters, 3);
  // An empty array isn't necessarily "no matches" — it can also mean the vector path
  // hit something it couldn't handle (e.g. an unindexed filter field) and Atlas
  // silently returned zero hits instead of erroring. Only trust it when non-empty;
  // otherwise double-check with the keyword path before telling the user there's
  // nothing available.
  const items = vectorItems && vectorItems.length > 0 ? vectorItems : keywordRetrieve(filters);
  if (vectorItems && vectorItems.length > 0) {
    logger.debug({ count: vectorItems.length }, 'Assistant retrieval via Atlas $vectorSearch');
  }
  return toReply(items);
}

export async function respond(message: string, pdfId?: string): Promise<RetrievalResult> {
  // PDF mode: answer questions based on uploaded document
  if (pdfId) {
    const pdfEntry = getPdfEntry(pdfId);
    if (!pdfEntry) {
      return {
        reply: 'The PDF you referenced has expired or was not found. Please upload it again.',
        properties: [],
        mode: 'pdf',
      };
    }
    if (!isGeminiConfigured()) {
      return {
        reply: 'AI PDF analysis is not configured. Please set GEMINI_API_KEY to use this feature.',
        properties: [],
        mode: 'pdf',
      };
    }
    try {
      // Chunk-retrieve when the PDF was embedded at upload time; otherwise fall
      // back to sending the whole document, same as before.
      if (pdfEntry.chunks.length > 0 && isVoyageConfigured()) {
        const questionVector = await embedText(message, 'query');
        const ranked = [...pdfEntry.chunks]
          .map((chunk) => ({ chunk, score: cosineSimilarity(questionVector, chunk.embedding) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((r) => r.chunk.text);
        const reply = await generatePdfRagReply(message, ranked);
        return { reply, properties: [], mode: 'pdf' };
      }
      const reply = await generatePdfReply(message, pdfEntry.data, pdfEntry.mimeType);
      return { reply, properties: [], mode: 'pdf' };
    } catch (err) {
      logger.warn({ err }, 'Gemini PDF generation failed');
      return {
        reply: 'Sorry, I had trouble reading the PDF. Please try again.',
        properties: [],
        mode: 'pdf',
      };
    }
  }

  // Property search mode
  const isPropertyQuery = /\b(apartment|house|flat|property|propert|room|land|plot|office|commercial|bed|bath|rent|sale|buy|purchase|listing|price|location|area|city)\b/i.test(message);
  const result = await retrieve(message);

  if (!isGeminiConfigured()) return result;

  try {
    if (isPropertyQuery || result.properties.length > 0) {
      const reply = await generateGroundedReply(message, result.properties);
      return { ...result, reply };
    } else {
      const reply = await generateGeneralReply(message);
      return { reply, properties: [], mode: 'general' };
    }
  } catch (err) {
    logger.warn({ err }, 'Gemini generation failed — using fallback');
    return result;
  }
}

export function createConversation(userId: string): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: nextId('conversation'),
    user: userId,
    messages: [],
    preferences: {},
    createdAt: now,
    updatedAt: now,
  };
  store.conversations.push(conversation);
  return conversation;
}

export function getConversation(id: string, userId: string): Conversation {
  const conversation = store.conversations.find((c) => c.id === id && c.user === userId);
  if (!conversation) throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
  return conversation;
}

export function listConversations(userId: string): Conversation[] {
  return store.conversations.filter((c) => c.user === userId);
}

export function recordTurn(
  conversationId: string | undefined,
  userId: string,
  userMessage: string,
  result: RetrievalResult,
  pdfId?: string,
): Conversation {
  const conversation = conversationId
    ? getConversation(conversationId, userId)
    : createConversation(userId);
  const at = new Date().toISOString();
  conversation.messages.push({ role: 'user', content: userMessage, at });
  conversation.messages.push({
    role: 'assistant',
    content: result.reply,
    propertyRefs: result.properties.map((p) => p.id),
    at,
  });
  if (pdfId) conversation.preferences.pdfId = pdfId;
  conversation.updatedAt = at;
  return conversation;
}
