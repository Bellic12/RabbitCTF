import { useMemo, useState } from 'react'

import ChallengeCard from '../components/ChallengeCard'
import ChallengeModal from '../components/ChallengeModal'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import { useChallenges } from '../hooks/useChallenges'
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeStatus,
} from '../types/challenge'

export default function ChallengesPage() {
  const { challenges, categories, isLoading, refetch } = useChallenges()
  const [searchTerm, setSearchTerm] = useState('')

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
    <div className="flex min-h-screen flex-col bg-base-100 text-base-content">
      <Navigation />

      <main className="flex-1 bg-base-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
          <header className="space-y-3">
            <h1 className="text-4xl font-bold">Challenges</h1>
            <p className="text-sm text-white/60">
              Browse and solve challenges to earn points for your team
            </p>
          </header>

          <section className="flex flex-col gap-4 rounded-box border border-white/10 bg-base-200 p-6 shadow-[0_25px_65px_-50px_rgba(0,0,0,0.9)] md:flex-row md:items-center md:justify-between">
            <label className="input input-bordered flex w-full items-center gap-2 bg-base-300 md:max-w-xl">
              <SearchIcon className="hidden h-5 w-5 opacity-50 md:block" />
              <input
                className="grow"
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search challenges..."
                type="text"
                value={searchTerm}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4">
              <select
                className="select select-bordered w-full bg-base-300 md:w-auto"
                onChange={event => setCategoryFilter(event.target.value)}
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
                className="select select-bordered w-full bg-base-300 md:w-auto"
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
                className="select select-bordered w-full bg-base-300 md:w-auto"
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
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} onClick={setSelected} />
              ))}

              {filteredChallenges.length === 0 && (
                <div className="col-span-full rounded-box border border-white/10 bg-base-200 p-10 text-center text-white/60">
                  No challenges match the selected filters.
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />

      {selected && (
        <ChallengeModal
          challenge={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            refetch()
            setSelected(prev => (prev ? { ...prev, status: 'solved' } : null))
          }}
        />
      )}
    </div>
  )
}

type IconProps = {
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
