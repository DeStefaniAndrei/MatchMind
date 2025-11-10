import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { chilizChain, chilizTestnet } from './socios-wallet'
import { mainnet, sepolia } from 'wagmi/chains'

// Create config with RainbowKit and Socios wallet support
export const config = getDefaultConfig({
  appName: 'MatchMind',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, chilizChain, chilizTestnet] as const,
  // Avoid initializing WalletConnect on server to prevent duplicate cores
  ssr: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [chilizChain.id]: http(),
    [chilizTestnet.id]: http(),
  },
})

// Re-export for compatibility
export { chilizChain, chilizTestnet } 