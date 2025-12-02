export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';
export type ChallengeCategory = string;
export type ChallengeStatus = 'solved' | 'open';

export interface ChallengeFile {
  name: string;
  size: string;
  url: string;
}

export interface ChallengeSolve {
  team: string;
  submittedAt: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  solves: number;
  status: ChallengeStatus;
  description: string;
  tags: string[];
  connectionInfo?: string;
  files?: ChallengeFile[];
  solveHistory?: ChallengeSolve[];
}
