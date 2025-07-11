"use client"

import { useState, useEffect } from "react"
import { MatchCard } from "./match-card"
import { mockMatches } from "@/lib/mock-data"
import type { Match } from "@/lib/types"

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch matches
    const fetchMatches = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMatches(mockMatches)
      setLoading(false)
    }

    fetchMatches()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div id="matches" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}
