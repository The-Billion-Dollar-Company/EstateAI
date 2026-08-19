import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';
import type { Property } from '@/types/property';
import type { User } from '@/types/user';

export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  activeListings: number;
  pendingApprovals: number;
  totalBookings: number;
  totalReviews: number;
  totalRevenue: number;
}

export function useAdminStats(): UseQueryResult<AdminStats> {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
      return res.data.data;
    },
  });
}

export function useAdminProperties(): UseQueryResult<Property[]> {
  return useQuery({
    queryKey: ['admin', 'properties'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property[]>>('/admin/properties');
      return res.data.data;
    },
  });
}

export function useAdminUsers(): UseQueryResult<User[]> {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>('/admin/users');
      return res.data.data;
    },
  });
}

export function useApproveProperty(): UseMutationResult<Property, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}/approve`);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useRejectProperty(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/properties/${id}/reject`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUnpublishProperty(): UseMutationResult<Property, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<Property>>(`/admin/properties/${id}/unpublish`);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useAdminDeleteProperty(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/properties/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteUser(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
