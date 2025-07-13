"use client"

import { WalletConnectButton } from "@/components/wallet/connect-button"
import { SociosConnect } from "@/components/wallet/socios-connect"
import { useSociosWallet } from "@/hooks/use-socios-wallet"
import { useAccount, useBalance } from 'wagmi'
import { chilizChain, chilizTestnet } from '@/lib/wagmi'
import { useWallet } from "@/contexts/wallet-context"
import { TestnetFaucet } from "@/components/stake/testnet-faucet"
import { BalanceDebug } from "@/components/stake/balance-debug"

export default function TestWalletPage() {
  const { address, isConnected, chainId } = useAccount()
  const { data: balanceData } = useBalance({
    address,
    chainId: chainId,
    query: {
      enabled: !!address && isConnected && (chainId === chilizChain.id || chainId === chilizTestnet.id),
    },
  })
  const { isSociosAvailable, sociosAccount } = useSociosWallet()
  const { 
    isConnected: walletConnected, 
    address: walletAddress, 
    chzBalance, 
    isChilizChain, 
    isChilizTestnet,
    chainId: walletChainId 
  } = useWallet()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Test Page</h1>
      
      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">RainbowKit Wallet</h2>
          <WalletConnectButton />
          {isConnected && (
            <div className="mt-4 space-y-2">
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Chain ID:</strong> {chainId}</p>
              <p><strong>Balance:</strong> {balanceData?.formatted} {balanceData?.symbol}</p>
            </div>
          )}
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Wallet Context (Enhanced)</h2>
          <div className="mt-4 space-y-2">
            <p><strong>Connected:</strong> {walletConnected ? 'Yes' : 'No'}</p>
            {walletConnected && (
              <>
                <p><strong>Address:</strong> {walletAddress}</p>
                <p><strong>Chain ID:</strong> {walletChainId}</p>
                <p><strong>CHZ Balance (Context):</strong> {chzBalance.toFixed(4)} CHZ</p>
                <p><strong>Balance Data (Raw):</strong> {balanceData ? `${balanceData.formatted} ${balanceData.symbol}` : 'Not available'}</p>
                <p><strong>Network:</strong> 
                  {isChilizChain && <span className="text-green-600 font-medium">Chiliz Mainnet</span>}
                  {isChilizTestnet && <span className="text-blue-600 font-medium">🧪 Chiliz Testnet</span>}
                  {!isChilizChain && !isChilizTestnet && <span className="text-yellow-600 font-medium">Other Network</span>}
                </p>
                {isChilizTestnet && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 text-sm">
                      🧪 <strong>Testnet Mode:</strong> You're connected to Chiliz Testnet. 
                      This means you're using testnet tokens for testing purposes.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Socios Wallet</h2>
          <SociosConnect />
          <div className="mt-4 space-y-2">
            <p><strong>Socios Available:</strong> {isSociosAvailable ? 'Yes' : 'No'}</p>
            {sociosAccount && (
              <p><strong>Socios Account:</strong> {sociosAccount}</p>
            )}
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="space-y-2 text-sm">
            <li>• RainbowKit will show MetaMask, WalletConnect, and other standard wallets</li>
            <li>• Socios wallet will appear if you have the Socios app installed</li>
            <li>• Make sure you're on the Chiliz Chain (Chain ID: 88888) or Chiliz Testnet (Chain ID: 88882)</li>
            <li>• You can connect both wallets simultaneously</li>
            <li>• Testnet tokens are for testing only and have no real value</li>
            <li>• If balance shows 0, you may need to get testnet tokens from a faucet</li>
          </ul>
        </div>

        <TestnetFaucet />
        <BalanceDebug />
      </div>
    </div>
  )
} 