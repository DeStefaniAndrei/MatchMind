// WebSocket/SSE Server for MatchMind
// Provides real-time SportMonks data to clients

// import { sportMonksAPI } from './sportmonks-api'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

interface ClientConnection {
  id: string
  ws?: WebSocket
  res?: any // Response object for SSE
  matchIds: number[]
  lastPing: Date
}

class MatchWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, ClientConnection> = new Map()
  private matchSubscriptions: Map<number, Set<string>> = new Map()
  private isRunning: boolean = false
  private updateInterval: NodeJS.Timeout | null = null

  constructor(port: number = 3001) {
    const server = createServer()
    this.wss = new WebSocketServer({ server })
    
    server.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`)
    })

    this.setupWebSocketHandlers()
    this.setupSSEEndpoints(server)
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: any, req: any) => {
      const clientId = this.generateClientId()
      const client: ClientConnection = {
        id: clientId,
        ws,
        matchIds: [],
        lastPing: new Date()
      }

      this.clients.set(clientId, client)
      console.log(`WebSocket client connected: ${clientId}`)

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        clientId,
        timestamp: new Date().toISOString()
      }))

      // Handle incoming messages
      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleWebSocketMessage(clientId, message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      })

      // Handle client disconnect
      ws.on('close', () => {
        this.removeClient(clientId)
        console.log(`WebSocket client disconnected: ${clientId}`)
      })

      // Handle errors
      ws.on('error', (error: any) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
        this.removeClient(clientId)
      })
    })
  }

  /**
   * Setup Server-Sent Events endpoints
   */
  private setupSSEEndpoints(server: any): void {
    server.on('request', (req: any, res: any) => {
      if (req.url?.startsWith('/api/matches/stream')) {
        this.handleSSERequest(req, res)
      }
    })
  }

  /**
   * Handle SSE requests
   */
  private handleSSERequest(req: any, res: any): void {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const matchIds = url.searchParams.get('matchIds')?.split(',').map(Number) || []

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    })

    const clientId = this.generateClientId()
    const client: ClientConnection = {
      id: clientId,
      res,
      matchIds,
      lastPing: new Date()
    }

    this.clients.set(clientId, client)

    // Subscribe to matches
    matchIds.forEach(matchId => {
      this.subscribeToMatch(clientId, matchId)
    })

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connection_established',
      clientId,
      timestamp: new Date().toISOString()
    })}\n\n`)

    // Handle client disconnect
    req.on('close', () => {
      this.removeClient(clientId)
    })
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case 'subscribe':
        if (message.matchIds) {
          message.matchIds.forEach((matchId: number) => {
            this.subscribeToMatch(clientId, matchId)
          })
        }
        break

      case 'unsubscribe':
        if (message.matchIds) {
          message.matchIds.forEach((matchId: number) => {
            this.unsubscribeFromMatch(clientId, matchId)
          })
        }
        break

      case 'ping':
        client.lastPing = new Date()
        if (client.ws) {
          client.ws.send(JSON.stringify({ type: 'pong' }))
        }
        break
    }
  }

  /**
   * Subscribe client to match updates
   */
  private subscribeToMatch(clientId: string, matchId: number): void {
    const client = this.clients.get(clientId)
    if (!client) return

    if (!client.matchIds.includes(matchId)) {
      client.matchIds.push(matchId)
    }

    if (!this.matchSubscriptions.has(matchId)) {
      this.matchSubscriptions.set(matchId, new Set())
    }

    this.matchSubscriptions.get(matchId)!.add(clientId)
    console.log(`Client ${clientId} subscribed to match ${matchId}`)
  }

  /**
   * Unsubscribe client from match updates
   */
  private unsubscribeFromMatch(clientId: string, matchId: number): void {
    const client = this.clients.get(clientId)
    if (!client) return

    client.matchIds = client.matchIds.filter(id => id !== matchId)

    const subscribers = this.matchSubscriptions.get(matchId)
    if (subscribers) {
      subscribers.delete(clientId)
      if (subscribers.size === 0) {
        this.matchSubscriptions.delete(matchId)
      }
    }

    console.log(`Client ${clientId} unsubscribed from match ${matchId}`)
  }

  /**
   * Remove client
   */
  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId)
    if (!client) return

    // Unsubscribe from all matches
    client.matchIds.forEach(matchId => {
      this.unsubscribeFromMatch(clientId, matchId)
    })

    this.clients.delete(clientId)
  }

  /**
   * Start the update loop
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Starting match update loop...')

    // Update every 10 seconds
    this.updateInterval = setInterval(async () => {
      await this.updateMatches()
    }, 10000)

    // Initial update
    this.updateMatches()
  }

  /**
   * Stop the update loop
   */
  stop(): void {
    this.isRunning = false
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    console.log('Stopped match update loop')
  }

  /**
   * Update all subscribed matches
   */
  private async updateMatches(): Promise<void> {
    const matchIds = Array.from(this.matchSubscriptions.keys())
    
    for (const matchId of matchIds) {
      try {
        await this.updateMatch(matchId)
      } catch (error) {
        console.error(`Failed to update match ${matchId}:`, error)
      }
    }
  }

  /**
   * Update a specific match
   */
  private async updateMatch(matchId: number): Promise<void> {
    try {
      const matchData = await sportMonksAPI.getMatch(matchId)
      const match = matchData.data

      const subscribers = this.matchSubscriptions.get(matchId)
      if (!subscribers || subscribers.size === 0) return

      const updateData = {
        type: 'match_update',
        matchId,
        data: match,
        timestamp: new Date().toISOString()
      }

      // Send to WebSocket clients
      subscribers.forEach(clientId => {
        const client = this.clients.get(clientId)
        if (client?.ws && client.ws.readyState === 1) {
          client.ws.send(JSON.stringify(updateData))
        }
      })

      // Send to SSE clients
      subscribers.forEach(clientId => {
        const client = this.clients.get(clientId)
        if (client?.res && !client.res.destroyed) {
          client.res.write(`data: ${JSON.stringify(updateData)}\n\n`)
        }
      })

      // Check for specific events
      await this.checkMatchEvents(matchId, match)

    } catch (error) {
      console.error(`Failed to fetch match ${matchId}:`, error)
    }
  }

  /**
   * Check for specific match events
   */
  private async checkMatchEvents(matchId: number, match: any): Promise<void> {
    const subscribers = this.matchSubscriptions.get(matchId)
    if (!subscribers) return

    // Check for match start
    if (match.time && match.time.minute > 0) {
      const startEvent = {
        type: 'match_start',
        matchId,
        data: match,
        timestamp: new Date().toISOString()
      }

      this.broadcastToSubscribers(subscribers, startEvent)
    }

    // Check for match end
    if (match.time && match.time.minute >= 90) {
      const endEvent = {
        type: 'match_end',
        matchId,
        data: match,
        timestamp: new Date().toISOString()
      }

      this.broadcastToSubscribers(subscribers, endEvent)
    }

    // Check for goals
    if (match.events) {
      const goalEvents = match.events.filter((event: any) => 
        event.type === 'goal' && event.minute > 0
      )

      goalEvents.forEach((goal: any) => {
        const goalEvent = {
          type: 'goal',
          matchId,
          data: goal,
          timestamp: new Date().toISOString()
        }

        this.broadcastToSubscribers(subscribers, goalEvent)
      })
    }
  }

  /**
   * Broadcast event to subscribers
   */
  private broadcastToSubscribers(subscribers: Set<string>, event: any): void {
    subscribers.forEach(clientId => {
      const client = this.clients.get(clientId)
      if (!client) return

      // Send to WebSocket clients
      if (client.ws && client.ws.readyState === 1) {
        client.ws.send(JSON.stringify(event))
      }

      // Send to SSE clients
      if (client.res && !client.res.destroyed) {
        client.res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    })
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get server statistics
   */
  getStats(): any {
    return {
      totalClients: this.clients.size,
      totalSubscriptions: this.matchSubscriptions.size,
      activeMatches: Array.from(this.matchSubscriptions.keys()),
      isRunning: this.isRunning
    }
  }
}

export { MatchWebSocketServer } 