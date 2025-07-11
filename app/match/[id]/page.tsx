import { Header } from "@/components/layout/header"
import { LiveMatch } from "@/components/match/live-match"
import { MatchLeaderboard } from "@/components/match/match-leaderboard"

interface MatchPageProps {
  params: {
    id: string
  }
}

export default function MatchPage({ params }: MatchPageProps) {
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
