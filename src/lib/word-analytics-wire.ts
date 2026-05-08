'use client'

/**
 * word-analytics-wire.ts
 * ────────────────────────────
 * Word Analytics Dashboard Wire for the Word Snake game.
 *
 * Provides word performance analytics, difficulty distribution, learning curves,
 * word patterns, vocabulary growth tracking, word length distribution, category
 * performance, and time-based trends.
 *
 * localStorage key: ws_word_analytics_wire
 *
 * Exported functions (31):
 *   initWordAnalytics, getWordPerformanceData, waGetWordStats, waGetWordFrequency,
 *   getWordLengthDistribution, getDifficultyBreakdown, getCategoryPerformance,
 *   getTimeBasedTrends, getLearningCurve, getVocabularyGrowth, getWordPatterns,
 *   getWeakWords, getStrongWords, getWordInsights, getAverageWordLength,
 *   getLongestStreak, getWordAccuracy, getCommonMistakes, getImprovementAreas,
 *   getWordTimeline, getWeeklyReport, getMonthlyReport, getAnalyticsOverview,
 *   getPerformanceCard, getGrowthChart, getWordCloud, getDistributionGrid,
 *   getInsightCard, getTrendChart, getWeaknessCard, getSummaryCard
 */

// ── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_word_analytics_wire'
const MAX_WORD_ENTRIES = 500
const MAX_DAILY_SNAPSHOTS = 365
const DEFAULT_DIFFICULTY = 'medium'
const DEFAULT_CATEGORY = 'general'

const DIFFICULTY_ORDER: Record<string, number> = {
  easy: 0, medium: 1, hard: 2, expert: 3, insane: 4,
}

const CATEGORY_META: Record<string, { label: string; color: string; emoji: string }> = {
  nature:    { label: 'Nature',    color: '#22c55e', emoji: '🌿' },
  emotion:   { label: 'Emotion',   color: '#f43f5e', emoji: '💖' },
  element:   { label: 'Element',   color: '#3b82f6', emoji: '🔥' },
  time:      { label: 'Time',      color: '#a855f7', emoji: '⏳' },
  creature:  { label: 'Creature',  color: '#f97316', emoji: '🦊' },
  quality:   { label: 'Quality',   color: '#eab308', emoji: '✨' },
  object:    { label: 'Object',    color: '#6366f1', emoji: '🗡️' },
  action:    { label: 'Action',    color: '#ec4899', emoji: '⚡' },
  general:   { label: 'General',   color: '#6b7280', emoji: '📖' },
}

// ── Public Types ────────────────────────────────────────────────────────────

/** Per-word performance record stored in analytics state. */
export interface WordPerformance {
  word: string
  difficulty: string
  category: string
  attempts: number
  correct: number
  wrong: number
  avgTimeMs: number
  bestTimeMs: number
  worstTimeMs: number
  lastSeenAt: number
  firstSeenAt: number
  streak: number
  longestStreak: number
  masteryScore: number
}

/** Aggregate statistics across all tracked words. */
export interface WordStats {
  totalWords: number
  uniqueWords: number
  totalAttempts: number
  totalCorrect: number
  totalWrong: number
  avgAccuracy: number
  avgTimeMs: number
  medianTimeMs: number
  bestWord: string | null
  worstWord: string | null
  avgMastery: number
  masteredCount: number
  learningCount: number
  newCount: number
}

/** Single data point for time-series charts. */
export interface TimeTrend {
  date: string
  timestamp: number
  wordsAttempted: number
  wordsCorrect: number
  accuracy: number
  avgTimeMs: number
  newWords: number
  streak: number
}

/** Point on the learning curve (cumulative accuracy over attempt count). */
export interface LearningCurvePoint {
  attemptBucket: number
  avgAccuracy: number
  totalWords: number
  avgTimeMs: number
}

/** Point on the vocabulary growth timeline. */
export interface VocabularyGrowthPoint {
  date: string
  cumulativeUnique: number
  newToday: number
  totalAttemptsToday: number
}

/** A detected word pattern (prefix, suffix, length cluster, etc.). */
export interface WordPatternEntry {
  pattern: string
  type: 'prefix' | 'suffix' | 'length_cluster' | 'letter_frequency' | 'category_cluster'
  count: number
  avgAccuracy: number
  examples: string[]
}

/** Weekly report summary. */
export interface WeeklyReport {
  weekLabel: string
  startDate: string
  endDate: string
  totalAttempts: number
  totalCorrect: number
  accuracy: number
  avgTimeMs: number
  newWords: number
  strongestCategory: string
  weakestCategory: string
  bestStreak: number
  trendDirection: 'up' | 'down' | 'stable'
  topWords: string[]
}

/** Monthly report summary. */
export interface MonthlyReport {
  monthLabel: string
  startDate: string
  endDate: string
  totalAttempts: number
  totalCorrect: number
  accuracy: number
  avgTimeMs: number
  newWords: number
  vocabularyGrowth: number
  masteredWords: number
  topCategory: string
  consistency: number
  topWords: string[]
  improvementRate: number
}

/** Full analytics state persisted in localStorage. */
export interface AnalyticsState {
  words: Record<string, WordPerformance>
  dailySnapshots: TimeTrend[]
  createdAt: number
  updatedAt: number
  totalSessions: number
  totalPlayTimeMs: number
}

// UI-facing card / chart types

export interface PerformanceCard {
  title: string
  subtitle: string
  accuracy: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercent: number
  totalWords: number
  avgTimeMs: number
  topWord: string | null
  grade: string
  color: string
}

export interface GrowthChart {
  points: VocabularyGrowthPoint[]
  totalUnique: number
  growthRate: number
  projectedNextWeek: number
}

export interface WordCloudEntry {
  word: string
  weight: number
  accuracy: number
  difficulty: string
}

export interface DistributionGrid {
  categories: { category: string; label: string; color: string; emoji: string; count: number; accuracy: number }[]
  difficulties: { difficulty: string; count: number; accuracy: number; avgTimeMs: number }[]
  lengths: { length: number; count: number; accuracy: number }[]
}

export interface InsightCard {
  icon: string
  title: string
  description: string
  metric: string
  metricLabel: string
  severity: 'positive' | 'neutral' | 'negative'
  action: string
}

export interface TrendChart {
  labels: string[]
  accuracyData: number[]
  volumeData: number[]
  timeData: number[]
  trendLine: 'improving' | 'declining' | 'stable'
  slope: number
}

export interface WeaknessCard {
  title: string
  weaknesses: { word: string; accuracy: number; attempts: number; suggestion: string }[]
  overallSeverity: 'low' | 'medium' | 'high'
  practiceCount: number
}

export interface SummaryCard {
  totalWords: number
  masteredWords: number
  avgAccuracy: number
  avgTimeMs: number
  longestStreak: number
  currentStreak: number
  vocabularySize: number
  grade: string
  gradeEmoji: string
  highlight: string
  generatedAt: string
}

// ── Internal Types ──────────────────────────────────────────────────────────

interface WordAttempt {
  word: string
  correct: boolean
  timeMs: number
  difficulty?: string
  category?: string
  timestamp?: number
}

// ── localStorage helpers ────────────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function createEmptyState(): AnalyticsState {
  return {
    words: {},
    dailySnapshots: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    totalSessions: 0,
    totalPlayTimeMs: 0,
  }
}

