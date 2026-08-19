import type { RequestHandler } from 'express';

import { issueSession } from '@/controllers/auth.controller.js';
import * as userService from '@/services/user.service.js';
import { asyncHandler } from '@/utils/async-handler.js';

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  const user = userService.updateProfile(req.user?.id ?? '', req.body);
  res.json({ success: true, data: user });
});

/** Upgrades the current user to owner and re-issues a session with the new role. */
export const becomeOwner: RequestHandler = asyncHandler(async (req, res) => {
  const user = userService.becomeOwner(req.user?.id ?? '');
  res.json({ success: true, data: issueSession(res, user) });
});

export const toggleSaved: RequestHandler = asyncHandler(async (req, res) => {
  const savedProperties = userService.toggleSaved(req.user?.id ?? '', req.params.propertyId ?? '');
  res.json({ success: true, data: { savedProperties } });
});
