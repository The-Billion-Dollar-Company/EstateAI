import { store } from '@/data/store.js';
import { listAllProperties, setPropertyStatus } from '@/services/property.service.js';
import type { Property } from '@/types/property.js';
import { toPublicUser, type User } from '@/types/user.js';
import { AppError } from '@/utils/app-error.js';

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  activeListings: number;
  pendingApprovals: number;
  totalBookings: number;
  totalReviews: number;
  totalRevenue: number;
}

export function getStats(): AdminStats {
  const activeListings = store.properties.filter((p) => p.status === 'active');
  const confirmedBookings = store.bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
  return {
    totalUsers: store.users.filter((u) => u.role !== 'admin').length,
    totalOwners: store.users.filter((u) => u.role === 'owner').length,
    activeListings: activeListings.length,
    pendingApprovals: store.properties.filter((p) => p.status === 'pending').length,
    totalBookings: store.bookings.length,
    totalReviews: store.reviews.length,
    totalRevenue: confirmedBookings.length * 5000, // mock platform fee
  };
}

export function approveProperty(id: string): Property {
  const property = setPropertyStatus(id, 'active');
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  return property;
}

/** Rejecting a pending listing removes it outright — there's no "rejected" status to fall back to. */
export function rejectProperty(id: string): Property {
  const property = store.properties.find((p) => p.id === id);
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  store.properties = store.properties.filter((p) => p.id !== id);
  return property;
}

export function unpublishProperty(id: string): Property {
  const property = setPropertyStatus(id, 'inactive');
  if (!property) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  return property;
}

export function adminDeleteProperty(id: string): void {
  const index = store.properties.findIndex((p) => p.id === id);
  if (index === -1) throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  store.properties.splice(index, 1);
  store.reviews = store.reviews.filter((r) => r.propertyId !== id);
  store.bookings = store.bookings.filter((b) => b.property !== id);
}

export function listAllPropertiesAdmin(): Property[] {
  return listAllProperties();
}

export function listUsers(): User[] {
  return store.users.map(toPublicUser);
}

export function deleteUser(id: string): void {
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) throw new AppError(404, 'User not found', 'NOT_FOUND');
  const user = store.users[index];
  if (user?.role === 'admin') throw new AppError(400, 'Cannot delete an admin account', 'FORBIDDEN');
  store.users.splice(index, 1);
  // Clean up user's data
  store.properties = store.properties.filter((p) => p.ownerId !== id);
  store.bookings = store.bookings.filter((b) => b.user !== id);
  store.reviews = store.reviews.filter((r) => r.authorId !== id);
}
