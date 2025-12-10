export type ScorePoint = {
  time: string
  score: number
}

export type LeaderboardTeam = {
  team_id: number
  team_name: string
  score: number
  solves: number
  last_solve: string | null
  progression: ScorePoint[]
}

export type LeaderboardResponse = {
  teams: LeaderboardTeam[]
}
