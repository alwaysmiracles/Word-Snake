// Player Statistics Comparison Wire for Word Snake
// Standalone module — reads game history from localStorage and provides
// time-based comparisons, trends, streaks, skill ratings, and insights.

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimePeriod =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'allTime'

export interface GameRecord {
  id: string
  timestamp: number // epoch ms
  score: number
  words: number
  combo: number
  playTime: number // ms
  categories: string[]
  wordsList?: string[]
  snakeLength?: number
  difficulty?: string
}

export interface PeriodStats {
  gamesPlayed: number
  totalScore: number
  avgScore: number
  bestScore: number
  totalWords: number
  avgWords: number
  bestCombo: number
  totalPlayTime: number
  avgPlayTime: number
  uniqueWords: number
  categories: Record<string, number>
}

export interface PeriodComparison {
  period1: TimePeriod
  period2: TimePeriod
  stats1: PeriodStats
  stats2: PeriodStats
  changes: Record<string, { value: number; percentChange: number; direction: 'up' | 'down' | 'same' }>
}

export type TrendDirection = 'improving' | 'declining' | 'stable'

export interface MetricTrend {
  metric: string
  direction: TrendDirection
  magnitude: number // percent change
}

export interface StreakEntry {
  startDate: string
  endDate: string
  days: number
}

export interface StreakPrediction {
  willContinue: boolean
  confidence: number // 0-1
  reason: string
}

export interface PeakHour {
  hour: number
  avgScore: number
  gamesPlayed: number
}

export interface PersonalBest {
  highestScore: { value: number; date: string }
  longestSnake: { value: number; date: string }
  mostWords: { value: number; date: string }
  biggestCombo: { value: number; date: string }
  longestGame: { value: number; date: string }
}

export interface Milestone {
  type: string
  value: number
  date: string
  label: string
}

export interface SkillRating {
  rating: number // 0-5000
  tier: string
  progress: number // 0-1 within current tier
  gamesToNextTier: number
}

export interface WeakMetric {
  metric: string
  current: number
  best: number
  gap: number // percent below best
  suggestion: string
}

export interface ImprovementArea {
  area: string
  priority: number // 1-5, 1 = highest
  current: number
  target: number
  suggestion: string
}

export interface Strength {
  metric: string
  value: number
  description: string
}

export interface DailyScoreEntry {
  date: string
  score: number
  words: number
  time: number
}

export interface HourlyBucket {
  hour: number
  avgScore: number
  avgWords: number
  gamesPlayed: number
}

export interface ScoreBucket {
  label: string
  min: number
  max: number
  count: number
}

export interface CategoryPerformanceEntry {
  category: string
  gamesPlayed: number
  totalScore: number
  avgScore: number
  wordCount: number
}

export interface ComparisonOverview {
  todayStats: PeriodStats
  weekStats: PeriodStats
  consistencyScore: number
  skillTier: string
  currentStreak: number
  topTrend: MetricTrend
}

export interface WeeklyReport {
  periodLabel: string
  gamesPlayed: number
  totalScore: number
  avgScore: number
  bestScore: number
  highlights: string[]
  lowlights: string[]
  summary: string
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_player_stats_compare'
const GAME_HISTORY_KEY = 'wordsnake_game_sessions'
const FALLBACK_HISTORY_KEY = 'ws_game_stats'

function safeGetJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeSetJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota exceeded */
  }
}

