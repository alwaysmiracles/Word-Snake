// Daily Challenge Calendar — tracks completion history, streaks, and heatmap data
// Client-side only: all storage uses localStorage with 'ws_calendar_' prefix
// Every localStorage operation is wrapped in try/catch for safety

export interface CalendarEntry {
  date: string            // YYYY-MM-DD
  completed: boolean
  score: number
  wordsCollected: number
  duration: number        // seconds
  difficulty: string      // 'easy' | 'medium' | 'hard'
  stars: number           // 0–3
}

export interface CalendarMonth {
  year: number
  month: number           // 1–12
  days: CalendarEntry[]
  totalCompleted: number
  totalStars: number
  bestScore: number
}

export interface CalendarStats {
  totalCompleted: number
  currentStreak: number
  bestStreak: number
  totalStars: number
  totalScore: number
  avgScore: number
  bestDay: CalendarEntry | null
  completionRate: number  // 0–1
}

export interface CalendarGridCell {
  day: number | null      // null for empty placeholder cells
  entry: CalendarEntry | null
  isCurrentMonth: boolean
}

export interface HeatmapEntry {
  date: string
  intensity: number       // 0–4
}

// Internal helpers

const PREFIX = 'ws_calendar_'

const fmt = (y: number, m: number, d: number): string =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

const todayStr = (): string => {
  const n = new Date()
  return fmt(n.getFullYear(), n.getMonth() + 1, n.getDate())
}

const storageKey = (date: string): string => `${PREFIX}${date}`

function safeGet(k: string): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(k) } catch { return null }
}

function safeSet(k: string, v: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(k, v) } catch { /* quota or private-browsing */ }
}

function parseEntry(raw: string | null): CalendarEntry | null {
  if (!raw) return null
  try { return JSON.parse(raw) as CalendarEntry } catch { return null }
}

// Star rating

/**
 * Calculate a 0–3 star rating based on score, words collected, and difficulty.
 * Thresholds scale with difficulty: easy, medium, hard.
 */
export function calculateStars(score: number, wordsCollected: number, difficulty: string): number {
  const thresholds = {
    easy:   { s: 100, w: 3 },
    medium: { s: 200, w: 5 },
    hard:   { s: 350, w: 7 },
  } as const
  const t = thresholds[difficulty as 'easy' | 'medium' | 'hard'] ?? thresholds.medium

  let stars = 0
  if (score >= t.s * 0.4 && wordsCollected >= Math.ceil(t.w * 0.4)) stars = 1
  if (score >= t.s * 0.7 && wordsCollected >= Math.ceil(t.w * 0.7)) stars = 2
  if (score >= t.s && wordsCollected >= t.w) stars = 3
  return stars
}

// CRUD

/** Save a day's challenge result (auto-calculates stars). */
export function recordCalendarEntry(entry: CalendarEntry): void {
  entry.stars = calculateStars(entry.score, entry.wordsCollected, entry.difficulty)
  safeSet(storageKey(entry.date), JSON.stringify(entry))
}

/** Get a single day's entry, or null if not played. */
export function getCalendarEntry(date: string): CalendarEntry | null {
  return parseEntry(safeGet(storageKey(date)))
}

// CalendarMonth

/** Number of days in a given month (1-indexed month). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Build a CalendarMonth with every day (unplayed days get default entry). */
export function getCalendarForMonth(year: number, month: number): CalendarMonth {
  const daysInMonth = getDaysInMonth(year, month)
  const days: CalendarEntry[] = []
  let totalCompleted = 0, totalStars = 0, bestScore = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = fmt(year, month, d)
    const e = getCalendarEntry(ds)
    days.push(e ?? {
      date: ds, completed: false, score: 0,
      wordsCollected: 0, duration: 0, difficulty: 'medium', stars: 0,
    })
    if (e?.completed) {
      totalCompleted++
      totalStars += e.stars
      if (e.score > bestScore) bestScore = e.score
    }
  }

  return { year, month, days, totalCompleted, totalStars, bestScore }
}

// Streaks

/**
 * Consecutive completed days ending today.
 * If today isn't completed, the streak is counted ending yesterday.
 */
export function getCurrentStreak(): number {
  let cursor = new Date()
  if (!getCalendarEntry(todayStr())?.completed) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (true) {
    const e = getCalendarEntry(fmt(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()))
    if (e?.completed) { streak++; cursor.setDate(cursor.getDate() - 1) } else break
  }
  return streak
}

/** Longest consecutive completed-day streak across the last 365 days. */
export function getBestStreak(): number {
  let best = 0, cur = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const e = getCalendarEntry(fmt(d.getFullYear(), d.getMonth() + 1, d.getDate()))
    if (e?.completed) { cur++; if (cur > best) best = cur } else cur = 0
    d.setDate(d.getDate() - 1)
  }
  return best
}

// Aggregate stats

