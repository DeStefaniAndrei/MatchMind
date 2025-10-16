/**
 * Question Domain Classes
 * 
 * This file contains the core domain objects for the AI predicted questions system.
 * It follows OOP principles with clear separation of concerns and lifecycle management.
 */

export type QuestionState = 'draft' | 'scheduled' | 'active' | 'closed' | 'evaluated' | 'settled';
export type QuestionType = 'boolean' | 'multiple_choice' | 'numeric' | 'text' | 'time_bound';

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number | boolean;
}

export interface EvaluationRule {
  type: QuestionType;
  source: 'api' | 'manual' | 'derived';  config: Record<string, any>;
  tolerance?: number; // For numeric questions
}

export interface QuestionMetadata {
  aiConfidence?: number;
  generatedAt?: string;
  source?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  answerPayload: any;
  submittedAt: Date;
}

export interface QuestionResult {
  id: string;
  questionId: string;
  correctAnswer: any;
  evaluationSource: string;
  evaluatedAt: Date;
}

/**
 * Core Question domain class
 * Encapsulates question identity, timing, state, and evaluation rules
 */
export class Question {
  public readonly id: string;
  public readonly matchId: string;
  public readonly text: string;
  public readonly options: QuestionOption[];
  public readonly questionType: QuestionType;
  public readonly points: number;
  public readonly startAt: Date;
  public readonly endAt: Date;
  public readonly graceSeconds: number;
  public readonly evaluationRule: EvaluationRule;
  public readonly metadata: QuestionMetadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  
  private _state: QuestionState;
  private _correctAnswer?: any;

