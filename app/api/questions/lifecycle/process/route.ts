import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question/question-lifecycle';

/**
 * POST /api/questions/lifecycle/process
 * Process scheduled questions (called by scheduler)
 * This endpoint should be protected and only called by internal services
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication/authorization check
    // This should only be called by the match monitor or admin services

    await questionLifecycle.processScheduledQuestions();

    return NextResponse.json({
      success: true,
      message: 'Question lifecycle processed successfully'
    });

  } catch (error) {
    console.error('Error processing question lifecycle:', error);
    return NextResponse.json(
      { error: 'Failed to process question lifecycle' },
      { status: 500 }
    );
  }
}
