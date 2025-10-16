import { contractService } from './smart-contract-service';
import { dbService } from './database-service';
import { CONTRACT_CONFIG } from './contract-config';

export interface MatchData {
  sportmonksId: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface SyncResult {
  sportmonksId: number;
  gameId: number;
  poolAddress: string;
  success: boolean;
  error?: string;
}

export interface PSGMatchFromAPI {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
  venue?: string;
  league?: string;
}

export class MatchMindIntegration {
  private isInitialized = false;

  async initialize(privateKey: string): Promise<void> {
    try {
      await contractService.connectWallet(privateKey);
      this.isInitialized = true;
      console.log('MatchMind integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MatchMind integration:', error);
      throw error;
    }
  }


  // Create GamePool contracts and store matches in database
  // REMOVED: PSG-specific function
async createContractsForMatches(): Promise<{
    success: number;
    errors: number;
    results: Array<{
      sportmonksId: number;
      gameId: number;
      contractAddress: string;
      homeTeam: string;
      awayTeam: string;
      startTime: string;
      status: string;
    }>;
  }> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    try {
      console.log('Starting PSG match contract creation process...');
      
      // 1. Fetch PSG matches from API
      const psgMatches = await this.fetchPSGMatchesFromAPI();
      console.log(`Found ${psgMatches.length} PSG matches from API`);

      if (psgMatches.length === 0) {
        console.log('No PSG matches found');
        return { success: 0, errors: 0, results: [] };
      }

      // 2. Get current game counter from factory contract
      const currentGameCounter = await contractService.getGameCount();
      console.log(`Current game counter: ${currentGameCounter}`);

      let successCount = 0;
      let errorCount = 0;
      const results = [];

      // 3. Process each match
      for (const match of psgMatches) {
        try {
          console.log(`Processing match ${match.id}: ${match.homeTeam} vs ${match.awayTeam}`);

          // Check if match already exists in database
          const existingMatch = await dbService.getMatchBySportMonksId(parseInt(match.id));
          
          if (existingMatch && existingMatch.contract_game_id) {
            console.log(`Match ${match.id} already has contract game ID: ${existingMatch.contract_game_id}`);
            results.push({
              sportmonksId: parseInt(match.id),
              gameId: existingMatch.contract_game_id,
              contractAddress: existingMatch.contract_address || '',
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              startTime: match.startTime,
              status: match.status
            });
            successCount++;
            continue;
          }

                     // 4. Create GamePool contract
           console.log(`Creating GamePool contract for match ${match.id}...`);
           const { gameId, contractAddress } = await contractService.createGamePool(parseInt(match.id));
           console.log(`Created GamePool with game ID: ${gameId} and address: ${contractAddress}`);

           // 6. Store in database
           if (existingMatch) {
             // Update existing match with contract info
             await dbService.updateMatchContractInfo(
               parseInt(match.id),
               gameId,
               contractAddress
             );
             console.log(`Updated existing match ${match.id} with contract info`);
           } else {
             // Create new match record
             await dbService.createMatch({
               sportmonks_id: parseInt(match.id),
               home_team: match.homeTeam,
               away_team: match.awayTeam,
               start_time: match.startTime,
               status: match.status,
               contract_game_id: gameId,
               contract_address: contractAddress,
               contract_state: 'PRE_MATCH'
             });
             console.log(`Created new match record for ${match.id}`);
           }

           results.push({
             sportmonksId: parseInt(match.id),
             gameId,
             contractAddress,
             homeTeam: match.homeTeam,
             awayTeam: match.awayTeam,
             startTime: match.startTime,
             status: match.status
           });

          successCount++;
          console.log(`Successfully processed match ${match.id}`);

        } catch (error) {
          console.error(`Failed to process match ${match.id}:`, error);
          errorCount++;
        }
      }

      console.log(`Contract creation completed: ${successCount} successful, ${errorCount} errors`);
      return { success: successCount, errors: errorCount, results };
    } catch (error) {
      console.error('Error creating contracts for PSG matches:', error);
      throw error;
    }
  }

  async syncMatchesWithContracts(matches: MatchData[]): Promise<SyncResult[]> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    const results: SyncResult[] = [];