  constructor(data: {
    id: string;
    matchId: string;
    text: string;
    options: QuestionOption[];
    questionType: QuestionType;
    points: number;
    startAt: Date;
    endAt: Date;
    graceSeconds: number;
    evaluationRule: EvaluationRule;
    metadata: QuestionMetadata;
    state: QuestionState;
    correctAnswer?: any;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.matchId = data.matchId;
    this.text = data.text;
    this.options = data.options;
    this.questionType = data.questionType;
    this.points = data.points;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.graceSeconds = data.graceSeconds;
    this.evaluationRule = data.evaluationRule;
    this.metadata = data.metadata;
    this._state = data.state;
    this._correctAnswer = data.correctAnswer;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // State getter
  get state(): QuestionState {
    return this._state;
  }

  // Correct answer getter
  get correctAnswer(): any {
    return this._correctAnswer;
  }

  // Timing methods
  isActive(now: Date = new Date()): boolean {
    return this._state === 'active' && now >= this.startAt && now <= this.endAt;
  }

  isClosed(now: Date = new Date()): boolean {
    return this._state === 'closed' || now > this.endAt;
  }

  canEvaluate(now: Date = new Date()): boolean {
    return this._state === 'closed' && now >= new Date(this.endAt.getTime() + this.graceSeconds * 1000);
  }

  isScheduled(now: Date = new Date()): boolean {
    return this._state === 'scheduled' && now < this.startAt;
  }

  isDraft(): boolean {
    return this._state === 'draft';
  }

  isEvaluated(): boolean {
    return this._state === 'evaluated' || this._state === 'settled';
  }

  // State transition methods
  activate(): Question {
    if (this._state !== 'scheduled') {
      throw new Error(`Cannot activate question in state: ${this._state}`);
    }
    return this.clone({ state: 'active' });
  }

  close(): Question {
    if (this._state !== 'active') {
      throw new Error(`Cannot close question in state: ${this._state}`);
    }
    return this.clone({ state: 'closed' });
  }

  evaluate(correctAnswer: any): Question {
    if (this._state !== 'closed') {
      throw new Error(`Cannot evaluate question in state: ${this._state}`);
    }
    return this.clone({ 
      state: 'evaluated',
      correctAnswer 
    });
  }

  settle(): Question {
    if (this._state !== 'evaluated') {
      throw new Error(`Cannot settle question in state: ${this._state}`);
    }
    return this.clone({ state: 'settled' });
  }

  // Validation methods
  validateAnswer(answer: any): boolean {
    switch (this.questionType) {
      case 'boolean':
        return typeof answer === 'boolean';
      case 'multiple_choice':
        return this.options.some(opt => opt.value === answer);
      case 'numeric':
        return typeof answer === 'number' && !isNaN(answer);
      case 'text':
        return typeof answer === 'string' && answer.trim().length > 0;
      case 'time_bound':
        return typeof answer === 'string' || typeof answer === 'number';
      default:
        return false;
    }
  }

  // Utility methods
  getTimeRemaining(now: Date = new Date()): number {
    if (this._state !== 'active') return 0;
    return Math.max(0, this.endAt.getTime() - now.getTime());
  }

  getTimeUntilStart(now: Date = new Date()): number {
    if (this._state !== 'scheduled') return 0;
    return Math.max(0, this.startAt.getTime() - now.getTime());
  }

  // Convert to DTO for API transport
  toDTO(): any {
    return {
      id: this.id,
      matchId: this.matchId,
      text: this.text,
      options: this.options,
      questionType: this.questionType,
      points: this.points,
      startAt: this.startAt.toISOString(),
      endAt: this.endAt.toISOString(),
      graceSeconds: this.graceSeconds,
      evaluationRule: this.evaluationRule,
      metadata: this.metadata,
      state: this._state,
      correctAnswer: this._correctAnswer,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      timeRemaining: this.getTimeRemaining(),
      timeUntilStart: this.getTimeUntilStart(),
      isActive: this.isActive(),
      isClosed: this.isClosed(),
      canEvaluate: this.canEvaluate()
    };
  }

  // Clone with new properties
  private clone(updates: Partial<{
    state: QuestionState;
    correctAnswer: any;
    updatedAt: Date;
  }>): Question {
    return new Question({
      id: this.id,
      matchId: this.matchId,
      text: this.text,
      options: this.options,
      questionType: this.questionType,
      points: this.points,
      startAt: this.startAt,
      endAt: this.endAt,
      graceSeconds: this.graceSeconds,
      evaluationRule: this.evaluationRule,
      metadata: this.metadata,
      state: updates.state || this._state,
      correctAnswer: updates.correctAnswer !== undefined ? updates.correctAnswer : this._correctAnswer,
      createdAt: this.createdAt,
      updatedAt: updates.updatedAt || new Date()
    });
  }

  // Static factory method from database row
  static fromDatabaseRow(row: any): Question {
    return new Question({
      id: row.id,
      matchId: row.match_id,
      text: row.text,
      options: row.options || [],
      questionType: row.question_type || 'multiple_choice',
      points: row.points || 10,
      startAt: new Date(row.start_at),
      endAt: new Date(row.end_at),
      graceSeconds: row.grace_seconds || 30,
      evaluationRule: row.evaluation_rule || { type: 'multiple_choice', source: 'manual', config: {} },
      metadata: row.metadata || {},
      state: row.state || 'draft',
      correctAnswer: row.correct_answer,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  // Static factory method for creating new questions
  static create(data: {
    matchId: string;
    text: string;
    options: QuestionOption[];
    questionType: QuestionType;
    points?: number;
    startAt: Date;
    endAt: Date;
    graceSeconds?: number;
    evaluationRule: EvaluationRule;
    metadata?: QuestionMetadata;
  }): Question {
    const now = new Date();
    return new Question({
      id: crypto.randomUUID(),
      matchId: data.matchId,
      text: data.text,
      options: data.options,
      questionType: data.questionType,
      points: data.points || 10,
      startAt: data.startAt,
      endAt: data.endAt,
      graceSeconds: data.graceSeconds || 30,
      evaluationRule: data.evaluationRule,
      metadata: data.metadata || {},
      state: 'draft',
      createdAt: now,
      updatedAt: now
    });
  }
}

/**
 * UserAnswer domain class
 * Represents a user's answer to a question
 */
export class UserAnswer {
  public readonly id: string;
  public readonly userId: string;
  public readonly questionId: string;
  public readonly answerPayload: any;
  public readonly submittedAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    questionId: string;
    answerPayload: any;
    submittedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.questionId = data.questionId;
    this.answerPayload = data.answerPayload;
    this.submittedAt = data.submittedAt;
  }

  // Convert to DTO
  toDTO(): any {
    return {
      id: this.id,
      userId: this.userId,
      questionId: this.questionId,
      answerPayload: this.answerPayload,
      submittedAt: this.submittedAt.toISOString()
    };
  }

  // Static factory from database row
  static fromDatabaseRow(row: any): UserAnswer {
    return new UserAnswer({
      id: row.id,
      userId: row.user_id,
      questionId: row.question_id,
      answerPayload: row.answer_payload,
      submittedAt: new Date(row.submitted_at)
    });
  }

  // Static factory for creating new answers
  static create(data: {
    userId: string;
    questionId: string;
    answerPayload: any;
  }): UserAnswer {
    return new UserAnswer({
      id: crypto.randomUUID(),
      userId: data.userId,
      questionId: data.questionId,
      answerPayload: data.answerPayload,
      submittedAt: new Date()
    });
  }
}

/**
 * QuestionResult domain class
 * Represents the evaluation result of a question
 */
export class QuestionResult {
  public readonly id: string;
  public readonly questionId: string;
  public readonly correctAnswer: any;
  public readonly evaluationSource: string;
  public readonly evaluatedAt: Date;

  constructor(data: {
    id: string;
    questionId: string;
    correctAnswer: any;
    evaluationSource: string;
    evaluatedAt: Date;
  }) {
    this.id = data.id;
    this.questionId = data.questionId;
    this.correctAnswer = data.correctAnswer;
    this.evaluationSource = data.evaluationSource;
    this.evaluatedAt = data.evaluatedAt;
  }

  // Convert to DTO
  toDTO(): any {
    return {
      id: this.id,
      questionId: this.questionId,
      correctAnswer: this.correctAnswer,
      evaluationSource: this.evaluationSource,
      evaluatedAt: this.evaluatedAt.toISOString()
    };
  }

  // Static factory from database row
  static fromDatabaseRow(row: any): QuestionResult {
    return new QuestionResult({
      id: row.id,
      questionId: row.question_id,
      correctAnswer: row.correct_answer,
      evaluationSource: row.evaluation_source,
      evaluatedAt: new Date(row.evaluated_at)
    });
  }

  // Static factory for creating new results
  static create(data: {
    questionId: string;
    correctAnswer: any;
    evaluationSource: string;
  }): QuestionResult {
    return new QuestionResult({
      id: crypto.randomUUID(),
      questionId: data.questionId,
      correctAnswer: data.correctAnswer,
      evaluationSource: data.evaluationSource,
      evaluatedAt: new Date()
    });
  }
}
