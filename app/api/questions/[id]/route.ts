import { NextRequest, NextResponse } from 'next/server';
import { questionLifecycle } from '@/lib/question/question-lifecycle';
import { supabase } from '@/lib/supabaseClient';
import { Question } from '@/lib/question/question-domain';

/**
 * GET /api/questions/[id]
 * Get a specific question by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    const question = Question.fromDatabaseRow(data);

    return NextResponse.json({
      success: true,
      data: question.toDTO()
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/questions/[id]
 * Update a specific question (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    const body = await request.json();

    // TODO: Add admin authentication check
    // For now, allow updates (should be restricted in production)

    const { error } = await supabase
      .from('questions')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questions/[id]
 * Delete a specific question (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;

    // TODO: Add admin authentication check
    // For now, allow deletion (should be restricted in production)

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