    for (const match of matches) {
      try {
        console.log(`Syncing match ${match.sportmonksId}: ${match.homeTeam} vs ${match.awayTeam}`);

        // Check if match already exists in database
        const existingMatch = await dbService.getMatchBySportMonksId(match.sportmonksId);
        
        if (existingMatch && existingMatch.contract_game_id) {
          console.log(`Match ${match.sportmonksId} already has contract game ID: ${existingMatch.contract_game_id}`);
          results.push({
            sportmonksId: match.sportmonksId,
            gameId: existingMatch.contract_game_id,
            poolAddress: existingMatch.contract_address || '',
            success: true
          });
          continue;
        }

        // Create game in MatchMind contract
        const gameId = await contractService.createGame();
        console.log(`Created game ${gameId} for match ${match.sportmonksId}`);

        // Get the game address from factory
        const factoryContract = contractService.getGameFactoryContract();
        const contractAddress = await factoryContract.getGameAddress(gameId);
        console.log(`Got game address ${contractAddress} for match ${match.sportmonksId}`);

        // Update database with contract information
        if (existingMatch) {
          await dbService.updateMatchContractInfo(match.sportmonksId, gameId, contractAddress);
        } else {
          // Create new match record
          await dbService.createMatch({
            sportmonks_id: match.sportmonksId,
            home_team: match.homeTeam,
            away_team: match.awayTeam,
            start_time: match.startTime,
            status: match.status,
            contract_game_id: gameId,
            contract_address: contractAddress,
            contract_state: 'created'
          });
        }

        results.push({
          sportmonksId: match.sportmonksId,
          gameId,
          poolAddress: contractAddress,
          success: true
        });

        console.log(`Successfully synced match ${match.sportmonksId}`);
      } catch (error) {
        console.error(`Failed to sync match ${match.sportmonksId}:`, error);
        results.push({
          sportmonksId: match.sportmonksId,
          gameId: 0,
          poolAddress: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async startUpcomingMatches(): Promise<{ gameId: number; success: boolean; error?: string }[]> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    const results = [];
    const upcomingMatches = await dbService.getUpcomingMatches();
    
    for (const match of upcomingMatches) {
      if (!match.contract_game_id) {
        console.log(`Match ${match.sportmonks_id} has no contract game ID, skipping`);
        continue;
      }

      try {
        await contractService.startMatch(match.contract_game_id);
        await dbService.updateMatchContractState(match.sportmonks_id, 'MATCH_ACTIVE');
        
        results.push({
          gameId: match.contract_game_id,
          success: true
        });
        
        console.log(`Started match ${match.contract_game_id} for match ${match.sportmonks_id}`);
      } catch (error) {
        console.error(`Failed to start match ${match.contract_game_id}:`, error);
        results.push({
          gameId: match.contract_game_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async endFinishedMatches(): Promise<{ gameId: number; success: boolean; error?: string }[]> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    const results = [];
    const activeMatches = await dbService.getActiveMatches();
    
    for (const match of activeMatches) {
      if (!match.contract_game_id) {
        console.log(`Match ${match.sportmonks_id} has no contract game ID, skipping`);
        continue;
      }

      try {
        await contractService.endMatch(match.contract_game_id);
        await dbService.updateMatchContractState(match.sportmonks_id, 'MATCH_ENDED');
        
        results.push({
          gameId: match.contract_game_id,
          success: true
        });
        
        console.log(`Ended match ${match.contract_game_id} for match ${match.sportmonks_id}`);
      } catch (error) {
        console.error(`Failed to end match ${match.contract_game_id}:`, error);
        results.push({
          gameId: match.contract_game_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async submitUserPrediction(
    walletAddress: string,
    matchId: string,
    questionId: string,
    answer: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    try {
      // Get or create user
      const user = await dbService.getOrCreateUser(walletAddress);
      
      // Get match
      const match = await dbService.getMatchByContractGameId(parseInt(matchId));
      if (!match) {
        throw new Error('Match not found');
      }

      if (!match.contract_game_id) {
        throw new Error('Match has no contract game ID');
      }

      // Submit prediction to contract
      await contractService.submitPrediction(match.contract_game_id, parseInt(questionId), answer);

      // Save prediction to database
      await dbService.createPrediction({
        user_id: user.id,
        match_id: match.id,
        question_id: questionId,
        answer: answer.toString()
      });

      console.log(`Submitted prediction for user ${walletAddress}, match ${matchId}, question ${questionId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to submit prediction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getMatchStats(matchId: string): Promise<{
    totalStakes: number;
    totalPredictions: number;
    uniqueUsers: number;
  }> {
    try {
      const match = await dbService.getMatchByContractGameId(parseInt(matchId));
      if (!match) {
        throw new Error('Match not found');
      }

      const stakes = await dbService.getMatchStakes(match.id);
      const predictions = await dbService.getMatchPredictions(match.id);
      
      const uniqueUsers = new Set([
        ...stakes.map(s => s.user_id),
        ...predictions.map(p => p.user_id)
      ]).size;

      return {
        totalStakes: stakes.reduce((sum, stake) => sum + Number(stake.amount), 0),
        totalPredictions: predictions.length,
        uniqueUsers
      };
    } catch (error) {
      console.error('Failed to get match stats:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    return await contractService.getNetworkInfo();
  }

  async getContractBalance(address: string): Promise<string> {
    return await contractService.getBalance(address);
  }
}

export const matchMindIntegration = new MatchMindIntegration(); 