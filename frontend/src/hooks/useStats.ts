import { useState, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export function useStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    usersCount: 0,
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
        let usersCount = 0

        // Fetch scoreboard (public)
        try {
          const scoreboardData = await api.scoreboard.get(token || undefined)
          teamsCount = scoreboardData.teams.length
        } catch (e) {
          console.error('Failed to fetch scoreboard', e)
        }

        // Fetch challenge count (public)
        try {
          challengesCount = await api.challenges.count()
        } catch (e) {
          console.error('Failed to fetch challenge count', e)
        }

        // Fetch user count (public)
        try {
          usersCount = await api.auth.count()
        } catch (e) {
          console.error('Failed to fetch user count', e)
        }

        setStats({
          usersCount,
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
