// Pool of interesting English words for the snake game, organized by category
import { getCustomWordsByCategories, getCustomWordCount, type CustomWord } from '@/lib/custom-words'

export type WordCategory = 'nature' | 'emotion' | 'element' | 'time' | 'creature' | 'quality' | 'object' | 'action'

// Custom words spawn chance (10% if any custom words exist)
export const CUSTOM_WORD_SPAWN_CHANCE = 0.10

export type WordRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export const RARITY_CONFIG: Record<WordRarity, { label: string; color: string; glowColor: string; emoji: string; pointMultiplier: number; chance: number }> = {
  common: { label: 'Common', color: '#94a3b8', glowColor: '#94a3b820', emoji: '', pointMultiplier: 1, chance: 0.55 },
  uncommon: { label: 'Uncommon', color: '#22c55e', glowColor: '#22c55e30', emoji: '◆', pointMultiplier: 1.5, chance: 0.28 },
  rare: { label: 'Rare', color: '#3b82f6', glowColor: '#3b82f640', emoji: '★', pointMultiplier: 2.5, chance: 0.13 },
  legendary: { label: 'Legendary', color: '#f59e0b', glowColor: '#f59e0b50', emoji: '♛', pointMultiplier: 5, chance: 0.04 },
}

export function getRarityForPoints(points: number): WordRarity {
  if (points >= 16) return 'legendary'
  if (points >= 14) return 'rare'
  if (points >= 12) return 'uncommon'
  return 'common'
}

export function getRandomRarity(): WordRarity {
  const roll = Math.random()
  let cumulative = 0
  for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
    cumulative += config.chance
    if (roll < cumulative) return rarity as WordRarity
  }
  return 'common'
}

export interface WordEntry {
  word: string
  category: WordCategory
  points: number // points per letter
}

export interface WordPick {
  word: string
  category: WordCategory
  points: number
  isCustom: boolean
}

