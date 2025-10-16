// Test file to verify SportMonks API capabilities
// This will help us validate our question feasibility analysis

// import { sportMonksAPI, LiveEvent, LiveMatch } from './sportmonks-api'
import { FEASIBLE_QUESTIONS, PREDICTION_QUESTIONS } from './question-analysis'

interface TestResult {
  questionId: string
  questionText: string
  feasible: boolean
  testResult: 'success' | 'failed' | 'not_tested'
  dataFound: boolean
  sampleData?: any
  error?: string
}

export class APITester {
  private api = sportMonksAPI

  async testAPIConnection(): Promise<boolean> {
    try {
      console.log('Testing SportMonks API connection...')
      const isConnected = await this.api.testConnection()
      console.log('API Connection:', isConnected ? '✅ Success' : '❌ Failed')
      return isConnected
    } catch (error) {
      console.error('API Connection Test Failed:', error)
      return false
    }
  }

  async getLiveMatches(): Promise<LiveMatch[]> {
    try {
      console.log('Fetching live matches...')
      const response = await this.api.getLiveMatches()
      console.log(`Found ${response.data?.length || 0} live matches`)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch live matches:', error)
      return []
    }
  }

  async testMatchEvents(matchId: number): Promise<TestResult[]> {
    const results: TestResult[] = []
    
    try {
      console.log(`Testing events for match ${matchId}...`)
      const response = await this.api.getMatchEvents(matchId)
      const events = response.data || []
      
      console.log(`Found ${events.length} events`)
      
      // Test each feasible question
      for (const question of FEASIBLE_QUESTIONS) {
        const result = this.testQuestionWithEvents(question, events)
        results.push(result)
      }
      
      return results
    } catch (error) {
      console.error(`Failed to test match events for ${matchId}:`, error)
      return []
    }
  }

  private testQuestionWithEvents(question: any, events: LiveEvent[]): TestResult {
    const result: TestResult = {
      questionId: question.id,
      questionText: question.text,
      feasible: question.feasible,
      testResult: 'not_tested',
      dataFound: false
    }

    try {
      // Test based on question category
      switch (question.category) {
        case 'shots':
          result.dataFound = events.some(e => e.type === 'shot' || e.type === 'goal')
          break
        case 'fouls':
          result.dataFound = events.some(e => e.type === 'foul')
          break
        case 'corners':
          result.dataFound = events.some(e => e.type === 'corner')
          break
        case 'throw-ins':
          result.dataFound = events.some(e => e.type === 'throw-in')
          break
        case 'cards':
          result.dataFound = events.some(e => e.type === 'yellow_card' || e.type === 'red_card')
          break
        case 'goals':
          result.dataFound = events.some(e => e.type === 'goal_kick')
          break
        case 'general':
          result.dataFound = events.some(e => 
            e.type === 'throw-in' || 
            e.type === 'corner' || 
            e.type === 'goal_kick' ||
            e.type === 'foul' ||
            e.type === 'yellow_card' ||
            e.type === 'red_card'
          )
          break
        default:
          result.dataFound = false
      }

      if (result.dataFound) {
        result.testResult = 'success'
        result.sampleData = events.filter(e => {
          switch (question.category) {
            case 'shots': return e.type === 'shot' || e.type === 'goal'
            case 'fouls': return e.type === 'foul'
            case 'corners': return e.type === 'corner'
            case 'throw-ins': return e.type === 'throw-in'
            case 'cards': return e.type === 'yellow_card' || e.type === 'red_card'
            case 'goals': return e.type === 'goal_kick'
            case 'general': return e.type === 'throw-in' || e.type === 'corner' || e.type === 'goal_kick' || e.type === 'foul' || e.type === 'yellow_card' || e.type === 'red_card'
            default: return false
          }
        }).slice(0, 3) // Show first 3 matching events
      } else {
        result.testResult = 'failed'
        result.error = 'No matching events found'
      }

    } catch (error) {
      result.testResult = 'failed'
      result.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return result
  }

  async runFullTest(): Promise<void> {
    console.log('🚀 Starting SportMonks API Full Test')
    console.log('=' .repeat(50))

    // Test API connection
    const isConnected = await this.testAPIConnection()
    if (!isConnected) {
      console.log('❌ Cannot proceed without API connection')
      return
    }

    // Get live matches
    const liveMatches = await this.getLiveMatches()
    if (liveMatches.length === 0) {
      console.log('⚠️ No live matches found for testing')
      console.log('💡 Try again during a live match')
      return
    }

    // Test with first live match
    const testMatch = liveMatches[0]
    console.log(`\n📊 Testing with match: ${testMatch.name}`)
    console.log(`Match ID: ${testMatch.id}`)
    console.log(`Current minute: ${testMatch.time?.minute || 'Unknown'}`)

    // Test events
    const eventResults = await this.testMatchEvents(testMatch.id)
    
    console.log('\n📋 Question Feasibility Test Results:')
    console.log('=' .repeat(50))
    
    for (const result of eventResults) {
      const status = result.testResult === 'success' ? '✅' : 
                    result.testResult === 'failed' ? '❌' : '⚠️'
      console.log(`${status} ${result.questionText}`)
      console.log(`   Data Found: ${result.dataFound ? 'Yes' : 'No'}`)
      if (result.sampleData && result.sampleData.length > 0) {
        console.log(`   Sample Events: ${result.sampleData.length} found`)
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      console.log('')
    }

    // Summary
    const successful = eventResults.filter(r => r.testResult === 'success').length
    const total = eventResults.length
    console.log(`\n📈 Summary: ${successful}/${total} questions have verifiable data`)
    console.log('=' .repeat(50))
  }

  // Test specific event types
  async testEventTypes(matchId: number): Promise<void> {
    try {
      console.log(`\n🔍 Testing specific event types for match ${matchId}...`)
      const response = await this.api.getMatchEvents(matchId)
      const events = response.data || []

      const eventTypes = new Set(events.map(e => e.type))
      console.log('Available event types:')
      eventTypes.forEach(type => {
        const count = events.filter(e => e.type === type).length
        console.log(`  ${type}: ${count} events`)
      })

    } catch (error) {
      console.error('Failed to test event types:', error)
    }
  }
}

// Export for use in other files
export const apiTester = new APITester()

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  apiTester.runFullTest().catch(console.error)
} 