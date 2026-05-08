// Dynamic difficulty adjustment based on player performance

export interface DifficultyAdjustment {
  level: number // 1-10 scale representing player skill
  speedModifier: number // multiplier applied to game speed (0.8 = easier, 1.2 = harder)
  wordSpawnDelay: number // extra delay before spawning new word (ms), 0 = normal
  powerUpChanceModifier: number // multiplier for power-up spawn chance
  description: string
  emoji: string
}

const DIFFICULTY_ADJUSTMENT_LEVELS: Record<number, Omit<DifficultyAdjustment, 'level'>> = {
  1:  { speedModifier: 0.75, wordSpawnDelay: 2000, powerUpChanceModifier: 1.5, description: 'Very Easy', emoji: '🟢' },
  2:  { speedModifier: 0.80, wordSpawnDelay: 1500, powerUpChanceModifier: 1.3, description: 'Easy', emoji: '🟢' },
  3:  { speedModifier: 0.85, wordSpawnDelay: 1000, powerUpChanceModifier: 1.2, description: 'Moderate Easy', emoji: '🟡' },
  4:  { speedModifier: 0.90, wordSpawnDelay: 500, powerUpChanceModifier: 1.1, description: 'Slightly Easy', emoji: '🟡' },
  5:  { speedModifier: 1.00, wordSpawnDelay: 0, powerUpChanceModifier: 1.0, description: 'Normal', emoji: '⚪' },
  6:  { speedModifier: 1.05, wordSpawnDelay: 0, powerUpChanceModifier: 0.9, description: 'Slightly Hard', emoji: '🟠' },
  7:  { speedModifier: 1.10, wordSpawnDelay: 0, powerUpChanceModifier: 0.85, description: 'Hard', emoji: '🟠' },
  8:  { speedModifier: 1.15, wordSpawnDelay: 0, powerUpChanceModifier: 0.8, description: 'Very Hard', emoji: '🔴' },
  9:  { speedModifier: 1.22, wordSpawnDelay: 0, powerUpChanceModifier: 0.7, description: 'Extreme', emoji: '🔴' },
  10: { speedModifier: 1.30, wordSpawnDelay: 0, powerUpChanceModifier: 0.6, description: 'Insane', emoji: '💀' },
}

const STORAGE_KEY = 'word-snake-difficulty-adjust'

interface PlayerPerformanceHistory {
  games: {
    score: number
    wordsEaten: number
    timeAlive: number // ms
    difficulty: string
    date: string
  }[]
}

export function getPlayerLevel(): number {
  if (typeof window === 'undefined') return 5
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data: PlayerPerformanceHistory = JSON.parse(stored)
      return calculateLevel(data.games)
    }
  } catch { /* ignore */ }
  return 5 // default normal
}

export function getDifficultyAdjustment(level?: number): DifficultyAdjustment {
  const lvl = level ?? getPlayerLevel()
  const config = DIFFICULTY_ADJUSTMENT_LEVELS[lvl] ?? DIFFICULTY_ADJUSTMENT_LEVELS[5]
  return { level: lvl, ...config }
}

export function recordGamePerformance(
  score: number,
  wordsEaten: number,
  timeAlive: number,
  difficulty: string
): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const data: PlayerPerformanceHistory = stored ? JSON.parse(stored) : { games: [] }
    data.games.push({
      score,
      wordsEaten,
      timeAlive,
      difficulty,
      date: new Date().toISOString(),
    })
    // Keep only last 30 games for rolling calculation
    if (data.games.length > 30) {
      data.games = data.games.slice(-30)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function calculateLevel(games: PlayerPerformanceHistory['games']): number {
  if (games.length < 3) return 5 // need at least 3 games to adjust

  const recent = games.slice(-10) // use last 10 games
  const avgScore = recent.reduce((sum, g) => sum + g.score, 0) / recent.length
  const avgWords = recent.reduce((sum, g) => sum + g.wordsEaten, 0) / recent.length
  const avgTime = recent.reduce((sum, g) => sum + g.timeAlive, 0) / recent.length

  // Score-based component (0-4 points): higher average score = higher skill
  let scorePoints = 0
  if (avgScore >= 500) scorePoints = 4
  else if (avgScore >= 300) scorePoints = 3
  else if (avgScore >= 150) scorePoints = 2
  else if (avgScore >= 50) scorePoints = 1

  // Word count component (0-3 points): more words = higher skill
  let wordPoints = 0
  if (avgWords >= 15) wordPoints = 3
  else if (avgWords >= 10) wordPoints = 2
  else if (avgWords >= 5) wordPoints = 1

  // Survival time component (0-3 points): longer survival = higher skill
  let timePoints = 0
  if (avgTime >= 120000) timePoints = 3 // 2+ minutes
  else if (avgTime >= 60000) timePoints = 2 // 1+ minute
  else if (avgTime >= 30000) timePoints = 1 // 30+ seconds

  const totalPoints = scorePoints + wordPoints + wordPoints + timePoints
  // Map 0-10 total to level 1-10
  const level = Math.max(1, Math.min(10, Math.ceil(totalPoints * 10 / 13)))
  return level
}

export function getDifficultyAdjustmentLevelName(level: number): string {
  return DIFFICULTY_ADJUSTMENT_LEVELS[level]?.description ?? 'Normal'
}

export function getAllAdjustmentLevels(): { level: number; emoji: string; description: string }[] {
  return Object.entries(DIFFICULTY_ADJUSTMENT_LEVELS).map(([lvl, config]) => ({
    level: parseInt(lvl),
    emoji: config.emoji,
    description: config.description,
  }))
}