const WORD_ENTRIES: WordEntry[] = [
  // Nature
  { word: 'river', category: 'nature', points: 10 },
  { word: 'ocean', category: 'nature', points: 10 },
  { word: 'forest', category: 'nature', points: 12 },
  { word: 'mountain', category: 'nature', points: 16 },
  { word: 'flower', category: 'nature', points: 12 },
  { word: 'breeze', category: 'nature', points: 12 },
  { word: 'sunset', category: 'nature', points: 12 },
  { word: 'rainbow', category: 'nature', points: 14 },
  { word: 'thunder', category: 'nature', points: 14 },
  { word: 'meadow', category: 'nature', points: 12 },
  { word: 'valley', category: 'nature', points: 12 },
  { word: 'island', category: 'nature', points: 12 },
  { word: 'desert', category: 'nature', points: 12 },
  { word: 'glacier', category: 'nature', points: 14 },
  { word: 'aurora', category: 'nature', points: 12 },
  { word: 'storm', category: 'nature', points: 10 },
  { word: 'nature', category: 'nature', points: 10 },
  { word: 'serenity', category: 'nature', points: 14 },
  { word: 'blossom', category: 'nature', points: 12 },
  { word: 'canyon', category: 'nature', points: 10 },
  { word: 'reef', category: 'nature', points: 8 },
  { word: 'volcano', category: 'nature', points: 12 },
  { word: 'prairie', category: 'nature', points: 12 },
  { word: 'tundra', category: 'nature', points: 10 },
  { word: 'oasis', category: 'nature', points: 10 },
  { word: 'waterfall', category: 'nature', points: 14 },
  { word: 'horizon', category: 'nature', points: 12 },
  // Emotions
  { word: 'joy', category: 'emotion', points: 6 },
  { word: 'hope', category: 'emotion', points: 8 },
  { word: 'peace', category: 'emotion', points: 10 },
  { word: 'dream', category: 'emotion', points: 10 },
  { word: 'wonder', category: 'emotion', points: 12 },
  { word: 'courage', category: 'emotion', points: 14 },
  { word: 'bliss', category: 'emotion', points: 10 },
  { word: 'calm', category: 'emotion', points: 8 },
  { word: 'fury', category: 'emotion', points: 8 },
  { word: 'grace', category: 'emotion', points: 10 },
  { word: 'pride', category: 'emotion', points: 10 },
  { word: 'valor', category: 'emotion', points: 14 },
  { word: 'faith', category: 'emotion', points: 10 },
  { word: 'love', category: 'emotion', points: 8 },
  { word: 'zeal', category: 'emotion', points: 8 },
  { word: 'mirth', category: 'emotion', points: 10 },
  { word: 'dread', category: 'emotion', points: 10 },
  { word: 'nostalgia', category: 'emotion', points: 14 },
  { word: 'ecstasy', category: 'emotion', points: 14 },
  { word: 'sorrow', category: 'emotion', points: 10 },
  { word: 'envy', category: 'emotion', points: 8 },
  { word: 'anguish', category: 'emotion', points: 12 },
  { word: 'resolve', category: 'emotion', points: 10 },
  // Elements
  { word: 'fire', category: 'element', points: 8 },
  { word: 'water', category: 'element', points: 10 },
  { word: 'earth', category: 'element', points: 10 },
  { word: 'wind', category: 'element', points: 8 },
  { word: 'light', category: 'element', points: 10 },
  { word: 'shadow', category: 'element', points: 12 },
  { word: 'frost', category: 'element', points: 10 },
  { word: 'flame', category: 'element', points: 10 },
  { word: 'spark', category: 'element', points: 10 },
  { word: 'stone', category: 'element', points: 10 },
  { word: 'crystal', category: 'element', points: 14 },
  { word: 'ember', category: 'element', points: 10 },
  { word: 'smoke', category: 'element', points: 10 },
  { word: 'cloud', category: 'element', points: 10 },
  { word: 'tide', category: 'element', points: 8 },
  { word: 'lightning', category: 'element', points: 14 },
  { word: 'dew', category: 'element', points: 6 },
  { word: 'mist', category: 'element', points: 8 },
  { word: 'quartz', category: 'element', points: 10 },
  { word: 'monsoon', category: 'element', points: 12 },
  { word: 'eclipse', category: 'element', points: 12 },
  { word: 'solstice', category: 'element', points: 14 },
  // Time
  { word: 'dawn', category: 'time', points: 8 },
  { word: 'dusk', category: 'time', points: 8 },
  { word: 'twilight', category: 'time', points: 16 },
  { word: 'eternity', category: 'time', points: 16 },
  { word: 'moment', category: 'time', points: 12 },
  { word: 'season', category: 'time', points: 12 },
  { word: 'epoch', category: 'time', points: 10 },
  { word: 'hour', category: 'time', points: 8 },
  { word: 'heartbeat', category: 'time', points: 14 },
  { word: 'millennium', category: 'time', points: 16 },
  { word: 'aftermath', category: 'time', points: 14 },
  { word: 'interlude', category: 'time', points: 14 },
  { word: 'genesis', category: 'time', points: 12 },
  // Creatures
  { word: 'eagle', category: 'creature', points: 10 },
  { word: 'wolf', category: 'creature', points: 8 },
  { word: 'dolphin', category: 'creature', points: 14 },
  { word: 'phoenix', category: 'creature', points: 14 },
  { word: 'dragon', category: 'creature', points: 12 },
  { word: 'falcon', category: 'creature', points: 12 },
  { word: 'tiger', category: 'creature', points: 10 },
  { word: 'swan', category: 'creature', points: 8 },
  { word: 'panther', category: 'creature', points: 12 },
  { word: 'raven', category: 'creature', points: 10 },
  { word: 'cobra', category: 'creature', points: 8 },
  { word: 'mantis', category: 'creature', points: 10 },
  { word: 'whale', category: 'creature', points: 8 },
  // Qualities
  { word: 'wisdom', category: 'quality', points: 12 },
  { word: 'beauty', category: 'quality', points: 12 },
  { word: 'strength', category: 'quality', points: 16 },
  { word: 'freedom', category: 'quality', points: 14 },
  { word: 'magic', category: 'quality', points: 10 },
  { word: 'power', category: 'quality', points: 10 },
  { word: 'honor', category: 'quality', points: 10 },
  { word: 'truth', category: 'quality', points: 10 },
  { word: 'resilience', category: 'quality', points: 14 },
  { word: 'harmony', category: 'quality', points: 12 },
  { word: 'ambition', category: 'quality', points: 14 },
  { word: 'loyalty', category: 'quality', points: 10 },
  // Objects
  { word: 'sword', category: 'object', points: 10 },
  { word: 'crown', category: 'object', points: 10 },
  { word: 'shield', category: 'object', points: 12 },
  { word: 'lantern', category: 'object', points: 14 },
  { word: 'mirror', category: 'object', points: 12 },
  { word: 'compass', category: 'object', points: 14 },
  { word: 'feather', category: 'object', points: 14 },
  { word: 'key', category: 'object', points: 6 },
  { word: 'scroll', category: 'object', points: 10 },
  { word: 'gem', category: 'object', points: 6 },
  { word: 'anchor', category: 'object', points: 10 },
  { word: 'prism', category: 'object', points: 10 },
  // Actions
  { word: 'soar', category: 'action', points: 8 },
  { word: 'dance', category: 'action', points: 10 },
  { word: 'shine', category: 'action', points: 10 },
  { word: 'bloom', category: 'action', points: 10 },
  { word: 'whisper', category: 'action', points: 14 },
  { word: 'glow', category: 'action', points: 8 },
  { word: 'sparkle', category: 'action', points: 14 },
  { word: 'drift', category: 'action', points: 10 },
  { word: 'conquer', category: 'action', points: 12 },
  { word: 'flourish', category: 'action', points: 14 },
  { word: 'wander', category: 'action', points: 10 },
  { word: 'ascend', category: 'action', points: 10 },
]

