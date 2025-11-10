import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'
import '@/lib/startup' // Ensure simulator starts on server startup

export async function GET() {
  try {
    // Ensure simulator is running
    matchSimulator.ensureRunning()
    
    const status = matchSimulator.getStatus()
    const matches = await matchSimulator.getMatches()
    
    return NextResponse.json({
      success: true,
      message: 'Match simulator test',
      status,
      matches: matches.map(m => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        minute: m.minute,
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore
      })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
