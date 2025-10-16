"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, ChevronRight } from 'lucide-react';
import { QuestionDetailModal } from './question-detail-modal';
import { useToast } from '@/hooks/use-toast';
import { realtimeQuestionService, type LiveQuestion } from '@/lib/question/realtime-question-service';

interface ActiveQuestionsProps {
  matchId: string;
  maxQuestions?: number;
  onQuestionClick?: (question: LiveQuestion) => void;
}

export function ActiveQuestions({ 
  matchId, 
  maxQuestions = 5, 
  onQuestionClick
}: ActiveQuestionsProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<LiveQuestion | null>(null);

  useEffect(() => {
    // Load submitted questions from localStorage (only saved after user submits answer)
    const loadQuestions = () => {
      const allQuestions = realtimeQuestionService.getMatchQuestions(matchId);
      
      // Only show submitted questions that haven't expired yet
      const activeQuestions = allQuestions
        .filter(q => q.answered && new Date(q.expiresAt).getTime() > Date.now())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, maxQuestions);
      
      setQuestions(activeQuestions);
    };

    loadQuestions();

    // Poll for updates every second to update timers
    const interval = setInterval(loadQuestions, 1000);

    return () => clearInterval(interval);
  }, [matchId, maxQuestions]);

 
  

  const handleQuestionClick = (question: LiveQuestion) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    } else {
      setSelectedQuestion(question);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Active Questions
            {questions.length > 0 && (
              <Badge variant="secondary">{questions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No active questions</p>
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {question.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.eventType}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="h-3 w-3" />
                        {question.pointsAwarded > 0 ? `${question.pointsAwarded} pts` : '10 pts'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      {formatTimeRemaining(question.timeLeft)}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <QuestionDetailModal
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
      />
    </>
  );
}
