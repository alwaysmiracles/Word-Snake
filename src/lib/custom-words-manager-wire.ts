'use client'

import type { WordCategory } from '@/lib/word-pool'
import {
  type CustomWord,
  getCustomWords,
  addCustomWord,
  removeCustomWord,
  clearCustomWords,
  calculatePoints,
  validateWord as validateCustomWord,
  CUSTOM_WORDS_KEY,
} from '@/lib/custom-words'
import {
  type CustomWordPack,
  createWordPack,
  addWordToPack,
  saveWordPack,
  loadWordPacks,
  importPackFromJSON,
  MAX_WORDS_PER_PACK,
} from '@/lib/word-pack-creator'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MANAGER_STORAGE_KEY = 'ws_custom_words_manager'
const MAX_HISTORY_ENTRIES = 50

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert',
}

export const DIFFICULTY_LENGTH_RANGES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 3, max: 5 },
  medium: { min: 6, max: 8 },
  hard: { min: 9, max: 12 },
  expert: { min: 13, max: 15 },
}

export const ALL_CATEGORIES: WordCategory[] = [
  'nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action',
]

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  nature: 'Nature', emotion: 'Emotion', element: 'Element', time: 'Time',
  creature: 'Creature', quality: 'Quality', object: 'Object', action: 'Action',
}

export const CATEGORY_KEYWORDS: Record<WordCategory, string[]> = {
  nature: ['flower', 'tree', 'river', 'mountain', 'ocean', 'forest', 'garden', 'sky'],
  emotion: ['happy', 'calm', 'brave', 'love', 'hope', 'joy', 'peace', 'dream'],
  element: ['fire', 'water', 'stone', 'wind', 'light', 'ice', 'gold', 'silver'],
  time: ['dawn', 'dusk', 'spring', 'winter', 'moment', 'epoch', 'clock', 'season'],
  creature: ['dragon', 'eagle', 'wolf', 'fox', 'whale', 'owl', 'tiger', 'bear'],
  quality: ['bright', 'swift', 'noble', 'fierce', 'gentle', 'bold', 'calm', 'pure'],
  object: ['sword', 'crown', 'shield', 'mirror', 'scroll', 'bridge', 'tower', 'coin'],
  action: ['search', 'leap', 'crawl', 'think', 'build', 'explore', 'dance', 'fly'],
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomWordStats {
  totalWords: number
  categories: number
  lastModified: string | null
  difficultyBreakdown: Record<Difficulty, number>
  averageWordLength: number
  oldestWord: string | null
  newestWord: string | null
  storageUsageKB: number
}

export interface QuickAddResult {
  success: boolean
  word: string
  category: WordCategory
  points: number
  difficulty: Difficulty
  error?: string
}

export interface BulkImportResult {
  added: number
  skipped: number
  failed: number
  errors: BulkImportError[]
}

export interface BulkImportError {
  word: string
  line: number
  reason: string
}

export interface CategorySummary {
  category: WordCategory
  label: string
  count: number
  percentage: number
  difficultyBreakdown: Record<Difficulty, number>
}

export interface WordListValidation {
  isValid: boolean
  totalWords: number
  validWords: string[]
  invalidWords: InvalidWordEntry[]
  duplicateWords: string[]
  estimatedPoints: number
}

export interface InvalidWordEntry {
  word: string
  reason: string
}

export interface ExportPackResult {
  success: boolean
  packId: string | null
  packName: string
  wordCount: number
  error?: string
}

export interface ImportPackResult {
  success: boolean
  imported: number
  skipped: number
  packName: string
  error?: string
}

export interface QueuedWord {
  word: CustomWord
  difficulty: Difficulty
  priority: number
}

export interface HistoryEntry {
  id: string
  action: 'add' | 'remove' | 'bulk_add' | 'clear' | 'import_pack' | 'export_pack'
  word?: string
  category?: WordCategory
  timestamp: number
  details: string
}

export interface CategoryRecommendation {
  category: WordCategory
  label: string
  suggestedWords: string[]
  reason: string
  priority: 'low' | 'medium' | 'high'
}

interface ManagerState {
  history: HistoryEntry[]
  lastModified: number | null
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export function wordLengthToDifficulty(length: number): Difficulty {
  if (length <= DIFFICULTY_LENGTH_RANGES.easy.max) return 'easy'
  if (length <= DIFFICULTY_LENGTH_RANGES.medium.max) return 'medium'
  if (length <= DIFFICULTY_LENGTH_RANGES.hard.max) return 'hard'
  return 'expert'
}

function generateHistoryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function readManagerState(): ManagerState {
  if (typeof window === 'undefined') return { history: [], lastModified: null }
  try {
    const raw = localStorage.getItem(MANAGER_STORAGE_KEY)
    if (!raw) return { history: [], lastModified: null }
    const parsed = JSON.parse(raw) as ManagerState
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      lastModified: typeof parsed.lastModified === 'number' ? parsed.lastModified : null,
    }
  } catch {
    return { history: [], lastModified: null }
  }
}

function persistManagerState(state: ManagerState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(state))
  } catch { /* storage full — ignore */ }
}

