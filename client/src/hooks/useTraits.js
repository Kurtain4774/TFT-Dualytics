import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export const useTraits = () =>
  useQuery({
    queryKey: ['traits'],
    queryFn: () => apiGet('/api/assets/traits'),
    staleTime: Infinity,
  })
