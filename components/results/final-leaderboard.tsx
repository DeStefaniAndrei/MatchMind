import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Coins } from "lucide-react"

interface FinalLeaderboardProps {
  matchId: string
}

interface FinalLeaderboardEntry {
  rank: number
  username: string
  score: number
  reward: number
  isCurrentUser: boolean
}

export function FinalLeaderboard({ matchId }: FinalLeaderboardProps) {
  // Mock final leaderboard data
  const finalLeaderboard: FinalLeaderboardEntry[] = [
    { rank: 1, username: "PredictorPro", score: 950, reward: 45.2, isCurrentUser: false },
    { rank: 2, username: "FootballFan99", score: 920, reward: 32.15, isCurrentUser: false },
    { rank: 3, username: "You", score: 880, reward: 15.75, isCurrentUser: true },
    { rank: 4, username: "MatchMaster", score: 850, reward: 12.3, isCurrentUser: false },
    { rank: 5, username: "GoalGuesser", score: 820, reward: 8.9, isCurrentUser: false },
    { rank: 6, username: "ScoreSeeker", score: 790, reward: 6.45, isCurrentUser: false },
    { rank: 7, username: "WinPredictor", score: 760, reward: 4.2, isCurrentUser: false },
    { rank: 8, username: "ChampChaser", score: 730, reward: 2.85, isCurrentUser: false },
  ]

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
          Final Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {finalLeaderboard.map((entry) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-3 rounded-lg ${
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
                  <div className="text-sm text-muted-foreground">{entry.score} points</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  {entry.reward} CHZ
                </div>
                <div className="text-xs text-muted-foreground">reward</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Rewards distributed based on prediction accuracy and final ranking
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