function pushHistory(entry: HistoryEntry): void {
  const state = readManagerState()
  state.history.unshift(entry)
  if (state.history.length > MAX_HISTORY_ENTRIES) {
    state.history = state.history.slice(0, MAX_HISTORY_ENTRIES)
  }
  state.lastModified = entry.timestamp
  persistManagerState(state)
}

function computeStorageUsageKB(): number {
  if (typeof window === 'undefined') return 0
  try {
    const data = localStorage.getItem(CUSTOM_WORDS_KEY) ?? ''
    return Math.round((new Blob([data]).size / 1024) * 100) / 100
  } catch {
    return 0
  }
}

function formatTimestamp(ts: number | null): string | null {
  if (ts === null) return null
  return new Date(ts).toISOString()
}

function isValidCategory(cat: string): cat is WordCategory {
  return ALL_CATEGORIES.includes(cat as WordCategory)
}

function isValidDifficulty(d: string): d is Difficulty {
  return d in DIFFICULTY_LENGTH_RANGES
}

function parseDelimitedText(text: string): string[] {
  return text
    .split(/[,;\n\r]+/)
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 0)
}

function queuePriority(word: CustomWord, difficulty: Difficulty): number {
  const weight: Record<Difficulty, number> = { expert: 0, hard: 1, medium: 2, easy: 3 }
  return weight[difficulty] * 100 - word.word.length
}

// ---------------------------------------------------------------------------
// 1. Custom Word Stats
// ---------------------------------------------------------------------------

/** Returns statistics snapshot of the current custom word collection. */
export function getCustomWordStats(): CustomWordStats {
  const words = getCustomWords()
  const state = readManagerState()
  const categories = new Set(words.map((w) => w.category))

  const breakdown: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 }
  for (const w of words) breakdown[wordLengthToDifficulty(w.word.length)]++

  const totalLength = words.reduce((s, w) => s + w.word.length, 0)
  const averageWordLength = words.length > 0 ? Math.round((totalLength / words.length) * 10) / 10 : 0

  return {
    totalWords: words.length,
    categories: categories.size,
    lastModified: formatTimestamp(state.lastModified),
    difficultyBreakdown: breakdown,
    averageWordLength,
    oldestWord: words.length > 0 ? words[0].word : null,
    newestWord: words.length > 0 ? words[words.length - 1].word : null,
    storageUsageKB: computeStorageUsageKB(),
  }
}

// ---------------------------------------------------------------------------
// 2. Quick Add
// ---------------------------------------------------------------------------

/** Add a single custom word with validation and history tracking. */
export function quickAddWord(
  word: string,
  category: WordCategory,
  difficulty?: Difficulty,
): QuickAddResult {
  const trimmed = word.trim()
  const diff = difficulty ?? wordLengthToDifficulty(trimmed.length)

  if (!trimmed) {
    return { success: false, word: trimmed, category, points: 0, difficulty: diff, error: 'Word must not be empty.' }
  }

  const validation = validateCustomWord(trimmed)
  if (!validation.valid) {
    return { success: false, word: trimmed, category, points: 0, difficulty: diff, error: validation.error }
  }

  if (!isValidCategory(category)) {
    return { success: false, word: trimmed, category, points: 0, difficulty: diff, error: `Invalid category "${category}".` }
  }

  // If difficulty is specified, verify word length falls in the expected range
  if (difficulty && isValidDifficulty(difficulty)) {
    const range = DIFFICULTY_LENGTH_RANGES[difficulty]
    if (trimmed.length < range.min || trimmed.length > range.max) {
      return {
        success: false, word: trimmed, category, points: calculatePoints(trimmed), difficulty,
        error: `Word length ${trimmed.length} doesn't match "${difficulty}" range (${range.min}–${range.max}).`,
      }
    }
  }

  const points = calculatePoints(trimmed)
  const error = addCustomWord({ word: trimmed.toLowerCase(), category, points })

  if (error) {
    return { success: false, word: trimmed, category, points, difficulty: diff, error }
  }

  pushHistory({
    id: generateHistoryId(), action: 'add', word: trimmed.toLowerCase(), category,
    timestamp: Date.now(), details: `Added "${trimmed.toLowerCase()}" to ${CATEGORY_LABELS[category]} (${points} pts).`,
  })

  return { success: true, word: trimmed.toLowerCase(), category, points, difficulty: diff }
}

