import { Router } from 'express';
import { z } from 'zod';

import {
  adminDeleteProperty,
  approveProperty,
  deleteUser,
  getStats,
  listAllProperties,
  listUsers,
  rejectProperty,
  unpublishProperty,
} from '@/controllers/admin.controller.js';
import { requireAuth, requireRole } from '@/middleware/auth.js';
import { validate } from '@/middleware/validate.js';

const idParamsSchema = z.object({ id: z.string().min(1) });

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/stats', getStats);
adminRouter.get('/properties', listAllProperties);
adminRouter.get('/users', listUsers);
adminRouter.patch('/properties/:id/approve', validate({ params: idParamsSchema }), approveProperty);
adminRouter.patch('/properties/:id/reject', validate({ params: idParamsSchema }), rejectProperty);
adminRouter.patch('/properties/:id/unpublish', validate({ params: idParamsSchema }), unpublishProperty);
adminRouter.delete('/properties/:id', validate({ params: idParamsSchema }), adminDeleteProperty);
adminRouter.delete('/users/:id', validate({ params: idParamsSchema }), deleteUser);
