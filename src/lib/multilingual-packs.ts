'use client'

import type { WordCategory } from '@/lib/word-pool'

// ─── Types ─────────────────────────────────────────────────────

export type MultilingualLanguage = 'ko' | 'fr' | 'es'
export type MultilingualDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface MultilingualWord {
  word: string
  translation: string
  category: WordCategory
  language: MultilingualLanguage
  difficulty: MultilingualDifficulty
  pronunciation?: string
}

export interface LanguagePack {
  id: string
  name: string
  nativeName: string
  emoji: string
  flag: string
  language: MultilingualLanguage
  words: MultilingualWord[]
  color: string
  unlockRequirement: {
    type: 'coins' | 'words_eaten' | 'score'
    value: number
  }
}

// ─── Korean Word Pack (🇰🇷) ────────────────────────────────────

const koreanWords: MultilingualWord[] = [
  // Nature
  { word: '꽃', translation: 'flower', category: 'nature', language: 'ko', difficulty: 'beginner', pronunciation: 'kkot' },
  { word: '바다', translation: 'sea', category: 'nature', language: 'ko', difficulty: 'beginner', pronunciation: 'bada' },
  { word: '하늘', translation: 'sky', category: 'nature', language: 'ko', difficulty: 'beginner', pronunciation: 'haneul' },
  { word: '산', translation: 'mountain', category: 'nature', language: 'ko', difficulty: 'beginner', pronunciation: 'san' },
  { word: '숲', translation: 'forest', category: 'nature', language: 'ko', difficulty: 'intermediate', pronunciation: 'sup' },
  // Emotion
  { word: '행복', translation: 'happiness', category: 'emotion', language: 'ko', difficulty: 'beginner', pronunciation: 'haengbok' },
  { word: '사랑', translation: 'love', category: 'emotion', language: 'ko', difficulty: 'beginner', pronunciation: 'sarang' },
  { word: '슬픔', translation: 'sadness', category: 'emotion', language: 'ko', difficulty: 'intermediate', pronunciation: 'seulpeum' },
  { word: '용기', translation: 'courage', category: 'emotion', language: 'ko', difficulty: 'intermediate', pronunciation: 'yonggi' },
  { word: '희망', translation: 'hope', category: 'emotion', language: 'ko', difficulty: 'intermediate', pronunciation: 'huimang' },
  // Element
  { word: '불', translation: 'fire', category: 'element', language: 'ko', difficulty: 'beginner', pronunciation: 'bul' },
  { word: '물', translation: 'water', category: 'element', language: 'ko', difficulty: 'beginner', pronunciation: 'mul' },
  { word: '빛', translation: 'light', category: 'element', language: 'ko', difficulty: 'beginner', pronunciation: 'bit' },
  { word: '바람', translation: 'wind', category: 'element', language: 'ko', difficulty: 'beginner', pronunciation: 'baram' },
  // Time
  { word: '새벽', translation: 'dawn', category: 'time', language: 'ko', difficulty: 'intermediate', pronunciation: 'saebyeok' },
  { word: '밤', translation: 'night', category: 'time', language: 'ko', difficulty: 'beginner', pronunciation: 'bam' },
  { word: '봄', translation: 'spring', category: 'time', language: 'ko', difficulty: 'beginner', pronunciation: 'bom' },
  // Creature
  { word: '개', translation: 'dog', category: 'creature', language: 'ko', difficulty: 'beginner', pronunciation: 'gae' },
  { word: '고양이', translation: 'cat', category: 'creature', language: 'ko', difficulty: 'beginner', pronunciation: 'goyangi' },
  { word: '호랑이', translation: 'tiger', category: 'creature', language: 'ko', difficulty: 'intermediate', pronunciation: 'horangi' },
  // Quality & Object & Action
  { word: '지혜', translation: 'wisdom', category: 'quality', language: 'ko', difficulty: 'intermediate', pronunciation: 'jihye' },
  { word: '칼', translation: 'knife', category: 'object', language: 'ko', difficulty: 'beginner', pronunciation: 'kal' },
  { word: '춤', translation: 'dance', category: 'action', language: 'ko', difficulty: 'beginner', pronunciation: 'chum' },
]

// ─── French Word Pack (🇫🇷) ────────────────────────────────────

