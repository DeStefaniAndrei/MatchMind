/**
 * Question Lifecycle Service
 * 
 * This service manages the lifecycle of questions, including state transitions,
 * timing, and evaluation orchestration.
 * 
 * NOTE: This service now uses in-memory storage instead of Supabase
 */

import { Question, QuestionState, UserAnswer, QuestionResult } from './question-domain';
import { questionEvaluator, EvaluationContext, EvaluationResult } from './question-evaluator';

export interface QuestionLifecycleEvents {
  onQuestionActivated?: (question: Question) => void;
  onQuestionClosed?: (question: Question) => void;
  onQuestionEvaluated?: (question: Question, result: EvaluationResult) => void;
  onQuestionSettled?: (question: Question) => void;
}

/**
 * Question Lifecycle Service
 * Handles state transitions, timing, and evaluation of questions
 * 
 * NOTE: Now uses in-memory storage instead of Supabase
 */
export class QuestionLifecycleService {
  private events: QuestionLifecycleEvents = {};
  private questions: Map<string, Question> = new Map();
  private userAnswers: Map<string, UserAnswer[]> = new Map();
  private questionResults: Map<string, QuestionResult> = new Map();

  constructor(events?: QuestionLifecycleEvents) {
    if (events) {
      this.events = events;
    }
  }

  /**
   * Add a question to the in-memory store
   */
  addQuestion(question: Question): void {
    this.questions.set(question.id, question);
  }

  /**
   * Get a question by ID
   */
  getQuestion(questionId: string): Question | undefined {
    return this.questions.get(questionId);
  }

  /**
   * Process questions that need state transitions based on current time
   */
  async processScheduledQuestions(now: Date = new Date()): Promise<void> {
    try {
      // Find questions that should be activated
      const questionsToActivate = this.getQuestionsToActivate(now);
      for (const question of questionsToActivate) {
        await this.activateQuestion(question);
      }

      // Find questions that should be closed
      const questionsToClose = this.getQuestionsToClose(now);
      for (const question of questionsToClose) {
        await this.closeQuestion(question);
      }

      // Find questions that should be evaluated
      const questionsToEvaluate = this.getQuestionsToEvaluate(now);
      for (const question of questionsToEvaluate) {
        await this.evaluateQuestion(question);
      }
    } catch (error) {
      console.error('Error processing scheduled questions:', error);
    }
  }

  /**
   * Activate a question (transition from scheduled to active)
   */
  async activateQuestion(question: Question): Promise<Question> {
    if (question.state !== 'scheduled') {
      throw new Error(`Cannot activate question in state: ${question.state}`);
    }

    const activatedQuestion = question.activate();
    this.questions.set(activatedQuestion.id, activatedQuestion);
    
    this.events.onQuestionActivated?.(activatedQuestion);
    
    return activatedQuestion;
  }

  /**
   * Close a question (transition from active to closed)
   */
  async closeQuestion(question: Question): Promise<Question> {
    if (question.state !== 'active') {
      throw new Error(`Cannot close question in state: ${question.state}`);
    }

    const closedQuestion = question.close();
    this.questions.set(closedQuestion.id, closedQuestion);
    
    this.events.onQuestionClosed?.(closedQuestion);
    
    return closedQuestion;
  }

  /**
   * Evaluate a question (transition from closed to evaluated)
   */
  async evaluateQuestion(question: Question): Promise<Question> {
    if (question.state !== 'closed') {
      throw new Error(`Cannot evaluate question in state: ${question.state}`);
    }

    try {
      // Get all user answers for this question
      const userAnswers = this.getUserAnswersForQuestion(question.id);
      
      // Create evaluation context
      const context: EvaluationContext = {
        matchId: question.matchId,
        question,
        userAnswers
      };

      // Evaluate the question
      const evaluationResult = await questionEvaluator.evaluateQuestion(context);
      
      // Update question with correct answer
      const evaluatedQuestion = question.evaluate(evaluationResult.correctAnswer);
      this.questions.set(evaluatedQuestion.id, evaluatedQuestion);
      
      // Store evaluation result
      this.storeEvaluationResult(evaluationResult);
      
      // Update user scores (in-memory only)
      this.updateUserScores(evaluationResult);
      
      this.events.onQuestionEvaluated?.(evaluatedQuestion, evaluationResult);
      
      return evaluatedQuestion;
    } catch (error) {
      console.error(`Failed to evaluate question ${question.id}:`, error);
      throw error;
    }
  }

  /**
   * Settle a question (transition from evaluated to settled)
   */
  async settleQuestion(question: Question): Promise<Question> {
    if (question.state !== 'evaluated') {
      throw new Error(`Cannot settle question in state: ${question.state}`);
    }

    const settledQuestion = question.settle();
    this.questions.set(settledQuestion.id, settledQuestion);
    
    this.events.onQuestionSettled?.(settledQuestion);
    
    return settledQuestion;
  }

  /**
   * Get questions that should be activated now
   */
  private getQuestionsToActivate(now: Date): Question[] {
    return Array.from(this.questions.values()).filter(question => 
      question.state === 'scheduled' && question.startAt <= now
    );
  }