function loadState(): AnalyticsState {
  try {
    const raw = safeGetItem(STORAGE_KEY)
    if (!raw) return createEmptyState()
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null) return createEmptyState()
    const state = parsed as Record<string, unknown>
    return {
      words: typeof state.words === 'object' && state.words !== null ? state.words as Record<string, WordPerformance> : {},
      dailySnapshots: Array.isArray(state.dailySnapshots) ? state.dailySnapshots as TimeTrend[] : [],
      createdAt: typeof state.createdAt === 'number' ? state.createdAt : Date.now(),
      updatedAt: typeof state.updatedAt === 'number' ? state.updatedAt : Date.now(),
      totalSessions: typeof state.totalSessions === 'number' ? state.totalSessions : 0,
      totalPlayTimeMs: typeof state.totalPlayTimeMs === 'number' ? state.totalPlayTimeMs : 0,
    }
  } catch {
    return createEmptyState()
  }
}

function saveState(state: AnalyticsState): boolean {
  state.updatedAt = Date.now()
  return safeSetItem(STORAGE_KEY, JSON.stringify(state))
}

// ── Internal helpers ────────────────────────────────────────────────────────

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 10000) / 100
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

function getMasteryLevel(masteryScore: number): string {
  if (masteryScore >= 90) return 'mastered'
  if (masteryScore >= 70) return 'proficient'
  if (masteryScore >= 40) return 'learning'
  if (masteryScore > 0) return 'familiar'
  return 'new'
}

function getMasteryEmoji(level: string): string {
  switch (level) {
    case 'mastered': return '🏆'
    case 'proficient': return '⭐'
    case 'learning': return '📖'
    case 'familiar': return '👁️'
    default: return '🆕'
  }
}

function getGrade(accuracy: number): { grade: string; emoji: string } {
  if (accuracy >= 95) return { grade: 'S', emoji: '👑' }
  if (accuracy >= 85) return { grade: 'A', emoji: '🌟' }
  if (accuracy >= 70) return { grade: 'B', emoji: '👍' }
  if (accuracy >= 55) return { grade: 'C', emoji: '💪' }
  if (accuracy >= 40) return { grade: 'D', emoji: '📚' }
  return { grade: 'F', emoji: '🎓' }
}

function updateOrInsertPerformance(
  state: AnalyticsState,
  attempt: WordAttempt,
): void {
  const key = attempt.word.toLowerCase()
  const existing = state.words[key]
  const now = attempt.timestamp ?? Date.now()

  if (existing) {
    const totalAttempts = existing.attempts + 1
    const totalCorrect = existing.correct + (attempt.correct ? 1 : 0)
    const totalWrong = existing.wrong + (attempt.correct ? 0 : 1)
    const totalTimeAccum = existing.avgTimeMs * existing.attempts + attempt.timeMs
    const newAvgTime = totalTimeAccum / totalAttempts
    const newBest = attempt.correct && attempt.timeMs < existing.bestTimeMs ? attempt.timeMs : existing.bestTimeMs
    const newWorst = attempt.timeMs > existing.worstTimeMs ? attempt.timeMs : existing.worstTimeMs
    const newStreak = attempt.correct ? existing.streak + 1 : 0
    const newLongestStreak = newStreak > existing.longestStreak ? newStreak : existing.longestStreak
    const newMastery = calcAccuracy(totalCorrect, totalAttempts)

    state.words[key] = {
      word: key,
      difficulty: attempt.difficulty ?? existing.difficulty,
      category: attempt.category ?? existing.category,
      attempts: totalAttempts,
      correct: totalCorrect,
      wrong: totalWrong,
      avgTimeMs: Math.round(newAvgTime * 100) / 100,
      bestTimeMs: newBest,
      worstTimeMs: newWorst,
      lastSeenAt: now,
      firstSeenAt: existing.firstSeenAt,
      streak: newStreak,
      longestStreak: newLongestStreak,
      masteryScore: newMastery,
    }
  } else {
    const totalAttempts = 1
    const totalCorrect = attempt.correct ? 1 : 0
    state.words[key] = {
      word: key,
      difficulty: attempt.difficulty ?? DEFAULT_DIFFICULTY,
      category: attempt.category ?? DEFAULT_CATEGORY,
      attempts: totalAttempts,
      correct: totalCorrect,
      wrong: attempt.correct ? 0 : 1,
      avgTimeMs: attempt.timeMs,
      bestTimeMs: attempt.correct ? attempt.timeMs : Infinity,
      worstTimeMs: attempt.timeMs,
      lastSeenAt: now,
      firstSeenAt: now,
      streak: attempt.correct ? 1 : 0,
      longestStreak: attempt.correct ? 1 : 0,
      masteryScore: calcAccuracy(totalCorrect, totalAttempts),
    }
  }
}

function updateDailySnapshot(state: AnalyticsState): void {
  const today = getTodayKey()
  const existingIdx = state.dailySnapshots.findIndex(s => s.date === today)
  const allWords = Object.values(state.words)

  const wordsAttempted = allWords.reduce((sum, w) => sum + w.attempts, 0)
  const wordsCorrect = allWords.reduce((sum, w) => sum + w.correct, 0)
  const accuracy = calcAccuracy(wordsCorrect, wordsAttempted)
  const avgTime = allWords.length > 0
    ? Math.round(allWords.reduce((s, w) => s + w.avgTimeMs, 0) / allWords.length * 100) / 100
    : 0
  const newWordsToday = allWords.filter(w => getDateKey(new Date(w.firstSeenAt)) === today).length
  const bestStreak = allWords.reduce((max, w) => Math.max(max, w.longestStreak), 0)

  const snapshot: TimeTrend = {
    date: today,
    timestamp: Date.now(),
    wordsAttempted,
    wordsCorrect,
    accuracy,
    avgTimeMs: avgTime,
    newWords: newWordsToday,
    streak: bestStreak,
  }

  if (existingIdx >= 0) {
    state.dailySnapshots[existingIdx] = snapshot
  } else {
    state.dailySnapshots.push(snapshot)
    if (state.dailySnapshots.length > MAX_DAILY_SNAPSHOTS) {
      state.dailySnapshots = state.dailySnapshots.slice(-MAX_DAILY_SNAPSHOTS)
    }
  }
}

function getWordsInRange(state: AnalyticsState, startMs: number, endMs: number): WordPerformance[] {
  return Object.values(state.words).filter(w => w.lastSeenAt >= startMs && w.lastSeenAt <= endMs)
}

function getWordEntries(state: AnalyticsState): WordPerformance[] {
  return Object.values(state.words)
}

// ── 1. initWordAnalytics ────────────────────────────────────────────────────

/**
 * Initialize the analytics engine. Creates the default state if none exists
 * and optionally seeds it with historical word attempts.
 */
export function initWordAnalytics(seedAttempts?: WordAttempt[]): AnalyticsState {
  const state = loadState()
  if (seedAttempts && Array.isArray(seedAttempts)) {
    for (const attempt of seedAttempts) {
      if (attempt.word && typeof attempt.word === 'string') {
        updateOrInsertPerformance(state, attempt)
      }
    }
    updateDailySnapshot(state)
    saveState(state)
  }
  return state
}

// ── 2. getWordPerformanceData ───────────────────────────────────────────────

/**
 * Returns the full performance record for a single word, or null if not tracked.
 */
export function getWordPerformanceData(word: string): WordPerformance | null {
  if (!word || typeof word !== 'string') return null
  const state = loadState()
  return state.words[word.trim().toLowerCase()] ?? null
}

