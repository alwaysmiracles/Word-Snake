'use client'

// Achievement Showcase Wire — provides live achievement data for UI display:
// gallery, stats, search, session tracking, streaks, forecasts, and showcase payloads.

import { ACHIEVEMENTS, type Achievement, getUnlockedAchievements } from './achievements'
import { EXTRA_ACHIEVEMENTS, type ExtraAchievement, getExtraAchievementsUnlocked } from './achievements-extra'
import { MULTILINGUAL_ACHIEVEMENTS } from './multilingual-achievements'

// ─── Types ─────────────────────────────────────────────────────────────────

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type AchievementCategory = 'base' | 'combat' | 'exploration' | 'knowledge' | 'social' | 'collection' | 'multilingual'

export interface GalleryFilter {
  category?: AchievementCategory | 'all'
  rarity?: RarityTier | 'all'
  unlocked?: boolean | 'all'
}

export interface UnifiedAchievement {
  id: string
  title: string
  description: string
  emoji: string
  category: AchievementCategory
  rarity: RarityTier
  unlocked: boolean
  unlockedAt: number | null
}

export interface RecentUnlockEntry {
  achievement: UnifiedAchievement
  unlockedAt: number
  relativeTime: string
}

export interface UnlockedStats {
  total: number
  unlocked: number
  locked: number
  completionPercent: number
}

export interface CategorySummaryEntry {
  category: AchievementCategory
  label: string
  emoji: string
  total: number
  unlocked: number
  locked: number
  percent: number
}

export interface RarityDistributionEntry {
  rarity: RarityTier
  label: string
  emoji: string
  color: string
  total: number
  unlocked: number
  locked: number
  percent: number
}

export interface SessionUnlockEntry {
  achievement: UnifiedAchievement
  unlockedAt: number
}

export interface UnlockStreak {
  currentStreak: number
  longestStreak: number
  streakDays: string[]
  lastUnlockDate: string | null
}

export interface CompletionForecast {
  totalAchievements: number
  unlockedCount: number
  remainingCount: number
  averageUnlocksPerDay: number
  estimatedDaysRemaining: number | null
  estimatedCompletionDate: string | null
  currentRateLabel: string
  motivationText: string
}

export interface ShowcaseData {
  topAchievements: UnifiedAchievement[]
  stats: UnlockedStats
  recentUnlocks: RecentUnlockEntry[]
  categorySummary: CategorySummaryEntry[]
  rarityDistribution: RarityDistributionEntry[]
  nextClosest: UnifiedAchievement[]
  streak: UnlockStreak
  forecast: CompletionForecast
  sessionUnlocks: SessionUnlockEntry[]
}

export interface AchievementNotificationData {
  achievement: UnifiedAchievement
  isNew: boolean
  totalUnlocked: number
  completionPercent: number
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const SESSION_STORAGE_KEY = 'ws_achievement_showcase_session'
export const HISTORY_STORAGE_KEY = 'ws_achievement_unlock_history'
const MAX_HISTORY_ENTRIES = 200

const RARITY_CONFIG: Record<RarityTier, { label: string; emoji: string; color: string }> = {
  common:    { label: 'Common',    emoji: '⚪', color: '#9ca3af' },
  uncommon:  { label: 'Uncommon',  emoji: '🟢', color: '#22c55e' },
  rare:      { label: 'Rare',      emoji: '🔵', color: '#3b82f6' },
  epic:      { label: 'Epic',      emoji: '🟣', color: '#a855f7' },
  legendary: { label: 'Legendary', emoji: '🟡', color: '#eab308' },
}

const CATEGORY_LABELS: Record<AchievementCategory, { label: string; emoji: string }> = {
  base: { label: 'Base', emoji: '⭐' },
  combat: { label: 'Combat', emoji: '⚔️' },
  exploration: { label: 'Exploration', emoji: '🧭' },
  knowledge: { label: 'Knowledge', emoji: '🧠' },
  social: { label: 'Social', emoji: '👥' },
  collection: { label: 'Collection', emoji: '💎' },
  multilingual: { label: 'Multilingual', emoji: '🌐' },
}

const RARITY_WEIGHT: Record<RarityTier, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }

