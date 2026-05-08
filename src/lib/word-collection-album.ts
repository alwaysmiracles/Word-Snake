/**
 * Word Collection Album — tracks word-collection progress across categories
 * for the Word Snake game, with completionist goals and achievements.
 */

import { getAllWords, getCategoryInfo, CATEGORY_COLORS, WORD_ENTRIES, getRarityForPoints, type WordCategory } from '@/lib/word-pool'
import { useWordStore } from '@/lib/word-store'
import { getMastery, getMasteryLevel } from '@/lib/word-mastery'

// ── Types ───────────────────────────────────────────────────────────────────

export interface CollectedWordEntry {
  word: string
  collectedAt: number
  timesEaten: number
  mastery: string
}

export interface AlbumCategory {
  id: string
  name: string
  emoji: string
  color: string
  totalWords: number
  collectedWords: CollectedWordEntry[]
  completionPercent: number
  rarity: string
  isComplete: boolean
}

export interface AlbumAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface AlbumSettings {
  sortBy: 'name' | 'date' | 'mastery' | 'rarity'
  filterRarity: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  showIncomplete: boolean
}

export interface CollectionAlbum {
  categories: AlbumCategory[]
  totalCollected: number
  totalAvailable: number
  completionPercent: number
  rarestWords: CollectedWordEntry[]
  achievements: AlbumAchievement[]
  settings: AlbumSettings
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Mastery level → numeric weight for sorting and threshold checks. */
export const MASTERY_LEVELS: Record<string, number> = {
  new: 0, seen: 1, learning: 2, familiar: 3, mastered: 4, legendary: 5,
}

const RARITY_ORDER: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4,
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
}

const SETTINGS_KEY = 'ws_album_settings'

