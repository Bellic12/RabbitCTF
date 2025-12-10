import type { ChallengeDifficulty } from '../types/challenge'

type DifficultyBadgeProps = {
  difficulty: ChallengeDifficulty | string
  className?: string
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const getColorClass = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400'
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400'
      case 'Insane':
        return 'bg-purple-500/10 text-purple-400'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  return (
    <span
      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${getColorClass(difficulty)} ${className}`}
    >
      {difficulty}
    </span>
  )
}

type CategoryBadgeProps = {
  category: string
  className?: string
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  return (
    <span
      className={`rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/70 ${className}`}
    >
      {category}
    </span>
  )
}
