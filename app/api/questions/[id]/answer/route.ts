import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question/question-lifecycle';

/**
 * POST /api/questions/[id]/answer
 * Submit an answer to a specific question
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    const body = await request.json();
    const { userId, answerPayload } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (answerPayload === undefined || answerPayload === null) {
      return NextResponse.json(
        { error: 'answerPayload is required' },
        { status: 400 }
      );
    }

    const userAnswer = await questionLifecycle.submitUserAnswer(
      userId,
      questionId,
      answerPayload
    );

    return NextResponse.json({
      success: true,
      data: userAnswer.toDTO()
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not active')) {
        return NextResponse.json(
          { error: 'Question is not active' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid answer format')) {
        return NextResponse.json(
          { error: 'Invalid answer format' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
