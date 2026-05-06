import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export function useRateLimitStats() {
  return useQuery({
    queryKey: ['rateLimitStats'],
    queryFn: () => apiGet('/api/debug/ratelimit'),
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}
