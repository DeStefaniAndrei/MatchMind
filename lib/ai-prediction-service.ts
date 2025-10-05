// AI Prediction Service for real-time match questions
// Loads trained models and makes predictions for event counts

import fs from 'fs'
import path from 'path'

export interface MatchStats {
  minute: number
  events: {
    [eventType: string]: {
      home: number
      away: number
    }
  }
}

export interface PredictionResult {
  eventType: string
  predictedCount: number
  confidence: number
  questionText: string
}

export interface AIModel {
  name: string
  eventType: string
  coefficients: number[]
  input: {
    features: string[]
  }
}

// Event types that have trained models
const EVENT_TYPES = [
  'Pass', 'Shot', 'Foul Committed', 'Duel', 'Block', 
  'Ball Recovery', 'Pressure', 'Miscontrol', 'Interception', 'Possession Change'
]

class AIPredictionService {
  private models: Map<string, AIModel> = new Map()
  private modelsLoaded = false

  constructor(private modelsPath: string = 'artifacts/models') {}

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return

    try {
      const modelFiles = fs.readdirSync(this.modelsPath)
        .filter(file => file.endsWith('-tplus1.json'))

      for (const file of modelFiles) {
        const modelPath = path.join(this.modelsPath, file)
        const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'))
        
        if (modelData.coefficients && modelData.eventType) {
          this.models.set(modelData.eventType, modelData)
        }
      }

      this.modelsLoaded = true
      console.log(`Loaded ${this.models.size} AI models`)
    } catch (error) {
      console.error('Failed to load AI models:', error)
      throw error
    }
  }

  private buildFeatureVector(currentStats: MatchStats, lagStats: MatchStats[]): number[] {
    const features = [1, currentStats.minute] // bias, minute

    // Current minute stats (T) - all event types
    for (const eventType of EVENT_TYPES) {
      const key = eventType.toLowerCase().replace(/\s+/g, '_')
      const homeCount = currentStats.events[eventType]?.home || 0
      const awayCount = currentStats.events[eventType]?.away || 0
      features.push(homeCount, awayCount)
    }

    // T-5 lag stats
    const lag5 = lagStats.find(s => s.minute === currentStats.minute - 5)
    for (const eventType of EVENT_TYPES) {
      const key = eventType.toLowerCase().replace(/\s+/g, '_')
      const homeCount = lag5?.events[eventType]?.home || 0
      const awayCount = lag5?.events[eventType]?.away || 0
      features.push(homeCount, awayCount)
    }

    // T-20 lag stats
    const lag20 = lagStats.find(s => s.minute === currentStats.minute - 20)
    for (const eventType of EVENT_TYPES) {
      const key = eventType.toLowerCase().replace(/\s+/g, '_')
      const homeCount = lag20?.events[eventType]?.home || 0
      const awayCount = lag20?.events[eventType]?.away || 0
      features.push(homeCount, awayCount)
    }

    return features
  }

  private dotProduct(weights: number[], features: number[]): number {
    return weights.reduce((sum, weight, i) => sum + weight * (features[i] || 0), 0)
  }

  async predictEventCount(
    eventType: string, 
    currentStats: MatchStats, 
    lagStats: MatchStats[]
  ): Promise<number> {
    await this.loadModels()

    const model = this.models.get(eventType)
    if (!model) {
      console.warn(`No model found for event type: ${eventType}`)
      return Math.floor(Math.random() * 5) + 1 // Fallback random prediction
    }

    const features = this.buildFeatureVector(currentStats, lagStats)
    const prediction = this.dotProduct(model.coefficients, features)
    
    // Ensure prediction is non-negative and reasonable
    return Math.max(0, Math.floor(prediction))
  }

  async generateQuestion(
    currentStats: MatchStats,
    lagStats: MatchStats[]
  ): Promise<PredictionResult> {
    await this.loadModels()

    // Select a random event type that has a model
    const availableEventTypes = Array.from(this.models.keys())
    const eventType = availableEventTypes[Math.floor(Math.random() * availableEventTypes.length)]
    
    const predictedCount = await this.predictEventCount(eventType, currentStats, lagStats)
    
    // Generate question text
    const questionText = `Will there be more than ${predictedCount} ${eventType.toLowerCase()}s in the next minute?`
    
    // Calculate confidence based on model performance (simplified)
    const confidence = Math.min(0.9, Math.max(0.3, 1 - (predictedCount / 20)))
    
    return {
      eventType,
      predictedCount,
      confidence,
      questionText
    }
  }

  getAvailableEventTypes(): string[] {
    return Array.from(this.models.keys())
  }

  isModelLoaded(): boolean {
    return this.modelsLoaded
  }
}

// Singleton instance
export const aiPredictionService = new AIPredictionService()

// Helper function to create mock stats for testing
export function createMockStats(minute: number): MatchStats {
  return {
    minute,
    events: {
      'Pass': { home: minute * 2, away: minute * 1.8 },
      'Shot': { home: Math.floor(minute / 10), away: Math.floor(minute / 12) },
      'Foul Committed': { home: Math.floor(minute / 15), away: Math.floor(minute / 18) },
      'Duel': { home: Math.floor(minute / 3), away: Math.floor(minute / 3.2) },
      'Block': { home: Math.floor(minute / 20), away: Math.floor(minute / 22) },
      'Ball Recovery': { home: Math.floor(minute / 8), away: Math.floor(minute / 9) },
      'Pressure': { home: Math.floor(minute / 2), away: Math.floor(minute / 2.1) },
      'Miscontrol': { home: Math.floor(minute / 25), away: Math.floor(minute / 28) },
      'Interception': { home: Math.floor(minute / 30), away: Math.floor(minute / 32) },
      'Possession Change': { home: Math.floor(minute / 5), away: Math.floor(minute / 5.5) }
    }
  }
}
