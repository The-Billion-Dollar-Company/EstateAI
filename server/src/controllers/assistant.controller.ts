import type { RequestHandler } from 'express';

import * as assistantService from '@/services/assistant.service.js';
import { asyncHandler } from '@/utils/async-handler.js';

function sse(res: Parameters<RequestHandler>[1], event: object): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export const chat: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const message: string = req.body.message;
  const conversationId: string | undefined = req.body.conversationId;
  const pdfId: string | undefined = req.body.pdfId;

  const result = await assistantService.respond(message, pdfId);
  const conversation = userId
    ? assistantService.recordTurn(conversationId, userId, message, result, pdfId)
    : null;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const words = result.reply.split(' ');
  for (const word of words) {
    sse(res, { type: 'token', value: `${word} ` });
    await new Promise((r) => setTimeout(r, 10));
  }
  sse(res, { type: 'properties', value: result.properties });
  sse(res, { type: 'done', conversationId: conversation?.id ?? null, mode: result.mode });
  res.end();
});

export const listConversations: RequestHandler = asyncHandler(async (req, res) => {
  const data = assistantService.listConversations(req.user?.id ?? '');
  res.json({ success: true, data });
});

export const getConversation: RequestHandler = asyncHandler(async (req, res) => {
  const data = assistantService.getConversation(req.params.id ?? '', req.user?.id ?? '');
  res.json({ success: true, data });
});
