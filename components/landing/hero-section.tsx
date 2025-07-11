import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Shield, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MatchMind
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Stake CHZ, predict football matches, and earn dividend rewards. Your principal is always safe—only generated
          dividends are distributed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/stake">Start Staking</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
            <Link href="#matches">View Matches</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Safe Staking</h3>
            <p className="text-muted-foreground">Your principal is always protected. Only dividends are at risk.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Predictions</h3>
            <p className="text-muted-foreground">Answer questions every minute during live matches.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Trophy className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
            <p className="text-muted-foreground">Top performers share the dividend pool based on accuracy.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
