'use client'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Log level for event entries. Controls display badge and colour. */
export type EventLogLevel = 'info' | 'success' | 'warning' | 'error' | 'special'

/** A single event recorded in the log panel. */
export interface EventLogEntry {
  id: string
  type: string          // e.g. 'game:start', 'game:word_eat', 'game:collision'
  level: EventLogLevel
  message: string       // Human-readable description
  emoji: string         // Event emoji
  color: string         // CSS colour string
  timestamp: number     // Unix ms
  data?: Record<string, unknown>
}

/** Filter applied when querying entries. All conditions are AND-ed. */
export interface EventLogFilter {
  types?: string[]
  levels?: EventLogLevel[]
  search?: string
  minTimestamp?: number
  maxTimestamp?: number
}

/** Aggregate statistics for the log panel. */
export interface EventLogStats {
  totalEntries: number
  byType: Record<string, number>
  byLevel: Record<string, number>
  firstEntryAt: number | null
  lastEntryAt: number | null
  entriesPerMinute: number
}

/** The public API surface returned by `createEventLogPanel()`. */
export interface EventLogPanel {
  addEntry(entry: Omit<EventLogEntry, 'id' | 'timestamp'>): EventLogEntry
  addEntries(entries: Array<Omit<EventLogEntry, 'id' | 'timestamp'>>): EventLogEntry[]
  getEntries(filter?: EventLogFilter): EventLogEntry[]
  getRecentEntries(count: number): EventLogEntry[]
  clearEntries(): void
  clearBefore(timestamp: number): number
  getLogStats(): EventLogStats
  getEventTypeConfig(type: string): { emoji: string; color: string; level: EventLogLevel; label: string }
  getSummaryText(): string
  formatEntryTime(timestamp: number): string
  formatEntryLevel(level: string): string
  getLevelColor(level: string): string
  getLevelBgColor(level: string): string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 500                 // Ring-buffer cap
const AUTO_PRUNE_MS = 30 * 60 * 1000   // 30 minutes
const STORAGE_KEY = 'ws_event_log_panel'

/** Event type → display metadata lookup. */
const EVENT_TYPE_CONFIG: Record<string, { emoji: string; color: string; level: EventLogLevel; label: string }> = {
  'game:start':          { emoji: '🎮', color: '#22c55e', level: 'success', label: 'Game Start' },
  'game:end':            { emoji: '🏁', color: '#94a3b8', level: 'info',    label: 'Game End' },
  'game:pause':          { emoji: '⏸️',  color: '#fbbf24', level: 'warning', label: 'Paused' },
  'game:resume':         { emoji: '▶️',  color: '#22c55e', level: 'info',    label: 'Resumed' },
  'game:word_eat':       { emoji: '📝', color: '#4ade80', level: 'success', label: 'Word Eaten' },
  'game:collision':      { emoji: '💥', color: '#ef4444', level: 'error',   label: 'Collision' },
  'game:powerup':        { emoji: '⚡', color: '#3b82f6', level: 'special', label: 'Power-Up' },
  'game:achievement':    { emoji: '🏆', color: '#eab308', level: 'special', label: 'Achievement' },
  'game:death':          { emoji: '💀', color: '#ef4444', level: 'error',   label: 'Game Over' },
  'game:combo':          { emoji: '🔥', color: '#f97316', level: 'warning', label: 'Combo' },
  'game:mode_start':     { emoji: '🌟', color: '#a855f7', level: 'special', label: 'Mode Start' },
  'game:level_up':       { emoji: '📈', color: '#8b5cf6', level: 'success', label: 'Level Up' },
  'game:rare_word':      { emoji: '✨', color: '#06b6d4', level: 'special', label: 'Rare Word' },
}

const DEFAULT_CONFIG = { emoji: '📌', color: '#94a3b8', level: 'info' as EventLogLevel, label: 'Event' }

/** Level display badges. */
const LEVEL_LABELS: Record<string, string> = {
  info: 'INFO', success: 'OK', warning: 'WARN', error: 'ERR', special: '★',
}

/** Level foreground colours. */
const LEVEL_COLORS: Record<string, string> = {
  info: '#94a3b8', success: '#22c55e', warning: '#fbbf24', error: '#ef4444', special: '#a855f7',
}

/** Level background colours (semi-transparent for badges). */
const LEVEL_BG_COLORS: Record<string, string> = {
  info: 'rgba(148,163,184,0.15)', success: 'rgba(34,197,94,0.15)',
  warning: 'rgba(251,191,36,0.15)', error: 'rgba(239,68,68,0.15)', special: 'rgba(168,85,247,0.15)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a short unique id (8-char hex). */
function uid(): string {
  return Math.random().toString(16).slice(2, 10)
}

/** Apply an `EventLogFilter` to an array of entries, returning a new filtered array. */
function applyFilter(entries: EventLogEntry[], filter?: EventLogFilter): EventLogEntry[] {
  if (!filter) return entries

  return entries.filter((e) => {
    if (filter.types?.length && !filter.types.includes(e.type)) return false
    if (filter.levels?.length && !filter.levels.includes(e.level)) return false
    if (filter.minTimestamp != null && e.timestamp < filter.minTimestamp) return false
    if (filter.maxTimestamp != null && e.timestamp > filter.maxTimestamp) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (!e.message.toLowerCase().includes(q) && !e.type.toLowerCase().includes(q)) return false
    }
    return true
  })
}

// ─── localStorage helpers (SSR-safe) ─────────────────────────────────────────

function loadStats(): { total: number; firstAt: number | null; lastAt: number | null } {
  if (typeof window === 'undefined') return { total: 0, firstAt: null, lastAt: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { total: 0, firstAt: null, lastAt: null }
    return JSON.parse(raw)
  } catch {
    return { total: 0, firstAt: null, lastAt: null }
  }
}

function persistStats(
  total: number,
  firstAt: number | null,
  lastAt: number | null,
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ total, firstAt, lastAt }))
  } catch { /* storage full — silently skip */ }
}

