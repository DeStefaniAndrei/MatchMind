import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question/question-lifecycle';

/**
 * GET /api/questions/results
 * Get question results for a specific match
 * Query params: matchId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    const results = await questionLifecycle.getQuestionResultsForMatch(matchId);

    return NextResponse.json({
      success: true,
      data: results.map(result => result.toDTO())
    });

  } catch (error) {
    console.error('Error fetching question results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question results' },
      { status: 500 }
    );
  }
}
