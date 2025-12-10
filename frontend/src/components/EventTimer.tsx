import { useState, useEffect } from 'react'

type EventStatus = 'not_started' | 'active' | 'ended' | 'finished'

interface EventConfig {
  status: EventStatus
  start_time: string | null
  end_time: string | null
}

export default function EventTimer() {
  const [config, setConfig] = useState<EventConfig | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [isUrgent, setIsUrgent] = useState(false)

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/event/status`)
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch event status', error)
    }
  }

  useEffect(() => {
    fetchConfig()
    // Poll every minute to sync with server
    const pollInterval = setInterval(fetchConfig, 60000)
    return () => clearInterval(pollInterval)
  }, [])

  useEffect(() => {
    if (!config) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      let targetDate: number | null = null
      let mode: 'starting' | 'ending' | 'ended' = 'ended'

      if (config.status === 'not_started' && config.start_time) {
        targetDate = new Date(config.start_time).getTime()
        mode = 'starting'
      } else if (config.status === 'active' && config.end_time) {
        targetDate = new Date(config.end_time).getTime()
        mode = 'ending'
      }

      if (!targetDate) {
        setTimeLeft('')
        return
      }

      const difference = targetDate - now

      if (difference <= 0) {
        // Time is up, refresh config to get new status
        fetchConfig()
        return
      }

      // Calculate time components
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      // Format output
      let timeString = ''
      if (days > 0) timeString += `${days}d `
      timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      
      setTimeLeft(timeString)
      
      if (mode === 'starting') {
        setLabel('Starts in:')
        setIsUrgent(difference < 1000 * 60 * 60) // Urgent if < 1 hour
      } else {
        setLabel('Ends in:')
        setIsUrgent(difference < 1000 * 60 * 60) // Urgent if < 1 hour
      }
    }

    calculateTimeLeft()
    const timerInterval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timerInterval)
  }, [config])

  if (!config || !timeLeft) return null

  return (
    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border ${
      isUrgent 
        ? 'bg-error/10 border-error/30 text-error' 
        : 'bg-base-200 border-white/10 text-white/80'
    }`}>
      <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
      <span className="font-mono font-bold tabular-nums">{timeLeft}</span>
    </div>
  )
}
