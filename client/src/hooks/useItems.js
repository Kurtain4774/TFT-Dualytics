import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export const useItems = () =>
  useQuery({
    queryKey: ['items'],
    queryFn: () => apiGet('/api/assets/items'),
    staleTime: Infinity,
  })
