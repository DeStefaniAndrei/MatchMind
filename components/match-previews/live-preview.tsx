"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { fetchMatches } from "@/lib/api/api"
import type { Match } from "@/lib/types"

const PREVIEW_MATCHES_COUNT = 3

export function LivePreview() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMatches()
        //TO DO Sort upcoming by time
        // Prefer live first, then upcoming take up to PREVIEW_MATCHES_COUNT
        const sorted = [...data].sort((a, b) => {
          const order = (s: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2)
          return order(a.status) - order(b.status)
        })
        setMatches(sorted.slice(0, PREVIEW_MATCHES_COUNT))
      } catch (e) {
        setMatches([])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return <div className="text-center text-muted-foreground">No matches available</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto max-w-7xl">
      {matches.map((m) => {
        const isLive = m.status === "live"
        return (
          <Card key={m.id} className={isLive ? "border-2 border-red-500" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">
                  {m.homeTeam} vs {m.awayTeam}
                </CardTitle>
                <Badge className={isLive ? "bg-red-500" : undefined} variant={isLive ? undefined : "secondary"}>
                  {m.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold">
                  {m.homeScore ?? 0} - {m.awayScore ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLive ? `${m.minute ?? 0}'` : new Date(m.startTime).toLocaleString()}
                </div>
                {isLive && (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Live questions active</span>
                  </div>
                )}
                <Link href={`/match/${m.id}`}>
                  <Button className="w-full">{isLive ? "Join Match" : "View Match"}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


