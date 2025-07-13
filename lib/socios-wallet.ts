import { createPublicClient, http } from 'viem'

// Socios Wallet ID
export const SOCIOS_WALLET_ID = '56843177b5e89d4bcb19a27dab7c49e0f33d8d3a6c8c4c7e5274f605e92befd6'

// Create Viem client for Chiliz Chain
export const chilizClient = createPublicClient({
  transport: http('https://rpc.chiliz.com'),
})

// Chiliz Chain configuration
export const chilizChain = {
  id: 88888,
  name: 'Chiliz Chain',
  network: 'chiliz',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    public: { http: ['https://rpc.chiliz.com'] },
    default: { http: ['https://rpc.chiliz.com'] },
  },
  blockExplorers: {
    default: { name: 'Chiliz Explorer', url: 'https://explorer.chiliz.com' },
  },
} as const

// Chiliz Testnet configuration (Spicy Testnet)
export const chilizTestnet = {
  id: 88882,
  name: 'Chiliz Testnet',
  network: 'chiliz-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    public: { http: ['https://spicy-rpc.chiliz.com'] },
    default: { http: ['https://spicy-rpc.chiliz.com'] },
  },
  blockExplorers: {
    default: { name: 'Chiliz Testnet Explorer', url: 'https://spicy-explorer.chiliz.com' },
  },
} as const

// Function to detect Socios wallet
export function detectSociosWallet(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if Socios wallet is available
  return !!(window as any).socios || !!(window as any).chiliz
}

// Function to connect to Socios wallet
export async function connectSociosWallet(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  try {
    // Check for Socios wallet
    if ((window as any).socios) {
      const accounts = await (window as any).socios.request({ method: 'eth_requestAccounts' })
      return accounts[0] || null
    }
    
    // Check for Chiliz wallet
    if ((window as any).chiliz) {
      const accounts = await (window as any).chiliz.request({ method: 'eth_requestAccounts' })
      return accounts[0] || null
    }
    
    return null
  } catch (error) {
    console.error('Failed to connect to Socios wallet:', error)
    return null
  }
} 