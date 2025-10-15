"use client"

import { useUser } from "@/contexts/user-context"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UserDebug() {
  const { user, isLoading } = useUser()
  const { isConnected, address } = useWallet()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">User Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        {address && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet:</span>
            <span className="text-xs font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">User ID:</span>
          <span className="text-xs font-mono">
            {user?.id ? `${user.id.slice(0, 8)}...` : "None"}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Username:</span>
          <span className="text-xs font-mono">{user?.username || "None"}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Type:</span>
          <Badge variant={user?.isAnonymous ? "outline" : "default"}>
            {user?.isAnonymous ? "Anonymous" : "Registered"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Loading:</span>
          <Badge variant={isLoading ? "secondary" : "outline"}>
            {isLoading ? "Yes" : "No"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
