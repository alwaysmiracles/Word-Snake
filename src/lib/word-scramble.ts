// ── Constants ──────────────────────────────────────────────────────────────────

/** 8% chance a scramble spawns after eating a word (requires 5+ words eaten) */
export const SCRAMBLE_SPAWN_CHANCE = 0.08

/** 15 seconds to solve the scramble before it auto-dismisses */
export const SCRAMBLE_TIME_LIMIT = 15

/** Maximum number of attempts the player gets per scramble */
export const SCRAMBLE_MAX_ATTEMPTS = 3

/** Base multiplier applied to word points for solving the scramble */
export const SCRAMBLE_BONUS_MULTIPLIER = 3

/** Minimum word length to be eligible for a scramble */
const MIN_WORD_LENGTH = 4

/** localStorage key for persisting scramble stats */
const SCRAMBLE_STATS_KEY = 'word-snake-scramble-stats'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WordScramble {
  originalWord: string
  scrambledWord: string
  category: string
  points: number
  hint: string
  timeLimit: number // seconds (15s default)
  startedAt: number
  attempts: number
  maxAttempts: number // 3 attempts
}

export interface ScrambleResult {
  solved: boolean
  word: string
  attemptsUsed: number
  timeTaken: number
  bonusPoints: number
}

// ── Functions ──────────────────────────────────────────────────────────────────

/**
 * Roll the dice — returns true 8% of the time, but only after 5+ words eaten.
 * Call this after a word is eaten to decide whether a scramble should appear.
 */
export function shouldSpawnScramble(wordsEaten: number): boolean {
  if (wordsEaten < 5) return false
  return Math.random() < SCRAMBLE_SPAWN_CHANCE
}

/**
 * Generate a scramble for the eaten word by shuffling its letters.
 *
 * @param eatenWord  — the word the snake just ate
 * @param category   — category of the eaten word
 * @param wordPoints — the base score the word was worth
 * @returns a `WordScramble` or `null` when the word is too short (< 4 letters)
 *          or all letters are identical (cannot produce a different arrangement)
 */
export function generateScramble(
  eatenWord: string,
  category: string,
  wordPoints: number,
): WordScramble | null {
  if (eatenWord.length < MIN_WORD_LENGTH) return null

  const scrambled = shuffleWord(eatenWord)

  // shuffleWord guarantees a different arrangement; if it couldn't, it returns
  // the original and we bail out (e.g. all identical letters like "aaaa")
  if (scrambled === eatenWord) return null

  return {
    originalWord: eatenWord,
    scrambledWord: scrambled,
    category,
    points: wordPoints,
    hint: eatenWord[0].toUpperCase(),
    timeLimit: SCRAMBLE_TIME_LIMIT,
    startedAt: Date.now(),
    attempts: 0,
    maxAttempts: SCRAMBLE_MAX_ATTEMPTS,
  }
}

/**
 * Check the player's answer against the original word.
 * Comparison is case-insensitive.
 */
export function checkScrambleAnswer(scramble: WordScramble, answer: string): boolean {
  return answer.trim().toLowerCase() === scramble.originalWord.toLowerCase()
}

/**
 * Compute the final result for a scramble.
 *
 * Bonus formula (solved):
 *   bonus = points × 3 × (1 + (maxAttempts − attemptsUsed) × 0.2)
 *
 * Unsolved (time / attempts exhausted):
 *   bonus = 0
 *
 * @param scramble — the active scramble (with its current `attempts` count)
 * @param solved   — whether the player managed to solve it
 */
export function getScrambleResult(scramble: WordScramble, solved: boolean): ScrambleResult {
  const timeTaken = (Date.now() - scramble.startedAt) / 1000
  const attemptsUsed = scramble.attempts

  let bonusPoints = 0
  if (solved) {
    const remainingAttempts = scramble.maxAttempts - attemptsUsed
    bonusPoints = Math.round(
      scramble.points * SCRAMBLE_BONUS_MULTIPLIER * (1 + remainingAttempts * 0.2),
    )
  }

  return {
    solved,
    word: scramble.originalWord,
    attemptsUsed,
    timeTaken,
    bonusPoints,
  }
}

/**
 * Check whether the scramble's time limit has elapsed.
 *
 * @param scramble — the active scramble
 * @param now     — current timestamp in ms (defaults to Date.now())
 */
export function isScrambleExpired(scramble: WordScramble, now: number = Date.now()): boolean {
  const elapsed = (now - scramble.startedAt) / 1000
  return elapsed >= scramble.timeLimit
}

// ── Stats persistence (localStorage) ───────────────────────────────────────────

interface ScrambleStats {
  totalScrambles: number
  solved: number
  bestTime: number
  totalBonusPoints: number
}

function loadStats(): ScrambleStats {
  try {
    const raw = localStorage.getItem(SCRAMBLE_STATS_KEY)
    if (raw) return JSON.parse(raw) as ScrambleStats
  } catch {
    // corrupted — fall through to defaults
  }
  return {
    totalScrambles: 0,
    solved: 0,
    bestTime: 0,
    totalBonusPoints: 0,
  }
}

function persistStats(stats: ScrambleStats): void {
  try {
    localStorage.setItem(SCRAMBLE_STATS_KEY, JSON.stringify(stats))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

/**
 * Read the current scramble stats from localStorage.
 */
export function getScrambleStats(): ScrambleStats {
  return loadStats()
}

/**
 * Save a scramble result to localStorage and update running stats.
 */
export function saveScrambleResult(result: ScrambleResult): void {
  const stats = loadStats()
  stats.totalScrambles += 1

  if (result.solved) {
    stats.solved += 1
    stats.totalBonusPoints += result.bonusPoints

    // Track best time (fastest solve); 0 means no solve yet
    if (stats.bestTime === 0 || result.timeTaken < stats.bestTime) {
      stats.bestTime = Math.round(result.timeTaken * 100) / 100
    }
  }

  persistStats(stats)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle a word's characters.
 * Guarantees the result differs from the original.
 * If every possible arrangement is identical (e.g. "aaaa"), returns the original.
 */
export function shuffleWord(word: string): string {
  const letters = word.split('')

  // Attempt up to 20 shuffles to find a different arrangement
  for (let attempt = 0; attempt < 20; attempt++) {
    // Fisher-Yates in-place shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }

    if (letters.join('') !== word) {
      return letters.join('')
    }
  }

  // Could not produce a different arrangement (all identical characters, etc.)
  return word
}
