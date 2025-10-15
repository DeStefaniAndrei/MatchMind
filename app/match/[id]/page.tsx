import { Header } from "@/components/layout/header"
import { LiveMatch } from "@/components/match/live-match"
import { MatchLeaderboard } from "@/components/match/match-leaderboard"
import { UpcomingMatch } from "@/components/match/upcoming-match"
import { ActiveQuestionsSidebar } from "@/components/questions/active-questions-sidebar"

interface MatchPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  console.log('Match page accessed with ID:', id)
  

  // Default layout for live matches 
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <ActiveQuestionsSidebar matchId={id} />
              </div>
              <div>
                <LiveMatch matchId={id} />
              </div>
            </div>
          </div>
          <div>
            <MatchLeaderboard matchId={id} />
          </div>
        </div>
      </main>
    </div>
  )
}
