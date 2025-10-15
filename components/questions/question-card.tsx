"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
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
  correctAnswer?: any;
}

interface QuestionCardProps {
  question: Question;
  userAnswer?: any;
  onAnswerSubmit?: (questionId: string, answer: any) => void;
  showResults?: boolean;
}

export function QuestionCard({ 
  question, 
  userAnswer, 
  onAnswerSubmit, 
  showResults = false 
}: QuestionCardProps) {
  const { user } = useUser();
  const [selectedAnswer, setSelectedAnswer] = useState<any>(userAnswer?.answerPayload || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(question.timeRemaining);
  const [isAnswered, setIsAnswered] = useState(!!userAnswer);

  useEffect(() => {
    if (!question.isActive || question.isClosed) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(question.endAt);
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [question.endAt, question.isActive, question.isClosed]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || isAnswered || !question.isActive) return;

    setIsSubmitting(true);
    try {
      await onAnswerSubmit?.(question.id, selectedAnswer);
      setIsAnswered(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAnswerInput = () => {
    if (question.isClosed || !question.isActive) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {question.isClosed ? 'Question is closed' : 'Question is not active'}
          </p>
        </div>
      );
    }

    switch (question.questionType) {
      case 'boolean':
        return (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'numeric':
        return (
          <Input
            type="number"
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(Number(e.target.value))}
            placeholder="Enter your answer"
            disabled={isAnswered}
          />
        );

      case 'text':
        return (
          <Input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Enter your answer"
            disabled={isAnswered}
          />
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Unsupported question type: {question.questionType}
            </p>
          </div>
        );
    }
  };

  const renderResults = () => {
    if (!showResults || !question.correctAnswer) return null;

    const isCorrect = userAnswer?.answerPayload === question.correctAnswer;
    const pointsEarned = isCorrect ? question.points : 0;

    return (
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Trophy className="h-4 w-4" />
            {pointsEarned} pts
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Your answer: <span className="font-medium">{String(userAnswer?.answerPayload)}</span></p>
          <p>Correct answer: <span className="font-medium">{String(question.correctAnswer)}</span></p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{question.text}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {question.points} pts
            </Badge>
            {question.isActive && timeRemaining > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                <Clock className="h-3 w-3" />
                {formatTimeRemaining(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderAnswerInput()}
        
        {!isAnswered && question.isActive && timeRemaining > 0 && (
          <Button
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </Button>
        )}

        {isAnswered && (
          <div className="text-center py-2">
            <Badge variant="outline" className="text-green-600">
              Answer Submitted
            </Badge>
          </div>
        )}

        {renderResults()}
      </CardContent>
    </Card>
  );
}
