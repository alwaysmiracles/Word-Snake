// ── Minigame Play Wire ─────────────────────────────────────────────────────────
// Wires the MinigameLauncher into the actual game loop so minigames can be
// started, played, and ended with real game state.  Adds session tracking,
// time management, per-mode scoring logic, result history, and persistence.
//
// Pure logic module — no React dependencies.

import {
  type MinigameType,
  type MinigameConfig,
  type MinigameResult,
  type MinigameStats,
  type MinigameLauncher,
  computeScrambleScore,
  computeBossDefeatScore,
  computeQuizScore,
  bossRushShrinkSegments,
  isBrainiacActive,
} from './minigame-launcher'

// ── Public Types ──────────────────────────────────────────────────────────────

export interface LaunchResult {
  success: boolean
  type: MinigameType
  config: MinigameConfig
  gameStateOverrides: Record<string, unknown>
  instructions: string
  error?: string
}

export interface ScoreAdjustment {
  points: number
  bonusMultiplier: number
  comboActive: boolean
  isCorrect: boolean
}

export interface PenaltyResult {
  penalty: number
  segmentsLost: number
  newLength: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  word: string
  category: string
}

export interface MinigameResultSummary {
  type: MinigameType
  name: string
  emoji: string
  score: number
  timeElapsed: number
  correctCount: number
  wrongCount: number
  accuracy: number
  bestCombo: number
  extras: Record<string, number>
  isNewBestScore: boolean
  timestamp: number
}

export interface MinigamePlayWire {
  // Session management
  launchMinigame(type: MinigameType): LaunchResult
  endCurrentMinigame(
    score: number,
    timeElapsed: number,
    correctCount: number,
    wrongCount: number,
    bestCombo: number,
    extras?: Record<string, number>,
  ): MinigameResultSummary
  cancelMinigame(): void

  // Active session state
  isActive(): boolean
  getCurrentType(): MinigameType | null
  getCurrentConfig(): MinigameConfig | null
  getSessionTimeRemaining(): number
  getSessionElapsed(): number
  getInstructions(): string
  isTimeUp(): boolean

  // Gameplay helpers
  onWordEaten(word: string, isCorrect?: boolean): ScoreAdjustment
  onWrongAnswer(): PenaltyResult
  onBossDefeated(bossNumber: number): number
  getScrambledWord(originalWord: string): string
  getQuizQuestion(): QuizQuestion | null
  submitQuizAnswer(selectedIndex: number): boolean

  // Integration with main game state
  getGameStateOverrides(): Record<string, unknown>
  getScoreMultiplier(): number
  shouldWrapWalls(): boolean
  shouldCheckSelfCollision(): boolean

  // Stats and leaderboard
  getAllStats(): Record<MinigameType, MinigameStats>
  getLeaderboard(type: MinigameType): Array<{ score: number; date: string; rank: number }>
  getDailyMinigame(): { type: MinigameType; name: string; emoji: string }
  getPlayCount(): number

  // Results history
  getRecentResults(limit?: number): MinigameResultSummary[]
  getBestScore(type: MinigameType): number
  getAverageScore(type: MinigameType): number
}

// ── Internal Session State ───────────────────────────────────────────────────

interface SessionState {
  type: MinigameType
  config: MinigameConfig
  startTime: number       // performance.now() ms
  overrides: Record<string, unknown>
  instructions: string

  // Scoring accumulators
  score: number
  correctCount: number
  wrongCount: number
  combo: number
  bestCombo: number
  extras: Record<string, number>

  // Scramble Blitz specific
  wordsForSpeedBoost: number

  // Boss Rush specific
  bossNumber: number
  bossesDefeated: number
  lastShrinkCheck: number  // elapsed seconds at last shrink check