const frenchWords: MultilingualWord[] = [
  // Nature
  { word: 'fleur', translation: 'flower', category: 'nature', language: 'fr', difficulty: 'beginner', pronunciation: '/flœʁ/' },
  { word: 'mer', translation: 'sea', category: 'nature', language: 'fr', difficulty: 'beginner', pronunciation: '/mɛʁ/' },
  { word: 'forêt', translation: 'forest', category: 'nature', language: 'fr', difficulty: 'intermediate', pronunciation: '/fɔʁɛ/' },
  { word: 'montagne', translation: 'mountain', category: 'nature', language: 'fr', difficulty: 'intermediate', pronunciation: '/mɔ̃taɲ/' },
  { word: 'rivière', translation: 'river', category: 'nature', language: 'fr', difficulty: 'intermediate', pronunciation: '/ʁivjɛʁ/' },
  // Emotion
  { word: 'amour', translation: 'love', category: 'emotion', language: 'fr', difficulty: 'beginner', pronunciation: '/amuʁ/' },
  { word: 'joie', translation: 'joy', category: 'emotion', language: 'fr', difficulty: 'beginner', pronunciation: '/ʒwa/' },
  { word: 'bonheur', translation: 'happiness', category: 'emotion', language: 'fr', difficulty: 'intermediate', pronunciation: '/bɔnœʁ/' },
  { word: 'courage', translation: 'courage', category: 'emotion', language: 'fr', difficulty: 'intermediate', pronunciation: '/kuʁaʒ/' },
  { word: 'rêve', translation: 'dream', category: 'emotion', language: 'fr', difficulty: 'beginner', pronunciation: '/ʁɛv/' },
  // Element
  { word: 'soleil', translation: 'sun', category: 'element', language: 'fr', difficulty: 'beginner', pronunciation: '/sɔlɛj/' },
  { word: 'lune', translation: 'moon', category: 'element', language: 'fr', difficulty: 'beginner', pronunciation: '/lyn/' },
  { word: 'étoile', translation: 'star', category: 'element', language: 'fr', difficulty: 'intermediate', pronunciation: '/etwal/' },
  { word: 'vent', translation: 'wind', category: 'element', language: 'fr', difficulty: 'beginner', pronunciation: '/vɑ̃/' },
  // Time
  { word: 'nuit', translation: 'night', category: 'time', language: 'fr', difficulty: 'beginner', pronunciation: '/nɥi/' },
  { word: 'aube', translation: 'dawn', category: 'time', language: 'fr', difficulty: 'intermediate', pronunciation: '/ob/' },
  { word: 'saison', translation: 'season', category: 'time', language: 'fr', difficulty: 'intermediate', pronunciation: '/sɛzɔ̃/' },
  // Creature
  { word: 'chat', translation: 'cat', category: 'creature', language: 'fr', difficulty: 'beginner', pronunciation: '/ʃa/' },
  { word: 'chien', translation: 'dog', category: 'creature', language: 'fr', difficulty: 'beginner', pronunciation: '/ʃjɛ̃/' },
  { word: 'oiseau', translation: 'bird', category: 'creature', language: 'fr', difficulty: 'intermediate', pronunciation: '/wazo/' },
  // Quality & Object & Action
  { word: 'liberté', translation: 'freedom', category: 'quality', language: 'fr', difficulty: 'intermediate', pronunciation: '/libɛʁte/' },
  { word: 'épée', translation: 'sword', category: 'object', language: 'fr', difficulty: 'intermediate', pronunciation: '/epe/' },
  { word: 'danse', translation: 'dance', category: 'action', language: 'fr', difficulty: 'beginner', pronunciation: '/dɑ̃s/' },
  { word: 'sagesse', translation: 'wisdom', category: 'quality', language: 'fr', difficulty: 'intermediate', pronunciation: '/saʒɛs/' },
]

// ─── Spanish Word Pack (🇪🇸) ───────────────────────────────────

