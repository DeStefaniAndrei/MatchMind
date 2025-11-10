/**
 * Leaderboard Service
 * Handles real-time scoring and leaderboard updates for matches
 */

import { supabase } from './supabaseClient'

export interface LeaderboardEntry {
  id?: number
  matchId: number
  userId: number
  username?: string
  rank: number
  score: number
  totalPoints: number
  correctPredictions: number
  totalPredictions: number
  rewardAmount?: number
  updatedAt?: string
}

export interface UserScoreUpdate {
  userId: number
  pointsEarned: number
  isCorrect: boolean
}

export class LeaderboardService {
  /**
   * Update or insert a user's score for a match
   */
  async updateUserScore(
    matchId: number, 
    userId: number, 
    pointsEarned: number, 
    isCorrect: boolean
  ): Promise<void> {
    try {
      console.log(`🔍 Looking for leaderboard entry: matchId=${matchId}, userId=${userId}`)
      
      // Get current leaderboard entry or create new one
      const { data: existing, error: fetchError } = await supabase
        .from('leaderboard_entry')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error fetching leaderboard entry:', fetchError)
        throw fetchError
      }

      if (existing) {
        console.log(`📝 Updating existing entry. Current score: ${existing.score}, Adding: ${pointsEarned}`)
        
        // Update existing entry
        const { error: updateError } = await supabase
          .from('leaderboard_entry')
          .update({
            score: existing.score + pointsEarned,
            total_points: existing.total_points + pointsEarned,
            correct_predictions: isCorrect ? existing.correct_predictions + 1 : existing.correct_predictions,
            total_predictions: existing.total_predictions + 1,
            updated_at: new Date().toISOString()
          })
          .eq('match_id', matchId)
          .eq('user_id', userId)

        if (updateError) {
          console.error('❌ Error updating entry:', updateError)
          throw updateError
        }
        
        console.log(`✅ Successfully updated score. New score: ${existing.score + pointsEarned}`)
      } else {
        console.log(`📝 No existing entry found, creating new one with score: ${pointsEarned}`)
        
        // Insert new entry
        const { error: insertError } = await supabase
          .from('leaderboard_entry')
          .insert({
            match_id: matchId,
            user_id: userId,
            rank: 0, // Will be recalculated
            score: pointsEarned,
            total_points: pointsEarned,
            correct_predictions: isCorrect ? 1 : 0,
            total_predictions: 1,
            reward_amount: 0
          })

        if (insertError) {
          console.error('❌ Error inserting new entry:', insertError)
          throw insertError
        }
        
        console.log(`✅ Successfully created new entry with score: ${pointsEarned}`)
      }

      // Recalculate ranks for this match
      console.log(`🔄 Recalculating ranks for match ${matchId}`)
      await this.recalculateRanks(matchId)
      console.log(`✅ Ranks recalculated successfully`)
    } catch (error) {
      console.error('❌ Error updating user score:', error)
      throw error
    }
  }

  /**
   * Update multiple users' scores in batch (more efficient)
   */
  async batchUpdateScores(matchId: number, updates: UserScoreUpdate[]): Promise<void> {
    try {
      // Process all updates
      for (const update of updates) {
        await this.updateUserScore(
          matchId, 
          update.userId, 
          update.pointsEarned, 
          update.isCorrect
        )
      }
    } catch (error) {
      console.error('Error batch updating scores:', error)
      throw error
    }
  }

  /**
   * Recalculate ranks for all users in a match based on their scores
   */
  async recalculateRanks(matchId: number): Promise<void> {
    try {
      // Fetch all entries for this match, ordered by score
      const { data: entries, error: fetchError } = await supabase
        .from('leaderboard_entry')
        .select('id, user_id, score')
        .eq('match_id', matchId)
        .order('score', { ascending: false })

      if (fetchError) throw fetchError
      if (!entries || entries.length === 0) return

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        const { error: updateError } = await supabase
          .from('leaderboard_entry')
          .update({ rank: i + 1 })
          .eq('id', entries[i].id)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error('Error recalculating ranks:', error)
      throw error
    }
  }

  /**
   * Get leaderboard for a specific match with user details
   */
  async getMatchLeaderboard(matchId: number, limit?: number): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('leaderboard_entry')
        .select(`
          id,
          match_id,
          user_id,
          rank,
          score,
          total_points,
          correct_predictions,
          total_predictions,
          reward_amount,
          updated_at,
          users (
            username,
            wallet_address
          )
        `)
        .eq('match_id', matchId)
        .order('rank', { ascending: true })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data to include username
      return (data || []).map((entry: any) => ({
        id: entry.id,
        matchId: entry.match_id,
        userId: entry.user_id,
        username: entry.users?.username || `User ${entry.user_id.toString().slice(0, 8)}`,
        rank: entry.rank,
        score: entry.score,
        totalPoints: entry.total_points,
        correctPredictions: entry.correct_predictions,
        totalPredictions: entry.total_predictions,
        rewardAmount: entry.reward_amount,
        updatedAt: entry.updated_at
      }))
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }
  }

  /**
   * Get a user's rank and score for a specific match
   */
  async getUserRank(matchId: number, userId: number): Promise<LeaderboardEntry | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entry')
        .select(`
          id,
          match_id,
          user_id,
          rank,
          score,
          total_points,
          correct_predictions,
          total_predictions,
          reward_amount,
          users (
            username
          )
        `)
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No entry found
        throw error
      }

      const users = Array.isArray(data.users) ? data.users[0] : data.users;
      
      return {
        id: data.id,
        matchId: data.match_id,
        userId: data.user_id,
        username: users?.username,
        rank: data.rank,
        score: data.score,
        totalPoints: data.total_points,
        correctPredictions: data.correct_predictions,
        totalPredictions: data.total_predictions,
        rewardAmount: data.reward_amount
      }
    } catch (error) {
      console.error('Error fetching user rank:', error)
      throw error
    }
  }

  /**
   * Initialize leaderboard entry for a user who stakes in a match
   */
  async initializeUserEntry(matchId: number, userId: number): Promise<void> {
    try {
      console.log(`🔍 Checking if leaderboard entry exists: matchId=${matchId}, userId=${userId}`)
      
      // Check if entry already exists
      const { data: existing, error: checkError } = await supabase
        .from('leaderboard_entry')
        .select('id')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing entry:', checkError)
      }

      if (existing) {
        console.log(`✅ Leaderboard entry already exists for user ${userId} in match ${matchId}`)
        return // Already initialized
      }

      console.log(`📝 Creating new leaderboard entry for user ${userId} in match ${matchId}`)
      
      // Create initial entry with 0 score
      const { error } = await supabase
        .from('leaderboard_entry')
        .insert({
          match_id: matchId,
          user_id: userId,
          rank: 0,
          score: 0,
          total_points: 0,
          correct_predictions: 0,
          total_predictions: 0,
          reward_amount: 0
        })

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('❌ Error creating leaderboard entry:', error)
        throw error
      }
      
      console.log(`✅ Successfully created leaderboard entry for user ${userId}`)
    } catch (error) {
      console.error('❌ Error initializing user entry:', error)
    }
  }

  /**
   * Clear leaderboard for a match (useful for testing)
   */
  async clearMatchLeaderboard(matchId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('leaderboard_entry')
        .delete()
        .eq('match_id', matchId)

      if (error) throw error
    } catch (error) {
      console.error('Error clearing leaderboard:', error)
      throw error
    }
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService()

