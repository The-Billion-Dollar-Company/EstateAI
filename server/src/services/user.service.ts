import { store } from '@/data/store.js';
import { getPropertyById } from '@/services/property.service.js';
import { toPublicUser, type User } from '@/types/user.js';
import { AppError } from '@/utils/app-error.js';

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  location?: string;
  facebookId?: string;
}

export function updateProfile(userId: string, patch: UpdateProfileInput): User {
  const record = store.users.find((u) => u.id === userId);
  if (!record) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (patch.name !== undefined) record.name = patch.name;
  if (patch.phone !== undefined) record.phone = patch.phone;
  if (patch.avatar !== undefined) record.avatar = patch.avatar;
  if (patch.location !== undefined) record.location = patch.location;
  if (patch.facebookId !== undefined) record.facebookId = patch.facebookId;
  return toPublicUser(record);
}

/** Upgrades a buyer to an owner so they can list properties. Idempotent for owners. */
export function becomeOwner(userId: string): User {
  const record = store.users.find((u) => u.id === userId);
  if (!record) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (record.role === 'buyer') record.role = 'owner';
  // admins keep their role; owners are already owners.
  return toPublicUser(record);
}

/** Toggles a property in the user's saved list; returns the new list. */
export function toggleSaved(userId: string, propertyId: string): string[] {
  const record = store.users.find((u) => u.id === userId);
  if (!record) throw new AppError(404, 'User not found', 'NOT_FOUND');
  if (!getPropertyById(propertyId)) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }
  const index = record.savedProperties.indexOf(propertyId);
  if (index === -1) record.savedProperties.push(propertyId);
  else record.savedProperties.splice(index, 1);
  return record.savedProperties;
}
