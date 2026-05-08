// In-Game Progressive Difficulty Curve
// Gradually increases difficulty during a single game session based on performance.

export interface InGameDifficulty {
  level: number            // 1-10 scale
  speedMultiplier: number  // Game speed modifier (starts at 1.0, increases)
  label: string            // Display name like "Warming Up", "Getting Serious", etc.
  color: string            // Color for UI indicator (CSS color string)
  glowColor: string        // Lighter glow version of color
  emoji: string            // Emoji for the indicator
}

interface DifficultyLevelConfig {
  minScore: number
  level: number
  speedMultiplier: number
  label: string
  color: string
  glowColor: string
  emoji: string
}

const DIFFICULTY_LEVELS: DifficultyLevelConfig[] = [
  { minScore: 0,    level: 1,  speedMultiplier: 1.0, label: 'Warming Up',     color: '#4ade80', glowColor: '#86efac', emoji: '🌱' },
  { minScore: 21,   level: 2,  speedMultiplier: 1.05, label: 'Getting Started', color: '#4ade80', glowColor: '#86efac', emoji: '🌿' },
  { minScore: 51,   level: 3,  speedMultiplier: 1.1,  label: 'Picking Up',     color: '#a3e635', glowColor: '#bef264', emoji: '⚡' },
  { minScore: 101,  level: 4,  speedMultiplier: 1.15, label: 'Solid Pace',     color: '#facc15', glowColor: '#fde047', emoji: '🔥' },
  { minScore: 151,  level: 5,  speedMultiplier: 1.2,  label: 'Heating Up',     color: '#f59e0b', glowColor: '#fbbf24', emoji: '🔥' },
  { minScore: 251,  level: 6,  speedMultiplier: 1.3,  label: 'Getting Serious', color: '#f97316', glowColor: '#fb923c', emoji: '💥' },
  { minScore: 401,  level: 7,  speedMultiplier: 1.4,  label: 'Intense',        color: '#ef4444', glowColor: '#f87171', emoji: '💥' },
  { minScore: 601,  level: 8,  speedMultiplier: 1.5,  label: 'Blazing',        color: '#dc2626', glowColor: '#ef4444', emoji: '🌪️' },
  { minScore: 801,  level: 9,  speedMultiplier: 1.6,  label: 'Inferno',        color: '#dc2626', glowColor: '#ef4444', emoji: '🌋' },
  { minScore: 1001, level: 10, speedMultiplier: 1.8,  label: 'LEGENDARY',      color: '#be123c', glowColor: '#f43f5e', emoji: '👑' },
]

/**
 * Calculate in-game difficulty based on:
 * - Current score (primary factor)
 * - Words eaten in current game
 * - Snake length
 * - Time survived
 */
export function calculateInGameDifficulty(
  score: number,
  wordsEaten: number,
  snakeLength: number,
  timeElapsed: number
): InGameDifficulty {
  // Primary factor: score-based level
  let levelConfig = DIFFICULTY_LEVELS[0]
  for (const cfg of DIFFICULTY_LEVELS) {
    if (score >= cfg.minScore) {
      levelConfig = cfg
    } else {
      break
    }
  }

  // Secondary boosts: minor level bump from other factors
  // These can push you to the next level a bit earlier if performing well overall
  const timeFactor = timeElapsed > 60000 ? 1 : 0  // survived 60+ seconds
  const wordsFactor = wordsEaten > 5 ? 1 : 0
  const lengthFactor = snakeLength > 10 ? 1 : 0
  const bonusBoosts = timeFactor + wordsFactor + lengthFactor

  // If we have 2+ bonus boosts and score is within 20% of next threshold, bump level
  if (bonusBoosts >= 2) {
    const nextIndex = DIFFICULTY_LEVELS.findIndex(c => c.level === levelConfig.level) + 1
    if (nextIndex < DIFFICULTY_LEVELS.length) {
      const nextLevel = DIFFICULTY_LEVELS[nextIndex]
      const progressInCurrent = (score - levelConfig.minScore) / (nextLevel.minScore - levelConfig.minScore)
      if (progressInCurrent >= 0.8) {
        levelConfig = nextLevel
      }
    }
  }

  // Smoothly interpolate speed multiplier between levels
  // This prevents jarring speed jumps when crossing thresholds
  let speedMultiplier = levelConfig.speedMultiplier
  const nextIdx = DIFFICULTY_LEVELS.findIndex(c => c.level === levelConfig.level) + 1
  if (nextIdx < DIFFICULTY_LEVELS.length) {
    const nextLevel = DIFFICULTY_LEVELS[nextIdx]
    const range = nextLevel.minScore - levelConfig.minScore
    const progress = Math.min(1, (score - levelConfig.minScore) / range)
    // Only interpolate speed in the upper 30% of a level's range
    if (progress > 0.7) {
      const interpFactor = (progress - 0.7) / 0.3
      speedMultiplier = levelConfig.speedMultiplier + (nextLevel.speedMultiplier - levelConfig.speedMultiplier) * interpFactor * 0.5
    }
  }

  return {
    level: levelConfig.level,
    speedMultiplier: Math.round(speedMultiplier * 1000) / 1000,
    label: levelConfig.label,
    color: levelConfig.color,
    glowColor: levelConfig.glowColor,
    emoji: levelConfig.emoji,
  }
}

/**
 * Get the speed multiplier to apply in the game loop.
 * Returns a value > 1.0 to divide the tick interval by (making the game faster).
 */
export function getSpeedMultiplier(difficulty: InGameDifficulty): number {
  return difficulty.speedMultiplier
}

/**
 * Get all difficulty level configs for display purposes.
 */
export function getAllDifficultyLevels(): DifficultyLevelConfig[] {
  return DIFFICULTY_LEVELS
}
