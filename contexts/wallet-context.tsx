"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  chzBalance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chzBalance, setChzBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock wallet connection - replace with actual Socios wallet integration
  const connectWallet = async () => {
    setLoading(true)
    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock wallet data
      setIsConnected(true)
      setAddress("0x1234...5678")
      setChzBalance(1250.75)

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Socios wallet",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setChzBalance(0)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        chzBalance,
        connectWallet,
        disconnectWallet,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
