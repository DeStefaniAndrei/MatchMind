// WebSocket-based Match Monitor for MatchMind
// More efficient than polling - uses real-time connections

// import { sportMonksAPI, LiveMatch } from './sportmonks-api'
import { createPublicClient, http, createWalletClient } from 'viem'
import { chiliz } from './wagmi'

interface ActiveMatch {
  sportMonksId: number
  contractGameId: number
  contractAddress: string
  homeTeam: string
  awayTeam: string
  startTime: Date
  status: 'scheduled' | 'live' | 'finished'
  contractState: 'pre_match' | 'active' | 'ended' | 'distributed'
  lastChecked: Date
  websocketConnection?: WebSocket
}

interface MatchEvent {
  type: 'match_start' | 'match_end' | 'goal' | 'card' | 'substitution' | 'minute_update'
  matchId: number
  data: any
  timestamp: Date
}

class WebSocketMonitor {
  private activeMatches: Map<number, ActiveMatch> = new Map()
  private factoryAddress: string
  private privateKey: string
  private publicClient: any
  private walletClient: any
  private isMonitoring: boolean = false
  private eventSource: EventSource | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  constructor(factoryAddress: string, privateKey: string) {
    this.factoryAddress = factoryAddress
    this.privateKey = privateKey

    this.publicClient = createPublicClient({
      chain: chiliz,
      transport: http()
    })

    this.walletClient = createWalletClient({
      chain: chiliz,
      transport: http(),
      account: privateKey
    })
  }

  /**
   * Register a match for monitoring
   */
  async registerMatch(
    sportMonksId: number,
    contractGameId: number,
    contractAddress: string,
    homeTeam: string,
    awayTeam: string,
    startTime: Date
  ): Promise<void> {
    const match: ActiveMatch = {
      sportMonksId,
      contractGameId,
      contractAddress,
      homeTeam,
      awayTeam,
      startTime,
      status: 'scheduled',
      contractState: 'pre_match',
      lastChecked: new Date()
    }

    this.activeMatches.set(sportMonksId, match)
    console.log(`Registered match ${sportMonksId} (${homeTeam} vs ${awayTeam}) for WebSocket monitoring`)
  }

  /**
   * Start WebSocket monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('WebSocket monitoring already active')
      return
    }

    this.isMonitoring = true
    console.log('Starting WebSocket monitoring...')

    // Start Server-Sent Events connection for real-time updates
    await this.startSSEConnection()

    // Also start individual WebSocket connections for each match
    await this.startIndividualWebSockets()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    
    // Close SSE connection
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    // Close individual WebSocket connections
    for (const [sportMonksId, match] of this.activeMatches) {
      if (match.websocketConnection) {
        match.websocketConnection.close()
        match.websocketConnection = undefined
      }
    }

    console.log('WebSocket monitoring stopped')
  }

  /**
   * Start Server-Sent Events connection for real-time updates
   */
  private async startSSEConnection(): Promise<void> {
    try {
      // Create a custom SSE endpoint that aggregates SportMonks data
      const sseUrl = this.createSSEEndpoint()
      
      this.eventSource = new EventSource(sseUrl)
      
      this.eventSource.onopen = () => {
        console.log('SSE connection established')
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleSSEMessage(data)
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        this.handleSSEError()
      }

    } catch (error) {
      console.error('Failed to start SSE connection:', error)
      // Fallback to polling if SSE fails
      this.fallbackToPolling()
    }
  }

  /**
   * Create SSE endpoint URL
   * In production, this would be your own server endpoint that aggregates SportMonks data
   */
  private createSSEEndpoint(): string {
    const matchIds = Array.from(this.activeMatches.keys()).join(',')
    // This would be your server endpoint that streams SportMonks data
    return `/api/matches/stream?matchIds=${matchIds}`
  }

