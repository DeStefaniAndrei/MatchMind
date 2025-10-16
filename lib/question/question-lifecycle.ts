/**
 * Question Lifecycle Service
 * 
 * This service manages the lifecycle of questions, including state transitions,
 * timing, and evaluation orchestration.
 */

import { Question, QuestionState, UserAnswer, QuestionResult } from './question-domain';
import { questionEvaluator, EvaluationContext, EvaluationResult } from './question-evaluator';
import { supabase } from '../supabaseClient';

export interface QuestionLifecycleEvents {
  onQuestionActivated?: (question: Question) => void;
  onQuestionClosed?: (question: Question) => void;
  onQuestionEvaluated?: (question: Question, result: EvaluationResult) => void;
  onQuestionSettled?: (question: Question) => void;
}

/**
 * Question Lifecycle Service
 * Handles state transitions, timing, and evaluation of questions
 */
export class QuestionLifecycleService {
  private events: QuestionLifecycleEvents = {};

  constructor(events?: QuestionLifecycleEvents) {
    if (events) {
      this.events = events;
    }
  }

  /**
   * Process questions that need state transitions based on current time
   */
  async processScheduledQuestions(now: Date = new Date()): Promise<void> {
    try {
      // Find questions that should be activated
      const questionsToActivate = await this.getQuestionsToActivate(now);
      for (const question of questionsToActivate) {
        await this.activateQuestion(question);
      }

      // Find questions that should be closed
      const questionsToClose = await this.getQuestionsToClose(now);
      for (const question of questionsToClose) {
        await this.closeQuestion(question);
      }

      // Find questions that should be evaluated
      const questionsToEvaluate = await this.getQuestionsToEvaluate(now);
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
    await this.updateQuestionInDatabase(activatedQuestion);
    
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
    await this.updateQuestionInDatabase(closedQuestion);
    
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
      const userAnswers = await this.getUserAnswersForQuestion(question.id);
      
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
      await this.updateQuestionInDatabase(evaluatedQuestion);
      
      // Store evaluation result
      await this.storeEvaluationResult(evaluationResult);
      
      // Update user scores
      await this.updateUserScores(evaluationResult);
      
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
    await this.updateQuestionInDatabase(settledQuestion);
    
    this.events.onQuestionSettled?.(settledQuestion);
    
    return settledQuestion;
  }

  /**
   * Get questions that should be activated now
   */
  private async getQuestionsToActivate(now: Date): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('state', 'scheduled')
      .lte('start_at', now.toISOString());

    if (error) throw error;
    
    return data.map(row => Question.fromDatabaseRow(row));
  }

  /**
   * Get questions that should be closed now
   */
  private async getQuestionsToClose(now: Date): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('state', 'active')
      .lte('end_at', now.toISOString());

    if (error) throw error;
    