// ── 3. waGetWordStats ──────────────────────────────────────────────────────

/**
 * Compute aggregate statistics across all tracked words.
 * Exported as `waGetWordStats` (aliased from `getWordStats`).
 */
export function waGetWordStats(): WordStats {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) {
    return {
      totalWords: 0, uniqueWords: 0, totalAttempts: 0, totalCorrect: 0,
      totalWrong: 0, avgAccuracy: 0, avgTimeMs: 0, medianTimeMs: 0,
      bestWord: null, worstWord: null, avgMastery: 0,
      masteredCount: 0, learningCount: 0, newCount: 0,
    }
  }

  const totalAttempts = entries.reduce((s, w) => s + w.attempts, 0)
  const totalCorrect = entries.reduce((s, w) => s + w.correct, 0)
  const totalWrong = entries.reduce((s, w) => s + w.wrong, 0)
  const avgAccuracy = calcAccuracy(totalCorrect, totalAttempts)
  const avgTimeMs = Math.round(entries.reduce((s, w) => s + w.avgTimeMs, 0) / entries.length * 100) / 100
  const medianTimeMs = median(entries.map(w => w.avgTimeMs))
  const avgMastery = Math.round(entries.reduce((s, w) => s + w.masteryScore, 0) / entries.length * 100) / 100

  const masteredCount = entries.filter(w => getMasteryLevel(w.masteryScore) === 'mastered').length
  const learningCount = entries.filter(w => getMasteryLevel(w.masteryScore) === 'learning').length
  const newCount = entries.filter(w => getMasteryLevel(w.masteryScore) === 'new').length

  const sorted = [...entries].sort((a, b) => b.masteryScore - a.masteryScore)
  const bestWord = sorted.length > 0 ? sorted[0].word : null
  const worstWord = sorted.length > 0 ? sorted[sorted.length - 1].word : null

  return {
    totalWords: totalAttempts,
    uniqueWords: entries.length,
    totalAttempts, totalCorrect, totalWrong,
    avgAccuracy, avgTimeMs, medianTimeMs,
    bestWord, worstWord, avgMastery,
    masteredCount, learningCount, newCount,
  }
}

// ── 4. waGetWordFrequency ──────────────────────────────────────────────────

/**
 * Returns word frequency map sorted by frequency (descending).
 * Exported as `waGetWordFrequency` (aliased from `getWordFrequency`).
 */
export function waGetWordFrequency(limit?: number): { word: string; count: number; accuracy: number }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const sorted = [...entries]
    .sort((a, b) => b.attempts - a.attempts)
    .map(w => ({ word: w.word, count: w.attempts, accuracy: w.masteryScore }))

  return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted
}

// ── 5. getWordLengthDistribution ────────────────────────────────────────────

/**
 * Returns distribution of tracked words grouped by word length.
 */
export function getWordLengthDistribution(): { length: number; count: number; avgAccuracy: number }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const buckets = new Map<number, { count: number; totalAccuracy: number }>()

  for (const entry of entries) {
    const len = entry.word.length
    const existing = buckets.get(len) ?? { count: 0, totalAccuracy: 0 }
    existing.count++
    existing.totalAccuracy += entry.masteryScore
    buckets.set(len, existing)
  }

  const result = Array.from(buckets.entries())
    .map(([length, data]) => ({
      length,
      count: data.count,
      avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
    }))
    .sort((a, b) => a.length - b.length)

  return result
}

// ── 6. getDifficultyBreakdown ──────────────────────────────────────────────

/**
 * Returns analytics broken down by difficulty tier.
 */
export function getDifficultyBreakdown(): { difficulty: string; count: number; accuracy: number; avgTimeMs: number; avgMastery: number }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const buckets = new Map<string, { count: number; totalAccuracy: number; totalTime: number; totalMastery: number }>()

  for (const entry of entries) {
    const diff = entry.difficulty || DEFAULT_DIFFICULTY
    const existing = buckets.get(diff) ?? { count: 0, totalAccuracy: 0, totalTime: 0, totalMastery: 0 }
    existing.count++
    existing.totalAccuracy += entry.masteryScore
    existing.totalTime += entry.avgTimeMs
    existing.totalMastery += entry.masteryScore
    buckets.set(diff, existing)
  }

  return Array.from(buckets.entries())
    .map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      accuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      avgTimeMs: Math.round((data.totalTime / data.count) * 100) / 100,
      avgMastery: Math.round((data.totalMastery / data.count) * 100) / 100,
    }))
    .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99))
}

// ── 7. getCategoryPerformance ───────────────────────────────────────────────

/**
 * Returns analytics broken down by word category.
 */
export function getCategoryPerformance(): { category: string; label: string; color: string; emoji: string; count: number; accuracy: number; avgTimeMs: number; mastered: number }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const buckets = new Map<string, { count: number; totalAccuracy: number; totalTime: number; mastered: number }>()

  for (const entry of entries) {
    const cat = entry.category || DEFAULT_CATEGORY
    const existing = buckets.get(cat) ?? { count: 0, totalAccuracy: 0, totalTime: 0, mastered: 0 }
    existing.count++
    existing.totalAccuracy += entry.masteryScore
    existing.totalTime += entry.avgTimeMs
    if (getMasteryLevel(entry.masteryScore) === 'mastered') existing.mastered++
    buckets.set(cat, existing)
  }

  return Array.from(buckets.entries())
    .map(([category, data]) => {
      const meta = CATEGORY_META[category] ?? { label: category, color: '#6b7280', emoji: '📖' }
      return {
        category,
        label: meta.label,
        color: meta.color,
        emoji: meta.emoji,
        count: data.count,
        accuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
        avgTimeMs: Math.round((data.totalTime / data.count) * 100) / 100,
        mastered: data.mastered,
      }
    })
    .sort((a, b) => b.accuracy - a.accuracy)
}

// ── 8. getTimeBasedTrends ──────────────────────────────────────────────────

/**
 * Returns daily snapshots for time-series analysis.
 */
export function getTimeBasedTrends(days?: number): TimeTrend[] {
  const state = loadState()
  const snapshots = state.dailySnapshots
  if (snapshots.length === 0) return []

  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp)

  if (typeof days === 'number' && days > 0) {
    return sorted.slice(-days)
  }

  return sorted
}

// ── 9. getLearningCurve ────────────────────────────────────────────────────

/**
 * Computes the learning curve: accuracy grouped by cumulative attempt buckets.
 * Shows how the player improves as they attempt more words over time.
 */
export function getLearningCurve(bucketSize?: number): LearningCurvePoint[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const size = typeof bucketSize === 'number' && bucketSize > 0 ? bucketSize : 10
  const buckets = new Map<number, { totalAccuracy: number; totalTime: number; count: number }>()

  for (const entry of entries) {
    const bucketIdx = Math.floor(entry.attempts / size)
    const existing = buckets.get(bucketIdx) ?? { totalAccuracy: 0, totalTime: 0, count: 0 }
    existing.totalAccuracy += entry.masteryScore
    existing.totalTime += entry.avgTimeMs
    existing.count++
    buckets.set(bucketIdx, existing)
  }

  return Array.from(buckets.entries())
    .map(([bucketIdx, data]) => ({
      attemptBucket: bucketIdx * size,
      avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      totalWords: data.count,
      avgTimeMs: Math.round((data.totalTime / data.count) * 100) / 100,
    }))
    .sort((a, b) => a.attemptBucket - b.attemptBucket)
}

