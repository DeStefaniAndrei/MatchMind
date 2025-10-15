"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { fetchMatches, addStake, upsertUserByWallet } from "@/lib/api"
import { useWallet } from "@/contexts/wallet-context"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { createPublicClient, http, getContract, parseUnits } from "viem"
import { useAccount, useChainId, useWalletClient } from "wagmi"
import { mockWalletData } from "@/lib/mock-data"

import GamePoolABI from "../../artifacts/contracts/GamePool.sol/GamePool.json"

const MIN_STAKE = 0.01
const MIN_BET = 0.01

export function StakeForm() {
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [betAmount, setBetAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("staking")
  const { address, isConnected, chzBalance, isChilizTestnet } = useWallet()
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const { chain } = useAccount()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const searchParams = useSearchParams()

  // Use mock data for demo
  const demoWalletData = mockWalletData
  const demoBalance = demoWalletData.chzBalance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMatches()
        setMatches(data)
      } catch (error) {
        // Fallback to empty array for demo
        setMatches([])
      }
    }
    fetchData()
  }, [])

  // Set selected match from URL parameter
  useEffect(() => {
    const matchParam = searchParams.get('match')
    if (matchParam) {
      console.log('Setting selected match from URL param:', matchParam)
      setSelectedMatch(matchParam)
    }
  }, [searchParams])

  // Debug: Log available matches
  useEffect(() => {
    console.log('Available matches:', matches)
    console.log('Upcoming matches:', matches.filter((m) => m.status === "upcoming" || m.status === "scheduled"))
  }, [matches])

  const handleStake = async () => {
    if (!selectedMatch || !stakeAmount) {
      toast({ title: "Missing Information", description: "Please select a match and enter stake amount." })
      return
    }

    const amount = parseFloat(stakeAmount)
    if (isNaN(amount) || amount < MIN_STAKE) {
      toast({ title: "Invalid Amount", description: `Minimum stake is ${MIN_STAKE} CHZ.` })
      return
    }

    if (amount > demoBalance) {
      toast({ title: "Insufficient Balance", description: "You don't have enough CHZ to stake." })
      return
    }

    setLoading(true)
    
    // Simulate staking process for demo
    setTimeout(() => {
      console.log('Staking on match ID:', selectedMatch)
      toast({ title: "Stake Successful", description: `You staked ${amount} CHZ!` })
      setStakeAmount("")
      setLoading(false)
      
      // Redirect to match page
      router.push(`/match/${selectedMatch}`)
    }, 2000)
  }

  const handleBet = async () => {
    if (!isConnected || !selectedMatch || !betAmount || !address || !walletClient) {
      toast({ title: "Missing Information", description: "Please connect wallet and fill all fields." })
      return
    }

    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET) {
      toast({ title: "Invalid Amount", description: `Minimum bet is ${MIN_BET} CHZ.` })
      return
    }

    setLoading(true)
    
    try {
      // 1. Find match and GamePool contract address
      const match = matches.find((m) => m.id === selectedMatch)
      if (!match || !match.contract_address) throw new Error("Match or contract address not found")
      const poolAddress = match.contract_address

      console.log('=== BET DEBUG INFO ===')
      console.log('Match:', match)
      console.log('Pool Address:', poolAddress)
      console.log('User Address:', address)
      console.log('Bet Amount:', amount)

      // 2. Check if user is available from context
      if (!user || !user.id) {
        toast({ title: "User Error", description: "Please wait for user to be loaded or try reconnecting your wallet." })
        return
      }

      // 3. Prepare native CHZ amount
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      })
      const decimals = 18
      const amountWei = parseUnits(betAmount, decimals)

      console.log('Amount in Wei:', amountWei.toString())
      console.log('Chain:', chain)
      console.log('Wallet Client:', walletClient)

      // 4. Call betAndEnter with native CHZ
      console.log('GamePool ABI:', GamePoolABI.abi)
      console.log('Calling betAndEnter with:', {
        amountWei,
        poolAddress,
        account: address,
        value: amountWei,
      })
      
      const poolContract = getContract({
        address: poolAddress as `0x${string}`,
        abi: GamePoolABI.abi,
        client: walletClient,
      })
      
      // Check game state before attempting to bet
      try {
        const gameState = await poolContract.read.gameState()
        console.log('Current game state:', gameState)
        if (gameState !== 0) { // 0 = PRE_MATCH
          throw new Error(`Game is not in pre-match state. Current state: ${gameState}`)
        }
      } catch (stateError: any) {
        console.error('Error checking game state:', stateError)
        throw new Error(`Cannot check game state: ${stateError?.message || 'Unknown error'}`)
      }
      
      // First, simulate the transaction to catch revert reasons
      try {
        const { request } = await poolContract.simulate.betAndEnter({ 
          value: amountWei 
        })
        console.log('Transaction simulation successful:', request)
      } catch (simError: any) {
        console.error('Transaction simulation failed:', simError)
        throw new Error(`Transaction would fail: ${simError?.message || simError?.reason || 'Unknown error'}`)
      }
      
      const txHash = await poolContract.write.betAndEnter([], { 
        value: amountWei 
      })
      toast({ title: "Transaction Sent", description: "Waiting for confirmation..." })
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      if (receipt.status !== 'success') {
        throw new Error("Transaction failed or reverted on-chain")
      }

      // 5. Insert bet in DB
      await addStake(user.id, match.id, amount)
      toast({ title: "Bet Successful", description: "Your bet has been placed!" })
      setBetAmount("")
      setSelectedMatch("")
      // 6. Redirect
      router.push(`/match/${match.id}`)
    } catch (error: any) {
      console.error("=== BET ERROR ===")
      console.error("Error object:", error)
      console.error("Error type:", typeof error)
      console.error("Error message:", error?.message)
      console.error("Error name:", error?.name)
      console.error("Error stack:", error?.stack)
      console.error("Error data:", error?.data)
      console.error("Error code:", error?.code)
      console.error("Error reason:", error?.reason)
      console.error("Error details:", error?.details)
      console.error("Full error stringified:", JSON.stringify(error, null, 2))
      console.error("==================")
      
      let errorMessage = "There was an error placing your bet."
      
      // Provide more specific error messages
      if (error?.message?.includes("Bet below minimum")) {
        errorMessage = `Bet amount is below the minimum requirement of ${MIN_BET} CHZ.`
      } else if (error?.message?.includes("Game not in pre-match state")) {
        errorMessage = "This match is no longer accepting bets."
      } else if (error?.message?.includes("Only owner can call this function")) {
        errorMessage = "Contract access error. Please try again or contact support."
      } else if (error?.message?.includes("Transaction failed or reverted on-chain")) {
        errorMessage = "Transaction was reverted on-chain. Check your balance and try again."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({ title: "Bet Failed", description: errorMessage })
    }
    setLoading(false)
  }

  const upcomingMatches = matches.filter((m) => m.status === "upcoming" || m.status === "scheduled")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake & Bet CHZ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="betting">Betting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staking" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match">Select Match</Label>
              <Select value={selectedMatch} onValueChange={(value) => {
                console.log('Selected match:', value)
                setSelectedMatch(value)
              }} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a match to stake on" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.home_team || match.homeTeam} vs {match.away_team || match.awayTeam}
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
                placeholder="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={loading}
                min={MIN_STAKE}
                step="0.01"
              />
              <div className="text-sm text-muted-foreground">
                Available: {demoBalance} CHZ | Min: {MIN_STAKE} CHZ
              </div>
            </div>

            <Button 
              onClick={handleStake} 
              disabled={loading || !selectedMatch || !stakeAmount}
              className="w-full"
            >
              {loading ? "Staking..." : "Stake CHZ"}
            </Button>
          </TabsContent>

          <TabsContent value="betting" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match">Select Match</Label>
              <Select value={selectedMatch} onValueChange={(value) => {
                console.log('Selected match (betting):', value)
                setSelectedMatch(value)
              }} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a match to bet on" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.home_team || match.homeTeam} vs {match.away_team || match.awayTeam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="betAmount">Bet Amount (CHZ)</Label>
              <Input
                id="betAmount"
                type="number"
                placeholder="0.01"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={loading}
                min={MIN_BET}
                step="0.01"
              />
              <div className="text-sm text-muted-foreground">
                Available: {isConnected ? chzBalance : demoBalance} CHZ | Min: {MIN_BET} CHZ
              </div>
            </div>

            <Button 
              onClick={handleBet} 
              disabled={loading || !selectedMatch || !betAmount || !isConnected}
              className="w-full"
            >
              {loading ? "Betting..." : "Bet CHZ"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
