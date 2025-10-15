// // SportMonks API Client for MatchMind dApp
// // API Key: LX3d6AEoz5VL3mAPIbgJy6azougDpULsKOK0U7TDc7gl0Db1OrJzbT0SfVgP

// const API_KEY = 'LX3d6AEoz5VL3mAPIbgJy6azougDpULsKOK0U7TDc7gl0Db1OrJzbT0SfVgP'
// const BASE_URL = 'https://api.sportmonks.com/v3/football'

// interface ApiResponse<T> {
//   data: T
//   pagination?: any
//   subscription?: any
// }

// interface Match {
//   id: number
//   name: string
//   starting_at: string
//   result_info: any
//   participants: any[]
//   venue: any
//   referee: any
//   events: any[]
//   statistics: any[]
//   periods: any[]
//   minute: number
//   second: number
//   time_info: any
// }

// interface LiveMatch extends Match {
//   time: {
//     starting_at: {
//       timestamp: number
//       timezone: string
//     }
//     minute: number
//     second: number
//     added_time: number
//     extra_minute: number
//     injury_time: number
//   }
//   scores: {
//     localteam_score: number
//     visitorteam_score: number
//     localteam_pen_score: number
//     visitorteam_pen_score: number
//     ht_score: string
//     ft_score: string
//     et_score: string
//     ps_score: string
//   }
//   events: LiveEvent[]
//   statistics: MatchStatistics[]
// }

// interface LiveEvent {
//   id: number
//   type: string
//   minute: number
//   second: number
//   extra_minute: number
//   injury_time: number
//   participant_id: number
//   participant_name: string
//   participant_type: string
//   result: string
//   info: any
//   location: any
//   coordinates: any
// }

// interface MatchStatistics {
//   team_id: number
//   type: string
//   data: {
//     [key: string]: number | string
//   }
// }

// interface Player {
//   id: number
//   name: string
//   display_name: string
//   image_path: string
//   position_id: number
//   country_id: number
//   team_id: number
// }

// class SportMonksAPI {
//   private apiKey: string
//   private baseUrl: string

//   constructor(apiKey: string = API_KEY) {
//     this.apiKey = apiKey
//     this.baseUrl = BASE_URL
//   }

//   private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
//     const url = new URL(`${this.baseUrl}${endpoint}`)
//     url.searchParams.set('api_token', this.apiKey)
    
//     // Add additional parameters
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         url.searchParams.set(key, value.toString())
//       }
//     })

//     try {
//       const response = await fetch(url.toString())
//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`)
//       }
      
//       const data = await response.json()
//       return data
//     } catch (error) {
//       console.error('SportMonks API request failed:', error)
//       throw error
//     }
//   }

//   // Get live matches
//   async getLiveMatches(): Promise<ApiResponse<LiveMatch[]>> {
//     return this.makeRequest<LiveMatch[]>('/livescores/now')
//   }

//   // Get specific match by ID
//   async getMatch(matchId: number): Promise<ApiResponse<LiveMatch>> {
//     return this.makeRequest<LiveMatch>(`/fixtures/id/${matchId}`)
//   }

//   // Get match events
//   async getMatchEvents(matchId: number): Promise<ApiResponse<LiveEvent[]>> {
//     return this.makeRequest<LiveEvent[]>(`/fixtures/id/${matchId}/events`)
//   }

//   // Get match statistics
//   async getMatchStatistics(matchId: number): Promise<ApiResponse<MatchStatistics[]>> {
//     return this.makeRequest<MatchStatistics[]>(`/fixtures/id/${matchId}/statistics`)
//   }

//   // Get match lineups
//   async getMatchLineups(matchId: number): Promise<ApiResponse<any>> {
//     return this.makeRequest<any>(`/fixtures/id/${matchId}/lineups`)
//   }

//   // Get match commentary
//   async getMatchCommentary(matchId: number): Promise<ApiResponse<any>> {
//     return this.makeRequest<any>(`/fixtures/id/${matchId}/commentary`)
//   }

//   // Get player statistics for a match
//   async getPlayerStatistics(matchId: number, playerId: number): Promise<ApiResponse<any>> {
//     return this.makeRequest<any>(`/fixtures/id/${matchId}/players/${playerId}`)
//   }