// ---------------------------------------------------------------------------
// 3. Bulk Import
// ---------------------------------------------------------------------------

/** Parse comma/newline-separated text and import all valid words. */
export function bulkImportWords(text: string, category: WordCategory = 'nature'): BulkImportResult {
  const tokens = parseDelimitedText(text)
  const result: BulkImportResult = { added: 0, skipped: 0, failed: 0, errors: [] }

  if (tokens.length === 0) return result
  if (!isValidCategory(category)) {
    result.errors.push({ word: '', line: 0, reason: `Invalid category "${category}".` })
    return result
  }

  const existingWords = getCustomWords().map((w) => w.word.toLowerCase())
  const seenInBatch = new Set<string>()

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const lower = token.toLowerCase()
    const line = i + 1

    if (seenInBatch.has(lower)) {
      result.skipped++
      result.errors.push({ word: token, line, reason: 'Duplicate within import batch.' })
      continue
    }
    seenInBatch.add(lower)

    if (existingWords.includes(lower)) {
      result.skipped++
      result.errors.push({ word: token, line, reason: 'Word already exists in custom list.' })
      continue
    }

    const validation = validateCustomWord(lower)
    if (!validation.valid) {
      result.failed++
      result.errors.push({ word: token, line, reason: validation.error ?? 'Invalid word.' })
      continue
    }

    const points = calculatePoints(lower)
    const addError = addCustomWord({ word: lower, category, points })
    if (addError) {
      result.skipped++
      result.errors.push({ word: token, line, reason: addError })
    } else {
      result.added++
      existingWords.push(lower)
    }
  }

  if (result.added > 0) {
    pushHistory({
      id: generateHistoryId(), action: 'bulk_add', category,
      timestamp: Date.now(), details: `Bulk imported ${result.added} word(s) to ${CATEGORY_LABELS[category]}.`,
    })
  }

  return result
}

// ---------------------------------------------------------------------------
// 4. Category Manager
// ---------------------------------------------------------------------------

/** Return every custom word category with count and difficulty breakdown. */
export function getCustomCategories(): CategorySummary[] {
  const words = getCustomWords()
  const total = words.length

  const map = new Map<WordCategory, CustomWord[]>()
  for (const cat of ALL_CATEGORIES) map.set(cat, [])
  for (const w of words) {
    const list = map.get(w.category)
    if (list) list.push(w)
  }

  const summaries: CategorySummary[] = []
  for (const [cat, list] of map) {
    const breakdown: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 }
    for (const w of list) breakdown[wordLengthToDifficulty(w.word.length)]++

    summaries.push({
      category: cat, label: CATEGORY_LABELS[cat], count: list.length,
      percentage: total > 0 ? Math.round((list.length / total) * 1000) / 10 : 0,
      difficultyBreakdown: breakdown,
    })
  }

  summaries.sort((a, b) => b.count - a.count)
  return summaries
}

// ---------------------------------------------------------------------------
// 5. Validation
// ---------------------------------------------------------------------------

/** Validate an array of word strings before import — checks duplicates, length, characters. */
export function validateWordList(words: string[]): WordListValidation {
  const result: WordListValidation = {
    isValid: true, totalWords: words.length, validWords: [], invalidWords: [],
    duplicateWords: [], estimatedPoints: 0,
  }

  const existingLower = new Set(getCustomWords().map((w) => w.word.toLowerCase()))
  const seenLower = new Set<string>()

  for (const raw of words) {
    const trimmed = raw.trim()
    if (!trimmed) {
      result.invalidWords.push({ word: raw, reason: 'Empty entry.' })
      continue
    }

    const lower = trimmed.toLowerCase()
    if (existingLower.has(lower) || seenLower.has(lower)) {
      result.duplicateWords.push(trimmed)
      continue
    }
    seenLower.add(lower)

    const validation = validateCustomWord(lower)
    if (!validation.valid) {
      result.invalidWords.push({ word: trimmed, reason: validation.error ?? 'Invalid word.' })
      result.isValid = false
      continue
    }

    result.validWords.push(trimmed)
    result.estimatedPoints += calculatePoints(trimmed)
  }

  if (result.invalidWords.length > 0 || result.duplicateWords.length > 0) result.isValid = false
  return result
}

// ---------------------------------------------------------------------------
// 6. Export Pack
// ---------------------------------------------------------------------------

