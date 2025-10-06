// Convert training data from StatsBomb format to mock data format
// This script reads the first 5 training JSON files and converts them to match events

const fs = require('fs');
const path = require('path');

// Function to convert timestamp to minute
function timestampToMinute(timestamp) {
  const [time, ms] = timestamp.split('.');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return Math.floor((hours * 60 + minutes * 60 + seconds) / 60);
}

// Function to map event types to our mock format
function mapEventType(statsBombType) {
  const eventMap = {
    'pass_success': 'pass',
    'pass_failure': 'pass',
    'shot': 'shot',
    'Duel': 'duel',
    'Ball Receipt*': 'ball_receipt',
    'Carry': 'carry',
    'Foul Committed': 'foul',
    'Interception': 'interception',
    'Clearance': 'clearance',
    'Block': 'block',
    'Miscontrol': 'miscontrol',
    'Pressure': 'pressure',
    'Ball Recovery': 'ball_recovery'
  };
  
  return eventMap[statsBombType] || statsBombType.toLowerCase().replace(/\s+/g, '_');
}

// Function to determine team (home/away) based on team name
function determineTeam(teamName, homeTeam, awayTeam) {
  if (teamName === homeTeam) return 'home';
  if (teamName === awayTeam) return 'away';
  return 'unknown';
}

// Function to process a single training file
function processTrainingFile(filePath, matchIndex) {
  try {
    console.log(`Processing ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Extract team names from the first few events
    const homeTeam = data.find(event => event.player1_team)?.player1_team || 'Home Team';
    const awayTeam = data.find(event => event.player1_team && event.player1_team !== homeTeam)?.player1_team || 'Away Team';
    
    const events = [];
    let eventId = 1;
    
    // Process events, taking every 10th event to avoid too many events
    for (let i = 0; i < data.length; i += 10) {
      const event = data[i];
      const minute = timestampToMinute(event.timestamp);
      
      // Skip events after 90 minutes
      if (minute > 90) break;
      
      events.push({
        id: `${matchIndex}-${eventId}`,
        type: mapEventType(event.event_type),
        minute: minute,
        player: event.player1 || 'Unknown Player',
        team: determineTeam(event.player1_team, homeTeam, awayTeam),
        description: `${mapEventType(event.event_type)} by ${event.player1 || 'Unknown Player'}`
      });
      
      eventId++;
    }
    
    return {
      matchId: matchIndex.toString(),
      homeTeam,
      awayTeam,
      events,
      homeScore: Math.floor(Math.random() * 3),
      awayScore: Math.floor(Math.random() * 3),
      minute: Math.max(...events.map(e => e.minute), 0),
      status: 'live'
    };
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main conversion function
function convertTrainingDataToMock() {
  const trainingDir = path.join(__dirname, '../artifacts/modified-stats-json');
  const outputFile = path.join(__dirname, '../lib/real-training-data.ts');
  
  // Get first 5 files
  const files = fs.readdirSync(trainingDir)
    .filter(file => file.endsWith('.json'))
    .slice(0, 5);
  
  console.log(`Found ${files.length} files to process:`, files);
  
  const matches = [];
  const allEvents = [];
  
  files.forEach((file, index) => {
    const filePath = path.join(trainingDir, file);
    const matchData = processTrainingFile(filePath, index + 1);
    
    if (matchData) {
      matches.push(matchData);
      allEvents.push(...matchData.events);
    }
  });
  
  // Generate TypeScript file
  const tsContent = `// Real training data converted from StatsBomb format
// Generated from first 5 training JSON files

import type { Match } from "./types"

export const realTrainingMatches: Match[] = ${JSON.stringify(matches, null, 2)};

export const realTrainingEvents = ${JSON.stringify(allEvents, null, 2)};

// Mock live events using real training data
export const mockLiveEvents = realTrainingEvents.slice(0, 20).map((event, index) => ({
  id: \`real-\${index + 1}\`,
  type: event.type,
  minute: event.minute,
  player: event.player,
  team: event.team,
  description: event.description
}));
`;

  fs.writeFileSync(outputFile, tsContent);
  console.log(`✅ Generated real training data file: ${outputFile}`);
  console.log(`📊 Processed ${matches.length} matches with ${allEvents.length} total events`);
  
  return { matches, events: allEvents };
}

// Run the conversion
if (require.main === module) {
  convertTrainingDataToMock();
}

module.exports = { convertTrainingDataToMock };
