import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { fetchMatchById } from "@/lib/api/api"

interface MatchResultsProps {
  matchId: string
}

export function MatchResults({ matchId }: MatchResultsProps) {
  const [match, setMatch] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMatchById(matchId)
        setMatch(data)
      } catch (e) {
        setMatch(null)
      }
    }
    load()
  }, [matchId])

  if (!match) return <div>Match not found</div>

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
