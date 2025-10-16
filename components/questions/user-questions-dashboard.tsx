"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, CheckCircle, XCircle, Users } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { ActiveQuestionsList } from './active-questions-list';
import { QuestionCard } from './question-card';

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

interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  answerPayload: any;
  submittedAt: string;
}

interface UserQuestionsDashboardProps {
  matchId: string;
}

export function UserQuestionsDashboard({ matchId }: UserQuestionsDashboardProps) {
  const { user } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [questionResults, setQuestionResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId || !user?.id) return;

    // Questions are now handled in memory only - no API calls needed
    setLoading(false);
    setUserAnswers([]); // Empty for now - questions will be managed differently
    setQuestionResults([]); // Empty for now - results will be managed differently
  }, [matchId, user?.id]);

  const handleAnswerSubmit = async (questionId: string, answer: any) => {
    if (!user?.id) return;

    try {
      // Questions are now handled in memory only
      console.log('Answer submission disabled - questions handled in memory');
      // TODO: Implement in-memory answer submission
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  const getUserAnswer = (questionId: string): UserAnswer | undefined => {
    return userAnswers.find(answer => answer.questionId === questionId);
  };

  const getQuestionResult = (questionId: string) => {
    return questionResults.find(result => result.questionId === questionId);
  };

  const calculateUserStats = () => {
    const totalQuestions = userAnswers.length;
    const correctAnswers = userAnswers.filter(answer => {
      const result = getQuestionResult(answer.questionId);
      return result && answer.answerPayload === result.correctAnswer;
    }).length;
    
    const totalPoints = userAnswers.reduce((total, answer) => {
      const result = getQuestionResult(answer.questionId);
      if (result && answer.answerPayload === result.correctAnswer) {
        // Find the question to get points
        const question = questionResults.find(q => q.questionId === answer.questionId);
        return total + (question?.points || 0);
      }
      return total;
    }, 0);

    return {
      totalQuestions,
      correctAnswers,
      totalPoints,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    };
  };

  const stats = calculateUserStats();

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Questions</TabsTrigger>
          <TabsTrigger value="answered">My Answers</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <ActiveQuestionsList
            matchId={matchId}
            onQuestionSelect={setSelectedQuestion}
          />
          
          {selectedQuestion && (
            <QuestionCard
              question={selectedQuestion}
              userAnswer={getUserAnswer(selectedQuestion.id)}
              onAnswerSubmit={handleAnswerSubmit}
              showResults={false}
            />
          )}
        </TabsContent>

        <TabsContent value="answered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Answers</CardTitle>
            </CardHeader>
            <CardContent>
              {userAnswers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    You haven't answered any questions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAnswers.map((answer) => {
                    const result = getQuestionResult(answer.questionId);
                    const isCorrect = result && answer.answerPayload === result.correctAnswer;
                    
                    return (
                      <div
                        key={answer.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Question ID: {answer.questionId.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your answer: {String(answer.answerPayload)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {result ? (
                            <>
                              {isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge variant={isCorrect ? "default" : "destructive"}>
                                {isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Results</CardTitle>
            </CardHeader>
            <CardContent>
              {questionResults.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No results available yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questionResults.map((result) => {
                    const userAnswer = getUserAnswer(result.questionId);
                    const isCorrect = userAnswer && userAnswer.answerPayload === result.correctAnswer;
                    
                    return (
                      <div
                        key={result.id}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            Question ID: {result.questionId.slice(0, 8)}...
                          </p>
                          <div className="flex items-center gap-2">
                            {userAnswer ? (
                              <>
                                {isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <Badge variant={isCorrect ? "default" : "destructive"}>
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="outline">Not Answered</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Correct answer: <span className="font-medium">{String(result.correctAnswer)}</span></p>
                          {userAnswer && (
                            <p>Your answer: <span className="font-medium">{String(userAnswer.answerPayload)}</span></p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
