"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy } from 'lucide-react';
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

interface ActiveQuestionsListProps {
  matchId: string;
  onQuestionSelect?: (question: Question) => void;
}

export function ActiveQuestionsList({ matchId, onQuestionSelect }: ActiveQuestionsListProps) {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !user?.id) return;

    // Questions are now handled in memory only - no API calls needed
    setLoading(false);
    setQuestions([]); // Empty for now - questions will be managed differently
    setError(null);
  }, [matchId, user?.id]);

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

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'evaluated':
        return 'bg-blue-100 text-blue-800';
      case 'settled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
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
            <p className="text-sm text-muted-foreground">No active questions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Questions ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onQuestionSelect?.(question)}
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
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStateColor(question.state)}`}
                  >
                    {question.state}
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
                {question.isClosed && (
                  <Badge variant="outline" className="text-xs">
                    Closed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
