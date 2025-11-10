// Smart contract interaction functions for MatchMind dApp
// Deployed on Chiliz Chain

// Type declarations for ethereum window object
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (params: any) => void) => void
      removeListener: (event: string, callback: (params: any) => void) => void
    }
  }
}

export interface StakeTransaction {
  matchId: string
  amount: number
  userAddress: string
}

export interface MatchData {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  status: 'upcoming' | 'live' | 'ended'
  totalStaked: number
  playerCount: number
}

// Contract addresses on Chiliz Chain
export const CONTRACT_ADDRESSES = {
  matchMind: "0x6f91424d7f6B88F73D73E6cD83678872f7F51bBD",
  gameFactory: "0x4B58545a3c2Bf7a4Bf2742B9C08821DF637CD8aE",
  chzToken: "0x0000000000000000000000000000000000000000", // Zero address for native CHZ
  stakingPool: "0x0000000000000000000000000000000000000000" // Not used in betting system
}

// ABI for MatchMind contract (simplified for frontend)
export const MATCH_MIND_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_owner", "type": "address"},
      {"internalType": "address", "name": "_chzToken", "type": "address"},
      {"internalType": "address", "name": "_stakingContract", "type": "address"},
      {"internalType": "address", "name": "_validator", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "createGame",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "startMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "endMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"internalType": "address[]", "name": "rankings", "type": "address[]"}
    ],
    "name": "distributeYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
]

/**
 * Connect to Chiliz Chain and get contract instance
 */
export async function getMatchMindContract() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed')
  }

  // Request account access
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = accounts[0]

  // Check if connected to Chiliz Chain
  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== '0x15b38') { // Chiliz Chain ID: 88888
    throw new Error('Please connect to Chiliz Chain')
  }

  // Create contract instance
  const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  
  return new (window as any).ethers.Contract(
    CONTRACT_ADDRESSES.matchMind,
    MATCH_MIND_ABI,
    signer
  )
}

/**
 * Create a new game/match
 * @returns Game ID
 */
export async function createNewGame(): Promise<string> {
  try {
    const contract = await getMatchMindContract()
    const tx = await contract.createGame()
    const receipt = await tx.wait()
    
    // Extract game ID from events (you might need to adjust based on actual events)
    console.log('Game created:', receipt)
    return receipt.transactionHash
  } catch (error) {
    console.error('Error creating game:', error)
    throw error
  }
}

/**
 * Start a match
 * @param gameId - The game ID to start
 */
export async function startMatch(gameId: string): Promise<void> {
  try {
    const contract = await getMatchMindContract()
    const tx = await contract.startMatch(gameId)
    await tx.wait()
    console.log('Match started:', gameId)
  } catch (error) {
    console.error('Error starting match:', error)
    throw error
  }
}

/**
 * End a match
 * @param gameId - The game ID to end
 */
export async function endMatch(gameId: string): Promise<void> {
  try {
    const contract = await getMatchMindContract()
    const tx = await contract.endMatch(gameId)
    await tx.wait()
    console.log('Match ended:', gameId)
  } catch (error) {
    console.error('Error ending match:', error)
    throw error
  }
}

/**
 * Distribute yield to players based on rankings
 * @param gameId - The game ID
 * @param rankings - Array of player addresses in ranking order
 */
export async function distributeYield(gameId: string, rankings: string[]): Promise<void> {
  try {
    const contract = await getMatchMindContract()
    const tx = await contract.distributeYield(gameId, rankings)
    await tx.wait()
    console.log('Yield distributed for game:', gameId)
  } catch (error) {
    console.error('Error distributing yield:', error)
    throw error
  }
}

/**
 * Get contract owner address
 */
export async function getContractOwner(): Promise<string> {
  try {
    const contract = await getMatchMindContract()
    return await contract.owner()
  } catch (error) {
    console.error('Error getting owner:', error)
    throw error
  }
}

/**
 * Get factory address
 */
export async function getFactoryAddress(): Promise<string> {
  try {
    const contract = await getMatchMindContract()
    return await contract.factory()
  } catch (error) {
    console.error('Error getting factory:', error)
    throw error
  }
}

// Legacy functions for backward compatibility
export async function stakeTokens(matchId: string, amount: number, userAddress: string): Promise<string> {
  console.log(`Staking ${amount} CHZ for match ${matchId} from ${userAddress}`)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return `0x${Math.random().toString(16).substr(2, 64)}`
}

export async function getMatchStakeTotal(matchId: string): Promise<number> {
  console.log(`Fetching total stake for match ${matchId}`)
  await new Promise((resolve) => setTimeout(resolve, 500))
  return Math.random() * 50000 + 10000
}