    return data.map(row => Question.fromDatabaseRow(row));
  }

  /**
   * Get questions that should be evaluated now
   */
  private async getQuestionsToEvaluate(now: Date): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('state', 'closed');

    if (error) throw error;
    
    const questions = data.map(row => Question.fromDatabaseRow(row));
    
    // Filter questions that can be evaluated (past grace period)
    return questions.filter(question => question.canEvaluate(now));
  }

  /**
   * Get user answers for a specific question
   */
  private async getUserAnswersForQuestion(questionId: string): Promise<UserAnswer[]> {
    const { data, error } = await supabase
      .from('user_answers')
      .select('*')
      .eq('question_id', questionId);

    if (error) throw error;
    
    return data.map(row => UserAnswer.fromDatabaseRow(row));
  }

  /**
   * Update question in database
   */
  private async updateQuestionInDatabase(question: Question): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .update({
        state: question.state,
        correct_answer: question.correctAnswer,
        updated_at: new Date().toISOString()
      })
      .eq('id', question.id);

    if (error) throw error;
  }

  /**
   * Store evaluation result in database
   */
  private async storeEvaluationResult(result: EvaluationResult): Promise<void> {
    const questionResult = QuestionResult.create({
      questionId: result.questionId,
      correctAnswer: result.correctAnswer,
      evaluationSource: result.evaluationSource
    });

    const { error } = await supabase
      .from('question_results')
      .insert({
        id: questionResult.id,
        question_id: questionResult.questionId,
        correct_answer: questionResult.correctAnswer,
        evaluation_source: questionResult.evaluationSource,
        evaluated_at: questionResult.evaluatedAt.toISOString()
      });

    if (error) throw error;
  }

  /**
   * Update user scores based on evaluation results
   */
  private async updateUserScores(result: EvaluationResult): Promise<void> {
    // Update leaderboard scores
    for (const userResult of result.userResults) {
      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: userResult.userId,
          match_id: result.questionId, // This should be match_id, not question_id
          score: userResult.pointsEarned,
          total_points: userResult.pointsEarned,
          correct_predictions: userResult.isCorrect ? 1 : 0,
          total_predictions: 1
        }, {
          onConflict: 'user_id,match_id'
        });

      if (error) {
        console.error('Failed to update user score:', error);
      }
    }
  }

  /**
   * Get active questions for a specific match
   */
  async getActiveQuestionsForMatch(matchId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('match_id', matchId)
      .eq('state', 'active')
      .order('start_at', { ascending: true });

    if (error) throw error;
    
    return data.map(row => Question.fromDatabaseRow(row));
  }

  /**
   * Get all questions for a specific match with their states
   */
  async getQuestionsForMatch(matchId: string, states?: QuestionState[]): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('match_id', matchId);

    if (states && states.length > 0) {
      query = query.in('state', states);
    }

    query = query.order('start_at', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    
    return data.map(row => Question.fromDatabaseRow(row));
  }

  /**
   * Get questions that a user can answer (active questions they haven't answered)
   */
  async getAnswerableQuestionsForUser(userId: string, matchId: string): Promise<Question[]> {
    // Get active questions for the match
    const activeQuestions = await this.getActiveQuestionsForMatch(matchId);
    
    // Get user's existing answers
    const { data: userAnswers, error } = await supabase
      .from('user_answers')
      .select('question_id')
      .eq('user_id', userId)
      .in('question_id', activeQuestions.map(q => q.id));

    if (error) throw error;
    
    const answeredQuestionIds = new Set(userAnswers.map(a => a.question_id));
    
    // Return questions the user hasn't answered
    return activeQuestions.filter(question => !answeredQuestionIds.has(question.id));
  }

  /**
   * Submit a user's answer to a question
   */
  async submitUserAnswer(userId: string, questionId: string, answerPayload: any): Promise<UserAnswer> {
    // Get the question to validate the answer
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;
    
    const question = Question.fromDatabaseRow(questionData);
    
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

    // Store in database (upsert to allow updates)
    const { error } = await supabase
      .from('user_answers')
      .upsert({
        id: userAnswer.id,
        user_id: userAnswer.userId,
        question_id: userAnswer.questionId,
        answer_payload: userAnswer.answerPayload,
        submitted_at: userAnswer.submittedAt.toISOString()
      }, {
        onConflict: 'user_id,question_id'
      });

    if (error) throw error;
    
    return userAnswer;
  }

  /**
   * Get user's answers for a specific match
   */
  async getUserAnswersForMatch(userId: string, matchId: string): Promise<UserAnswer[]> {
    const { data, error } = await supabase
      .from('user_answers')
      .select(`
        *,
        questions!inner(match_id)
      `)
      .eq('user_id', userId)
      .eq('questions.match_id', matchId);

    if (error) throw error;
    
    return data.map(row => UserAnswer.fromDatabaseRow(row));
  }

  /**
   * Get question results for a specific match
   */
  async getQuestionResultsForMatch(matchId: string): Promise<QuestionResult[]> {
    const { data, error } = await supabase
      .from('question_results')
      .select(`
        *,
        questions!inner(match_id)
      `)
      .eq('questions.match_id', matchId);

    if (error) throw error;
    
    return data.map(row => QuestionResult.fromDatabaseRow(row));
  }
}

// Export singleton instance
export const questionLifecycle = new QuestionLifecycleService();
