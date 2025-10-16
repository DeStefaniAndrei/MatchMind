import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { chilizChain, chilizTestnet } from './socios-wallet'

// Create config with RainbowKit and Socios wallet support
export const config = getDefaultConfig({
  appName: 'MatchMind',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [chilizChain, chilizTestnet],
  ssr: true,
  transports: {
    [chilizChain.id]: http('https://rpc.chiliz.com'),
    [chilizTestnet.id]: http('https://spicy-rpc.chiliz.com'),
  },
})

// Re-export for compatibility
export { chilizChain, chilizTestnet } 