"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/contexts/wallet-context"
import { ExternalLink } from "lucide-react"

export function TestnetFaucet() {
  const { isConnected, isChilizTestnet, address } = useWallet()

  if (!isConnected || !isChilizTestnet) {
    return null
  }

  const faucetUrl = "https://testnet-faucet.chiliz.com"
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          🧪 Testnet Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-700 text-sm">
          You're connected to Chiliz Testnet. To get testnet CHZ tokens for testing:
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-blue-600">
            <strong>Your Address:</strong> {address}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.open(faucetUrl, '_blank')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Chiliz Testnet Faucet
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-blue-600 space-y-1">
          <p>• Testnet tokens are free and have no real value</p>
          <p>• Use them only for testing the dApp functionality</p>
          <p>• You can request tokens multiple times if needed</p>
        </div>
      </CardContent>
    </Card>
  )
} 