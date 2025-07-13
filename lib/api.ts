import { supabase } from './supabaseClient'
import { mockMatches, mockUsers, mockStakes, mockPredictions, mockQuestions, mockLiveEvents } from './mock-data'

export interface LiveMatchData {
  matchId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  status: "live" | "halftime" | "completed"
  events: MatchEvent[]
}

export interface MatchEvent {
  id: string
  type: "goal" | "yellow_card" | "red_card" | "corner" | "substitution"
  minute: number
  player?: string
  team: "home" | "away"
  description: string
}

// --- Supabase-integrated functions with mock fallback ---

// Fetch all matches
export async function fetchMatches() {
  // Force use mock data for demo
  console.log('Using mock matches data for demo')
  return mockMatches
  
  // Commented out Supabase call for demo
  /*
  try {
    const { data, error } = await supabase.from('matches').select('*')
    if (error) throw error
    
    // Transform data to match frontend expectations
    const transformedData = data?.map(match => ({
      id: match.id,
      homeTeam: match.home_team || match.homeTeam,
      awayTeam: match.away_team || match.awayTeam,
      startTime: match.start_time || match.startTime,
      status: match.status,
      participants: match.participants,
      totalStake: match.total_stake || match.totalStake,
      homeScore: match.home_score || match.homeScore,
      awayScore: match.away_score || match.awayScore,
      contract_address: match.contract_address,
      minute: match.minute,
      events: match.events
    })) || []
    
    console.log('Transformed matches data:', transformedData)
    return transformedData
  } catch (error) {
    console.log('Using mock matches data')
    return mockMatches
  }
  */
}

// Fetch a single match by ID
export async function fetchMatchById(matchId: string) {
  try {
    const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).single()
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock match data')
    return mockMatches.find(m => m.id === matchId) || mockMatches[0]
  }
}

// Add a stake
export async function addStake(userId: string, matchId: string, amount: number) {
  try {
    const { data, error } = await supabase.from('stakes').insert([{ user_id: userId, match_id: matchId, amount }])
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock stake data')
    return { id: Date.now().toString(), user_id: userId, match_id: matchId, amount }
  }
}

// Add a prediction
export async function addPrediction(userId: string, matchId: string, questionId: string, answer: string) {
  try {
    const { data, error } = await supabase.from('predictions').insert([{ user_id: userId, match_id: matchId, question_id: questionId, answer }])
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock prediction data')
    return { id: Date.now().toString(), user_id: userId, match_id: matchId, question_id: questionId, answer }
  }
}

// Fetch predictions for a user and match
export async function fetchPredictions(userId: string, matchId: string) {
  try {
    const { data, error } = await supabase.from('predictions').select('*').eq('user_id', userId).eq('match_id', matchId)
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock predictions data')
    return mockPredictions.filter(p => p.user_id === userId && p.match_id === matchId)
  }
}

// Fetch stakes for a user
export async function fetchStakes(userId: string) {
  try {
    const { data, error } = await supabase.from('stakes').select('*').eq('user_id', userId)
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock stakes data')
    return mockStakes.filter(s => s.user_id === userId)
  }
}

// Upsert user by wallet address (returns user record)
export async function upsertUserByWallet(walletAddress: string) {
  try {
    // Try to fetch the user first
    let { data: user, error } = await supabase.from('users').select('*').eq('wallet_address', walletAddress).single()
    if (user) return user
    // If not found, insert
    const { data: inserted, error: insertError } = await supabase.from('users').insert([{ wallet_address: walletAddress }]).select('*').single()
    if (insertError) throw insertError
    return inserted
  } catch (error) {
    console.log('Using mock user data')
    return mockUsers.find(u => u.wallet_address === walletAddress) || {
      id: Date.now().toString(),
      wallet_address: walletAddress,
      username: `User_${walletAddress.slice(-6)}`,
      total_staked: 0,
      total_rewards: 0,
      rank: 999
    }
  }
}

// Fetch questions for a match
export async function fetchMatchQuestions(matchId: string) {
  try {
    const { data, error } = await supabase.from('questions').select('*').eq('match_id', matchId)
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock questions data')
    return mockQuestions.filter(q => q.match_id === matchId)
  }
}

// Fetch live events for a match
export async function fetchLiveEvents(matchId: string) {
  try {
    const { data, error } = await supabase.from('events').select('*').eq('match_id', matchId).order('minute', { ascending: false })
    if (error) throw error
    return data
  } catch (error) {
    console.log('Using mock events data')
    return mockLiveEvents
  }
}

// --- Placeholder API functions for fetching live match data (keep for now) ---

/**
 * Fetch live match data from sports API
 * @param matchId - The ID of the match
 * @returns Live match data
 */
export async function fetchLiveMatchData(matchId: string): Promise<LiveMatchData> {
  console.log(`Fetching live data for match ${matchId}`)

  // In real implementation, this would call a sports data API like:
  // - SportRadar API
  // - ESPN API
  // - Football-Data.org API
  // - RapidAPI Sports

  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock live data
  return {
    matchId,
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: "live",
    events: mockLiveEvents,
  }
}

/**
 * Fetch upcoming matches
 * @returns Array of upcoming matches
 */
export async function fetchUpcomingMatches(): Promise<LiveMatchData[]> {
  console.log("Fetching upcoming matches")

  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return mock upcoming matches
  return [
    {
      matchId: "2",
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: "live",
      events: [],
    },
    {
      matchId: "4",
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: "live",
      events: [],
    },
  ]
}

/**
 * Generate prediction questions based on live match data
 * @param matchData - Current match data
 * @returns Generated question
 */
export function generatePredictionQuestion(matchData: LiveMatchData): {
  text: string
  options: string[]
} {
  const questions = [
    {
      text: "Who will score the next goal?",
      options: [matchData.homeTeam, matchData.awayTeam, "No Goal"],
    },
    {
      text: "Will there be a corner kick in the next 5 minutes?",
      options: ["Yes", "No"],
    },
    {
      text: "Which team will have the next possession?",
      options: [matchData.homeTeam, matchData.awayTeam],
    },
    {
      text: "Will there be a card shown in the next 10 minutes?",
      options: ["Yellow Card", "Red Card", "No Card"],
    },
    {
      text: "Will there be a substitution in the next 15 minutes?",
      options: ["Yes", "No"],
    },
  ]

  return questions[Math.floor(Math.random() * questions.length)]
}