  // Quiz Marathon specific
  currentQuestion: QuizQuestion | null
  quizStreak: number
  brainiacActive: boolean
  brainiacActivatedAt: number
  questionsAnswered: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WIRE_STORAGE_KEY = 'ws_minigame_play_wire'
const MEMORY_RESULTS_MAX = 20
const STORAGE_RESULTS_MAX = 50
const COMBO_THRESHOLD = 3
const BRAINIANC_STREAK_THRESHOLD = 3
const BRAINIANC_DURATION_MS = 10_000
const BOSS_SPAWN_INTERVAL_SEC = 20
const SNAKE_SHRINK_INTERVAL_SEC = 15

// ── Internal Helpers ──────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function lsGet(key: string): string | null {
  if (!isBrowser()) return null
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  if (!isBrowser()) return
  try { localStorage.setItem(key, value) } catch { /* quota / access error */ }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Difficulty multiplier ramping from 1.0 → 2.0 as elapsed approaches timeLimit. */
function diffMultiplier(elapsed: number, timeLimit: number): number {
  if (timeLimit <= 0) return 1
  return 1 + Math.min(1, elapsed / timeLimit)
}

/** Calculate accuracy as 0–1 ratio. */
function calcAccuracy(correct: number, wrong: number): number {
  const total = correct + wrong
  if (total === 0) return 0
  return correct / total
}

/** Parse persisted results array from localStorage. */
function loadResults(): MinigameResultSummary[] {
  try {
    const raw = lsGet(WIRE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Persist results array to localStorage, trimming to max capacity. */
function saveResults(results: MinigameResultSummary[]): void {
  try {
    const trimmed = results.slice(0, STORAGE_RESULTS_MAX)
    lsSet(WIRE_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    /* storage full — silently swallow */
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a MinigamePlayWire that wraps an existing MinigameLauncher.
 *
 * The wire adds per-session state tracking, time management, scoring
 * logic (with difficulty ramp, combo bonuses, brainiac mode), quiz
 * question rotation, and result history persistence.
 */
export function createMinigamePlayWire(launcher: MinigameLauncher): MinigamePlayWire {
  // ── Internal state ──

  let session: SessionState | null = null
  let recentResults: MinigameResultSummary[] = loadResults()

  // ── All supported minigame types for iteration ──
  const ALL_TYPES: MinigameType[] = ['scramble_blitz', 'boss_rush', 'quiz_marathon']

  // ════════════════════════════════════════════════════════════════════════════
  // Session management
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Launch a minigame by type.  Delegates to the launcher for configuration
   * and game-state overrides, then initialises session tracking.
   */
  function launchMinigame(type: MinigameType): LaunchResult {
    try {
      // If a session is already active, cancel it first
      if (session !== null) {
        launcher.endMinigame()
        session = null
      }

      const config = launcher.getMinigameConfig(type)
      const { gameStateOverrides, instructions } = launcher.startMinigame(type)

      // Initialise per-mode session state
      const now = performance.now()
      session = {
        type,
        config,
        startTime: now,
        overrides: gameStateOverrides,
        instructions,

        score: 0,
        correctCount: 0,
        wrongCount: 0,
        combo: 0,
        bestCombo: 0,
        extras: {},

        // Scramble Blitz
        wordsForSpeedBoost: 0,

        // Boss Rush
        bossNumber: 1,
        bossesDefeated: 0,
        lastShrinkCheck: 0,

        // Quiz Marathon
        currentQuestion: null,
        quizStreak: 0,
        brainiacActive: false,
        brainiacActivatedAt: 0,
        questionsAnswered: 0,
      }

      // Pre-fetch the first quiz question if marathon
      if (type === 'quiz_marathon') {
        session.currentQuestion = fetchQuizQuestion()
      }

      return {
        success: true,
        type,
        config,
        gameStateOverrides,
        instructions,
      }
    } catch (err) {
      return {
        success: false,
        type,
        config: launcher.getMinigameConfig(type),
        gameStateOverrides: {},
        instructions: '',
        error: err instanceof Error ? err.message : 'Failed to launch minigame',
      }
    }
  }

  /**
   * End the current minigame session, record the result through the
   * launcher, persist the summary, and return it.
   */
  function endCurrentMinigame(
    score: number,
    timeElapsed: number,
    correctCount: number,
    wrongCount: number,
    bestCombo: number,
    extras?: Record<string, number>,
  ): MinigameResultSummary {
    try {
      if (session === null) {
        return makeNullSummary()
      }

      const accuracy = calcAccuracy(correctCount, wrongCount)
      const prevBest = launcher.getMinigameStats(session.type).bestScore
      const isNewBest = score > prevBest

      // Record through the launcher (updates leaderboard, stats, etc.)
      const result: MinigameResult = {
        score,
        timeElapsed,
        correctCount,
        wrongCount,
        accuracy,
        bestCombo,
        extras: extras ?? {},
      }
      launcher.recordMinigameResult(session.type, result)

      // Build the summary
      const summary: MinigameResultSummary = {
        type: session.type,
        name: session.config.name,
        emoji: session.config.emoji,
        score,
        timeElapsed,
        correctCount,
        wrongCount,
        accuracy,
        bestCombo,
        extras: extras ?? {},
        isNewBestScore: isNewBest,
        timestamp: Date.now(),
      }

      // Append to history
      recentResults.unshift(summary)
      if (recentResults.length > MEMORY_RESULTS_MAX) {
        recentResults = recentResults.slice(0, MEMORY_RESULTS_MAX)
      }

      // Persist combined in-memory + previously-stored results
      const stored = loadResults()
      stored.unshift(summary)
      saveResults(stored)

      // Clean up session
      launcher.endMinigame()
      session = null

      return summary
    } catch {
      if (session !== null) {
        launcher.endMinigame()
        session = null
      }
      return makeNullSummary()
    }
  }

  /** Abort the active session without recording a result. */
  function cancelMinigame(): void {
    try {
      if (session === null) return
      launcher.endMinigame()
      session = null
    } catch {
      session = null
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Active session state
  // ════════════════════════════════════════════════════════════════════════════

  function isActive(): boolean {
    try {
      return session !== null
    } catch {
      return false
    }
  }

  function getCurrentType(): MinigameType | null {
    try {
      return session?.type ?? null
    } catch {
      return null
    }
  }

  function getCurrentConfig(): MinigameConfig | null {
    try {
      return session?.config ?? null
    } catch {
      return null
    }
  }

  /** Remaining time in seconds. Returns 0 for modes without a time limit. */
  function getSessionTimeRemaining(): number {
    try {
      if (session === null) return 0
      const limit = session.config.timeLimit
      if (limit === null) return 0
      const elapsed = getSessionElapsed()
      return clamp(limit - elapsed, 0, limit)
    } catch {
      return 0
    }
  }

  /** Seconds elapsed since session started. */
  function getSessionElapsed(): number {
    try {
      if (session === null) return 0
      return (performance.now() - session.startTime) / 1000
    } catch {
      return 0
    }
  }

  function getInstructions(): string {
    try {
      return session?.instructions ?? ''
    } catch {
      return ''
    }
  }

  function isTimeUp(): boolean {
    try {
      if (session === null) return false
      const limit = session.config.timeLimit
      if (limit === null) return false
      return getSessionElapsed() >= limit
    } catch {
      return false
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Gameplay helpers
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Called when a word is eaten during an active minigame.  Computes score
   * with the appropriate per-mode formula and tracks combo / streak state.
   */
  function onWordEaten(word: string, isCorrect: boolean = true): ScoreAdjustment {
    try {
      if (session === null || !isCorrect) {
        return { points: 0, bonusMultiplier: 1, comboActive: false, isCorrect: false }
      }

      const elapsed = getSessionElapsed()
      const limit = session.config.timeLimit ?? 999

      if (session.type === 'scramble_blitz') {
        return handleScrambleCorrect(elapsed, limit)
      }

      // For boss_rush and quiz_marathon, generic word-eat scoring
      const base = session.config.basePoints
      const mult = diffMultiplier(elapsed, limit) * getScoreMultiplier()
      const comboActive = session.combo >= COMBO_THRESHOLD
      const comboMult = comboActive ? 1.5 : 1.0
      const points = Math.round(base * mult * comboMult)

      session.combo += 1
      if (session.combo > session.bestCombo) {
        session.bestCombo = session.combo
      }
      session.correctCount += 1
      session.score += points

      return {
        points,
        bonusMultiplier: comboMult * mult,
        comboActive,
        isCorrect: true,
      }
    } catch {
      return { points: 0, bonusMultiplier: 1, comboActive: false, isCorrect: false }
    }
  }

  /** Handle a correct answer in Scramble Blitz mode. */
  function handleScrambleCorrect(elapsed: number, limit: number): ScoreAdjustment {
    if (session === null || session.type !== 'scramble_blitz') {
      return { points: 0, bonusMultiplier: 1, comboActive: false, isCorrect: false }
    }

    const { points, newCombo, grantSpeedBoost } = computeScrambleScore(
      elapsed,
      limit,
      session.combo,
      session.correctCount,
    )

    const brainiacMult = session.brainiacActive ? 1.0 : 1.0 // no brainiac in scramble
    const comboActive = newCombo >= COMBO_THRESHOLD
    const finalPoints = Math.round(points * brainiacMult)

    session.combo = newCombo
    if (session.combo > session.bestCombo) {
      session.bestCombo = session.combo
    }
    session.correctCount += 1
    session.score += finalPoints
    session.wordsForSpeedBoost += 1

    if (grantSpeedBoost) {
      session.extras.speedBoostsGranted = (session.extras.speedBoostsGranted ?? 0) + 1
    }

    return {
      points: finalPoints,
      bonusMultiplier: comboActive ? 1.5 * diffMultiplier(elapsed, limit) : diffMultiplier(elapsed, limit),
      comboActive,
      isCorrect: true,
    }
  }

  /**
   * Called on a wrong answer.  Resets combo, applies penalty, and
   * returns the penalty details (mode-aware).
   */
  function onWrongAnswer(): PenaltyResult {
    try {
      if (session === null) {
        return { penalty: 0, segmentsLost: 0, newLength: 0 }
      }

      const penalty = session.config.penaltyPoints
      session.wrongCount += 1
      session.score = Math.max(0, session.score - penalty)
      session.combo = 0

      let segmentsLost = 0
      let currentLength = session.extras.snakeLength ?? 10

      if (session.type === 'quiz_marathon') {
        segmentsLost = 1
        currentLength = Math.max(2, currentLength - segmentsLost)
        session.extras.snakeLength = currentLength
        session.quizStreak = 0
        session.brainiacActive = false
      }

      return {
        penalty,
        segmentsLost,
        newLength: currentLength,
      }
    } catch {
      return { penalty: 0, segmentsLost: 0, newLength: 0 }
    }
  }

  /**
   * Boss Rush: called when a boss word is defeated.  Returns the score bonus
   * and advances the boss counter.
   */
  function onBossDefeated(bossNumber: number): number {
    try {
      if (session === null || session.type !== 'boss_rush') {
        return 0
      }

      const bonus = computeBossDefeatScore(bossNumber)
      session.score += bonus
      session.bossesDefeated += 1
      session.extras.bossesDefeated = session.bossesDefeated
      session.correctCount += 1

      // Advance to next boss wave
      session.bossNumber = bossNumber + 1
      session.extras.currentBoss = session.bossNumber

      return bonus
    } catch {
      return 0
    }
  }

  /**
   * Scramble Blitz: generate a scrambled version of a word using
   * the launcher's shuffle algorithm.
   */
  function getScrambledWord(originalWord: string): string {
    try {
      return launcher.generateScrambledWord(originalWord)
    } catch {
      return originalWord
    }
  }

  /**
   * Quiz Marathon: fetch the current question or rotate to a new one.
   * Returns null if no session is active or not a quiz.
   */
  function getQuizQuestion(): QuizQuestion | null {
    try {
      if (session === null || session.type !== 'quiz_marathon') {
        return null
      }

      // If brainiac mode just expired, deactivate
      if (session.brainiacActive && !isBrainiacActive(session.brainiacActivatedAt, performance.now())) {
        session.brainiacActive = false
      }

      // Return current question if we have one and it hasn't been answered yet
      if (session.currentQuestion !== null) {
        return session.currentQuestion
      }

      // Fetch a new question
      session.currentQuestion = fetchQuizQuestion()
      return session.currentQuestion
    } catch {
      return null
    }
  }

  /** Generate a quiz question from the launcher and wrap in our interface. */
  function fetchQuizQuestion(): QuizQuestion | null {
    try {
      const q = launcher.generateQuizQuestion()
      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        word: q.word,
        category: 'general',
      }
    } catch {
      return null
    }
  }

  /**
   * Quiz Marathon: submit an answer for the current question.
   * Returns true if correct, updates score/streak/brainiac state.
   */
  function submitQuizAnswer(selectedIndex: number): boolean {
    try {
      if (session === null || session.type !== 'quiz_marathon') {
        return false
      }

      const q = session.currentQuestion
      if (q === null) return false

      const isCorrect = selectedIndex === q.correctIndex
      const { points, newStreak, brainiacActive, snakeDelta } = computeQuizScore(
        isCorrect,
        session.quizStreak,
        session.brainiacActive,
      )

      session.quizStreak = newStreak
      session.questionsAnswered += 1
      session.score = Math.max(0, session.score + points)

      // Track snake length changes
      const currentLength = session.extras.snakeLength ?? 10
      session.extras.snakeLength = Math.max(2, currentLength + snakeDelta)

      // Activate brainiac mode if streak meets threshold
      if (brainiacActive && !session.brainiacActive) {
        session.brainiacActive = true
        session.brainiacActivatedAt = performance.now()
        session.extras.brainiacActivations = (session.extras.brainiacActivations ?? 0) + 1
      }
      // Deactivate brainiac if wrong answer broke the streak
      if (!brainiacActive) {
        session.brainiacActive = false
      }

      if (isCorrect) {
        session.correctCount += 1
      } else {
        session.wrongCount += 1
        session.combo = 0
      }

      // Mark question as consumed so next call to getQuizQuestion returns a fresh one
      session.currentQuestion = null

      return isCorrect
    } catch {
      return false
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Integration with main game state
  // ════════════════════════════════════════════════════════════════════════════

  /** Return the full set of game-state overrides for the active session. */
  function getGameStateOverrides(): Record<string, unknown> {
    try {
      if (session === null) return {}

      // Start from the launcher's overrides and layer on live session values
      const live: Record<string, unknown> = {
        ...session.overrides,
        minigameCombo: session.combo,
        minigameBestCombo: session.bestCombo,
        minigameCorrectCount: session.correctCount,
        minigameWrongCount: session.wrongCount,
        minigameScore: session.score,
      }

      // Boss Rush: track shrinking
      if (session.type === 'boss_rush') {
        const elapsed = getSessionElapsed()
        live.minigameBossNumber = session.bossNumber
        live.minigameBossesDefeated = session.bossesDefeated
        live.minigameShrinkSegments = bossRushShrinkSegments(elapsed)
      }

      // Quiz Marathon: brainiac mode state
      if (session.type === 'quiz_marathon') {
        live.minigameBrainiacMode = session.brainiacActive
        live.minigameBrainiacExpires = session.brainiacActive
          ? session.brainiacActivatedAt + BRAINIANC_DURATION_MS
          : 0
      }

      // Scramble Blitz: speed boost tracking
      if (session.type === 'scramble_blitz') {
        live.minigameWordsForSpeedBoost = session.wordsForSpeedBoost
      }

      return live
    } catch {
      return {}
    }
  }

  /**
   * Compute the current effective score multiplier.
   * Formula: base difficulty × combo bonus × brainiac mode.
   */
  function getScoreMultiplier(): number {
    try {
      if (session === null) return 1

      const elapsed = getSessionElapsed()
      const limit = session.config.timeLimit ?? 999
      const difficulty = diffMultiplier(elapsed, limit)

      const comboBonus = session.combo >= COMBO_THRESHOLD ? 1.5 : 1.0
      const brainiacBonus = session.brainiacActive ? 2.0 : 1.0

      return difficulty * comboBonus * brainiacBonus
    } catch {
      return 1
    }
  }

  /** Whether the active minigame requires wall-wrapping. */
  function shouldWrapWalls(): boolean {
    try {
      return session?.config.wallWrap ?? false
    } catch {
      return false
    }
  }

  /** Whether the active minigame checks self-collision. */
  function shouldCheckSelfCollision(): boolean {
    try {
      return session?.config.selfCollisionEnabled ?? true
    } catch {
      return true
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Stats and leaderboard
  // ════════════════════════════════════════════════════════════════════════════

  /** Get stats for all minigame types. */
  function getAllStats(): Record<MinigameType, MinigameStats> {
    try {
      const result = {} as Record<MinigameType, MinigameStats>
      for (const t of ALL_TYPES) {
        result[t] = launcher.getMinigameStats(t)
      }
      return result
    } catch {
      const empty = { bestScore: 0, timesPlayed: 0, totalScore: 0, bestTime: 0, bestCombo: 0, totalCorrect: 0, leaderboard: [] }
      return {
        scramble_blitz: { ...empty },
        boss_rush: { ...empty },
        quiz_marathon: { ...empty },
      }
    }
  }

  /** Get the leaderboard for a specific minigame type. */
  function getLeaderboard(type: MinigameType): Array<{ score: number; date: string; rank: number }> {
    try {
      return launcher.getLeaderboard(type)
    } catch {
      return []
    }
  }

  /** Get today's daily challenge with name and emoji. */
  function getDailyMinigame(): { type: MinigameType; name: string; emoji: string } {
    try {
      const daily = launcher.getDailyChallenge()
      const config = launcher.getMinigameConfig(daily.type)
      return { type: daily.type, name: config.name, emoji: config.emoji }
    } catch {
      return { type: 'scramble_blitz', name: 'Word Scramble Blitz', emoji: '🔤' }
    }
  }

  /** Total number of minigame sessions played across all types. */
  function getPlayCount(): number {
    try {
      let total = 0
      for (const t of ALL_TYPES) {
        total += launcher.getMinigameStats(t).timesPlayed
      }
      return total
    } catch {
      return 0
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Results history
  // ════════════════════════════════════════════════════════════════════════════

  /** Get recent results from memory (up to `limit`, default 10). */
  function getRecentResults(limit: number = 10): MinigameResultSummary[] {
    try {
      return recentResults.slice(0, clamp(limit, 1, MEMORY_RESULTS_MAX))
    } catch {
      return []
    }
  }

  /** Best score ever achieved for a given minigame type. */
  function getBestScore(type: MinigameType): number {
    try {
      return launcher.getMinigameStats(type).bestScore
    } catch {
      return 0
    }
  }

  /** Average score across all sessions for a given minigame type. */
  function getAverageScore(type: MinigameType): number {
    try {
      const stats = launcher.getMinigameStats(type)
      if (stats.timesPlayed === 0) return 0
      return Math.round(stats.totalScore / stats.timesPlayed)
    } catch {
      return 0
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Internal utility
  // ════════════════════════════════════════════════════════════════════════════

  /** Build a zeroed-out summary for error / no-session cases. */
  function makeNullSummary(): MinigameResultSummary {
    return {
      type: 'scramble_blitz',
      name: 'N/A',
      emoji: '',
      score: 0,
      timeElapsed: 0,
      correctCount: 0,
      wrongCount: 0,
      accuracy: 0,
      bestCombo: 0,
      extras: {},
      isNewBestScore: false,
      timestamp: Date.now(),
    }
  }

  // ── Return the wire surface ──────────────────────────────────────────────────
  return {
    // Session management
    launchMinigame,
    endCurrentMinigame,
    cancelMinigame,

    // Active session state
    isActive,
    getCurrentType,
    getCurrentConfig,
    getSessionTimeRemaining,
    getSessionElapsed,
    getInstructions,
    isTimeUp,

    // Gameplay helpers
    onWordEaten,
    onWrongAnswer,
    onBossDefeated,
    getScrambledWord,
    getQuizQuestion,
    submitQuizAnswer,

    // Integration with main game state
    getGameStateOverrides,
    getScoreMultiplier,
    shouldWrapWalls,
    shouldCheckSelfCollision,

    // Stats and leaderboard
    getAllStats,
    getLeaderboard,
    getDailyMinigame,
    getPlayCount,

    // Results history
    getRecentResults,
    getBestScore,
    getAverageScore,
  }
}
