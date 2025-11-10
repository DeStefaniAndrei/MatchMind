import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'
import '@/lib/startup' // Ensure simulator starts on server startup

export async function GET() {
  // Ensure simulator is running
  matchSimulator.ensureRunning()
  
  const matches = await matchSimulator.getMatches()
  const status = matchSimulator.getStatus()
  
  return NextResponse.json({
    matches,
    simulatorStatus: status,
    timestamp: new Date().toISOString()
  })
}


