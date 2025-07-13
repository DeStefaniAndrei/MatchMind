import { useState, useEffect } from 'react'

export function useSociosWallet() {
  const [isSociosAvailable, setIsSociosAvailable] = useState(false)
  const [sociosAccount, setSociosAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if Socios wallet is available
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkSociosWallet = () => {
      const hasSocios = !!(window as any).socios || !!(window as any).chiliz
      setIsSociosAvailable(hasSocios)
    }

    checkSociosWallet()
    
    // Listen for wallet injection
    window.addEventListener('ethereum#initialized', checkSociosWallet)
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkSociosWallet)
    }
  }, [])

  // Connect to Socios wallet
  const connectSocios = async () => {
    if (typeof window === 'undefined' || !isSociosAvailable) {
      throw new Error('Socios wallet not available')
    }

    setIsConnecting(true)
    
    try {
      const wallet = (window as any).socios || (window as any).chiliz
      const accounts = await wallet.request({ method: 'eth_requestAccounts' })
      
      if (accounts && accounts.length > 0) {
        setSociosAccount(accounts[0])
        return accounts[0]
      } else {
        throw new Error('No accounts found')
      }
    } catch (error) {
      console.error('Failed to connect to Socios wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect from Socios wallet
  const disconnectSocios = () => {
    setSociosAccount(null)
  }

  // Get current accounts
  const getSociosAccounts = async () => {
    if (typeof window === 'undefined' || !isSociosAvailable) return []
    
    try {
      const wallet = (window as any).socios || (window as any).chiliz
      const accounts = await wallet.request({ method: 'eth_accounts' })
      return accounts || []
    } catch (error) {
      console.error('Failed to get Socios accounts:', error)
      return []
    }
  }

  // Switch chain
  const switchSociosChain = async (chainId: number) => {
    if (typeof window === 'undefined' || !isSociosAvailable) return
    
    try {
      const wallet = (window as any).socios || (window as any).chiliz
      await wallet.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error) {
      console.error('Failed to switch Socios chain:', error)
      throw error
    }
  }

  return {
    isSociosAvailable,
    sociosAccount,
    isConnecting,
    connectSocios,
    disconnectSocios,
    getSociosAccounts,
    switchSociosChain,
  }
} 