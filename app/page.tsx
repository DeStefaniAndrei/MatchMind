import { Header } from "@/components/layout/header"
import { MatchList } from "@/components/matches/match-list"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Live & Upcoming Matches</h2>
            <MatchList />
          </section>
          <StatsSection />
        </div>
      </main>
    </div>
  )
}
