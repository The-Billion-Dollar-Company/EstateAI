import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types/user';

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  location?: string;
  facebookId?: string;
}

export function useUpdateProfile(): UseMutationResult<User, unknown, UpdateProfileInput> {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const res = await api.patch<ApiResponse<User>>('/users/me', input);
      return res.data.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
