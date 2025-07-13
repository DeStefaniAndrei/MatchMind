import type { Match } from "./types"

export const mockMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    startTime: "2024-01-15T15:00:00Z",
    status: "live",
    participants: 2847,
    totalStake: 45230,
    homeScore: 2,
    awayScore: 1,
    contract_address: "0x1234567890123456789012345678901234567890",
    minute: 67,
    events: [
      { id: "1", type: "goal", minute: 23, player: "Marcus Rashford", team: "home", description: "Goal scored by Marcus Rashford" },
      { id: "2", type: "goal", minute: 34, player: "Mohamed Salah", team: "away", description: "Goal scored by Mohamed Salah" },
      { id: "3", type: "goal", minute: 56, player: "Bruno Fernandes", team: "home", description: "Goal scored by Bruno Fernandes" },
      { id: "4", type: "yellow_card", minute: 45, player: "Virgil van Dijk", team: "away", description: "Yellow card for Virgil van Dijk" },
    ]
  },
  {
    id: "2",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    startTime: "2024-01-15T20:00:00Z",
    status: "upcoming",
    participants: 1892,
    totalStake: 32350,
    contract_address: "0x2345678901234567890123456789012345678901",
  },
  {
    id: "3",
    homeTeam: "Chelsea",
    awayTeam: "Arsenal",
    startTime: "2024-01-14T17:30:00Z",
    status: "completed",
    participants: 2156,
    totalStake: 38750,
    homeScore: 1,
    awayScore: 3,
    contract_address: "0x3456789012345678901234567890123456789012",
  },
  {
    id: "4",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    startTime: "2024-01-16T18:30:00Z",
    status: "upcoming",
    participants: 1743,
    totalStake: 29840,
    contract_address: "0x4567890123456789012345678901234567890123",
  },
  {
    id: "5",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    startTime: "2024-01-16T21:00:00Z",
    status: "upcoming",
    participants: 2654,
    totalStake: 38920,
    contract_address: "0x5678901234567890123456789012345678901234",
  },
  {
    id: "6",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    startTime: "2024-01-13T19:45:00Z",
    status: "completed",
    participants: 1987,
    totalStake: 33670,
    homeScore: 0,
    awayScore: 2,
    contract_address: "0x6789012345678901234567890123456789012345",
  },
  {
    id: "7",
    homeTeam: "PSG",
    awayTeam: "Lyon",
    startTime: "2024-01-17T20:00:00Z",
    status: "upcoming",
    participants: 1445,
    totalStake: 25670,
    contract_address: "0x7890123456789012345678901234567890123456",
  },
  {
    id: "8",
    homeTeam: "PSG",
    awayTeam: "Monaco",
    startTime: "2024-01-18T21:00:00Z",
    status: "upcoming",
    participants: 1332,
    totalStake: 24230,
    contract_address: "0x8901234567890123456789012345678901234567",
  },
  {
    id: "9",
    homeTeam: "PSG",
    awayTeam: "Nice",
    startTime: "2024-01-19T19:00:00Z",
    status: "upcoming",
    participants: 1278,
    totalStake: 23450,
    contract_address: "0x9012345678901234567890123456789012345678",
  },
  {
    id: "10",
    homeTeam: "PSG",
    awayTeam: "Nantes",
    startTime: "2024-01-20T21:00:00Z",
    status: "upcoming",
    participants: 2156,
    totalStake: 45670,
    contract_address: "0xa012345678901234567890123456789012345678",
  },
]

// Mock user data for demo
export const mockUsers = [
  {
    id: "1",
    wallet_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    username: "PredictorPro",
    total_staked: 500,
    total_rewards: 45.2,
    rank: 1,
  },
  {
    id: "2", 
    wallet_address: "0x1234567890123456789012345678901234567890",
    username: "FootballFan99",
    total_staked: 300,
    total_rewards: 32.15,
    rank: 2,
  },
  {
    id: "3",
    wallet_address: "0x9876543210987654321098765432109876543210", 
    username: "MatchMaster",
    total_staked: 250,
    total_rewards: 15.75,
    rank: 3,
  }
]

// Mock staking data
export const mockStakes = [
  {
    id: "1",
    user_id: "1",
    match_id: "1",
    amount: 100,
    timestamp: "2024-01-15T14:30:00Z",
    status: "active"
  },
  {
    id: "2",
    user_id: "2", 
    match_id: "1",
    amount: 75,
    timestamp: "2024-01-15T14:25:00Z",
    status: "active"
  },
  {
    id: "3",
    user_id: "3",
    match_id: "2", 
    amount: 50,
    timestamp: "2024-01-15T19:30:00Z",
    status: "active"
  }
]

