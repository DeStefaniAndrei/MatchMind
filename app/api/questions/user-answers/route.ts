import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question-lifecycle';

/**
 * GET /api/questions/user-answers
 * Get user answers for a specific match
 * Query params: matchId, userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const userId = searchParams.get('userId');

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userAnswers = await questionLifecycle.getUserAnswersForMatch(userId, matchId);

    return NextResponse.json({
      success: true,
      data: userAnswers.map(answer => answer.toDTO())
    });

  } catch (error) {
    console.error('Error fetching user answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user answers' },
      { status: 500 }
    );
  }
}
