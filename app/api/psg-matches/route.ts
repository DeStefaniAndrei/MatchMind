import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = 'LX3d6AEoz5VL3mAPIbgJy6azougDpULsKOK0U7TDc7gl0Db1OrJzbT0SfVgP';
  
  try {
    console.log('Fetching PSG matches from SportMonks API...');
    
    const response = await fetch(`https://api.sportmonks.com/v3/football/schedules/teams/591?api_token=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('SportMonks API response received');

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid API response structure');
      return NextResponse.json({ matches: [] });
    }

    const matches = [];
    
    // Process each round in the data
    for (const round of data.data) {
      if (round.rounds && Array.isArray(round.rounds)) {
        for (const roundData of round.rounds) {
          if (roundData.fixtures && Array.isArray(roundData.fixtures)) {
            for (const fixture of roundData.fixtures) {
              // Check if PSG is participating
              const isPSGHome = fixture.participants?.some((p: any) => p.id === 591 && p.meta?.location === 'home');
              const isPSGAway = fixture.participants?.some((p: any) => p.id === 591 && p.meta?.location === 'away');
              
              if (isPSGHome || isPSGAway) {
                const homeParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'home');
                const awayParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'away');
                
                console.log('Fixture participants:', fixture.participants);
                console.log('Home participant:', homeParticipant);
                console.log('Away participant:', awayParticipant);
                
                // Try different ways to get team names
                const homeTeamName = homeParticipant?.name || 
                                   homeParticipant?.display_name || 
                                   homeParticipant?.meta?.name ||
                                   'Unknown';
                const awayTeamName = awayParticipant?.name || 
                                   awayParticipant?.display_name || 
                                   awayParticipant?.meta?.name ||
                                   'Unknown';
                
                const match = {
                  id: fixture.id.toString(),
                  homeTeam: homeTeamName,
                  awayTeam: awayTeamName,
                  startTime: fixture.starting_at,
                  status: getMatchStatus(fixture.starting_at),
                  venue: fixture.venue?.name,
                  league: roundData.name,
                  homeScore: fixture.scores?.psg || 0,
                  awayScore: fixture.scores?.ft_score ? 
                    parseInt(fixture.scores.ft_score.split('-')[1]) : 0,
                  participants: 0, // Will be updated from database
                  totalStake: 0 // Will be updated from database
                };
                
                console.log('Created match:', match);
                matches.push(match);
              }
            }
          }
        }
      }
    }

    // Filter for upcoming and live matches only
    const upcomingAndLiveMatches = matches.filter(match => 
      match.status === 'upcoming' || match.status === 'live'
    );

    // Sort by start time (earliest first) and take the next 6 matches
    const sortedMatches = upcomingAndLiveMatches
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);

    console.log(`Found ${matches.length} total PSG matches, returning ${sortedMatches.length} upcoming/live matches`);
    return NextResponse.json({ matches: sortedMatches });
  } catch (error) {
    console.error('Error fetching PSG matches:', error);
    return NextResponse.json({ 
      matches: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Determine match status based on start time
function getMatchStatus(startTime: string): string {
  const now = new Date();
  const matchTime = new Date(startTime);
  const timeDiff = matchTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < -2) {
    return 'completed';
  } else if (hoursDiff < 0 && hoursDiff > -2) {
    return 'live';
  } else {
    return 'upcoming';
  }
} 