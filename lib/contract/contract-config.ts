// Contract configuration for MatchMind dApp on Chiliz Chain
// Update these addresses with your deployed contract addresses

export const CONTRACT_CONFIG = {
  // Network configuration for Spicy testnet
  network: {
    chainId: 88882, // Spicy testnet
    name: 'Spicy Testnet',
    rpcUrl: 'https://spicy-rpc.chiliz.com/',
    blockExplorer: 'https://testnet-explorer.chiliz.com/',
    nativeCurrency: {
      name: 'CHZ',
      symbol: 'CHZ',
      decimals: 18,
    },
  },

  // Deployed contract addresses
  contracts: {
    matchMind: '0x6f91424d7f6B88F73D73E6cD83678872f7F51bBD',
    gameFactory: '0x4B58545a3c2Bf7a4Bf2742B9C08821DF637CD8aE',
    chzToken: '0x0000000000000000000000000000000000000000', // Zero address for native CHZ
    chzStakingPool: '0x0000000000000000000000000000000000000000', // Not used in betting system
    validator: '0x0000000000000000000000000000000000000000', // Not used in betting system
  },

  // Question configurations
  questions: [
    {
      id: '1',
      text: 'Will PSG score in the first half?',
      type: 'boolean',
      category: 'scoring'
    },
    {
      id: '2', 
      text: 'Will PSG win the match?',
      type: 'boolean',
      category: 'result'
    },
    {
      id: '3',
      text: 'Will PSG score 2 or more goals?',
      type: 'boolean', 
      category: 'scoring'
    },
    {
      id: '4',
      text: 'Will PSG keep a clean sheet?',
      type: 'boolean',
      category: 'defense'
    },
    {
      id: '5',
      text: 'Will PSG score in both halves?',
      type: 'boolean',
      category: 'scoring'
    },
    {
      id: '6',
      text: 'Will PSG score in the first 15 minutes?',
      type: 'boolean',
      category: 'timing'
    },
    {
      id: '7',
      text: 'Will PSG score in the last 15 minutes?',
      type: 'boolean',
      category: 'timing'
    },
    {
      id: '8',
      text: 'Will PSG have more than 5 corner kicks?',
      type: 'boolean',
      category: 'stats'
    },
    {
      id: '9',
      text: 'Will PSG have more than 10 shots on target?',
      type: 'boolean',
      category: 'stats'
    },
    {
      id: '10',
      text: 'Will PSG receive more than 2 yellow cards?',
      type: 'boolean',
      category: 'discipline'
    },
    {
      id: '11',
      text: 'Will PSG score from a set piece?',
      type: 'boolean',
      category: 'scoring'
    },
    {
      id: '12',
      text: 'Will PSG score from a penalty?',
      type: 'boolean',
      category: 'scoring'
    }
  ],

  // Game configuration
  gameConfig: {
    minStakeAmount: '10', // 10 CHZ minimum stake
    maxStakeAmount: '1000', // 1000 CHZ maximum stake
    gameDuration: 90 * 60, // 90 minutes in seconds
    questionCount: 12,
    validatorAddress: '0xbdBF08393b66130B4b243863150A265b2A5Df642'
  }
};

// ABI imports (these should match your deployed contracts)
export const CONTRACT_ABIS = {
  matchMind: [
    // MatchMind contract ABI based on actual contract
    "function createGame() external returns (uint256)",
    "function startMatch(uint256 gameId) external",
    "function endMatch(uint256 gameId) external",
    "function distributeYield(uint256 gameId, address[] calldata rankings) external",
    "function emergencyRecover(address token, uint256 amount) external",
    "function owner() external view returns (address)",
    "function chzToken() external view returns (address)",
    "function stakingContract() external view returns (address)",
    "function validator() external view returns (address)",
    "function factory() external view returns (address)"
  ],
  gameFactory: [
    // GameFactory contract ABI based on actual contract
    "function createGame() external returns (uint256 gameId)",
    "function startMatch(uint256 gameId) external",
    "function endMatch(uint256 gameId) external",
    "function distributeYield(uint256 gameId, address[] calldata rankings) external",
    "function getAllGames() external view returns (address[] memory)",
    "function getGameAddress(uint256 gameId) external view returns (address)",
    "function gameCounter() external view returns (uint256)",
    "function gameAddresses(uint256) external view returns (address)",
    "function games(uint256) external view returns (address)",
    "function owner() external view returns (address)",
    "function chzToken() external view returns (address)",
    "function stakingContract() external view returns (address)",
    "function validator() external view returns (address)",
    "function matchMindContract() external view returns (address)"
  ]
};

export const getContractAddress = (contractName: keyof typeof CONTRACT_CONFIG.contracts) => {
  return CONTRACT_CONFIG.contracts[contractName]
}

export const getNetworkConfig = () => {
  return CONTRACT_CONFIG.network
} 