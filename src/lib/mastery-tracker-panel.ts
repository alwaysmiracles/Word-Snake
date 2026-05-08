/**
 * Mastery Tracker Panel — Pure logic module for the Word Snake mastery sidebar panel.
 *
 * Consumes data from the live tracker (`word-mastery-live-tracker.ts`) and transforms
 * it into formatted, presentation-ready data structures for the sidebar UI.
 * Uses its own 6-tier encounter-based level system for simplified progress monitoring.
 *
 * No React imports — safe for SSR. No localStorage — stateless, reads from injected tracker.
 */

// ── Exported types ──────────────────────────────────────────────────────────

/** Aggregate data for the entire sidebar panel. */
export interface MasteryPanelData {
  /** Total word encounters across all tracked words. */
  totalEncounters: number
  /** Number of unique words encountered this session. */
  uniqueWords: number
  /** Breakdown of word counts per panel mastery level. */
  levelBreakdown: LevelBreakdown[]
  /** Words sorted by proximity to their next level-up. */
  closestToLevelUp: ClosestWord[]
  /** Most recent level-up events this session. */
  recentLevelUps: RecentLevelUp[]
  /** Session duration in milliseconds. */
  sessionDuration: number
  /** Per-category mastery progress summaries. */
  categoryProgress: CategoryProgress[]
}

/** A single row in the level distribution breakdown. */
export interface LevelBreakdown {
  /** Human-readable level name (e.g. "Newbie", "Fluent"). */
  level: string
  /** Emoji representing the level. */
  emoji: string
  /** Hex color for UI rendering. */
  color: string
  /** Number of words currently at this level. */
  count: number
  /** Percentage of total unique words at this level (0–100). */
  percentage: number
}

/** A word entry for the "closest to level up" section. */
export interface ClosestWord {
  /** The word text. */
  word: string
  /** Name of the word's current panel level. */
  currentLevel: string
  /** Name of the next panel level. */
  nextLevel: string
  /** Progress toward next level as a percentage (0–100). */
  progress: number
  /** Remaining encounters needed to reach the next level. */
  encountersToNext: number
}

/** A recorded level-up event from this session. */
export interface RecentLevelUp {
  /** The word that leveled up. */
  word: string
  /** Panel level before the level-up. */
  oldLevel: string
  /** Panel level after the level-up. */
  newLevel: string
  /** Emoji for the new level. */
  emoji: string
  /** Hex color for the new level. */
  color: string
  /** Unix timestamp (ms) when the level-up occurred. */
  timestamp: number
}

/** Mastery progress summary for a single word category. */
export interface CategoryProgress {
  /** Category name (e.g. "Animals", "Science"). */
  category: string
  /** Total unique words from this category in the session. */
  totalWords: number
  /** Words at Master (20+) or Fluent (50+) level. */
  masteredWords: number
  /** Average encounter count across category words. */
  averageEncounters: number
  /** Average mastery progress as a percentage (0–100). */
  progressPercent: number
}

/** Compact summary card for quick-glance session overview. */
export interface SessionCard {
  /** Total word encounters this session. */
  wordsEncountered: number
  /** Number of unique words encountered. */
  uniqueWords: number
  /** Total level-up events this session. */
  levelUps: number
  /** Human-readable session duration (e.g. "12m 34s"). */
  duration: string
  /** Words encountered per minute, or 0 if too short. */
  wordsPerMinute: number
}

