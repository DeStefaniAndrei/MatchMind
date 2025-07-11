import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, Trophy } from "lucide-react"
import type { Match } from "@/lib/types"

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(match.status)}>{match.status.toUpperCase()}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(match.startTime)}
          </div>
        </div>
        <CardTitle className="text-lg">
          {match.homeTeam} vs {match.awayTeam}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{match.participants} players</span>
          </div>
          <div className="flex items-center">
            <Trophy className="h-4 w-4 mr-1" />
            <span>{match.totalStake} CHZ</span>
          </div>
        </div>

        <div className="flex gap-2">
          {match.status === "live" && (
            <Button asChild className="flex-1">
              <Link href={`/match/${match.id}`}>Join Live</Link>
            </Button>
          )}
          {match.status === "upcoming" && (
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href={`/stake?match=${match.id}`}>Stake Now</Link>
            </Button>
          )}
          {match.status === "completed" && (
            <Button asChild variant="secondary" className="flex-1">
              <Link href={`/results/${match.id}`}>View Results</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
