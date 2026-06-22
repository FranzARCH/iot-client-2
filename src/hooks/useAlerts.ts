import { useEffect, useState, useCallback } from 'react'
import { getAlerts, acknowledgeAlert } from '../api/services'
import type { Alert } from '../types'

export function useAlerts() {
  const [alerts,  setAlerts]  = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getAlerts()
      setAlerts(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  const ack = useCallback(async (id: string) => {
    await acknowledgeAlert(id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { alerts, loading, error, acknowledge: ack, refetch: fetch }
}
