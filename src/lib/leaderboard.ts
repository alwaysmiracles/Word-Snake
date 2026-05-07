export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LeaderboardEntry {
  score: number
  wordsEaten: number
  difficulty: Difficulty
  date: string
  isDailyChallenge: boolean
}

const STORAGE_KEY = 'word-snake-leaderboard'
const MAX_ENTRIES = 10

interface LeaderboardData {
  easy: LeaderboardEntry[]
  medium: LeaderboardEntry[]
  hard: LeaderboardEntry[]
}

function getEmptyLeaderboard(): LeaderboardData {
  return { easy: [], medium: [], hard: [] }
}

function loadLeaderboard(): LeaderboardData {
  if (typeof window === 'undefined') return getEmptyLeaderboard()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as LeaderboardData
      // Validate structure
      if (parsed.easy && parsed.medium && parsed.hard) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return getEmptyLeaderboard()
}

function saveLeaderboard(data: LeaderboardData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

/**
 * Get leaderboard entries, optionally filtered by difficulty.
 * Returns top 10 sorted by score descending.
 */
export function getLeaderboard(difficulty?: Difficulty): LeaderboardEntry[] {
  const data = loadLeaderboard()
  if (difficulty) {
    return data[difficulty].slice(0, MAX_ENTRIES)
  }
  // Return all combined and sorted
  const all = [...data.easy, ...data.medium, ...data.hard]
  all.sort((a, b) => b.score - a.score)
  return all.slice(0, MAX_ENTRIES)
}

/**
 * Add a new entry to the leaderboard. Keeps only top 10 per difficulty.
 * Returns the rank (1-based) of the new entry, or -1 if it didn't make the top 10.
 */
export function addLeaderboardEntry(entry: LeaderboardEntry): number {
  const data = loadLeaderboard()
  const list = data[entry.difficulty]

  // Add the new entry
  list.push(entry)

  // Sort by score descending, then by wordsEaten descending as tiebreaker
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.wordsEaten - a.wordsEaten
  })

  // Find the rank of the new entry
  const rank = list.findIndex(
    (e) => e.score === entry.score && e.wordsEaten === entry.wordsEaten && e.date === entry.date
  ) + 1

  // Keep only top 10
  data[entry.difficulty] = list.slice(0, MAX_ENTRIES)

  saveLeaderboard(data)

  // Return rank if within top 10, otherwise -1
  return rank <= MAX_ENTRIES ? rank : -1
}

/**
 * Get the best score for a given difficulty.
 * Returns 0 if no entries exist.
 */
export function getBestScore(difficulty: Difficulty): number {
  const data = loadLeaderboard()
  const list = data[difficulty]
  if (list.length === 0) return 0
  return list[0].score
}

/**
 * Get the rank of a given score within a difficulty's leaderboard.
 * Returns 0 if the score doesn't make the top 10.
 */
export function getScoreRank(score: number, difficulty: Difficulty): number {
  const data = loadLeaderboard()
  const list = data[difficulty]
  const rank = list.findIndex((e) => e.score <= score) + 1
  if (rank === 0) return list.length < MAX_ENTRIES ? list.length + 1 : 0
  return rank
}

/**
 * Get total number of entries for a difficulty.
 */
export function getEntryCount(difficulty: Difficulty): number {
  const data = loadLeaderboard()
  return data[difficulty].length
}
