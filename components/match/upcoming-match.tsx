"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Trophy, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpcomingMatchProps {
  matchId: string
}

export function UpcomingMatch({ matchId }: UpcomingMatchProps) {
  const [match, setMatch] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Mock match data - in real app, fetch from API
    const mockMatch = {
      id: matchId,
      homeTeam: "PSG",
      awayTeam: "Nantes",
      startTime: "2024-01-20T21:00:00Z",
      status: "upcoming",
      participants: 2156,
      totalStake: 45670,
      contract_address: "0xa012345678901234567890123456789012345678",
    }
    setMatch(mockMatch)
  }, [matchId])

  if (!match) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Loading match details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const startDate = new Date(match.startTime)
  const timeUntilStart = startDate.getTime() - Date.now()
  const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60))
  const minutesUntilStart = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{match.homeTeam} vs {match.awayTeam}</CardTitle>
            <Badge className="bg-blue-500">UPCOMING</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{startDate.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{match.participants.toLocaleString()} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{match.totalStake.toLocaleString()} CHZ staked</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-muted-foreground">
              Match starts in {hoursUntilStart}h {minutesUntilStart}m
            </div>
            <div className="text-sm text-muted-foreground">
              Get ready to predict and earn rewards!
            </div>
            <Button 
              onClick={() => router.push('/stake')}
              className="mt-4"
            >
              Stake Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Match Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Match Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{match.homeTeam} vs {match.awayTeam}</div>
              <div className="text-sm text-muted-foreground">Ligue 1 • Round 21</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-bold text-lg">{match.homeTeam}</div>
                <div className="text-sm text-muted-foreground">Home Team</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-bold text-lg">{match.awayTeam}</div>
                <div className="text-sm text-muted-foreground">Away Team</div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Parc des Princes, Paris</p>
              <p>Capacity: 47,929</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Info */}
      <Card>
        <CardHeader>
          <CardTitle>Staking Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{match.participants.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{match.totalStake.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">CHZ Staked</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• Minimum stake: 0.01 CHZ</p>
              <p>• Predict live questions during the match</p>
              <p>• Earn rewards based on your predictions</p>
              <p>• Leaderboard updates in real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 