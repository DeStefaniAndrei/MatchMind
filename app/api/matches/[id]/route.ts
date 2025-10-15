import { NextResponse } from 'next/server'
import { matchSimulator } from '@/lib/match-simulator'

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const match = matchSimulator.getMatchById(id)
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(match)
}


