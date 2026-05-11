/**
 * realtime-dashboard-wire.ts — Real-time data buffer for the Word Snake dashboard.
 *
 * Pure-logic module (no React) that accumulates game events into an in-memory
 * buffer and derives live dashboard snapshots on every push. History (up to 50
 * game summaries) persists to `ws_realtime_dashboard` in localStorage.
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ws_realtime_dashboard'
const MAX_HISTORY = 50
const TREND_WINDOW = 5

// ── Exported Interfaces ───────────────────────────────────────────────────────

/** Snapshot of aggregated quick-stats, updated on every event push. */
export interface QuickStatsSnapshot {
  gamesPlayed: number
  totalScore: number
  bestScore: number
  averageScore: number
  totalWords: number
  averageCombo: number
  scoreTrend: 'up' | 'down' | 'stable'
  currentStreak: number
}

/** Stats for the current app session (resets on mount or session change). */
export interface SessionStats {
  gamesPlayed: number
  totalScore: number
  totalTime: number
  totalWords: number
  bestCombo: number
  longestGame: number
}

/** Live HUD overlay data derived from the currently running game. */
export interface LiveHudData {
  currentScore: number
  wordsPerMinute: number
  averagePointsPerWord: number
  activePowerUpCount: number
  currentCombo: number
  timeElapsed: number
  efficiency: number // points per minute
}

/** Persisted summary of a single completed game. */
export interface GameSummary {
  score: number
  wordsEaten: number
  timeElapsed: number
  mode: string
  difficulty: string
  bestCombo: number
  timestamp: number
}

/** Public API surface exposed by the wire factory. */
export interface RealtimeDashboardWire {
  /** Record a score change and its source label. */
  pushScoreEvent(score: number, source: string): void
  /** Record that a word was eaten by the snake. */
  pushWordEatEvent(word: string, category: string, points: number): void
  /** Record a combo milestone or change. */
  pushComboEvent(combo: number): void
  /** Record that a new game session has started. */
  pushGameStartEvent(mode: string, difficulty: string): void
  /** Record that the current game session has ended. */
  pushGameEndEvent(score: number, time: number, words: number): void
  /** Record a power-up activation (assumed 10 s duration). */
  pushPowerUpEvent(type: string): void
  /** Record an achievement unlock. */
  pushAchievementEvent(name: string): void
  /** Compute aggregated quick-stats from history + live game. */
  getRealtimeQuickStats(): QuickStatsSnapshot
  /** Get stats accumulated during the current app session. */
  getSessionStats(): SessionStats
  /** Get live HUD data for the active game. */
  getLiveHudData(): LiveHudData
  /** Compare recent performance to all-time average. */
  getScoreTrend(): 'up' | 'down' | 'stable'
  /** Retrieve game history, newest first, optionally limited. */
  getHistory(limit?: number): GameSummary[]
  /** Clear all persisted and in-memory history. */
  clearHistory(): void
  /** Reset the session-level accumulator (e.g. on component mount). */
  resetSession(): void
}

// ── Internal Types ────────────────────────────────────────────────────────────

interface LiveState {
  active: boolean
  score: number
  wordsEaten: number
  totalPoints: number
  combo: number
  bestCombo: number
  mode: string
  difficulty: string
  startedAt: number
  activePowerUps: Map<string, number> // type → expiry timestamp
}

const LIVE_DEFAULT: LiveState = {
  active: false, score: 0, wordsEaten: 0, totalPoints: 0,
  combo: 0, bestCombo: 0, mode: '', difficulty: '',
  startedAt: 0, activePowerUps: new Map(),
}

interface InternalState {
  history: GameSummary[]
  session: {
    gamesPlayed: number; totalScore: number; totalTime: number
    totalWords: number; bestCombo: number; longestGame: number
  }
  live: LiveState
  allTimeComboSum: number
}

// ── SSR-safe localStorage helpers ─────────────────────────────────────────────

/** Load and validate history from localStorage. */
function loadHistory(): GameSummary[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e: unknown): e is GameSummary =>
        typeof e === 'object' && e !== null &&
        typeof (e as GameSummary).score === 'number' &&
        typeof (e as GameSummary).timestamp === 'number',
    )
  } catch { return [] }
}

