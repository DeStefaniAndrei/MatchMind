// MatchMind Match Monitor
// 

// import { GameFactory } from '../contracts/GameFactory.sol/GameFactory.json'
// import { GamePool } from '../contracts/GamePool.sol/GamePool.json'
// import { createPublicClient, http, createWalletClient, parseEther } from 'viem'
// import { chiliz } from './wagmi'
import { questionLifecycle } from './question/question-lifecycle'

// Database-like structure to track matches
interface MatchRecord {
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

interface MatchEvent {
  matchId: number
  eventType: 'match_start' | 'match_end' | 'goal' | 'card' | 'substitution'
  timestamp: Date
  data: any
}

// class MatchMonitor {
//   private matches: Map<number, MatchRecord> = new Map()
//   private factoryContract: any
//   private publicClient: any
//   private walletClient: any
//   private isMonitoring: boolean = false
//   private checkInterval: NodeJS.Timeout | null = null

//   constructor(
//     factoryAddress: string,
//     privateKey: string
//   ) {
//     this.publicClient = createPublicClient({
//       chain: chiliz,
//       transport: http()
//     })

//     this.walletClient = createWalletClient({
//       chain: chiliz,
//       transport: http()
//     })

//     // Initialize factory contract
//     this.factoryContract = {
//       address: factoryAddress,
//       abi: GameFactory.abi
//     }
//   }

//   /**
//    * Register a new match for monitoring
//    */
//   async registerMatch(
//     sportMonksId: number,
//     homeTeam: string,
//     awayTeam: string,
//     startTime: Date
//   ): Promise<number> {
//     try {
//       // Create new game in contract
//       const gameId = await this.createContractGame()
      
//       // Store match record
//       const matchRecord: MatchRecord = {
//         sportMonksId,
//         contractGameId: gameId,
//         contractAddress: await this.getGameAddress(gameId),
//         homeTeam,
//         awayTeam,
//         startTime,
//         status: 'scheduled',
//         contractState: 'pre_match',
//         lastChecked: new Date()
//       }

//       this.matches.set(sportMonksId, matchRecord)
//       console.log(`Registered match ${sportMonksId} with contract game ID ${gameId}`)
      
//       return gameId
//     } catch (error) {
//       console.error('Failed to register match:', error)
//       throw error
//     }
//   }

//   /**
//    * Start monitoring all registered matches
//    */
//   async startMonitoring(): Promise<void> {
//     if (this.isMonitoring) {
//       console.log('Monitoring already active')
//       return
//     }

//     this.isMonitoring = true
//     console.log('Starting match monitoring...')

//     // Check every 30 seconds
//     this.checkInterval = setInterval(async () => {
//       await this.checkMatches()
//     }, 30000)

//     // Initial check
//     await this.checkMatches()
//   }

//   /**
//    * Stop monitoring
//    */
//   stopMonitoring(): void {
//     if (this.checkInterval) {
//       clearInterval(this.checkInterval)
//       this.checkInterval = null
//     }
//     this.isMonitoring = false
//     console.log('Match monitoring stopped')
//   }

//   /**
//    * Check all registered matches for status changes
//    */
//   private async checkMatches(): Promise<void> {
//     console.log(`Checking ${this.matches.size} registered matches...`)

//     // Process question lifecycle first
//     try {
//       await questionLifecycle.processScheduledQuestions()
//     } catch (error) {
//       console.error('Error processing question lifecycle:', error)
//     }

//     for (const [sportMonksId, matchRecord] of this.matches) {
//       try {
//         await this.checkMatch(sportMonksId, matchRecord)
//       } catch (error) {
//         console.error(`Error checking match ${sportMonksId}:`, error)
//       }
//     }
//   }

//   /**
//    * Check individual match status
//    */
//   private async checkMatch(sportMonksId: number, matchRecord: MatchRecord): Promise<void> {
//     try {
//       // Get match data from SportMonks
//       const matchData = await sportMonksAPI.getMatch(sportMonksId)
//       const match = matchData.data

//       // Update match record
//       matchRecord.lastChecked = new Date()

//       // Check if match has started
//       if (match.time && match.time.minute > 0 && matchRecord.status === 'scheduled') {
//         await this.handleMatchStart(sportMonksId, matchRecord)
//       }

//       // Check if match has ended
//       if (match.time && match.time.minute >= 90 && matchRecord.status === 'live') {
//         await this.handleMatchEnd(sportMonksId, matchRecord)
//       }

//       // Update status
//       if (match.time) {
//         if (match.time.minute > 0 && match.time.minute < 90) {
//           matchRecord.status = 'live'
//         } else if (match.time.minute >= 90) {
//           matchRecord.status = 'finished'
//         }
//       }

//     } catch (error) {
//       console.error(`Failed to check match ${sportMonksId}:`, error)
//     }
//   }

//   /**
//    * Handle match start
//    */
//   private async handleMatchStart(sportMonksId: number, matchRecord: MatchRecord): Promise<void> {
//     try {
//       console.log(`Match ${sportMonksId} has started! Triggering startMatch...`)
      
//       // Call startMatch on the contract
//       await this.startContractMatch(matchRecord.contractGameId)
      
//       // Update contract state
//       matchRecord.contractState = 'active'
//       matchRecord.status = 'live'
      
//       console.log(`Successfully started contract match ${matchRecord.contractGameId}`)
//     } catch (error) {
//       console.error(`Failed to start contract match ${matchRecord.contractGameId}:`, error)
//     }
//   }

//   /**
//    * Handle match end
//    */
//   private async handleMatchEnd(sportMonksId: number, matchRecord: MatchRecord): Promise<void> {
//     try {
//       console.log(`Match ${sportMonksId} has ended! Triggering endMatch...`)
      
//       // Call endMatch on the contract
//       await this.endContractMatch(matchRecord.contractGameId)
      
//       // Update contract state
//       matchRecord.contractState = 'ended'
//       matchRecord.status = 'finished'
      
//       console.log(`Successfully ended contract match ${matchRecord.contractGameId}`)
//     } catch (error) {
//       console.error(`Failed to end contract match ${matchRecord.contractGameId}:`, error)
//     }
//   }

//   /**
//    * Create a new game in the contract
//    */
//   private async createContractGame(): Promise<number> {
//     try {
//       const { request } = await this.publicClient.simulateContract({
//         address: this.factoryContract.address,
//         abi: this.factoryContract.abi,
//         functionName: 'createGame',
//         account: this.walletClient.account
//       })

//       const hash = await this.walletClient.writeContract(request)
//       const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

//       // Parse the GameCreated event to get the game ID
//       const gameCreatedEvent = receipt.logs.find((log: any) => 
//         log.eventName === 'GameCreated'
//       )

//       if (gameCreatedEvent) {
//         return gameCreatedEvent.args.gameId
//       } else {
//         throw new Error('GameCreated event not found in transaction receipt')
//       }
//     } catch (error) {
//       console.error('Failed to create contract game:', error)
//       throw error
//     }
//   }

//   /**
//    * Start a match in the contract
//    */
//   private async startContractMatch(gameId: number): Promise<void> {
//     try {
//       const { request } = await this.publicClient.simulateContract({
//         address: this.factoryContract.address,
//         abi: this.factoryContract.abi,
//         functionName: 'startMatch',
//         args: [gameId],
//         account: this.walletClient.account
//       })

//       const hash = await this.walletClient.writeContract(request)
//       await this.publicClient.waitForTransactionReceipt({ hash })
      
//       console.log(`Contract match ${gameId} started successfully`)
//     } catch (error) {
//       console.error(`Failed to start contract match ${gameId}:`, error)
//       throw error
//     }
//   }

//   /**
//    * End a match in the contract
//    */
//   private async endContractMatch(gameId: number): Promise<void> {
//     try {
//       const { request } = await this.publicClient.simulateContract({
//         address: this.factoryContract.address,
//         abi: this.factoryContract.abi,
//         functionName: 'endMatch',
//         args: [gameId],
//         account: this.walletClient.account
//       })

//       const hash = await this.walletClient.writeContract(request)
//       await this.publicClient.waitForTransactionReceipt({ hash })
      
//       console.log(`Contract match ${gameId} ended successfully`)
//     } catch (error) {
//       console.error(`Failed to end contract match ${gameId}:`, error)
//       throw error
//     }
//   }

//   /**
//    * Get game address by ID
//    */
//   private async getGameAddress(gameId: number): Promise<string> {
//     try {
//       const result = await this.publicClient.readContract({
//         address: this.factoryContract.address,
//         abi: this.factoryContract.abi,
//         functionName: 'getGameAddress',
//         args: [gameId]
//       })
      
//       return result as string
//     } catch (error) {
//       console.error(`Failed to get game address for ID ${gameId}:`, error)
//       throw error
//     }
//   }

//   /**
//    * Get all registered matches
//    */
//   getRegisteredMatches(): MatchRecord[] {
//     return Array.from(this.matches.values())
//   }

//   /**
//    * Get match by SportMonks ID
//    */
//   getMatch(sportMonksId: number): MatchRecord | undefined {
//     return this.matches.get(sportMonksId)
//   }

//   /**
//    * Get match by contract game ID
//    */
//   getMatchByContractId(contractGameId: number): MatchRecord | undefined {
//     return Array.from(this.matches.values()).find(
//       match => match.contractGameId === contractGameId
//     )
//   }

//   /**
//    * Remove match from monitoring
//    */
//   unregisterMatch(sportMonksId: number): boolean {
//     return this.matches.delete(sportMonksId)
//   }

//   /**
//    * Get monitoring status
//    */
//   isActive(): boolean {
//     return this.isMonitoring
//   }
// }

// // Export the monitor class
// export { MatchMonitor }
// export type { MatchRecord, MatchEvent } 