"use client"

import { useState, useEffect } from "react"
import { MatchCard } from "./match-card"
import { fetchMatches } from "@/lib/api"
import type { Match } from "@/lib/types"

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch matches from Supabase
    const fetchData = async () => {
      try {
        const data = await fetchMatches()
        console.log('Fetched matches:', data)
        setMatches(data)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setMatches([])
      }
      setLoading(false)
    }
    fetchData()
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

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No matches available</p>
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
