"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Trophy, X } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';

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

interface QuestionDetailModalProps {
  question: Question | null;
  onClose: () => void;
  onAnswerSubmit?: (questionId: string, answer: any) => void;
}

export function QuestionDetailModal({ 
  question, 
  onClose, 
  onAnswerSubmit 
}: QuestionDetailModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!question) return null;

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
    if (!selectedAnswer || !user?.id) return;

    setIsSubmitting(true);
    try {
      await onAnswerSubmit?.(question.id, selectedAnswer);
      toast({
        title: "Answer Submitted!",
        description: "Your answer has been recorded.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
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
          >
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={String(option.value)} id={option.id} />
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
          />
        );

      case 'text':
        return (
          <Input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Enter your answer"
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{question.text}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {question.points} pts
            </Badge>
            {question.isActive && question.timeRemaining > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                <Clock className="h-3 w-3" />
                {formatTimeRemaining(question.timeRemaining)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderAnswerInput()}
          
          {question.isActive && question.timeRemaining > 0 && (
            <Button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
