import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import type { Challenge } from '../types/challenge'

export function useChallenges() {
  const { token } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [challengesData, categoriesData] = await Promise.all([
        api.challenges.list(token),
        api.challenges.categories(token),
      ])

      // Map backend data to frontend interface
      const mappedChallenges: Challenge[] = challengesData.map((c: any) => ({
        id: String(c.id),
        title: c.title,
        category: c.category_name || 'Web',
        difficulty: c.difficulty_name || 'Easy',
        points: c.base_score,
        solves: c.solve_count || 0,
        status: c.is_solved ? 'solved' : 'open',
        description: c.description,
        tags: [],
        connectionInfo: c.operational_data,
        files: [],
        solveHistory: [],
      }))

      setChallenges(mappedChallenges)
      setCategories(categoriesData.map((c: any) => c.name))
    } catch (err) {
      setError('Failed to fetch challenges')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  return { challenges, categories, isLoading, error, refetch: fetchChallenges }
}
