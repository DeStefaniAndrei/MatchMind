// MatchMind Match Database
// Simple database system to persist match records and link SportMonks with contracts

import fs from 'fs'
import path from 'path'

interface MatchRecord {
  sportMonksId: number
  contractGameId: number
  contractAddress: string
  homeTeam: string
  awayTeam: string
  startTime: string // ISO string
  status: 'scheduled' | 'live' | 'finished'
  contractState: 'pre_match' | 'active' | 'ended' | 'distributed'
  lastChecked: string // ISO string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

interface DatabaseStats {
  totalMatches: number
  scheduledMatches: number
  liveMatches: number
  finishedMatches: number
  activeContracts: number
}

class MatchDatabase {
  private dbPath: string
  private data: Map<number, MatchRecord> = new Map()

  constructor(dbPath: string = './data/matches.json') {
    this.dbPath = dbPath
    this.ensureDbDirectory()
    this.loadDatabase()
  }

  /**
   * Ensure database directory exists
   */
  private ensureDbDirectory(): void {
    const dir = path.dirname(this.dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * Load database from file
   */
  private loadDatabase(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8')
        const records: MatchRecord[] = JSON.parse(data)
        
        this.data.clear()
        records.forEach(record => {
          this.data.set(record.sportMonksId, record)
        })
        
        console.log(`Loaded ${this.data.size} match records from database`)
      } else {
        console.log('No existing database found, starting fresh')
      }
    } catch (error) {
      console.error('Failed to load database:', error)
      this.data.clear()
    }
  }

  /**
   * Save database to file
   */
  private saveDatabase(): void {
    try {
      const records = Array.from(this.data.values())
      const data = JSON.stringify(records, null, 2)
      fs.writeFileSync(this.dbPath, data, 'utf8')
    } catch (error) {
      console.error('Failed to save database:', error)
    }
  }

  /**
   * Create a new match record
   */
  createMatch(
    sportMonksId: number,
    contractGameId: number,
    contractAddress: string,
    homeTeam: string,
    awayTeam: string,
    startTime: Date
  ): MatchRecord {
    const now = new Date().toISOString()
    
    const record: MatchRecord = {
      sportMonksId,
      contractGameId,
      contractAddress,
      homeTeam,
      awayTeam,
      startTime: startTime.toISOString(),
      status: 'scheduled',
      contractState: 'pre_match',
      lastChecked: now,
      createdAt: now,
      updatedAt: now
    }

    this.data.set(sportMonksId, record)
    this.saveDatabase()
    
    console.log(`Created match record: ${homeTeam} vs ${awayTeam} (ID: ${sportMonksId})`)
    return record
  }

  /**
   * Update match status
   */
  updateMatchStatus(sportMonksId: number, status: MatchRecord['status']): boolean {
    const record = this.data.get(sportMonksId)
    if (!record) {
      console.warn(`Match ${sportMonksId} not found in database`)
      return false
    }

    record.status = status
    record.updatedAt = new Date().toISOString()
    this.saveDatabase()
    
    console.log(`Updated match ${sportMonksId} status to: ${status}`)
    return true
  }

  /**
   * Update contract state
   */
  updateContractState(sportMonksId: number, contractState: MatchRecord['contractState']): boolean {
    const record = this.data.get(sportMonksId)
    if (!record) {
      console.warn(`Match ${sportMonksId} not found in database`)
      return false
    }

    record.contractState = contractState
    record.updatedAt = new Date().toISOString()
    this.saveDatabase()
    
    console.log(`Updated match ${sportMonksId} contract state to: ${contractState}`)
    return true
  }

  /**
   * Update last checked time
   */
  updateLastChecked(sportMonksId: number): boolean {
    const record = this.data.get(sportMonksId)
    if (!record) {
      return false
    }

    record.lastChecked = new Date().toISOString()
    record.updatedAt = new Date().toISOString()
    this.saveDatabase()
    return true
  }

