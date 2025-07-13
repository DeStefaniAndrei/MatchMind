import { PSGMatches } from "@/components/matches/psg-matches"

export default function PSGMatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">PSG Matches</h1>
        <p className="text-muted-foreground">
          Live and upcoming Paris Saint-Germain matches with prediction opportunities
        </p>
      </div>
      
      <PSGMatches />
    </div>
  )
} 