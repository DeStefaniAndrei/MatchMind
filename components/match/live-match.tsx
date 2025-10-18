"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Trophy, Target, Zap, Brain } from "lucide-react"
import { fetchMatchById } from "@/lib/api/api"
import { getSimulatedMinuteMs } from "@/lib/sim-config"
import { realtimeQuestionService, type LiveQuestion } from "@/lib/question/realtime-question-service"


interface LiveMatchProps {
  matchId: string
}



// -- EVENT TYPES THAT SHOW--
const GOAL_EVENT_TYPES = [
  'shot_goal', // from simplified JSON normalization
  'goal' // fallback
]
const SHOT_EVENT_TYPES = [
  'shot_on_target',
  'shot_miss',
]
const FOUL_EVENT_TYPES = [
  'Foul Committed',
  'Card'
]

// Explicit set-piece event types from simplified JSON
const SET_PIECE_TYPES = ['corner', 'free_kick', 'throw_in']

function isSetPiece(type: string): boolean {
  return SET_PIECE_TYPES.includes(type)
}

function isDisplayableEvent(type: string): boolean {
  return (
    GOAL_EVENT_TYPES.includes(type) ||
    SHOT_EVENT_TYPES.includes(type) ||
    FOUL_EVENT_TYPES.includes(type) ||
    isSetPiece(type)
  )
}





export function LiveMatch({ matchId }: LiveMatchProps) {
  const [currentQuestion, setCurrentQuestion] = useState<LiveQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [matchMinute, setMatchMinute] = useState(0)
  const [events, setEvents] = useState<any[]>([])
  const [homeTeam, setHomeTeam] = useState<string>("")
  const [awayTeam, setAwayTeam] = useState<string>("")
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const [isQuestionServiceActive, setIsQuestionServiceActive] = useState(false)
  const [timeUntilNextQuestion, setTimeUntilNextQuestion] = useState<number>(0)
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

    // Initialize the real-time question service for this match
    const initializeQuestionService = async () => {
      try {
        // Set up custom expiration handler
        realtimeQuestionService.setExpirationHandler((matchId, question) => {
          console.log('Custom expiration logic triggered!')
          
          // Show toast notification when question expires
          if (question.userAnswer) {
            toast({
              title: "Question Closed",
              description: `"${question.text}" - Your answer: ${question.userAnswer}`,
            })
          } else {
            toast({
              title: "Question Expired",
              description: `"${question.text}" - No answer submitted`,
              variant: "destructive"
            })
          }

        })

        realtimeQuestionService.initializeMatch(matchId)
        
        realtimeQuestionService.startMatch(matchId)
        setIsQuestionServiceActive(true)
        console.log(`Question service started for match ${matchId}`)
      } catch (error) {
        console.error('Failed to initialize question service:', error)
        toast({
          title: "Error",
          description: "Failed to start question service. Using demo mode.",
          variant: "destructive"
        })
      }
    }

    initializeQuestionService()

    // Poll match from each simulated minute to reflect new  state
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
        
        if ((match.minute ?? 0) > matchMinute) {
          realtimeQuestionService.updateMatchMinute(matchId, match.minute ?? 0)
        }
      } catch (e) {
        console.error('[LiveMatch] Poll error:', e)
      }
    }, minuteMs)

    return () => {
      clearInterval(matchInterval)
      realtimeQuestionService.stopMatch(matchId)
    }
  }, [matchId, toast])

  // Poll for current question updates and countdown timer
  useEffect(() => {
    if (!isQuestionServiceActive) return

    const pollInterval = setInterval(() => {
      // Update current question
      const question = realtimeQuestionService.getCurrentQuestion(matchId)
      if (question && question.id !== currentQuestion?.id) {
        setCurrentQuestion(question)
        setSelectedAnswer(null)
      }
      
      // Update countdown to next question timer (independent of question state) 
      const timeLeft = realtimeQuestionService.getTimeUntilNextQuestion(matchId)
      setTimeUntilNextQuestion(timeLeft)
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [matchId, isQuestionServiceActive, currentQuestion?.id])

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return

    // Submit answer to the question service
    const result = realtimeQuestionService.submitAnswer(matchId, currentQuestion.id, selectedAnswer)
    
    if (result.success) {
      setCurrentQuestion({ ...currentQuestion, answered: true })
      // Score is user-specific and not in Match type; integrate later if needed
      
    } else {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      })
    }
  }

  const isTimeUp = currentQuestion ? currentQuestion.timeLeft <= 0 : false
  const canAnswer = currentQuestion && !currentQuestion.answered && !isTimeUp && selectedAnswer

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
          
          </div>
        </CardContent>
      </Card>

      {/* Next Question Countdown Timer (Always visible, independent of current question) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Next Question
            </CardTitle>
            <Badge variant={timeUntilNextQuestion <= 5 ? "destructive" : "secondary"}>
              {timeUntilNextQuestion}s
            </Badge>
          </div>
          <Progress value={(timeUntilNextQuestion / (realtimeQuestionService.getMatchState(matchId)?.config.questionInterval || 30)) * 100} className="w-full" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      {currentQuestion ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              AI Prediction Question
            </CardTitle>
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
            {currentQuestion.answered && (
              <div className="text-center text-sm text-green-600">
                ✓ Answer submitted! Check Active Questions for results.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-gray-400" />
              AI Prediction Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isQuestionServiceActive 
                  ? "Waiting for next AI prediction question..." 
                  : "Question service is starting up..."
                }
              </p>
            </div>
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
            {events
              // Filter displayable events, sort by time (most recent first), show most recent 10
              .filter((e) => isDisplayableEvent(String(e.type)))
              .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))
              .slice(0, 10)
              .map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === "shot_goal" || event.type === "goal"
                    ? "bg-green-500"
                    : isSetPiece(String(event.type))
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