  /**
   * Handle SSE messages
   */
  private handleSSEMessage(data: any): void {
    const { matchId, eventType, matchData } = data

    const match = this.activeMatches.get(matchId)
    if (!match) return

    match.lastChecked = new Date()

    switch (eventType) {
      case 'match_start':
        this.handleMatchStart(matchId, match)
        break
      case 'match_end':
        this.handleMatchEnd(matchId, match)
        break
      case 'minute_update':
        this.handleMinuteUpdate(matchId, match, matchData)
        break
      case 'goal':
        this.handleGoal(matchId, match, matchData)
        break
      case 'card':
        this.handleCard(matchId, match, matchData)
        break
      case 'substitution':
        this.handleSubstitution(matchId, match, matchData)
        break
    }
  }

  /**
   * Handle SSE connection errors
   */
  private handleSSEError(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`SSE reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        if (this.isMonitoring) {
          this.startSSEConnection()
        }
      }, 5000 * this.reconnectAttempts) // Exponential backoff
    } else {
      console.error('Max SSE reconnection attempts reached, falling back to polling')
      this.fallbackToPolling()
    }
  }

  /**
   * Start individual WebSocket connections for each match
   * This provides more granular control and redundancy
   */
  private async startIndividualWebSockets(): Promise<void> {
    for (const [sportMonksId, match] of this.activeMatches) {
      await this.startMatchWebSocket(sportMonksId, match)
    }
  }

  /**
   * Start WebSocket connection for a specific match
   */
  private async startMatchWebSocket(sportMonksId: number, match: ActiveMatch): Promise<void> {
    try {
      // Create WebSocket connection to your server endpoint
      const wsUrl = `ws://localhost:3001/api/matches/${sportMonksId}/stream`
      
      const ws = new WebSocket(wsUrl)
      match.websocketConnection = ws

      ws.onopen = () => {
        console.log(`WebSocket connected for match ${sportMonksId}`)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(sportMonksId, data)
        } catch (error) {
          console.error(`Failed to parse WebSocket message for match ${sportMonksId}:`, error)
        }
      }

      ws.onerror = (error) => {
        console.error(`WebSocket error for match ${sportMonksId}:`, error)
      }

