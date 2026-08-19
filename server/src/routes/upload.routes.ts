import { Router } from 'express';

import {
  getCloudinarySignature,
  uploadMiddleware,
  uploadPdf,
} from '@/controllers/upload.controller.js';
import { requireAuth } from '@/middleware/auth.js';

export const uploadRouter = Router();

uploadRouter.use(requireAuth);

// GET /api/v1/upload/signature — returns Cloudinary signed params for direct upload
uploadRouter.get('/signature', getCloudinarySignature);

// POST /api/v1/upload/pdf — accepts a PDF and returns a pdfId for AI chat
uploadRouter.post('/pdf', uploadMiddleware.single('file'), uploadPdf);
