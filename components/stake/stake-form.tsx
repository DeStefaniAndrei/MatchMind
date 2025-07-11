"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { mockMatches } from "@/lib/mock-data"

export function StakeForm() {
  const [selectedMatch, setSelectedMatch] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { isConnected, chzBalance } = useWallet()
  const { toast } = useToast()

  const handleStake = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to stake CHZ",
        variant: "destructive",
      })
      return
    }

    if (!selectedMatch || !stakeAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a match and enter stake amount",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(stakeAmount)
    if (amount <= 0 || amount > chzBalance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount within your balance",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Stake Successful!",
        description: `Successfully staked ${amount} CHZ. Your principal is safe—only dividends are at risk.`,
      })

      setStakeAmount("")
      setSelectedMatch("")
    } catch (error) {
      toast({
        title: "Stake Failed",
        description: "Failed to process stake. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const upcomingMatches = mockMatches.filter((match) => match.status === "upcoming")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake CHZ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="match">Select Match</Label>
          <Select value={selectedMatch} onValueChange={setSelectedMatch}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a match to stake on" />
            </SelectTrigger>
            <SelectContent>
              {upcomingMatches.map((match) => (
                <SelectItem key={match.id} value={match.id}>
                  {match.homeTeam} vs {match.awayTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Stake Amount (CHZ)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            max={chzBalance}
            step="0.01"
          />
          {isConnected && <p className="text-sm text-muted-foreground">Available: {chzBalance.toFixed(2)} CHZ</p>}
        </div>

        <Button
          onClick={handleStake}
          disabled={!isConnected || loading || !selectedMatch || !stakeAmount}
          className="w-full"
        >
          {loading ? "Processing..." : "Stake CHZ"}
        </Button>

        {!isConnected && (
          <p className="text-sm text-muted-foreground text-center">Connect your wallet to start staking</p>
        )}
      </CardContent>
    </Card>
  )
}
