// Example usage of WebSocket monitoring system
// Shows how to integrate real-time monitoring with your Supabase database

import { WebSocketMonitor } from './websocket-monitor'
import { MatchWebSocketServer } from './websocket-server'

// Example Supabase integration
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

// Mock Supabase service - replace with your actual implementation
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
}

// Initialize the WebSocket monitoring system
const initializeWebSocketSystem = () => {
  // Replace with your actual contract address and private key
  const FACTORY_ADDRESS = '0x...' // Your deployed GameFactory address
  const PRIVATE_KEY = '0x...' // Your private key for contract interactions

  const monitor = new WebSocketMonitor(FACTORY_ADDRESS, PRIVATE_KEY)
  const server = new MatchWebSocketServer(3001)
  const supabaseService = new SupabaseService()

  return { monitor, server, supabaseService }
}

// Start the WebSocket server and monitoring
const startWebSocketSystem = async () => {
  const { monitor, server, supabaseService } = initializeWebSocketSystem()

  try {
    // Start the WebSocket server
    server.start()
    console.log('WebSocket server started')

    // Load matches from Supabase and register them for monitoring
    const matches = await supabaseService.getMatches()
    
    for (const match of matches) {
      await monitor.registerMatch(
        match.sport_monks_id,
        match.contract_game_id,
        match.contract_address,
        match.home_team,
        match.away_team,
        new Date(match.start_time)
      )
    }

    // Start monitoring
    await monitor.startMonitoring()
    
    console.log(`WebSocket system started with ${matches.length} matches`)
    return { monitor, server }
  } catch (error) {
    console.error('Failed to start WebSocket system:', error)
    throw error
  }
}

// Example: Create a new match with WebSocket monitoring
const createNewMatchWithWebSocket = async (
  sportMonksId: number,
  homeTeam: string,
  awayTeam: string,
  startTime: Date
) => {
  const { monitor, supabaseService } = initializeWebSocketSystem()

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

    // 3. Register for WebSocket monitoring
    await monitor.registerMatch(
      sportMonksId,
      contractGameId,
      contractAddress,
      homeTeam,
      awayTeam,
      startTime
    )

    console.log(`Created new match with WebSocket monitoring: ${homeTeam} vs ${awayTeam}`)
  } catch (error) {
    console.error('Failed to create new match:', error)
    throw error
  }
}

// Example: Client-side WebSocket connection
const connectToWebSocket = (matchIds: number[]) => {
  const ws = new WebSocket('ws://localhost:3001')

  ws.onopen = () => {
    console.log('Connected to WebSocket server')
    
    // Subscribe to specific matches
    ws.send(JSON.stringify({
      type: 'subscribe',
      matchIds
    }))
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'match_start':
          console.log(`Match ${data.matchId} has started!`)
          // Update your UI or trigger contract functions
          break
          
        case 'match_end':
          console.log(`Match ${data.matchId} has ended!`)
          // Update your UI or trigger contract functions
          break
          
        case 'goal':
          console.log(`Goal in match ${data.matchId}:`, data.data)
          // Update your UI
          break
          
        case 'match_update':
          console.log(`Match ${data.matchId} updated:`, data.data)
          // Update your UI with latest match data
          break
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }

  return ws
}

// Example: Server-Sent Events connection (alternative to WebSocket)
const connectToSSE = (matchIds: number[]) => {
  const eventSource = new EventSource(`http://localhost:3001/api/matches/stream?matchIds=${matchIds.join(',')}`)

  eventSource.onopen = () => {
    console.log('SSE connection established')
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'match_start':
          console.log(`Match ${data.matchId} has started!`)
          break
          
        case 'match_end':
          console.log(`Match ${data.matchId} has ended!`)
          break
          
        case 'goal':
          console.log(`Goal in match ${data.matchId}:`, data.data)
          break
          
        case 'match_update':
          console.log(`Match ${data.matchId} updated:`, data.data)
          break
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
  }

  return eventSource
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
  startWebSocketSystem,
  createNewMatchWithWebSocket,
  connectToWebSocket,
  connectToSSE,
  SupabaseService
}

export type { SupabaseMatch } 