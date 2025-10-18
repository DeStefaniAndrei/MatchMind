// Loads the models from Artifacts and makes predictions


import { Question, QuestionType, EvaluationRule, QuestionOption } from './question-domain';

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
  questionFormat: 'more_than' | 'less_than' | 'will_happen'
}

export interface AIQuestionTemplate {
  id: string;
  text: string;
  questionType: QuestionType;
  options: QuestionOption[];
  evaluationRule: EvaluationRule;
  points: number;
  duration: number; // seconds
  confidence: number;
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
      // Load models from static JSON files in the public directory
      const modelFiles = [
        'ball_recovery-tplus1.json',
        'block-tplus1.json', 
        'duel-tplus1.json',
        'foul_committed-tplus1.json',
        'interception-tplus1.json',
        'miscontrol-tplus1.json',
        'pass-tplus1.json',
        'possession_change-tplus1.json',
        'pressure-tplus1.json',
        'shot-tplus1.json'
      ]

      for (const file of modelFiles) {
        try {
          const response = await fetch(`/artifacts/models/${file}`)
          if (response.ok) {
            const modelData = await response.json()
            if (modelData.coefficients && modelData.eventType) {
              this.models.set(modelData.eventType, modelData)
            }
          }
        } catch (fileError) {
          console.warn(`Failed to load model file ${file}:`, fileError)
        }
      }

