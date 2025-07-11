import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Info, TrendingUp } from "lucide-react"

export function StakeInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          How Staking Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Your Principal is Safe</h4>
            <p className="text-sm text-muted-foreground">
              Your staked CHZ is always protected. Only the generated dividend is distributed as rewards.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Earn Dividends</h4>
            <p className="text-sm text-muted-foreground">
              Predict match outcomes correctly to earn a share of the dividend pool generated from all stakes.
            </p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Example:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• You stake: 100 CHZ</li>
            <li>• Dividend generated: 10 CHZ</li>
            <li>• Your share: Based on prediction accuracy</li>
            <li>• Your principal: Always remains 100 CHZ</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
