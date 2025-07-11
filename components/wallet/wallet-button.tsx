"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletButton() {
  const { isConnected, address, chzBalance, connectWallet, disconnectWallet, loading } = useWallet()

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={loading} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {loading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className="sm:hidden">Wallet</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Balance</p>
          <p className="text-sm text-muted-foreground">{chzBalance.toFixed(2)} CHZ</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Address</p>
          <p className="text-xs text-muted-foreground font-mono">{address}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
