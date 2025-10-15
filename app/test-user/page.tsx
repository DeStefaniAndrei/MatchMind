"use client"

import { UserDebug } from "@/components/user/user-debug"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useUser } from "@/contexts/user-context"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { addStake, fetchStakes, addPrediction, fetchPredictions } from "@/lib/api"
import { useState } from "react"

export default function TestUserPage() {
  const { user, isLoading } = useUser()
  const { isConnected, address } = useWallet()
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testAddStake = async () => {
    if (!user?.id) {
      addTestResult("❌ No user ID available")
      return
    }

    try {
      const result = await addStake(user.id, "test-match-1", 10)
      addTestResult(`✅ Stake added: ${JSON.stringify(result)}`)
    } catch (error) {
      addTestResult(`❌ Stake error: ${error}`)
    }
  }

  const testFetchStakes = async () => {
    if (!user?.id) {
      addTestResult("❌ No user ID available")
      return
    }

    try {
      const stakes = await fetchStakes(user.id)
      addTestResult(`✅ Fetched stakes: ${stakes.length} found`)
    } catch (error) {
      addTestResult(`❌ Fetch stakes error: ${error}`)
    }
  }

  const testAddPrediction = async () => {
    if (!user?.id) {
      addTestResult("❌ No user ID available")
      return
    }

    try {
      const result = await addPrediction(user.id, "test-match-1", "test-question-1", "Home Team")
      addTestResult(`✅ Prediction added: ${JSON.stringify(result)}`)
    } catch (error) {
      addTestResult(`❌ Prediction error: ${error}`)
    }
  }

  const testFetchPredictions = async () => {
    if (!user?.id) {
      addTestResult("❌ No user ID available")
      return
    }

    try {
      const predictions = await fetchPredictions(user.id, "test-match-1")
      addTestResult(`✅ Fetched predictions: ${predictions.length} found`)
    } catch (error) {
      addTestResult(`❌ Fetch predictions error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">User System Test</h1>
        <p className="text-muted-foreground">
          Test the new persistent user ID system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserDebug />
        
        <Card>
          <CardHeader>
            <CardTitle>Wallet Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WalletButton />
            <div className="text-sm space-y-1">
              <div>Connected: {isConnected ? "✅" : "❌"}</div>
              <div>Address: {address || "None"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testAddStake} disabled={!user?.id || isLoading}>
              Test Add Stake
            </Button>
            <Button onClick={testFetchStakes} disabled={!user?.id || isLoading}>
              Test Fetch Stakes
            </Button>
            <Button onClick={testAddPrediction} disabled={!user?.id || isLoading}>
              Test Add Prediction
            </Button>
            <Button onClick={testFetchPredictions} disabled={!user?.id || isLoading}>
              Test Fetch Predictions
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Test Results:</h4>
              <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-xs font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>• <strong>Anonymous Users:</strong> Get a temporary ID like <code>anon_1234567890_abc123</code></div>
          <div>• <strong>Wallet Users:</strong> Get a real database ID from wallet address</div>
          <div>• <strong>Persistence:</strong> User ID is saved in localStorage and maintained across sessions</div>
          <div>• <strong>Auto-Switch:</strong> Automatically switches between anonymous and registered when wallet connects/disconnects</div>
          <div>• <strong>API Integration:</strong> All API calls now use the persistent user ID from context</div>
        </CardContent>
      </Card>
    </div>
  )
}
