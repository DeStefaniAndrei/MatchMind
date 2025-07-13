// MatchMind Match Service
// Monitors SportMonks API and triggers contract functions for match lifecycle
// Database integration will be handled separately with Supabase

import { sportMonksAPI, LiveMatch } from './sportmonks-api'
import { createPublicClient, http, createWalletClient } from 'viem'
import { chiliz } from './wagmi'

// Simple in-memory storage for active matches
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
}

class MatchService {
  private activeMatches: Map<number, ActiveMatch> = new Map()
  private factoryAddress: string
  private privateKey: string
  private publicClient: any
  private walletClient: any
  private isMonitoring: boolean = false
  private checkInterval: NodeJS.Timeout | null = null

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
   * This should be called when you create a match in your Supabase database
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
    console.log(`Registered match ${sportMonksId} (${homeTeam} vs ${awayTeam}) for monitoring`)
  }

  /**
   * Start monitoring all registered matches
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Monitoring already active')
      return
    }

    this.isMonitoring = true
    console.log('Starting match monitoring...')

    // Check every 30 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkMatches()
    }, 30000)

    // Initial check
    await this.checkMatches()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isMonitoring = false
    console.log('Match monitoring stopped')
  }

  /**
   * Check all registered matches for status changes
   */
  private async checkMatches(): Promise<void> {
    console.log(`Checking ${this.activeMatches.size} active matches...`)

    for (const [sportMonksId, match] of this.activeMatches) {
      try {
        await this.checkMatch(sportMonksId, match)
      } catch (error) {
        console.error(`Error checking match ${sportMonksId}:`, error)
      }
    }
  }

  /**
   * Check individual match status
   */
  private async checkMatch(sportMonksId: number, match: ActiveMatch): Promise<void> {
    try {
      // Get match data from SportMonks
      const matchData = await sportMonksAPI.getMatch(sportMonksId)
      const liveMatch = matchData.data

      // Update last checked time
      match.lastChecked = new Date()

      // Check if match has started
      if (liveMatch.time && liveMatch.time.minute > 0 && match.status === 'scheduled') {
        await this.handleMatchStart(sportMonksId, match)
      }

      // Check if match has ended
      if (liveMatch.time && liveMatch.time.minute >= 90 && match.status === 'live') {
        await this.handleMatchEnd(sportMonksId, match)
      }

      // Update status based on match time
      if (liveMatch.time) {
        if (liveMatch.time.minute > 0 && liveMatch.time.minute < 90) {
          match.status = 'live'
        } else if (liveMatch.time.minute >= 90) {
          match.status = 'finished'
        }
      }

    } catch (error) {
      console.error(`Failed to check match ${sportMonksId}:`, error)
    }
  }

  /**
   * Handle match start - trigger startMatch contract function
   */
  private async handleMatchStart(sportMonksId: number, match: ActiveMatch): Promise<void> {
    try {
      console.log(`Match ${sportMonksId} has started! Triggering startMatch...`)
      
      // Call startMatch on the contract
      await this.startContractMatch(match.contractGameId)
      
      // Update contract state
      match.contractState = 'active'
      match.status = 'live'
      
      console.log(`Successfully started contract match ${match.contractGameId}`)
      
      // Here you would also update your Supabase database
      // await updateMatchInDatabase(sportMonksId, { status: 'live', contractState: 'active' })
      
    } catch (error) {
      console.error(`Failed to start contract match ${match.contractGameId}:`, error)
    }
  }

  /**
   * Handle match end - trigger endMatch contract function
   */
  private async handleMatchEnd(sportMonksId: number, match: ActiveMatch): Promise<void> {
    try {
      console.log(`Match ${sportMonksId} has ended! Triggering endMatch...`)
      
      // Call endMatch on the contract
      await this.endContractMatch(match.contractGameId)
      
      // Update contract state
      match.contractState = 'ended'
      match.status = 'finished'
      
      console.log(`Successfully ended contract match ${match.contractGameId}`)
      
      // Here you would also update your Supabase database
      // await updateMatchInDatabase(sportMonksId, { status: 'finished', contractState: 'ended' })
      
    } catch (error) {
      console.error(`Failed to end contract match ${match.contractGameId}:`, error)
    }
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
   * Get match by contract game ID
   */
  getMatchByContractId(contractGameId: number): ActiveMatch | undefined {
    return Array.from(this.activeMatches.values()).find(
      match => match.contractGameId === contractGameId
    )
  }

  /**
   * Remove match from monitoring
   */
  unregisterMatch(sportMonksId: number): boolean {
    return this.activeMatches.delete(sportMonksId)
  }

  /**
   * Get monitoring status
   */
  isActive(): boolean {
    return this.isMonitoring
  }

  /**
   * Get matches by status
   */
  getMatchesByStatus(status: ActiveMatch['status']): ActiveMatch[] {
    return Array.from(this.activeMatches.values()).filter(
      match => match.status === status
    )
  }

  /**
   * Get live matches
   */
  getLiveMatches(): ActiveMatch[] {
    return this.getMatchesByStatus('live')
  }

  /**
   * Get scheduled matches
   */
  getScheduledMatches(): ActiveMatch[] {
    return this.getMatchesByStatus('scheduled')
  }

  /**
   * Get finished matches
   */
  getFinishedMatches(): ActiveMatch[] {
    return this.getMatchesByStatus('finished')
  }
}

export { MatchService }
export type { ActiveMatch } 