// ── 10. getVocabularyGrowth ────────────────────────────────────────────────

/**
 * Returns daily vocabulary growth data showing cumulative unique words over time.
 */
export function getVocabularyGrowth(days?: number): VocabularyGrowthPoint[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const sorted = [...entries].sort((a, b) => a.firstSeenAt - b.firstSeenAt)
  const seenWords = new Set<string>()
  const dailyData = new Map<string, { cumulative: number; newToday: number; attemptsToday: number }>()

  for (const entry of sorted) {
    const dateKey = getDateKey(new Date(entry.firstSeenAt))
    if (!seenWords.has(entry.word)) {
      seenWords.add(entry.word)
    }
    const cumulative = seenWords.size
    const existing = dailyData.get(dateKey) ?? { cumulative: 0, newToday: 0, attemptsToday: 0 }
    existing.cumulative = cumulative
    existing.newToday++
    existing.attemptsToday += entry.attempts
    dailyData.set(dateKey, existing)
  }

  // Forward-fill cumulative values for days with no new words
  let lastCumulative = 0
  const sortedDates = Array.from(dailyData.keys()).sort()
  const allDates: string[] = []
  const start = sortedDates.length > 0 ? new Date(sortedDates[0]) : new Date()
  const end = new Date()
  const current = new Date(start)
  while (current <= end) {
    allDates.push(getDateKey(current))
    current.setDate(current.getDate() + 1)
  }

  const result: VocabularyGrowthPoint[] = []
  for (const date of allDates) {
    const data = dailyData.get(date)
    const cumulative = data?.cumulative ?? lastCumulative
    lastCumulative = cumulative
    result.push({
      date,
      cumulativeUnique: cumulative,
      newToday: data?.newToday ?? 0,
      totalAttemptsToday: data?.attemptsToday ?? 0,
    })
  }

  if (typeof days === 'number' && days > 0) {
    return result.slice(-days)
  }

  return result
}

// ── 11. getWordPatterns ────────────────────────────────────────────────────

/**
 * Detects recurring word patterns across tracked words.
 */
export function getWordPatterns(): WordPatternEntry[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length < 3) return []

  const patterns: WordPatternEntry[] = []

  // Prefix patterns
  const prefixMap = new Map<string, { count: number; totalAccuracy: number; words: string[] }>()
  for (const entry of entries) {
    if (entry.word.length >= 3) {
      const prefix = entry.word.slice(0, 3)
      const existing = prefixMap.get(prefix) ?? { count: 0, totalAccuracy: 0, words: [] }
      existing.count++
      existing.totalAccuracy += entry.masteryScore
      if (existing.words.length < 3) existing.words.push(entry.word)
      prefixMap.set(prefix, existing)
    }
  }
  for (const [prefix, data] of Array.from(prefixMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 5)) {
    if (data.count >= 2) {
      patterns.push({
        pattern: prefix,
        type: 'prefix',
        count: data.count,
        avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
        examples: data.words,
      })
    }
  }

  // Suffix patterns
  const suffixMap = new Map<string, { count: number; totalAccuracy: number; words: string[] }>()
  for (const entry of entries) {
    if (entry.word.length >= 3) {
      const suffix = entry.word.slice(-3)
      const existing = suffixMap.get(suffix) ?? { count: 0, totalAccuracy: 0, words: [] }
      existing.count++
      existing.totalAccuracy += entry.masteryScore
      if (existing.words.length < 3) existing.words.push(entry.word)
      suffixMap.set(suffix, existing)
    }
  }
  for (const [suffix, data] of Array.from(suffixMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 5)) {
    if (data.count >= 2) {
      patterns.push({
        pattern: suffix,
        type: 'suffix',
        count: data.count,
        avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
        examples: data.words,
      })
    }
  }

  // Length clusters
  const lengthMap = new Map<number, { count: number; totalAccuracy: number; words: string[] }>()
  for (const entry of entries) {
    const len = entry.word.length
    const existing = lengthMap.get(len) ?? { count: 0, totalAccuracy: 0, words: [] }
    existing.count++
    existing.totalAccuracy += entry.masteryScore
    if (existing.words.length < 3) existing.words.push(entry.word)
    lengthMap.set(len, existing)
  }
  for (const [len, data] of Array.from(lengthMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 3)) {
    if (data.count >= 2) {
      patterns.push({
        pattern: `${len} letters`,
        type: 'length_cluster',
        count: data.count,
        avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
        examples: data.words,
      })
    }
  }

  // Category clusters
  const catMap = new Map<string, { count: number; totalAccuracy: number; words: string[] }>()
  for (const entry of entries) {
    const cat = entry.category || DEFAULT_CATEGORY
    const existing = catMap.get(cat) ?? { count: 0, totalAccuracy: 0, words: [] }
    existing.count++
    existing.totalAccuracy += entry.masteryScore
    if (existing.words.length < 3) existing.words.push(entry.word)
    catMap.set(cat, existing)
  }
  for (const [cat, data] of Array.from(catMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 3)) {
    patterns.push({
      pattern: cat,
      type: 'category_cluster',
      count: data.count,
      avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      examples: data.words,
    })
  }

  // Letter frequency
  const letterMap = new Map<string, { count: number; totalAccuracy: number; words: string[] }>()
  for (const entry of entries) {
    for (const letter of entry.word) {
      const existing = letterMap.get(letter) ?? { count: 0, totalAccuracy: 0, words: [] }
      existing.count++
      existing.totalAccuracy += entry.masteryScore
      if (existing.words.length < 3 && !existing.words.includes(entry.word)) existing.words.push(entry.word)
      letterMap.set(letter, existing)
    }
  }
  const topLetters = Array.from(letterMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 3)
  for (const [letter, data] of topLetters) {
    patterns.push({
      pattern: `"${letter}" appears often`,
      type: 'letter_frequency',
      count: data.count,
      avgAccuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      examples: data.words,
    })
  }

  return patterns
}

// ── 12. getWeakWords ───────────────────────────────────────────────────────

/**
 * Returns words with the lowest mastery scores that need practice.
 */
export function getWeakWords(limit?: number): WordPerformance[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const minAttempts = 2
  const weak = entries
    .filter(e => e.attempts >= minAttempts)
    .sort((a, b) => a.masteryScore - b.masteryScore)

  return typeof limit === 'number' && limit > 0 ? weak.slice(0, limit) : weak
}

// ── 13. getStrongWords ─────────────────────────────────────────────────────

/**
 * Returns words with the highest mastery scores.
 */
export function getStrongWords(limit?: number): WordPerformance[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const strong = [...entries].sort((a, b) => {
    if (b.masteryScore !== a.masteryScore) return b.masteryScore - a.masteryScore
    return b.attempts - a.attempts
  })

  return typeof limit === 'number' && limit > 0 ? strong.slice(0, limit) : strong
}

// ── 14. getWordInsights ────────────────────────────────────────────────────

/**
 * Generates textual insights about the player's word performance.
 */
