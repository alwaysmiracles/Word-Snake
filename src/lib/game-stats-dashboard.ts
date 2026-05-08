/**
 * game-stats-dashboard.ts — Unified statistics dashboard for Word Snake.
 * Aggregates game-stats, leaderboard, streak, achievements, word-mastery,
 * and stats-compare-enhanced into cohesive dashboard views.
 */
'use client'

import { getSessions, getLastNSessions, calculateTrends, type GameSession } from './stats-compare-enhanced'
import { getLeaderboard } from './leaderboard'
import { getStreak } from './streak'
import { getAllMasteries, getMasteryStats, getWeakestWords, getStrongestWords } from './word-mastery'
import { ACHIEVEMENTS, getUnlockedAchievements } from './achievements'
import { getGameStats, formatPlayTime } from './game-stats'

// ── Types ────────────────────────────────────────────────────────────────────
export type DashboardPeriod = 'today' | 'week' | 'month' | 'all'

export interface DashboardConfig {
  period: DashboardPeriod
  sections: { overview: boolean; words: boolean; scores: boolean; achievements: boolean; trends: boolean }
  refreshInterval: number
}

export interface OverviewStats {
  totalGamesPlayed: number; totalWordsEaten: number; totalScore: number
  avgScorePerGame: number; avgWordsPerGame: number; totalTimePlayed: string
  bestScore: number; currentStreak: number; bestStreak: number
  completionRate: number; favoriteCategory: string; topWord: string
}

export interface WordStats {
  totalUnique: number; totalEncounters: number
  masteryBreakdown: Record<string, number>; weakestWords: string[]; strongestWords: string[]
  recentWords: { word: string; date: string }[]; categoryDistribution: Record<string, number>
}

export interface ScoreStats {
  totalScore: number; averageScore: number; medianScore: number
  bestScore: number; worstScore: number; scoreTrend: number[]
  ratingDistribution: Record<string, number>; highScoreHistory: { score: number; date: string }[]
}

export interface TrendData {
  dailyScores: number[]; dailyWords: number[]; dailyGames: number[]
  avgScoreTrend: number[]; wordsPerGameTrend: number[]; improvementRate: number
}

export interface AchievementSummary {
  totalUnlocked: number; totalAvailable: number; percentage: number
  byCategory: Record<string, { unlocked: number; total: number }>
  recentUnlocks: { id: string; title: string; emoji: string; unlockedAt: string }[]
}

export interface CategoryLeaderboardEntry {
  category: string; totalScore: number; wordCount: number; avgScorePerWord: number
}

export interface PersonalBest {
  metric: string; value: number | string; label: string; icon: string; achievedAt: string | null
}

export interface ComparisonWithAverage {
  metric: string; playerValue: number; averageValue: number; difference: number; percentAbove: number
}

export interface QuickStat { icon: string; label: string; value: string; trend: 'up' | 'down' | 'stable' }

