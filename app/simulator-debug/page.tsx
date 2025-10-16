"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

interface SimulatorStatus {
  started: boolean
  matchCount: number
  currentMinutes: Record<string, number>
  timestamp: string
}

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  minute: number
  status: string
  homeScore: number
  awayScore: number
}

export default function SimulatorDebugPage() {
  const [status, setStatus] = useState<SimulatorStatus | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-simulator', { cache: 'no-store' })
      const data = await res.json()
      
      if (data.success) {
        setStatus({
          started: data.status.started,
          matchCount: data.status.matchCount,
          currentMinutes: data.status.currentMinutes,
          timestamp: data.timestamp
        })
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching simulator status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 2000) // Refresh every 2 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Match Simulator Debug</h1>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Simulator Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={status.started ? "default" : "destructive"}>
                      {status.started ? "Running" : "Stopped"}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Match Count</div>
                    <div className="text-2xl font-bold">{status.matchCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Update</div>
                    <div className="text-sm">{new Date(status.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Current Minutes</div>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(status.currentMinutes).map(([id, minute]) => (
                      <div key={id} className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">Match {id}</div>
                        <div className="text-lg font-bold">{minute}'</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{match.homeTeam} vs {match.awayTeam}</CardTitle>
                  <Badge variant={match.status === 'live' ? 'default' : 'secondary'}>
                    {match.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-center">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="text-center text-muted-foreground">
                    Minute: {match.minute}'
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.open(`/match/${match.id}`, '_blank')}
                  >
                    View Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

