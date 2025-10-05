// Real-time Question Service
// Manages question generation, timing, and scoring for live matches

import { aiPredictionService, createMockStats, type MatchStats, type PredictionResult } from './ai-prediction-service'

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

  constructor() {
    // Initialize with default config
    this.defaultConfig = {
      questionInterval: 30, // 30 seconds
      answerTimeLimit: 30, // 30 seconds to answer
      pointsPerCorrect: 10, // 10 points per correct answer
      maxQuestionsPerMatch: 180 // 90 minutes * 2 questions per minute
    }
  }

  private defaultConfig: QuestionConfig

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

    // Start the question generation timer
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
      // Create current stats (in real implementation, this would come from live data)
      const currentStats = createMockStats(matchState.currentMinute)
      
      // Create lag stats (T-5, T-20)
      const lagStats = [
        createMockStats(matchState.currentMinute - 5),
        createMockStats(matchState.currentMinute - 20)
      ]

      // Generate AI prediction
      const prediction = await aiPredictionService.generateQuestion(currentStats, lagStats)
      
      // Create the question
      const question: LiveQuestion = {
        id: `${matchId}-q${Date.now()}`,
        text: prediction.questionText,
        options: ['Yes', 'No'],
        eventType: prediction.eventType,
        predictedCount: prediction.predictedCount,
        correctAnswer: null,
        timeLeft: matchState.config.answerTimeLimit,
        answered: false,
        userAnswer: null,
        pointsAwarded: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + matchState.config.answerTimeLimit * 1000)
      }

      matchState.questions.push(question)
      matchState.lastQuestionTime = new Date()

      console.log(`Generated question for match ${matchId}:`, question.text)

      // Start countdown timer for this question
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

    question.answered = true
    question.timeLeft = 0
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

    question.answered = true
    question.userAnswer = answer

    // For now, we'll determine correctness after the time window
    // In a real implementation, this would be determined by actual match events
    const isCorrect = Math.random() > 0.5 // Placeholder logic
    question.correctAnswer = isCorrect

    if (isCorrect) {
      question.pointsAwarded = matchState.config.pointsPerCorrect
      matchState.totalScore += question.pointsAwarded
    }

    console.log(`Answer submitted for question ${questionId}: ${answer} (${isCorrect ? 'correct' : 'incorrect'})`)

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

    return matchState.questions
      .filter(q => !q.answered && q.timeLeft > 0)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null
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

  // Clean up resources
  cleanup(): void {
    // Clear all timers
    for (const timer of this.questionTimers.values()) {
      clearTimeout(timer)
    }
    this.questionTimers.clear()
    this.matchStates.clear()
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
