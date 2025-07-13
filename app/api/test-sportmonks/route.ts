import { NextResponse } from 'next/server'

const SPORTMONKS_API_KEY = "LX3d6AEoz5VL3mAPIbgJy6azougDpULsKOK0U7TDc7gl0Db1OrJzbT0SfVgP"

export async function GET() {
  try {
    console.log('Testing SportMonks API...')
    
    // Test with a simple endpoint first
    const testUrl = `https://api.sportmonks.com/v3/football/teams/591?api_token=${SPORTMONKS_API_KEY}`
    console.log('Test URL:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Test API error:', response.status, errorText)
      return NextResponse.json(
        { 
          error: `Test failed: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Test successful:', data)

    return NextResponse.json({ 
      success: true, 
      team: data.data,
      message: 'SportMonks API is working'
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error },
      { status: 500 }
    )
  }
} 