// ─── Preset factories ────────────────────────────────────────────────────────

/** 3-4 entries emitted when a new game session starts. */
export function createGameStartEntries(
  gameState: { mode?: string; difficulty?: string; seed?: number },
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:start', level: 'success', message: 'Game session started', emoji: '🎮', color: '#22c55e' },
    ...(gameState.mode ? [{
      type: 'game:mode_start', level: 'special' as const, message: `Mode: ${gameState.mode}`, emoji: '🌟', color: '#a855f7',
    }] : []),
    ...(gameState.difficulty ? [{
      type: 'game:start', level: 'info' as const, message: `Difficulty: ${gameState.difficulty}`, emoji: '⚙️', color: '#94a3b8',
    }] : []),
    ...(gameState.seed != null ? [{
      type: 'game:start', level: 'info' as const, message: `Seed: #${gameState.seed}`, emoji: '🎲', color: '#06b6d4',
    }] : []),
  ]
}

/** 1-2 entries for when the snake eats a word. */
export function createWordEatEntries(
  word: string,
  points: number,
  combo: number,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  const entries: Array<Omit<EventLogEntry, 'id' | 'timestamp'>> = [
    { type: 'game:word_eat', level: 'success', message: `Ate "${word}" for +${points} pts`, emoji: '📝', color: '#4ade80',
      data: { word, points } },
  ]
  if (combo >= 3) {
    entries.push({
      type: 'game:combo', level: 'warning', message: `Combo ×${combo}!`, emoji: '🔥', color: '#f97316',
      data: { combo },
    })
  }
  return entries
}

/** 1-2 entries for power-up collection/activation. */
export function createPowerUpEntries(
  type: string,
  emoji: string,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:powerup', level: 'special', message: `Power-up collected: ${type}`, emoji, color: '#3b82f6',
      data: { powerupType: type } },
    { type: 'game:powerup', level: 'info', message: `${type} activated`, emoji, color: '#60a5fa' },
  ]
}

/** 1-2 entries for game over / death. */
export function createDeathEntries(
  score: number,
  words: number,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:death', level: 'error', message: `Game over! Final score: ${score}`, emoji: '💀', color: '#ef4444',
      data: { score, words } },
    { type: 'game:death', level: 'info', message: `Words eaten this run: ${words}`, emoji: '📊', color: '#94a3b8',
      data: { words } },
  ]
}

/** 1 entry for achievement unlock. */
export function createAchievementEntries(
  name: string,
  emoji: string,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:achievement', level: 'special', message: `Achievement unlocked: ${name}`, emoji, color: '#eab308',
      data: { achievement: name } },
  ]
}

/** 1 entry for a combo milestone (every 5×). */
export function createComboEntries(
  combo: number,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:combo', level: 'warning', message: `Combo milestone ×${combo}!`, emoji: '🔥', color: '#f97316',
      data: { combo } },
  ]
}

/** 1 entry for mode start. */
export function createModeStartEntries(
  modeId: string,
): Array<Omit<EventLogEntry, 'id' | 'timestamp'>> {
  return [
    { type: 'game:mode_start', level: 'special', message: `Starting mode: ${modeId}`, emoji: '🌟', color: '#a855f7',
      data: { mode: modeId } },
  ]
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/** Format a timestamp to "HH:MM:SS". */
function formatEntryTime(timestamp: number): string {
  const d = new Date(timestamp)
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => n.toString().padStart(2, '0'))
    .join(':')
}

/** Short badge text for a log level. */
function formatEntryLevel(level: string): string {
  return LEVEL_LABELS[level] ?? 'INFO'
}

/** Foreground colour for a log level. */
function getLevelColor(level: string): string {
  return LEVEL_COLORS[level] ?? '#94a3b8'
}

