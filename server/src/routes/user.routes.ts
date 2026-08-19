import { Router } from 'express';
import { z } from 'zod';

import { becomeOwner, toggleSaved, updateMe } from '@/controllers/user.controller.js';
import { requireAuth } from '@/middleware/auth.js';
import { validate } from '@/middleware/validate.js';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  avatar: z.string().url().optional(),
  location: z.string().trim().max(200).optional(),
  facebookId: z.string().trim().max(200).optional(),
});

const savedParamsSchema = z.object({ propertyId: z.string().min(1) });

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.patch('/me', validate({ body: updateProfileSchema }), updateMe);
userRouter.post('/me/become-owner', becomeOwner);
userRouter.post('/me/saved/:propertyId', validate({ params: savedParamsSchema }), toggleSaved);
