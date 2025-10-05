// Question Configuration Component (intervals ect in here)

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Settings, Save, RotateCcw } from "lucide-react"
import { realtimeQuestionService } from "@/lib/realtime-question-service"

interface QuestionConfigProps {
  matchId: string
}

interface ConfigForm {
  questionInterval: number
  answerTimeLimit: number
  pointsPerCorrect: number
  maxQuestionsPerMatch: number
}

export function QuestionConfig({ matchId }: QuestionConfigProps) {
  const [config, setConfig] = useState<ConfigForm>({
    questionInterval: 30,
    answerTimeLimit: 30,
    pointsPerCorrect: 10,
    maxQuestionsPerMatch: 180
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      realtimeQuestionService.updateConfig(matchId, config)
      toast({
        title: "Configuration Updated",
        description: "Question settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setConfig({
      questionInterval: 30,
      answerTimeLimit: 30,
      pointsPerCorrect: 10,
      maxQuestionsPerMatch: 180
    })
    toast({
      title: "Configuration Reset",
      description: "Settings have been reset to defaults.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Question Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="questionInterval">Question Interval (seconds)</Label>
            <Input
              id="questionInterval"
              type="number"
              min="10"
              max="120"
              value={config.questionInterval}
              onChange={(e) => setConfig(prev => ({ ...prev, questionInterval: parseInt(e.target.value) || 30 }))}
            />
            <p className="text-xs text-muted-foreground">
              Time between new questions appearing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answerTimeLimit">Answer Time Limit (seconds)</Label>
            <Input
              id="answerTimeLimit"
              type="number"
              min="10"
              max="60"
              value={config.answerTimeLimit}
              onChange={(e) => setConfig(prev => ({ ...prev, answerTimeLimit: parseInt(e.target.value) || 30 }))}
            />
            <p className="text-xs text-muted-foreground">
              Time players have to answer each question
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pointsPerCorrect">Points per Correct Answer</Label>
            <Input
              id="pointsPerCorrect"
              type="number"
              min="1"
              max="100"
              value={config.pointsPerCorrect}
              onChange={(e) => setConfig(prev => ({ ...prev, pointsPerCorrect: parseInt(e.target.value) || 10 }))}
            />
            <p className="text-xs text-muted-foreground">
              Points awarded for correct predictions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxQuestions">Max Questions per Match</Label>
            <Input
              id="maxQuestions"
              type="number"
              min="10"
              max="500"
              value={config.maxQuestionsPerMatch}
              onChange={(e) => setConfig(prev => ({ ...prev, maxQuestionsPerMatch: parseInt(e.target.value) || 180 }))}
            />
            <p className="text-xs text-muted-foreground">
              Maximum questions during a 90-minute match
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Current Settings:</strong><br />
          • New question every {config.questionInterval} seconds<br />
          • {config.answerTimeLimit} seconds to answer<br />
          • {config.pointsPerCorrect} points per correct answer<br />
          • Maximum {config.maxQuestionsPerMatch} questions per match
        </div>
      </CardContent>
    </Card>
  )
}
