// Simulation config for mapping real minutes to IRL milliseconds for simmed matches

export function getSimulatedMinuteMs(): number {
  // Try environment variable first
  const fromEnv = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SIM_MINUTE_MS : undefined
  const parsed = fromEnv ? Number(fromEnv) : NaN
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed
  }
  
  // Default: 1 simulated minute = 2 seconds IRL (faster for testing)
  return 2000
}