/** Load game records from the primary or fallback history key */
function loadGameRecords(): GameRecord[] {
  let records = safeGetJSON<GameRecord[]>(GAME_HISTORY_KEY, [])
  if (!records.length) {
    records = safeGetJSON<GameRecord[]>(FALLBACK_HISTORY_KEY, [])
  }
  return records.sort((a, b) => a.timestamp - b.timestamp)
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function toDateString(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStart(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function yesterdayStart(): number {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function yesterdayEnd(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getWeekStart(offset: number): number {
  const d = new Date()
  d.setDate(d.getDate() - offset - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getMonthStart(offset: number): number {
  const d = new Date()
  d.setMonth(d.getMonth() - offset, 1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getDateRange(period: TimePeriod): [number, number] {
  const now = Date.now()
  switch (period) {
    case 'today':
      return [todayStart(), now]
    case 'yesterday':
      return [yesterdayStart(), yesterdayEnd()]
    case 'thisWeek':
      return [getWeekStart(0), now]
    case 'lastWeek':
      return [getWeekStart(1), getWeekStart(0)]
    case 'thisMonth':
      return [getMonthStart(0), now]
    case 'lastMonth':
      return [getMonthStart(1), getMonthStart(0)]
    case 'allTime':
      return [0, now]
  }
}

// ─── 1. Time Period Stats ────────────────────────────────────────────────────

function buildPeriodStats(records: GameRecord[]): PeriodStats {
  if (!records.length) {
    return {
      gamesPlayed: 0, totalScore: 0, avgScore: 0, bestScore: 0,
      totalWords: 0, avgWords: 0, bestCombo: 0, totalPlayTime: 0,
      avgPlayTime: 0, uniqueWords: 0, categories: {},
    }
  }

  const n = records.length
  const totalScore = records.reduce((s, r) => s + r.score, 0)
  const totalWords = records.reduce((s, r) => s + r.words, 0)
  const totalPlayTime = records.reduce((s, r) => s + r.playTime, 0)
  const bestCombo = Math.max(...records.map(r => r.combo))
  const categories: Record<string, number> = {}
  const uniqueWords = new Set<string>()

  for (const r of records) {
    for (const cat of r.categories ?? []) {
      categories[cat] = (categories[cat] ?? 0) + 1
    }
    for (const w of r.wordsList ?? []) {
      uniqueWords.add(w.toLowerCase())
    }
  }

  return {
    gamesPlayed: n,
    totalScore,
    avgScore: Math.round(totalScore / n),
    bestScore: Math.max(...records.map(r => r.score)),
    totalWords,
    avgWords: Math.round(totalWords / n),
    bestCombo,
    totalPlayTime,
    avgPlayTime: Math.round(totalPlayTime / n),
    uniqueWords: uniqueWords.size,
    categories,
  }
}

export function getPeriodStats(period: TimePeriod): PeriodStats {
  try {
    const all = loadGameRecords()
    const [start, end] = getDateRange(period)
    const filtered = all.filter(r => r.timestamp >= start && r.timestamp <= end)
    return buildPeriodStats(filtered)
  } catch {
    return buildPeriodStats([])
  }
}

// ─── 2. Period Comparison ────────────────────────────────────────────────────

export function comparePeriods(period1: TimePeriod, period2: TimePeriod): PeriodComparison {
  try {
    const stats1 = getPeriodStats(period1)
    const stats2 = getPeriodStats(period2)

    const metricKeys: (keyof PeriodStats)[] = [
      'gamesPlayed', 'totalScore', 'avgScore', 'bestScore',
      'totalWords', 'avgWords', 'bestCombo', 'totalPlayTime',
      'avgPlayTime', 'uniqueWords',
    ]

    const changes: PeriodComparison['changes'] = {}
    for (const key of metricKeys) {
      const v1 = stats1[key] as number
      const v2 = stats2[key] as number
      const percentChange = v1 !== 0 ? ((v2 - v1) / v1) * 100 : (v2 > 0 ? 100 : 0)
      const direction = percentChange > 2 ? 'up' as const : percentChange < -2 ? 'down' as const : 'same' as const
      changes[key] = { value: v2 - v1, percentChange, direction }
    }

    return { period1, period2, stats1, stats2, changes }
  } catch {
    return {
      period1, period2,
      stats1: buildPeriodStats([]), stats2: buildPeriodStats([]), changes: {},
    }
  }
}

export function getTrend(period: TimePeriod): MetricTrend[] {
  try {
    const all = loadGameRecords()
    const [start, end] = getDateRange(period)
    const filtered = all.filter(r => r.timestamp >= start && r.timestamp <= end)

    if (filtered.length < 3) {
      return [
        { metric: 'score', direction: 'stable', magnitude: 0 },
        { metric: 'words', direction: 'stable', magnitude: 0 },
        { metric: 'combo', direction: 'stable', magnitude: 0 },
        { metric: 'playTime', direction: 'stable', magnitude: 0 },
      ]
    }

    const metrics: { key: string; extractor: (r: GameRecord) => number }[] = [
      { key: 'score', extractor: r => r.score },
      { key: 'words', extractor: r => r.words },
      { key: 'combo', extractor: r => r.combo },
      { key: 'playTime', extractor: r => r.playTime },
    ]

    return metrics.map(({ key, extractor }) => {
      const half = Math.floor(filtered.length / 2)
      const firstHalf = filtered.slice(0, half).map(extractor)
      const secondHalf = filtered.slice(half).map(extractor)

      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const magnitude = avg1 !== 0 ? ((avg2 - avg1) / avg1) * 100 : 0

      let direction: TrendDirection = 'stable'
      if (magnitude > 5) direction = 'improving'
      else if (magnitude < -5) direction = 'declining'

      return { metric: key, direction, magnitude: Math.round(magnitude * 10) / 10 }
    })
  } catch {
    return [
      { metric: 'score', direction: 'stable', magnitude: 0 },
      { metric: 'words', direction: 'stable', magnitude: 0 },
      { metric: 'combo', direction: 'stable', magnitude: 0 },
      { metric: 'playTime', direction: 'stable', magnitude: 0 },
    ]
  }
}

export function getTrendSummary(): string {
  try {
    const weekTrend = getTrend('thisWeek')
    const prevWeekTrend = getTrend('lastWeek')

    const improving = weekTrend.filter(t => t.direction === 'improving')
    const declining = weekTrend.filter(t => t.direction === 'declining')

    if (improving.length === 0 && declining.length === 0) {
      return 'Your performance has been stable this week. Keep playing to build momentum!'
    }

    const parts: string[] = []

    if (improving.length > 0) {
      const metricNames = improving.map(t => t.metric).join(', ')
      parts.push(`Your ${metricNames} are improving this week`)
    }
    if (declining.length > 0) {
      const metricNames = declining.map(t => t.metric).join(', ')
      parts.push(`Your ${metricNames} have dipped slightly`)
    }

    if (prevWeekTrend.length && improving.length > declining.length) {
      parts.push('and the trajectory is looking positive compared to last week.')
    } else if (declining.length > improving.length) {
      parts.push('. Consider focusing on consistency to get back on track.')
    } else {
      parts.push('.')
    }

    return parts.join(' ')
  } catch {
    return 'Not enough data to generate a trend summary. Play a few games first!'
  }
}

// ─── 3. Streak Analysis ──────────────────────────────────────────────────────

function computeStreaks(records: GameRecord[]): StreakEntry[] {
  if (!records.length) return []

  const playDates = Array.from(new Set(records.map(r => toDateString(r.timestamp)))).sort()

  const streaks: StreakEntry[] = []
  let currentStart = playDates[0]
  let prevDate = playDates[0]

  for (let i = 1; i < playDates.length; i++) {
    const curr = new Date(playDates[i])
    const prev = new Date(prevDate)
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)

    if (diffDays === 1) {
      prevDate = playDates[i]
    } else {
      streaks.push({
        startDate: currentStart,
        endDate: prevDate,
        days: Math.round((new Date(prevDate).getTime() - new Date(currentStart).getTime()) / 86400000) + 1,
      })
      currentStart = playDates[i]
      prevDate = playDates[i]
    }
  }

  streaks.push({
    startDate: currentStart,
    endDate: prevDate,
    days: Math.round((new Date(prevDate).getTime() - new Date(currentStart).getTime()) / 86400000) + 1,
  })

  return streaks
}

export function getCurrentStreak(): number {
  try {
    const records = loadGameRecords()
    if (!records.length) return 0
    const streaks = computeStreaks(records)
    if (!streaks.length) return 0
    const last = streaks[streaks.length - 1]
    const today = toDateString(Date.now())
    const yesterday = toDateString(Date.now() - 86400000)
    if (last.endDate === today || last.endDate === yesterday) {
      return last.days
    }
    return 0
  } catch {
    return 0
  }
}

export function getLongestStreak(): number {
  try {
    const records = loadGameRecords()
    const streaks = computeStreaks(records)
    return streaks.length ? Math.max(...streaks.map(s => s.days)) : 0
  } catch {
    return 0
  }
}

export function getStreakHistory(): StreakEntry[] {
  try {
    const records = loadGameRecords()
    return computeStreaks(records)
  } catch {
    return []
  }
}

export function getStreakPrediction(): StreakPrediction {
  try {
    const current = getCurrentStreak()
    if (current === 0) {
      return { willContinue: false, confidence: 0.5, reason: 'No active streak to continue.' }
    }

    const history = getStreakHistory().slice(-5)
    if (history.length < 2) {
      return {
        willContinue: current >= 3,
        confidence: 0.5,
        reason: current >= 3
          ? `You're on a ${current}-day streak! Play today to keep it going.`
          : 'Play consistently to build a streak pattern.',
      }
    }

    const avgStreakLength = history.reduce((s, h) => s + h.days, 0) / history.length
    const likelyToContinue = current < avgStreakLength * 0.8
    const confidence = Math.min(0.95, 0.4 + (current / avgStreakLength) * 0.3)

    return {
      willContinue: likelyToContinue,
      confidence: Math.round(confidence * 100) / 100,
      reason: likelyToContinue
        ? `Based on your history (avg streak: ${Math.round(avgStreakLength)} days), you're likely to keep this ${current}-day streak alive!`
        : `Your streaks typically last ~${Math.round(avgStreakLength)} days. You're at ${current} — stay focused!`,
    }
  } catch {
    return { willContinue: false, confidence: 0, reason: 'Unable to predict streak.' }
  }
}

// ─── 4. Consistency Score ────────────────────────────────────────────────────

export function getConsistencyScore(period: TimePeriod = 'allTime'): number {
  try {
    const all = loadGameRecords()
    const [start, end] = getDateRange(period)
    const filtered = all.filter(r => r.timestamp >= start && r.timestamp <= end)
    if (filtered.length < 3) return 50

    const scores = filtered.map(r => r.score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length
    const stdDev = Math.sqrt(variance)
    const cv = mean !== 0 ? stdDev / mean : 1 // coefficient of variation

    // Lower CV = higher consistency. CV of 0 → 100, CV of 1 → 0
    const raw = Math.max(0, 100 - cv * 100)
    return Math.min(100, Math.round(raw))
  } catch {
    return 50
  }
}

export function getReliabilityScore(): number {
  try {
    const all = loadGameRecords()
    if (all.length < 5) return 50

    const avgScore = all.reduce((s, r) => s + r.score, 0) / all.length
    const threshold = avgScore * 0.8
    const reliable = all.filter(r => r.score >= threshold).length

    return Math.round((reliable / all.length) * 100)
  } catch {
    return 50
  }
}

export function getVolatilityIndex(): number {
  try {
    const all = loadGameRecords()
    if (all.length < 3) return 0

    const scores = all.map(r => r.score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    if (mean === 0) return 0

    const variance = scores.reduce((s, v) => s + ((v - mean) / mean) ** 2, 0) / scores.length
    return Math.round(Math.sqrt(variance) * 100) / 100
  } catch {
    return 0
  }
}

// ─── 5. Peak Performance Analysis ────────────────────────────────────────────

export function getPeakHours(): PeakHour[] {
  try {
    const all = loadGameRecords()
    if (!all.length) return []

    const buckets: Record<number, { totalScore: number; count: number }> = {}
    for (const r of all) {
      const hour = new Date(r.timestamp).getHours()
      if (!buckets[hour]) buckets[hour] = { totalScore: 0, count: 0 }
      buckets[hour].totalScore += r.score
      buckets[hour].count += 1
    }

    return Object.entries(buckets)
      .map(([h, b]) => ({
        hour: parseInt(h, 10),
        avgScore: Math.round(b.totalScore / b.count),
        gamesPlayed: b.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
  } catch {
    return []
  }
}

export function getPeakDayOfWeek(): number {
  try {
    const all = loadGameRecords()
    if (!all.length) return -1

    const buckets: Record<number, { totalScore: number; count: number }> = {}
    for (let i = 0; i < 7; i++) buckets[i] = { totalScore: 0, count: 0 }

    for (const r of all) {
      const day = new Date(r.timestamp).getDay()
      buckets[day].totalScore += r.score
      buckets[day].count += 1
    }

    let bestDay = 0
    let bestAvg = 0
    for (let i = 0; i < 7; i++) {
      if (buckets[i].count > 0) {
        const avg = buckets[i].totalScore / buckets[i].count
        if (avg > bestAvg) {
          bestAvg = avg
          bestDay = i
        }
      }
    }
    return bestDay
  } catch {
    return -1
  }
}

export function getPersonalBests(): PersonalBest {
  try {
    const all = loadGameRecords()
    if (!all.length) {
      return {
        highestScore: { value: 0, date: '' },
        longestSnake: { value: 0, date: '' },
        mostWords: { value: 0, date: '' },
        biggestCombo: { value: 0, date: '' },
        longestGame: { value: 0, date: '' },
      }
    }

    const findBest = (fn: (r: GameRecord) => number) => {
      let best = all[0]
      for (const r of all) if (fn(r) > fn(best)) best = r
      return best
    }

    const hs = findBest(r => r.score)
    const ls = findBest(r => r.snakeLength ?? 0)
    const mw = findBest(r => r.words)
    const bc = findBest(r => r.combo)
    const lg = findBest(r => r.playTime)

    return {
      highestScore: { value: hs.score, date: toDateString(hs.timestamp) },
      longestSnake: { value: ls.snakeLength ?? 0, date: toDateString(ls.timestamp) },
      mostWords: { value: mw.words, date: toDateString(mw.timestamp) },
      biggestCombo: { value: bc.combo, date: toDateString(bc.timestamp) },
      longestGame: { value: lg.playTime, date: toDateString(lg.timestamp) },
    }
  } catch {
    return {
      highestScore: { value: 0, date: '' },
      longestSnake: { value: 0, date: '' },
      mostWords: { value: 0, date: '' },
      biggestCombo: { value: 0, date: '' },
      longestGame: { value: 0, date: '' },
    }
  }
}

export function getRecentMilestone(): Milestone | null {
  try {
    const all = loadGameRecords()
    if (!all.length) return null

    const sorted = [...all].sort((a, b) => b.timestamp - a.timestamp)
    const milestones: { value: number; label: string; type: string }[] = [
      { value: 500, label: 'Score 500', type: 'score' },
      { value: 1000, label: 'Score 1,000', type: 'score' },
      { value: 2500, label: 'Score 2,500', type: 'score' },
      { value: 5000, label: 'Score 5,000', type: 'score' },
      { value: 10, label: '10 Words', type: 'words' },
      { value: 25, label: '25 Words', type: 'words' },
      { value: 50, label: '50 Words', type: 'words' },
      { value: 5, label: 'Combo x5', type: 'combo' },
      { value: 10, label: 'Combo x10', type: 'combo' },
    ]

    for (const game of sorted) {
      for (const m of milestones) {
        const gameVal = m.type === 'score' ? game.score
          : m.type === 'words' ? game.words
          : game.combo
        if (gameVal >= m.value) {
          return {
            type: m.type,
            value: m.value,
            date: toDateString(game.timestamp),
            label: m.label,
          }
        }
      }
    }
    return null
  } catch {
    return null
  }
}

// ─── 6. Skill Rating ─────────────────────────────────────────────────────────

const SKILL_TIERS = [
  { name: 'Bronze', min: 0, max: 500 },
  { name: 'Silver', min: 500, max: 1200 },
  { name: 'Gold', min: 1200, max: 2200 },
  { name: 'Platinum', min: 2200, max: 3200 },
  { name: 'Diamond', min: 3200, max: 4000 },
  { name: 'Master', min: 4000, max: 4500 },
  { name: 'Grandmaster', min: 4500, max: 5000 },
]

function getTierForRating(rating: number): typeof SKILL_TIERS[0] {
  for (const tier of SKILL_TIERS) {
    if (rating < tier.max) return tier
  }
  return SKILL_TIERS[SKILL_TIERS.length - 1]
}

export function calculateSkillRating(): SkillRating {
  try {
    const all = loadGameRecords()
    if (!all.length) {
      return { rating: 0, tier: 'Bronze', progress: 0, gamesToNextTier: 50 }
    }

    const n = all.length
    const avgScore = all.reduce((s, r) => s + r.score, 0) / n
    const bestScore = Math.max(...all.map(r => r.score))
    const consistency = getConsistencyScore('allTime')
    const streak = getCurrentStreak()

    const uniqueWords = new Set<string>()
    for (const r of all) {
      for (const w of r.wordsList ?? []) uniqueWords.add(w.toLowerCase())
    }
    const vocabDiversity = Math.min(1, uniqueWords.size / Math.max(100, n * 15))

    const avgCombo = all.reduce((s, r) => s + r.combo, 0) / n
    const comboEfficiency = Math.min(1, avgCombo / Math.max(10, bestScore / 100))

    // Composite: avgScore (0-1800) + consistency (0-800) + streak (0-500) + vocab (0-600) + combo (0-400) + bestScore bonus (0-900)
    const scoreComponent = Math.min(1800, (avgScore / 500) * 1800)
    const consistencyComponent = (consistency / 100) * 800
    const streakComponent = Math.min(500, streak * 25)
    const vocabComponent = vocabDiversity * 600
    const comboComponent = comboEfficiency * 400
    const bestComponent = Math.min(900, (bestScore / 2000) * 900)

    const totalRating = Math.min(5000, Math.round(
      scoreComponent + consistencyComponent + streakComponent + vocabComponent + comboComponent + bestComponent
    ))

    const tier = getTierForRating(totalRating)
    const tierRange = tier.max - tier.min
    const progress = (totalRating - tier.min) / tierRange

    const nextTier = SKILL_TIERS[SKILL_TIERS.indexOf(tier) + 1]
    const gamesToNextTier = nextTier
      ? Math.max(1, Math.ceil((nextTier.min - totalRating) / Math.max(1, (totalRating / Math.max(1, n)))))
      : 0

    return {
      rating: totalRating,
      tier: tier.name,
      progress: Math.round(progress * 100) / 100,
      gamesToNextTier,
    }
  } catch {
    return { rating: 0, tier: 'Bronze', progress: 0, gamesToNextTier: 50 }
  }
}

export function getSkillTier(): string {
  return calculateSkillRating().tier
}

export function getSkillProgress(): { currentTier: string; nextTier: string | null; progress: number; gamesToNextTier: number } {
  try {
    const skill = calculateSkillRating()
    const tierIdx = SKILL_TIERS.findIndex(t => t.name === skill.tier)
    const nextTier = SKILL_TIERS[tierIdx + 1]

    return {
      currentTier: skill.tier,
      nextTier: nextTier?.name ?? null,
      progress: skill.progress,
      gamesToNextTier: skill.gamesToNextTier,
    }
  } catch {
    return { currentTier: 'Bronze', nextTier: 'Silver', progress: 0, gamesToNextTier: 50 }
  }
}

// ─── 7. Weakness Detection ───────────────────────────────────────────────────

export function getWeakMetrics(): WeakMetric[] {
  try {
    const all = loadGameRecords()
    if (all.length < 5) return []

    const metrics: { key: string; label: string; extractor: (r: GameRecord) => number; suggestion: string }[] = [
      { key: 'score', label: 'Score', extractor: r => r.score, suggestion: 'Focus on eating longer words and building combos for higher scores.' },
      { key: 'words', label: 'Words', extractor: r => r.words, suggestion: 'Navigate more efficiently toward available words on the board.' },
      { key: 'combo', label: 'Combo', extractor: r => r.combo, suggestion: 'Try to chain word collections quickly without breaks to build combos.' },
      { key: 'playTime', label: 'Game Duration', extractor: r => r.playTime, suggestion: 'Practice surviving longer by avoiding walls and obstacles.' },
    ]

    const results: WeakMetric[] = []
    for (const m of metrics) {
      const values = all.map(m.extractor)
      const best = Math.max(...values)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const gap = best !== 0 ? ((best - avg) / best) * 100 : 0

      if (gap > 30) {
        results.push({
          metric: m.label,
          current: Math.round(avg),
          best,
          gap: Math.round(gap),
          suggestion: m.suggestion,
        })
      }
    }
    return results.sort((a, b) => b.gap - a.gap)
  } catch {
    return []
  }
}

export function getImprovementAreas(): ImprovementArea[] {
  try {
    const weak = getWeakMetrics()
    const consistency = getConsistencyScore('allTime')
    const reliability = getReliabilityScore()
    const all = loadGameRecords()
    const n = all.length

    const areas: ImprovementArea[] = []

    // Weak metrics become improvement areas
    for (const w of weak) {
      areas.push({
        area: w.metric,
        priority: w.gap > 50 ? 1 : w.gap > 40 ? 2 : 3,
        current: w.current,
        target: Math.round(w.best * 0.85),
        suggestion: w.suggestion,
      })
    }

    // Low consistency
    if (consistency < 60) {
      areas.push({
        area: 'Consistency',
        priority: consistency < 40 ? 1 : 2,
        current: consistency,
        target: 70,
        suggestion: 'Work on maintaining a consistent play style rather than occasional big games.',
      })
    }

    // Low reliability
    if (reliability < 70) {
      areas.push({
        area: 'Reliability',
        priority: reliability < 50 ? 2 : 3,
        current: reliability,
        target: 80,
        suggestion: 'Aim to reach at least 80% of your average score every game.',
      })
    }

    // Low game count
    if (n < 20) {
      areas.push({
        area: 'Experience',
        priority: 4,
        current: n,
        target: 20,
        suggestion: `Play at least ${20 - n} more games to establish meaningful patterns.`,
      })
    }

    return areas.sort((a, b) => a.priority - b.priority)
  } catch {
    return []
  }
}

export function getStrengths(): Strength[] {
  try {
    const all = loadGameRecords()
    if (all.length < 5) return []

    const results: Strength[] = []

    // High consistency
    const consistency = getConsistencyScore('allTime')
    if (consistency >= 75) {
      results.push({
        metric: 'Consistency',
        value: consistency,
        description: 'You deliver reliable performance game after game.',
      })
    }

    // High streak
    const streak = getCurrentStreak()
    if (streak >= 7) {
      results.push({
        metric: 'Dedication',
        value: streak,
        description: `Impressive ${streak}-day streak shows great commitment!`,
      })
    }

    // Good combo performance
    const avgCombo = all.reduce((s, r) => s + r.combo, 0) / all.length
    const bestCombo = Math.max(...all.map(r => r.combo))
    if (avgCombo > 5) {
      results.push({
        metric: 'Combo Building',
        value: Math.round(avgCombo),
        description: `You average ${Math.round(avgCombo)} combo hits with a best of ${bestCombo}.`,
      })
    }

    // Vocabulary diversity
    const uniqueWords = new Set<string>()
    for (const r of all) for (const w of r.wordsList ?? []) uniqueWords.add(w.toLowerCase())
    if (uniqueWords.size > all.length * 8) {
      results.push({
        metric: 'Vocabulary',
        value: uniqueWords.size,
        description: `You've collected ${uniqueWords.size} unique words — great diversity!`,
      })
    }

    // High score ceiling
    const avgScore = all.reduce((s, r) => s + r.score, 0) / all.length
    if (avgScore > 300) {
      results.push({
        metric: 'Scoring',
        value: Math.round(avgScore),
        description: `Your average score of ${Math.round(avgScore)} shows strong scoring ability.`,
      })
    }

    return results
  } catch {
    return []
  }
}

// ─── 8. Comparison Charts Data ───────────────────────────────────────────────

export function getDailyScores(days: number = 30): DailyScoreEntry[] {
  try {
    const all = loadGameRecords()
    const cutoff = Date.now() - days * 86400000
    const filtered = all.filter(r => r.timestamp >= cutoff)

    const dayMap: Record<string, { scores: number[]; words: number[]; times: number[] }> = {}

    for (const r of filtered) {
      const ds = toDateString(r.timestamp)
      if (!dayMap[ds]) dayMap[ds] = { scores: [], words: [], times: [] }
      dayMap[ds].scores.push(r.score)
      dayMap[ds].words.push(r.words)
      dayMap[ds].times.push(r.playTime)
    }

    const result: DailyScoreEntry[] = []
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const ds = toDateString(d.getTime())
      const bucket = dayMap[ds]
      result.push({
        date: ds,
        score: bucket ? Math.max(...bucket.scores) : 0,
        words: bucket ? Math.round(bucket.words.reduce((a, b) => a + b, 0) / bucket.words.length) : 0,
        time: bucket ? Math.round(bucket.times.reduce((a, b) => a + b, 0) / bucket.times.length) : 0,
      })
    }

    return result
  } catch {
    return []
  }
}

export function getHourlyPerformance(): HourlyBucket[] {
  try {
    const all = loadGameRecords()
    if (!all.length) return []

    const buckets: Record<number, { scores: number[]; words: number[]; count: number }> = {}
    for (let h = 0; h < 24; h++) buckets[h] = { scores: [], words: [], count: 0 }

    for (const r of all) {
      const hour = new Date(r.timestamp).getHours()
      buckets[hour].scores.push(r.score)
      buckets[hour].words.push(r.words)
      buckets[hour].count++
    }

    return Array.from({ length: 24 }, (_, h) => {
      const b = buckets[h]
      return {
        hour: h,
        avgScore: b.count > 0 ? Math.round(b.scores.reduce((a, v) => a + v, 0) / b.count) : 0,
        avgWords: b.count > 0 ? Math.round(b.words.reduce((a, v) => a + v, 0) / b.count) : 0,
        gamesPlayed: b.count,
      }
    })
  } catch {
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, avgScore: 0, avgWords: 0, gamesPlayed: 0 }))
  }
}

export function getScoreDistribution(): ScoreBucket[] {
  try {
    const all = loadGameRecords()
    if (!all.length) return []

    const ranges = [
      { label: '0–100', min: 0, max: 100 },
      { label: '100–200', min: 100, max: 200 },
      { label: '200–500', min: 200, max: 500 },
      { label: '500–1000', min: 500, max: 1000 },
      { label: '1000–2000', min: 1000, max: 2000 },
      { label: '2000–5000', min: 2000, max: 5000 },
      { label: '5000+', min: 5000, max: Infinity },
    ]

    return ranges.map(range => ({
      label: range.label,
      min: range.min,
      max: range.max,
      count: all.filter(r => r.score >= range.min && r.score < range.max).length,
    }))
  } catch {
    return []
  }
}

export function getCategoryPerformance(): CategoryPerformanceEntry[] {
  try {
    const all = loadGameRecords()
    if (!all.length) return []

    const catMap: Record<string, { scores: number[]; wordCounts: number[]; count: number }> = {}

    for (const r of all) {
      for (const cat of r.categories ?? []) {
        if (!catMap[cat]) catMap[cat] = { scores: [], wordCounts: [], count: 0 }
        catMap[cat].scores.push(r.score)
        catMap[cat].wordCounts.push(r.words)
        catMap[cat].count++
      }
    }

    return Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        gamesPlayed: data.count,
        totalScore: data.scores.reduce((a, b) => a + b, 0),
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
        wordCount: Math.round(data.wordCounts.reduce((a, b) => a + b, 0) / data.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
  } catch {
    return []
  }
}

// ─── 9. UI Helpers ───────────────────────────────────────────────────────────

export function getComparisonOverview(): ComparisonOverview {
  try {
    const todayStats = getPeriodStats('today')
    const weekStats = getPeriodStats('thisWeek')
    const consistency = getConsistencyScore('thisWeek')
    const skill = calculateSkillRating()
    const streak = getCurrentStreak()

    const trends = getTrend('thisWeek')
    const topTrend = trends.reduce((best, t) =>
      Math.abs(t.magnitude) > Math.abs(best.magnitude) ? t : best, trends[0])

    return {
      todayStats,
      weekStats,
      consistencyScore: consistency,
      skillTier: skill.tier,
      currentStreak: streak,
      topTrend,
    }
  } catch {
    return {
      todayStats: buildPeriodStats([]),
      weekStats: buildPeriodStats([]),
      consistencyScore: 50,
      skillTier: 'Bronze',
      currentStreak: 0,
      topTrend: { metric: 'score', direction: 'stable', magnitude: 0 },
    }
  }
}

export function getInsights(count: number = 5): string[] {
  try {
    const insights: string[] = []
    const all = loadGameRecords()
    const n = all.length

    if (n === 0) {
      return ['Play your first game to start generating performance insights!']
    }

    // Score insight
    const avgScore = all.reduce((s, r) => s + r.score, 0) / n
    const bestScore = Math.max(...all.map(r => r.score))
    const recent = all.slice(-10)
    const recentAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length

    if (recentAvg > avgScore * 1.1) {
      insights.push(`Your recent games average ${Math.round(recentAvg)} pts, ${Math.round(((recentAvg / avgScore) - 1) * 100)}% above your overall average. Nice momentum!`)
    } else if (recentAvg < avgScore * 0.85) {
      insights.push(`Recent average (${Math.round(recentAvg)} pts) is below your usual ${Math.round(avgScore)} — consider taking a break and coming back fresh.`)
    }

    // Streak insight
    const streak = getCurrentStreak()
    if (streak >= 7) {
      insights.push(`You're on fire with a ${streak}-day streak! You're earning streak bonuses on every game.`)
    } else if (streak >= 3) {
      insights.push(`Nice ${streak}-day streak! Keep it going for bigger bonuses.`)
    }

    // Combo insight
    const avgCombo = all.reduce((s, r) => s + r.combo, 0) / n
    const bestCombo = Math.max(...all.map(r => r.combo))
    if (bestCombo > avgCombo * 2) {
      insights.push(`Your best combo (${bestCombo}x) is much higher than your average (${Math.round(avgCombo)}x). Try to close that gap!`)
    }

    // Consistency insight
    const consistency = getConsistencyScore('thisWeek')
    if (consistency >= 80) {
      insights.push('Your consistency this week is excellent — very reliable performance!')
    } else if (consistency < 40) {
      insights.push('Score variance is high this week. Focus on steady play over big swings.')
    }

    // Time-of-day insight
    const peakHours = getPeakHours()
    if (peakHours.length >= 2) {
      const best = peakHours[0]
      const worst = peakHours[peakHours.length - 1]
      if (best.avgScore > worst.avgScore * 1.5) {
        insights.push(`You perform best around ${best.hour}:00 (${best.avgScore} avg) — consider scheduling play sessions then.`)
      }
    }

    // Vocabulary insight
    const uniqueWords = new Set<string>()
    for (const r of all) for (const w of r.wordsList ?? []) uniqueWords.add(w.toLowerCase())
    if (uniqueWords.size > 50) {
      insights.push(`Impressive vocabulary! You've collected ${uniqueWords.size} unique words so far.`)
    }

    // Skill tier insight
    const skill = calculateSkillRating()
    if (skill.rating > 0) {
      insights.push(`Current skill rating: ${skill.rating}/5000 (${skill.tier} tier). ${skill.gamesToNextTier > 0 ? `~${skill.gamesToNextTier} games to next tier.` : 'Maximum tier reached!'}`)
    }

    // Milestone insight
    const milestone = getRecentMilestone()
    if (milestone) {
      insights.push(`Recent milestone: ${milestone.label} achieved on ${milestone.date}.`)
    }

    return insights.slice(0, count)
  } catch {
    return ['Unable to generate insights. Play more games to unlock performance analysis.']
  }
}

export function getWeeklyReport(): WeeklyReport {
  try {
    const weekStats = getPeriodStats('thisWeek')
    const prevWeekStats = getPeriodStats('lastWeek')
    const trends = getTrend('thisWeek')
    const strengths = getStrengths()
    const weakMetrics = getWeakMetrics()

    const highlights: string[] = []
    const lowlights: string[] = []

    // Score comparison
    if (weekStats.avgScore > 0 && prevWeekStats.avgScore > 0) {
      const change = ((weekStats.avgScore - prevWeekStats.avgScore) / prevWeekStats.avgScore) * 100
      if (change > 10) {
        highlights.push(`Average score up ${Math.round(change)}% vs last week`)
      } else if (change < -10) {
        lowlights.push(`Average score down ${Math.round(Math.abs(change))}% vs last week`)
      }
    }

    // Best game
    if (weekStats.bestScore > 0) {
      highlights.push(`Best game this week: ${weekStats.bestScore} pts`)
    }

    // Games played
    if (weekStats.gamesPlayed > 0) {
      if (weekStats.gamesPlayed >= 7) {
        highlights.push(`Played ${weekStats.gamesPlayed} games — great activity!`)
      }
    } else {
      lowlights.push('No games played this week yet')
    }

    // Trends
    for (const t of trends) {
      if (t.direction === 'improving') {
        highlights.push(`${t.metric.charAt(0).toUpperCase() + t.metric.slice(1)} trend: improving (+${t.magnitude}%)`)
      } else if (t.direction === 'declining') {
        lowlights.push(`${t.metric.charAt(0).toUpperCase() + t.metric.slice(1)} trend: declining (${t.magnitude}%)`)
      }
    }

    // Strengths
    for (const s of strengths.slice(0, 2)) {
      highlights.push(`${s.metric}: ${s.description}`)
    }

    // Weaknesses
    for (const w of weakMetrics.slice(0, 2)) {
      lowlights.push(`${w.metric} is ${w.gap}% below your best — ${w.suggestion}`)
    }

    // Streak
    const streak = getCurrentStreak()
    if (streak >= 3) {
      highlights.push(`${streak}-day active streak`)
    }

    // Build summary
    const summaryParts: string[] = []
    if (weekStats.gamesPlayed === 0) {
      summaryParts.push('No games played this week. Jump in to start tracking your progress!')
    } else {
      summaryParts.push(`You played ${weekStats.gamesPlayed} game${weekStats.gamesPlayed > 1 ? 's' : ''}`)
      summaryParts.push(`averaging ${weekStats.avgScore} pts`)
      if (highlights.length > lowlights.length) {
        summaryParts.push('with a strong overall performance.')
      } else if (lowlights.length > highlights.length) {
        summaryParts.push('. There is room for improvement next week.')
      } else {
        summaryParts.push('with a balanced performance.')
      }
    }

    return {
      periodLabel: 'This Week',
      gamesPlayed: weekStats.gamesPlayed,
      totalScore: weekStats.totalScore,
      avgScore: weekStats.avgScore,
      bestScore: weekStats.bestScore,
      highlights,
      lowlights,
      summary: summaryParts.join(' '),
    }
  } catch {
    return {
      periodLabel: 'This Week',
      gamesPlayed: 0,
      totalScore: 0,
      avgScore: 0,
      bestScore: 0,
      highlights: [],
      lowlights: ['Unable to compile weekly report.'],
      summary: 'No data available for this week.',
    }
  }
}
