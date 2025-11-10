/**
 * Startup script to ensure the match simulator is running
 * This can be called from various entry points to ensure the simulator starts
 */

import { matchSimulator } from './match-simulator'

let startupInitialized = false

export async function initializeMatchSimulator() {
  if (startupInitialized) return
  
  try {
    matchSimulator.ensureRunning()
    startupInitialized = true
  } catch (error) {
    console.error('Failed to initialize match simulator:', error)
  }
}

// Auto-initialize if this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeMatchSimulator()
}
