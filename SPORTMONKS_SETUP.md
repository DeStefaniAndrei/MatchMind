# SportMonks API Setup

## Overview
This integration fetches PSG matches from the SportMonks API and displays them using the existing match card layout.

## Setup Instructions

### 1. Get SportMonks API Key
1. Visit [SportMonks](https://www.sportmonks.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. PSG Team ID: `85` (already configured)

### 2. Environment Variables
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_SPORTMONKS_API_KEY=your_api_key_here
```

### 3. API Endpoints Used
- **Upcoming Matches**: `https://api.sportmonks.com/v3/football/fixtures/upcoming/teams/85`
- **Live Matches**: `https://api.sportmonks.com/v3/football/fixtures/livescores/teams/85`

### 4. Features
- ✅ Fetches next 6 PSG matches
- ✅ Shows live and upcoming matches
- ✅ Displays venue and league information
- ✅ Uses existing match card layout
- ✅ Fallback to mock data if API fails
- ✅ Loading states and error handling

### 5. Pages Created
- `/psg-matches` - Dedicated PSG matches page
- Home page - PSG matches section added

### 6. Components
- `PSGMatches` - Main component for displaying PSG matches
- `fetchPSGMatches()` - API function to fetch matches
- Mock data fallback for development

### 7. Data Structure
```typescript
interface PSGMatch {
  id: string
  homeTeam: string
  awayTeam: string
  startTime: string
  status: "upcoming" | "live" | "completed"
  participants: number
  totalStake: number
  homeScore?: number
  awayScore?: number
  venue?: string
  league?: string
}
```

### 8. Testing
- Visit `/psg-matches` to see the dedicated page
- Check the home page for the PSG matches section
- Without API key, mock data will be displayed

### 9. Customization
- Modify `PSG_TEAM_ID` in `lib/sportmonks-api.ts` for different teams
- Update mock data in `getMockPSGMatches()` for testing
- Customize the card layout in `components/matches/match-card.tsx` 