// Category colors for visual display
export const CATEGORY_COLORS: Record<WordCategory, string> = {
  nature: '#22c55e',
  emotion: '#f43f5e',
  element: '#3b82f6',
  time: '#a855f7',
  creature: '#f97316',
  quality: '#eab308',
  object: '#06b6d4',
  action: '#ec4899',
}

// Build lookup map
const WORD_MAP = new Map<string, WordEntry>()
for (const entry of WORD_ENTRIES) {
  WORD_MAP.set(entry.word, entry)
}

export function getWordEntry(word: string): WordEntry | undefined {
  return WORD_MAP.get(word)
}

/** Get word entry including custom words */
export function getWordEntryIncludingCustom(word: string): { word: string; category: WordCategory; points: number } | undefined {
  const standard = WORD_MAP.get(word)
  if (standard) return standard
  // Check custom words
  const customWords = getCustomWords()
  const normalized = word.toLowerCase()
  return customWords.find((w) => w.word.toLowerCase() === normalized)
}

export function getAllWords(): string[] {
  return WORD_ENTRIES.map((e) => e.word)
}

export function getCategoryInfo(category: WordCategory): { label: string; color: string; emoji: string } {
  const map: Record<WordCategory, { label: string; color: string; emoji: string }> = {
    nature: { label: 'Nature', color: '#22c55e', emoji: '🌿' },
    emotion: { label: 'Emotion', color: '#f43f5e', emoji: '💖' },
    element: { label: 'Element', color: '#3b82f6', emoji: '🔥' },
    time: { label: 'Time', color: '#a855f7', emoji: '⏳' },
    creature: { label: 'Creature', color: '#f97316', emoji: '🦅' },
    quality: { label: 'Quality', color: '#eab308', emoji: '✨' },
    object: { label: 'Object', color: '#06b6d4', emoji: '🗡️' },
    action: { label: 'Action', color: '#ec4899', emoji: '💫' },
  }
  return map[category]
}

export function getRandomWord(exclude: string[] = []): string {
  const available = WORD_ENTRIES.filter((e) => !exclude.includes(e.word))
  if (available.length === 0) return WORD_ENTRIES[Math.floor(Math.random() * WORD_ENTRIES.length)].word
  return available[Math.floor(Math.random() * available.length)].word
}

export function getRandomWordWithCategories(exclude: string[] = [], categories?: Set<WordCategory>): WordPick {
  // Try custom words first with 10% chance
  const customCount = getCustomWordCount()
  if (customCount > 0 && Math.random() < CUSTOM_WORD_SPAWN_CHANCE) {
    const customWords = getCustomWordsByCategories(categories ?? new Set<WordCategory>())
    const available = customWords.filter((w: CustomWord) => !exclude.includes(w.word))
    if (available.length > 0) {
      const picked = available[Math.floor(Math.random() * available.length)]
      return { word: picked.word, category: picked.category, points: picked.points, isCustom: true }
    }
  }

  // Standard word pool
  let pool = categories && categories.size > 0
    ? WORD_ENTRIES.filter((e) => categories.has(e.category))
    : WORD_ENTRIES
  const available = pool.filter((e) => !exclude.includes(e.word))
  if (available.length === 0) {
    // Fallback: if no words available in selected categories, use full pool
    const fallback = WORD_ENTRIES.filter((e) => !exclude.includes(e.word))
    if (fallback.length === 0) {
      const pick = WORD_ENTRIES[Math.floor(Math.random() * WORD_ENTRIES.length)]
      return { word: pick.word, category: pick.category, points: pick.points, isCustom: false }
    }
    const pick = fallback[Math.floor(Math.random() * fallback.length)]
    return { word: pick.word, category: pick.category, points: pick.points, isCustom: false }
  }
  const pick = available[Math.floor(Math.random() * available.length)]
  return { word: pick.word, category: pick.category, points: pick.points, isCustom: false }
}

export function getWordCountByCategory(category: WordCategory): number {
  return WORD_ENTRIES.filter((e) => e.category === category).length
}

/** Returns total word count (standard + custom) */
export function getTotalWordCount(): number {
  return WORD_ENTRIES.length + getCustomWordCount()
}

export { WORD_ENTRIES }