      this.modelsLoaded = true
      console.log(`Loaded ${this.models.size} AI models`)
    } catch (error) {
      console.error('Failed to load AI models:', error)
      // Don't throw error - allow service to work with fallback predictions
      this.modelsLoaded = true
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
      return -1
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
    
    // Generate question text based on predicted count
    let questionText: string
    let questionFormat: 'more_than' | 'less_than' | 'will_happen'
    
    if (predictedCount <= 1) {
      // Rare events: Use "Will a <eventtype> happen" format
      questionText = `Will a ${eventType.toLowerCase()} happen in the next minute?`
      questionFormat = 'will_happen'
    } else {
      // Common events: Randomly choose between "more than" or "less than"
      const questionType = Math.random() > 0.5 ? 'more' : 'less'
      
      if (questionType === 'more') {
        questionText = `Will more than ${predictedCount} ${eventType.toLowerCase()}s happen in the next minute?`
        questionFormat = 'more_than'
      } else {
        questionText = `Will less than ${predictedCount} ${eventType.toLowerCase()}s happen in the next minute?`
        questionFormat = 'less_than'
      }
    }
    
    // Calculate confidence based on model performance (simplified)
    const confidence = Math.min(0.9, Math.max(0.3, 1 - (predictedCount / 20)))
    
    return {
      eventType,
      predictedCount,
      confidence,
      questionText,
      questionFormat
    }
  }

  getAvailableEventTypes(): string[] {
    return Array.from(this.models.keys())
  }

  isModelLoaded(): boolean {
    return this.modelsLoaded
  }

  /**
   * Generate AI question templates based on current match state
   */
  async generateQuestionTemplates(
    matchId: string,
    currentStats: MatchStats,
    lagStats: MatchStats[]
  ): Promise<AIQuestionTemplate[]> {
    await this.loadModels();

    const templates: AIQuestionTemplate[] = [];
    const availableEventTypes = Array.from(this.models.keys());

    // Generate 2-3 questions per match
    const numQuestions = Math.min(3, availableEventTypes.length);
    const selectedEventTypes = this.shuffleArray(availableEventTypes).slice(0, numQuestions);

    for (const eventType of selectedEventTypes) {
      try {
        const template = await this.createQuestionTemplate(
          matchId,
          eventType,
          currentStats,
          lagStats
        );
        if (template) {
          templates.push(template);
        }
      } catch (error) {
        console.warn(`Failed to create question template for ${eventType}:`, error);
      }
    }

    return templates;
  }

  /**
   * Create a question template for a specific event type
   */
  private async createQuestionTemplate(
    matchId: string,
    eventType: string,
    currentStats: MatchStats,
    lagStats: MatchStats[]
  ): Promise<AIQuestionTemplate | null> {
    const predictedCount = await this.predictEventCount(eventType, currentStats, lagStats);
    
    if (predictedCount < 0) {
      return null;
    }

    const confidence = Math.min(0.9, Math.max(0.3, 1 - (predictedCount / 20)));
    
    // Generate different question types based on event type
    const questionType = this.selectQuestionType(eventType, predictedCount);
    
    const template: AIQuestionTemplate = {
      id: crypto.randomUUID(),
      text: this.generateQuestionText(eventType, predictedCount, questionType),
      questionType,
      options: this.generateOptions(eventType, predictedCount, questionType),
      evaluationRule: this.createEvaluationRule(eventType, predictedCount, questionType),
      points: this.calculatePoints(confidence),
      duration: this.calculateDuration(confidence),
      confidence
    };

    return template;
  }

  /**
   * Select appropriate question type based on event type and prediction
   */
  private selectQuestionType(eventType: string, predictedCount: number): QuestionType {
    // Boolean questions for simple yes/no predictions
    if (predictedCount <= 1) {
      return 'boolean';
    }
    
    // Multiple choice for ranges
    if (predictedCount <= 5) {
      return 'multiple_choice';
    }
    
    // Numeric for specific counts
    return 'numeric';
  }

  /**
   * Generate question text based on event type and prediction
   */
  private generateQuestionText(eventType: string, predictedCount: number, questionType: QuestionType): string {
    const eventName = eventType.toLowerCase().replace(/_/g, ' ');
    
    switch (questionType) {
      case 'boolean':
        return `Will there be at least ${predictedCount} ${eventName} in the next 5 minutes?`;
      
      case 'multiple_choice':
        return `How many ${eventName} will occur in the next 5 minutes?`;
      
      case 'numeric':
        return `Predict the exact number of ${eventName} in the next 5 minutes:`;
      
      default:
        return `Will there be more than ${predictedCount} ${eventName} in the next 5 minutes?`;
    }
  }

  /**
   * Generate options for multiple choice questions
   */
  private generateOptions(eventType: string, predictedCount: number, questionType: QuestionType): QuestionOption[] {
    if (questionType !== 'multiple_choice') {
      return [];
    }

    const baseCount = Math.max(0, predictedCount - 2);
    const options: QuestionOption[] = [];

    for (let i = 0; i < 5; i++) {
      const count = baseCount + i;
      options.push({
        id: `option_${i}`,
        label: count.toString(),
        value: count
      });
    }

    return options;
  }

  /**
   * Create evaluation rule for the question
   */
  private createEvaluationRule(eventType: string, predictedCount: number, questionType: QuestionType): EvaluationRule {
    return {
      type: questionType,
      source: 'api',
      config: {
        type: 'event_count',
        eventType: eventType,
        timeWindow: 5, // 5 minutes
        tolerance: questionType === 'numeric' ? 1 : 0
      },
      tolerance: questionType === 'numeric' ? 1 : 0
    };
  }

  /**
   * Calculate points based on confidence
   */
  private calculatePoints(confidence: number): number {
    return Math.max(5, Math.min(20, Math.round(confidence * 20)));
  }

  /**
   * Calculate duration based on confidence
   */
  private calculateDuration(confidence: number): number {
    return Math.max(60, Math.min(300, Math.round(confidence * 300))); // 1-5 minutes
  }

  /**
   * Create and schedule questions for a match
   */
  async createAndScheduleQuestions(
    matchId: string,
    currentStats: MatchStats,
    lagStats: MatchStats[],
    startDelay: number = 0 // seconds to wait before first question
  ): Promise<Question[]> {
    const templates = await this.generateQuestionTemplates(matchId, currentStats, lagStats);
    const questions: Question[] = [];
    const now = new Date();

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const startAt = new Date(now.getTime() + (startDelay + i * 120) * 1000); // 2 minutes between questions
      const endAt = new Date(startAt.getTime() + template.duration * 1000);

      const question = Question.create({
        matchId,
        text: template.text,
        options: template.options,
        questionType: template.questionType,
        points: template.points,
        startAt,
        endAt,
        graceSeconds: 30,
        evaluationRule: template.evaluationRule,
        metadata: {
          aiConfidence: template.confidence,
          generatedAt: now.toISOString(),
          source: 'ai_prediction',
          tags: ['ai_generated', template.evaluationRule.config.eventType],
          difficulty: template.confidence > 0.7 ? 'easy' : template.confidence > 0.5 ? 'medium' : 'hard'
        }
      });

      // Questions are now stored in memory only
      questions.push(question);
    }

    return questions;
  }

  // Question storage removed - questions are now handled in memory only

  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Singleton instance
export const aiPredictionService = new AIPredictionService()



// Build stats from a Match cumulative snapshot
import type { CumulativeMinuteStats } from '../types'
export function getStatsFromCumulative(snapshot?: CumulativeMinuteStats): MatchStats {
  if (!snapshot) return { minute: 0, events: {} }
  const byTeam = snapshot.byTeam || { home: {}, away: {}, unknown: {} }
  const collectKeys = new Set<string>([...Object.keys(byTeam.home || {}), ...Object.keys(byTeam.away || {})])
  const events: Record<string, { home: number; away: number }> = {}
  for (const raw of collectKeys) {
    const t = String(raw).toLowerCase() // normalize case for model features
    const homeVal = (byTeam.home as any)[raw] || (byTeam.home as any)[t] || 0
    const awayVal = (byTeam.away as any)[raw] || (byTeam.away as any)[t] || 0
    events[t] = { home: homeVal, away: awayVal }
  }
  return { minute: snapshot.minute, events }
}