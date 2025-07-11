"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Coins, Send, Clock } from "lucide-react"

interface PayoutMatch {
  id: string
  homeTeam: string
  awayTeam: string
  totalStake: number
  totalRewards: number
  status: "pending" | "processing" | "completed"
  completedAt: string
}

export function PayoutManagement() {
  const [payoutMatches, setPayoutMatches] = useState<PayoutMatch[]>([
    {
      id: "3",
      homeTeam: "Chelsea",
      awayTeam: "Arsenal",
      totalStake: 18750,
      totalRewards: 1875,
      status: "pending",
      completedAt: "2024-01-14T19:30:00Z",
    },
    {
      id: "6",
      homeTeam: "Juventus",
      awayTeam: "AC Milan",
      totalStake: 13670,
      totalRewards: 1367,
      status: "completed",
      completedAt: "2024-01-13T21:45:00Z",
    },
  ])

  const { toast } = useToast()

  const handleTriggerPayout = (matchId: string) => {
    setPayoutMatches((prev) =>
      prev.map((match) => (match.id === matchId ? { ...match, status: "processing" as const } : match)),
    )

    toast({
      title: "Payout Initiated",
      description: "Dividend distribution has been started for this match",
    })

    // Simulate payout completion
    setTimeout(() => {
      setPayoutMatches((prev) =>
        prev.map((match) => (match.id === matchId ? { ...match, status: "completed" as const } : match)),
      )

      toast({
        title: "Payout Completed",
        description: "All dividends have been successfully distributed",
      })
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Send className="h-4 w-4" />
      case "completed":
        return <Coins className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payoutMatches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  <Badge className={getStatusColor(match.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(match.status)}
                      {match.status.toUpperCase()}
                    </div>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Total Stake: {match.totalStake.toLocaleString()} CHZ</div>
                  <div>Dividend Pool: {match.totalRewards.toLocaleString()} CHZ</div>
                  <div>Completed: {new Date(match.completedAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {match.status === "pending" && (
                  <Button onClick={() => handleTriggerPayout(match.id)} className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    Trigger Payout
                  </Button>
                )}
                {match.status === "processing" && (
                  <Button disabled className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </Button>
                )}
                {match.status === "completed" && (
                  <Button variant="outline" disabled className="flex items-center gap-1 bg-transparent">
                    <Coins className="h-4 w-4" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Payout Information</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Payouts are triggered manually after match completion</li>
            <li>• Dividends are distributed based on final leaderboard rankings</li>
            <li>• Principal stakes are always returned to users</li>
            <li>• Processing typically takes 2-5 minutes to complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