export function getWordInsights(): string[] {
  const state = loadState()
  const stats = waGetWordStats()
  const entries = getWordEntries(state)
  const insights: string[] = []

  if (entries.length === 0) {
    insights.push('No words tracked yet. Play some games to generate insights!')
    return insights
  }

  // Accuracy insight
  if (stats.avgAccuracy >= 85) {
    insights.push(`Excellent accuracy of ${stats.avgAccuracy}%! You're performing consistently well.`)
  } else if (stats.avgAccuracy >= 60) {
    insights.push(`Good accuracy at ${stats.avgAccuracy}%. Keep practicing weak words to push higher.`)
  } else if (stats.avgAccuracy > 0) {
    insights.push(`Accuracy is at ${stats.avgAccuracy}%. Focus on understanding words before attempting them at speed.`)
  }

  // Vocabulary size
  if (stats.uniqueWords >= 100) {
    insights.push(`Impressive vocabulary of ${stats.uniqueWords} unique words tracked!`)
  } else if (stats.uniqueWords >= 30) {
    insights.push(`You've encountered ${stats.uniqueWords} unique words. Keep exploring to grow your vocabulary!`)
  } else if (stats.uniqueWords > 0) {
    insights.push(`So far ${stats.uniqueWords} unique words. Try harder difficulties to discover more.`)
  }

  // Mastery distribution
  if (stats.masteredCount > 0) {
    insights.push(`${stats.masteredCount} word${stats.masteredCount !== 1 ? 's' : ''} fully mastered (${getMasteryEmoji('mastered')}).`)
  }
  if (stats.newCount > 5) {
    insights.push(`${stats.newCount} words still new. Review them regularly to build familiarity.`)
  }

  // Weak category detection
  const catPerf = getCategoryPerformance()
  if (catPerf.length >= 2) {
    const weakest = catPerf[catPerf.length - 1]
    const strongest = catPerf[0]
    if (weakest.accuracy < 50) {
      insights.push(`${weakest.emoji} ${weakest.label} is your weakest category at ${weakest.accuracy}%. Practice more here.`)
    }
    if (strongest.accuracy > 80) {
      insights.push(`${strongest.emoji} ${strongest.label} is your strongest category at ${strongest.accuracy}%.`)
    }
  }

  // Time insights
  if (stats.avgTimeMs > 0 && stats.avgTimeMs < 2000) {
    insights.push(`Fast response time averaging ${Math.round(stats.avgTimeMs)}ms per word.`)
  } else if (stats.avgTimeMs >= 2000 && stats.avgTimeMs < 5000) {
    insights.push(`Average response time is ${Math.round(stats.avgTimeMs)}ms. Speed up with more practice!`)
  }

  // Streak insight
  const longest = entries.reduce((max, w) => Math.max(max, w.longestStreak), 0)
  if (longest >= 10) {
    insights.push(`Amazing ${longest}-word streak! You really know your vocabulary.`)
  } else if (longest >= 5) {
    insights.push(`Longest streak: ${longest} correct words in a row. Can you beat it?`)
  }

  // Difficulty insight
  const diffBreakdown = getDifficultyBreakdown()
  const hardWords = diffBreakdown.find(d => d.difficulty === 'hard' || d.difficulty === 'expert')
  if (hardWords && hardWords.count > 0 && hardWords.accuracy < 60) {
    insights.push(`Hard/expert words need work (${hardWords.accuracy}% accuracy across ${hardWords.count} words).`)
  }

  if (insights.length === 0) {
    insights.push('Keep playing to unlock deeper performance insights!')
  }

  return insights
}

// ── 15. getAverageWordLength ───────────────────────────────────────────────

/**
 * Returns the average word length across all tracked words.
 */
export function getAverageWordLength(): number {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return 0

  const totalLength = entries.reduce((sum, w) => sum + w.word.length, 0)
  return Math.round((totalLength / entries.length) * 100) / 100
}

// ── 16. getLongestStreak ───────────────────────────────────────────────────

/**
 * Returns the longest correct-word streak across all tracked words.
 */
export function getLongestStreak(): number {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return 0

  return entries.reduce((max, w) => Math.max(max, w.longestStreak), 0)
}

// ── 17. getWordAccuracy ────────────────────────────────────────────────────

/**
 * Returns overall accuracy as a percentage (0–100).
 */
export function getWordAccuracy(): number {
  const stats = waGetWordStats()
  return stats.avgAccuracy
}

// ── 18. getCommonMistakes ──────────────────────────────────────────────────

/**
 * Returns words that are most frequently gotten wrong, with mistake details.
 */