const BASE_RARITY: Record<string, RarityTier> = {
  first_bite: 'common', word_collector: 'uncommon', lexicon_builder: 'uncommon',
  vocabulary_master: 'rare', first_poem: 'common', poet_laureate: 'rare',
  century_score: 'uncommon', high_roller: 'epic', category_diver: 'uncommon',
  full_spectrum: 'rare', marathon: 'common',
}

const EXTRA_RARITY: Record<string, RarityTier> = {
  obstacle_survivor: 'uncommon', boss_slayer: 'rare', boss_legend: 'legendary',
  portal_master: 'uncommon', spike_dodger: 'common', word_collector_100: 'rare',
  seasonal_explorer: 'epic', all_skins: 'legendary', combo_master_5: 'rare',
  quiz_genius: 'uncommon', quiz_speed: 'rare', scramble_master: 'uncommon',
  pvp_thief: 'common', pvp_dominant: 'epic', coin_hoarder: 'rare',
}

const MULTI_RARITY: Record<string, RarityTier> = {
  polyglot_beginner: 'common', polyglot_intermediate: 'uncommon',
  polyglot_master: 'legendary', korean_scholar: 'rare',
  french_connoisseur: 'rare', spanish_adventurer: 'rare',
}

// ─── LocalStorage Helpers ──────────────────────────────────────────────────

function safeGetJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

function safeSetJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

// ─── Session / History Persistence ─────────────────────────────────────────

interface SessionData { sessionStart: number; unlocks: Array<{ id: string; unlockedAt: number }> }
interface HistoryEntry { id: string; unlockedAt: number }

function getSessionData(): SessionData {
  return safeGetJSON<SessionData>(SESSION_STORAGE_KEY, { sessionStart: Date.now(), unlocks: [] })
}
function saveSessionData(data: SessionData): void { safeSetJSON(SESSION_STORAGE_KEY, data) }
function getUnlockHistory(): HistoryEntry[] { return safeGetJSON<HistoryEntry[]>(HISTORY_STORAGE_KEY, []) }

function saveUnlockHistory(entries: HistoryEntry[]): void {
  if (entries.length > MAX_HISTORY_ENTRIES) entries = entries.slice(entries.length - MAX_HISTORY_ENTRIES)
  safeSetJSON(HISTORY_STORAGE_KEY, entries)
}

function addToUnlockHistory(id: string, timestamp: number): void {
  const history = getUnlockHistory()
  if (history.some((e) => e.id === id)) return
  history.push({ id, unlockedAt: timestamp })
  saveUnlockHistory(history)
}

// ─── Unified Achievement Builder ───────────────────────────────────────────

function getRarityForId(id: string): RarityTier {
  return BASE_RARITY[id] ?? EXTRA_RARITY[id] ?? MULTI_RARITY[id] ?? 'common'
}

function getCategoryForId(id: string): AchievementCategory {
  const extra = EXTRA_ACHIEVEMENTS.find((a) => a.id === id)
  if (extra) return (extra.category as AchievementCategory) ?? 'base'
  if (MULTILINGUAL_ACHIEVEMENTS.some((a) => a.id === id)) return 'multilingual'
  return 'base'
}

function buildAllAchievements(): UnifiedAchievement[] {
  const allDefs = [
    ...ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.description, emoji: a.emoji })),
    ...EXTRA_ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.description, emoji: a.emoji })),
    ...MULTILINGUAL_ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.description, emoji: a.emoji })),
  ]

  const unlockedIds = new Set([...getUnlockedAchievements(), ...getExtraAchievementsUnlocked()])
  const historyMap = new Map<string, number>()
  for (const entry of getUnlockHistory()) historyMap.set(entry.id, entry.unlockedAt)

  return allDefs.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
    category: getCategoryForId(def.id),
    rarity: getRarityForId(def.id),
    unlocked: unlockedIds.has(def.id),
    unlockedAt: historyMap.get(def.id) ?? null,
  }))
}

// ─── Relative Time ─────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// ─── 1. Achievement Gallery ────────────────────────────────────────────────

