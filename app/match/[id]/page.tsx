import { Header } from "@/components/layout/header"
import { LiveMatch } from "@/components/match/live-match"
import { MatchLeaderboard } from "@/components/match/match-leaderboard"
import { UpcomingMatch } from "@/components/match/upcoming-match"

interface MatchPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  console.log('Match page accessed with ID:', id)
  // Check if this is the PSG vs Nantes match (ID: "10") or contains PSG vs Nantes
  const isPSGvsNantes = id === "10" || id.includes("psg") || id.includes("nantes")
  
  if (isPSGvsNantes) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <UpcomingMatch matchId={id} />
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
            <LiveMatch matchId={id} />
          </div>
          <div>
            <MatchLeaderboard matchId={id} />
          </div>
        </div>
      </main>
    </div>
  )
}
