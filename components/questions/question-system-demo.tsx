"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserQuestionsDashboard } from './user-questions-dashboard';
import { Sparkles, Play, Users, Trophy } from 'lucide-react';

interface QuestionSystemDemoProps {
  matchId: string;
}

export function QuestionSystemDemo({ matchId }: QuestionSystemDemoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(0);
  const [startDelay, setStartDelay] = useState(0);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      // Question generation is now handled in memory only
      console.log('Question generation disabled - questions handled in memory');
      // TODO: Implement in-memory question generation
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Predicted Questions System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDelay">Start Delay (seconds)</Label>
              <Input
                id="startDelay"
                type="number"
                value={startDelay}
                onChange={(e) => setStartDelay(Number(e.target.value))}
                placeholder="0"
                min="0"
                max="3600"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How long to wait before the first question becomes active
              </p>
            </div>
            
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate AI Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Question Types</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Boolean</Badge>
                <Badge variant="secondary">Multiple Choice</Badge>
                <Badge variant="secondary">Numeric</Badge>
                <Badge variant="secondary">Text</Badge>
                <Badge variant="secondary">Time-bound</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Lifecycle States</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Draft</Badge>
                <Badge variant="outline">Scheduled</Badge>
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">Closed</Badge>
                <Badge variant="secondary">Evaluated</Badge>
                <Badge variant="secondary">Settled</Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>AI analyzes current match statistics and generates relevant questions</li>
              <li>Questions are scheduled with specific start/end times</li>
              <li>Users can answer questions while they're active</li>
              <li>System automatically evaluates answers when questions close</li>
              <li>Points are awarded based on correctness and difficulty</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* User Dashboard */}
      <UserQuestionsDashboard matchId={matchId} />
    </div>
  );
}
