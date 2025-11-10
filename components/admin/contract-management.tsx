'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { matchMindIntegration } from '@/lib/contract/matchmind-integration';
import { dbService } from '@/lib/database-service';
import { CONTRACT_CONFIG } from '@/lib/contract/contract-config';

interface MatchData {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface SyncResult {
  matchId: number;
  gameId: number;
  poolAddress: string;
  success: boolean;
  error?: string;
}

export default function ContractManagement() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const matchesData = await dbService.getMatches();
      setMatches(matchesData);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setError('Failed to load matches');
    }
  };

  const initializeIntegration = async () => {
    if (!privateKey) {
      setError('Please enter a private key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await matchMindIntegration.initialize(privateKey);
      setIsInitialized(true);
      
      // Get network info
      const info = await matchMindIntegration.getNetworkInfo();
      setNetworkInfo(info);
      
      console.log('Integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize integration:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize integration');
    } finally {
      setIsLoading(false);
    }
  };



  const syncMatchesWithContracts = async () => {
    if (!isInitialized) {
      setError('Please initialize the integration first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert matches to MatchData format
      const matchData: MatchData[] = matches.map(match => ({
        sportmonksId: match.sportmonks_id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        startTime: match.start_time,
        endTime: new Date(new Date(match.start_time).getTime() + 90 * 60 * 1000).toISOString(), // 90 minutes
        status: match.status
      }));

      const results = await matchMindIntegration.syncMatchesWithContracts(matchData);
      setSyncResults(results);
      
      // Reload matches to get updated contract info
      await loadMatches();
      
      console.log('Matches synced with contracts:', results);
    } catch (error) {
      console.error('Failed to sync matches with contracts:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync matches with contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const startUpcomingMatches = async () => {
    if (!isInitialized) {
      setError('Please initialize the integration first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await matchMindIntegration.startUpcomingMatches();
      console.log('Started upcoming matches:', results);
      
      // Reload matches to get updated status
      await loadMatches();
      
      setError(null);
    } catch (error) {
      console.error('Failed to start upcoming matches:', error);
      setError(error instanceof Error ? error.message : 'Failed to start upcoming matches');
    } finally {
      setIsLoading(false);
    }
  };

  const endFinishedMatches = async () => {
    if (!isInitialized) {
      setError('Please initialize the integration first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await matchMindIntegration.endFinishedMatches();
      console.log('Ended finished matches:', results);
      
      // Reload matches to get updated status
      await loadMatches();
      
      setError(null);
    } catch (error) {
      console.error('Failed to end finished matches:', error);
      setError(error instanceof Error ? error.message : 'Failed to end finished matches');
    } finally {
      setIsLoading(false);
    }
  };

  const getContractBalance = async () => {
    if (!isInitialized) {
      setError('Please initialize the integration first');
      return;
    }

    try {
      const balance = await matchMindIntegration.getContractBalance(CONTRACT_CONFIG.contracts.matchMind);
      console.log('Contract balance:', balance);
      alert(`Contract balance: ${balance} CHZ`);
    } catch (error) {
      console.error('Failed to get contract balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to get contract balance');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
          <CardDescription>
            Manage smart contracts for matches on the Chiliz blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Info */}
          {networkInfo && (
            <div className="flex gap-4 text-sm">
              <Badge variant="outline">Network: {networkInfo.networkName}</Badge>
              <Badge variant="outline">Chain ID: {networkInfo.chainId}</Badge>
              <Badge variant="outline">Block: {networkInfo.blockNumber}</Badge>
            </div>
          )}

          {/* Contract Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">MatchMind Contract</label>
              <code className="block text-xs bg-gray-100 p-2 rounded">
                {CONTRACT_CONFIG.contracts.matchMind}
              </code>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GameFactory Contract</label>
              <code className="block text-xs bg-gray-100 p-2 rounded">
                {CONTRACT_CONFIG.contracts.gameFactory}
              </code>
            </div>
          </div>

          {/* Initialization */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Private Key (for admin operations)</label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter private key"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            
            <Button 
              onClick={initializeIntegration}
              disabled={isLoading || isInitialized}
              className="w-full"
            >
              {isLoading ? 'Initializing...' : isInitialized ? 'Initialized' : 'Initialize Integration'}
            </Button>
          </div>

          {/* Status Display */}
          {syncStatus && (
            <Alert>
              <AlertDescription>{syncStatus}</AlertDescription>
            </Alert>
          )}
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isInitialized && (
              <>
                
                <Button 
                  onClick={syncMatchesWithContracts}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Syncing...' : 'Sync Matches with Contracts'}
                </Button>
                
                <Button 
                  onClick={startUpcomingMatches}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Starting...' : 'Start Upcoming Matches'}
                </Button>
                
                <Button 
                  onClick={endFinishedMatches}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Ending...' : 'End Finished Matches'}
                </Button>
                
                <Button 
                  onClick={getContractBalance}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Get Contract Balance
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
            <CardDescription>
              Results from syncing matches with smart contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">Match {result.matchId}</span>
                    {result.success ? (
                      <div className="text-sm text-gray-600">
                        Game ID: {result.gameId}, Pool: {result.poolAddress.slice(0, 10)}...
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">{result.error}</div>
                    )}
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches List */}
      <Card>
        <CardHeader>
          <CardTitle>Matches ({matches.length})</CardTitle>
          <CardDescription>
            Current matches in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {match.home_team} vs {match.away_team}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(match.start_time).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Match ID: {match.id}
                    {match.contract_game_id && ` | Game ID: ${match.contract_game_id}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{match.status}</Badge>
                  {match.contract_state && (
                    <Badge variant="secondary">{match.contract_state}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 