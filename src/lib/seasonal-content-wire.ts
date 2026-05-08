'use client'

// ─── Seasonal & Word Pack Content Management Wire ────────────────
// Central hub for browsing, activating, tracking, and building
// seasonal word packs in the Word Snake game.
// ─────────────────────────────────────────────────────────────────

import {
  SEASONAL_PACKS,
  SEASONAL_CATEGORY_INFO,
  isSeasonalPackActive,
  getActiveSeasonalPacks,
  getSeasonalPackById,
  type SeasonalPack,
} from '@/lib/seasonal-packs'

import {
  WORD_PACKS,
  getWordPack,
  getActivePack,
  setActivePack,
  isPackUnlocked,
  getUnlockedPacks,
  getWordsFromPack,
  type WordPack,
  type WordPackWord,
} from '@/lib/word-packs'

// ─── Storage ─────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_seasonal_content'

// ─── Types ───────────────────────────────────────────────────────

/** Time period classification for a season */
export type SeasonPeriod = 'current' | 'upcoming' | 'past'

/** A single entry in the season calendar */
export interface SeasonCalendarEvent {
  seasonId: string
  name: string
  emoji: string
  season: SeasonalPack['season']
  period: SeasonPeriod
  startDate: string        // ISO date string
  endDate: string          // ISO date string
  description: string
  color: string
  bgColor: string
  wordCount: number
}

/** The currently active seasonal pack with countdown data */
export interface ActiveSeasonInfo {
  pack: SeasonalPack | null
  isActive: boolean
  timeRemaining: {
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null
  activatedAt: string | null
  totalDays: number
  elapsedDays: number
}

/** Progress tracking for a specific seasonal pack */
export interface SeasonProgress {
  seasonId: string
  completionPercentage: number
  wordsCollected: string[]
  totalWords: number
  bonusesUnlocked: SeasonBonus[]
  totalBonuses: number
  highestScore: number
  gamesPlayed: number
  lastPlayedAt: string | null
}

/** A bonus milestone within a season */
export interface SeasonBonus {
  id: string
  label: string
  description: string
  threshold: number         // percentage required
  rewardType: 'title' | 'badge' | 'points' | 'snake_skin'
  rewardValue: string
  unlocked: boolean
  unlockedAt: string | null
}

/** Metadata returned when browsing all seasons */
export interface SeasonPackMetadata {
  seasonId: string
  name: string
  emoji: string
  description: string
  season: SeasonalPack['season']
  color: string
  bgColor: string
  wordCount: number
  isActive: boolean
  isUnlocked: boolean
  period: SeasonPeriod
  startDate: string
  endDate: string
  progressPercentage: number
}

/** A seasonal reward entry */
export interface SeasonReward {
  id: string
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirementType: 'words' | 'score' | 'games' | 'streak'
  requirementValue: number
  unlocked: boolean
  unlockedAt: string | null
}

/** Metadata for an installed word pack */
export interface InstalledPackInfo {
  packId: string
  name: string
  emoji: string
  description: string
  unlockType: WordPack['unlockType']
  color: string
  bgColor: string
  wordCount: number
  isUnlocked: boolean
  isActive: boolean
  categories: string[]
}

/** Preview data for a word pack */
export interface PackPreview {
  packId: string
  name: string
  emoji: string
  description: string
  color: string
  bgColor: string
  sampleWords: WordPackWord[]
  categories: PackCategoryPreview[]
  totalWords: number
}

/** Category summary in a pack preview */
export interface PackCategoryPreview {
  id: string
  label: string
  color: string
  emoji: string
  wordCount: number
}

/** Configuration to start building a custom word pack */
export interface CustomPackConfig {
  name: string
  emoji: string
  description: string
  color: string
  bgColor: string
  categories: string[]
}

/** State of an in-progress custom pack build */
export interface CustomPackState {
  id: string
  config: CustomPackConfig
  words: WordPackWord[]
  isComplete: boolean
  createdAt: string
  updatedAt: string
}

/** Countdown result for a seasonal event */
export interface SeasonCountdown {
  seasonId: string
  name: string
  emoji: string
  targetDate: string
  isStarted: boolean
  isExpired: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  formatted: string
}

// ─── Internal persistence helpers ────────────────────────────────

interface PersistedSeasonalData {
  activatedSeasonId: string | null
  activatedAt: string | null
  seasonProgress: Record<string, {
    wordsCollected: string[]
    highestScore: number
    gamesPlayed: number
    bonusesUnlocked: string[]
    lastPlayedAt: string | null
  }>
  unlockedRewards: Record<string, string[]>  // seasonId -> reward ids
  customPackStates: CustomPackState[]
}

function loadPersistedData(): PersistedSeasonalData {
  const defaults: PersistedSeasonalData = {
    activatedSeasonId: null,
    activatedAt: null,
    seasonProgress: {},
    unlockedRewards: {},
    customPackStates: [],
  }
  if (typeof window === 'undefined') return defaults
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<PersistedSeasonalData>
    return {
      activatedSeasonId: parsed.activatedSeasonId ?? null,
      activatedAt: parsed.activatedAt ?? null,
      seasonProgress: parsed.seasonProgress ?? {},
      unlockedRewards: parsed.unlockedRewards ?? {},
      customPackStates: parsed.customPackStates ?? [],
    }
  } catch {
    return defaults
  }
}