/** Semi-transparent background colour for a log level badge. */
function getLevelBgColor(level: string): string {
  return LEVEL_BG_COLORS[level] ?? 'rgba(148,163,184,0.15)'
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a new EventLogPanel instance.
 *
 * - Entries are stored in a ring-buffer capped at `MAX_ENTRIES` (500).
 * - Entries older than 30 minutes are auto-pruned on every add.
 * - Cumulative stats are persisted to `localStorage` under `ws_event_log_panel`.
 */
export function createEventLogPanel(): EventLogPanel {
  const entries: EventLogEntry[] = []

  // Restore cumulative stats from localStorage so `entriesPerMinute` stays
  // meaningful across page reloads.
  const persisted = loadStats()

  // ── Internal: prune entries older than AUTO_PRUNE_MS ──────────────────────
  function prune(): void {
    const cutoff = Date.now() - AUTO_PRUNE_MS
    let removed = 0
    while (entries.length > 0 && entries[0].timestamp < cutoff) {
      entries.shift()
      removed++
    }
    // Nothing more needed — stats are recalculated on demand.
    void removed
  }

  // ── Internal: enforce ring-buffer cap ─────────────────────────────────────
  function enforceCap(): void {
    while (entries.length > MAX_ENTRIES) {
      entries.shift()
    }
  }

  // ── Internal: build a full entry from partial input ───────────────────────
  function buildEntry(partial: Omit<EventLogEntry, 'id' | 'timestamp'>): EventLogEntry {
    const cfg = EVENT_TYPE_CONFIG[partial.type] ?? DEFAULT_CONFIG
    return {
      id: uid(),
      type: partial.type,
      level: partial.level ?? cfg.level,
      message: partial.message,
      emoji: partial.emoji ?? cfg.emoji,
      color: partial.color ?? cfg.color,
      timestamp: Date.now(),
      data: partial.data,
    }
  }

  // ── Persist cumulative stats ───────────────────────────────────────────────
  function saveStats(): void {
    const totalEntries = entries.length
    const firstEntryAt = totalEntries > 0 ? entries[0].timestamp : null
    const lastEntryAt = totalEntries > 0 ? entries[totalEntries - 1].timestamp : null
    persistStats(totalEntries, firstEntryAt, lastEntryAt)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  const panel: EventLogPanel = {
    /** Add a single event to the log. */
    addEntry(partial) {
      prune()
      const entry = buildEntry(partial)
      entries.push(entry)
      enforceCap()
      saveStats()
      return entry
    },

    /** Batch-add multiple events at once. */
    addEntries(partials) {
      prune()
      const built = partials.map((p) => buildEntry(p))
      entries.push(...built)
      enforceCap()
      saveStats()
      return built
    },

    /** Retrieve entries matching an optional filter. */
    getEntries(filter) {
      return applyFilter([...entries], filter)
    },

    /** Get the last N entries (most recent first). */
    getRecentEntries(count) {
      return entries.slice(-count).reverse()
    },

    /** Clear every entry from the panel. */
    clearEntries() {
      entries.length = 0
      persistStats(0, null, null)
    },

    /** Remove entries older than the given timestamp. Returns number removed. */
    clearBefore(timestamp) {
      let removed = 0
      while (entries.length > 0 && entries[0].timestamp < timestamp) {
        entries.shift()
        removed++
      }
      saveStats()
      return removed
    },

    /** Compute aggregate statistics over the current log. */
    getLogStats() {
      const totalEntries = entries.length
      const byType: Record<string, number> = {}
      const byLevel: Record<string, number> = {}
      let firstEntryAt: number | null = null
      let lastEntryAt: number | null = null

      for (const e of entries) {
        byType[e.type] = (byType[e.type] ?? 0) + 1
        byLevel[e.level] = (byLevel[e.level] ?? 0) + 1
        if (firstEntryAt == null || e.timestamp < firstEntryAt) firstEntryAt = e.timestamp
        if (lastEntryAt == null || e.timestamp > lastEntryAt) lastEntryAt = e.timestamp
      }

      // Prefer persisted firstEntryAt when the in-memory buffer has been
      // pruned but a session started earlier.
      if (persisted.firstAt != null && (firstEntryAt == null || persisted.firstAt < firstEntryAt)) {
        firstEntryAt = persisted.firstAt
      }

      let entriesPerMinute = 0
      if (totalEntries > 0 && firstEntryAt != null && lastEntryAt != null) {
        const spanMinutes = (lastEntryAt - firstEntryAt) / 60_000 || 1
        entriesPerMinute = Math.round((totalEntries / spanMinutes) * 100) / 100
      }

      return { totalEntries, byType, byLevel, firstEntryAt, lastEntryAt, entriesPerMinute }
    },

    /** Look up display metadata for a known event type. */
    getEventTypeConfig(type) {
      return EVENT_TYPE_CONFIG[type] ?? { ...DEFAULT_CONFIG, label: type }
    },

    /** Human-readable one-liner summarising recent activity. */
    getSummaryText() {
      const stats = this.getLogStats()
      if (stats.totalEntries === 0) return 'No events yet'

      const recent = entries.slice(-5)
      const last = recent[recent.length - 1]
      const timeStr = formatEntryTime(last.timestamp)
      return (
        `${stats.totalEntries} events — last: ${last.emoji} ${last.message} at ${timeStr}`
      )
    },

    // Display helpers (delegated to module-level functions)
    formatEntryTime,
    formatEntryLevel,
    getLevelColor,
    getLevelBgColor,
  }

  return panel
}