export function getCommonMistakes(limit?: number): { word: string; wrongCount: number; totalCount: number; errorRate: number; difficulty: string; category: string }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const mistakes = entries
    .filter(e => e.wrong > 0)
    .map(e => ({
      word: e.word,
      wrongCount: e.wrong,
      totalCount: e.attempts,
      errorRate: Math.round((e.wrong / e.attempts) * 10000) / 100,
      difficulty: e.difficulty,
      category: e.category,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount)

  return typeof limit === 'number' && limit > 0 ? mistakes.slice(0, limit) : mistakes
}

// ── 19. getImprovementAreas ───────────────────────────────────────────────

/**
 * Identifies specific areas where the player can improve.
 */
export function getImprovementAreas(): { area: string; description: string; priority: 'high' | 'medium' | 'low'; suggestedAction: string }[] {
  const stats = waGetWordStats()
  const weak = getWeakWords(20)
  const catPerf = getCategoryPerformance()
  const diffBreakdown = getDifficultyBreakdown()
  const state = loadState()
  const entries = getWordEntries(state)
  const areas: { area: string; description: string; priority: 'high' | 'medium' | 'low'; suggestedAction: string }[] = []

  // Check overall accuracy
  if (stats.avgAccuracy < 50 && stats.totalAttempts > 5) {
    areas.push({
      area: 'Overall Accuracy',
      description: `Your accuracy is ${stats.avgAccuracy}%, below the recommended 60% threshold.`,
      priority: 'high',
      suggestedAction: 'Slow down and focus on reading each word carefully before responding.',
    })
  }

  // Check for many weak words
  if (weak.length >= 10) {
    const avgWeakAccuracy = weak.reduce((s, w) => s + w.masteryScore, 0) / weak.length
    areas.push({
      area: 'Weak Vocabulary',
      description: `${weak.length} words have below-average mastery (avg ${Math.round(avgWeakAccuracy)}%).`,
      priority: 'high',
      suggestedAction: 'Practice the weakest 10 words daily until their mastery reaches 70%+.',
    })
  }

  // Check category imbalances
  if (catPerf.length >= 2) {
    const worst = catPerf[catPerf.length - 1]
    const best = catPerf[0]
    const gap = best.accuracy - worst.accuracy
    if (gap > 30) {
      areas.push({
        area: `${worst.emoji} ${worst.label} Category`,
        description: `Category gap of ${Math.round(gap)}% between strongest (${best.label}) and weakest (${worst.label}).`,
        priority: 'medium',
        suggestedAction: `Focus on ${worst.label} words to close the gap with ${best.label}.`,
      })
    }
  }

  // Check difficulty scaling
  const easyWords = diffBreakdown.find(d => d.difficulty === 'easy')
  const hardWords = diffBreakdown.find(d => d.difficulty === 'hard' || d.difficulty === 'expert')
  if (easyWords && hardWords && easyWords.accuracy - hardWords.accuracy > 40) {
    areas.push({
      area: 'Difficulty Scaling',
      description: `Large accuracy drop from easy (${easyWords.accuracy}%) to hard (${hardWords.accuracy}%) words.`,
      priority: 'medium',
      suggestedAction: 'Gradually increase difficulty. Practice medium words until confident before tackling hard ones.',
    })
  }

  // Check response time
  if (stats.avgTimeMs > 5000 && stats.avgAccuracy < 70) {
    areas.push({
      area: 'Response Speed',
      description: `Average response time of ${Math.round(stats.avgTimeMs)}ms with ${stats.avgAccuracy}% accuracy.`,
      priority: 'medium',
      suggestedAction: 'Speed up on familiar words to free mental bandwidth for harder ones.',
    })
  }

  // Check vocabulary breadth
  if (stats.uniqueWords < 20 && stats.totalAttempts > 30) {
    areas.push({
      area: 'Vocabulary Breadth',
      description: `Only ${stats.uniqueWords} unique words despite ${stats.totalAttempts} total attempts.`,
      priority: 'low',
      suggestedAction: 'Try different game modes or categories to encounter new words.',
    })
  }

  // Check for new words not practiced
  const newWords = entries.filter(e => e.attempts <= 1)
  if (newWords.length > stats.uniqueWords * 0.4 && stats.uniqueWords > 5) {
    areas.push({
      area: 'Word Review',
      description: `${newWords.length} words (${Math.round(newWords.length / stats.uniqueWords * 100)}%) have been seen only once.`,
      priority: 'low',
      suggestedAction: 'Revisit recently discovered words to move them from new to familiar.',
    })
  }

  return areas.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

// ── 20. getWordTimeline ────────────────────────────────────────────────────

/**
 * Returns a chronological timeline of word encounters.
 */
export function getWordTimeline(limit?: number): { word: string; timestamp: number; accuracy: number; difficulty: string; category: string; attempts: number }[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const timeline = [...entries]
    .map(e => ({
      word: e.word,
      timestamp: e.lastSeenAt,
      accuracy: e.masteryScore,
      difficulty: e.difficulty,
      category: e.category,
      attempts: e.attempts,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

  return typeof limit === 'number' && limit > 0 ? timeline.slice(0, limit) : timeline
}

// ── 21. getWeeklyReport ────────────────────────────────────────────────────

/**
 * Generates a weekly analytics report for the most recent complete week.
 */
export function getWeeklyReport(): WeeklyReport {
  const state = loadState()
  const now = new Date()
  const endOfWeek = new Date(now)
  endOfWeek.setHours(23, 59, 59, 999)
  const startOfWeek = new Date(endOfWeek)
  startOfWeek.setDate(startOfWeek.getDate() - 6)
  startOfWeek.setHours(0, 0, 0, 0)

  const startMs = startOfWeek.getTime()
  const endMs = endOfWeek.getTime()
  const weekWords = getWordsInRange(state, startMs, endMs)
  const allEntries = getWordEntries(state)

  const totalAttempts = weekWords.reduce((s, w) => s + w.attempts, 0)
  const totalCorrect = weekWords.reduce((s, w) => s + w.correct, 0)
  const accuracy = calcAccuracy(totalCorrect, totalAttempts)
  const avgTimeMs = weekWords.length > 0
    ? Math.round(weekWords.reduce((s, w) => s + w.avgTimeMs, 0) / weekWords.length * 100) / 100
    : 0
  const newWords = weekWords.filter(w => w.firstSeenAt >= startMs).length
  const bestStreak = weekWords.reduce((max, w) => Math.max(max, w.longestStreak), 0)

  // Category analysis
  const catAccuracy = new Map<string, { correct: number; total: number }>()
  for (const w of weekWords) {
    const existing = catAccuracy.get(w.category) ?? { correct: 0, total: 0 }
    existing.correct += w.correct
    existing.total += w.attempts
    catAccuracy.set(w.category, existing)
  }
  const catEntries = Array.from(catAccuracy.entries())
    .map(([cat, data]) => ({ category: cat, accuracy: calcAccuracy(data.correct, data.total) }))
    .sort((a, b) => b.accuracy - a.accuracy)
  const strongestCategory = catEntries.length > 0 ? catEntries[0].category : 'n/a'
  const weakestCategory = catEntries.length > 0 ? catEntries[catEntries.length - 1].category : 'n/a'

  // Trend direction compared to previous week
  const prevStartMs = startMs - 7 * 24 * 60 * 60 * 1000
  const prevEndMs = startMs
  const prevWords = getWordsInRange(state, prevStartMs, prevEndMs)
  const prevAccuracy = prevWords.length > 0
    ? calcAccuracy(prevWords.reduce((s, w) => s + w.correct, 0), prevWords.reduce((s, w) => s + w.attempts, 0))
    : accuracy

  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  if (accuracy - prevAccuracy > 5) trendDirection = 'up'
  else if (prevAccuracy - accuracy > 5) trendDirection = 'down'

  const topWords = [...weekWords]
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, 5)
    .map(w => w.word)

  const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return {
    weekLabel,
    startDate: getDateKey(startOfWeek),
    endDate: getDateKey(endOfWeek),
    totalAttempts,
    totalCorrect,
    accuracy,
    avgTimeMs,
    newWords,
    strongestCategory,
    weakestCategory,
    bestStreak,
    trendDirection,
    topWords,
  }
}

// ── 22. getMonthlyReport ───────────────────────────────────────────────────

/**
 * Generates a monthly analytics report for the most recent complete month.
 */
export function getMonthlyReport(): MonthlyReport {
  const state = loadState()
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)

  const startMs = startOfMonth.getTime()
  const endMs = endOfMonth.getTime()
  const monthWords = getWordsInRange(state, startMs, endMs)
  const allEntries = getWordEntries(state)

  const totalAttempts = monthWords.reduce((s, w) => s + w.attempts, 0)
  const totalCorrect = monthWords.reduce((s, w) => s + w.correct, 0)
  const accuracy = calcAccuracy(totalCorrect, totalAttempts)
  const avgTimeMs = monthWords.length > 0
    ? Math.round(monthWords.reduce((s, w) => s + w.avgTimeMs, 0) / monthWords.length * 100) / 100
    : 0
  const newWords = monthWords.filter(w => w.firstSeenAt >= startMs).length
  const masteredWords = monthWords.filter(w => getMasteryLevel(w.masteryScore) === 'mastered').length

  // Vocabulary growth this month
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  const vocabBefore = allEntries.filter(w => w.firstSeenAt < prevMonthEnd.getTime()).length
  const vocabNow = allEntries.length
  const vocabularyGrowth = vocabNow - vocabBefore

  // Top category
  const catMap = new Map<string, number>()
  for (const w of monthWords) {
    catMap.set(w.category, (catMap.get(w.category) ?? 0) + w.attempts)
  }
  const topCategory = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'n/a'

  // Consistency: inverse coefficient of variation
  const allAccuracies = monthWords.map(w => w.masteryScore)
  const mean = allAccuracies.length > 0 ? allAccuracies.reduce((a, b) => a + b, 0) / allAccuracies.length : 0
  const sd = standardDeviation(allAccuracies)
  const consistency = mean > 0 ? Math.round(clamp((1 - sd / mean) * 100, 0, 100)) : 0

  // Improvement rate vs previous month
  const prevStartMs = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0).getTime()
  const prevEndMs = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime()
  const prevMonthWords = getWordsInRange(state, prevStartMs, prevEndMs)
  const prevAccuracy = prevMonthWords.length > 0
    ? calcAccuracy(prevMonthWords.reduce((s, w) => s + w.correct, 0), prevMonthWords.reduce((s, w) => s + w.attempts, 0))
    : accuracy
  const improvementRate = prevAccuracy > 0
    ? Math.round(((accuracy - prevAccuracy) / prevAccuracy) * 10000) / 100
    : 0

  const topWords = [...monthWords]
    .sort((a, b) => b.masteryScore - a.masteryScore)
    .slice(0, 10)
    .map(w => w.word)

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return {
    monthLabel,
    startDate: getDateKey(startOfMonth),
    endDate: getDateKey(endOfMonth),
    totalAttempts,
    totalCorrect,
    accuracy,
    avgTimeMs,
    newWords,
    vocabularyGrowth,
    masteredWords,
    topCategory,
    consistency,
    topWords,
    improvementRate,
  }
}

// ── 23. getAnalyticsOverview ───────────────────────────────────────────────

/**
 * Returns a comprehensive overview combining all major analytics.
 */
export function getAnalyticsOverview(): {
  stats: WordStats
  accuracy: number
  averageWordLength: number
  longestStreak: number
  weakWordCount: number
  strongWordCount: number
  categoryCount: number
  difficultyBreakdown: ReturnType<typeof getDifficultyBreakdown>
  recentTrend: TimeTrend | null
  vocabularySize: number
  improvementAreas: ReturnType<typeof getImprovementAreas>
  insights: string[]
} {
  const stats = waGetWordStats()
  const trends = getTimeBasedTrends(7)
  const recentTrend = trends.length > 0 ? trends[trends.length - 1] : null
  const weakWords = getWeakWords()
  const strongWords = getStrongWords()
  const categories = new Set(Object.values(loadState().words).map(w => w.category))

  return {
    stats,
    accuracy: stats.avgAccuracy,
    averageWordLength: getAverageWordLength(),
    longestStreak: getLongestStreak(),
    weakWordCount: weakWords.length,
    strongWordCount: strongWords.length,
    categoryCount: categories.size,
    difficultyBreakdown: getDifficultyBreakdown(),
    recentTrend,
    vocabularySize: stats.uniqueWords,
    improvementAreas: getImprovementAreas(),
    insights: getWordInsights(),
  }
}

// ── 24. getPerformanceCard ─────────────────────────────────────────────────

/**
 * Returns a UI-ready performance summary card.
 */
export function getPerformanceCard(): PerformanceCard {
  const stats = waGetWordStats()
  const trends = getTimeBasedTrends(7)

  // Trend direction
  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  let trendPercent = 0
  if (trends.length >= 2) {
    const recent = trends[trends.length - 1].accuracy
    const previous = trends[trends.length - 2].accuracy
    if (previous > 0) {
      const change = ((recent - previous) / previous) * 100
      trendPercent = Math.round(Math.abs(change) * 100) / 100
      if (change > 2) trendDirection = 'up'
      else if (change < -2) trendDirection = 'down'
    }
  }

  const gradeInfo = getGrade(stats.avgAccuracy)
  const color = stats.avgAccuracy >= 85 ? '#22c55e' : stats.avgAccuracy >= 60 ? '#3b82f6' : stats.avgAccuracy >= 40 ? '#eab308' : '#ef4444'

  return {
    title: 'Word Performance',
    subtitle: `${stats.uniqueWords} words tracked`,
    accuracy: stats.avgAccuracy,
    trendDirection,
    trendPercent,
    totalWords: stats.totalAttempts,
    avgTimeMs: stats.avgTimeMs,
    topWord: stats.bestWord,
    grade: gradeInfo.grade,
    color,
  }
}

// ── 25. getGrowthChart ─────────────────────────────────────────────────────

/**
 * Returns data for a vocabulary growth chart.
 */
export function getGrowthChart(days?: number): GrowthChart {
  const growth = getVocabularyGrowth(days)
  if (growth.length === 0) {
    return { points: [], totalUnique: 0, growthRate: 0, projectedNextWeek: 0 }
  }

  const totalUnique = growth.length > 0 ? growth[growth.length - 1].cumulativeUnique : 0

  // Calculate growth rate (words per day over last 7 days)
  const recentDays = growth.slice(-7)
  const recentGrowth = recentDays.length >= 2
    ? recentDays[recentDays.length - 1].cumulativeUnique - recentDays[0].cumulativeUnique
    : 0
  const growthRate = recentDays.length > 0 ? Math.round((recentGrowth / recentDays.length) * 100) / 100 : 0

  // Project next week
  const projectedNextWeek = totalUnique + Math.round(growthRate * 7)

  return {
    points: growth,
    totalUnique,
    growthRate,
    projectedNextWeek,
  }
}

// ── 26. getWordCloud ───────────────────────────────────────────────────────

/**
 * Returns word cloud data weighted by frequency and colored by accuracy.
 */
export function getWordCloud(limit?: number): WordCloudEntry[] {
  const state = loadState()
  const entries = getWordEntries(state)
  if (entries.length === 0) return []

  const maxAttempts = Math.max(...entries.map(e => e.attempts), 1)

  const cloud = [...entries]
    .sort((a, b) => b.attempts - a.attempts)
    .map(e => ({
      word: e.word,
      weight: clamp(e.attempts / maxAttempts, 0.1, 1),
      accuracy: e.masteryScore,
      difficulty: e.difficulty,
    }))

  return typeof limit === 'number' && limit > 0 ? cloud.slice(0, limit) : cloud
}

// ── 27. getDistributionGrid ────────────────────────────────────────────────

/**
 * Returns multi-axis distribution data for a grid visualization.
 */
export function getDistributionGrid(): DistributionGrid {
  const state = loadState()
  const entries = getWordEntries(state)

  // Category distribution
  const catMap = new Map<string, { count: number; totalAccuracy: number }>()
  for (const e of entries) {
    const cat = e.category || DEFAULT_CATEGORY
    const existing = catMap.get(cat) ?? { count: 0, totalAccuracy: 0 }
    existing.count++
    existing.totalAccuracy += e.masteryScore
    catMap.set(cat, existing)
  }
  const categories = Array.from(catMap.entries())
    .map(([category, data]) => {
      const meta = CATEGORY_META[category] ?? { label: category, color: '#6b7280', emoji: '📖' }
      return {
        category,
        label: meta.label,
        color: meta.color,
        emoji: meta.emoji,
        count: data.count,
        accuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      }
    })
    .sort((a, b) => b.count - a.count)

  // Difficulty distribution
  const diffMap = new Map<string, { count: number; totalAccuracy: number; totalTime: number }>()
  for (const e of entries) {
    const diff = e.difficulty || DEFAULT_DIFFICULTY
    const existing = diffMap.get(diff) ?? { count: 0, totalAccuracy: 0, totalTime: 0 }
    existing.count++
    existing.totalAccuracy += e.masteryScore
    existing.totalTime += e.avgTimeMs
    diffMap.set(diff, existing)
  }
  const difficulties = Array.from(diffMap.entries())
    .map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      accuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
      avgTimeMs: Math.round((data.totalTime / data.count) * 100) / 100,
    }))
    .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99))

  // Length distribution
  const lengthMap = new Map<number, { count: number; totalAccuracy: number }>()
  for (const e of entries) {
    const len = e.word.length
    const existing = lengthMap.get(len) ?? { count: 0, totalAccuracy: 0 }
    existing.count++
    existing.totalAccuracy += e.masteryScore
    lengthMap.set(len, existing)
  }
  const lengths = Array.from(lengthMap.entries())
    .map(([length, data]) => ({
      length,
      count: data.count,
      accuracy: Math.round((data.totalAccuracy / data.count) * 100) / 100,
    }))
    .sort((a, b) => a.length - b.length)

  return { categories, difficulties, lengths }
}

