import { useMemo, useState } from 'react'

import ChallengeCard from '../components/ChallengeCard'
import ChallengeModal from '../components/ChallengeModal'
import Footer from '../components/Footer'
import MultiSelect from '../components/MultiSelect'
import Navigation from '../components/Navigation'
import { useAuth } from '../context/AuthContext'
import { useChallenges } from '../hooks/useChallenges'
import type { Challenge } from '../types/challenge'

export default function ChallengesPage() {
  const { challenges, categories, isLoading, updateChallenge } = useChallenges()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selected, setSelected] = useState<Challenge | null>(null)

  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const matchTerm = challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchCategory = categoryFilter.length === 0 || categoryFilter.includes(challenge.category)
      
      const matchDifficulty = difficultyFilter.length === 0 || difficultyFilter.includes(challenge.difficulty)
      
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(challenge.status)
      
      return matchTerm && matchCategory && matchDifficulty && matchStatus
    })
  }, [challenges, searchTerm, categoryFilter, difficultyFilter, statusFilter])

  const groupedChallenges = useMemo(() => {
    const groups: Record<string, Challenge[]> = {}
    filteredChallenges.forEach(challenge => {
      if (!groups[challenge.category]) {
        groups[challenge.category] = []
      }
      groups[challenge.category].push(challenge)
    })
    // Sort categories alphabetically or by some other order if needed
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredChallenges])

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

          <section className="space-y-6">
            <div className="rounded-box border border-white/10 bg-base-200 p-6 shadow-[0_25px_65px_-50px_rgba(0,0,0,0.9)]">
              <div className="mb-4">
                <label className="input input-bordered flex w-full items-center gap-2 bg-base-300">
                  <SearchIcon className="h-5 w-5 opacity-50" />
                  <input
                    className="grow"
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="Search challenges..."
                    type="text"
                    value={searchTerm}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MultiSelect
                  label="Category"
                  options={categories.map(c => ({ label: c, value: c }))}
                  selected={categoryFilter}
                  onChange={setCategoryFilter}
                />

                <MultiSelect
                  label="Difficulty"
                  options={['Easy', 'Medium', 'Hard', 'Insane'].map(d => ({ label: d, value: d }))}
                  selected={difficultyFilter}
                  onChange={setDifficultyFilter}
                />

                <MultiSelect
                  label="Status"
                  options={[
                    { label: 'Solved', value: 'solved' },
                    { label: 'Open', value: 'open' }
                  ]}
                  selected={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </div>
          </section>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-white/60">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedChallenges.map(([category, categoryChallenges]) => (
                <div key={category} className="collapse collapse-arrow border border-white/10 bg-base-200">
                  <input type="checkbox" defaultChecked /> 
                  <div className="collapse-title text-xl font-medium text-white">
                    {category} <span className="text-sm font-normal text-white/60 ml-2">({categoryChallenges.length})</span>
                  </div>
                  <div className="collapse-content">
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pt-4">
                      {categoryChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} onClick={setSelected} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {filteredChallenges.length === 0 && (
                <div className="rounded-box border border-white/10 bg-base-200 p-10 text-center text-white/60">
                  No challenges match the selected filters.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selected && (
        <ChallengeModal
          challenge={selected}
          onClose={() => setSelected(null)}
          onSolve={() => {
            const updatedChallenge = {
              ...selected,
              status: 'solved',
              solvedBy: user?.username || 'you',
              solves: (selected.solves || 0) + 1
            } as Challenge
            
            updateChallenge(selected.id, {
              status: 'solved',
              solvedBy: user?.username || 'you',
              solves: (selected.solves || 0) + 1
            })
            
            setSelected(updatedChallenge)
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
