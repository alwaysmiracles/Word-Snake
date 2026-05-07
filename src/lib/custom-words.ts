import type { WordCategory } from '@/lib/word-pool'

export interface CustomWord {
  word: string
  category: WordCategory
  points: number
}

export const CUSTOM_WORDS_KEY = 'word-snake-custom-words'
const MAX_CUSTOM_WORDS = 50
const MIN_WORD_LENGTH = 3
const MAX_WORD_LENGTH = 15

/** Calculate points based on word length */
export function calculatePoints(word: string): number {
  const len = word.length
  if (len <= 5) return 5
  if (len <= 8) return 10
  if (len <= 12) return 15
  return 20
}

/** Validate a word: only letters, 3-15 chars */
export function validateWord(word: string): { valid: boolean; error?: string } {
  if (word.length < MIN_WORD_LENGTH) {
    return { valid: false, error: `Word must be at least ${MIN_WORD_LENGTH} characters` }
  }
  if (word.length > MAX_WORD_LENGTH) {
    return { valid: false, error: `Word must be at most ${MAX_WORD_LENGTH} characters` }
  }
  if (!/^[a-zA-Z]+$/.test(word)) {
    return { valid: false, error: 'Word must contain only letters (a-z)' }
  }
  return { valid: true }
}

/** Get all custom words from localStorage */
export function getCustomWords(): CustomWord[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CUSTOM_WORDS_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed as CustomWord[]
  } catch {
    return []
  }
}

/** Add a custom word. Returns error string on failure, or undefined on success. */
export function addCustomWord(entry: CustomWord): string | undefined {
  const validation = validateWord(entry.word)
  if (!validation.valid) return validation.error

  const words = getCustomWords()

  // Check for duplicates (case-insensitive)
  const normalized = entry.word.toLowerCase()
  if (words.some((w) => w.word.toLowerCase() === normalized)) {
    return 'This word already exists'
  }

  // Check max limit
  if (words.length >= MAX_CUSTOM_WORDS) {
    return `Maximum ${MAX_CUSTOM_WORDS} custom words reached`
  }

  words.push({ ...entry, word: normalized })
  try {
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words))
  } catch {
    return 'Failed to save word'
  }
  return undefined
}

/** Remove a custom word by its string value */
export function removeCustomWord(word: string): void {
  const words = getCustomWords()
  const normalized = word.toLowerCase()
  const filtered = words.filter((w) => w.word.toLowerCase() !== normalized)
  try {
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(filtered))
  } catch { /* ignore */ }
}

/** Clear all custom words */
export function clearCustomWords(): void {
  try {
    localStorage.removeItem(CUSTOM_WORDS_KEY)
  } catch { /* ignore */ }
}

/** Check if a word is in the custom list */
export function isCustomWord(word: string): boolean {
  const words = getCustomWords()
  const normalized = word.toLowerCase()
  return words.some((w) => w.word.toLowerCase() === normalized)
}

/** Get count of custom words */
export function getCustomWordCount(): number {
  return getCustomWords().length
}

/** Get custom words that match the given category filter */
export function getCustomWordsByCategories(categories: Set<WordCategory>): CustomWord[] {
  const words = getCustomWords()
  if (categories.size === 0) return words
  return words.filter((w) => categories.has(w.category))
}
