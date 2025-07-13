import { createPublicClient, http } from 'viem'

// Create Viem client for Chiliz Chain as per Socios documentation
export const viemClient = createPublicClient({
  transport: http('https://rpc.chiliz.com'), // Chiliz Chain RPC endpoint
})

// Alternative RPC endpoints for Chiliz Chain
export const chilizRpcEndpoints = [
  'https://rpc.chiliz.com',
  'https://chiliz-rpc.publicnode.com',
  'https://chiliz.drpc.org',
]

// Create client with fallback endpoints
export const createChilizClient = (endpoint?: string) => {
  return createPublicClient({
    transport: http(endpoint || 'https://rpc.chiliz.com'),
  })
} 