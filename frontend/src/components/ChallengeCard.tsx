import type { Challenge } from '../types/challenge'

import { CategoryBadge, DifficultyBadge } from './Badges'

type ChallengeCardProps = {
  challenge: Challenge
  onClick: (challenge: Challenge) => void
}

export default function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const isSolved = challenge.status === 'solved'

  return (
    <button
      className={`cursor-pointer flex h-full flex-col rounded-box border p-6 text-left transition hover:shadow-[0_25px_65px_-45px_rgba(0,0,0,0.9)] ${
        isSolved
          ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
          : 'border-white/10 bg-base-200 hover:border-primary/40'
      }`}
      onClick={() => onClick(challenge)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className={`flex items-center gap-2 text-sm font-semibold ${isSolved ? 'text-emerald-400' : 'text-white/70'}`}>
            {isSolved ? <SolvedIcon /> : <UnsolvedIcon />}
            {challenge.title}
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={challenge.category} />
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>
        </div>

        <div className="text-right text-2xl font-bold text-primary">
          {challenge.points}
          <p className="mt-1 text-xs font-medium text-white/40">{challenge.solves} solves</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {challenge.tags.map(tag => (
          <span
            className="rounded border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

function SolvedIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/15 text-emerald-400">
      <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <path
          className="stroke-current"
          d="M9 12l2 2 4-4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
        />
      </svg>
    </span>
  )
}

function UnsolvedIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded border border-white/20 text-white/40">
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="stroke-current" cx="12" cy="12" r="8" strokeWidth={1.6} />
      </svg>
    </span>
  )
}
