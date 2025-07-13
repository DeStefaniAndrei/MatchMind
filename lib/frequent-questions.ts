// Frequent and exciting questions for MatchMind dApp
// Focused on events that happen regularly throughout matches
// Avoiding rare events that users would all predict the same way

export interface FrequentQuestion {
  id: string
  text: string
  category: string
  frequency: 'very_high' | 'high' | 'medium' // How often this event occurs
  excitement: 'very_high' | 'high' | 'medium' // How exciting it is for users
  reasoning: string
  dataRequirements: string[]
  apiEndpoints: string[]
  variations?: string[]
}

export const FREQUENT_EXCITING_QUESTIONS: FrequentQuestion[] = [
  // SHOTS - Very frequent and exciting
  {
    id: 'any_shot',
    text: 'Will there be a shot in the next minute?',
    category: 'shots',
    frequency: 'very_high',
    excitement: 'high',
    reasoning: 'Shots happen frequently throughout matches. Users can realistically predict this.',
    dataRequirements: ['Shot events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    variations: [
      'Will there be a shot attempt in the next minute?',
      'Will a player take a shot in the next minute?'
    ]
  },
  {
    id: 'shot_on_target',
    text: 'Will there be a shot on target in the next minute?',
    category: 'shots',
    frequency: 'high',
    excitement: 'very_high',
    reasoning: 'Shots on target are more exciting than off-target shots.',
    dataRequirements: ['Shot events with on-target information'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_shot',
    text: 'Will [TEAM] have a shot in the next minute?',
    category: 'shots',
    frequency: 'high',
    excitement: 'high',
    reasoning: 'Team-specific shots create fan engagement.',
    dataRequirements: ['Shot events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // CORNERS - Very frequent
  {
    id: 'any_corner',
    text: 'Will there be a corner in the next minute?',
    category: 'corners',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Corners happen very frequently. Easy to predict.',
    dataRequirements: ['Corner events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_corner',
    text: 'Will [TEAM] win a corner in the next minute?',
    category: 'corners',
    frequency: 'high',
    excitement: 'medium',
    reasoning: 'Team-specific corners for fan engagement.',
    dataRequirements: ['Corner events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // FOULS - Very frequent
  {
    id: 'any_foul',
    text: 'Will there be a foul in the next minute?',
    category: 'fouls',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Fouls happen constantly. Very predictable.',
    dataRequirements: ['Foul events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_foul',
    text: 'Will [TEAM] commit a foul in the next minute?',
    category: 'fouls',
    frequency: 'high',
    excitement: 'medium',
    reasoning: 'Team-specific fouls.',
    dataRequirements: ['Foul events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // THROW-INS - Extremely frequent
  {
    id: 'any_throw_in',
    text: 'Will there be a throw-in in the next minute?',
    category: 'throw_ins',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Throw-ins happen constantly. Very frequent event.',
    dataRequirements: ['Throw-in events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_throw_in',
    text: 'Will [TEAM] have a throw-in in the next minute?',
    category: 'throw_ins',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Team-specific throw-ins.',
    dataRequirements: ['Throw-in events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // FREE KICKS - Frequent
  {
    id: 'any_free_kick',
    text: 'Will there be a free kick in the next minute?',
    category: 'free_kicks',
    frequency: 'high',
    excitement: 'medium',
    reasoning: 'Free kicks happen regularly after fouls.',
    dataRequirements: ['Free kick events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_free_kick',
    text: 'Will [TEAM] have a free kick in the next minute?',
    category: 'free_kicks',
    frequency: 'high',
    excitement: 'medium',
    reasoning: 'Team-specific free kicks.',
    dataRequirements: ['Free kick events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // CARDS - Frequent enough to be exciting
  {
    id: 'any_card',
    text: 'Will there be a card (yellow or red) in the next minute?',
    category: 'cards',
    frequency: 'medium',
    excitement: 'high',
    reasoning: 'Cards happen regularly but not too frequently. Good balance.',
    dataRequirements: ['Card events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'yellow_card',
    text: 'Will there be a yellow card in the next minute?',
    category: 'cards',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Yellow cards are more frequent than red cards.',
    dataRequirements: ['Yellow card events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_card',
    text: 'Will [TEAM] receive a card in the next minute?',
    category: 'cards',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Team-specific cards.',
    dataRequirements: ['Card events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // GOALS - Rare but most exciting
  {
    id: 'any_goal',
    text: 'Will there be a goal in the next minute?',
    category: 'goals',
    frequency: 'medium',
    excitement: 'very_high',
    reasoning: 'Goals are rare but the most exciting prediction.',
    dataRequirements: ['Goal events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_goal',
    text: 'Will [TEAM] score a goal in the next minute?',
    category: 'goals',
    frequency: 'medium',
    excitement: 'very_high',
    reasoning: 'Team-specific goals are very engaging.',
    dataRequirements: ['Goal events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // SUBSTITUTIONS - Regular but not too frequent
  {
    id: 'any_substitution',
    text: 'Will there be a substitution in the next minute?',
    category: 'substitutions',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Substitutions happen regularly but not constantly.',
    dataRequirements: ['Substitution events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_substitution',
    text: 'Will [TEAM] make a substitution in the next minute?',
    category: 'substitutions',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Team-specific substitutions.',
    dataRequirements: ['Substitution events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // COMBINATION QUESTIONS - More complex but engaging
  {
    id: 'shot_and_corner',
    text: 'Will there be both a shot AND a corner in the next minute?',
    category: 'combinations',
    frequency: 'medium',
    excitement: 'high',
    reasoning: 'Combination of two frequent events. More challenging.',
    dataRequirements: ['Shot events', 'Corner events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'foul_and_card',
    text: 'Will there be both a foul AND a card in the next minute?',
    category: 'combinations',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Foul often leads to cards. Realistic combination.',
    dataRequirements: ['Foul events', 'Card events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'shot_and_foul',
    text: 'Will there be both a shot AND a foul in the next minute?',
    category: 'combinations',
    frequency: 'high',
    excitement: 'medium',
    reasoning: 'Both events happen frequently. Good combination.',
    dataRequirements: ['Shot events', 'Foul events'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // TIME VARIATIONS - Different time windows
  {
    id: 'shot_next_2_minutes',
    text: 'Will there be a shot in the next 2 minutes?',
    category: 'time_variations',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Longer time window makes it easier to predict.',
    dataRequirements: ['Shot events over extended time'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'corner_next_2_minutes',
    text: 'Will there be a corner in the next 2 minutes?',
    category: 'time_variations',
    frequency: 'very_high',
    excitement: 'medium',
    reasoning: 'Longer time window for frequent event.',
    dataRequirements: ['Corner events over extended time'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'goal_next_3_minutes',
    text: 'Will there be a goal in the next 3 minutes?',
    category: 'time_variations',
    frequency: 'medium',
    excitement: 'very_high',
    reasoning: 'Longer time window for rare but exciting event.',
    dataRequirements: ['Goal events over extended time'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // SEQUENCE QUESTIONS - More complex predictions
  {
    id: 'shot_then_corner',
    text: 'Will there be a shot followed by a corner in the next minute?',
    category: 'sequences',
    frequency: 'medium',
    excitement: 'high',
    reasoning: 'Realistic sequence: shot goes wide, leads to corner.',
    dataRequirements: ['Shot events', 'Corner events', 'Event timing'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'foul_then_card',
    text: 'Will there be a foul followed by a card in the next minute?',
    category: 'sequences',
    frequency: 'medium',
    excitement: 'medium',
    reasoning: 'Realistic sequence: foul leads to card.',
    dataRequirements: ['Foul events', 'Card events', 'Event timing'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },

  // TEAM PERFORMANCE - Fan engagement
  {
    id: 'team_shot_on_target',
    text: 'Will [TEAM] have a shot on target in the next minute?',
    category: 'team_performance',
    frequency: 'medium',
    excitement: 'high',
    reasoning: 'Team-specific shots on target are very engaging.',
    dataRequirements: ['Shot events with team identification and on-target info'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  },
  {
    id: 'team_free_kick_goal',
    text: 'Will [TEAM] score from a free kick in the next minute?',
    category: 'team_performance',
    frequency: 'low',
    excitement: 'very_high',
    reasoning: 'Rare but very exciting team-specific event.',
    dataRequirements: ['Free kick events', 'Goal events', 'Team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events']
  }
]

// Filter by frequency and excitement
export const VERY_FREQUENT_QUESTIONS = FREQUENT_EXCITING_QUESTIONS.filter(q => q.frequency === 'very_high')
export const HIGH_FREQUENCY_QUESTIONS = FREQUENT_EXCITING_QUESTIONS.filter(q => q.frequency === 'high' || q.frequency === 'very_high')
export const VERY_EXCITING_QUESTIONS = FREQUENT_EXCITING_QUESTIONS.filter(q => q.excitement === 'very_high')
export const HIGH_EXCITEMENT_QUESTIONS = FREQUENT_EXCITING_QUESTIONS.filter(q => q.excitement === 'high' || q.excitement === 'very_high')

// Get questions by category
export function getQuestionsByCategory(category: string): FrequentQuestion[] {
  return FREQUENT_EXCITING_QUESTIONS.filter(q => q.category === category)
}

// Get recommended questions for the game (high frequency + high excitement)
export function getRecommendedQuestions(): FrequentQuestion[] {
  return FREQUENT_EXCITING_QUESTIONS.filter(q => 
    (q.frequency === 'very_high' || q.frequency === 'high') && 
    (q.excitement === 'high' || q.excitement === 'very_high')
  )
}

// Get starter questions (very frequent, medium excitement)
export function getStarterQuestions(): FrequentQuestion[] {
  return FREQUENT_EXCITING_QUESTIONS.filter(q => 
    q.frequency === 'very_high' && q.excitement === 'medium'
  )
}

// Get advanced questions (medium frequency, very high excitement)
export function getAdvancedQuestions(): FrequentQuestion[] {
  return FREQUENT_EXCITING_QUESTIONS.filter(q => 
    q.frequency === 'medium' && q.excitement === 'very_high'
  )
}

// Get all frequent questions
export function getAllFrequentQuestions(): FrequentQuestion[] {
  return FREQUENT_EXCITING_QUESTIONS
} 