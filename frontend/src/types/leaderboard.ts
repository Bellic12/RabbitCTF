export interface ScorePoint {
  time: string;
  score: number;
}

export interface LeaderboardTeam {
  team_id: number;
  team_name: string;
  score: number;
  solves: number;
  last_solve: string | null;
  progression: ScorePoint[];
}

export interface LeaderboardResponse {
  teams: LeaderboardTeam[];
}
