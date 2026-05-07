// Pool of interesting English words for the snake game, organized by category
export type WordCategory = 'nature' | 'emotion' | 'element' | 'time' | 'creature' | 'quality' | 'object' | 'action'

export interface WordEntry {
  word: string
  category: WordCategory
  points: number // points per letter
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
  { word: 'faith', category: 'emotion', points: 10 },
  { word: 'love', category: 'emotion', points: 8 },
  { word: 'zeal', category: 'emotion', points: 8 },
  { word: 'mirth', category: 'emotion', points: 10 },
  { word: 'dread', category: 'emotion', points: 10 },
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
  { word: 'dew', category: 'element', points: 6 },
  // Time
  { word: 'dawn', category: 'time', points: 8 },
  { word: 'dusk', category: 'time', points: 8 },
  { word: 'twilight', category: 'time', points: 16 },
  { word: 'eternity', category: 'time', points: 16 },
  { word: 'moment', category: 'time', points: 12 },
  { word: 'season', category: 'time', points: 12 },
  { word: 'epoch', category: 'time', points: 10 },
  { word: 'hour', category: 'time', points: 8 },
  // Creatures
  { word: 'eagle', category: 'creature', points: 10 },
  { word: 'wolf', category: 'creature', points: 8 },
  { word: 'dolphin', category: 'creature', points: 14 },
  { word: 'phoenix', category: 'creature', points: 14 },
  { word: 'dragon', category: 'creature', points: 12 },
  { word: 'falcon', category: 'creature', points: 12 },
  { word: 'tiger', category: 'creature', points: 10 },
  { word: 'swan', category: 'creature', points: 8 },
  // Qualities
  { word: 'wisdom', category: 'quality', points: 12 },
  { word: 'beauty', category: 'quality', points: 12 },
  { word: 'strength', category: 'quality', points: 16 },
  { word: 'freedom', category: 'quality', points: 14 },
  { word: 'magic', category: 'quality', points: 10 },
  { word: 'power', category: 'quality', points: 10 },
  { word: 'honor', category: 'quality', points: 10 },
  { word: 'truth', category: 'quality', points: 10 },
  // Objects
  { word: 'sword', category: 'object', points: 10 },
  { word: 'crown', category: 'object', points: 10 },
  { word: 'shield', category: 'object', points: 12 },
  { word: 'lantern', category: 'object', points: 14 },
  { word: 'mirror', category: 'object', points: 12 },
  { word: 'compass', category: 'object', points: 14 },
  { word: 'feather', category: 'object', points: 14 },
  { word: 'key', category: 'object', points: 6 },
  // Actions
  { word: 'soar', category: 'action', points: 8 },
  { word: 'dance', category: 'action', points: 10 },
  { word: 'shine', category: 'action', points: 10 },
  { word: 'bloom', category: 'action', points: 10 },
  { word: 'whisper', category: 'action', points: 14 },
  { word: 'glow', category: 'action', points: 8 },
  { word: 'sparkle', category: 'action', points: 14 },
  { word: 'drift', category: 'action', points: 10 },
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

export function getRandomWordWithCategories(exclude: string[] = [], categories?: Set<WordCategory>): string {
  let pool = categories && categories.size > 0
    ? WORD_ENTRIES.filter((e) => categories.has(e.category))
    : WORD_ENTRIES
  const available = pool.filter((e) => !exclude.includes(e.word))
  if (available.length === 0) {
    // Fallback: if no words available in selected categories, use full pool
    const fallback = WORD_ENTRIES.filter((e) => !exclude.includes(e.word))
    if (fallback.length === 0) return WORD_ENTRIES[Math.floor(Math.random() * WORD_ENTRIES.length)].word
    return fallback[Math.floor(Math.random() * fallback.length)].word
  }
  return available[Math.floor(Math.random() * available.length)].word
}

export function getWordCountByCategory(category: WordCategory): number {
  return WORD_ENTRIES.filter((e) => e.category === category).length
}

export { WORD_ENTRIES }
