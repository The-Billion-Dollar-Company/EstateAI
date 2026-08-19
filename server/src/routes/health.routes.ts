import { Router } from 'express';

import { asyncHandler } from '@/utils/async-handler.js';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  }),
);
