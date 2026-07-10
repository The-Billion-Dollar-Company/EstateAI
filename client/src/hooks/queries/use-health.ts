import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { api, type ApiResponse } from '@/lib/api';

interface HealthStatus {
  status: string;
}

export function useHealth(): UseQueryResult<HealthStatus> {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<HealthStatus>>('/health');
      return res.data.data;
    },
    retry: 1,
  });
}
