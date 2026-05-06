import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export const useTopComps = (options = {}) =>
  useQuery({
    queryKey: ['topComps', options?.limit ?? null],
    queryFn: () =>
      apiGet('/api/comps', { params: options?.limit == null ? undefined : { limit: options.limit } }),
    staleTime: 0,
    refetchInterval: 10 * 60 * 1000,
  })