export function getAchievementGallery(filter: GalleryFilter = {}): UnifiedAchievement[] {
  let achievements = buildAllAchievements()

  if (filter.category && filter.category !== 'all') {
    achievements = achievements.filter((a) => a.category === filter.category)
  }
  if (filter.rarity && filter.rarity !== 'all') {
    achievements = achievements.filter((a) => a.rarity === filter.rarity)
  }
  if (filter.unlocked === true) achievements = achievements.filter((a) => a.unlocked)
  else if (filter.unlocked === false) achievements = achievements.filter((a) => !a.unlocked)

  // Sort: unlocked first (newest first), then locked by rarity weight descending
  achievements.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    if (a.unlocked) return (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0)
    return (RARITY_WEIGHT[b.rarity] ?? 0) - (RARITY_WEIGHT[a.rarity] ?? 0)
  })

  return achievements
}

// ─── 2. Recent Unlocks ─────────────────────────────────────────────────────

export function getRecentUnlocks(count: number = 5): RecentUnlockEntry[] {
  if (!count || count <= 0) count = 5
  const unlocked = buildAllAchievements()
    .filter((a) => a.unlocked && a.unlockedAt !== null)
    .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))

  return unlocked.slice(0, count).map((a) => ({
    achievement: a,
    unlockedAt: a.unlockedAt!,
    relativeTime: formatRelativeTime(a.unlockedAt!),
  }))
}

// ─── 3. Unlocked Stats ─────────────────────────────────────────────────────

export function getUnlockedStats(): UnlockedStats {
  const all = buildAllAchievements()
  const total = all.length
  const unlocked = all.filter((a) => a.unlocked).length
  return {
    total,
    unlocked,
    locked: total - unlocked,
    completionPercent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  }
}

// ─── 4. Next Closest ───────────────────────────────────────────────────────

export function getNextClosest(count: number = 5): UnifiedAchievement[] {
  if (!count || count <= 0) count = 5
  const locked = buildAllAchievements().filter((a) => !a.unlocked)

  // Common achievements are most likely to unlock next; legendary are aspirational
  const proximity: Record<RarityTier, number> = {
    common: 10, uncommon: 7, rare: 5, epic: 3, legendary: 1,
  }
  locked.sort((a, b) => (proximity[b.rarity] ?? 0) - (proximity[a.rarity] ?? 0))
  return locked.slice(0, count)
}

// ─── 5. Category Summary ───────────────────────────────────────────────────

export function getCategorySummary(): CategorySummaryEntry[] {
  const all = buildAllAchievements()
  const categories: AchievementCategory[] = [
    'base', 'combat', 'exploration', 'knowledge', 'social', 'collection', 'multilingual',
  ]

  return categories
    .map((cat) => {
      const items = all.filter((a) => a.category === cat)
      const unlocked = items.filter((a) => a.unlocked).length
      const total = items.length
      const cfg = CATEGORY_LABELS[cat] ?? { label: cat, emoji: '🏷️' }
      return {
        category: cat, label: cfg.label, emoji: cfg.emoji,
        total, unlocked, locked: total - unlocked,
        percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      }
    })
    .filter((e) => e.total > 0)
}

// ─── 6. Rarity Distribution ────────────────────────────────────────────────

export function getRarityDistribution(): RarityDistributionEntry[] {
  const all = buildAllAchievements()
  return (['common', 'uncommon', 'rare', 'epic', 'legendary'] as RarityTier[]).map((tier) => {
    const items = all.filter((a) => a.rarity === tier)
    const unlocked = items.filter((a) => a.unlocked).length
    const total = items.length
    const cfg = RARITY_CONFIG[tier]
    return {
      rarity: tier, label: cfg.label, emoji: cfg.emoji, color: cfg.color,
      total, unlocked, locked: total - unlocked,
      percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    }
  })
}

// ─── 7. Session Unlocks ────────────────────────────────────────────────────

export function getSessionUnlocks(): SessionUnlockEntry[] {
  const sessionData = getSessionData()
  const lookup = new Map<string, UnifiedAchievement>()
  for (const a of buildAllAchievements()) lookup.set(a.id, a)

  return sessionData.unlocks
    .map((e) => {
      const achievement = lookup.get(e.id)
      return achievement ? { achievement, unlockedAt: e.unlockedAt } : null
    })
    .filter((e): e is SessionUnlockEntry => e !== null)
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
}

