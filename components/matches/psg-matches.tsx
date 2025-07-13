"use client"

import { useEffect, useState } from "react"
import { MatchCard } from "./match-card"
import { fetchPSGMatches, type PSGMatch } from "@/lib/sportmonks-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar } from "lucide-react"

export function PSGMatches() {
  const [matches, setMatches] = useState<PSGMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPSGMatches() {
      try {
        setLoading(true)
        const psgMatches = await fetchPSGMatches()
        setMatches(psgMatches)
      } catch (err) {
        setError("Failed to load PSG matches")
        console.error("Error loading PSG matches:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPSGMatches()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Live & Upcoming Matches</h2>
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="font-medium text-destructive mb-2">Failed to load PSG matches</p>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-2">
              Please check your SportMonks API key in .env.local file
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalParticipants = matches.reduce((sum, match) => sum + match.participants, 0)
  const totalStake = matches.reduce((sum, match) => sum + match.totalStake, 0)
  const upcomingMatches = matches.filter(match => match.status === "upcoming").length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Live & Upcoming Matches</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{totalParticipants} participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{totalStake} CHZ staked</span>
          </div>
          <Badge variant="outline">
            {upcomingMatches} upcoming
          </Badge>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={{
              ...match,
              // Ensure the match object matches the expected interface
              id: match.id,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              startTime: match.startTime,
              status: match.status,
              participants: match.participants,
              totalStake: match.totalStake,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
            }}
          />
        ))}
      </div>

      {/* Empty state */}
      {matches.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No upcoming PSG matches found</p>
              <p className="text-sm mt-2">Check back later for new matches</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 