//Used by api to simulate calling actual data

import type { Match, MatchEvent, CumulativeMinuteStats } from "./types"
import { getSimulatedMinuteMs } from "./sim-config"
// Avoid bundling Node fs/path into client builds
// We'll require them lazily only on the server

interface SimState {
  baseMatch: Match
  currentMinute: number
}

class MatchSimulator {
  private states: Map<string, SimState> = new Map()
  private tickHandle: ReturnType<typeof setInterval> | null = null
  private started: boolean = false
  private lastTickTime: number = 0

  async start(): Promise<void> {
    if (this.started) return
    // Seed from simplified JSON at runtime; normalize state per match
    const seeded = await this.loadTrainingMatches()
    for (const m of seeded) {
      const id = String(m.id)
      this.states.set(id, { baseMatch: { ...m, id }, currentMinute: 0 })
    }

    const interval = getSimulatedMinuteMs()
    this.tickHandle = setInterval(() => this.tick(), interval)
    this.started = true
    this.lastTickTime = Date.now()
  }

  stop(): void {
    if (this.tickHandle) clearInterval(this.tickHandle)
    this.tickHandle = null
    this.started = false
  }

  private tick(): void {
    const now = Date.now()
    this.lastTickTime = now
    
    const updates: string[] = []
    for (const [id, state] of this.states) {
      const prev = state.currentMinute
      const next = Math.min((state.currentMinute ?? 0) + 1, 90)
      state.currentMinute = next
      updates.push(`${id}:${prev}->${next}`)
    }
  }

  private deriveMatch(state: SimState): Match {
    const eventsAll: MatchEvent[] = state.baseMatch.events || []
    const eventsVisible = eventsAll.filter(e => (typeof e.minute === "number" ? e.minute <= state.currentMinute : true))
    const cumulative: CumulativeMinuteStats[] = this.buildCumulative(eventsAll, state.currentMinute)
    const { homeScore, awayScore } = this.calculateScores(eventsVisible)
    return {
      ...state.baseMatch,
      minute: state.currentMinute,
      events: eventsVisible,
      cumulativeStats: cumulative,
      homeScore,
      awayScore,
      status: state.currentMinute >= 90 ? "completed" : (state.currentMinute > 0 ? "live" : (state.baseMatch.status || "upcoming" as any)),
    }
  }

  private buildCumulative(all: MatchEvent[], upToMinute: number): CumulativeMinuteStats[] {
    const byTypeTotals: Record<string, number> = {}
    const byTeamTotals: { home: Record<string, number>, away: Record<string, number>, unknown: Record<string, number> } = {
      home: {},
      away: {},
      unknown: {}
    }
    const result: CumulativeMinuteStats[] = []

    // index events by minute
    const eventsByMinute = new Map<number, MatchEvent[]>()
    for (const e of all) {
      const m = typeof e.minute === 'number' ? e.minute : 0
      if (!eventsByMinute.has(m)) eventsByMinute.set(m, [])
      eventsByMinute.get(m)!.push(e)
    }

    for (let minute = 0; minute <= upToMinute; minute++) {
      const atMinute = eventsByMinute.get(minute) || []
      for (const e of atMinute) {
        byTypeTotals[e.type] = (byTypeTotals[e.type] || 0) + 1
        const bucket = e.team === 'home' ? byTeamTotals.home : e.team === 'away' ? byTeamTotals.away : byTeamTotals.unknown
        bucket[e.type] = (bucket[e.type] || 0) + 1
      }
      // snapshot for this minute
      result.push({
        minute,
        byType: { ...byTypeTotals },
        byTeam: {
          home: { ...byTeamTotals.home },
          away: { ...byTeamTotals.away },
          unknown: { ...byTeamTotals.unknown },
        }
      })
    }
    return result
  }

  private calculateScores(events: MatchEvent[]): { homeScore: number, awayScore: number } {
    let homeScore = 0
    let awayScore = 0
    
    for (const event of events) {
      if (event.type === 'shot_goal') {
        if (event.team === 'home') homeScore++
        else if (event.team === 'away') awayScore++
      }
    }
    
    return { homeScore, awayScore }
  }

  private async loadTrainingMatches(): Promise<Match[]> {
    try {
      // Dynamic imports to avoid client bundling
      const path = await import('path')
      const fs = await import('fs')
      const trainingDir = path.join(process.cwd(), 'artifacts', 'modified-stats-json')
      const files: string[] = fs.readdirSync(trainingDir).filter((f: string) => f.endsWith('.json')).slice(0, 5)
      const matches: Match[] = []

      let matchIndex = 1
      for (const file of files) {
        const filePath = path.join(trainingDir, file)
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        const homeTeam = data.find((e: any) => e.player1_team)?.player1_team || 'Home Team'
        const awayTeam = data.find((e: any) => e.player1_team && e.player1_team !== homeTeam)?.player1_team || 'Away Team'

        const events: MatchEvent[] = []
        let baseMinute: number | null = null
        let eventId = 1
        for (let i = 0; i < data.length; i++) { // include every event
          const ev = data[i]
          const minute = this.timestampToMinute(ev.timestamp)
          if (baseMinute === null) baseMinute = minute
          events.push({
            id: `${matchIndex}-${eventId++}`,
            type: ev.event_type,
            minute: Math.max(0, minute - (baseMinute ?? minute)),
            player: ev.player1 || 'Unknown Player',
            team: this.determineTeam(ev.player1_team, homeTeam, awayTeam),
            description: `${ev.event_type} by ${ev.player1 || 'Unknown Player'}`,
          })
        }

        matches.push({
          id: String(matchIndex++),
          homeTeam,
          awayTeam,
          startTime: new Date().toISOString(),
          status: 'live',
          participants: 0,
          totalStake: 0,
          homeScore: 0,
          awayScore: 0,
          minute: 0,
          events,
        })
      }
      return matches
    } catch {
      return []
    }
  }

  private timestampToMinute(timestamp: string): number {
    if (!timestamp) return 0
    const [time] = timestamp.split('.')
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return Math.floor((hours * 60 + minutes * 60 + seconds) / 60)
  }

  private determineTeam(teamName: string, homeTeam: string, awayTeam: string): 'home' | 'away' | 'unknown' {
    if (teamName === homeTeam) return 'home'
    if (teamName === awayTeam) return 'away'
    return 'unknown'
  }

  async getMatches(): Promise<Match[]> {
    if (!this.started) {
      await this.start()
    }
    const matches = Array.from(this.states.values()).map(s => this.deriveMatch(s))
    return matches
  }

  async getMatchById(matchId: string): Promise<Match | null> {
    if (!this.started) await this.start()
    const state = this.states.get(String(matchId))
    if (!state) return null
    return this.deriveMatch(state)
  }

  // Method to ensure simulator is always running
  ensureRunning(): void {
    if (!this.started) {
      this.start().catch(console.error)
    }
  }

  // Get current status for debugging
  getStatus(): { started: boolean, matchCount: number, currentMinutes: Record<string, number> } {
    const currentMinutes: Record<string, number> = {}
    for (const [id, state] of this.states) {
      currentMinutes[id] = state.currentMinute
    }
    return {
      started: this.started,
      matchCount: this.states.size,
      currentMinutes
    }
  }
}

export const matchSimulator = new MatchSimulator()


