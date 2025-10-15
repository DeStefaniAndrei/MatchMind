import type { Match } from "./types"




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


// Mock wallet data for demo
export const mockWalletData = {
  address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  balance: 1250.5,
  chzBalance: 850.25,
  isConnected: true,
  chainId: 88882, // Chiliz testnet
  isChilizTestnet: true
}


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