const DEFAULT_SETTINGS: AlbumSettings = {
  sortBy: 'name',
  filterRarity: 'all',
  showIncomplete: true,
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadSettings(): AlbumSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

function rarityWeight(word: string): number {
  const entry = WORD_ENTRIES.find((e) => e.word === word)
  if (!entry) return 0
  const r = getRarityForPoints(entry.points)
  return RARITY_ORDER[r] ?? 0
}

function getWordRarity(word: string): string {
  const entry = WORD_ENTRIES.find((e) => e.word === word)
  return entry ? getRarityForPoints(entry.points) : 'common'
}

/** Build a CollectedWordEntry from the store + mastery data. */
function buildCollectedEntry(word: string, timesEaten: number): CollectedWordEntry {
  const mastery = getMastery(word)
  return {
    word,
    collectedAt: mastery?.lastCollectedAt ?? 0,
    timesEaten,
    mastery: getMasteryLevel(word),
  }
}

/** Get all unique category IDs present in the word pool. */
function getAllCategories(): WordCategory[] {
  const cats = new Set<WordCategory>()
  for (const entry of WORD_ENTRIES) cats.add(entry.category)
  return Array.from(cats)
}

// ── Core API ────────────────────────────────────────────────────────────────

/** Initialize album by scanning word-pool entries and matching against collected words. */
export function createAlbum(): CollectionAlbum {
  const store = useWordStore.getState()
  const collected = store.collectedWords
  const allWords = getAllWords()
  const categories = getAllCategories()

  const albumCategories: AlbumCategory[] = []

  for (const catId of categories) {
    const info = getCategoryInfo(catId)
    const catEntries = WORD_ENTRIES.filter((e) => e.category === catId)
    const collectedInCat: CollectedWordEntry[] = []

    for (const entry of catEntries) {
      const times = collected[entry.word] ?? 0
      if (times > 0) {
        collectedInCat.push(buildCollectedEntry(entry.word, times))
      }
    }

    const pct = catEntries.length > 0
      ? Math.round((collectedInCat.length / catEntries.length) * 100) : 0

    // Category rarity = highest rarity among collected words
    let catRarity = 'common'
    for (const cw of collectedInCat) {
      const r = getWordRarity(cw.word)
      if ((RARITY_ORDER[r] ?? 0) > (RARITY_ORDER[catRarity] ?? 0)) catRarity = r
    }

    albumCategories.push({
      id: catId,
      name: info.label,
      emoji: info.emoji,
      color: info.color,
      totalWords: catEntries.length,
      collectedWords: collectedInCat,
      completionPercent: pct,
      rarity: RARITY_LABELS[catRarity] ?? catRarity,
      isComplete: pct === 100,
    })
  }

  const totalCollected = Object.keys(collected).length
  const totalAvailable = allWords.length
  const completionPercent = totalAvailable > 0
    ? Math.round((totalCollected / totalAvailable) * 100) : 0

  const rarest = Object.keys(collected)
    .map((w) => buildCollectedEntry(w, collected[w]))
    .sort((a, b) => rarityWeight(b.word) - rarityWeight(a.word))

  const achievements = checkAlbumAchievements({
    categories: albumCategories, totalCollected, totalAvailable,
    completionPercent, rarestWords: rarest.slice(0, 10),
    achievements: [], settings: loadSettings(),
  })

  return {
    categories: albumCategories,
    totalCollected,
    totalAvailable,
    completionPercent,
    rarestWords: rarest.slice(0, 10),
    achievements,
    settings: loadSettings(),
  }
}

/** Refresh album data with the latest collection state from word-store. */
export function updateAlbum(album: CollectionAlbum): CollectionAlbum {
  return createAlbum() // re-scan from store — cheap and idempotent
}

/** Get detailed progress for a specific category. */
export function getCategoryProgress(
  album: CollectionAlbum,
  categoryId: string,
): AlbumCategory | undefined {
  return album.categories.find((c) => c.id === categoryId)
}

/** Returns category completion breakdown counts. */
export function getCollectionCompletion(
  album: CollectionAlbum,
): { completed: number; nearlyComplete: number; inProgress: number; notStarted: number } {
  let completed = 0, nearlyComplete = 0, inProgress = 0, notStarted = 0
  for (const cat of album.categories) {
    if (cat.isComplete) completed++
    else if (cat.completionPercent >= 80) nearlyComplete++
    else if (cat.completionPercent > 0) inProgress++
    else notStarted++
  }
  return { completed, nearlyComplete, inProgress, notStarted }
}

/** Get N rarest collected words sorted by rarity (rarest first). */
export function getRarestWords(
  album: CollectionAlbum,
  count: number,
): CollectedWordEntry[] {
  return [...album.rarestWords]
    .sort((a, b) => rarityWeight(b.word) - rarityWeight(a.word))
    .slice(0, count)
}

/** Get N most eaten words (highest timesEaten, descending). */
export function getMostPlayedWords(
  album: CollectionAlbum,
  count: number,
): CollectedWordEntry[] {
  const all: CollectedWordEntry[] = album.categories.flatMap((c) => c.collectedWords)
  return all.sort((a, b) => b.timesEaten - a.timesEaten).slice(0, count)
}

/** Get words not yet collected, optionally filtered by category. */
export function getUncollectedWords(
  album: CollectionAlbum,
  categoryId?: string,
): string[] {
  const collectedSet = new Set(album.categories.flatMap((c) => c.collectedWords.map((w) => w.word)))
  const pool = categoryId
    ? WORD_ENTRIES.filter((e) => e.category === categoryId)
    : WORD_ENTRIES
  return pool.filter((e) => !collectedSet.has(e.word)).map((e) => e.word)
}

// ── Achievements ────────────────────────────────────────────────────────────

const ACHIEVEMENT_DEFS = [
  { id: 'first_steps', name: 'First Steps', description: 'Collect 10 words', icon: '🌱', check: (a: CollectionAlbum) => a.totalCollected >= 10 },
  { id: 'collector', name: 'Collector', description: 'Collect 50 words', icon: '📦', check: (a: CollectionAlbum) => a.totalCollected >= 50 },
  { id: 'bookworm', name: 'Bookworm', description: 'Collect 100 words', icon: '📚', check: (a: CollectionAlbum) => a.totalCollected >= 100 },
  { id: 'completionist', name: 'Completionist', description: 'Complete any category (100%)', icon: '🏆', check: (a: CollectionAlbum) => a.categories.some((c) => c.isComplete) },
  { id: 'master_collector', name: 'Master Collector', description: 'Complete 3 categories', icon: '👑', check: (a: CollectionAlbum) => a.categories.filter((c) => c.isComplete).length >= 3 },
  { id: 'legendary', name: 'Legendary', description: 'Collect all epic+ rarity words', icon: '💎', check: (a: CollectionAlbum) => {
    const epicPlus = WORD_ENTRIES.filter((e) => {
      const r = getRarityForPoints(e.points)
      return (RARITY_ORDER[r] ?? 0) >= 2 // rare & legendary (no 'epic' in pool)
    })
    if (epicPlus.length === 0) return false
    const collected = new Set(a.categories.flatMap((c) => c.collectedWords.map((w) => w.word)))
    return epicPlus.every((e) => collected.has(e.word))
  }},
  { id: 'world_traveler', name: 'World Traveler', description: 'Collect words from 5+ categories', icon: '🌍', check: (a: CollectionAlbum) => a.categories.filter((c) => c.collectedWords.length > 0).length >= 5 },
  { id: 'scholar', name: 'Scholar', description: 'Collect all words in a single category with mastery level ≥ familiar', icon: '🎓', check: (a: CollectionAlbum) => a.categories.some((c) =>
    c.isComplete && c.collectedWords.every((w) => (MASTERY_LEVELS[w.mastery] ?? 0) >= 3)
  )},
]

/** Check for collection-based achievements. Returns full array with unlock status. */
export function checkAlbumAchievements(album: CollectionAlbum): AlbumAchievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlocked: def.check(album),
    unlockedAt: def.check(album) ? Date.now() : null,
  }))
}

