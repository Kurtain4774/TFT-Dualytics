import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export const useChampions = () =>
  useQuery({
    queryKey: ['champions'],
    queryFn: () => apiGet('/api/assets/champions'),
    staleTime: Infinity,
  })
