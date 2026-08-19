import { Router } from 'express';
import { z } from 'zod';

import { chat, getConversation, listConversations } from '@/controllers/assistant.controller.js';
import { optionalAuth, requireAuth } from '@/middleware/auth.js';
import { assistantLimiter } from '@/middleware/rate-limiter.js';
import { validate } from '@/middleware/validate.js';

const chatSchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(2000),
  pdfId: z.string().uuid().optional(),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

export const assistantRouter = Router();

// Chat is public (promoted on the landing page); it persists history only when a
// valid token is present. Conversation history is per-user, so it requires auth.
assistantRouter.post('/chat', assistantLimiter, optionalAuth, validate({ body: chatSchema }), chat);
assistantRouter.get('/conversations', requireAuth, listConversations);
assistantRouter.get(
  '/conversations/:id',
  requireAuth,
  validate({ params: idParamsSchema }),
  getConversation,
);