export interface DashboardExportData {
  exportedAt: string; period: DashboardPeriod; overview: OverviewStats; words: WordStats
  scores: ScoreStats; trends: TrendData; achievements: AchievementSummary
  personalBests: PersonalBest[]; quickStats: QuickStat[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getStoredObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback } catch { return fallback }
}

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDateStr(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function periodCutoff(p: DashboardPeriod): number {
  switch (p) {
    case 'today': return new Date(daysAgo(0) + 'T00:00:00').getTime()
    case 'week':  return new Date(daysAgo(7) + 'T00:00:00').getTime()
    case 'month': return new Date(daysAgo(30) + 'T00:00:00').getTime()
    default:      return 0
  }
}

function sessionsForPeriod(period: DashboardPeriod): GameSession[] {
  const cut = periodCutoff(period)
  return getSessions().filter((s) => s.timestamp >= cut)
}

function scoreToRating(score: number, best: number): string {
  if (best === 0) return 'D'
  const r = score / best
  if (r >= 1.0) return 'SS'; if (r >= 0.9) return 'S'; if (r >= 0.75) return 'A'
  if (r >= 0.55) return 'B'; if (r >= 0.35) return 'C'; return 'D'
}

// ── 6. Dashboard Overview ────────────────────────────────────────────────────
export function getDashboardOverview(period: DashboardPeriod = 'all'): OverviewStats {
  const sessions = sessionsForPeriod(period)
  const n = sessions.length
  const totalWordsEaten = sessions.reduce((s, x) => s + x.wordsEaten, 0)
  const totalScore = sessions.reduce((s, x) => s + x.score, 0)
  const streak = getStreak()
  const masteries = getAllMasteries()

  // Favorite category & top word from mastery data
  const cats: Record<string, number> = {}
  for (const m of masteries) cats[m.category] = (cats[m.category] ?? 0) + m.encounters
  const top = [...masteries].sort((a, b) => b.encounters - a.encounters)

  return {
    totalGamesPlayed: n,
    totalWordsEaten,
    totalScore,
    avgScorePerGame: n ? Math.round(totalScore / n) : 0,
    avgWordsPerGame: n ? Math.round((totalWordsEaten / n) * 10) / 10 : 0,
    totalTimePlayed: formatPlayTime(sessions.reduce((s, x) => s + x.duration, 0)),
    bestScore: n ? Math.max(...sessions.map((s) => s.score)) : 0,
    currentStreak: streak.currentStreak,
    bestStreak: streak.longestStreak,
    completionRate: n ? sessions.filter((s) => s.wordsEaten > 0).length / n : 0,
    favoriteCategory: Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None',
    topWord: top[0]?.word ?? 'None',
  }
}

// ── 7. Word Stats ────────────────────────────────────────────────────────────
export function getWordStats(period: DashboardPeriod = 'all'): WordStats {
  const cut = periodCutoff(period)
  const all = getAllMasteries()
  const ms = period === 'all' ? all : all.filter((m) => m.lastSeenAt >= cut)
  const breakdown: Record<string, number> = { new: 0, seen: 0, learning: 0, familiar: 0, mastered: 0, legendary: 0 }
  const catDist: Record<string, number> = {}

  for (const m of ms) {
    breakdown[m.masteryLevel]++
    catDist[m.category] = (catDist[m.category] ?? 0) + m.encounters
  }

  return {
    totalUnique: ms.length,
    totalEncounters: ms.reduce((s, m) => s + m.encounters, 0),
    masteryBreakdown: breakdown,
    weakestWords: getWeakestWords(5).map((w) => w.word),
    strongestWords: getStrongestWords(5).map((w) => w.word),
    recentWords: [...ms].sort((a, b) => b.lastSeenAt - a.lastSeenAt).slice(0, 10)
      .map((m) => ({ word: m.word, date: toDateStr(m.lastSeenAt) })),
    categoryDistribution: catDist,
  }
}

// ── 8. Score Stats ───────────────────────────────────────────────────────────
export function getScoreStats(period: DashboardPeriod = 'all'): ScoreStats {
  const sessions = sessionsForPeriod(period)
  const scores = sessions.map((s) => s.score)
  const n = scores.length
  const totalScore = scores.reduce((a, b) => a + b, 0)
  const bestScore = n ? Math.max(...scores) : 0

  // Median
  let median = 0
  if (n > 0) {
    const sorted = [...scores].sort((a, b) => a - b)
    const mid = Math.floor(n / 2)
    median = n % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }

  // Rating distribution
  const ratings: Record<string, number> = { D: 0, C: 0, B: 0, A: 0, S: 0, SS: 0 }
  for (const s of sessions) ratings[scoreToRating(s.score, bestScore || 1)]++

  return {
    totalScore, averageScore: n ? Math.round(totalScore / n) : 0, median, bestScore,
    worstScore: n ? Math.min(...scores) : 0,
    scoreTrend: [...sessions].slice(0, 10).reverse().map((s) => s.score),
    ratingDistribution: ratings,
    highScoreHistory: getLeaderboard().map((e) => ({ score: e.score, date: e.date })),
  }
}

// ── 9. Trend Data ────────────────────────────────────────────────────────────
export function getTrendData(_period: DashboardPeriod = 'all', days: number = 14): TrendData {
  const cut = new Date(daysAgo(days) + 'T00:00:00').getTime()
  const filtered = getSessions().filter((s) => s.timestamp >= cut)

  // Group by day
  const buckets: Record<string, GameSession[]> = {}
  for (const s of filtered) {
    const day = toDateStr(s.timestamp)
    ;(buckets[day] ??= []).push(s)
  }
  const sortedDays = Object.keys(buckets).sort()
  const dailyScores: number[] = [], dailyWords: number[] = [], dailyGames: number[] = []
  for (const day of sortedDays) {
    dailyScores.push(buckets[day].reduce((s, x) => s + x.score, 0))
    dailyWords.push(buckets[day].reduce((s, x) => s + x.wordsEaten, 0))
    dailyGames.push(buckets[day].length)
  }

  // Rolling 5-game window trends
  const recent = getLastNSessions(20).reverse()
  const avgScoreTrend: number[] = [], wordsPerGameTrend: number[] = []
  for (let i = 0; i < recent.length; i++) {
    const w = recent.slice(Math.max(0, i - 4), i + 1)
    avgScoreTrend.push(Math.round(w.reduce((s, x) => s + x.score, 0) / w.length))
    wordsPerGameTrend.push(Math.round((w.reduce((s, x) => s + x.wordsEaten, 0) / w.length) * 10) / 10)
  }

  // Improvement rate: second half vs first half average score
  let improvementRate = 0
  if (recent.length >= 4) {
    const half = Math.floor(recent.length / 2)
    const avg1 = recent.slice(0, half).reduce((s, x) => s + x.score, 0) / half
    const avg2 = recent.slice(half).reduce((s, x) => s + x.score, 0) / (recent.length - half)
    improvementRate = avg1 > 0 ? Math.round(((avg2 - avg1) / avg1) * 1000) / 10 : (avg2 > 0 ? 100 : 0)
  }

  return { dailyScores, dailyWords, dailyGames, avgScoreTrend, wordsPerGameTrend, improvementRate }
}

// ── 10. Achievement Summary ──────────────────────────────────────────────────
export function getAchievementSummary(): AchievementSummary {
  const unlocked = getUnlockedAchievements()
  const timestamps = getStoredObject<Record<string, string>>('word-snake-achievement-timestamps', {})
  const byCategory: Record<string, { unlocked: number; total: number }> = {}

  for (const a of ACHIEVEMENTS) {
    let cat = 'general'
    if (a.id.includes('poem')) cat = 'poetry'
    else if (a.id.includes('score') || a.id.includes('century') || a.id.includes('roller')) cat = 'scoring'
    else if (a.id.includes('word') || a.id.includes('lexicon') || a.id.includes('vocabulary')) cat = 'words'
    else if (a.id.includes('categor')) cat = 'exploration'
    else if (a.id.includes('marathon')) cat = 'persistence'
    ;(byCategory[cat] ??= { unlocked: 0, total: 0 }).total++
    if (unlocked.includes(a.id)) byCategory[cat].unlocked++
  }

  const recentUnlocks = unlocked.map((id) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    return a ? { id, title: a.title, emoji: a.emoji, unlockedAt: timestamps[id] ?? 'unknown' } : null
  }).filter((u): u is NonNullable<typeof u> => u !== null)
    .sort((a, b) => (a.unlockedAt > b.unlockedAt ? -1 : 1)).slice(0, 10)

  return {
    totalUnlocked: unlocked.length, totalAvailable: ACHIEVEMENTS.length,
    percentage: ACHIEVEMENTS.length ? Math.round((unlocked.length / ACHIEVEMENTS.length) * 100) : 0,
    byCategory, recentUnlocks,
  }
}

