import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

export const useLeaderboard = (region) =>
  useQuery({
    queryKey: ['leaderboard', region],
    queryFn: () => apiGet('/api/leaderboard', { params: { region } }),
    enabled: !!region,
    staleTime: 60 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data
      const pending = data?.refreshing || (data && data.entries?.length === 0)
      return pending ? 5_000 : false
    },
    refetchIntervalInBackground: true,
  })
