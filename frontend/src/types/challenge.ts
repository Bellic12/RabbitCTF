export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane'
export type ChallengeCategory = string
export type ChallengeStatus = 'solved' | 'open'

export type ChallengeFile = {
  name: string
  size: string
  url: string
}

export type ChallengeSolve = {
  team: string
  submittedAt: string
  points: number
}

export type Challenge = {
  id: string
  title: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  solves: number
  status: ChallengeStatus
  solvedBy?: string
  description: string
  tags: string[]
  connectionInfo?: string
  files?: ChallengeFile[]
  solveHistory?: ChallengeSolve[]
}
