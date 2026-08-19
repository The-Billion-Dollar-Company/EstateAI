import crypto from 'node:crypto';

import type { RequestHandler } from 'express';
import multer from 'multer';
import type { PDFParse as PDFParseType } from 'pdf-parse';

import { env } from '@/config/env.js';
import { embedTexts, isVoyageConfigured } from '@/services/embedding.service.js';
import { AppError } from '@/utils/app-error.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { logger } from '@/utils/logger.js';

export interface PdfChunk {
  text: string;
  embedding: number[];
}

// In-memory store for uploaded PDFs (keyed by pdfId, expires 1hr)
interface PdfEntry {
  data: Buffer;
  name: string;
  mimeType: string;
  expiresAt: number;
  /** Populated at upload time when text extraction + embedding succeed. */
  chunks: PdfChunk[];
}
const pdfStore = new Map<string, PdfEntry>();

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

/**
 * Extracts + embeds PDF text into chunks. Returns [] on any failure (extraction or Voyage).
 * pdf-parse is loaded dynamically: its pdfjs-dist dependency throws at module-evaluation
 * time on serverless runtimes lacking the optional `@napi-rs/canvas` native binding, and a
 * static import would crash the whole function on cold start instead of just this feature.
 */
async function buildPdfChunks(data: Buffer): Promise<PdfChunk[]> {
  if (!isVoyageConfigured()) return [];
  let parser: PDFParseType | undefined;
  try {
    const { PDFParse } = await import('pdf-parse');
    parser = new PDFParse({ data });
    const { text } = await parser.getText();
    const pieces = chunkText(text);
    if (pieces.length === 0) return [];
    const embeddings = await embedTexts(pieces, 'document');
    return pieces.map((piece, i) => ({ text: piece, embedding: embeddings[i]! }));
  } catch (err) {
    logger.warn({ err }, 'PDF text extraction/embedding failed — will answer from the raw document instead');
    return [];
  } finally {
    await parser?.destroy();
  }
}

function cleanExpiredPdfs(): void {
  const now = Date.now();
  for (const [id, entry] of pdfStore.entries()) {
    if (entry.expiresAt < now) pdfStore.delete(id);
  }
}

export function getPdfEntry(pdfId: string): PdfEntry | undefined {
  cleanExpiredPdfs();
  return pdfStore.get(pdfId);
}

const memStorage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage: memStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed'));
  },
});

/** Returns a Cloudinary signed upload signature so the client can upload directly. */
export const getCloudinarySignature: RequestHandler = asyncHandler(async (_req, res) => {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_CLOUD_NAME) {
    throw new AppError(503, 'Cloudinary is not configured', 'SERVICE_UNAVAILABLE');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'estateai';
  const toSign = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');
  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    },
  });
});

/** Receives a PDF, stores it in memory, and returns a pdfId for use in AI chat. */
export const uploadPdf: RequestHandler = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new AppError(400, 'No PDF file provided', 'VALIDATION_ERROR');
  if (file.mimetype !== 'application/pdf') {
    throw new AppError(400, 'Only PDF files are accepted here', 'VALIDATION_ERROR');
  }
  cleanExpiredPdfs();
  const pdfId = crypto.randomUUID();
  const chunks = await buildPdfChunks(file.buffer);
  pdfStore.set(pdfId, {
    data: file.buffer,
    name: file.originalname,
    mimeType: file.mimetype,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    chunks,
  });
  res.json({
    success: true,
    data: { pdfId, filename: file.originalname, sizeBytes: file.size },
  });
});
