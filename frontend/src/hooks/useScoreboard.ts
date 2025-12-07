import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

interface ScorePoint {
  time: string
  score: number
}

interface Team {
  id: number
  name: string
  timeline: ScorePoint[]
  totalScore: number
  solves: number
  lastSolve: string
}

export function useScoreboard(refreshInterval = 30000) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScoreboard = useCallback(async () => {
    try {
      const data = await api.scoreboard.get()
      setTeams(data.teams)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scoreboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScoreboard()
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchScoreboard, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchScoreboard, refreshInterval])

  return { teams, isLoading, error, refetch: fetchScoreboard }
}