function persistData(data: PersistedSeasonalData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─── Season date helpers ─────────────────────────────────────────

/** Get the start/end dates for a seasonal pack in the current year */
function getSeasonDates(pack: SeasonalPack, year: number): { start: Date; end: Date } {
  const startMonth = pack.monthStart - 1
  const endMonth = pack.monthEnd - 1
  const start = new Date(year, startMonth, 1)

  if (pack.monthStart <= pack.monthEnd) {
    // Normal range, e.g., March–May
    const end = new Date(year, endMonth + 1, 0, 23, 59, 59, 999)
    return { start, end }
  }

  // Wrapping range, e.g., December–February
  const end = new Date(year + 1, endMonth + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/** Classify a pack's period relative to today */
function classifySeasonPeriod(pack: SeasonalPack): SeasonPeriod {
  if (isSeasonalPackActive(pack)) return 'current'
  const now = new Date()
  const year = now.getFullYear()
  const { start, end } = getSeasonDates(pack, year)
  if (now < start) return 'upcoming'
  if (now > end) return 'past'
  // Edge: if year just flipped and wrap-around season started last year
  const prevDates = getSeasonDates(pack, year - 1)
  if (now < prevDates.end && isSeasonalPackActive(pack)) return 'current'
  return 'past'
}

/** Compute milliseconds remaining until the end of a seasonal pack */
function getTimeRemainingMs(pack: SeasonalPack): number | null {
  if (!isSeasonalPackActive(pack)) return null
  const year = new Date().getFullYear()
  const { end } = getSeasonDates(pack, year)
  const remaining = end.getTime() - Date.now()
  return remaining > 0 ? remaining : 0
}

function msToTimeComponents(ms: number): {
  days: number; hours: number; minutes: number; seconds: number
} {
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

// ─── Season bonuses & rewards data ───────────────────────────────

function getSeasonBonuses(seasonId: string): SeasonBonus[] {
  const bonuses: SeasonBonus[] = [
    {
      id: `${seasonId}_b1`,
      label: 'Explorer',
      description: 'Collect 25% of seasonal words',
      threshold: 25,
      rewardType: 'title',
      rewardValue: `${seasonId} Explorer`,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_b2`,
      label: 'Collector',
      description: 'Collect 50% of seasonal words',
      threshold: 50,
      rewardType: 'badge',
      rewardValue: `${seasonId}_collector_badge`,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_b3`,
      label: 'Scholar',
      description: 'Collect 75% of seasonal words',
      threshold: 75,
      rewardType: 'points',
      rewardValue: '500',
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_b4`,
      label: 'Master',
      description: 'Collect 100% of seasonal words',
      threshold: 100,
      rewardType: 'snake_skin',
      rewardValue: `${seasonId}_master_skin`,
      unlocked: false,
      unlockedAt: null,
    },
  ]
  return bonuses
}

function getSeasonRewardDefinitions(seasonId: string): SeasonReward[] {
  const pack = getSeasonalPackById(seasonId)
  const seasonName = pack?.name ?? 'Season'
  return [
    {
      id: `${seasonId}_r1`,
      name: `${seasonName} Novice`,
      description: 'Collect your first word this season',
      emoji: '🌱',
      rarity: 'common',
      requirementType: 'words',
      requirementValue: 1,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_r2`,
      name: `${seasonName} Sprinter`,
      description: 'Reach a score of 150 in a single game',
      emoji: '🏃',
      rarity: 'rare',
      requirementType: 'score',
      requirementValue: 150,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_r3`,
      name: `${seasonName} Regular`,
      description: 'Play 10 games during this season',
      emoji: '🎮',
      rarity: 'uncommon' as 'common',
      requirementType: 'games',
      requirementValue: 10,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_r4`,
      name: `${seasonName} Virtuoso`,
      description: 'Collect all words in this season',
      emoji: '🏆',
      rarity: 'legendary',
      requirementType: 'words',
      requirementValue: pack?.words.length ?? 10,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: `${seasonId}_r5`,
      name: `${seasonName} Dedication`,
      description: 'Reach a 3-day play streak in this season',
      emoji: '🔥',
      rarity: 'epic',
      requirementType: 'streak',
      requirementValue: 3,
      unlocked: false,
      unlockedAt: null,
    },
  ]
}

// ─── Exported functions ──────────────────────────────────────────

/**
 * 1. Season Calendar
 * Returns current, upcoming, and past seasonal events with dates and themes.
 */
export function getSeasonCalendar(): SeasonCalendarEvent[] {
  const now = new Date()
  const year = now.getFullYear()

  return SEASONAL_PACKS.map((pack) => {
    const { start, end } = getSeasonDates(pack, year)
    const period = classifySeasonPeriod(pack)

    return {
      seasonId: pack.id,
      name: pack.name,
      emoji: pack.emoji,
      season: pack.season,
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      description: pack.description,
      color: pack.color,
      bgColor: pack.bgColor,
      wordCount: pack.words.length,
    }
  }).sort((a, b) => {
    // Order: current first, then upcoming, then past
    const order: Record<SeasonPeriod, number> = { current: 0, upcoming: 1, past: 2 }
    if (order[a.period] !== order[b.period]) return order[a.period] - order[b.period]
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })
}

/**
 * 2. Active Season
 * Returns the currently active seasonal pack with time remaining.
 */
export function getActiveSeason(): ActiveSeasonInfo {
  const persisted = loadPersistedData()
  const activePacks = getActiveSeasonalPacks()

  if (activePacks.length === 0) {
    return {
      pack: null,
      isActive: false,
      timeRemaining: null,
      activatedAt: null,
      totalDays: 0,
      elapsedDays: 0,
    }
  }

  // Use the persisted activated season, or fall back to the first active pack
  let pack: SeasonalPack | null = null
  if (persisted.activatedSeasonId) {
    pack = getSeasonalPackById(persisted.activatedSeasonId) ?? null
  }
  if (!pack || !isSeasonalPackActive(pack)) {
    pack = activePacks[0]
  }

  const remainingMs = getTimeRemainingMs(pack)
  const year = new Date().getFullYear()
  const { start, end } = getSeasonDates(pack, year)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = Date.now() - start.getTime()
  const totalDays = Math.ceil(totalMs / 86400000)
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / 86400000))

  return {
    pack,
    isActive: true,
    timeRemaining: remainingMs !== null ? msToTimeComponents(remainingMs) : null,
    activatedAt: persisted.activatedAt,
    totalDays,
    elapsedDays,
  }
}

/**
 * 3. Season Progress
 * Returns completion percentage, words collected, and bonuses unlocked.
 */
export function getSeasonProgress(seasonId: string): SeasonProgress {
  const pack = getSeasonalPackById(seasonId)
  const persisted = loadPersistedData()
  const rawProgress = persisted.seasonProgress[seasonId]

  const totalWords = pack?.words.length ?? 0
  const wordsCollected: string[] = rawProgress?.wordsCollected ?? []
  const highestScore = rawProgress?.highestScore ?? 0
  const gamesPlayed = rawProgress?.gamesPlayed ?? 0
  const lastPlayedAt = rawProgress?.lastPlayedAt ?? null

  const completionPercentage = totalWords > 0
    ? Math.round((wordsCollected.length / totalWords) * 100)
    : 0

  const bonuses = getSeasonBonuses(seasonId)
  const unlockedBonusIds: string[] = rawProgress?.bonusesUnlocked ?? []

  const bonusesUnlocked = bonuses.map((bonus) => ({
    ...bonus,
    unlocked: unlockedBonusIds.includes(bonus.id),
    unlockedAt: null, // Could be extended with timestamps
  }))

  return {
    seasonId,
    completionPercentage,
    wordsCollected,
    totalWords,
    bonusesUnlocked,
    totalBonuses: bonuses.length,
    highestScore,
    gamesPlayed,
    lastPlayedAt,
  }
}

/**
 * 4. Browse Seasons
 * Returns all available seasonal packs with metadata.
 */
export function browseAllSeasons(): SeasonPackMetadata[] {
  const persisted = loadPersistedData()
  const calendar = getSeasonCalendar()

  return calendar.map((event) => {
    const progress = getSeasonProgress(event.seasonId)
    return {
      seasonId: event.seasonId,
      name: event.name,
      emoji: event.emoji,
      description: event.description,
      season: event.season,
      color: event.color,
      bgColor: event.bgColor,
      wordCount: event.wordCount,
      isActive: event.period === 'current',
      isUnlocked: true, // Seasonal packs are always free/unlocked
      period: event.period,
      startDate: event.startDate,
      endDate: event.endDate,
      progressPercentage: progress.completionPercentage,
    }
  })
}

/**
 * 5. Activate Season
 * Switches the active word pack to a seasonal one.
 */
export function activateSeason(seasonId: string): boolean {
  const pack = getSeasonalPackById(seasonId)
  if (!pack) return false
  if (!isSeasonalPackActive(pack)) return false

  const persisted = loadPersistedData()
  persisted.activatedSeasonId = seasonId
  persisted.activatedAt = new Date().toISOString()

  // Also set the active pack in the word-packs system
  setActivePack(seasonId)
  persistData(persisted)
  return true
}

/**
 * 6. Season Rewards
 * Returns exclusive seasonal rewards and their unlock status.
 */
export function getSeasonRewards(seasonId: string): SeasonReward[] {
  const persisted = loadPersistedData()
  const progress = persisted.seasonProgress[seasonId]
  const unlockedIds = persisted.unlockedRewards[seasonId] ?? []

  const rewards = getSeasonRewardDefinitions(seasonId)

  return rewards.map((reward) => {
    // Auto-check unlock status based on stored progress
    const isUnlocked = unlockedIds.includes(reward.id)
    return {
      ...reward,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
    }
  })
}

/**
 * 7. Word Pack Manager
 * Returns all installed word packs with metadata.
 */
export function getInstalledPacks(): InstalledPackInfo[] {
  const activePackId = getActivePack()
  const allPacks: (WordPack | SeasonalPack)[] = [...WORD_PACKS, ...SEASONAL_PACKS]

  return allPacks.map((pack) => {
    // Deduplicate by ID (seasonal packs share some words with regular packs)
    const seen = new Set<string>()
    const categories: string[] = []
    for (const w of pack.words) {
      if (!seen.has(w.category)) {
        seen.add(w.category)
        categories.push(w.category)
      }
    }

    return {
      packId: pack.id,
      name: pack.name,
      emoji: pack.emoji,
      description: pack.description,
      unlockType: pack.unlockType,
      color: pack.color,
      bgColor: pack.bgColor,
      wordCount: pack.words.length,
      isUnlocked: isPackUnlocked(pack),
      isActive: activePackId === pack.id,
      categories,
    }
  })
}

/**
 * 8. Pack Preview
 * Returns sample words and categories from a word pack.
 */
export function previewPack(packId: string): PackPreview {
  // Check regular packs first
  let pack = getWordPack(packId)
  let words = getWordsFromPack(packId)

  // Fall back to seasonal packs
  if (!pack) {
    const seasonal = getSeasonalPackById(packId)
    if (seasonal) {
      pack = seasonal
      words = seasonal.words
    }
  }

  if (!pack) {
    return {
      packId,
      name: 'Unknown Pack',
      emoji: '❓',
      description: 'This pack could not be found.',
      color: '#94a3b8',
      bgColor: 'from-gray-800/40 to-gray-900/40',
      sampleWords: [],
      categories: [],
      totalWords: 0,
    }
  }

  // Take up to 5 sample words, shuffled
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  const sampleWords = shuffled.slice(0, 5)

  // Build category summaries
  const catMap = new Map<string, { count: number; words: WordPackWord[] }>()
  for (const w of words) {
    const existing = catMap.get(w.category)
    if (existing) {
      existing.count++
    } else {
      catMap.set(w.category, { count: 1, words: [w] })
    }
  }

  const categories: PackCategoryPreview[] = []
  for (const [catId, data] of catMap) {
    const info =
      SEASONAL_CATEGORY_INFO[catId] ??
      // Import would cause circular ref; use inline lookup
      { label: catId, color: '#94a3b8', emoji: '📦' }
    categories.push({
      id: catId,
      label: info.label,
      color: info.color,
      emoji: info.emoji,
      wordCount: data.count,
    })
  }

  return {
    packId: pack.id,
    name: pack.name,
    emoji: pack.emoji,
    description: pack.description,
    color: pack.color,
    bgColor: pack.bgColor,
    sampleWords,
    categories,
    totalWords: words.length,
  }
}

/**
 * 9. Custom Pack Builder
 * Begins building a custom word pack with the given configuration.
 */
export function startCustomPackBuilder(config: CustomPackConfig): CustomPackState {
  const persisted = loadPersistedData()

  const newState: CustomPackState = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    config,
    words: [],
    isComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  persisted.customPackStates.push(newState)
  persistData(persisted)
  return { ...newState }
}

/**
 * Add a word to an in-progress custom pack.
 */
export function addWordToCustomPack(
  packStateId: string,
  word: WordPackWord,
): CustomPackState | null {
  const persisted = loadPersistedData()
  const idx = persisted.customPackStates.findIndex((s) => s.id === packStateId)
  if (idx === -1) return null

  const state = persisted.customPackStates[idx]
  state.words.push(word)
  state.updatedAt = new Date().toISOString()
  persistData(persisted)
  return { ...state }
}

/**
 * Finalize a custom pack build (marks it as complete).
 */
export function finalizeCustomPack(packStateId: string): CustomPackState | null {
  const persisted = loadPersistedData()
  const idx = persisted.customPackStates.findIndex((s) => s.id === packStateId)
  if (idx === -1) return null

  const state = persisted.customPackStates[idx]
  if (state.words.length === 0) return null
  state.isComplete = true
  state.updatedAt = new Date().toISOString()
  persistData(persisted)
  return { ...state }
}

/**
 * Get all custom pack states (in-progress and completed).
 */
export function getCustomPackStates(): CustomPackState[] {
  const persisted = loadPersistedData()
  return [...persisted.customPackStates]
}

/**
 * Delete a custom pack state by ID.
 */
export function deleteCustomPackState(packStateId: string): boolean {
  const persisted = loadPersistedData()
  const idx = persisted.customPackStates.findIndex((s) => s.id === packStateId)
  if (idx === -1) return false
  persisted.customPackStates.splice(idx, 1)
  persistData(persisted)
  return true
}

/**
 * 10. Seasonal Countdown
 * Returns days/hours/minutes until a seasonal event starts.
 */
export function getSeasonCountdown(seasonId: string): SeasonCountdown {
  const pack = getSeasonalPackById(seasonId)
  if (!pack) {
    return {
      seasonId,
      name: 'Unknown',
      emoji: '❓',
      targetDate: '',
      isStarted: false,
      isExpired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Season not found',
    }
  }

  const now = new Date()
  const year = now.getFullYear()
  const { start, end } = getSeasonDates(pack, year)
  const isActive = isSeasonalPackActive(pack)
  const isExpired = now > end && !isActive

  let targetDate: Date
  let isStarted = isActive

  if (isActive) {
    // Counting down to end of season
    targetDate = end
  } else if (now < start) {
    // Counting down to start
    targetDate = start
  } else {
    // Past — show next year's start
    const nextDates = getSeasonDates(pack, year + 1)
    targetDate = nextDates.start
    isStarted = false
  }

  const diffMs = Math.max(0, targetDate.getTime() - Date.now())
  const time = msToTimeComponents(diffMs)

  const parts: string[] = []
  if (time.days > 0) parts.push(`${time.days}d`)
  if (time.hours > 0) parts.push(`${time.hours}h`)
  if (time.minutes > 0) parts.push(`${time.minutes}m`)
  parts.push(`${time.seconds}s`)

  return {
    seasonId: pack.id,
    name: pack.name,
    emoji: pack.emoji,
    targetDate: targetDate.toISOString(),
    isStarted,
    isExpired,
    days: time.days,
    hours: time.hours,
    minutes: time.minutes,
    seconds: time.seconds,
    formatted: parts.join(' '),
  }
}

// ─── Progress recording (call from game logic) ──────────────────

/**
 * Record that a word was collected for a season.
 * Call this from the game loop when a seasonal word is eaten.
 */
export function recordSeasonalWord(seasonId: string, word: string): SeasonProgress {
  const persisted = loadPersistedData()

  if (!persisted.seasonProgress[seasonId]) {
    persisted.seasonProgress[seasonId] = {
      wordsCollected: [],
      highestScore: 0,
      gamesPlayed: 0,
      bonusesUnlocked: [],
      lastPlayedAt: null,
    }
  }

  const progress = persisted.seasonProgress[seasonId]
  const normalizedWord = word.toLowerCase()

  if (!progress.wordsCollected.map((w) => w.toLowerCase()).includes(normalizedWord)) {
    progress.wordsCollected.push(word)
  }

  progress.lastPlayedAt = new Date().toISOString()

  // Auto-unlock bonuses based on new completion percentage
  const pack = getSeasonalPackById(seasonId)
  const total = pack?.words.length ?? 1
  const percentage = Math.round((progress.wordsCollected.length / total) * 100)

  const bonuses = getSeasonBonuses(seasonId)
  for (const bonus of bonuses) {
    if (percentage >= bonus.threshold && !progress.bonusesUnlocked.includes(bonus.id)) {
      progress.bonusesUnlocked.push(bonus.id)
    }
  }

  persistData(persisted)
  return getSeasonProgress(seasonId)
}

/**
 * Record game completion stats for a season.
 */
export function recordSeasonGame(
  seasonId: string,
  score: number,
): SeasonProgress {
  const persisted = loadPersistedData()

  if (!persisted.seasonProgress[seasonId]) {
    persisted.seasonProgress[seasonId] = {
      wordsCollected: [],
      highestScore: 0,
      gamesPlayed: 0,
      bonusesUnlocked: [],
      lastPlayedAt: null,
    }
  }

  const progress = persisted.seasonProgress[seasonId]
  progress.gamesPlayed++
  if (score > progress.highestScore) {
    progress.highestScore = score
  }
  progress.lastPlayedAt = new Date().toISOString()

  persistData(persisted)
  return getSeasonProgress(seasonId)
}

/**
 * Reset all seasonal progress data.
 */
export function resetSeasonalData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