/** Compute overall calendar statistics across the last 365 days of history. */
export function getCalendarStats(): CalendarStats {
  const fallback: CalendarStats = {
    totalCompleted: 0, currentStreak: 0, bestStreak: 0,
    totalStars: 0, totalScore: 0, avgScore: 0, bestDay: null, completionRate: 0,
  }
  if (typeof window === 'undefined') return fallback

  let totalCompleted = 0, totalStars = 0, totalScore = 0
  let bestDay: CalendarEntry | null = null
  const d = new Date()

  for (let i = 0; i < 365; i++) {
    const e = getCalendarEntry(fmt(d.getFullYear(), d.getMonth() + 1, d.getDate()))
    if (e?.completed) {
      totalCompleted++; totalStars += e.stars; totalScore += e.score
      if (!bestDay || e.score > bestDay.score) bestDay = e
    }
    d.setDate(d.getDate() - 1)
  }

  return {
    totalCompleted, totalStars, totalScore, bestDay,
    avgScore: totalCompleted ? Math.round(totalScore / totalCompleted) : 0,
    currentStreak: getCurrentStreak(), bestStreak: getBestStreak(),
    completionRate: totalCompleted / 365,
  }
}

// Date utilities

export function isToday(date: string): boolean { return date === todayStr() }
export function isFuture(date: string): boolean { return date > todayStr() }

export function getMonthName(month: number): string {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][month - 1] ?? ''
}

export function getDayName(dayIndex: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex] ?? ''
}

// 6×7 calendar grid

/**
 * Generate a 6-row × 7-col grid for a calendar month.
 * Starts on the correct weekday; includes prev/next month placeholders.
 */
export function generateCalendarGrid(year: number, month: number): CalendarGridCell[][] {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const total = getDaysInMonth(year, month)
  const prevTotal = month === 1 ? getDaysInMonth(year - 1, 12) : getDaysInMonth(year, month - 1)
  const prevM = month === 1 ? 12 : month - 1, prevY = month === 1 ? year - 1 : year
  const nextM = month === 12 ? 1 : month + 1, nextY = month === 12 ? year + 1 : year

  const grid: CalendarGridCell[][] = []
  let day = 1, nextDay = 1

  for (let r = 0; r < 6; r++) {
    const week: CalendarGridCell[] = []
    for (let c = 0; c < 7; c++) {
      const idx = r * 7 + c
      if (idx < firstDow) {
        const d = prevTotal - firstDow + idx + 1
        week.push({ day: d, entry: getCalendarEntry(fmt(prevY, prevM, d)), isCurrentMonth: false })
      } else if (day <= total) {
        week.push({ day, entry: getCalendarEntry(fmt(year, month, day)), isCurrentMonth: true })
        day++
      } else {
        week.push({ day: nextDay, entry: getCalendarEntry(fmt(nextY, nextM, nextDay)), isCurrentMonth: false })
        nextDay++
      }
    }
    grid.push(week)
  }
  return grid
}

// Monthly completion rate

/** Returns an array of 12 completion rates (0–1), one per month of the given year. */
export function getCompletionRateByMonth(year: number): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1, total = getDaysInMonth(year, m)
    let done = 0
    for (let d = 1; d <= total; d++) {
      if (getCalendarEntry(fmt(year, m, d))?.completed) done++
    }
    return total > 0 ? done / total : 0
  })
}

// Heatmap (last 90 days)

/** Returns the last 90 days for heatmap visualization (intensity 0–4 based on stars). */
export function getHeatmapData(): HeatmapEntry[] {
  const data: HeatmapEntry[] = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const ds = fmt(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const e = getCalendarEntry(ds)
    data.push({ date: ds, intensity: e?.completed ? (e.stars > 0 ? e.stars : 1) : 0 })
  }
  return data
}

// Import / Export

/** Export all calendar entries as a JSON string (sorted by date). */
export function exportCalendarData(): string {
  if (typeof window === 'undefined') return '[]'
  try {
    const entries: CalendarEntry[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) {
        const e = parseEntry(localStorage.getItem(k))
        if (e) entries.push(e)
      }
    }
    entries.sort((a, b) => a.date.localeCompare(b.date))
    return JSON.stringify(entries, null, 2)
  } catch { return '[]' }
}

/** Import calendar entries from JSON. Overwrites existing entries. Returns counts. */
export function importCalendarData(json: string): { imported: number; errors: number } {
  let imported = 0, errors = 0
  try {
    const arr: unknown[] = JSON.parse(json)
    if (!Array.isArray(arr)) return { imported: 0, errors: 1 }
    for (const raw of arr) {
      if (
        raw && typeof raw === 'object' &&
        'date' in raw && typeof (raw as CalendarEntry).date === 'string'
      ) {
        recordCalendarEntry(raw as CalendarEntry)
        imported++
      } else {
        errors++
      }
    }
  } catch { errors++ }
  return { imported, errors }
}
