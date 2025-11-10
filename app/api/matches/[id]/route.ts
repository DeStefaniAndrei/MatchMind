import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'
import '@/lib/startup' // Ensure simulator starts on server startup

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  
  // Ensure simulator is running
  matchSimulator.ensureRunning()
  
  const match = await matchSimulator.getMatchById(id)
  
  console.log(`[API] GET /api/matches/${id} - Match:`, match ? {
    minute: match.minute,
    score: `${match.homeScore}-${match.awayScore}`,
    status: match.status,
    events: match.events?.length
  } : 'null')
  
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(match)
}


