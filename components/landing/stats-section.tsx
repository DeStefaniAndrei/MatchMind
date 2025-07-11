import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsSection() {
  const stats = [
    { title: "Total Staked", value: "125,000 CHZ", description: "Across all matches" },
    { title: "Active Players", value: "2,847", description: "Currently participating" },
    { title: "Matches Completed", value: "156", description: "Since launch" },
    { title: "Rewards Distributed", value: "45,230 CHZ", description: "In dividends" },
  ]

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