  /**
   * Get questions that should be closed now
   */
  private getQuestionsToClose(now: Date): Question[] {
    return Array.from(this.questions.values()).filter(question => 
      question.state === 'active' && question.endAt <= now
    );
  }

  /**
   * Get questions that should be evaluated now
   */
  private getQuestionsToEvaluate(now: Date): Question[] {
    return Array.from(this.questions.values()).filter(question => 
      question.state === 'closed' && question.canEvaluate(now)
    );
  }

  /**
   * Get user answers for a specific question
   */
  private getUserAnswersForQuestion(questionId: string): UserAnswer[] {
    return this.userAnswers.get(questionId) || [];
  }

  /**
   * Store evaluation result in memory
   */
  private storeEvaluationResult(result: EvaluationResult): void {
    const questionResult = QuestionResult.create({
      questionId: result.questionId,
      correctAnswer: result.correctAnswer,
      evaluationSource: result.evaluationSource
    });

    this.questionResults.set(result.questionId, questionResult);
  }

  /**
   * Update user scores based on evaluation results (in-memory only)
   */
  private updateUserScores(result: EvaluationResult): void {
    // In-memory score tracking - could be extended to use a separate service
    console.log('User scores updated for question:', result.questionId);
    for (const userResult of result.userResults) {
      console.log(`User ${userResult.userId}: ${userResult.pointsEarned} points, correct: ${userResult.isCorrect}`);
    }
  }

  /**
   * Get active questions for a specific match
   */
  async getActiveQuestionsForMatch(matchId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.matchId === matchId && question.state === 'active')
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }

  /**
   * Get all questions for a specific match with their states
   */
  async getQuestionsForMatch(matchId: string, states?: QuestionState[]): Promise<Question[]> {
    let questions = Array.from(this.questions.values())
      .filter(question => question.matchId === matchId);

    if (states && states.length > 0) {
      questions = questions.filter(question => states.includes(question.state));
    }

    return questions.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }

  /**
   * Get questions that a user can answer (active questions they haven't answered)
   */
  async getAnswerableQuestionsForUser(userId: string, matchId: string): Promise<Question[]> {
    // Get active questions for the match
    const activeQuestions = await this.getActiveQuestionsForMatch(matchId);
    
    // Get user's existing answers
    const userAnswers = Array.from(this.userAnswers.values())
      .flat()
      .filter(answer => answer.userId === userId);
    
    const answeredQuestionIds = new Set(userAnswers.map(a => a.questionId));
    
    // Return questions the user hasn't answered
    return activeQuestions.filter(question => !answeredQuestionIds.has(question.id));
  }

  /**
   * Submit a user's answer to a question
   */
  async submitUserAnswer(userId: string, questionId: string, answerPayload: any): Promise<UserAnswer> {
    // Get the question to validate the answer
    const question = this.questions.get(questionId);
    if (!question) {
      throw new Error('Question not found');
    }
    
    // Validate the question is active
    if (!question.isActive()) {
      throw new Error('Question is not active');
    }
    
    // Validate the answer format
    if (!question.validateAnswer(answerPayload)) {
      throw new Error('Invalid answer format');
    }

    // Create user answer
    const userAnswer = UserAnswer.create({
      userId,
      questionId,
      answerPayload
    });

    // Store in memory (replace existing answer if any)
    const existingAnswers = this.userAnswers.get(questionId) || [];
    const filteredAnswers = existingAnswers.filter(a => a.userId !== userId);
    filteredAnswers.push(userAnswer);
    this.userAnswers.set(questionId, filteredAnswers);
    
    return userAnswer;
  }

  /**
   * Get user's answers for a specific match
   */
  async getUserAnswersForMatch(userId: string, matchId: string): Promise<UserAnswer[]> {
    const allAnswers = Array.from(this.userAnswers.values()).flat();
    return allAnswers.filter(answer => 
      answer.userId === userId && 
      this.questions.get(answer.questionId)?.matchId === matchId
    );
  }

  /**
   * Get question results for a specific match
   */
  async getQuestionResultsForMatch(matchId: string): Promise<QuestionResult[]> {
    const matchQuestions = Array.from(this.questions.values())
      .filter(question => question.matchId === matchId);
    
    return matchQuestions
      .map(question => this.questionResults.get(question.id))
      .filter(result => result !== undefined) as QuestionResult[];
  }

  /**
   * Clear all in-memory data (useful for testing)
   */
  clear(): void {
    this.questions.clear();
    this.userAnswers.clear();
    this.questionResults.clear();
  }

  /**
   * Get all questions (for debugging)
   */
  getAllQuestions(): Question[] {
    return Array.from(this.questions.values());
  }

  /**
   * Get all user answers (for debugging)
   */
  getAllUserAnswers(): UserAnswer[] {
    return Array.from(this.userAnswers.values()).flat();
  }
}

// Export singleton instance
export const questionLifecycle = new QuestionLifecycleService();