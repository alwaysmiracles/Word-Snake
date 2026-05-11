'use client'

// ─── Types ───────────────────────────────────────────────────────────────────
/** A single completed game session snapshot */
export type GameSession = {
  id: string; timestamp: number; score: number; wordsEaten: number;
  duration: number; difficulty: string; wordsPerMinute: number;
  longestCombo: number; bossDefeated: number; quizzesCorrect: number;
}

/** Trend analysis for a single metric across recent sessions */
export type StatsTrend = {
  metric: string; values: number[]; direction: 'up' | 'down' | 'stable';
  percentChange: number; average: number; best: number; worst: number;
}

/** Full comparison result between the current session and history */
export type ComparisonSummary = {
  currentSession: GameSession; previousSession: GameSession | null;
  trends: StatsTrend[];
  overallStats: {
    totalGames: number; avgScore: number; avgWordsPerMin: number;
    bestScore: number; bestCombo: number; totalWordsCollected: number;
    totalPlayTime: number; favoriteDifficulty: string;
  };
  performanceRating: 'excellent' | 'good' | 'average' | 'below_average';
  ratingEmoji: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
export const STATS_STORAGE_KEY = 'wordsnake_game_sessions'
export const MAX_STORED_SESSIONS = 50

const TREND_METRICS = [
  'score', 'wordsEaten', 'wordsPerMinute',
  'duration', 'longestCombo', 'bossDefeated', 'quizzesCorrect',
] as const

const METRIC_LABELS: Record<string, string> = {
  score: 'Score', wordsEaten: 'Words Eaten', wordsPerMinute: 'Words/Min',
  duration: 'Duration (s)', longestCombo: 'Longest Combo',
  bossDefeated: 'Bosses Defeated', quizzesCorrect: 'Quizzes Correct',
}

const ARROWS: Record<string, string> = { up: '📈', down: '📉', stable: '➡️' }
const RATING_EMOJI: Record<string, string> = {
  excellent: '🌟', good: '👍', average: '😐', below_average: '💪',
}

// ─── Storage ─────────────────────────────────────────────────────────────────
/** Save a session, trimming oldest entries beyond MAX_STORED_SESSIONS */
export function saveSession(session: GameSession): void {
  if (typeof window === 'undefined') return
  try {
    const all = getSessions()
    all.unshift(session)
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(all.slice(0, MAX_STORED_SESSIONS)))
  } catch { /* quota exceeded */ }
}

/** Load all stored sessions sorted newest-first */
export function getSessions(): GameSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GameSession[]).sort((a, b) => b.timestamp - a.timestamp) : []
  } catch { return [] }
}

/** Return the N most recent sessions */
export function getLastNSessions(n: number): GameSession[] {
  return getSessions().slice(0, n)
}

// ─── Trend Analysis ──────────────────────────────────────────────────────────
/** Build a StatsTrend for one metric across sessions */
function buildTrend(metric: string, sessions: GameSession[]): StatsTrend {
  // Reverse to chronological order
  const vals = [...sessions].reverse().map(s => (s as unknown as Record<string, number>)[metric] ?? 0)
  const average = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  const best = vals.length ? Math.max(...vals) : 0
  const worst = vals.length ? Math.min(...vals) : 0

  // Percent change: latest vs previous
  let percentChange = 0
  if (vals.length >= 2) {
    const p = vals[vals.length - 2], c = vals[vals.length - 1]
    percentChange = p !== 0 ? ((c - p) / p) * 100 : (c > 0 ? 100 : 0)
  }

  // Direction: latest vs rolling average of earlier values
  let direction: StatsTrend['direction'] = 'stable'
  if (vals.length >= 2) {
    const earlierAvg = vals.slice(0, -1).reduce((a, b) => a + b, 0) / (vals.length - 1)
    const threshold = Math.max(Math.abs(earlierAvg) * 0.05, 1)
    if (vals[vals.length - 1] > earlierAvg + threshold) direction = 'up'
    else if (vals[vals.length - 1] < earlierAvg - threshold) direction = 'down'
  }

  return { metric, values: vals, direction, percentChange, average, best, worst }
}