/** Public API for the mastery tracker panel. Created via `createMasteryTrackerPanel()`. */
export interface MasteryTrackerPanel {
  /** Gather all data needed to render the sidebar panel. */
  getPanelData(): MasteryPanelData
  /** Get the level distribution breakdown (6 levels). */
  getLevelBreakdown(): LevelBreakdown[]
  /** Get top N words closest to leveling up. Defaults to 5. */
  getWordsClosestToLevelUp(limit?: number): ClosestWord[]
  /** Get the most recent level-up events. Defaults to 5. */
  getRecentLevelUps(limit?: number): RecentLevelUp[]
  /** Get a compact session summary card. */
  getSessionCard(): SessionCard
  /** Get per-category mastery progress. */
  getCategoryProgress(): CategoryProgress[]
  /** Generate formatted text suitable for social sharing. */
  getShareText(): string
  /** Inject the live tracker instance for data reads. */
  updateFromTracker(tracker: {
    getSessionWords(): SessionWordInput[]
    getSessionEncounterCount(): number
    getLiveMasteryStats(): LiveStatsInput
    checkForLevelUps(): LevelUpInput[]
  }): void
}

// ── Internal input types ────────────────────────────────────────────────────

/** Loose shape matching SessionWordEntry from the live tracker. */
interface SessionWordInput {
  word: string
  category: string
  difficulty?: string
  encounterCount: number
  currentLevel?: string
  lastSeenAt?: number
}

/** Loose shape matching LiveMasteryStats from the live tracker. */
interface LiveStatsInput {
  totalEncounters?: number
  uniqueWords?: number
  byLevel?: Record<string, number>
  closestToLevelUp?: Array<{ word: string; currentLevel: string; progress: number }>
  categoryDistribution?: Record<string, number>
  levelUpsThisSession?: number
}

/** Loose shape matching LevelUpNotification from the live tracker. */
interface LevelUpInput {
  word: string
  oldLevel?: string
  newLevel?: string
  emoji?: string
  color?: string
  timestamp?: number
}

// ── Panel Level Definitions ─────────────────────────────────────────────────

/** 6-tier level system based on cumulative encounter counts. */
const PANEL_LEVELS: ReadonlyArray<{
  name: string
  emoji: string
  color: string
  min: number
  max: number
}> = [
  { name: 'Newbie',   emoji: '🌱', color: '#6b7280', min: 0,  max: 1         },
  { name: 'Familiar', emoji: '📘', color: '#3b82f6', min: 2,  max: 4         },
  { name: 'Known',    emoji: '📗', color: '#8b5cf6', min: 5,  max: 9         },
  { name: 'Expert',   emoji: '📙', color: '#f59e0b', min: 10, max: 19        },
  { name: 'Master',   emoji: '📕', color: '#10b981', min: 20, max: 49        },
  { name: 'Fluent',   emoji: '🏆', color: '#f97316', min: 50, max: Infinity  },
]

const DEFAULT_LIMIT = 5
/** Encounter threshold for a category word to count as "mastered". */
const MASTERY_THRESHOLD = 20

// ── Internal helpers ────────────────────────────────────────────────────────

/** Determine the panel level for a given encounter count. */
function getPanelLevelForEncounters(encounters: number): typeof PANEL_LEVELS[number] {
  for (let i = PANEL_LEVELS.length - 1; i >= 0; i--) {
    if (encounters >= PANEL_LEVELS[i].min) return PANEL_LEVELS[i]
  }
  return PANEL_LEVELS[0]
}

/** Get the next panel level, or null if already at Fluent (max). */
function getNextPanelLevel(currentLevelName: string): typeof PANEL_LEVELS[number] | null {
  const idx = PANEL_LEVELS.findIndex((l) => l.name === currentLevelName)
  if (idx < 0 || idx >= PANEL_LEVELS.length - 1) return null
  return PANEL_LEVELS[idx + 1]
}

/** Calculate progress and remaining encounters toward the next panel level. */
function computeProgressToNextLevel(encounters: number): { progress: number; encountersToNext: number } {
  const current = getPanelLevelForEncounters(encounters)
  const next = getNextPanelLevel(current.name)
  if (!next) return { progress: 100, encountersToNext: 0 }

  const range = next.min - current.min
  if (range <= 0) return { progress: 100, encountersToNext: 0 }

  const elapsed = encounters - current.min
  return {
    progress: Math.min(100, Math.max(0, Math.round((elapsed / range) * 100))),
    encountersToNext: Math.max(0, next.min - encounters),
  }
}

