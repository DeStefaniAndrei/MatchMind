/**
 * Question Evaluator System
 * 
 * This file contains the evaluation strategies for different question types.
 * It uses the Strategy pattern to handle various question evaluation rules.
 */

import { Question, QuestionType, EvaluationRule, UserAnswer } from './question-domain';
import { getMatchStats, getMatchEvents } from './sportmonks-api';
import { getMatchById } from './match-service';

export interface EvaluationContext {
  matchId: string;
  question: Question;
  userAnswers: UserAnswer[];
  matchData?: any;
  statsData?: any;
  eventsData?: any;
}

export interface EvaluationResult {
  questionId: string;
  correctAnswer: any;
  evaluationSource: string;
  evaluatedAt: Date;
  userResults: Array<{
    userId: string;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

/**
 * Base evaluator interface
 */
export interface QuestionEvaluator {
  canEvaluate(question: Question): boolean;
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
}

/**
 * Boolean question evaluator
 * Handles yes/no questions like "Will PSG score next?"
 */
export class BooleanEvaluator implements QuestionEvaluator {
  canEvaluate(question: Question): boolean {
    return question.questionType === 'boolean';
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { question, userAnswers, matchData, eventsData } = context;
    
    // Extract the correct answer based on the evaluation rule
    const correctAnswer = await this.determineCorrectAnswer(question, matchData, eventsData);
    
    // Evaluate each user's answer
    const userResults = userAnswers.map(userAnswer => {
      const isCorrect = userAnswer.answerPayload === correctAnswer;
      return {
        userId: userAnswer.userId,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    return {
      questionId: question.id,
      correctAnswer,
      evaluationSource: question.evaluationRule.source,
      evaluatedAt: new Date(),
      userResults
    };
  }

  private async determineCorrectAnswer(question: Question, matchData: any, eventsData: any): Promise<boolean> {
    const rule = question.evaluationRule;
    
    switch (rule.config.type) {
      case 'next_goal':
        return this.evaluateNextGoal(rule.config, matchData, eventsData);
      case 'match_outcome':
        return this.evaluateMatchOutcome(rule.config, matchData);
      case 'stat_comparison':
        return this.evaluateStatComparison(rule.config, matchData);
      default:
        throw new Error(`Unknown boolean evaluation type: ${rule.config.type}`);
    }
  }

  private evaluateNextGoal(config: any, matchData: any, eventsData: any): boolean {
    // Check if the specified team scored next
    const targetTeam = config.team; // 'home' or 'away'
    const events = eventsData?.events || [];
    
    // Find the first goal after the question was created
    const questionTime = new Date(question.startAt);
    const nextGoal = events.find((event: any) => 
      event.type === 'goal' && 
      new Date(event.time) > questionTime &&
      event.team === targetTeam
    );
    
    return !!nextGoal;
  }

  private evaluateMatchOutcome(config: any, matchData: any): boolean {
    const { homeScore, awayScore } = matchData;
    const targetOutcome = config.outcome; // 'home_win', 'away_win', 'draw'
    
    switch (targetOutcome) {
      case 'home_win':
        return homeScore > awayScore;
      case 'away_win':
        return awayScore > homeScore;
      case 'draw':
        return homeScore === awayScore;
      default:
        return false;
    }
  }

  private evaluateStatComparison(config: any, matchData: any): boolean {
    const { stat, team, operator, value } = config;
    const teamStats = matchData.stats?.[team];
    
    if (!teamStats || teamStats[stat] === undefined) {
      return false;
    }
    
    const actualValue = teamStats[stat];
    
    switch (operator) {
      case '>':
        return actualValue > value;
      case '<':
        return actualValue < value;
      case '>=':
        return actualValue >= value;
      case '<=':
        return actualValue <= value;
      case '==':
        return actualValue === value;
      default:
        return false;
    }
  }
}

/**
 * Multiple choice question evaluator
 * Handles questions with predefined options
 */
export class MultipleChoiceEvaluator implements QuestionEvaluator {
  canEvaluate(question: Question): boolean {
    return question.questionType === 'multiple_choice';
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { question, userAnswers, matchData, eventsData } = context;
    
    const correctAnswer = await this.determineCorrectAnswer(question, matchData, eventsData);
    
    const userResults = userAnswers.map(userAnswer => {
      const isCorrect = userAnswer.answerPayload === correctAnswer;
      return {
        userId: userAnswer.userId,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    return {
      questionId: question.id,
      correctAnswer,
      evaluationSource: question.evaluationRule.source,
      evaluatedAt: new Date(),
      userResults
    };
  }

  private async determineCorrectAnswer(question: Question, matchData: any, eventsData: any): Promise<any> {
    const rule = question.evaluationRule;
    
    switch (rule.config.type) {
      case 'first_goal_scorer':
        return this.evaluateFirstGoalScorer(rule.config, eventsData);
      case 'final_score':
        return this.evaluateFinalScore(rule.config, matchData);
      case 'total_goals':
        return this.evaluateTotalGoals(rule.config, matchData);
      default:
        throw new Error(`Unknown multiple choice evaluation type: ${rule.config.type}`);
    }
  }

  private evaluateFirstGoalScorer(config: any, eventsData: any): string {
    const events = eventsData?.events || [];
    const firstGoal = events.find((event: any) => event.type === 'goal');
    return firstGoal?.player || 'none';
  }

  private evaluateFinalScore(config: any, matchData: any): string {
    const { homeScore, awayScore } = matchData;
    return `${homeScore}-${awayScore}`;
  }

  private evaluateTotalGoals(config: any, matchData: any): string {
    const { homeScore, awayScore } = matchData;
    const total = homeScore + awayScore;
    
    // Map to predefined ranges
    if (total <= 1) return '0-1';
    if (total <= 3) return '2-3';
    if (total <= 5) return '4-5';
    return '6+';
  }
}

/**
 * Numeric question evaluator
 * Handles questions with numeric answers and tolerance
 */
export class NumericEvaluator implements QuestionEvaluator {
  canEvaluate(question: Question): boolean {
    return question.questionType === 'numeric';
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { question, userAnswers, matchData, eventsData } = context;
    
    const correctAnswer = await this.determineCorrectAnswer(question, matchData, eventsData);
    const tolerance = question.evaluationRule.tolerance || 0;
    
    const userResults = userAnswers.map(userAnswer => {
      const userValue = Number(userAnswer.answerPayload);
      const correctValue = Number(correctAnswer);
      const isCorrect = Math.abs(userValue - correctValue) <= tolerance;
      
      return {
        userId: userAnswer.userId,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    return {
      questionId: question.id,
      correctAnswer,
      evaluationSource: question.evaluationRule.source,
      evaluatedAt: new Date(),
      userResults
    };
  }

  private async determineCorrectAnswer(question: Question, matchData: any, eventsData: any): Promise<number> {
    const rule = question.evaluationRule;
    
    switch (rule.config.type) {
      case 'possession':
        return this.evaluatePossession(rule.config, matchData);
      case 'shots':
        return this.evaluateShots(rule.config, matchData);
      case 'corners':
        return this.evaluateCorners(rule.config, matchData);
      default:
        throw new Error(`Unknown numeric evaluation type: ${rule.config.type}`);
    }
  }

  private evaluatePossession(config: any, matchData: any): number {
    const team = config.team; // 'home' or 'away'
    return matchData.stats?.[team]?.possession || 0;
  }

  private evaluateShots(config: any, matchData: any): number {
    const team = config.team;
    return matchData.stats?.[team]?.shots || 0;
  }

  private evaluateCorners(config: any, matchData: any): number {
    const team = config.team;
    return matchData.stats?.[team]?.corners || 0;
  }
}

/**
 * Text question evaluator
 * Handles open-ended text questions
 */
export class TextEvaluator implements QuestionEvaluator {
  canEvaluate(question: Question): boolean {
    return question.questionType === 'text';
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { question, userAnswers, matchData, eventsData } = context;
    
    const correctAnswer = await this.determineCorrectAnswer(question, matchData, eventsData);
    
    const userResults = userAnswers.map(userAnswer => {
      const isCorrect = this.compareTextAnswers(userAnswer.answerPayload, correctAnswer);
      return {
        userId: userAnswer.userId,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    return {
      questionId: question.id,
      correctAnswer,
      evaluationSource: question.evaluationRule.source,
      evaluatedAt: new Date(),
      userResults
    };
  }

  private async determineCorrectAnswer(question: Question, matchData: any, eventsData: any): Promise<string> {
    const rule = question.evaluationRule;
    
    switch (rule.config.type) {
      case 'man_of_match':
        return this.evaluateManOfMatch(rule.config, matchData);
      case 'referee':
        return matchData.referee || 'unknown';
      default:
        throw new Error(`Unknown text evaluation type: ${rule.config.type}`);
    }
  }

  private evaluateManOfMatch(config: any, matchData: any): string {
    // This would typically come from match data or be manually set
    return matchData.manOfMatch || 'unknown';
  }

  private compareTextAnswers(userAnswer: string, correctAnswer: string): boolean {
    // Normalize both answers for comparison
    const normalize = (text: string) => text.toLowerCase().trim().replace(/\s+/g, ' ');
    return normalize(userAnswer) === normalize(correctAnswer);
  }
}

/**
 * Time-bound question evaluator
 * Handles questions about events that happen at specific times
 */
export class TimeBoundEvaluator implements QuestionEvaluator {
  canEvaluate(question: Question): boolean {
    return question.questionType === 'time_bound';
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { question, userAnswers, matchData, eventsData } = context;
    
    const correctAnswer = await this.determineCorrectAnswer(question, matchData, eventsData);
    
    const userResults = userAnswers.map(userAnswer => {
      const isCorrect = this.compareTimeAnswers(userAnswer.answerPayload, correctAnswer);
      return {
        userId: userAnswer.userId,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      };
    });

    return {
      questionId: question.id,
      correctAnswer,
      evaluationSource: question.evaluationRule.source,
      evaluatedAt: new Date(),
      userResults
    };
  }

  private async determineCorrectAnswer(question: Question, matchData: any, eventsData: any): Promise<string> {
    const rule = question.evaluationRule;
    
    switch (rule.config.type) {
      case 'first_goal_time':
        return this.evaluateFirstGoalTime(rule.config, eventsData);
      case 'half_time_score':
        return this.evaluateHalfTimeScore(rule.config, eventsData);
      default:
        throw new Error(`Unknown time-bound evaluation type: ${rule.config.type}`);
    }
  }

  private evaluateFirstGoalTime(config: any, eventsData: any): string {
    const events = eventsData?.events || [];
    const firstGoal = events.find((event: any) => event.type === 'goal');
    return firstGoal ? `${firstGoal.minute}'` : 'no_goal';
  }

  private evaluateHalfTimeScore(config: any, eventsData: any): string {
    const events = eventsData?.events || [];
    const halfTimeEvents = events.filter((event: any) => event.minute <= 45);
    
    let homeScore = 0;
    let awayScore = 0;
    
    halfTimeEvents.forEach((event: any) => {
      if (event.type === 'goal') {
        if (event.team === 'home') homeScore++;
        else if (event.team === 'away') awayScore++;
      }
    });
    
    return `${homeScore}-${awayScore}`;
  }

  private compareTimeAnswers(userAnswer: any, correctAnswer: any): boolean {
    // Handle different time formats
    if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }
    
    // Handle minute-based answers
    const userMinute = parseInt(String(userAnswer));
    const correctMinute = parseInt(String(correctAnswer));
    
    if (!isNaN(userMinute) && !isNaN(correctMinute)) {
      const tolerance = 5; // 5 minute tolerance
      return Math.abs(userMinute - correctMinute) <= tolerance;
    }
    
    return false;
  }
}

/**
 * Main evaluator factory
 * Routes questions to the appropriate evaluator
 */
export class QuestionEvaluatorFactory {
  private evaluators: QuestionEvaluator[] = [
    new BooleanEvaluator(),
    new MultipleChoiceEvaluator(),
    new NumericEvaluator(),
    new TextEvaluator(),
    new TimeBoundEvaluator()
  ];

  async evaluateQuestion(context: EvaluationContext): Promise<EvaluationResult> {
    const { question } = context;
    
    // Find the appropriate evaluator
    const evaluator = this.evaluators.find(e => e.canEvaluate(question));
    if (!evaluator) {
      throw new Error(`No evaluator found for question type: ${question.questionType}`);
    }

    // Gather additional context data if needed
    const enrichedContext = await this.enrichContext(context);
    
    return evaluator.evaluate(enrichedContext);
  }

  private async enrichContext(context: EvaluationContext): Promise<EvaluationContext> {
    const { matchId, question } = context;
    
    try {
      // Get match data
      const matchData = await getMatchById(matchId);
      
      // Get live stats if available
      let statsData = null;
      let eventsData = null;
      
      if (matchData?.sportmonks_id) {
        try {
          statsData = await getMatchStats(matchData.sportmonks_id);
          eventsData = await getMatchEvents(matchData.sportmonks_id);
        } catch (error) {
          console.warn('Failed to fetch live data for evaluation:', error);
        }
      }
      
      return {
        ...context,
        matchData,
        statsData,
        eventsData
      };
    } catch (error) {
      console.error('Failed to enrich evaluation context:', error);
      return context;
    }
  }
}

// Export singleton instance
export const questionEvaluator = new QuestionEvaluatorFactory();
