import { useMemo, useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ChallengeCard from '../components/ChallengeCard'
import ChallengeModal from '../components/ChallengeModal'
import { useAuth } from '../context/AuthContext'
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
} from '../types/challenge'

export default function ChallengesPage() {
  const { token } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const [challengesRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/challenges/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/challenges/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (challengesRes.ok) {
          const data = await challengesRes.json()
          // Map backend data to frontend interface
          const mappedChallenges: Challenge[] = data.map((c: any) => ({
            id: String(c.id),
            title: c.title,
            category: c.category_name || 'Web', // Fallback
            difficulty: c.difficulty_name || 'Easy', // Fallback
            points: c.base_score,
            solves: c.solve_count || 0,
            status: c.is_solved ? 'solved' : 'open',
            description: c.description,
            tags: [], // Backend doesn't return tags yet
            connectionInfo: c.operational_data,
            files: [], // Backend doesn't return files yet
            solveHistory: [], // Backend doesn't return history yet
          }))
          setChallenges(mappedChallenges)
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.map((c: any) => c.name))
        }
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])
  const [categoryFilter, setCategoryFilter] = useState<'All' | ChallengeCategory>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | ChallengeDifficulty>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | ChallengeStatus>('All')
  const [selected, setSelected] = useState<Challenge | null>(null)

  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const matchTerm = challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory = categoryFilter === 'All' || challenge.category === categoryFilter
      const matchDifficulty =
        difficultyFilter === 'All' || challenge.difficulty === difficultyFilter
      const matchStatus = statusFilter === 'All' || challenge.status === statusFilter
      return matchTerm && matchCategory && matchDifficulty && matchStatus
    })
  }, [challenges, searchTerm, categoryFilter, difficultyFilter, statusFilter])

  return (
    <div className="flex min-h-screen flex-col bg-[#04090f] text-white">
      <Navigation />

      <main className="flex-1 bg-[#04090f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold">Challenges</h1>
            <p className="text-sm text-white/60">
              Browse and solve challenges to earn points for your team
            </p>
          </header>

          <section className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#061120] p-6 shadow-[0_25px_65px_-50px_rgba(0,0,0,0.9)] md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-3 md:max-w-xl">
              <SearchIcon className="hidden h-5 w-5 text-white/30 md:block" />
              <input
                className="h-12 w-full rounded-2xl border border-white/15 bg-[#040d1a] px-4 text-sm text-white transition focus:border-[#0edbc5] focus:outline-none"
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search challenges..."
                value={searchTerm}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={event => setCategoryFilter(event.target.value as typeof categoryFilter)}
                value={categoryFilter}
              >
                <option value="All">All</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={event =>
                  setDifficultyFilter(event.target.value as typeof difficultyFilter)
                }
                value={difficultyFilter}
              >
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Insane">Insane</option>
              </select>

              <select
                className="select select-bordered h-12 min-w-[7.5rem] rounded-2xl border-white/15 bg-[#040d1a] text-sm text-white focus:border-[#0edbc5]"
                onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
                value={statusFilter}
              >
                <option value="All">All</option>
                <option value="solved">Solved</option>
                <option value="open">Open</option>
              </select>
            </div>
          </section>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-white/60">
              <span className="loading loading-spinner loading-lg text-[#0edbc5]"></span>
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} onClick={setSelected} />
              ))}

              {filteredChallenges.length === 0 && (
                <div className="col-span-full rounded-[28px] border border-white/10 bg-[#061120] p-10 text-center text-white/60">
                  No challenges match the selected filters.
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />

      {selected && <ChallengeModal challenge={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

interface IconProps {
  className?: string
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        className="stroke-current"
        d="M11 5a6 6 0 014.472 9.992l3.27 3.27a1 1 0 01-1.414 1.414l-3.27-3.27A6 6 0 1111 5z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  )
}