/** Calculate trends for all tracked metrics */
export function calculateTrends(sessions: GameSession[]): StatsTrend[] {
  return TREND_METRICS.map(m => buildTrend(m, sessions))
}

// ─── Comparison ──────────────────────────────────────────────────────────────
/** Rate performance by percentile of current score in history */
function ratePerformance(score: number, allScores: number[]): ComparisonSummary['performanceRating'] {
  if (allScores.length < 3) return 'average'
  const sorted = [...allScores].sort((a, b) => a - b)
  const pct = sorted.filter(s => s < score).length / sorted.length
  if (pct >= 0.90) return 'excellent'
  if (pct >= 0.60) return 'good'
  if (pct >= 0.25) return 'average'
  return 'below_average'
}

/** Build a full ComparisonSummary for a session vs stored history */
export function compareSessions(current: GameSession, sessions: GameSession[]): ComparisonSummary {
  const all = [current, ...sessions.filter(s => s.id !== current.id)]
  const previous = sessions.find(s => s.id !== current.id) ?? null
  const n = all.length

  // Aggregate stats across all games
  const diffCounts: Record<string, number> = {}
  all.forEach(s => { diffCounts[s.difficulty] = (diffCounts[s.difficulty] ?? 0) + 1 })
  const favoriteDifficulty = Object.entries(diffCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

  const overallStats = {
    totalGames: n,
    avgScore: n ? Math.round(all.reduce((a, s) => a + s.score, 0) / n) : 0,
    avgWordsPerMin: n ? Math.round(all.reduce((a, s) => a + s.wordsPerMinute, 0) / n * 10) / 10 : 0,
    bestScore: Math.max(...all.map(s => s.score), 0),
    bestCombo: Math.max(...all.map(s => s.longestCombo), 0),
    totalWordsCollected: all.reduce((a, s) => a + s.wordsEaten, 0),
    totalPlayTime: all.reduce((a, s) => a + s.duration, 0),
    favoriteDifficulty,
  }

  const performanceRating = ratePerformance(current.score, all.map(s => s.score))

  return {
    currentSession: current, previousSession: previous,
    trends: calculateTrends(all.slice(0, 10)),
    overallStats, performanceRating, ratingEmoji: RATING_EMOJI[performanceRating],
  }
}

// ─── Text Generation ─────────────────────────────────────────────────────────
/** Generate a human-readable multi-line comparison string with emojis */
export function generateComparisonText(summary: ComparisonSummary): string {
  const { overallStats: o, trends, currentSession: cur, previousSession: prev } = summary
  const lines = [
    `${summary.ratingEmoji} Performance: ${summary.performanceRating.replace('_', ' ').toUpperCase()}`,
    `📊 Games played: ${o.totalGames}  |  Best score: ${o.bestScore}`, '', '── Recent Trends ──',
  ]

  for (const t of trends) {
    const sign = t.percentChange >= 0 ? '+' : ''
    const val = t.metric === 'duration'
      ? `${(t.values[t.values.length - 1] / 1000).toFixed(1)}s`
      : t.values[t.values.length - 1]
    lines.push(`${ARROWS[t.direction]} ${METRIC_LABELS[t.metric]}: ${val} (${sign}${t.percentChange.toFixed(1)}% vs last game)`)
  }

  if (prev) {
    const d = cur.score - prev.score
    lines.push('', `🎯 Score vs previous: ${d >= 0 ? '+' : ''}${d}`)
  }
  return lines.join('\n')
}

// ─── Color Utility ───────────────────────────────────────────────────────────
/** Return a hex color for a given performance rating */
export function getPerformanceColor(rating: string): string {
  return (
    { excellent: '#fbbf24', good: '#22c55e', average: '#3b82f6', below_average: '#f97316' } as Record<string, string>
  )[rating] ?? '#6b7280'
}
