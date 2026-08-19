import type { RequestHandler } from 'express';

import { toPublicProperty } from '@/controllers/property.controller.js';
import * as adminService from '@/services/admin.service.js';
import { asyncHandler } from '@/utils/async-handler.js';

export const unpublishProperty: RequestHandler = asyncHandler(async (req, res) => {
  const property = adminService.unpublishProperty(req.params.id ?? '');
  res.json({ success: true, data: property ? toPublicProperty(property) : property });
});

export const adminDeleteProperty: RequestHandler = asyncHandler(async (req, res) => {
  adminService.adminDeleteProperty(req.params.id ?? '');
  res.json({ success: true, data: { id: req.params.id } });
});

export const getStats: RequestHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: adminService.getStats() });
});

export const approveProperty: RequestHandler = asyncHandler(async (req, res) => {
  const property = adminService.approveProperty(req.params.id ?? '');
  res.json({ success: true, data: property ? toPublicProperty(property) : property });
});

export const rejectProperty: RequestHandler = asyncHandler(async (req, res) => {
  adminService.rejectProperty(req.params.id ?? '');
  res.json({ success: true, data: { id: req.params.id } });
});

export const listAllProperties: RequestHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: adminService.listAllPropertiesAdmin().map(toPublicProperty) });
});

export const listUsers: RequestHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: adminService.listUsers() });
});

export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  adminService.deleteUser(req.params.id ?? '');
  res.json({ success: true, data: { id: req.params.id } });
});
