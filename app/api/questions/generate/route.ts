import { NextRequest, NextResponse } from 'next/server';
import { aiPredictionService, getStatsFromCumulative } from '@/lib/ai-prediction-service';
import { getMatchById } from '@/lib/match-service';
import { getMatchStats } from '@/lib/sportmonks-api';

/**
 * POST /api/questions/generate
 * Generate AI questions for a specific match
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, startDelay = 0 } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    // Get match data
    const match = await getMatchById(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Get current match stats
    let currentStats;
    let lagStats = [];

    if (match.sportmonks_id) {
      try {
        const statsData = await getMatchStats(match.sportmonks_id);
        currentStats = getStatsFromCumulative(statsData);
        
        // For now, we'll use empty lag stats
        // In a real implementation, you'd fetch historical data
        lagStats = [];
      } catch (error) {
        console.warn('Failed to fetch match stats, using fallback:', error);
        // Use fallback stats
        currentStats = {
          minute: 0,
          events: {}
        };
      }
    } else {
      // Use fallback stats for matches without SportMonks ID
      currentStats = {
        minute: 0,
        events: {}
      };
    }

    // Generate questions
    const questions = await aiPredictionService.createAndScheduleQuestions(
      matchId,
      currentStats,
      lagStats,
      startDelay
    );

    return NextResponse.json({
      success: true,
      data: {
        matchId,
        questionsGenerated: questions.length,
        questions: questions.map(q => q.toDTO())
      }
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
