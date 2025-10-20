"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, RefreshCw } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  isCurrentUser: boolean
  userId?: number
}

interface MatchLeaderboardProps {
  matchId: string
}

export function MatchLeaderboard({ matchId }: MatchLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/leaderboard/${matchId}?limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const data = await response.json()
      console.log('Leaderboard data received:', data)
      console.log('Current user ID:', user?.id)
      
      // Transform data to match component interface
      const transformedData: LeaderboardEntry[] = data.map((entry: any) => ({
        rank: entry.rank,
        username: entry.username || `User ${entry.userId.toString().slice(0, 8)}`,
        score: entry.score,
        isCurrentUser: user?.id === entry.userId.toString(),
        userId: entry.userId.toString()
      }))
      
      console.log('Transformed leaderboard:', transformedData)
      setLeaderboard(transformedData)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Failed to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Initial fetch
    fetchLeaderboard()

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      fetchLeaderboard()
    }, 3000) // Poll every 3 seconds for more responsive updates

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [matchId]) // Only depend on matchId

  // Update leaderboard when user changes to refresh isCurrentUser flags
  useEffect(() => {
    if (leaderboard.length > 0) {
      const updatedLeaderboard = leaderboard.map(entry => ({
        ...entry,
        isCurrentUser: user?.id === entry.userId
      }))
      setLeaderboard(updatedLeaderboard)
    }
  }, [user?.id])

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
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin ml-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {leaderboard.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No participants yet</p>
            <p className="text-sm">Be the first to answer questions!</p>
          </div>
        )}

        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId || entry.username}
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

        {leaderboard.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Leaderboard updates every 3 seconds
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