/** Persist history to localStorage (silent on failure). */
function persistHistory(history: GameSummary[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)) } catch { /* ignore */ }
}

// ── Trend & Streak Helpers ────────────────────────────────────────────────────

/**
 * Compare the average score of the last `TREND_WINDOW` games to the
 * all-time average. Uses a 5 % band to avoid flip-flopping.
 */
function computeScoreTrend(history: GameSummary[]): 'up' | 'down' | 'stable' {
  const n = history.length
  if (n < 2) return 'stable'
  const overallAvg = history.reduce((s, g) => s + g.score, 0) / n
  const recent = history.slice(Math.max(0, n - TREND_WINDOW))
  const recentAvg = recent.reduce((s, g) => s + g.score, 0) / recent.length
  if (overallAvg === 0) return recentAvg > 0 ? 'up' : 'stable'
  const threshold = overallAvg * 0.05
  if (recentAvg > overallAvg + threshold) return 'up'
  if (recentAvg < overallAvg - threshold) return 'down'
  return 'stable'
}

/** Convert a timestamp to a `YYYY-MM-DD` string. */
function toDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Calculate consecutive calendar days (ending today or yesterday) with ≥1 game.
 */
function computeCurrentStreak(history: GameSummary[]): number {
  if (history.length === 0) return 0
  const daySet = new Set<string>()
  for (const g of history) daySet.add(toDayKey(g.timestamp))
  const days = Array.from(daySet).sort().reverse()
  const today = toDayKey(Date.now())
  const yesterday = toDayKey(Date.now() - 86_400_000)
  if (days[0] !== today && days[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const expected = toDayKey(new Date(days[i - 1]).getTime() - 86_400_000)
    if (days[i] === expected) streak++
    else break
  }
  return streak
}

/** Prune expired power-up entries from the live map. */
function pruneExpiredPowerUps(live: LiveState): void {
  const now = Date.now()
  for (const [key, expiry] of live.activePowerUps) {
    if (expiry <= now) live.activePowerUps.delete(key)
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a new `RealtimeDashboardWire` instance.
 *
 * Hydrates history from localStorage on creation (SSR-safe). Design for a
 * module-level singleton shared across the application lifecycle.
 */
export function createRealtimeDashboardWire(): RealtimeDashboardWire {
  const state: InternalState = {
    history: loadHistory(),
    session: { gamesPlayed: 0, totalScore: 0, totalTime: 0, totalWords: 0, bestCombo: 0, longestGame: 0 },
    live: { ...LIVE_DEFAULT, activePowerUps: new Map() },
    allTimeComboSum: 0,
  }
  // Rebuild running combo sum from hydrated history
  state.allTimeComboSum = state.history.reduce((s, g) => s + g.bestCombo, 0)

  // ── Event Pushers ────────────────────────────────────────────────────────

  function pushScoreEvent(score: number, _source: string): void {
    if (state.live.active) state.live.score = score
  }

  function pushWordEatEvent(_word: string, _category: string, points: number): void {
    if (state.live.active) {
      state.live.wordsEaten++
      state.live.totalPoints += points
    }
    state.session.totalWords++
  }

  function pushComboEvent(combo: number): void {
    if (state.live.active) {
      state.live.combo = combo
      if (combo > state.live.bestCombo) state.live.bestCombo = combo
    }
    if (combo > state.session.bestCombo) state.session.bestCombo = combo
  }

  function pushGameStartEvent(mode: string, difficulty: string): void {
    // Abandon any previously active game (no summary saved)
    state.live = { ...LIVE_DEFAULT, active: true, mode, difficulty, startedAt: Date.now(), activePowerUps: new Map() }
  }

  function pushGameEndEvent(score: number, time: number, words: number): void {
    const bestCombo = state.live.bestCombo

    // ── Build & persist GameSummary ──────────────────────────────────────
    const summary: GameSummary = {
      score, wordsEaten: words, timeElapsed: time,
      mode: state.live.mode || 'classic', difficulty: state.live.difficulty || 'normal',
      bestCombo, timestamp: Date.now(),
    }
    state.history.push(summary)

    // Trim to max size, adjusting running combo sum for removed entries
    if (state.history.length > MAX_HISTORY) {
      const removed = state.history.splice(0, state.history.length - MAX_HISTORY)
      for (const r of removed) state.allTimeComboSum -= r.bestCombo
    }
    state.allTimeComboSum += bestCombo
    persistHistory(state.history)

    // ── Update session ───────────────────────────────────────────────────
    state.session.gamesPlayed++
    state.session.totalScore += score
    state.session.totalTime += time
    state.session.totalWords += words
    if (bestCombo > state.session.bestCombo) state.session.bestCombo = bestCombo
    if (time > state.session.longestGame) state.session.longestGame = time

    // ── Reset live state ─────────────────────────────────────────────────
    state.live = { ...LIVE_DEFAULT, activePowerUps: new Map() }
  }

  function pushPowerUpEvent(type: string): void {
    if (state.live.active) {
      state.live.activePowerUps.set(type, Date.now() + 10_000)
      pruneExpiredPowerUps(state.live)
    }
  }

  function pushAchievementEvent(_name: string): void {
    // Placeholder for future analytics hooks — no state mutation needed.
  }

  // ── Snapshot Getters ───────────────────────────────────────────────────────

  function getRealtimeQuickStats(): QuickStatsSnapshot {
    const h = state.history
    const n = h.length
    const historyTotalScore = h.reduce((s, g) => s + g.score, 0)
    const historyTotalWords = h.reduce((s, g) => s + g.wordsEaten, 0)
    const bestScore = n > 0 ? Math.max(...h.map((g) => g.score)) : 0

    // Fold in the in-progress game so the dashboard is never stale
    const liveScore = state.live.active ? state.live.score : 0
    const liveWords = state.live.active ? state.live.wordsEaten : 0
    const gamesPlayed = n + (state.live.active ? 1 : 0)
    const totalScore = historyTotalScore + liveScore
    const totalWords = historyTotalWords + liveWords

    return {
      gamesPlayed,
      totalScore,
      bestScore,
      averageScore: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
      totalWords,
      averageCombo: n > 0 ? Math.round((state.allTimeComboSum / n) * 10) / 10 : 0,
      scoreTrend: computeScoreTrend(h),
      currentStreak: computeCurrentStreak(h),
    }
  }

  function getSessionStats(): SessionStats {
    return { ...state.session }
  }

  function getLiveHudData(): LiveHudData {
    pruneExpiredPowerUps(state.live)
    const elapsed = state.live.active ? (Date.now() - state.live.startedAt) / 1000 : 0

    return {
      currentScore: state.live.score,
      wordsPerMinute: elapsed > 0
        ? Math.round((state.live.wordsEaten / elapsed) * 60 * 10) / 10 : 0,
      averagePointsPerWord: state.live.wordsEaten > 0
        ? Math.round((state.live.totalPoints / state.live.wordsEaten) * 10) / 10 : 0,
      activePowerUpCount: state.live.activePowerUps.size,
      currentCombo: state.live.combo,
      timeElapsed: Math.round(elapsed),
      efficiency: elapsed > 0
        ? Math.round((state.live.score / (elapsed / 60)) * 10) / 10 : 0,
    }
  }

  function getScoreTrend(): 'up' | 'down' | 'stable' {
    return computeScoreTrend(state.history)
  }

  function getHistory(limit?: number): GameSummary[] {
    const sorted = [...state.history].reverse()
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  }

  function clearHistory(): void {
    state.history = []
    state.allTimeComboSum = 0
    persistHistory([])
  }

  function resetSession(): void {
    state.session = { gamesPlayed: 0, totalScore: 0, totalTime: 0, totalWords: 0, bestCombo: 0, longestGame: 0 }
  }

  return {
    pushScoreEvent, pushWordEatEvent, pushComboEvent,
    pushGameStartEvent, pushGameEndEvent, pushPowerUpEvent, pushAchievementEvent,
    getRealtimeQuickStats, getSessionStats, getLiveHudData,
    getScoreTrend, getHistory, clearHistory, resetSession,
  }
}
