import { ethers } from 'ethers';
import { CONTRACT_CONFIG, CONTRACT_ABIS } from './contract-config';

export class SmartContractService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.network.rpcUrl);
  }

  // Connect wallet
  async connectWallet(privateKey: string): Promise<void> {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  // Get contract instances
  private getMatchMindContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(
      CONTRACT_CONFIG.contracts.matchMind,
      CONTRACT_ABIS.matchMind,
      this.signer
    );
  }

  public getGameFactoryContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(
      CONTRACT_CONFIG.contracts.gameFactory,
      CONTRACT_ABIS.gameFactory,
      this.signer
    );
  }

  // MatchMind contract functions
  async createGame(): Promise<number> {
    try {
      const contract = this.getMatchMindContract();
      const tx = await contract.createGame();
      const receipt = await tx.wait();
      
      // Get the game ID from the factory
      const factoryContract = this.getGameFactoryContract();
      const gameId = await factoryContract.gameCounter();
      return Number(gameId) - 1; // Game ID is 0-indexed
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  async startMatch(gameId: number): Promise<void> {
    try {
      const contract = this.getMatchMindContract();
      const tx = await contract.startMatch(gameId);
      await tx.wait();
    } catch (error) {
      console.error('Error starting match:', error);
      throw error;
    }
  }

  async endMatch(gameId: number): Promise<void> {
    try {
      const contract = this.getMatchMindContract();
      const tx = await contract.endMatch(gameId);
      await tx.wait();
    } catch (error) {
      console.error('Error ending match:', error);
      throw error;
    }
  }

  async submitPrediction(gameId: number, questionId: number, answer: boolean): Promise<void> {
    try {
      // This function doesn't exist in the current contract
      // You'll need to implement this in the GamePool contract
      throw new Error('submitPrediction not implemented in current contract');
    } catch (error) {
      console.error('Error submitting prediction:', error);
      throw error;
    }
  }

  async getGameCount(): Promise<number> {
    try {
      const factoryContract = this.getGameFactoryContract();
      const count = await factoryContract.gameCounter();
      return Number(count);
    } catch (error) {
      console.error('Error getting game count:', error);
      throw error;
    }
  }

  // GameFactory contract functions
  async createGamePool(matchId: number): Promise<{ gameId: number; contractAddress: string }> {
    try {
      // Call createGame through the MatchMind contract instead of directly
      const matchMindContract = this.getMatchMindContract();
      
      // Get current game counter before creating
      const factoryContract = this.getGameFactoryContract();
      const currentCounter = await factoryContract.gameCounter();
      console.log(`Current game counter: ${currentCounter}`);
      
      // Create the game pool through MatchMind contract
      const tx = await matchMindContract.createGame();
      const receipt = await tx.wait();
      
      // Get the new game ID (should be the previous counter value)
      const gameId = Number(currentCounter);
      console.log(`Created game pool with ID: ${gameId}`);
      
      // Get the contract address
      const contractAddress = await factoryContract.getGameAddress(gameId);
      console.log(`Game pool contract address: ${contractAddress}`);
      
      return { gameId, contractAddress };
    } catch (error) {
      console.error('Error creating game pool:', error);
      throw error;
    }
  }

  async getGamePool(matchId: number): Promise<string> {
    try {
      const contract = this.getGameFactoryContract();
      const poolAddress = await contract.getGamePool(matchId);
      return poolAddress;
    } catch (error) {
      console.error('Error getting game pool:', error);
      throw error;
    }
  }

  async getAllGamePools(): Promise<string[]> {
    try {
      const contract = this.getGameFactoryContract();
      const pools = await contract.getAllGamePools();
      return pools;
    } catch (error) {
      console.error('Error getting all game pools:', error);
      throw error;
    }
  }

  // Utility functions
  async getNetworkInfo() {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    return {
      chainId: Number(network.chainId),
      blockNumber,
      networkName: CONTRACT_CONFIG.network.name
    };
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Batch operations for admin
  async syncMatchesWithContracts(matches: Array<{
    sportmonksId: number;
    startTime: string;
    endTime: string;
  }>): Promise<Array<{
    sportmonksId: number;
    gameId: number;
    poolAddress: string;
  }>> {
    const results = [];
    
    for (const match of matches) {
      try {
        // Create game in MatchMind contract
        const gameId = await this.createGame();
        
        // Get the game address from factory
        const factoryContract = this.getGameFactoryContract();
        const contractAddress = await factoryContract.getGameAddress(gameId);
        
        results.push({
          sportmonksId: match.sportmonksId,
          gameId,
          poolAddress: contractAddress
        });
        
        console.log(`Created game ${gameId} and pool ${contractAddress} for match ${match.sportmonksId}`);
      } catch (error) {
        console.error(`Failed to sync match ${match.sportmonksId}:`, error);
        throw error;
      }
    }
    
    return results;
  }

  async startAllUpcomingGames(gameIds: number[]): Promise<void> {
    for (const gameId of gameIds) {
      try {
        await this.startMatch(gameId);
        console.log(`Started match ${gameId}`);
      } catch (error) {
        console.error(`Failed to start match ${gameId}:`, error);
        throw error;
      }
    }
  }

  async endAllFinishedGames(gameIds: number[]): Promise<void> {
    for (const gameId of gameIds) {
      try {
        await this.endMatch(gameId);
        console.log(`Ended match ${gameId}`);
      } catch (error) {
        console.error(`Failed to end match ${gameId}:`, error);
        throw error;
      }
    }
  }
}

export const contractService = new SmartContractService(); 