"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { useSwitchChain } from "wagmi"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { chilizChain, chilizTestnet } from "@/lib/contract/wagmi"
import { useToast } from "@/hooks/use-toast"

export function NetworkSwitcher() {
  const { isConnected, isChilizChain, isChilizTestnet } = useWallet()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()

  if (!isConnected) {
    return null
  }

  if (isChilizChain) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Connected to Chiliz Chain</span>
      </div>
    )
  }

  if (isChilizTestnet) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">🧪 Connected to Chiliz Testnet</span>
      </div>
    )
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: chilizChain.id })
      toast({
        title: "Network Switched",
        description: "Successfully switched to Chiliz Chain",
      })
    } catch (error) {
      console.error("Failed to switch network:", error)
      toast({
        title: "Network Switch Failed",
        description: "Please manually switch to Chiliz Chain in your wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <span className="text-sm text-yellow-600">Wrong Network</span>
      <Button
        onClick={handleSwitchNetwork}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        Switch to Chiliz Chain
      </Button>
      <Button
        onClick={() => switchChain({ chainId: chilizTestnet.id })}
        size="sm"
        variant="outline"
        className="text-xs"
      >
        Switch to Testnet
      </Button>
    </div>
  )
} 