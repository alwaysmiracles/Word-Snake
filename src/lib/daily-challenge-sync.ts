// Daily Challenge Sync — bridges daily-challenge.ts and daily-calendar.ts
// so both systems operate in unison. State stored at `ws_daily_sync`.

import {
  saveDailyChallengeResult,
  getDailyChallenge,
  type DailyChallenge,
} from './daily-challenge'
import {
  recordCalendarEntry,
  getCurrentStreak,
  generateCalendarGrid,
  type CalendarEntry,
  type CalendarGridCell,
} from './daily-calendar'

// ── Types ──────────────────────────────────────────────────────────

export interface SyncResult {
  completed: boolean
  score: number
  wordsEaten: number
  timeElapsed: number
  stars: number
}

export interface WeeklyStats {
  totalCompleted: number
  avgScore: number
  bestScore: number
  avgWords: number
  totalTime: number
  streakExtension: number
}

export interface DailyChallengeSync {
  lastSyncDate: string
  totalCompleted: number
  completionHistory: Record<string, SyncResult>
  streakFromSync: number
  bestScore: number
  averageScore: number
  weeklyStats: WeeklyStats
}

// ── Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_daily_sync'
const DEFAULT_WEEKLY: WeeklyStats = {
  totalCompleted: 0, avgScore: 0, bestScore: 0,
  avgWords: 0, totalTime: 0, streakExtension: 0,
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const todayStr = (): string => fmtDate(new Date())

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return fmtDate(d)
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, value) } catch { /* quota / private browsing */ }
}

function createDefaultSync(): DailyChallengeSync {
  return {
    lastSyncDate: '', totalCompleted: 0, completionHistory: {},
    streakFromSync: 0, bestScore: 0, averageScore: 0,
    weeklyStats: { ...DEFAULT_WEEKLY },
  }
}

function persistSyncState(state: DailyChallengeSync): void {
  safeSet(STORAGE_KEY, JSON.stringify(state))
}

/** Compute consecutive completed days ending today (or yesterday if today is missing). */
function computeStreakFromHistory(history: Record<string, SyncResult>): number {
  let streak = 0
  const cursor = new Date()
  if (!history[todayStr()]?.completed) cursor.setDate(cursor.getDate() - 1)
  while (true) {
    const key = fmtDate(cursor)
    if (history[key]?.completed) { streak++; cursor.setDate(cursor.getDate() - 1) } else break
  }
  return streak
}

function summarizeResults(results: SyncResult[]): WeeklyStats {
  if (results.length === 0) return { ...DEFAULT_WEEKLY }
  const totalScore = results.reduce((s, r) => s + r.score, 0)
  const totalWords = results.reduce((s, r) => s + r.wordsEaten, 0)
  const totalTime = results.reduce((s, r) => s + r.timeElapsed, 0)
  return {
    totalCompleted: results.length,
    avgScore: Math.round(totalScore / results.length),
    bestScore: Math.max(...results.map(r => r.score)),
    avgWords: Math.round(totalWords / results.length),
    totalTime,
    streakExtension: results.length >= 7 ? 7 : results.length,
  }
}

function computeWeeklyStats(history: Record<string, SyncResult>): WeeklyStats {
  const results: SyncResult[] = []
  for (let i = 0; i < 7; i++) {
    const r = history[daysAgo(i)]
    if (r?.completed) results.push(r)
  }
  return summarizeResults(results)
}

