// Daily Challenge system for Word Snake
// Uses a seeded random number generator so all players get the same words each day

import { WORD_ENTRIES, type WordCategory, type WordEntry } from './word-pool'

export interface DailyChallenge {
  date: string
  words: string[]
  targetScore: number
  category: WordCategory
}

// Seeded PRNG (mulberry32)
function createSeededRandom(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Convert date string to a numeric seed
function dateToSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash
}

// Get today's date string in YYYY-MM-DD format (local time)
function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// All available categories
const ALL_CATEGORIES: WordCategory[] = [
  'nature',
  'emotion',
  'element',
  'time',
  'creature',
  'quality',
  'object',
  'action',
]

/**
 * Get the daily challenge for today.
 * Deterministic: same date = same words for everyone.
 */
export function getDailyChallenge(): DailyChallenge {
  const date = getTodayString()
  const seed = dateToSeed(date)
  const random = createSeededRandom(seed)

  // Pick a category based on the seed
  const categoryIndex = Math.floor(random() * ALL_CATEGORIES.length)
  const category = ALL_CATEGORIES[categoryIndex]

  // Get all words in this category
  const categoryWords = WORD_ENTRIES.filter(
    (e: WordEntry) => e.category === category
  )

  // Select 5-8 words from the category
  const wordCount = 5 + Math.floor(random() * 4) // 5, 6, 7, or 8

  // Shuffle and pick using Fisher-Yates with seeded random
  const shuffled = [...categoryWords]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const selected = shuffled.slice(0, Math.min(wordCount, shuffled.length))
  const words = selected.map((e: WordEntry) => e.word)

  // Target score is the total points of all selected words
  const targetScore = selected.reduce(
    (sum: number, e: WordEntry) => sum + e.points,
    0
  )

  return { date, words, targetScore, category }
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return getTodayString()
}

// Storage key helper
function getDailyKey(date: string): string {
  return `word-snake-daily-${date}`
}

/**
 * Check if today's daily challenge has been completed
 */
export function getDailyChallengeResult(
  date?: string
): { completed: boolean; score: number } | null {
  const d = date ?? getTodayString()
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(getDailyKey(d))
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Save daily challenge result
 */
export function saveDailyChallengeResult(
  completed: boolean,
  score: number,
  date?: string
): void {
  const d = date ?? getTodayString()
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getDailyKey(d), JSON.stringify({ completed, score }))
  } catch {
    /* ignore */
  }
}

/**
 * Check if today's daily challenge has already been played
 */
export function isDailyChallengePlayed(date?: string): boolean {
  const result = getDailyChallengeResult(date)
  return result !== null
}
