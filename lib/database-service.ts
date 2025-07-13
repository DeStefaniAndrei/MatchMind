import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://vzbxayfoblrztstfaslh.supabase.co'; // Replace with your actual Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhheWZvYmxyenRzdGZhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDE3ODQsImV4cCI6MjA2NzkxNzc4NH0.8rmtczZIybMJ_xVGpcpm7Ie1M9dzXrPdPP7Sh4WivoI'; // Replace with your actual Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Match {
  id: string;
  sportmonks_id: number;
  contract_game_id?: number;
  contract_address?: string;
  home_team: string;
  away_team: string;
  start_time: string;
  status: string;
  contract_state?: string;
}

export interface User {
  id: string;
  wallet_address: string;
}

export interface Stake {
  id: string;
  user_id: string;
  match_id: string;
  amount: number;
  staked_at: string;
  withdrawn: boolean;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  question_id: string;
  answer?: string;
  is_correct?: boolean;
}

export class DatabaseService {
  // Match operations
  async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getMatchBySportMonksId(sportmonksId: number): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('sportmonks_id', sportmonksId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getMatchByContractGameId(contractGameId: number): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('contract_game_id', contractGameId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMatchContractInfo(
    sportmonksId: number, 
    contractGameId: number, 
    contractAddress: string
  ): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        contract_game_id: contractGameId,
        contract_address: contractAddress,
        contract_state: 'created'
      })
      .eq('sportmonks_id', sportmonksId);

    if (error) throw error;
  }

  async updateMatchStatus(sportmonksId: number, status: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('sportmonks_id', sportmonksId);

    if (error) throw error;
  }

  async updateMatchContractState(sportmonksId: number, contractState: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({ contract_state: contractState })
      .eq('sportmonks_id', sportmonksId);

    if (error) throw error;
  }

  // User operations
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(walletAddress: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ wallet_address: walletAddress.toLowerCase() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getOrCreateUser(walletAddress: string): Promise<User> {
    const existingUser = await this.getUserByWalletAddress(walletAddress);
    if (existingUser) return existingUser;
    return await this.createUser(walletAddress);
  }

  // Stake operations
  async createStake(stakeData: Omit<Stake, 'id' | 'staked_at'>): Promise<Stake> {
    const { data, error } = await supabase
      .from('stakes')
      .insert(stakeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStakes(userId: string): Promise<Stake[]> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', userId)
      .order('staked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMatchStakes(matchId: string): Promise<Stake[]> {
    const { data, error } = await supabase
      .from('stakes')
      .select('*')
      .eq('match_id', matchId);

    if (error) throw error;
    return data || [];
  }

  async withdrawStake(stakeId: string): Promise<void> {
    const { error } = await supabase
      .from('stakes')
      .update({ withdrawn: true })
      .eq('id', stakeId);

    if (error) throw error;
  }

  // Prediction operations
  async createPrediction(predictionData: Omit<Prediction, 'id'>): Promise<Prediction> {
    const { data, error } = await supabase
      .from('predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMatchPredictions(matchId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', matchId);

    if (error) throw error;
    return data || [];
  }

  async updatePredictionResult(predictionId: string, isCorrect: boolean): Promise<void> {
    const { error } = await supabase
      .from('predictions')
      .update({ is_correct: isCorrect })
      .eq('id', predictionId);

    if (error) throw error;
  }

  // Combined operations
  async getMatchWithStakesAndPredictions(matchId: string) {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('*')
      .eq('match_id', matchId);

    if (stakesError) throw stakesError;

    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', matchId);

    if (predictionsError) throw predictionsError;

    return {
      match,
      stakes: stakes || [],
      predictions: predictions || []
    };
  }

  async getUpcomingMatches(): Promise<Match[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .gte('start_time', now)
      .order('start_time', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getActiveMatches(): Promise<Match[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'live')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const dbService = new DatabaseService(); 