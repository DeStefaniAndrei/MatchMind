// Analysis of prediction questions feasibility with SportMonks API
// Based on available endpoints and data granularity

import { sportMonksAPI, LiveEvent, MatchStatistics } from './sportmonks-api'

export interface PredictionQuestion {
  id: string
  text: string
  category: 'passes' | 'shots' | 'fouls' | 'corners' | 'possession' | 'throw-ins' | 'tackles' | 'interceptions' | 'cards' | 'goals' | 'player-specific' | 'general'
  feasible: boolean
  reasoning: string
  dataRequirements: string[]
  apiEndpoints: string[]
  timeGranularity: 'minute' | 'event' | 'statistics' | 'unknown'
  exampleQuestion: string
}

export const PREDICTION_QUESTIONS: PredictionQuestion[] = [
  {
    id: 'passes_team',
    text: 'Will team [X] complete at least 8 passes in the next minute?',
    category: 'passes',
    feasible: false,
    reasoning: 'SportMonks API does not provide minute-by-minute pass statistics. Pass data is typically aggregated per match or half.',
    dataRequirements: ['Minute-by-minute pass statistics'],
    apiEndpoints: ['/fixtures/id/{id}/statistics'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Manchester United complete at least 8 passes in the next minute?'
  },
  {
    id: 'shots_next_minute',
    text: 'Will there be a shot in the next minute?',
    category: 'shots',
    feasible: true,
    reasoning: 'Shot events are tracked in real-time through the events endpoint. We can monitor for shot events within the next minute.',
    dataRequirements: ['Live match events', 'Shot event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a shot in the next minute?'
  },
  {
    id: 'fouls_next_minute',
    text: 'Will either team commit a foul in the next minute?',
    category: 'fouls',
    feasible: true,
    reasoning: 'Foul events are tracked in real-time. We can monitor for foul events within the next minute.',
    dataRequirements: ['Live match events', 'Foul event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will either team commit a foul in the next minute?'
  },
  {
    id: 'corners_next_minute',
    text: 'Will either team win a corner in the next minute?',
    category: 'corners',
    feasible: true,
    reasoning: 'Corner events are tracked in real-time. We can monitor for corner events within the next minute.',
    dataRequirements: ['Live match events', 'Corner event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will either team win a corner in the next minute?'
  },
  {
    id: 'possession_comparison',
    text: 'Will team [X] have more possession than team [Y] in the next minute?',
    category: 'possession',
    feasible: false,
    reasoning: 'Possession statistics are typically aggregated per half or match, not minute-by-minute. Real-time possession data is not available.',
    dataRequirements: ['Minute-by-minute possession statistics'],
    apiEndpoints: ['/fixtures/id/{id}/statistics'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Manchester United have more possession than Liverpool in the next minute?'
  },
  {
    id: 'throw_ins_team',
    text: 'Will team [X] win a throw-in in the next minute?',
    category: 'throw-ins',
    feasible: true,
    reasoning: 'Throw-in events are tracked in real-time. We can monitor for throw-in events for specific teams.',
    dataRequirements: ['Live match events', 'Throw-in event detection', 'Team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will Manchester United win a throw-in in the next minute?'
  },
  {
    id: 'tackles_team',
    text: 'Will team [X] make a tackle in the next minute?',
    category: 'tackles',
    feasible: false,
    reasoning: 'Tackle statistics are typically aggregated and not available minute-by-minute. Individual tackle events are not tracked.',
    dataRequirements: ['Minute-by-minute tackle statistics'],
    apiEndpoints: ['/fixtures/id/{id}/statistics'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Manchester United make a tackle in the next minute?'
  },
  {
    id: 'possession_loss',
    text: 'Will team [X] lose possession in their own half in the next minute?',
    category: 'possession',
    feasible: false,
    reasoning: 'Possession loss events are not specifically tracked in the API. This would require detailed ball possession tracking.',
    dataRequirements: ['Possession loss events', 'Field position data'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Manchester United lose possession in their own half in the next minute?'
  },
  {
    id: 'player_touch_ball',
    text: 'Will player [A] touch the ball in the next minute?',
    category: 'player-specific',
    feasible: false,
    reasoning: 'Individual player ball touches are not tracked in the API. Player statistics are aggregated per match.',
    dataRequirements: ['Player-specific ball touch events'],
    apiEndpoints: ['/fixtures/id/{id}/players/{player_id}'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Bruno Fernandes touch the ball in the next minute?'
  },
  {
    id: 'player_pass_attempt',
    text: 'Will player [A] attempt a pass in the next minute?',
    category: 'player-specific',
    feasible: false,
    reasoning: 'Individual player pass attempts are not tracked minute-by-minute. Player statistics are aggregated.',
    dataRequirements: ['Player-specific pass attempt events'],
    apiEndpoints: ['/fixtures/id/{id}/players/{player_id}'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Bruno Fernandes attempt a pass in the next minute?'
  },
  {
    id: 'interceptions_team',
    text: 'Will a player from team [X] intercept a pass in the next minute?',
    category: 'interceptions',
    feasible: false,
    reasoning: 'Interception events are not specifically tracked in the API. This would require detailed pass tracking.',
    dataRequirements: ['Interception events', 'Pass tracking'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will a Manchester United player intercept a pass in the next minute?'
  },
  {
    id: 'player_pass_receive',
    text: 'Will player [A] receive a pass in the attacking third in the next minute?',
    category: 'player-specific',
    feasible: false,
    reasoning: 'Player-specific pass receiving events are not tracked, especially with field position data.',
    dataRequirements: ['Player-specific pass receiving events', 'Field position data'],
    apiEndpoints: ['/fixtures/id/{id}/players/{player_id}'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will Bruno Fernandes receive a pass in the attacking third in the next minute?'
  },
  {
    id: 'throw_ins_general',
    text: 'Will there be a throw-in in the next minute?',
    category: 'throw-ins',
    feasible: true,
    reasoning: 'Throw-in events are tracked in real-time. We can monitor for any throw-in events.',
    dataRequirements: ['Live match events', 'Throw-in event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a throw-in in the next minute?'
  },
  {
    id: 'fouls_general',
    text: 'Will there be a foul in the next minute?',
    category: 'fouls',
    feasible: true,
    reasoning: 'Foul events are tracked in real-time. We can monitor for any foul events.',
    dataRequirements: ['Live match events', 'Foul event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a foul in the next minute?'
  },
  {
    id: 'corners_general',
    text: 'Will there be a corner kick in the next minute?',
    category: 'corners',
    feasible: true,
    reasoning: 'Corner events are tracked in real-time. We can monitor for any corner events.',
    dataRequirements: ['Live match events', 'Corner event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a corner kick in the next minute?'
  },
  {
    id: 'yellow_cards',
    text: 'Will there be a yellow card shown in the next minute?',
    category: 'cards',
    feasible: true,
    reasoning: 'Card events (yellow/red) are tracked in real-time. We can monitor for yellow card events.',
    dataRequirements: ['Live match events', 'Card event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a yellow card shown in the next minute?'
  },
  {
    id: 'shots_on_target',
    text: 'Will there be a shot on target in the next minute?',
    category: 'shots',
    feasible: true,
    reasoning: 'Shot events include information about whether they are on target. We can monitor for shots on target.',
    dataRequirements: ['Live match events', 'Shot on target detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a shot on target in the next minute?'
  },
  {
    id: 'goal_kicks',
    text: 'Will there be a goal kick in the next minute?',
    category: 'goals',
    feasible: true,
    reasoning: 'Goal kick events are tracked in real-time. We can monitor for goal kick events.',
    dataRequirements: ['Live match events', 'Goal kick event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will there be a goal kick in the next minute?'
  },
  {
    id: 'ball_out_of_play',
    text: 'Will the ball go out of play in the next minute?',
    category: 'general',
    feasible: true,
    reasoning: 'Ball out of play events (throw-ins, goal kicks, corners) are tracked. We can monitor for any of these events.',
    dataRequirements: ['Live match events', 'Ball out of play event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will the ball go out of play in the next minute?'
  },
  {
    id: 'attacking_touches',
    text: 'Will both teams have at least one touch in the attacking third in the next minute?',
    category: 'general',
    feasible: false,
    reasoning: 'Individual touches and field position data are not available in the API. This would require detailed tracking.',
    dataRequirements: ['Touch events', 'Field position data'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will both teams have at least one touch in the attacking third in the next minute?'
  },
  {
    id: 'completed_passes',
    text: 'Will there be at least 3 completed passes by either team in the next minute?',
    category: 'passes',
    feasible: false,
    reasoning: 'Minute-by-minute pass statistics are not available. Pass data is aggregated per match or half.',
    dataRequirements: ['Minute-by-minute pass statistics'],
    apiEndpoints: ['/fixtures/id/{id}/statistics'],
    timeGranularity: 'unknown',
    exampleQuestion: 'Will there be at least 3 completed passes by either team in the next minute?'
  },
  {
    id: 'referee_stops',
    text: 'Will the referee stop play for any reason in the next minute?',
    category: 'general',
    feasible: true,
    reasoning: 'Referee stops (fouls, cards, injuries, VAR checks) are tracked as events. We can monitor for these events.',
    dataRequirements: ['Live match events', 'Referee stop event detection'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    timeGranularity: 'event',
    exampleQuestion: 'Will the referee stop play for any reason in the next minute?'
  }
]

// Filter feasible questions
export const FEASIBLE_QUESTIONS = PREDICTION_QUESTIONS.filter(q => q.feasible)

// Group questions by category
export const QUESTIONS_BY_CATEGORY = FEASIBLE_QUESTIONS.reduce((acc, question) => {
  if (!acc[question.category]) {
    acc[question.category] = []
  }
  acc[question.category].push(question)
  return acc
}, {} as Record<string, PredictionQuestion[]>)

// Get questions by category
export function getQuestionsByCategory(category: string): PredictionQuestion[] {
  return QUESTIONS_BY_CATEGORY[category] || []
}

// Get all feasible questions
export function getFeasibleQuestions(): PredictionQuestion[] {
  return FEASIBLE_QUESTIONS
}

// Get question by ID
export function getQuestionById(id: string): PredictionQuestion | undefined {
  return PREDICTION_QUESTIONS.find(q => q.id === id)
} 