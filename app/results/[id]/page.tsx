import { Header } from "@/components/layout/header"
import { MatchResults } from "@/components/results/match-results"
import { FinalLeaderboard } from "@/components/results/final-leaderboard"
import { RewardSummary } from "@/components/results/reward-summary"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Match Results</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <MatchResults matchId={params.id} />
            <RewardSummary matchId={params.id} />
          </div>
          <div>
            <FinalLeaderboard matchId={params.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
