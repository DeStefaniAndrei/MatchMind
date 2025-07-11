"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users } from "lucide-react"

interface LiveMatchProps {
  matchId: string
}

interface Question {
  id: string
  text: string
  options: string[]
  timeLeft: number
  answered: boolean
}

export function LiveMatch({ matchId }: LiveMatchProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const { toast } = useToast()

  // Mock questions for demonstration
  const mockQuestions = [
    {
      id: "1",
      text: "Who will score the next goal?",
      options: ["Home Team", "Away Team", "No Goal"],
      timeLeft: 60,
      answered: false,
    },
    {
      id: "2",
      text: "Will there be a corner kick in the next 5 minutes?",
      options: ["Yes", "No"],
      timeLeft: 60,
      answered: false,
    },
    {
      id: "3",
      text: "Which team will have more possession in this period?",
      options: ["Home Team", "Away Team", "Equal"],
      timeLeft: 60,
      answered: false,
    },
  ]

  useEffect(() => {
    // Simulate new question every minute
    const questionInterval = setInterval(() => {
      const randomQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)]
      setCurrentQuestion({ ...randomQuestion, answered: false })
      setTimeLeft(60)
      setSelectedAnswer(null)
    }, 60000)

    // Initialize with first question
    setCurrentQuestion({ ...mockQuestions[0], answered: false })

    return () => clearInterval(questionInterval)
  }, [])

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0 && currentQuestion && !currentQuestion.answered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, currentQuestion])

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return

    setCurrentQuestion({ ...currentQuestion, answered: true })
    setScore(score + 10) // Mock scoring

    toast({
      title: "Answer Submitted!",
      description: `You selected: ${selectedAnswer}`,
    })
  }

  const isTimeUp = timeLeft === 0
  const canAnswer = currentQuestion && !currentQuestion.answered && !isTimeUp && selectedAnswer

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manchester United vs Liverpool</CardTitle>
            <Badge className="bg-red-500">LIVE</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>45' + 2</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1,247 players</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">2 - 1</div>
            <div className="text-sm text-muted-foreground">Your Score: {score} points</div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Question</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeLeft <= 10 ? "text-red-500" : ""}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <Progress value={((60 - timeLeft) / 60) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.text}</p>

            <div className="grid gap-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedAnswer(option)}
                  disabled={currentQuestion.answered || isTimeUp}
                >
                  {option}
                </Button>
              ))}
            </div>

            <Button onClick={handleAnswerSubmit} disabled={!canAnswer} className="w-full">
              {currentQuestion.answered
                ? "Answer Submitted"
                : isTimeUp
                  ? "Time Up!"
                  : !selectedAnswer
                    ? "Select an Answer"
                    : "Submit Answer"}
            </Button>

            {isTimeUp && !currentQuestion.answered && (
              <p className="text-center text-red-500 text-sm">Time expired! Wait for the next question.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
