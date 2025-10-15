"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/user-context';

interface Question {
  id: string;
  matchId: string;
  text: string;
  options: Array<{
    id: string;
    label: string;
    value: string | number | boolean;
  }>;
  questionType: string;
  points: number;
  startAt: string;
  endAt: string;
  state: string;
  timeRemaining: number;
  isActive: boolean;
  isClosed: boolean;
}

interface ActiveQuestionsWidgetProps {
  matchId: string;
  maxQuestions?: number;
  onQuestionClick?: (question: Question) => void;
  showGenerateButton?: boolean;
}

export function ActiveQuestionsWidget({ 
  matchId, 
  maxQuestions = 3, 
  onQuestionClick,
  showGenerateButton = false 
}: ActiveQuestionsWidgetProps) {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!matchId || !user?.id) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/questions?matchId=${matchId}&userId=${user.id}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions((data.data || []).slice(0, maxQuestions));
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    // Refresh every 30 seconds
    const interval = setInterval(fetchQuestions, 30000);
    return () => clearInterval(interval);
  }, [matchId, user?.id, maxQuestions]);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          startDelay: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      // Refresh questions after generation
      const questionsResponse = await fetch(
        `/api/questions?matchId=${matchId}&userId=${user?.id}`
      );
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions((questionsData.data || []).slice(0, maxQuestions));
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getQuestionTypeColor = (type: string): string => {
    switch (type) {
      case 'boolean':
        return 'bg-blue-100 text-blue-800';
      case 'multiple_choice':
        return 'bg-green-100 text-green-800';
      case 'numeric':
        return 'bg-purple-100 text-purple-800';
      case 'text':
        return 'bg-orange-100 text-orange-800';
      case 'time_bound':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Questions
            {questions.length > 0 && (
              <Badge variant="secondary">{questions.length}</Badge>
            )}
          </CardTitle>
          {showGenerateButton && (
            <Button
              size="sm"
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No active questions</p>
            {showGenerateButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="mt-2"
              >
                Generate Questions
              </Button>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onQuestionClick?.(question)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">
                    {question.text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getQuestionTypeColor(question.questionType)}`}
                    >
                      {question.questionType.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Trophy className="h-3 w-3" />
                      {question.points} pts
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {question.isActive && question.timeRemaining > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      {formatTimeRemaining(question.timeRemaining)}
                    </div>
                  )}
                  {onQuestionClick && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
