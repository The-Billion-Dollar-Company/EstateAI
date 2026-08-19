import { GoogleGenerativeAI } from '@google/generative-ai';

import { env } from '@/config/env.js';
import type { Property } from '@/types/property.js';
import { logger } from '@/utils/logger.js';

let client: GoogleGenerativeAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY);
}

function getClient(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  client ??= new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return client;
}

function toCard(p: Property): string {
  return `[P:${p.id}] ${p.title} — ${p.type}, for ${p.listingType}, ৳${p.price.toLocaleString('en-IN')}${
    p.listingType === 'rent' ? '/mo' : ''
  }, ${p.beds} bed / ${p.baths} bath, ${p.location.area} ${p.location.city}`;
}

const PROPERTY_SYSTEM = [
  'You are EstateAI, a concise real-estate assistant for properties in Bangladesh.',
  'You may ONLY recommend properties from the provided list — never invent listings or ids.',
  'Cite every property you mention as [P:<id>] using the exact id given.',
  'Keep replies under 120 words, warm and specific. End by offering to refine by budget or area.',
  'If the list is empty, say nothing matches yet and ask one clarifying question.',
].join(' ');

const PDF_SYSTEM = [
  'You are EstateAI, a helpful real-estate assistant. The user has uploaded a PDF document.',
  'Answer questions based on the PDF content provided.',
  'Be clear, concise, and accurate. If the answer is not in the PDF, say so.',
  'You may also reference real estate knowledge about Bangladesh to supplement answers.',
].join(' ');

const PDF_RAG_SYSTEM = [
  'You are EstateAI, a helpful real-estate assistant. Below are the most relevant excerpts',
  'retrieved from a PDF the user uploaded, ranked by relevance to their question.',
  'Answer using ONLY these excerpts. If they do not contain the answer, say so plainly',
  'rather than guessing. Be clear and concise.',
].join(' ');

export async function generateGroundedReply(
  userMessage: string,
  properties: Property[],
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: PROPERTY_SYSTEM,
  });
  const context =
    properties.length > 0
      ? `Available listings:\n${properties.map(toCard).join('\n')}`
      : 'Available listings: (none matched)';
  const prompt = `${context}\n\nUser: ${userMessage}\n\nReply:`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) throw new Error('Empty Gemini response');
  logger.debug('Gemini property reply generated');
  return text;
}

export async function generatePdfReply(
  userMessage: string,
  pdfData: Buffer,
  pdfMimeType: string,
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: PDF_SYSTEM,
  });
  const result = await model.generateContent([
    {
      inlineData: {
        data: pdfData.toString('base64'),
        mimeType: pdfMimeType,
      },
    },
    `User question: ${userMessage}\n\nAnswer based on the document above:`,
  ]);
  const text = result.response.text().trim();
  if (!text) throw new Error('Empty Gemini PDF response');
  logger.debug('Gemini PDF reply generated');
  return text;
}

export async function generatePdfRagReply(userMessage: string, chunks: string[]): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: PDF_RAG_SYSTEM,
  });
  const context = chunks
    .map((c, i) => `Excerpt ${i + 1}:\n${c}`)
    .join('\n\n');
  const prompt = `${context}\n\nUser question: ${userMessage}\n\nAnswer based on the excerpts above:`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) throw new Error('Empty Gemini PDF RAG response');
  logger.debug('Gemini PDF RAG reply generated');
  return text;
}

export async function generateGeneralReply(userMessage: string): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction:
      'You are EstateAI, a friendly real estate assistant for Bangladesh. Answer questions about real estate, property buying/renting/selling, market trends, legal aspects, and general advice. Keep replies concise and helpful.',
  });
  const result = await model.generateContent(userMessage);
  const text = result.response.text().trim();
  if (!text) throw new Error('Empty Gemini response');
  return text;
}