/** Format duration in ms to a human-readable string (e.g. "12m 34s"). */
function formatDuration(ms: number): string {
  if (ms <= 0) return '0m 0s'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Capitalize the first letter of a category name for display. */
function capitalizeCategory(category: string): string {
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown'
}

// ── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a new MasteryTrackerPanel instance.
 * Starts empty — call `updateFromTracker()` before querying data.
 */
export function createMasteryTrackerPanel(): MasteryTrackerPanel {
  let sessionStartTime = 0
  let sessionWords: SessionWordInput[] = []
  let liveStats: LiveStatsInput = {}
  let levelUpEvents: LevelUpInput[] = []
  let totalEncounters = 0
  let lastUpdateTime = Date.now()

  function updateFromTracker(
    tracker: {
      getSessionWords(): SessionWordInput[]
      getSessionEncounterCount(): number
      getLiveMasteryStats(): LiveStatsInput
      checkForLevelUps(): LevelUpInput[]
    },
  ): void {
    sessionWords = tracker.getSessionWords() ?? []
    totalEncounters = tracker.getSessionEncounterCount() ?? 0
    liveStats = tracker.getLiveMasteryStats() ?? {}
    levelUpEvents = tracker.checkForLevelUps() ?? []
    lastUpdateTime = Date.now()

    // Derive session start time from the earliest word timestamp
    if (sessionWords.length > 0) {
      const earliest = sessionWords.reduce(
        (min, w) => Math.min(min, w.lastSeenAt ?? Date.now()),
        Infinity,
      )
      sessionStartTime = isFinite(earliest) ? earliest : Date.now()
    }
  }

  function getPanelData(): MasteryPanelData {
    return {
      totalEncounters,
      uniqueWords: sessionWords.length,
      levelBreakdown: getLevelBreakdown(),
      closestToLevelUp: getWordsClosestToLevelUp(),
      recentLevelUps: getRecentLevelUps(),
      sessionDuration: getSessionDuration(),
      categoryProgress: getCategoryProgress(),
    }
  }

  /** Compute word counts per panel mastery level with percentages. */
  function getLevelBreakdown(): LevelBreakdown[] {
    const total = sessionWords.length
    return PANEL_LEVELS.map(({ name, emoji, color, min }) => {
      const levelIdx = PANEL_LEVELS.findIndex((l) => l.name === name)
      const nextMin = levelIdx < PANEL_LEVELS.length - 1 ? PANEL_LEVELS[levelIdx + 1].min : Infinity
      const exactCount = sessionWords.filter(
        (w) => w.encounterCount >= min && w.encounterCount < nextMin,
      ).length
      return {
        level: name,
        emoji,
        color,
        count: exactCount,
        percentage: total > 0 ? Math.round((exactCount / total) * 100) : 0,
      }
    })
  }

  /** Find top N words closest to their next panel level (excludes Fluent words). */
  function getWordsClosestToLevelUp(limit: number = DEFAULT_LIMIT): ClosestWord[] {
    const candidates: ClosestWord[] = []
    for (const entry of sessionWords) {
      const next = getNextPanelLevel(getPanelLevelForEncounters(entry.encounterCount).name)
      if (!next) continue
      const { progress, encountersToNext } = computeProgressToNextLevel(entry.encounterCount)
      candidates.push({
        word: entry.word,
        currentLevel: getPanelLevelForEncounters(entry.encounterCount).name,
        nextLevel: next.name,
        progress,
        encountersToNext,
      })
    }
    candidates.sort((a, b) => b.progress - a.progress)
    return candidates.slice(0, limit)
  }

  /** Retrieve the most recent level-up events mapped to panel level names. */
  function getRecentLevelUps(limit: number = DEFAULT_LIMIT): RecentLevelUp[] {
    const encounterMap = new Map<string, number>()
    for (const w of sessionWords) encounterMap.set(w.word, w.encounterCount)

    return levelUpEvents
      .filter((lu) => lu.word && lu.timestamp)
      .map((lu) => {
        const encounters = encounterMap.get(lu.word) ?? 0
        const newLevel = getPanelLevelForEncounters(encounters)
        const oldLevel = getPanelLevelForEncounters(Math.max(0, encounters - 1))
        return {
          word: lu.word,
          oldLevel: oldLevel.name,
          newLevel: newLevel.name,
          emoji: newLevel.emoji,
          color: newLevel.color,
          timestamp: lu.timestamp ?? Date.now(),
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /** Generate a compact session summary card. */
  function getSessionCard(): SessionCard {
    const durationMs = getSessionDuration()
    const durationMin = durationMs / 60000
    return {
      wordsEncountered: totalEncounters,
      uniqueWords: sessionWords.length,
      levelUps: levelUpEvents.length,
      duration: formatDuration(durationMs),
      wordsPerMinute: durationMin > 0 ? Math.round(totalEncounters / durationMin) : 0,
    }
  }

  /** Compute per-category mastery progress, sorted by progress descending. */
  function getCategoryProgress(): CategoryProgress[] {
    const catMap = new Map<string, { words: SessionWordInput[]; totalEnc: number }>()

    for (const entry of sessionWords) {
      const cat = entry.category || 'unknown'
      const bucket = catMap.get(cat) ?? { words: [], totalEnc: 0 }
      bucket.words.push(entry)
      bucket.totalEnc += entry.encounterCount
      catMap.set(cat, bucket)
    }

    const results: CategoryProgress[] = []
    for (const [category, bucket] of catMap) {
      const total = bucket.words.length
      const mastered = bucket.words.filter((w) => w.encounterCount >= MASTERY_THRESHOLD).length
      const avgEnc = total > 0 ? Math.round(bucket.totalEnc / total) : 0
      results.push({
        category: capitalizeCategory(category),
        totalWords: total,
        masteredWords: mastered,
        averageEncounters: avgEnc,
        progressPercent: Math.min(100, Math.round((avgEnc / 50) * 100)),
      })
    }

    results.sort((a, b) => b.progressPercent - a.progressPercent)
    return results
  }

  /** Generate a compact text summary for social sharing. */
  function getShareText(): string {
    const card = getSessionCard()
    const breakdown = getLevelBreakdown()
    const closest = getWordsClosestToLevelUp(1)

    const lines: string[] = [
      '🐍 Word Snake — Mastery Progress',
      '──────────────────────',
      `📊 ${card.wordsEncountered} encounters • ${card.uniqueWords} unique words`,
      `🔥 ${card.levelUps} level-ups this session`,
      `⏱️ ${card.duration} played`,
    ]

    if (breakdown.some((b) => b.count > 0)) {
      lines.push('', '📈 Level Breakdown:')
      for (const b of breakdown) {
        lines.push(
          `  ${b.emoji} ${b.level.padEnd(10)} ${String(b.count).padStart(3)} (${String(b.percentage).padStart(3)}%)`,
        )
      }
    }

    if (closest.length > 0) {
      const top = closest[0]
      lines.push('', `🎯 Near Level-Up: "${top.word}" → ${top.nextLevel} (${top.progress}%)`)
    }

    return lines.join('\n')
  }

  /** Compute session duration in milliseconds from earliest word timestamp. */
  function getSessionDuration(): number {
    return sessionStartTime > 0 ? lastUpdateTime - sessionStartTime : 0
  }

  return {
    updateFromTracker,
    getPanelData,
    getLevelBreakdown,
    getWordsClosestToLevelUp,
    getRecentLevelUps,
    getSessionCard,
    getCategoryProgress,
    getShareText,
  }
}
