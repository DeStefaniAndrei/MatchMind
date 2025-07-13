import { Header } from "@/components/layout/header"
import { LiveMatch } from "@/components/match/live-match"
import { MatchLeaderboard } from "@/components/match/match-leaderboard"
import { UpcomingMatch } from "@/components/match/upcoming-match"

interface MatchPageProps {
  params: {
    id: string
  }
}

export default function MatchPage({ params }: MatchPageProps) {
  // Check if this is the PSG vs Nantes match (ID: "10")
  const isPSGvsNantes = params.id === "10"
  
  if (isPSGvsNantes) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <UpcomingMatch matchId={params.id} />
          </div>
        </main>
      </div>
    )
  }

  // Default layout for live matches (Liverpool vs Manchester United)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveMatch matchId={params.id} />
          </div>
          <div>
            <MatchLeaderboard matchId={params.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