// ── Share & Persistence ─────────────────────────────────────────────────────

/** Format album progress for sharing as text data. */
export function getAlbumShareData(album: CollectionAlbum): string {
  const lines = [
    '🐍 Word Snake — Collection Album',
    `Progress: ${album.totalCollected}/${album.totalAvailable} words (${album.completionPercent}%)`,
    '',
  ]
  for (const cat of album.categories) {
    const bar = '█'.repeat(Math.round(cat.completionPercent / 5)) + '░'.repeat(20 - Math.round(cat.completionPercent / 5))
    lines.push(`${cat.emoji} ${cat.name}: [${bar}] ${cat.completionPercent}%`)
  }
  if (album.rarestWords.length > 0) {
    lines.push('', '💎 Rarest finds:')
    for (const w of album.rarestWords.slice(0, 3)) {
      lines.push(`  · ${w.word} (${getWordRarity(w.word)}) — eaten ${w.timesEaten}x`)
    }
  }
  const unlocked = album.achievements.filter((a) => a.unlocked).length
  lines.push('', `🏅 Achievements: ${unlocked}/${album.achievements.length}`)
  return lines.join('\n')
}

/** Persist album settings to localStorage. */
export function setAlbumSettings(settings: Partial<AlbumSettings>): AlbumSettings {
  const current = loadSettings()
  const merged = { ...current, ...settings }
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
    }
  } catch { /* ignore quota errors */ }
  return merged
}

/** Get daily collection counts for the last N days. */
export function getCollectionTimeline(
  album: CollectionAlbum,
  days: number,
): { date: string; count: number }[] {
  const now = new Date()
  const timeline: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayStart = new Date(dateStr).getTime()
    const dayEnd = dayStart + 86_400_000

    let count = 0
    for (const cat of album.categories) {
      for (const w of cat.collectedWords) {
        if (w.collectedAt >= dayStart && w.collectedAt < dayEnd) count++
      }
    }
    timeline.push({ date: dateStr, count })
  }
  return timeline
}
