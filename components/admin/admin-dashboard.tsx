import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Coins, Activity } from "lucide-react"

export function AdminDashboard() {
  const stats = [
    {
      title: "Active Matches",
      value: "3",
      description: "Currently running",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Total Players",
      value: "2,847",
      description: "Registered users",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Total Staked",
      value: "125,000 CHZ",
      description: "Across all matches",
      icon: Coins,
      color: "text-yellow-500",
    },
    {
      title: "Completed Matches",
      value: "156",
      description: "Since launch",
      icon: Trophy,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
