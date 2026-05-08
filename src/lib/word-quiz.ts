import { getWordDefinition } from './word-definitions'

// ── Constants ──────────────────────────────────────────────────────────────────

/** 12% chance a quiz spawns after eating a word */
export const QUIZ_SPAWN_CHANCE = 0.12

/** 8 seconds to answer before the quiz auto-dismisses */
export const QUIZ_DURATION = 8000

/** Base multiplier applied to word points for a correct answer */
export const QUIZ_BONUS_MULTIPLIER = 2

/** Additional multiplier per consecutive correct quiz answer */
export const QUIZ_STREAK_BONUS = 0.5

/** localStorage key for persisting quiz stats */
const QUIZ_STATS_KEY = 'word-snake-quiz-stats'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WordQuiz {
  word: string
  definition: string
  options: string[] // 4 options, first one is correct
  category: string
  bonusPoints: number
  expiresAt: number
}

export interface QuizResult {
  correct: boolean
  word: string
  bonusPoints: number
  timeTaken: number // ms
}

// ── Functions ──────────────────────────────────────────────────────────────────

/**
 * Roll the dice — returns true 12% of the time.
 * Call this after a word is eaten to decide whether a quiz should appear.
 */
export function shouldSpawnQuiz(): boolean {
  return Math.random() < QUIZ_SPAWN_CHANCE
}

/**
 * Generate a quiz for the eaten word.
 *
 * @param eatenWord  — the word the snake just ate
 * @param category   — category of the eaten word
 * @param wordPoints — the base score the word was worth
 * @param allWords   — the full word pool to pick wrong options from
 * @returns a `WordQuiz` or `null` when the word has no definition or
 *          there aren't enough other words for distractors
 */
export function generateQuiz(
  eatenWord: string,
  category: string,
  wordPoints: number,
  allWords: string[],
): WordQuiz | null {
  const def = getWordDefinition(eatenWord)
  if (!def) return null

  // Gather candidate wrong options (different word, preferably same category)
  const candidates = allWords.filter(
    (w) => w !== eatenWord && w.length > 0,
  )

  // We need at least 3 distractors
  if (candidates.length < 3) return null

  // Prioritise same-category words for plausible distractors,
  // then fall back to any word.
  const sameCategory = candidates.filter((w) => {
    const d = getWordDefinition(w)
    return d && d.category === category
  })
  const otherCategory = candidates.filter(
    (w) => !sameCategory.includes(w),
  )

  // Pick up to 3 from same category, then fill the rest from others
  const wrongPool = shuffleArray([...sameCategory, ...otherCategory])
  const wrongOptions = wrongPool.slice(0, 3)

  if (wrongOptions.length < 3) return null

  // Build the options array — correct answer first, then shuffle
  const options = shuffleArray([eatenWord, ...wrongOptions])

  // Base bonus = 2 × word points
  const bonusPoints = wordPoints * QUIZ_BONUS_MULTIPLIER

  return {
    word: eatenWord,
    definition: def.definition,
    options,
    category,
    bonusPoints,
    expiresAt: Date.now() + QUIZ_DURATION,
  }
}

/**
 * Check the player's answer and compute bonus points (including streak).
 *
 * @param quiz         — the active quiz
 * @param selectedWord — the word the player chose
 * @param quizStreak   — number of consecutive correct quiz answers so far
 * @returns a `QuizResult`
 */
export function checkAnswer(
  quiz: WordQuiz,
  selectedWord: string,
  quizStreak: number,
): QuizResult {
  const correct = selectedWord === quiz.word
  const quizStartTime = quiz.expiresAt - QUIZ_DURATION
  const timeTaken = Date.now() - quizStartTime

  let bonusPoints = 0
  if (correct) {
    // streak multiplier: 1 + (streak × 0.5) — streak is counted *before* this answer
    const streakMultiplier = 1 + quizStreak * QUIZ_STREAK_BONUS
    bonusPoints = Math.round(quiz.bonusPoints * streakMultiplier)
  }

  return { correct, word: quiz.word, bonusPoints, timeTaken }
}

// ── Stats persistence (localStorage) ───────────────────────────────────────────

interface QuizStats {
  totalQuizzes: number
  correctAnswers: number
  bestStreak: number
  totalBonusPoints: number
}

function loadStats(): QuizStats {
  try {
    const raw = localStorage.getItem(QUIZ_STATS_KEY)
    if (raw) return JSON.parse(raw) as QuizStats
  } catch {
    // corrupted — fall through to defaults
  }
  return {
    totalQuizzes: 0,
    correctAnswers: 0,
    bestStreak: 0,
    totalBonusPoints: 0,
  }
}

function persistStats(stats: QuizStats): void {
  try {
    localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

/**
 * Read the current quiz stats from localStorage.
 */
export function getQuizStats(): QuizStats {
  return loadStats()
}

/**
 * Save a quiz result to localStorage and update running stats.
 */
export function saveQuizResult(result: QuizResult): void {
  const stats = loadStats()
  stats.totalQuizzes += 1

  if (result.correct) {
    stats.correctAnswers += 1
    stats.totalBonusPoints += result.bonusPoints
  }

  persistStats(stats)
}

/**
 * Reset all quiz stats to zero.
 */
export function resetQuizStats(): void {
  persistStats({
    totalQuizzes: 0,
    correctAnswers: 0,
    bestStreak: 0,
    totalBonusPoints: 0,
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Format a bonus-points value for display: "+24 pts 🎯"
 */
export function formatQuizBonus(points: number): string {
  return `+${points} pts 🎯`
}

/**
 * Fisher-Yates shuffle (in-place). Returns the same array for convenience.
 */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
