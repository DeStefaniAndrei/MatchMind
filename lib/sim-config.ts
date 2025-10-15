// Simulation config for mapping real minutes to IRL milliseconds

export function getSimulatedMinuteMs(): number {
  const fromEnv = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SIM_MINUTE_MS : undefined
  const parsed = fromEnv ? Number(fromEnv) : NaN
  if (!Number.isNaN(parsed) && parsed > 0) return parsed
  // Default: 1 simulated minute = 5 seconds IRL
  return 5000
}



