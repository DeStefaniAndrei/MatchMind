// Example usage of MatchService with Supabase integration
// This shows how to integrate the monitoring service with your database

import { MatchService, ActiveMatch } from './match-service'

// Example Supabase integration functions
// Replace these with your actual Supabase client and functions

interface SupabaseMatch {
  id: string
  sport_monks_id: number
  contract_game_id: number
  contract_address: string
  home_team: string
  away_team: string
  start_time: string
  status: 'scheduled' | 'live' | 'finished'
  contract_state: 'pre_match' | 'active' | 'ended' | 'distributed'
  created_at: string
  updated_at: string
}

// Mock Supabase functions - replace with your actual implementation
class SupabaseService {
  async getMatches(): Promise<SupabaseMatch[]> {
    // Replace with your actual Supabase query
    // const { data, error } = await supabase.from('matches').select('*')
    return []
  }

  async updateMatch(sportMonksId: number, updates: Partial<SupabaseMatch>): Promise<void> {
    // Replace with your actual Supabase update
    // const { error } = await supabase
    //   .from('matches')
    //   .update(updates)
    //   .eq('sport_monks_id', sportMonksId)
    console.log(`Updating match ${sportMonksId}:`, updates)
  }

  async createMatch(match: Omit<SupabaseMatch, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    // Replace with your actual Supabase insert
    // const { error } = await supabase.from('matches').insert(match)
    console.log('Creating match:', match)
  }
}

// Initialize the match service
const initializeMatchService = () => {
  // Replace with your actual contract address and private key
  const FACTORY_ADDRESS = '0x...' // Your deployed GameFactory address
  const PRIVATE_KEY = '0x...' // Your private key for contract interactions

  const matchService = new MatchService(FACTORY_ADDRESS, PRIVATE_KEY)
  const supabaseService = new SupabaseService()

  return { matchService, supabaseService }
}

// Load matches from Supabase and register them for monitoring
const loadMatchesFromDatabase = async () => {
  const { matchService, supabaseService } = initializeMatchService()

  try {
    // Get all matches from Supabase
    const matches = await supabaseService.getMatches()

    // Register each match for monitoring
    for (const match of matches) {
      await matchService.registerMatch(
        match.sport_monks_id,
        match.contract_game_id,
        match.contract_address,
        match.home_team,
        match.away_team,
        new Date(match.start_time)
      )
    }

    console.log(`Loaded ${matches.length} matches from database`)
    return matchService
  } catch (error) {
    console.error('Failed to load matches from database:', error)
    throw error
  }
}

// Start monitoring all matches
const startMatchMonitoring = async () => {
  try {
    const matchService = await loadMatchesFromDatabase()
    
    // Start monitoring
    await matchService.startMonitoring()
    
    console.log('Match monitoring started successfully')
    return matchService
  } catch (error) {
    console.error('Failed to start match monitoring:', error)
    throw error
  }
}

// Example: Create a new match (when you create a match in your app)
const createNewMatch = async (
  sportMonksId: number,
  homeTeam: string,
  awayTeam: string,
  startTime: Date
) => {
  const { matchService, supabaseService } = initializeMatchService()

  try {
    // 1. Create game in contract (you'll need to implement this)
    const contractGameId = await createContractGame() // Implement this function
    const contractAddress = await getGameAddress(contractGameId) // Implement this function

    // 2. Save to Supabase
    await supabaseService.createMatch({
      sport_monks_id: sportMonksId,
      contract_game_id: contractGameId,
      contract_address: contractAddress,
      home_team: homeTeam,
      away_team: awayTeam,
      start_time: startTime.toISOString(),
      status: 'scheduled',
      contract_state: 'pre_match'
    })

    // 3. Register for monitoring
    await matchService.registerMatch(
      sportMonksId,
      contractGameId,
      contractAddress,
      homeTeam,
      awayTeam,
      startTime
    )

    console.log(`Created new match: ${homeTeam} vs ${awayTeam}`)
  } catch (error) {
    console.error('Failed to create new match:', error)
    throw error
  }
}

// Example: Update match status in database when contract state changes
const updateMatchInDatabase = async (sportMonksId: number, updates: Partial<SupabaseMatch>) => {
  const { supabaseService } = initializeMatchService()

  try {
    await supabaseService.updateMatch(sportMonksId, updates)
    console.log(`Updated match ${sportMonksId} in database`)
  } catch (error) {
    console.error(`Failed to update match ${sportMonksId} in database:`, error)
  }
}

// Example: Get live matches
const getLiveMatches = async () => {
  const { matchService } = initializeMatchService()
  return matchService.getLiveMatches()
}

// Example: Get match by SportMonks ID
const getMatch = async (sportMonksId: number) => {
  const { matchService } = initializeMatchService()
  return matchService.getMatch(sportMonksId)
}

// Contract interaction functions (implement these based on your contract setup)
const createContractGame = async (): Promise<number> => {
  // Implement contract game creation
  // This should call your GameFactory.createGame() function
  throw new Error('Implement createContractGame function')
}

const getGameAddress = async (gameId: number): Promise<string> => {
  // Implement getting game address from contract
  // This should call your GameFactory.getGameAddress(gameId) function
  throw new Error('Implement getGameAddress function')
}

// Export functions for use in your app
export {
  startMatchMonitoring,
  createNewMatch,
  updateMatchInDatabase,
  getLiveMatches,
  getMatch,
  SupabaseService
}

export type { SupabaseMatch } 