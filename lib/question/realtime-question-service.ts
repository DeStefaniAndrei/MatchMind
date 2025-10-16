// Real-time Question Service
// Manages question generation, timing, and scoring for live matches
// Whole class is save locally whenever a question is submitted and removed when the question expires

import { aiPredictionService, getStatsFromCumulative, type MatchStats, type PredictionResult } from './ai-prediction-service'
import { matchSimulator } from '../match-simulator'

export interface LiveQuestion {
  id: string
  text: string
  options: string[]
  eventType: string
  predictedCount: number
  correctAnswer: boolean | null // null = not yet determined
  timeLeft: number
  answered: boolean
  userAnswer: string | null
  pointsAwarded: number
  createdAt: Date
  expiresAt: Date
}

export interface QuestionConfig {
  questionInterval: number // seconds between questions (default: 30)
  answerTimeLimit: number // seconds to answer (default: 30)
  pointsPerCorrect: number // points for correct answer (default: 10)
  maxQuestionsPerMatch: number // max questions per match (default: 180 for 90min match)
}

export interface MatchQuestionState {
  matchId: string
  currentMinute: number
  questions: LiveQuestion[]
  totalScore: number
  config: QuestionConfig
  isActive: boolean
  lastQuestionTime: Date | null
}

class RealtimeQuestionService {
  private matchStates: Map<string, MatchQuestionState> = new Map()
  private questionTimers: Map<string, NodeJS.Timeout> = new Map()
  private readonly STORAGE_KEY = 'matchmind_questions'

  constructor() {
    // Initialize with default config
    this.defaultConfig = {
      questionInterval: 30, // 30 seconds
      answerTimeLimit: 60, // 60 seconds (1 minute) to answer
      pointsPerCorrect: 10, // 10 points per correct answer
      maxQuestionsPerMatch: 180 // 90 minutes * 2 questions per minute
    }
    
    // Restore questions from localStorage on initialization
    this.restoreFromLocalStorage()
  }

  private defaultConfig: QuestionConfig