// Mock predictions data
export const mockPredictions = [
  {
    id: "1",
    user_id: "1",
    match_id: "1",
    question_id: "1",
    answer: "Home Team",
    points: 10,
    timestamp: "2024-01-15T15:05:00Z"
  },
  {
    id: "2",
    user_id: "1",
    match_id: "1", 
    question_id: "2",
    answer: "Yes",
    points: 15,
    timestamp: "2024-01-15T15:10:00Z"
  },
  {
    id: "3",
    user_id: "2",
    match_id: "1",
    question_id: "1", 
    answer: "Away Team",
    points: 0,
    timestamp: "2024-01-15T15:05:00Z"
  }
]

// Mock live match questions
export const mockQuestions = [
  {
    id: "1",
    text: "Will there be more than 10 passes in the next minute?",
    options: ["True", "False"],
    timeLeft: 60,
    answered: false,
    match_id: "1"
  },
  {
    id: "2", 
    text: "Will there be more than 10 passes in the next minute?",
    options: ["True", "False"],
    timeLeft: 60,
    answered: false,
    match_id: "1"
  },
  {
    id: "3",
    text: "Will there be more than 10 passes in the next minute?",
    options: ["True", "False"],
    timeLeft: 60,
    answered: false,
    match_id: "1"
  },
  {
    id: "4",
    text: "Will there be more than 10 passes in the next minute?",
    options: ["True", "False"],
    timeLeft: 60,
    answered: false,
    match_id: "1"
  }
]

// Mock leaderboard data
export const mockLeaderboard = [
  { rank: 1, username: "PredictorPro", score: 850, isCurrentUser: false },
  { rank: 2, username: "FootballFan99", score: 820, isCurrentUser: false },
  { rank: 3, username: "You", score: 780, isCurrentUser: true },
  { rank: 4, username: "MatchMaster", score: 750, isCurrentUser: false },
  { rank: 5, username: "GoalGuesser", score: 720, isCurrentUser: false },
  { rank: 6, username: "ScoreSeeker", score: 690, isCurrentUser: false },
  { rank: 7, username: "WinPredictor", score: 660, isCurrentUser: false },
  { rank: 8, username: "ChampChaser", score: 630, isCurrentUser: false },
]

// Mock admin data
export const mockAdminData = {
  totalUsers: 15420,
  totalStaked: 125000,
  totalRewards: 18750,
  activeMatches: 3,
  completedMatches: 12,
  pendingPayouts: 2
}

// Mock payout data
export const mockPayouts = [
  {
    id: "3",
    homeTeam: "Chelsea",
    awayTeam: "Arsenal", 
    totalStake: 18750,
    totalRewards: 1875,
    status: "pending",
    completedAt: "2024-01-14T19:30:00Z",
  },
  {
    id: "6",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    totalStake: 13670,
    totalRewards: 1367,
    status: "completed", 
    completedAt: "2024-01-13T21:45:00Z",
  }
]

// Mock pending questions
export const mockPendingQuestions = [
  {
    id: "1",
    matchId: "1",
    text: "Will there be a red card in the next 10 minutes?",
    options: ["Yes", "No"],
    submittedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "2",
    matchId: "1", 
    text: "Which player will touch the ball next?",
    options: ["Midfielder", "Defender", "Forward"],
    submittedAt: "2024-01-15T14:25:00Z",
  }
]

// Mock wallet data for demo
export const mockWalletData = {
  address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  balance: 1250.5,
  chzBalance: 850.25,
  isConnected: true,
  chainId: 88882, // Chiliz testnet
  isChilizTestnet: true
}

// Mock live match events
export const mockLiveEvents = [
  {
    id: "1",
    type: "goal",
    minute: 23,
    player: "Marcus Rashford",
    team: "home",
    description: "Goal scored by Marcus Rashford"
  },
  {
    id: "2", 
    type: "goal",
    minute: 34,
    player: "Mohamed Salah", 
    team: "away",
    description: "Goal scored by Mohamed Salah"
  },
  {
    id: "3",
    type: "goal",
    minute: 56,
    player: "Bruno Fernandes",
    team: "home", 
    description: "Goal scored by Bruno Fernandes"
  },
  {
    id: "4",
    type: "yellow_card",
    minute: 45,
    player: "Virgil van Dijk",
    team: "away",
    description: "Yellow card for Virgil van Dijk"
  }
]

// Mock user rewards
export const mockUserRewards = {
  totalStaked: 100,
  totalRewards: 15.75,
  rank: 3,
  matchRewards: [
    {
      matchId: "1",
      matchName: "Manchester United vs Liverpool",
      staked: 100,
      reward: 15.75,
      rank: 3
    },
    {
      matchId: "3", 
      matchName: "Chelsea vs Arsenal",
      staked: 50,
      reward: 8.25,
      rank: 5
    }
  ]
}
