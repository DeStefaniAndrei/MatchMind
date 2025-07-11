"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield } from "lucide-react"

interface RewardSummaryProps {
  matchId: string
}

export function RewardSummary({ matchId }: RewardSummaryProps) {
  // Mock data - in real app, fetch from API based on user and match
  const userStake = 100
  const userReward = 15.75
  const userRank = 3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Reward Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{userStake} CHZ</div>
            <div className="text-sm text-muted-foreground">Your Stake</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">Protected</span>
            </div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{userReward} CHZ</div>
            <div className="text-sm text-muted-foreground">Your Reward</div>
            <div className="text-xs text-primary mt-1">Dividend Share</div>
          </div>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary">Rank #{userRank}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">You finished in the top 10% of players!</div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Summary:</h4>
          <ul className="text-sm space-y-1">
            <li>
              • Your principal stake: <strong>{userStake} CHZ</strong> (always safe)
            </li>
            <li>
              • Your dividend reward: <strong>{userReward} CHZ</strong>
            </li>
            <li>
              • Total return: <strong>{userStake + userReward} CHZ</strong>
            </li>
            <li>
              • ROI: <strong>{((userReward / userStake) * 100).toFixed(1)}%</strong>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
