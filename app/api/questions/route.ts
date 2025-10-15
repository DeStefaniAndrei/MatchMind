import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question-lifecycle';

/**
 * GET /api/questions
 * Get questions for a specific match
 * Query params: matchId, states (optional), userId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const states = searchParams.get('states')?.split(',') as any[];
    const userId = searchParams.get('userId');

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    let questions;
    
    if (userId) {
      // Get answerable questions for the user
      questions = await questionLifecycle.getAnswerableQuestionsForUser(userId, matchId);
    } else if (states) {
      // Get questions with specific states
      questions = await questionLifecycle.getQuestionsForMatch(matchId, states);
    } else {
      // Get all questions for the match
      questions = await questionLifecycle.getQuestionsForMatch(matchId);
    }

    return NextResponse.json({
      success: true,
      data: questions.map(q => q.toDTO())
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
