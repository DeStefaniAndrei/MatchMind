//Declare objects user in runtime

export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  status: "upcoming" | "live" | "completed"
  participants: number
  totalStake: number
  homeScore?: number
  awayScore?: number
  contract_address?: string
  minute?: number
  events?: MatchEvent[]
  cumulativeStats?: CumulativeMinuteStats[]
}

export interface MatchEvent {
  id: string
  type: string
  minute: number
  player?: string
  team: "home" | "away" | "unknown"
  description: string
}

export interface CumulativeStatsByTeam {
  home: Record<string, number>
  away: Record<string, number>
  unknown: Record<string, number>
}

export interface CumulativeMinuteStats {
  minute: number
  byType: Record<string, number>
  byTeam?: CumulativeStatsByTeam
}

export interface User {
  id: string
  username: string
  walletAddress: string
  chzBalance: number
}

export interface Stake {
  id: string
  userId: string
  matchId: string
  amount: number
  timestamp: string
}

export interface Question {
  id: string
  matchId: string
  text: string
  options: string[]
  correctAnswer?: string
  timestamp: string
}

export interface Answer {
  id: string
  userId: string
  questionId: string
  selectedOption: string
  timestamp: string
  isCorrect?: boolean
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
  reward?: number
}
