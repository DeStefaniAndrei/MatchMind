# Frequent Questions for MatchMind - Better User Engagement

## The Problem with Rare Event Questions

The original questions included many rare events like:
- "Will there be a red card in the next minute?"
- "Will there be a penalty in the next minute?"
- "Will there be a VAR check in the next minute?"

**Why these are terrible for user engagement:**
1. **Users know they're rare** - Everyone will predict "false" because they know these events almost never happen
2. **No skill involved** - It's just guessing "false" every time
3. **Boring gameplay** - No excitement or strategy
4. **Predictable outcomes** - Everyone gets the same score

## The Solution: Frequent, Exciting Events

The new approach focuses on events that happen **regularly throughout matches** but are still **exciting to predict**:

### Very High Frequency Events (Happen constantly)
- **Throw-ins** - Happen every 30-60 seconds
- **Fouls** - Happen every 1-2 minutes
- **Shots** - Happen every 2-3 minutes
- **Corners** - Happen every 3-5 minutes

### High Frequency Events (Happen regularly)
- **Free kicks** - After fouls
- **Cards** - Every 5-10 minutes
- **Team-specific events** - Shots, corners, fouls by specific teams

### Medium Frequency Events (Happen occasionally)
- **Goals** - Every 15-30 minutes (but most exciting)
- **Substitutions** - Every 10-15 minutes
- **Combination events** - Shot + corner, foul + card

## Question Categories by Frequency

### Very High Frequency (Perfect for beginners)
- Throw-ins
- Fouls
- Shots
- Corners

### High Frequency (Good for intermediate players)
- Free kicks
- Team-specific events
- Cards

### Medium Frequency (Advanced players)
- Goals
- Substitutions
- Combination events
- Time variations (2-3 minute windows)

## Excitement Levels

### Very High Excitement
- Goals (any goal, team goals)
- Shots on target
- Free kick goals

### High Excitement
- Any shots
- Team shots
- Cards
- Combination events

### Medium Excitement
- Corners
- Fouls
- Throw-ins
- Free kicks
- Substitutions

## Recommended Implementation Strategy

### Phase 1: Starter Questions (Very High Frequency)
Start with questions that happen constantly:
- "Will there be a throw-in in the next minute?"
- "Will there be a foul in the next minute?"
- "Will there be a shot in the next minute?"

### Phase 2: Team Engagement (High Frequency)
Add team-specific questions:
- "Will [TEAM] have a shot in the next minute?"
- "Will [TEAM] win a corner in the next minute?"
- "Will [TEAM] commit a foul in the next minute?"

### Phase 3: Advanced Questions (Medium Frequency, High Excitement)
Add more challenging but exciting questions:
- "Will there be a goal in the next minute?"
- "Will there be both a shot AND a corner in the next minute?"
- "Will there be a card in the next minute?"

## Why This Approach Works

1. **Realistic Predictions** - Users can actually predict these events based on game flow
2. **Skill-Based** - Knowledge of football helps predict outcomes
3. **Constant Engagement** - Questions every minute with realistic chances
4. **Varied Difficulty** - From easy (throw-ins) to hard (goals)
5. **Fan Engagement** - Team-specific questions create emotional investment
6. **Balanced Scoring** - Not everyone gets the same score

## Question Examples by Category

### Shots (Very Frequent & Exciting)
- "Will there be a shot in the next minute?"
- "Will there be a shot on target in the next minute?"
- "Will [TEAM] have a shot in the next minute?"

### Corners (Very Frequent)
- "Will there be a corner in the next minute?"
- "Will [TEAM] win a corner in the next minute?"

### Fouls (Very Frequent)
- "Will there be a foul in the next minute?"
- "Will [TEAM] commit a foul in the next minute?"

### Cards (Medium Frequency, High Excitement)
- "Will there be a card (yellow or red) in the next minute?"
- "Will [TEAM] receive a card in the next minute?"

### Goals (Medium Frequency, Very High Excitement)
- "Will there be a goal in the next minute?"
- "Will [TEAM] score a goal in the next minute?"

### Combinations (Medium Frequency, High Excitement)
- "Will there be both a shot AND a corner in the next minute?"
- "Will there be both a foul AND a card in the next minute?"

## Implementation Notes

- Use `[TEAM]` placeholder that gets replaced with actual team names
- Questions happen every minute during live matches
- Mix of difficulty levels keeps all users engaged
- Team-specific questions create fan loyalty
- Combination questions add complexity for advanced players

This approach ensures users are constantly engaged with realistic, exciting predictions rather than guessing "false" for rare events. 