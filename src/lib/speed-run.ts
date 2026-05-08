// Speed Run mode for Word Snake — 60-second timed challenge

export interface SpeedRunResult {
  score: number
  wordsEaten: number
  maxCombo: number
  powerUpsCollected: number
  longestSnake: number
  difficulty: string
  date: string
  survived: boolean // true if survived full 60 seconds
}

export interface SpeedRunBest {
  bestScore: number
  bestWordsEaten: number
  bestMaxCombo: number
  totalRuns: number
  lastDate: string
}

const SPEED_RUN_STORAGE_KEY = 'word-snake-speed-run-best'
const SPEED_RUN_HISTORY_KEY = 'word-snake-speed-run-history'

const SPEED_RUN_DURATION = 60 // seconds

export function getSpeedRunDuration(): number {
  return SPEED_RUN_DURATION
}

export function getSpeedRunBest(): SpeedRunBest {
  if (typeof window === 'undefined') return { bestScore: 0, bestWordsEaten: 0, bestMaxCombo: 0, totalRuns: 0, lastDate: '' }
  try {
    const stored = localStorage.getItem(SPEED_RUN_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { bestScore: 0, bestWordsEaten: 0, bestMaxCombo: 0, totalRuns: 0, lastDate: '' }
}

export function saveSpeedRunResult(result: SpeedRunResult): SpeedRunBest {
  const current = getSpeedRunBest()
  const updated: SpeedRunBest = {
    bestScore: Math.max(current.bestScore, result.score),
    bestWordsEaten: Math.max(current.bestWordsEaten, result.wordsEaten),
    bestMaxCombo: Math.max(current.bestMaxCombo, result.maxCombo),
    totalRuns: current.totalRuns + 1,
    lastDate: result.date,
  }
  try {
    localStorage.setItem(SPEED_RUN_STORAGE_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }

  // Also save to history (last 20 runs)
  saveSpeedRunHistory(result)

  return updated
}

export function getSpeedRunHistory(): SpeedRunResult[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(SPEED_RUN_HISTORY_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return []
}

function saveSpeedRunHistory(result: SpeedRunResult): void {
  const history = getSpeedRunHistory()
  history.unshift(result)
  const trimmed = history.slice(0, 20)
  try {
    localStorage.setItem(SPEED_RUN_HISTORY_KEY, JSON.stringify(trimmed))
  } catch { /* ignore */ }
}
