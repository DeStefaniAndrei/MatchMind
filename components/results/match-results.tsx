import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockMatches } from "@/lib/mock-data"

interface MatchResultsProps {
  matchId: string
}

export function MatchResults({ matchId }: MatchResultsProps) {
  // In a real app, fetch match data from API
  const match = mockMatches.find((m) => m.id === matchId)

  if (!match) {
    return <div>Match not found</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Match Result</CardTitle>
          <Badge className="bg-green-500">COMPLETED</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">
            {match.homeTeam} vs {match.awayTeam}
          </div>
          <div className="text-4xl font-bold">
            {match.homeScore} - {match.awayScore}
          </div>
          <div className="text-sm text-muted-foreground">Final Score</div>
        </div>
      </CardContent>
    </Card>
  )
}
