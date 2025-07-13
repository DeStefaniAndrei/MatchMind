"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Trophy, Target, Zap } from "lucide-react"
import { mockQuestions, mockLiveEvents } from "@/lib/mock-data"

interface Question {
  id: string
  text: string
  options: string[]
  timeLeft: number
  answered: boolean
}

interface LiveMatchProps {
  matchId: string
}

export function LiveMatch({ matchId }: LiveMatchProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(780)
  const [matchMinute, setMatchMinute] = useState(67)
  const [events, setEvents] = useState(mockLiveEvents)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate new question every 30 seconds for demo
    const questionInterval = setInterval(() => {
      const randomQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)]
      setCurrentQuestion({ ...randomQuestion, answered: false })
      setTimeLeft(30) // Shorter time for demo
      setSelectedAnswer(null)
    }, 30000)

    // Initialize with first question
    setCurrentQuestion({ ...mockQuestions[0], answered: false })

    // Simulate match progression
    const matchInterval = setInterval(() => {
      setMatchMinute(prev => {
        if (prev >= 90) return 90
        return prev + 1
      })
    }, 5000) // Every 5 seconds for demo

    // Simulate new events
    const eventInterval = setInterval(() => {
      const newEvent = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? "goal" : "yellow_card",
        minute: matchMinute,
        player: "Demo Player",
        team: Math.random() > 0.5 ? "home" : "away",
        description: Math.random() > 0.7 ? "Goal scored!" : "Yellow card"
      }
      setEvents(prev => [newEvent, ...prev.slice(0, 4)])
    }, 15000) // Every 15 seconds for demo

    return () => {
      clearInterval(questionInterval)
      clearInterval(matchInterval)
      clearInterval(eventInterval)
    }
  }, [matchMinute])

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
    
    // Show immediate submission feedback
    toast({
      title: "Answer Submitted!",
      description: `You selected: ${selectedAnswer}. Calculating points...`,
    })

    // Add 10-second delay before awarding points
    setTimeout(() => {
      const points = Math.floor(Math.random() * 20) + 10 // 10-30 points
      setScore(score + points)
      
      toast({
        title: "Points Awarded!",
        description: `You earned ${points} points for your prediction!`,
      })
    }, 10000) // 10 seconds delay
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
              <span>{matchMinute}' + 2</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>1,247 players</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>15,420 CHZ staked</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">2 - 1</div>
            <div className="text-sm text-muted-foreground">Your Score: {score} points</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Rank #3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Live Question
              </CardTitle>
              <Badge variant={isTimeUp ? "destructive" : "secondary"}>
                {timeLeft}s left
              </Badge>
            </div>
            <Progress value={(timeLeft / 30) * 100} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
            <div className="grid gap-2">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={currentQuestion.answered || isTimeUp}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleAnswerSubmit}
              disabled={!canAnswer}
              className="w-full"
            >
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Live Events */}
      <Card>
        <CardHeader>
          <CardTitle>Live Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === "goal" ? "bg-green-500" : "bg-yellow-500"
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{event.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.minute}' - {event.player}
                  </div>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
