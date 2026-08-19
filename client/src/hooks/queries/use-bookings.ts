import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';

export interface BookingProperty {
  id: string;
  title: string;
  price: number;
  listingType: string;
  image?: string;
  city: string;
  area: string;
}

export interface Booking {
  id: string;
  property: BookingProperty;
  user: string;
  type: 'visit' | 'reservation' | 'purchase-request';
  scheduledAt?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  ownerMessage?: string;
  respondedAt?: string;
  ownerContact?: { name: string; phone: string };
  negotiation: Array<{ by: string; amount: number; note?: string; at: string }>;
  createdAt: string;
}

export interface CreateBookingInput {
  property: string;
  type: 'visit' | 'reservation' | 'purchase-request';
  scheduledAt?: string;
  message?: string;
}

export function useMyBookings(enabled = true): UseQueryResult<Booking[]> {
  return useQuery({
    queryKey: ['bookings', 'mine'],
    enabled,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/bookings/mine');
      return res.data.data;
    },
  });
}

export function useOwnerBookings(enabled = true): UseQueryResult<Booking[]> {
  return useQuery({
    queryKey: ['bookings', 'owner'],
    enabled,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/bookings/owner');
      return res.data.data;
    },
  });
}

export function useCreateBooking(): UseMutationResult<Booking, unknown, CreateBookingInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const res = await api.post<ApiResponse<Booking>>('/bookings', input);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBookingStatus(): UseMutationResult<
  Booking,
  unknown,
  { id: string; status: 'confirmed' | 'cancelled' | 'completed'; ownerMessage?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, ownerMessage }) => {
      const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status, ownerMessage });
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking(): UseMutationResult<Booking, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
