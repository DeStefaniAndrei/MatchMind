import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { fixtureId: string } }) {
    
  const { fixtureId } = params;
  const SPORTMONKS_API_TOKEN = process.env.NEXT_PUBLIC_SPORTMONKS_API_TOKEN;

  if (!SPORTMONKS_API_TOKEN) {
    return NextResponse.json(
      { error: 'API token not configured' },
      { status: 500 }
    );
  }

  try {
    const apiUrl = `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}?include=scores;events;statistics;lineups&api_token=${SPORTMONKS_API_TOKEN}`;
    
    console.log('Calling Sportmonks API:', apiUrl);
    
    const apiRes = await fetch(apiUrl);
    
    if (!apiRes.ok) {
      console.error('Sportmonks API error:', apiRes.status, apiRes.statusText);
      return NextResponse.json(
        { error: `Sportmonks API error: ${apiRes.status}` },
        { status: apiRes.status }
      );
    }
    
    const data = await apiRes.json();
    console.log('Sportmonks API response received');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling Sportmonks API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Sportmonks' },
      { status: 500 }
    );
  }
}
