import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'

export async function GET() {
  // Ensure the simulator is running
  matchSimulator.ensureRunning()
  
  const status = matchSimulator.getStatus()
  return NextResponse.json({
    ...status,
    timestamp: new Date().toISOString()
  })
}