// ─── 8. On Achievement Unlocked ────────────────────────────────────────────

export function onAchievementUnlocked(id: string): AchievementNotificationData | null {
  if (!id) return null

  const lookup = new Map<string, UnifiedAchievement>()
  for (const a of buildAllAchievements()) lookup.set(a.id, a)
  const achievement = lookup.get(id)
  if (!achievement) return null

  const now = Date.now()
  const unlockedIds = new Set([...getUnlockedAchievements(), ...getExtraAchievementsUnlocked()])

  if (unlockedIds.has(id)) {
    return {
      achievement,
      isNew: false,
      totalUnlocked: unlockedIds.size,
      completionPercent: Math.round((unlockedIds.size / lookup.size) * 100),
    }
  }

  // Record in session
  const sessionData = getSessionData()
  if (!sessionData.unlocks.some((e) => e.id === id)) {
    sessionData.unlocks.push({ id, unlockedAt: now })
    saveSessionData(sessionData)
  }

  // Record in persistent history
  addToUnlockHistory(id, now)

  const totalUnlocked = unlockedIds.size + 1
  return {
    achievement: { ...achievement, unlocked: true, unlockedAt: now },
    isNew: true,
    totalUnlocked,
    completionPercent: Math.round((totalUnlocked / lookup.size) * 100),
  }
}

// ─── 9. Achievement Search ─────────────────────────────────────────────────

export function searchAchievements(query: string): UnifiedAchievement[] {
  if (!query || query.trim().length === 0) return buildAllAchievements()
  const q = query.toLowerCase().trim()

  return buildAllAchievements().filter((a) =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.emoji.includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.rarity.toLowerCase().includes(q),
  )
}

// ─── 10. Showcase Data ─────────────────────────────────────────────────────

export function getShowcaseData(): ShowcaseData {
  const all = buildAllAchievements()
  const stats = getUnlockedStats()

  // Top achievements: unlocked, sorted by rarity weight descending
  const topAchievements = all
    .filter((a) => a.unlocked)
    .sort((a, b) => (RARITY_WEIGHT[b.rarity] ?? 0) - (RARITY_WEIGHT[a.rarity] ?? 0))
    .slice(0, 6)

  return {
    topAchievements,
    stats,
    recentUnlocks: getRecentUnlocks(5),
    categorySummary: getCategorySummary(),
    rarityDistribution: getRarityDistribution(),
    nextClosest: getNextClosest(3),
    streak: getUnlockStreak(),
    forecast: getCompletionForecast(),
    sessionUnlocks: getSessionUnlocks(),
  }
}

// ─── 11. Streak Tracker ────────────────────────────────────────────────────

export function getUnlockStreak(): UnlockStreak {
  const history = getUnlockHistory()
  if (history.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDays: [], lastUnlockDate: null }
  }

  // Group timestamps by calendar date
  const daySet = new Set<string>()
  for (const entry of history) {
    const d = new Date(entry.unlockedAt)
    daySet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  const uniqueDays = Array.from(daySet).sort()

  const lastUnlockDate = uniqueDays[uniqueDays.length - 1] ?? null

  // Current streak: walk backwards from today/yesterday
  const today = new Date()
  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let currentStreak = 0
  let streakDays: string[] = []
  if (daySet.has(toKey(today)) || daySet.has(toKey(yesterday))) {
    const check = new Date(daySet.has(toKey(today)) ? today : yesterday)
    while (daySet.has(toKey(check))) {
      streakDays.push(toKey(check))
      currentStreak++
      check.setDate(check.getDate() - 1)
    }
  }

  // Longest streak across all days
  let longest = 0
  let run = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const diffDays = Math.round((new Date(uniqueDays[i]).getTime() - new Date(uniqueDays[i - 1]).getTime()) / 86400000)
    if (diffDays === 1) { run++ } else { longest = Math.max(longest, run); run = 1 }
  }
  longest = Math.max(longest, run, currentStreak)

  return { currentStreak, longestStreak: longest, streakDays, lastUnlockDate }
}

