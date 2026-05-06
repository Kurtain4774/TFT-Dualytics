import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client.js'

function useDebounced(value, delay = 200) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function usePlayerSearch(query) {
  const debounced = useDebounced(query, 200)
  const trimmed = debounced.trim()
  return useQuery({
    queryKey: ['playerSearch', trimmed],
    queryFn: () =>
      apiGet('/api/players/search', { params: { q: trimmed, limit: 8 } }),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
    keepPreviousData: true,
  })
}
