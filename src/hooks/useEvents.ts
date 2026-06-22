import { useEffect, useState, useCallback } from 'react'
import { getEvents } from '../api/services'
import type { SecurityEvent } from '../types'

export function useEvents(limit = 50) {
  const [events,  setEvents]  = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getEvents(limit)
      setEvents(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { events, loading, error, refetch: fetch }
}
