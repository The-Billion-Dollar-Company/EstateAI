import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';
import type { Property, PropertyStatus, Review } from '@/types/property';

export interface CreatePropertyInput {
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  location: { address: string; city: string; area: string };
  beds: number;
  baths: number;
  sizeSqft: number;
  amenities?: string[];
  images?: string[];
}

export interface PropertyListParams {
  q?: string;
  city?: string;
  type?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PropertyListData {
  items: Property[];
  total: number;
}

export function useProperties(params: PropertyListParams = {}): UseQueryResult<PropertyListData> {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property[]>>('/properties', { params });
      return {
        items: res.data.data,
        total: (res.data.meta?.total as number | undefined) ?? res.data.data.length,
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** The signed-in owner's own listings (all statuses, incl. pending). */
export function useMyProperties(enabled = true): UseQueryResult<Property[]> {
  return useQuery({
    queryKey: ['properties', 'mine'],
    enabled,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property[]>>('/properties/mine');
      return res.data.data;
    },
  });
}

export function useCreateProperty(): UseMutationResult<Property, unknown, CreatePropertyInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePropertyInput) => {
      const res = await api.post<ApiResponse<Property>>('/properties', input);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty(id: string): UseMutationResult<Property, unknown, Partial<CreatePropertyInput>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CreatePropertyInput>) => {
      const res = await api.patch<ApiResponse<Property>>(`/properties/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: ['property', id] });
    },
  });
}

export function useProperty(id: string | undefined): UseQueryResult<Property> {
  return useQuery({
    queryKey: ['property', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      return res.data.data;
    },
  });
}

export function usePropertyReviews(id: string | undefined): UseQueryResult<Review[]> {
  return useQuery({
    queryKey: ['property-reviews', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Review[]>>(`/properties/${id}/reviews`);
      return res.data.data;
    },
  });
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
}

export function useCreateReview(
  propertyId: string,
): UseMutationResult<Review, unknown, CreateReviewInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const res = await api.post<ApiResponse<Review>>(`/properties/${propertyId}/reviews`, input);
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      void queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteReview(
  propertyId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      void queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useSetPropertyStatus(
  id: string,
): UseMutationResult<Property, unknown, PropertyStatus> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: PropertyStatus) => {
      const res = await api.patch<ApiResponse<Property>>(`/properties/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['property', id] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
