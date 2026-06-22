import { useEffect, useState, useCallback } from 'react'
import { getSensors } from '../api/services'
import type { Sensor } from '../types'

export function useSensors(pollInterval = 8000) {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getSensors()
      setSensors(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, pollInterval)
    return () => clearInterval(id)
    // Al integrar Supabase reemplaza el setInterval por subscribeToSensors(...)
  }, [fetch, pollInterval])

  return { sensors, loading, error, refetch: fetch }
}