// ── 28. getInsightCard ─────────────────────────────────────────────────────

/**
 * Returns a single most relevant insight card based on current analytics.
 */
export function getInsightCard(): InsightCard {
  const stats = waGetWordStats()
  const entries = getWordEntries(loadState())

  // Priority: most actionable insight
  if (entries.length === 0) {
    return {
      icon: '🚀',
      title: 'Get Started',
      description: 'Play your first game to unlock word analytics and personalized insights.',
      metric: '0',
      metricLabel: 'Words Tracked',
      severity: 'neutral',
      action: 'Start playing to begin tracking your word performance!',
    }
  }

  const weakWords = getWeakWords(5)
  if (weakWords.length >= 5 && weakWords[0].masteryScore < 30) {
    const worstWord = weakWords[0]
    return {
      icon: '🎯',
      title: 'Focus Practice Needed',
      description: `"${worstWord.word}" has ${worstWord.masteryScore}% accuracy after ${worstWord.attempts} attempts. It's your weakest word.`,
      metric: String(weakWords.length),
      metricLabel: 'Words to Practice',
      severity: 'negative',
      action: `Review "${worstWord.word}" and other weak words in a focused practice session.`,
    }
  }

  if (stats.avgAccuracy >= 85) {
    return {
      icon: '🏆',
      title: 'Outstanding Performance',
      description: `You're averaging ${stats.avgAccuracy}% accuracy across ${stats.uniqueWords} words. Top tier performance!`,
      metric: `${stats.avgAccuracy}%`,
      metricLabel: 'Average Accuracy',
      severity: 'positive',
      action: 'Challenge yourself with harder difficulties to keep growing.',
    }
  }

  if (stats.masteredCount > 0) {
    return {
      icon: '⭐',
      title: 'Mastery Milestone',
      description: `You've mastered ${stats.masteredCount} word${stats.masteredCount !== 1 ? 's' : ''}! Keep going to grow your mastered collection.`,
      metric: String(stats.masteredCount),
      metricLabel: 'Mastered Words',
      severity: 'positive',
      action: 'Review mastered words occasionally to maintain retention.',
    }
  }

  if (stats.totalAttempts > 20 && stats.avgAccuracy < 50) {
    return {
      icon: '📖',
      title: 'Room to Grow',
      description: `With ${stats.totalAttempts} attempts at ${stats.avgAccuracy}% accuracy, focus on accuracy over speed.`,
      metric: `${stats.avgAccuracy}%`,
      metricLabel: 'Current Accuracy',
      severity: 'negative',
      action: 'Take your time with each word. Understanding beats speed.',
    }
  }

  return {
    icon: '📈',
    title: 'Making Progress',
    description: `${stats.uniqueWords} unique words tracked with ${stats.avgAccuracy}% average accuracy. Keep it up!`,
    metric: String(stats.uniqueWords),
    metricLabel: 'Unique Words',
    severity: 'neutral',
    action: 'Play daily to build consistent learning habits.',
  }
}

