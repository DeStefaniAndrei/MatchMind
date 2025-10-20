"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAccount, useBalance, useDisconnect, useConnect } from "wagmi"
import { useToast } from "@/hooks/use-toast"
import { chilizChain, chilizTestnet } from "@/lib/contract/wagmi"
import { detectSociosWallet, connectSociosWallet } from "@/lib/contract/socios-wallet"
import { useUser } from "@/contexts/user-context"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  chzBalance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  loading: boolean
  chainId: number | undefined
  isChilizChain: boolean
  isChilizTestnet: boolean
  sociosWalletAvailable: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [sociosWalletAvailable, setSociosWalletAvailable] = useState(false)
  const { toast } = useToast()
  const { setUserFromWallet, setAnonymousUser } = useUser()
  
  // Wagmi hooks
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  
  // Get CHZ balance for current chain
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useBalance({
    address,
    chainId: chainId,
    query: {
      enabled: !!address && isConnected && (chainId === chilizChain.id || chainId === chilizTestnet.id),
    },
  })
  
  // Handle wallet connection changes - update user context
  useEffect(() => {
    console.log('Wallet context effect triggered:', { isConnected, address })
    
    if (isConnected && address) {
      console.log('Wallet connected, setting user from wallet:', address)
      setUserFromWallet(address)
    } else if (!isConnected) {
      console.log('Wallet disconnected, setting anonymous user')
      setAnonymousUser()
    }
  }, [isConnected, address, setUserFromWallet, setAnonymousUser])

  // Debug logging
  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet Context Debug:', {
        address,
        chainId,
        isChilizChain: chainId === chilizChain.id,
        isChilizTestnet: chainId === chilizTestnet.id,
        balanceData,
        balanceLoading,
        balanceError
      })
    }
  }, [isConnected, address, chainId, balanceData, balanceLoading, balanceError])
  
  const chzBalance = balanceData ? parseFloat(balanceData.formatted) : 0
  const isChilizChain = chainId === chilizChain.id
  const isChilizTestnet = chainId === chilizTestnet.id

  // Ensure we're on the client side and detect Socios wallet
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      setSociosWalletAvailable(detectSociosWallet())
    }
  }, [])

  const connectWallet = async () => {
    setLoading(true)
    try {
      // Check if we're on the client side
      if (!isClient) {
        throw new Error("Wallet connection not available on server side")
      }

      // Wait a bit for connectors to be ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Try Socios wallet first if available
      if (sociosWalletAvailable) {
        const sociosAddress = await connectSociosWallet()
        if (sociosAddress) {
          toast({
            title: "Socios Wallet Connected",
            description: "Connected to Socios wallet successfully!",
          })
          return
        }
      }

      // Try to connect with available wagmi connectors
      const availableConnectors = connectors.filter(connector => connector.ready)
      
      if (availableConnectors.length === 0) {
        // Check if MetaMask is installed
        if (typeof window !== 'undefined' && window.ethereum) {
          throw new Error("MetaMask is installed but not connected. Please unlock MetaMask and approve the connection request.")
        } else {
          throw new Error("No wallet connectors available. Please install MetaMask or Socios wallet.")
        }
      }

      // Connect with the first available connector (MetaMask)
      await connect({ connector: availableConnectors[0] })
        toast({
          title: "Wallet Connected",
          description: "Connected to MetaMask successfully!",
        })
    } catch (error) {
      console.error("Wallet connection error:", error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to connect wallet. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("MetaMask")) {
          errorMessage = "Please unlock MetaMask and approve the connection request. If MetaMask is locked, unlock it first."
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Connection was rejected. Please try again and approve the connection in your wallet."
        } else if (error.message.includes("No wallet connectors")) {
          errorMessage = "No wallet detected. Please install MetaMask or Socios wallet extension."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    try {
      disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      console.error("Disconnect error:", error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  // Show warning if not on Chiliz Chain or Testnet
  // TEMPORARILY DISABLED FOR TESTING
  // useEffect(() => {
  //   if (isConnected && !isChilizChain && !isChilizTestnet) {
  //     toast({
  //       title: "Wrong Network",
  //       description: "Please switch to Chiliz Chain or Chiliz Testnet to use MatchMind",
  //       variant: "destructive",
  //     })
  //   }
  // }, [isConnected, isChilizChain, isChilizTestnet, toast])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || null,
        chzBalance,
        connectWallet,
        disconnectWallet,
        loading,
        chainId,
        isChilizChain,
        isChilizTestnet,
        sociosWalletAvailable,
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