/** Map challenge category → calendar difficulty string. */
function categoriseDifficulty(challenge: DailyChallenge): 'easy' | 'medium' | 'hard' {
  if (['nature', 'creature'].includes(challenge.category)) return 'easy'
  if (['emotion', 'quality'].includes(challenge.category)) return 'hard'
  return 'medium'
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Star rating based on score vs targetScore:
 *   0 = no attempt, 1 = participation, 2 = ≥50 % target, 3 = ≥ target
 */
export function calculateStars(score: number, targetScore: number): number {
  if (score <= 0) return 0
  if (score >= targetScore) return 3
  if (score >= targetScore * 0.5) return 2
  return 1
}

/**
 * Called when a daily challenge ends.
 * Records to both subsystems and updates the unified sync state.
 */
export function syncDailyChallengeResult(
  score: number,
  wordsEaten: number,
  timeElapsed: number,
  completed: boolean,
): void {
  const today = todayStr()
  const challenge = getDailyChallenge()
  const stars = calculateStars(score, challenge.targetScore)

  // 1. Persist to daily-challenge system
  saveDailyChallengeResult(completed, score, today)

  // 2. Persist to daily-calendar system
  recordCalendarEntry({
    date: today, completed, score,
    wordsCollected: wordsEaten, duration: timeElapsed,
    difficulty: categoriseDifficulty(challenge), stars,
  })

  // 3. Update unified sync state
  const state = getSyncState()
  const result: SyncResult = { completed, score, wordsEaten, timeElapsed, stars }
  state.completionHistory[today] = result
  state.lastSyncDate = today

  if (completed) {
    state.totalCompleted++
    if (score > state.bestScore) state.bestScore = score
    const all = Object.values(state.completionHistory).filter(r => r.completed)
    state.averageScore = all.length ? Math.round(all.reduce((s, r) => s + r.score, 0) / all.length) : 0
    state.streakFromSync = computeStreakFromHistory(state.completionHistory)
  }

  state.weeklyStats = computeWeeklyStats(state.completionHistory)
  persistSyncState(state)
}

/** Load sync state from localStorage (falls back to fresh default). */
export function getSyncState(): DailyChallengeSync {
  const raw = safeGet(STORAGE_KEY)
  if (!raw) return createDefaultSync()
  try {
    const parsed = JSON.parse(raw) as DailyChallengeSync
    return {
      ...createDefaultSync(), ...parsed,
      weeklyStats: { ...DEFAULT_WEEKLY, ...(parsed.weeklyStats ?? {}) },
    }
  } catch {
    return createDefaultSync()
  }
}

/** True when today already has a synced entry in the history. */
export function isTodaySynced(): boolean {
  const state = getSyncState()
  const today = todayStr()
  return state.lastSyncDate === today && today in state.completionHistory
}

/** Completion rate over the last N days (0–1). */
export function getCompletionRate(days: number): number {
  const state = getSyncState()
  let completed = 0
  for (let i = 0; i < days; i++) {
    if (state.completionHistory[daysAgo(i)]?.completed) completed++
  }
  return days > 0 ? completed / days : 0
}

/** Weekly summary for the last 7 days. */
export function getWeeklySummary(): WeeklyStats {
  return computeWeeklyStats(getSyncState().completionHistory)
}

/** Monthly summary for the current calendar month. */
export function getMonthlySummary(): WeeklyStats {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const results: SyncResult[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const r = getSyncState().completionHistory[ds]
    if (r?.completed) results.push(r)
  }
  return summarizeResults(results)
}

/** Returns a 6×7 calendar grid enriched with challenge results overlaid. */
export function getCalendarWithChallengeData(month: number, year: number): CalendarGridCell[][] {
  const grid = generateCalendarGrid(year, month)
  const history = getSyncState().completionHistory
  return grid.map(week =>
    week.map(cell => {
      if (!cell.entry || !cell.day) return cell
      const cr = history[cell.entry.date]
      if (!cr) return cell
      const enriched: CalendarEntry = {
        ...cell.entry, score: cr.score, stars: cr.stars,
        wordsCollected: cr.wordsEaten, duration: cr.timeElapsed, completed: cr.completed,
      }
      return { ...cell, entry: enriched }
    }),
  )
}

/** Combine calendar streak with sync-computed streak for the most accurate count. */
export function getStreakWithSync(): number {
  return Math.max(getCurrentStreak(), computeStreakFromHistory(getSyncState().completionHistory))
}

/** Array of daily data points for trend analysis over the last N days. */
export function getChallengeCompletionTrend(
  days: number,
): { date: string; completed: boolean; score: number; stars: number }[] {
  const history = getSyncState().completionHistory
  const trend: { date: string; completed: boolean; score: number; stars: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ds = daysAgo(i)
    const r = history[ds]
    trend.push({ date: ds, completed: r?.completed ?? false, score: r?.score ?? 0, stars: r?.stars ?? 0 })
  }
  return trend
}

/** Export the full sync state as JSON for sharing or backup. */
export function exportSyncData(): string {
  return JSON.stringify(getSyncState(), null, 2)
}

/** Clear all sync history, preserving today's entry if it exists. */
export function resetSyncData(): void {
  const today = todayStr()
  const todayResult = getSyncState().completionHistory[today]
  const fresh = createDefaultSync()
  if (todayResult) {
    fresh.lastSyncDate = today
    fresh.completionHistory[today] = todayResult
    if (todayResult.completed) {
      fresh.totalCompleted = 1
      fresh.bestScore = todayResult.score
      fresh.averageScore = todayResult.score
      fresh.streakFromSync = 1
    }
    fresh.weeklyStats = computeWeeklyStats(fresh.completionHistory)
  }
  persistSyncState(fresh)
}