// ── 11. Category Leaderboard ─────────────────────────────────────────────────
export function getCategoryLeaderboard(): CategoryLeaderboardEntry[] {
  const map: Record<string, { totalScore: number; wordCount: number }> = {}
  for (const m of getAllMasteries()) {
    ;(map[m.category] ??= { totalScore: 0, wordCount: 0 }).totalScore += m.totalScoreFromWord
    map[m.category].wordCount++
  }
  return Object.entries(map)
    .map(([category, d]) => ({
      category, totalScore: d.totalScore, wordCount: d.wordCount,
      avgScorePerWord: d.wordCount ? Math.round((d.totalScore / d.wordCount) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
}

// ── 12. Personal Bests ───────────────────────────────────────────────────────
export function getPersonalBests(): PersonalBest[] {
  const sessions = getSessions()
  const stats = getGameStats()
  const streak = getStreak()
  const pb = (metric: string, val: number | string, label: string, icon: string, ts: number | null): PersonalBest =>
    ({ metric, value: val, label, icon, achievedAt: ts ? toDateStr(ts) : null })

  const byScore = [...sessions].sort((a, b) => b.score - a.score)[0]
  const byWords = [...sessions].sort((a, b) => b.wordsEaten - a.wordsEaten)[0]
  const byWpm = [...sessions].sort((a, b) => b.wordsPerMinute - a.wordsPerMinute)[0]
  const fastest = sessions.filter((s) => s.wordsEaten > 0).sort((a, b) => a.duration - b.duration)[0]
  const longest = [...sessions].sort((a, b) => b.duration - a.duration)[0]

  return [
    pb('best_score', byScore?.score ?? 0, 'Best Score', '🏆', byScore?.timestamp ?? null),
    pb('most_words', byWords?.wordsEaten ?? 0, 'Most Words in Game', '📚', byWords?.timestamp ?? null),
    pb('longest_combo', stats.maxCombo, 'Longest Combo', '⚡', null),
    pb('best_wpm', byWpm?.wordsPerMinute ?? 0, 'Best Words/Min', '🏃', byWpm?.timestamp ?? null),
    pb('fastest_game', fastest ? `${Math.round(fastest.duration / 1000)}s` : 'N/A', 'Fastest Game', '⏱️', fastest?.timestamp ?? null),
    pb('longest_game', longest ? `${Math.round(longest.duration / 60000)}m` : 'N/A', 'Longest Game', '🕐', longest?.timestamp ?? null),
    pb('best_streak', streak.longestStreak, 'Best Streak', '🔥', null),
    pb('mastered_words', getMasteryStats().masteredCount, 'Mastered Words', '🎓', null),
  ]
}

// ── 13. Comparison With Average ──────────────────────────────────────────────
export function getComparisonWithAverage(): ComparisonWithAverage[] {
  const sessions = getSessions()
  const n = sessions.length
  const trends = calculateTrends(sessions)
  const streak = getStreak()
  const mastery = getMasteryStats()

  const avg = (fn: (s: GameSession) => number) => n ? sessions.reduce((a, s) => a + fn(s), 0) / n : 0
  const cmp = (metric: string, player: number, baseline: number): ComparisonWithAverage => ({
    metric, playerValue: Math.round(player * 10) / 10, averageValue: baseline,
    difference: Math.round((player - baseline) * 10) / 10,
    percentAbove: baseline ? Math.round(((player - baseline) / baseline) * 1000) / 10 : (player > 0 ? 100 : 0),
  })

  const bestCombo = trends.find((t) => t.metric === 'longestCombo')?.best ?? 0
  const completionPct = n ? (sessions.filter((s) => s.wordsEaten > 0).length / n) * 100 : 0
  const masteryPct = mastery.totalWords ? (mastery.masteredCount / mastery.totalWords) * 100 : 0

  return [
    cmp('Avg Score', avg((s) => s.score), 150),
    cmp('Avg Words/Game', avg((s) => s.wordsEaten), 8),
    cmp('Avg Words/Min', avg((s) => s.wordsPerMinute), 1.2),
    cmp('Best Combo', bestCombo, 3),
    cmp('Completion %', completionPct, 70),
    cmp('Streak Days', streak.currentStreak, 3),
    cmp('Mastery Rate %', masteryPct, 25),
  ]
}

// ── 14. Format Dashboard Number ──────────────────────────────────────────────
export function formatDashboardNumber(n: number): string {
  if (n < 0) return `-${formatDashboardNumber(-n)}`
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
}

// ── 15. Quick Stats ──────────────────────────────────────────────────────────
export function getQuickStats(): QuickStat[] {
  const overview = getDashboardOverview('all')
  const recent5 = getLastNSessions(5)
  const prev5 = getSessions().slice(5, 10)

  const rAvg = (fn: (s: GameSession) => number, arr: GameSession[]) =>
    arr.length ? arr.reduce((a, s) => a + fn(s), 0) / arr.length : 0
  const rScore = rAvg((s) => s.score, recent5), pScore = rAvg((s) => s.score, prev5)
  const rWords = rAvg((s) => s.wordsEaten, recent5), pWords = rAvg((s) => s.wordsEaten, prev5)

  const trend = (recent: number, prev: number, threshold: number): 'up' | 'down' | 'stable' =>
    recent > prev + threshold ? 'up' : recent < prev - threshold ? 'down' : 'stable'

  return [
    { icon: '🎮', label: 'Games', value: formatDashboardNumber(overview.totalGamesPlayed), trend: 'stable' },
    { icon: '⭐', label: 'Best Score', value: formatDashboardNumber(overview.bestScore), trend: trend(rScore, pScore, 5) },
    { icon: '📝', label: 'Words Eaten', value: formatDashboardNumber(overview.totalWordsEaten), trend: trend(rWords, pWords, 0.5) },
    { icon: '🔥', label: 'Streak', value: `${overview.currentStreak}d`, trend: overview.currentStreak >= 7 ? 'up' : overview.currentStreak === 0 ? 'down' : 'stable' },
    { icon: '🏆', label: 'Avg Score', value: formatDashboardNumber(overview.avgScorePerGame), trend: trend(rScore, pScore, 5) },
    { icon: '🎓', label: 'Achievements', value: `${getAchievementSummary().totalUnlocked}/${ACHIEVEMENTS.length}`, trend: 'stable' },
  ]
}

// ── 16. Dashboard Export Data ────────────────────────────────────────────────
export function getDashboardExportData(period: DashboardPeriod = 'all'): DashboardExportData {
  return {
    exportedAt: new Date().toISOString(), period,
    overview: getDashboardOverview(period), words: getWordStats(period),
    scores: getScoreStats(period), trends: getTrendData(period),
    achievements: getAchievementSummary(), personalBests: getPersonalBests(), quickStats: getQuickStats(),
  }
}

// ── Default Config ───────────────────────────────────────────────────────────
export function createDefaultDashboardConfig(): DashboardConfig {
  return {
    period: 'all',
    sections: { overview: true, words: true, scores: true, achievements: true, trends: true },
    refreshInterval: 30_000,
  }
}