const spanishWords: MultilingualWord[] = [
  // Nature
  { word: 'flor', translation: 'flower', category: 'nature', language: 'es', difficulty: 'beginner', pronunciation: 'flor' },
  { word: 'mar', translation: 'sea', category: 'nature', language: 'es', difficulty: 'beginner', pronunciation: 'mar' },
  { word: 'bosque', translation: 'forest', category: 'nature', language: 'es', difficulty: 'intermediate', pronunciation: 'BOS-keh' },
  { word: 'montaña', translation: 'mountain', category: 'nature', language: 'es', difficulty: 'intermediate', pronunciation: 'mon-ta-nya' },
  { word: 'río', translation: 'river', category: 'nature', language: 'es', difficulty: 'beginner', pronunciation: 'REE-oh' },
  // Emotion
  { word: 'amor', translation: 'love', category: 'emotion', language: 'es', difficulty: 'beginner', pronunciation: 'ah-MOR' },
  { word: 'alegría', translation: 'joy', category: 'emotion', language: 'es', difficulty: 'intermediate', pronunciation: 'ah-leh-GREE-ah' },
  { word: 'felicidad', translation: 'happiness', category: 'emotion', language: 'es', difficulty: 'intermediate', pronunciation: 'feh-lee-see-DAHD' },
  { word: 'esperanza', translation: 'hope', category: 'emotion', language: 'es', difficulty: 'intermediate', pronunciation: 'ehs-peh-RAN-sah' },
  { word: 'sueño', translation: 'dream', category: 'emotion', language: 'es', difficulty: 'beginner', pronunciation: 'SWEH-nyoh' },
  // Element
  { word: 'sol', translation: 'sun', category: 'element', language: 'es', difficulty: 'beginner', pronunciation: 'sol' },
  { word: 'luna', translation: 'moon', category: 'element', language: 'es', difficulty: 'beginner', pronunciation: 'LOO-nah' },
  { word: 'estrella', translation: 'star', category: 'element', language: 'es', difficulty: 'intermediate', pronunciation: 'es-TREH-ya' },
  { word: 'luz', translation: 'light', category: 'element', language: 'es', difficulty: 'beginner', pronunciation: 'loos' },
  // Time
  { word: 'noche', translation: 'night', category: 'time', language: 'es', difficulty: 'beginner', pronunciation: 'NOH-cheh' },
  { word: 'amanecer', translation: 'dawn', category: 'time', language: 'es', difficulty: 'intermediate', pronunciation: 'ah-mah-neh-SEHR' },
  { word: 'mañana', translation: 'tomorrow', category: 'time', language: 'es', difficulty: 'beginner', pronunciation: 'mah-NYAH-nah' },
  // Creature
  { word: 'gato', translation: 'cat', category: 'creature', language: 'es', difficulty: 'beginner', pronunciation: 'GAH-toh' },
  { word: 'perro', translation: 'dog', category: 'creature', language: 'es', difficulty: 'beginner', pronunciation: 'PEH-rroh' },
  { word: 'mariposa', translation: 'butterfly', category: 'creature', language: 'es', difficulty: 'intermediate', pronunciation: 'mah-ree-POH-sah' },
  // Quality & Object & Action
  { word: 'libertad', translation: 'freedom', category: 'quality', language: 'es', difficulty: 'intermediate', pronunciation: 'lee-bur-TAHD' },
  { word: 'espada', translation: 'sword', category: 'object', language: 'es', difficulty: 'intermediate', pronunciation: 'es-PAH-dah' },
  { word: 'baile', translation: 'dance', category: 'action', language: 'es', difficulty: 'beginner', pronunciation: 'BAH-ee-leh' },
  { word: 'sabiduría', translation: 'wisdom', category: 'quality', language: 'es', difficulty: 'advanced', pronunciation: 'sah-bee-doo-REE-ah' },
]

// ─── All Packs ─────────────────────────────────────────────────

export const MULTILINGUAL_PACKS: LanguagePack[] = [
  {
    id: 'korean',
    name: 'Korean',
    nativeName: '한국어',
    emoji: '🎌',
    flag: '🇰🇷',
    language: 'ko',
    words: koreanWords,
    color: '#3b82f6',
    unlockRequirement: { type: 'coins', value: 200 },
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    emoji: '🗼',
    flag: '🇫🇷',
    language: 'fr',
    words: frenchWords,
    color: '#8b5cf6',
    unlockRequirement: { type: 'coins', value: 300 },
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    emoji: '💃',
    flag: '🇪🇸',
    language: 'es',
    words: spanishWords,
    color: '#ef4444',
    unlockRequirement: { type: 'coins', value: 400 },
  },
]

// ─── localStorage keys ────────────────────────────────────────

const STORAGE_PREFIX = 'wordsnake_multilingual_'

// ─── Public Functions ──────────────────────────────────────────

/** Get a single language pack by its ID */
export function getMultilingualPack(packId: string): LanguagePack | undefined {
  return MULTILINGUAL_PACKS.find((p) => p.id === packId)
}

/** Get word entries from a pack in word-pool compatible format (word + category + points) */
export function getWordsForPack(packId: string): { word: string; category: WordCategory; points: number }[] {
  const pack = getMultilingualPack(packId)
  if (!pack) return []

  return pack.words.map((w) => ({
    word: w.word,
    category: w.category,
    points: w.difficulty === 'beginner' ? 10 : w.difficulty === 'intermediate' ? 14 : 18,
  }))
}

/** Check whether a language pack has been unlocked by the player */
export function isMultilingualPackUnlocked(packId: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${STORAGE_PREFIX}unlocked_${packId}`) === 'true'
}

/** Unlock a language pack — returns true on success, false if not enough coins or already unlocked */
export function unlockMultilingualPack(packId: string): boolean {
  if (typeof window === 'undefined') return false

  const pack = getMultilingualPack(packId)
  if (!pack) return false
  if (isMultilingualPackUnlocked(packId)) return false

  if (pack.unlockRequirement.type === 'coins') {
    const currentCoins = parseInt(localStorage.getItem('wordsnake_coins') ?? '0', 10)
    const cost = pack.unlockRequirement.value
    if (currentCoins < cost) return false
    localStorage.setItem('wordsnake_coins', String(currentCoins - cost))
  }

  localStorage.setItem(`${STORAGE_PREFIX}unlocked_${packId}`, 'true')
  return true
}

/** Get all packs with their current unlock status */
export function getAllMultilingualPacks(): (LanguagePack & { isUnlocked: boolean })[] {
  return MULTILINGUAL_PACKS.map((pack) => ({
    ...pack,
    isUnlocked: isMultilingualPackUnlocked(pack.id),
  }))
}

/** Total number of words across every multilingual pack */
export function getTotalMultilingualWords(): number {
  return MULTILINGUAL_PACKS.reduce((sum, pack) => sum + pack.words.length, 0)
}
