"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, Trophy, X } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { type LiveQuestion } from '@/lib/question/realtime-question-service';

interface QuestionDetailModalProps {
  question: LiveQuestion | null;
  onClose: () => void;
  onAnswerSubmit?: (questionId: string, answer: string) => void;
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

  const formatTimeRemaining = (seconds: number): string => {
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
    if (question.answered || question.timeLeft <= 0) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            {question.answered ? 'You have already answered this question' : 'Question has expired'}
          </p>
        </div>
      );
    }

    // LiveQuestion only has Yes/No options
    return (
      <RadioGroup
        value={selectedAnswer}
        onValueChange={setSelectedAnswer}
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    );
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
              {question.pointsAwarded > 0 ? `${question.pointsAwarded} pts` : '10 pts'}
            </Badge>
            {question.timeLeft > 0 && !question.answered && (
              <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                <Clock className="h-3 w-3" />
                {formatTimeRemaining(question.timeLeft)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderAnswerInput()}
          
          {question.timeLeft > 0 && !question.answered && (
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
