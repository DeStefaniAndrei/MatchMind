xport const ADDITIONAL_FEASIBLE_QUESTIONS: AdditionalQuestion[] = [
  // SHOT-RELATED QUESTIONS
  {
    id: 'shot_distance',
    text: 'Will there be a shot from outside the penalty area in the next minute?',
    category: 'shots',
    difficulty: 'medium',
    engagement: 'high',
    reasoning: 'Shot events include location data. We can filter for shots from outside the penalty area.',
    dataRequirements: ['Shot events with location data'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a shot from outside the penalty area in the next minute?',
    variations: [
      'Will there be a long-range shot in the next minute?',
      'Will there be a shot from distance in the next minute?'
    ]
  },
  {
    id: 'shot_blocked',
    text: 'Will there be a blocked shot in the next minute?',
    category: 'shots',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Shot events include information about whether they were blocked.',
    dataRequirements: ['Shot events with block information'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a blocked shot in the next minute?'
  },
  {
    id: 'shot_saved',
    text: 'Will there be a shot saved by the goalkeeper in the next minute?',
    category: 'shots',
    difficulty: 'medium',
    engagement: 'high',
    reasoning: 'Shot events include information about saves. This is exciting for users.',
    dataRequirements: ['Shot events with save information'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a shot saved by the goalkeeper in the next minute?'
  },

  // GOAL-RELATED QUESTIONS
  {
    id: 'goal_scored',
    text: 'Will there be a goal scored in the next minute?',
    category: 'goals',
    difficulty: 'easy',
    engagement: 'high',
    reasoning: 'Goal events are tracked in real-time. This is the most exciting prediction.',
    dataRequirements: ['Goal events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a goal scored in the next minute?'
  },
  {
    id: 'goal_team',
    text: 'Will team [X] score a goal in the next minute?',
    category: 'goals',
    difficulty: 'medium',
    engagement: 'high',
    reasoning: 'Goal events include team information. Team-specific goals are very engaging.',
    dataRequirements: ['Goal events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United score a goal in the next minute?'
  },
  {
    id: 'own_goal',
    text: 'Will there be an own goal in the next minute?',
    category: 'goals',
    difficulty: 'hard',
    engagement: 'high',
    reasoning: 'Own goals are tracked as special goal events. Rare but exciting.',
    dataRequirements: ['Own goal events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be an own goal in the next minute?'
  },

  // CARD-RELATED QUESTIONS
  {
    id: 'red_card',
    text: 'Will there be a red card shown in the next minute?',
    category: 'cards',
    difficulty: 'hard',
    engagement: 'high',
    reasoning: 'Red card events are tracked. Rare but very impactful.',
    dataRequirements: ['Red card events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a red card shown in the next minute?'
  },
  {
    id: 'card_team',
    text: 'Will team [X] receive a card in the next minute?',
    category: 'cards',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Card events include team information. Team-specific cards.',
    dataRequirements: ['Card events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United receive a card in the next minute?'
  },

  // SUBSTITUTION QUESTIONS
  {
    id: 'substitution',
    text: 'Will there be a substitution in the next minute?',
    category: 'substitutions',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Substitution events are tracked in real-time.',
    dataRequirements: ['Substitution events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a substitution in the next minute?'
  },
  {
    id: 'substitution_team',
    text: 'Will team [X] make a substitution in the next minute?',
    category: 'substitutions',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Substitution events include team information.',
    dataRequirements: ['Substitution events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United make a substitution in the next minute?'
  },

  // INJURY QUESTIONS
  {
    id: 'injury_stoppage',
    text: 'Will there be an injury stoppage in the next minute?',
    category: 'injuries',
    difficulty: 'hard',
    engagement: 'low',
    reasoning: 'Injury events are tracked but not very engaging for predictions.',
    dataRequirements: ['Injury events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be an injury stoppage in the next minute?'
  },

  // COMBINATION QUESTIONS
  {
    id: 'shot_and_corner',
    text: 'Will there be both a shot AND a corner in the next minute?',
    category: 'combinations',
    difficulty: 'hard',
    engagement: 'high',
    reasoning: 'Combination of two events. More challenging but engaging.',
    dataRequirements: ['Shot events', 'Corner events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be both a shot AND a corner in the next minute?'
  },
  {
    id: 'foul_and_card',
    text: 'Will there be both a foul AND a card in the next minute?',
    category: 'combinations',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Combination of foul and card events.',
    dataRequirements: ['Foul events', 'Card events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be both a foul AND a card in the next minute?'
  },

  // TIME-BASED VARIATIONS
  {
    id: 'shot_next_2_minutes',
    text: 'Will there be a shot in the next 2 minutes?',
    category: 'time_variations',
    difficulty: 'easy',
    engagement: 'medium',
    reasoning: 'Extended time window makes it easier but less exciting.',
    dataRequirements: ['Shot events over extended time'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a shot in the next 2 minutes?'
  },
  {
    id: 'goal_next_3_minutes',
    text: 'Will there be a goal in the next 3 minutes?',
    category: 'time_variations',
    difficulty: 'medium',
    engagement: 'high',
    reasoning: 'Longer time window for goals increases probability.',
    dataRequirements: ['Goal events over extended time'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a goal in the next 3 minutes?'
  },

  // SEQUENCE QUESTIONS
  {
    id: 'shot_then_corner',
    text: 'Will there be a shot followed by a corner in the next minute?',
    category: 'sequences',
    difficulty: 'hard',
    engagement: 'high',
    reasoning: 'Sequence of events. More complex but realistic.',
    dataRequirements: ['Shot events', 'Corner events', 'Event timing'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a shot followed by a corner in the next minute?'
  },

  // RARE EVENT QUESTIONS
  {
    id: 'penalty_awarded',
    text: 'Will a penalty be awarded in the next minute?',
    category: 'rare_events',
    difficulty: 'hard',
    engagement: 'high',
    reasoning: 'Penalty events are tracked. Very rare but exciting.',
    dataRequirements: ['Penalty events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will a penalty be awarded in the next minute?'
  },
  {
    id: 'var_check',
    text: 'Will there be a VAR check in the next minute?',
    category: 'rare_events',
    difficulty: 'hard',
    engagement: 'medium',
    reasoning: 'VAR events are tracked. Modern football element.',
    dataRequirements: ['VAR events'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will there be a VAR check in the next minute?'
  },

  // TEAM PERFORMANCE QUESTIONS
  {
    id: 'team_shot',
    text: 'Will team [X] have a shot in the next minute?',
    category: 'team_performance',
    difficulty: 'medium',
    engagement: 'high',
    reasoning: 'Shot events with team identification. Team-specific engagement.',
    dataRequirements: ['Shot events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United have a shot in the next minute?'
  },
  {
    id: 'team_corner',
    text: 'Will team [X] win a corner in the next minute?',
    category: 'team_performance',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Corner events with team identification.',
    dataRequirements: ['Corner events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United win a corner in the next minute?'
  },
  {
    id: 'team_foul',
    text: 'Will team [X] commit a foul in the next minute?',
    category: 'team_performance',
    difficulty: 'medium',
    engagement: 'medium',
    reasoning: 'Foul events with team identification.',
    dataRequirements: ['Foul events with team identification'],
    apiEndpoints: ['/fixtures/id/{id}/events'],
    exampleQuestion: 'Will Manchester United commit a foul in the next minute?'
  }