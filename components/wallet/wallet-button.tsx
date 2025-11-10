"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { Wallet, LogOut, AlertTriangle, Smartphone } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function WalletButton() {
  const { isConnected, address, chzBalance, connectWallet, disconnectWallet, loading, isChilizChain, sociosWalletAvailable } = useWallet()

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={loading} className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {loading ? "Connecting..." : "Connect Wallet"}
        {sociosWalletAvailable && (
          <Badge variant="outline" className="ml-2">
            <Smartphone className="h-3 w-3 mr-1" />
            Socios
          </Badge>
        )}
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
          {/* TEMPORARILY DISABLED - hide wrong network warning for testing */}
          {/* {!isChilizChain && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Wrong Network
            </Badge>
          )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
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
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Network</p>
          <p className="text-xs text-muted-foreground">
            {isChilizChain ? "Chiliz Chain" : "Connected"}
          </p>
        </div>
        {sociosWalletAvailable && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">Available Wallets</p>
              <p className="text-xs text-muted-foreground">
                Socios Wallet Available
              </p>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
