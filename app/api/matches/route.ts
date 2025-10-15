import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'

export async function GET() {
  const matches = matchSimulator.getMatches()
  return NextResponse.json(matches)
}


