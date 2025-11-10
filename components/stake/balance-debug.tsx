"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { createPublicClient, http, getBalance } from "viem"
import { chilizChain, chilizTestnet } from "@/lib/contract/wagmi"

export function BalanceDebug() {
  const { isConnected, address, chainId, isChilizTestnet } = useWallet()
  const [manualBalance, setManualBalance] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const fetchBalanceManually = async () => {
    if (!address || !chainId) return
    
    setLoading(true)
    try {
      // Create client for the current chain
      const rpcUrl = isChilizTestnet 
        ? 'https://spicy-rpc.chiliz.com' 
        : 'https://rpc.chiliz.com'
      
      const client = createPublicClient({
        transport: http(rpcUrl),
      })

      const balance = await getBalance(client, {
        address: address as `0x${string}`,
      })

      setManualBalance(balance.formatted)
      console.log('Manual balance fetch:', {
        address,
        chainId,
        rpcUrl,
        balance: balance.formatted,
        symbol: balance.symbol
      })
    } catch (error) {
      console.error('Manual balance fetch error:', error)
      setManualBalance('Error fetching balance')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔍 Balance Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Chain ID:</strong> {chainId}</p>
          <p><strong>Network:</strong> {isChilizTestnet ? 'Chiliz Testnet' : 'Chiliz Mainnet'}</p>
          <p><strong>RPC URL:</strong> {isChilizTestnet ? 'https://spicy-rpc.chiliz.com' : 'https://rpc.chiliz.com'}</p>
        </div>
        
        <Button 
          onClick={fetchBalanceManually}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? 'Fetching...' : 'Fetch Balance Manually'}
        </Button>
        
        {manualBalance && (
          <div className="p-3 bg-white border rounded">
            <p className="text-sm">
              <strong>Manual Balance:</strong> {manualBalance} CHZ
            </p>
          </div>
        )}
        
        <div className="text-xs text-orange-600">
          <p>This component manually fetches the balance using viem to debug balance issues.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </CardContent>
    </Card>
  )
} 