  /**
   * Get match by SportMonks ID
   */
  getMatch(sportMonksId: number): MatchRecord | undefined {
    return this.data.get(sportMonksId)
  }

  /**
   * Get match by contract game ID
   */
  getMatchByContractId(contractGameId: number): MatchRecord | undefined {
    return Array.from(this.data.values()).find(
      record => record.contractGameId === contractGameId
    )
  }

  /**
   * Get all matches
   */
  getAllMatches(): MatchRecord[] {
    return Array.from(this.data.values())
  }

  /**
   * Get matches by status
   */
  getMatchesByStatus(status: MatchRecord['status']): MatchRecord[] {
    return Array.from(this.data.values()).filter(
      record => record.status === status
    )
  }

  /**
   * Get matches by contract state
   */
  getMatchesByContractState(contractState: MatchRecord['contractState']): MatchRecord[] {
    return Array.from(this.data.values()).filter(
      record => record.contractState === contractState
    )
  }

  /**
   * Get upcoming matches (scheduled, not started yet)
   */
  getUpcomingMatches(): MatchRecord[] {
    const now = new Date()
    return Array.from(this.data.values()).filter(record => {
      const startTime = new Date(record.startTime)
      return record.status === 'scheduled' && startTime > now
    })
  }

  /**
   * Get live matches
   */
  getLiveMatches(): MatchRecord[] {
    return this.getMatchesByStatus('live')
  }

  /**
   * Get finished matches
   */
  getFinishedMatches(): MatchRecord[] {
    return this.getMatchesByStatus('finished')
  }

  /**
   * Delete match record
   */
  deleteMatch(sportMonksId: number): boolean {
    const deleted = this.data.delete(sportMonksId)
    if (deleted) {
      this.saveDatabase()
      console.log(`Deleted match record: ${sportMonksId}`)
    }
    return deleted
  }

  /**
   * Get database statistics
   */
  getStats(): DatabaseStats {
    const records = Array.from(this.data.values())
    
    return {
      totalMatches: records.length,
      scheduledMatches: records.filter(r => r.status === 'scheduled').length,
      liveMatches: records.filter(r => r.status === 'live').length,
      finishedMatches: records.filter(r => r.status === 'finished').length,
      activeContracts: records.filter(r => r.contractState === 'active').length
    }
  }

  /**
   * Search matches by team name
   */
  searchMatchesByTeam(teamName: string): MatchRecord[] {
    const searchTerm = teamName.toLowerCase()
    return Array.from(this.data.values()).filter(record => 
      record.homeTeam.toLowerCase().includes(searchTerm) ||
      record.awayTeam.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get matches within date range
   */
  getMatchesInDateRange(startDate: Date, endDate: Date): MatchRecord[] {
    return Array.from(this.data.values()).filter(record => {
      const matchDate = new Date(record.startTime)
      return matchDate >= startDate && matchDate <= endDate
    })
  }

  /**
   * Backup database
   */
  backup(backupPath: string): void {
    try {
      const records = Array.from(this.data.values())
      const data = JSON.stringify(records, null, 2)
      fs.writeFileSync(backupPath, data, 'utf8')
      console.log(`Database backed up to: ${backupPath}`)
    } catch (error) {
      console.error('Failed to backup database:', error)
    }
  }

  /**
   * Restore database from backup
   */
  restore(backupPath: string): void {
    try {
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, 'utf8')
        const records: MatchRecord[] = JSON.parse(data)
        
        this.data.clear()
        records.forEach(record => {
          this.data.set(record.sportMonksId, record)
        })
        
        this.saveDatabase()
        console.log(`Database restored from: ${backupPath}`)
      } else {
        console.error(`Backup file not found: ${backupPath}`)
      }
    } catch (error) {
      console.error('Failed to restore database:', error)
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear()
    this.saveDatabase()
    console.log('Database cleared')
  }
}

export { MatchDatabase }
export type { MatchRecord, DatabaseStats } 