// ── 29. getTrendChart ──────────────────────────────────────────────────────

/**
 * Returns time-series chart data with trend analysis.
 */
export function getTrendChart(days?: number): TrendChart {
  const trends = getTimeBasedTrends(days)
  if (trends.length === 0) {
    return { labels: [], accuracyData: [], volumeData: [], timeData: [], trendLine: 'stable', slope: 0 }
  }

  const labels = trends.map(t => {
    const d = new Date(t.date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  const accuracyData = trends.map(t => t.accuracy)
  const volumeData = trends.map(t => t.wordsAttempted)
  const timeData = trends.map(t => t.avgTimeMs)

  // Simple linear regression for slope
  let slope = 0
  if (accuracyData.length >= 3) {
    const n = accuracyData.length
    const xMean = (n - 1) / 2
    const yMean = accuracyData.reduce((a, b) => a + b, 0) / n
    let numerator = 0
    let denominator = 0
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (accuracyData[i] - yMean)
      denominator += (i - xMean) ** 2
    }
    slope = denominator !== 0 ? Math.round((numerator / denominator) * 100) / 100 : 0
  }

  let trendLine: 'improving' | 'declining' | 'stable' = 'stable'
  if (slope > 0.5) trendLine = 'improving'
  else if (slope < -0.5) trendLine = 'declining'

  return { labels, accuracyData, volumeData, timeData, trendLine, slope }
}

// ── 30. getWeaknessCard ────────────────────────────────────────────────────

/**
 * Returns a UI-ready weakness summary card with practice suggestions.
 */
export function getWeaknessCard(): WeaknessCard {
  const weak = getWeakWords(8)

  if (weak.length === 0) {
    return {
      title: 'No Weaknesses Detected',
      weaknesses: [],
      overallSeverity: 'low',
      practiceCount: 0,
    }
  }

  const avgWeakAccuracy = weak.reduce((s, w) => s + w.masteryScore, 0) / weak.length
  const overallSeverity = avgWeakAccuracy < 25 ? 'high' : avgWeakAccuracy < 50 ? 'medium' : 'low'

  const suggestions: Record<string, string> = {
    easy: 'Review the definition and try using it in a sentence.',
    medium: 'Practice spelling it out and test yourself repeatedly.',
    hard: 'Break it into syllables and study its meaning carefully.',
    expert: 'Create a mnemonic or association to remember this word.',
  }

  const weaknesses = weak.map(w => ({
    word: w.word,
    accuracy: w.masteryScore,
    attempts: w.attempts,
    suggestion: suggestions[w.difficulty] ?? 'Practice this word more frequently.',
  }))

  return {
    title: `${weak.length} Words Need Practice`,
    weaknesses,
    overallSeverity,
    practiceCount: weak.length,
  }
}

// ── 31. getSummaryCard ─────────────────────────────────────────────────────

/**
 * Returns an all-in-one summary card with key metrics and a highlight.
 */
export function getSummaryCard(): SummaryCard {
  const stats = waGetWordStats()
  const longestStreak = getLongestStreak()
  const entries = getWordEntries(loadState())

  const currentStreak = entries.reduce((max, w) => Math.max(max, w.streak), 0)
  const gradeInfo = getGrade(stats.avgAccuracy)

  // Generate a highlight based on most impressive metric
  let highlight: string
  if (stats.avgAccuracy >= 90) {
    highlight = `Elite accuracy of ${stats.avgAccuracy}% across ${stats.uniqueWords} words!`
  } else if (longestStreak >= 15) {
    highlight = `Incredible ${longestStreak}-word correct streak!`
  } else if (stats.uniqueWords >= 50) {
    highlight = `Expansive vocabulary of ${stats.uniqueWords} words tracked.`
  } else if (stats.masteredCount >= 10) {
    highlight = `${stats.masteredCount} words fully mastered!`
  } else if (currentStreak >= 5) {
    highlight = `On a ${currentStreak}-word hot streak right now!`
  } else if (stats.totalAttempts > 0) {
    highlight = `${stats.totalAttempts} total attempts with ${stats.avgAccuracy}% accuracy. Keep going!`
  } else {
    highlight = 'Start playing to build your word analytics profile!'
  }

  return {
    totalWords: stats.totalAttempts,
    masteredWords: stats.masteredCount,
    avgAccuracy: stats.avgAccuracy,
    avgTimeMs: stats.avgTimeMs,
    longestStreak,
    currentStreak,
    vocabularySize: stats.uniqueWords,
    grade: gradeInfo.grade,
    gradeEmoji: gradeInfo.emoji,
    highlight,
    generatedAt: new Date().toISOString(),
  }
}