/** Export all custom words as a new word pack. */
export function exportAsWordPack(
  name: string,
  description: string,
  emoji: string = '📦',
): ExportPackResult {
  const words = getCustomWords()
  if (words.length === 0) {
    return { success: false, packId: null, packName: name, wordCount: 0, error: 'No custom words to export.' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, packId: null, packName: name, wordCount: words.length, error: 'Pack name must not be empty.' }
  }

  let pack = createWordPack(trimmedName, emoji, description.trim())
  for (const w of words.slice(0, MAX_WORDS_PER_PACK)) {
    pack = addWordToPack(pack, w)
  }
  saveWordPack(pack)

  pushHistory({
    id: generateHistoryId(), action: 'export_pack',
    timestamp: Date.now(), details: `Exported ${pack.words.length} word(s) as pack "${trimmedName}".`,
  })

  return { success: true, packId: pack.id, packName: trimmedName, wordCount: pack.words.length }
}

// ---------------------------------------------------------------------------
// 7. Import Pack
// ---------------------------------------------------------------------------

/** Import words from a word pack (JSON string or CustomWordPack object) into custom words. */
export function importFromPack(data: string | CustomWordPack): ImportPackResult {
  let pack: CustomWordPack | null = null

  if (typeof data === 'string') {
    pack = importPackFromJSON(data)
    if (!pack) {
      return { success: false, imported: 0, skipped: 0, packName: '', error: 'Invalid pack data — could not parse JSON.' }
    }
  } else {
    pack = data
  }

  const existingLower = new Set(getCustomWords().map((w) => w.word.toLowerCase()))
  let imported = 0
  let skipped = 0

  for (const w of pack.words) {
    const lower = w.word.toLowerCase()
    if (existingLower.has(lower)) { skipped++; continue }

    const validation = validateCustomWord(lower)
    if (!validation.valid) { skipped++; continue }

    const points = w.points > 0 ? w.points : calculatePoints(lower)
    const error = addCustomWord({ word: lower, category: w.category, points })
    if (error) { skipped++ } else { imported++; existingLower.add(lower) }
  }

  if (imported > 0) {
    pushHistory({
      id: generateHistoryId(), action: 'import_pack',
      timestamp: Date.now(), details: `Imported ${imported} word(s) from pack "${pack.name}".`,
    })
  }

  return { success: true, imported, skipped, packName: pack.name }
}

// ---------------------------------------------------------------------------
// 8. Word Queue
// ---------------------------------------------------------------------------

/** Return custom words prioritized by difficulty (expert → easy). */
export function getWordQueue(difficultyFilter?: Difficulty): QueuedWord[] {
  const words = getCustomWords()

  let filtered = words
  if (difficultyFilter && isValidDifficulty(difficultyFilter)) {
    const range = DIFFICULTY_LENGTH_RANGES[difficultyFilter]
    filtered = words.filter((w) => w.word.length >= range.min && w.word.length <= range.max)
  }

  const queue: QueuedWord[] = filtered.map((w) => {
    const diff = wordLengthToDifficulty(w.word.length)
    return { word: w, difficulty: diff, priority: queuePriority(w, diff) }
  })

  queue.sort((a, b) => a.priority - b.priority)
  return queue
}

// ---------------------------------------------------------------------------
// 9. History
// ---------------------------------------------------------------------------

/** Return recent modification history for custom words. */
export function getModificationHistory(limit: number = 20): HistoryEntry[] {
  const state = readManagerState()
  return state.history.slice(0, Math.max(1, Math.min(limit, MAX_HISTORY_ENTRIES)))
}

// ---------------------------------------------------------------------------
// 10. Recommendations
// ---------------------------------------------------------------------------

/** Suggest word categories based on weak areas in the current collection. */
export function getRecommendations(): CategoryRecommendation[] {
  const words = getCustomWords()
  const categories = getCustomCategories()
  const recommendations: CategoryRecommendation[] = []

  for (const summary of categories) {
    if (summary.count >= 5) continue

    let priority: 'low' | 'medium' | 'high'
    if (summary.count === 0) priority = 'high'
    else if (summary.count <= 2) priority = 'medium'
    else priority = 'low'

    const missingDifficulties: Difficulty[] = []
    for (const [diff, count] of Object.entries(summary.difficultyBreakdown)) {
      if (count === 0) missingDifficulties.push(diff as Difficulty)
    }

    const existingLower = new Set(words.map((w) => w.word.toLowerCase()))
    const suggested = CATEGORY_KEYWORDS[summary.category]
      .filter((kw) => !existingLower.has(kw.toLowerCase()))
      .slice(0, 8)

    let reason = summary.count === 0
      ? 'No custom words in this category yet.'
      : `Only ${summary.count} word(s) in this category.`

    if (missingDifficulties.length > 0) {
      reason += ` Missing difficulty tiers: ${missingDifficulties.map((d) => DIFFICULTY_LABELS[d]).join(', ')}.`
    }

    recommendations.push({ category: summary.category, label: summary.label, suggestedWords: suggested, reason, priority })
  }

  const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => order[a.priority] - order[b.priority])
  return recommendations
}
