"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Trophy, Target, Brain } from "lucide-react"
import { fetchMatchById } from "@/lib/api"
import { getSimulatedMinuteMs } from "@/lib/sim-config"
import { ActiveQuestionsWidget } from "@/components/questions/active-questions-widget"
import { QuestionCard } from "@/components/questions/question-card"
import { useUser } from "@/contexts/user-context"

interface LiveMatchWithQuestionsProps {
  matchId: string
}

export function LiveMatchWithQuestions({ matchId }: LiveMatchWithQuestionsProps) {
  const { user } = useUser()
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [matchMinute, setMatchMinute] = useState(0)
  const [events, setEvents] = useState<any[]>([])
  const [homeTeam, setHomeTeam] = useState<string>("")
  const [awayTeam, setAwayTeam] = useState<string>("")
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    const loadFromMatch = async () => {
      try {
        const match = await fetchMatchById(matchId)
        if (match) {
          setHomeTeam(match.homeTeam || "Home Team")
          setAwayTeam(match.awayTeam || "Away Team")
          setHomeScore(match.homeScore ?? 0)
          setAwayScore(match.awayScore ?? 0)
          setMatchMinute(match.minute ?? 0)
          setEvents(Array.isArray(match.events) ? match.events : [])
        }
      } catch (error) {
        console.error('Failed to load match data:', error)
      }
    }

    // Initial load
    loadFromMatch()

    // Poll match from each simulated minute to reflect new state
    const minuteMs = getSimulatedMinuteMs()
    const matchInterval = setInterval(async () => {
      try {
        const match = await fetchMatchById(matchId)
        if (!match) return
        setHomeTeam(match.homeTeam || "Home Team")
        setAwayTeam(match.awayTeam || "Away Team")
        setHomeScore(match.homeScore ?? 0)
        setAwayScore(match.awayScore ?? 0)
        setMatchMinute(match.minute ?? 0)
        setEvents(Array.isArray(match.events) ? match.events : [])
      } catch (e) {
        // ignore transient errors
      }
    }, minuteMs)

    return () => {
      clearInterval(matchInterval)
    }
  }, [matchId])

  const handleAnswerSubmit = async (questionId: string, answer: any) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to answer questions",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answerPayload: answer,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      toast({
        title: "Answer Submitted!",
        description: `Your answer has been recorded. Results will be shown when the question closes.`,
      })

      // Refresh the selected question to show it as answered
      setSelectedQuestion(prev => prev ? { ...prev, answered: true } : null)
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question)
  }

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{homeTeam || "Home Team"} vs {awayTeam || "Away Team"}</CardTitle>
            <Badge className="bg-red-500">LIVE</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{matchMinute}'</span>
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
            <div className="text-3xl font-bold mb-2">{homeScore} - {awayScore}</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Rank #3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Questions Widget */}
      <ActiveQuestionsWidget
        matchId={matchId}
        maxQuestions={2}
        onQuestionClick={handleQuestionSelect}
        showGenerateButton={true}
      />

      {/* Selected Question Detail */}
      {selectedQuestion && (
        <QuestionCard
          question={selectedQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          showResults={false}
        />
      )}

      {/* Live Events */}
      <Card>
        <CardHeader>
          <CardTitle>Live Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter((e) => e.type && (e.type.includes('goal') || e.type.includes('shot') || e.type.includes('foul')))
              .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))
              .slice(-10)
              .map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  event.type?.includes("goal")
                    ? "bg-green-500"
                    : event.type?.includes("shot")
                      ? "bg-blue-500"
                      : "bg-yellow-500"
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
