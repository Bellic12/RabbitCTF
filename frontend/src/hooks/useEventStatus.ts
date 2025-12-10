import { useState, useEffect } from 'react'

export type EventStatus = 'not_started' | 'active' | 'finished'

export interface EventConfig {
  status: EventStatus
  start_time: string | null
  end_time: string | null
}

export function useEventStatus() {
  const [config, setConfig] = useState<EventConfig | null>(null)

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/event/status?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setConfig(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data)) return prev
          return data
        })
      }
    } catch (error) {
      console.error('Failed to fetch event status', error)
    }
  }

  useEffect(() => {
    fetchConfig()
    const pollInterval = setInterval(fetchConfig, 5000)
    return () => clearInterval(pollInterval)
  }, [])

  return config
}
