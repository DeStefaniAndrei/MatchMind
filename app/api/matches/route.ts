import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'

export async function GET() {
  console.log('API /matches called')
  const matches = await matchSimulator.getMatches()
  console.log('Matches loaded:', matches.length)
  return NextResponse.json(matches)
}