//   // Get team statistics for a match
//   async getTeamStatistics(matchId: number, teamId: number): Promise<ApiResponse<any>> {
//     return this.makeRequest<any>(`/fixtures/id/${matchId}/teams/${teamId}`)
//   }

//   // Get minute-by-minute data (if available)
//   async getMinuteData(matchId: number, minute: number): Promise<ApiResponse<any>> {
//     return this.makeRequest<any>(`/fixtures/id/${matchId}/minute/${minute}`)
//   }

//   // Test API connection
//   async testConnection(): Promise<boolean> {
//     try {
//       const response = await this.makeRequest<any>('/livescores/now')
//       return !!response.data
//     } catch (error) {
//       console.error('API connection test failed:', error)
//       return false
//     }
//   }
// }

// export const sportMonksAPI = new SportMonksAPI()

// // Export types for use in other files
// export type {
//   LiveMatch,
//   LiveEvent,
//   MatchStatistics,
//   Player,
//   ApiResponse
// } 

// import { dbService } from './database-service';

// export interface PSGMatch {
//   id: string;
//   homeTeam: string;
//   awayTeam: string;
//   startTime: string;
//   status: string;
//   venue?: string;
//   league?: string;
//   homeScore?: number;
//   awayScore?: number;
//   participants?: number;
//   totalStake?: number;
// }

// // Fetch PSG matches from our server-side API route
// export async function fetchPSGMatches(): Promise<PSGMatch[]> {
//   try {
//     console.log('Fetching PSG matches from server-side API...');
    
//     const response = await fetch('/api/psg-matches', {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//       },
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Server API error:', response.status, errorText);
//       throw new Error(`Failed to fetch PSG matches: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log('Server API response:', data);

//     if (data.error) {
//       throw new Error(data.error);
//     }

//     return data.matches || [];
//   } catch (error) {
//     console.error('Error fetching PSG matches:', error);
//     return [];
//   }
// }

// // Sync PSG matches to database
// export async function syncPSGMatchesToDatabase(): Promise<{ success: number; errors: number }> {
//   try {
//     console.log('Fetching PSG matches from SportMonks API...');
//     const matches = await fetchPSGMatches();
    
//     if (matches.length === 0) {
//       console.log('No PSG matches found');
//       return { success: 0, errors: 0 };
//     }

//     let successCount = 0;
//     let errorCount = 0;

//     for (const match of matches) {
//       try {
//         // Check if match already exists
//         const existingMatch = await dbService.getMatchBySportMonksId(parseInt(match.id));
        
//         if (existingMatch) {
//           console.log(`Match ${match.id} already exists, updating...`);
//           await dbService.updateMatchStatus(parseInt(match.id), match.status);
//         } else {
//           console.log(`Creating new match ${match.id}: ${match.homeTeam} vs ${match.awayTeam}`);
//           await dbService.createMatch({
//             sportmonks_id: parseInt(match.id),
//             home_team: match.homeTeam,
//             away_team: match.awayTeam,
//             start_time: match.startTime,
//             status: match.status
//           });
//         }
        
//         successCount++;
//       } catch (error) {
//         console.error(`Error processing match ${match.id}:`, error);
//         errorCount++;
//       }
//     }

//     console.log(`Sync completed: ${successCount} successful, ${errorCount} errors`);
//     return { success: successCount, errors: errorCount };
//   } catch (error) {
//     console.error('Error syncing PSG matches to database:', error);
//     throw error;
//   }
// }

// // Get upcoming PSG matches from database
// export async function getUpcomingPSGMatches() {
//   try {
//     const matches = await dbService.getUpcomingMatches();
//     return matches.filter(match => 
//       match.home_team.includes('PSG') || match.away_team.includes('PSG')
//     );
//   } catch (error) {
//     console.error('Error getting upcoming PSG matches:', error);
//     return [];
//   }
// }

// // Get live PSG matches from database
// export async function getLivePSGMatches() {
//   try {
//     const matches = await dbService.getActiveMatches();
//     return matches.filter(match => 
//       match.home_team.includes('PSG') || match.away_team.includes('PSG')
//     );
//   } catch (error) {
//     console.error('Error getting live PSG matches:', error);
//     return [];
//   }
// } 