      ws.onclose = () => {
        console.log(`WebSocket closed for match ${sportMonksId}`)
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.isMonitoring && this.activeMatches.has(sportMonksId)) {
            this.startMatchWebSocket(sportMonksId, match)
          }
        }, 5000)
      }

    } catch (error) {
      console.error(`Failed to start WebSocket for match ${sportMonksId}:`, error)
    }
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(sportMonksId: number, data: any): void {
    const match = this.activeMatches.get(sportMonksId)
    if (!match) return

    match.lastChecked = new Date()

    const { eventType, matchData } = data

    switch (eventType) {
      case 'match_start':
        this.handleMatchStart(sportMonksId, match)
        break
      case 'match_end':
        this.handleMatchEnd(sportMonksId, match)
        break
      case 'minute_update':
        this.handleMinuteUpdate(sportMonksId, match, matchData)
        break
    }
  }

  /**
   * Handle match start
   */
  private async handleMatchStart(sportMonksId: number, match: ActiveMatch): Promise<void> {
    if (match.status !== 'scheduled') return

    try {
      console.log(`Match ${sportMonksId} has started! Triggering startMatch...`)
      
      await this.startContractMatch(match.contractGameId)
      
      match.contractState = 'active'
      match.status = 'live'
      
      console.log(`Successfully started contract match ${match.contractGameId}`)
      
    } catch (error) {
      console.error(`Failed to start contract match ${match.contractGameId}:`, error)
    }
  }

  /**
   * Handle match end
   */
  private async handleMatchEnd(sportMonksId: number, match: ActiveMatch): Promise<void> {
    if (match.status !== 'live') return

    try {
      console.log(`Match ${sportMonksId} has ended! Triggering endMatch...`)
      
      await this.endContractMatch(match.contractGameId)
      
      match.contractState = 'ended'
      match.status = 'finished'
      
      console.log(`Successfully ended contract match ${match.contractGameId}`)
      
    } catch (error) {
      console.error(`Failed to end contract match ${match.contractGameId}:`, error)
    }
  }

  /**
   * Handle minute updates
   */
  private handleMinuteUpdate(sportMonksId: number, match: ActiveMatch, matchData: any): void {
    if (matchData.time && matchData.time.minute) {
      const minute = matchData.time.minute
      
      // Update match status based on minute
      if (minute > 0 && minute < 90 && match.status === 'scheduled') {
        match.status = 'live'
      } else if (minute >= 90 && match.status === 'live') {
        match.status = 'finished'
      }
    }
  }

  /**
   * Handle goal events
   */
  private handleGoal(sportMonksId: number, match: ActiveMatch, goalData: any): void {
    console.log(`Goal scored in match ${sportMonksId}:`, goalData)
    // You can add specific logic for goal events
  }

  /**
   * Handle card events
   */
  private handleCard(sportMonksId: number, match: ActiveMatch, cardData: any): void {
    console.log(`Card shown in match ${sportMonksId}:`, cardData)
    // You can add specific logic for card events
  }

  /**
   * Handle substitution events
   */
  private handleSubstitution(sportMonksId: number, match: ActiveMatch, subData: any): void {
    console.log(`Substitution in match ${sportMonksId}:`, subData)
    // You can add specific logic for substitution events
  }

  /**
   * Fallback to polling if WebSocket/SSE fails
   */
  private fallbackToPolling(): void {
    console.log('Falling back to polling method...')
    
    const pollInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(pollInterval)
        return
      }

      for (const [sportMonksId, match] of this.activeMatches) {
        try {
          const matchData = await sportMonksAPI.getMatch(sportMonksId)
          this.handleMinuteUpdate(sportMonksId, match, matchData.data)
        } catch (error) {
          console.error(`Failed to poll match ${sportMonksId}:`, error)
        }
      }
    }, 30000) // Poll every 30 seconds as fallback
  }

  /**
   * Start a match in the contract
   */
  private async startContractMatch(gameId: number): Promise<void> {
    try {
      const { request } = await this.publicClient.simulateContract({
        address: this.factoryAddress,
        abi: [
          {
            "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
            "name": "startMatch",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'startMatch',
        args: [gameId],
        account: this.walletClient.account
      })

      const hash = await this.walletClient.writeContract(request)
      await this.publicClient.waitForTransactionReceipt({ hash })
      
      console.log(`Contract match ${gameId} started successfully`)
    } catch (error) {
      console.error(`Failed to start contract match ${gameId}:`, error)
      throw error
    }
  }

  /**
   * End a match in the contract
   */
  private async endContractMatch(gameId: number): Promise<void> {
    try {
      const { request } = await this.publicClient.simulateContract({
        address: this.factoryAddress,
        abi: [
          {
            "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
            "name": "endMatch",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'endMatch',
        args: [gameId],
        account: this.walletClient.account
      })

      const hash = await this.walletClient.writeContract(request)
      await this.publicClient.waitForTransactionReceipt({ hash })
      
      console.log(`Contract match ${gameId} ended successfully`)
    } catch (error) {
      console.error(`Failed to end contract match ${gameId}:`, error)
      throw error
    }
  }

  /**
   * Get all active matches
   */
  getActiveMatches(): ActiveMatch[] {
    return Array.from(this.activeMatches.values())
  }

  /**
   * Get match by SportMonks ID
   */
  getMatch(sportMonksId: number): ActiveMatch | undefined {
    return this.activeMatches.get(sportMonksId)
  }

  /**
   * Remove match from monitoring
   */
  unregisterMatch(sportMonksId: number): boolean {
    const match = this.activeMatches.get(sportMonksId)
    if (match && match.websocketConnection) {
      match.websocketConnection.close()
    }
    return this.activeMatches.delete(sportMonksId)
  }

  /**
   * Get monitoring status
   */
  isActive(): boolean {
    return this.isMonitoring
  }
}

export { WebSocketMonitor }
export type { ActiveMatch, MatchEvent } 