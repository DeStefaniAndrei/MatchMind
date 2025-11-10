/**
 * Question Scheduler Service
 * 
 * This service handles the scheduling and processing of question lifecycle events.
 * It can be used independently or integrated with the match monitor.
 */

import { questionLifecycle } from './question-lifecycle';

export interface SchedulerConfig {
  intervalMs?: number;
  enableLogging?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Question Scheduler Service
 * Handles periodic processing of question lifecycle events
 */
export class QuestionScheduler {
  private interval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private config: Required<SchedulerConfig>;

  constructor(config: SchedulerConfig = {}) {
    this.config = {
      intervalMs: config.intervalMs || 30000, // 30 seconds default
      enableLogging: config.enableLogging ?? true,
      onError: config.onError || ((error: Error) => {
        console.error('Question scheduler error:', error);
      })
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      this.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.log(`Starting question scheduler with ${this.config.intervalMs}ms interval`);

    // Process immediately on start
    this.processQuestions();

    // Set up interval
    this.interval = setInterval(() => {
      this.processQuestions();
    }, this.config.intervalMs);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('Scheduler is not running');
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    this.log('Question scheduler stopped');
  }

  /**
   * Process questions manually
   */
  async processQuestions(): Promise<void> {
    try {
      this.log('Processing question lifecycle...');
      await questionLifecycle.processScheduledQuestions();
      this.log('Question lifecycle processed successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.config.onError(err);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    intervalMs: number;
    nextProcessTime?: Date;
  } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.config.intervalMs,
      nextProcessTime: this.isRunning ? new Date(Date.now() + this.config.intervalMs) : undefined
    };
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }

    this.config = {
      ...this.config,
      ...newConfig
    };

    if (wasRunning) {
      this.start();
    }
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[QuestionScheduler] ${message}`);
    }
  }
}

// Export singleton instance
export const questionScheduler = new QuestionScheduler({
  intervalMs: 30000, // 30 seconds
  enableLogging: true
});

// Auto-start the scheduler if this module is imported
if (typeof window === 'undefined') {
  // Only auto-start in server environment
  questionScheduler.start();
}
