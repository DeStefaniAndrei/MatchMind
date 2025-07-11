"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Play, Square, Lock } from "lucide-react"
import { mockMatches } from "@/lib/mock-data"

export function MatchManagement() {
  const [matches, setMatches] = useState(mockMatches)
  const { toast } = useToast()

  const handleStartMatch = (matchId: string) => {
    setMatches((prev) => prev.map((match) => (match.id === matchId ? { ...match, status: "live" as const } : match)))
    toast({
      title: "Match Started",
      description: "Match is now live and accepting predictions",
    })
  }

  const handleLockMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((match) => (match.id === matchId ? { ...match, status: "completed" as const } : match)),
    )
    toast({
      title: "Match Locked",
      description: "Match has been completed and locked",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500"
      case "upcoming":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.slice(0, 4).map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  <Badge className={getStatusColor(match.status)}>{match.status.toUpperCase()}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {match.participants} players • {match.totalStake} CHZ staked
                </div>
              </div>
              <div className="flex gap-2">
                {match.status === "upcoming" && (
                  <Button size="sm" onClick={() => handleStartMatch(match.id)} className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Start
                  </Button>
                )}
                {match.status === "live" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleLockMatch(match.id)}
                    className="flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" />
                    Lock
                  </Button>
                )}
                {match.status === "completed" && (
                  <Button size="sm" variant="outline" disabled>
                    <Square className="h-3 w-3" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