  // Save questions to localStorage
  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data: Record<string, MatchQuestionState> = {}
      for (const [matchId, state] of this.matchStates.entries()) {
        data[matchId] = state
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save questions to localStorage:', error)
    }
  }

  // Restore questions from localStorage
  private restoreFromLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return

      const data: Record<string, MatchQuestionState> = JSON.parse(saved)
      const now = new Date()

      for (const [matchId, state] of Object.entries(data)) {
        // Restore questions and check expiration
        const restoredQuestions = state.questions.map(q => ({
          ...q,
          createdAt: new Date(q.createdAt),
          expiresAt: new Date(q.expiresAt),
          // Recalculate timeLeft based on current time
          timeLeft: Math.max(0, Math.floor((new Date(q.expiresAt).getTime() - now.getTime()) / 1000))
        }))

        // Check for expired questions and run expiration logic
        restoredQuestions.forEach(q => {
          if (q.timeLeft <= 0 && !q.answered) {
            this.onQuestionExpired(matchId, q)
          }
        })

        this.matchStates.set(matchId, {
          ...state,
          questions: restoredQuestions,
          lastQuestionTime: state.lastQuestionTime ? new Date(state.lastQuestionTime) : null
        })
      }

      console.log(`Restored ${Object.keys(data).length} match states from localStorage`)
    } catch (error) {
      console.error('Failed to restore questions from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  // Hook for when a question expires - override this for custom logic
  private onQuestionExpired(matchId: string, question: LiveQuestion): void {
    console.log(`Question expired: ${question.id} for match ${matchId}`)
    console.log(`Question was: "${question.text}"`)
    console.log(`User answered: ${question.userAnswer || 'No answer'}`)
    
    // Mark as answered if not already
    question.answered = true
    question.timeLeft = 0
    
    // Call custom expiration handler if set
    if (this.customExpirationHandler) {
      try {
        this.customExpirationHandler(matchId, question)
      } catch (error) {
        console.error('Error in custom expiration handler:', error)
      }
    }
    
    this.saveToLocalStorage()
  }

  // Initialize a match for question generation
  async initializeMatch(matchId: string, config?: Partial<QuestionConfig>): Promise<void> {
    const fullConfig = { ...this.defaultConfig, ...config }
    
    const matchState: MatchQuestionState = {
      matchId,
      currentMinute: 0,
      questions: [],
      totalScore: 0,
      config: fullConfig,
      isActive: false,
      lastQuestionTime: null
    }

    this.matchStates.set(matchId, matchState)
    console.log(`Initialized match ${matchId} with config:`, fullConfig)
  }

  // Start question generation for a match
  startMatch(matchId: string): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) {
      throw new Error(`Match ${matchId} not initialized`)
    }

    matchState.isActive = true
    matchState.lastQuestionTime = new Date()

    // Generate the first question immediately
    this.generateQuestion(matchId).then(() => {
      console.log(`First question generated for match ${matchId}`)
    }).catch(error => {
      console.error(`Failed to generate first question for match ${matchId}:`, error)
    })

    // Start the question generation timer for subsequent questions
    this.scheduleNextQuestion(matchId)
    console.log(`Started question generation for match ${matchId}`)
  }

  // Stop question generation for a match
  stopMatch(matchId: string): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    matchState.isActive = false
    
    // Clear any pending timers
    const timer = this.questionTimers.get(matchId)
    if (timer) {
      clearTimeout(timer)
      this.questionTimers.delete(matchId)
    }

    console.log(`Stopped question generation for match ${matchId}`)
  }

  // Update match minute (called by match monitor)
  updateMatchMinute(matchId: string, minute: number): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    matchState.currentMinute = minute

    // Stop generating questions after 90 minutes
    if (minute >= 90) {
      this.stopMatch(matchId)
    }
  }

  // Schedule the next question
  private scheduleNextQuestion(matchId: string): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState || !matchState.isActive) return

    const timer = setTimeout(async () => {
      try {
        await this.generateQuestion(matchId)
        this.scheduleNextQuestion(matchId) // Schedule the next one
      } catch (error) {
        console.error(`Error generating question for match ${matchId}:`, error)
        // Continue scheduling even if one question fails
        this.scheduleNextQuestion(matchId)
      }
    }, matchState.config.questionInterval * 1000)

    this.questionTimers.set(matchId, timer)
  }

  // Generate a new question for the match
  private async generateQuestion(matchId: string): Promise<void> {
    const matchState = this.matchStates.get(matchId)
    if (!matchState || !matchState.isActive) return

    // Check if we've reached the max questions limit
    if (matchState.questions.length >= matchState.config.maxQuestionsPerMatch) {
      this.stopMatch(matchId)
      return
    }

    try {
      // Build stats from Match.cumulativeStats
      const simMatch = await matchSimulator.getMatchById(matchId);
      const getSnapshot = (m: number) => simMatch?.cumulativeStats?.find((s: any) => s.minute === Math.max(0, m));
      
      const currentSnapshot = getSnapshot(matchState.currentMinute);
      const currentStats = getStatsFromCumulative(currentSnapshot);

      const lag5 = getSnapshot(matchState.currentMinute - 5);
      const lag20 = getSnapshot(matchState.currentMinute - 20);
      const lagStats = [
        getStatsFromCumulative(lag5),
        getStatsFromCumulative(lag20)
      ]

      // Generate AI prediction
      const prediction = await aiPredictionService.generateQuestion(currentStats, lagStats)
      
      // Remove ONLY old expired unanswered questions (keep answered ones)
      const now = Date.now()
      matchState.questions = matchState.questions.filter(q => 
        q.answered || new Date(q.expiresAt).getTime() > now
      )

      // Create the question with 30-second display timer
      const question: LiveQuestion = {
        id: `${matchId}-q${Date.now()}`,
        text: prediction.questionText,
        options: ['Yes', 'No'],
        eventType: prediction.eventType,
        predictedCount: prediction.predictedCount,
        correctAnswer: null,
        timeLeft: 30, // 30 seconds to answer before it disappears
        answered: false,
        userAnswer: null,
        pointsAwarded: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30000) // 30 seconds from now
      }

      matchState.questions.push(question)
      matchState.lastQuestionTime = new Date()

      console.log(`Generated question for match ${matchId}:`, question.text)

      // Start 30-second countdown for this unanswered question
      this.startQuestionCountdown(matchId, question.id)

    } catch (error) {
      console.error(`Failed to generate question for match ${matchId}:`, error)
    }
  }

  // Start countdown timer for a specific question
  private startQuestionCountdown(matchId: string, questionId: string): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    const question = matchState.questions.find(q => q.id === questionId)
    if (!question) return

    const countdownInterval = setInterval(() => {
      question.timeLeft -= 1

      if (question.timeLeft <= 0) {
        clearInterval(countdownInterval)
        this.expireQuestion(matchId, questionId)
      }
    }, 1000)
  }

  // Handle question expiration
  private expireQuestion(matchId: string, questionId: string): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    const question = matchState.questions.find(q => q.id === questionId)
    if (!question || question.answered) return

    // Run custom expiration logic
    this.onQuestionExpired(matchId, question)
    console.log(`Question ${questionId} expired for match ${matchId}`)
  }

  // Submit an answer for a question
  submitAnswer(matchId: string, questionId: string, answer: string): { success: boolean; pointsAwarded: number } {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return { success: false, pointsAwarded: 0 }

    const question = matchState.questions.find(q => q.id === questionId)
    if (!question || question.answered || question.timeLeft <= 0) {
      return { success: false, pointsAwarded: 0 }
    }

    // Mark as answered and store the answer
    question.answered = true
    question.userAnswer = answer

    // Reset to 60-second timer for answered question display in ActiveQuestions
    const expirationTime = matchState.config.answerTimeLimit * 1000 // 60 seconds = 60000ms
    question.expiresAt = new Date(Date.now() + expirationTime)
    question.timeLeft = matchState.config.answerTimeLimit

    // For now, we'll determine correctness after the time window
    // In a real implementation, this would be determined by actual match events
    const isCorrect = Math.random() > 0.5 // Placeholder logic
    question.correctAnswer = isCorrect

    if (isCorrect) {
      question.pointsAwarded = matchState.config.pointsPerCorrect
      matchState.totalScore += question.pointsAwarded
    }

    console.log(`Answer submitted for question ${questionId}: ${answer} - Now showing in ActiveQuestions for ${matchState.config.answerTimeLimit}s`)

    // Save to localStorage ONLY after submission
    this.saveToLocalStorage()

    // Restart the countdown timer with new 60-second expiration
    this.startQuestionCountdown(matchId, question.id)

    return { 
      success: true, 
      pointsAwarded: question.pointsAwarded 
    }
  }

  // Get current state for a match
  getMatchState(matchId: string): MatchQuestionState | null {
    return this.matchStates.get(matchId) || null
  }

  // Get current active question for a match
  getCurrentQuestion(matchId: string): LiveQuestion | null {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return null

    // Get the most recent unanswered question (for display in LiveMatch)
    const unansweredQuestions = matchState.questions
      .filter(q => !q.answered)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return unansweredQuestions[0] || null
  }

  // Get all questions for a match
  getMatchQuestions(matchId: string): LiveQuestion[] {
    const matchState = this.matchStates.get(matchId)
    return matchState?.questions || []
  }

  // Update configuration for a match
  updateConfig(matchId: string, config: Partial<QuestionConfig>): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    matchState.config = { ...matchState.config, ...config }
    console.log(`Updated config for match ${matchId}:`, matchState.config)
  }

  // Set custom expiration handler
  setExpirationHandler(handler: (matchId: string, question: LiveQuestion) => void): void {
    this.customExpirationHandler = handler
  }

  private customExpirationHandler?: (matchId: string, question: LiveQuestion) => void

  // Get all answered questions for a match
  getAnsweredQuestions(matchId: string): LiveQuestion[] {
    const matchState = this.matchStates.get(matchId)
    return matchState?.questions.filter(q => q.answered && q.userAnswer !== null) || []
  }

  // Get all expired questions for a match
  getExpiredQuestions(matchId: string): LiveQuestion[] {
    const now = new Date()
    const matchState = this.matchStates.get(matchId)
    return matchState?.questions.filter(q => new Date(q.expiresAt) <= now) || []
  }

  // Clean up old expired questions (keeps them in localStorage but removes from active memory)
  cleanupExpiredQuestions(matchId: string, olderThanMinutes: number = 60): void {
    const matchState = this.matchStates.get(matchId)
    if (!matchState) return

    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000)
    const before = matchState.questions.length
    
    matchState.questions = matchState.questions.filter(q => 
      new Date(q.expiresAt) > cutoffTime || !q.answered
    )

    const removed = before - matchState.questions.length
    if (removed > 0) {
      console.log(`Cleaned up ${removed} old questions for match ${matchId}`)
      this.saveToLocalStorage()
    }
  }

  // Clear all questions for a match from localStorage
  clearMatchQuestions(matchId: string): void {
    this.matchStates.delete(matchId)
    this.saveToLocalStorage()
    console.log(`Cleared all questions for match ${matchId}`)
  }

  // Clean up resources
  cleanup(): void {
    // Clear all timers
    for (const timer of this.questionTimers.values()) {
      clearTimeout(timer)
    }
    this.questionTimers.clear()
    this.matchStates.clear()
    
    // Don't clear localStorage on cleanup - questions should persist
  }
}

// Singleton instance
export const realtimeQuestionService = new RealtimeQuestionService()

// Cleanup on process exit
process.on('SIGINT', () => {
  realtimeQuestionService.cleanup()
})

process.on('SIGTERM', () => {
  realtimeQuestionService.cleanup()
})
