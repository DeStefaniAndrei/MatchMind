"use client"

import { Button } from "@/components/ui/button"
import { useSociosWallet } from "@/hooks/use-socios-wallet"
import { Wallet } from "lucide-react"

export function SociosConnect() {
  const { 
    isSociosAvailable, 
    sociosAccount, 
    isConnecting, 
    connectSocios, 
    disconnectSocios 
  } = useSociosWallet()

  if (!isSociosAvailable) {
    return null
  }

  if (sociosAccount) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Socios: {sociosAccount.slice(0, 6)}...{sociosAccount.slice(-4)}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnectSocios}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={connectSocios}
      disabled={isConnecting}
      className="flex items-center space-x-2"
    >
      <Wallet className="h-4 w-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Socios'}</span>
    </Button>
  )
} 