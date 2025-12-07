import { useState, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export function useStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalPoints: 0,
    challengesCount: 0,
    teamsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        let teamsCount = 0
        let challengesCount = 0
        let totalPoints = 0

        if (token) {
          try {
            // Fetch scoreboard (authenticated)
            const scoreboardData = await api.scoreboard.get(token)
            teamsCount = scoreboardData.teams.length

            // Fetch challenges (authenticated)
            const challengesData = await api.challenges.list(token)
            challengesCount = challengesData.length
            totalPoints = challengesData.reduce(
              (acc: number, curr: any) => acc + (curr.base_score || 0),
              0
            )
          } catch (e) {
            console.error('Failed to fetch authenticated data', e)
          }
        }

        setStats({
          totalPoints,
          challengesCount,
          teamsCount,
        })
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  return { stats, isLoading }
}