// ─── 12. Completion Forecast ───────────────────────────────────────────────

export function getCompletionForecast(): CompletionForecast {
  const stats = getUnlockedStats()
  const history = getUnlockHistory()

  let averageUnlocksPerDay = 0
  let estimatedDaysRemaining: number | null = null
  let estimatedCompletionDate: string | null = null

  if (history.length >= 2) {
    const sorted = [...history].sort((a, b) => a.unlockedAt - b.unlockedAt)
    const daysSpan = Math.max(1, (sorted[sorted.length - 1].unlockedAt - sorted[0].unlockedAt) / 86400000)
    averageUnlocksPerDay = Math.round((sorted.length / daysSpan) * 100) / 100

    if (averageUnlocksPerDay > 0 && stats.locked > 0) {
      estimatedDaysRemaining = Math.ceil(stats.locked / averageUnlocksPerDay)
      const date = new Date()
      date.setDate(date.getDate() + estimatedDaysRemaining)
      estimatedCompletionDate = date.toISOString().split('T')[0]
    }
  }

  const rateLabel =
    averageUnlocksPerDay >= 3 ? 'Lightning fast' :
    averageUnlocksPerDay >= 1 ? 'Steady pace' :
    averageUnlocksPerDay > 0 ? 'Taking it easy' : 'Not started yet'

  const pct = stats.completionPercent
  const motivationText =
    pct >= 100 ? '🏆 All achievements unlocked! You are a Word Snake legend!' :
    pct >= 80  ? '🔥 Almost there! The finish line is within reach!' :
    pct >= 50  ? '💪 Halfway done! Keep pushing forward!' :
    pct >= 25  ? "🌱 Great progress! You're building momentum!" :
    pct > 0    ? '🎯 Nice start! Every achievement counts!' :
    '🚀 Your achievement journey begins with the first unlock!'

  return {
    totalAchievements: stats.total,
    unlockedCount: stats.unlocked,
    remainingCount: stats.locked,
    averageUnlocksPerDay,
    estimatedDaysRemaining,
    estimatedCompletionDate,
    currentRateLabel: rateLabel,
    motivationText,
  }
}

// ─── Session Lifecycle ─────────────────────────────────────────────────────

export function clearSessionData(): void { safeRemove(SESSION_STORAGE_KEY) }

export function clearAllShowcaseData(): void {
  safeRemove(SESSION_STORAGE_KEY)
  safeRemove(HISTORY_STORAGE_KEY)
}

export function initializeSession(): void {
  const existing = getSessionData()
  const now = Date.now()
  if (!existing.sessionStart || now - existing.sessionStart > 86400000) {
    saveSessionData({ sessionStart: now, unlocks: [] })
  }
}

export function backfillUnlockHistory(): number {
  const unlockedIds = [...getUnlockedAchievements(), ...getExtraAchievementsUnlocked()]
  const history = getUnlockHistory()
  const historyIds = new Set(history.map((e) => e.id))
  const toFill = unlockedIds.filter((id) => !historyIds.has(id))
  if (toFill.length === 0) return 0

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 86400000
  toFill.forEach((id, i) => {
    const progress = toFill.length > 1 ? i / (toFill.length - 1) : 0.5
    history.push({ id, unlockedAt: Math.round(thirtyDaysAgo + progress * (now - thirtyDaysAgo)) })
  })
  saveUnlockHistory(history)
  return toFill.length
}

// ─── Utility Exports ───────────────────────────────────────────────────────

export function getAchievementById(id: string): UnifiedAchievement | null {
  return buildAllAchievements().find((a) => a.id === id) ?? null
}

export function getAllUnlockedIds(): string[] {
  try { return [...getUnlockedAchievements(), ...getExtraAchievementsUnlocked()] } catch { return [] }
}

export function isAchievementUnlocked(id: string): boolean {
  return id ? getAllUnlockedIds().includes(id) : false
}

export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length + EXTRA_ACHIEVEMENTS.length + MULTILINGUAL_ACHIEVEMENTS.length
}
