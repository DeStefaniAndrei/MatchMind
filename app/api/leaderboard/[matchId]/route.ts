import { NextRequest, NextResponse } from 'next/server'
import { leaderboardService } from '@/lib/leaderboard-service'

/**
 * GET /api/leaderboard/[matchId]
 * Fetch leaderboard for a specific match
 * 
 * Query params:
 * - limit: number (optional) - limit number of entries
 * - userId: string (optional) - get specific user's rank
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')
    const userId = searchParams.get('userId')

    // If userId is provided, return just that user's entry
    if (userId) {
      const userRank = await leaderboardService.getUserRank(matchId, userId)
      
      if (!userRank) {
        return NextResponse.json(
          { error: 'User not found in leaderboard' },
          { status: 404 }
        )
      }

      return NextResponse.json(userRank)
    }

    // Otherwise return full leaderboard
    const leaderboard = await leaderboardService.getMatchLeaderboard(
      matchId,
      limit ? parseInt(limit) : undefined
    )

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leaderboard/[matchId]
 * Initialize a user's leaderboard entry for a match
 * 
 * Body:
 * - userId: string
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    await leaderboardService.initializeUserEntry(matchId, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error initializing leaderboard entry:', error)
    return NextResponse.json(
      { error: 'Failed to initialize leaderboard entry' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leaderboard/[matchId]
 * Clear leaderboard for a match (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params

    // TODO: Add admin authentication check here
    
    await leaderboardService.clearMatchLeaderboard(matchId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to clear leaderboard' },
      { status: 500 }
    )
  }
}

