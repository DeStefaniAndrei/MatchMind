"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  isCurrentUser: boolean
}

interface MatchLeaderboardProps {
  matchId: string
}

export function MatchLeaderboard({ matchId }: MatchLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Mock leaderboard data - in real app, fetch from API
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: "PredictorPro", score: 850, isCurrentUser: false },
      { rank: 2, username: "FootballFan99", score: 820, isCurrentUser: false },
      { rank: 3, username: "You", score: 780, isCurrentUser: true },
      { rank: 4, username: "MatchMaster", score: 750, isCurrentUser: false },
      { rank: 5, username: "GoalGuesser", score: 720, isCurrentUser: false },
      { rank: 6, username: "ScoreSeeker", score: 690, isCurrentUser: false },
      { rank: 7, username: "WinPredictor", score: 660, isCurrentUser: false },
      { rank: 8, username: "ChampChaser", score: 630, isCurrentUser: false },
    ]

    setLeaderboard(mockLeaderboard)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev
          .map((entry) => ({
            ...entry,
            score: entry.score + Math.floor(Math.random() * 20),
          }))
          .sort((a, b) => b.score - a.score)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [matchId])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {entry.username}
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{entry.score}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">Leaderboard updates in real-time during the match</p>
        </div>
      </CardContent>
    </Card>
  )
}
