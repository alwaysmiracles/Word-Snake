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

/** Valid category values for import validation */
const VALID_CATEGORIES: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']

/** Export all custom words as a JSON string */
export function exportCustomWordsJSON(): string {
  const words = getCustomWords()
  return JSON.stringify(words, null, 2)
}

/** Import custom words from a JSON string. Returns import result. */
export function importCustomWordsJSON(jsonString: string): { imported: number; skipped: number; errors: string[] } {
  const result = { imported: 0, skipped: 0, errors: [] as string[] }

  let parsed: unknown[]
  try {
    const data = JSON.parse(jsonString)
    if (!Array.isArray(data)) {
      result.errors.push('JSON must be an array of word objects')
      return result
    }
    parsed = data
  } catch {
    result.errors.push('Invalid JSON format')
    return result
  }

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]
    if (typeof item !== 'object' || item === null) {
      result.errors.push(`Row ${i + 1}: Not an object`)
      continue
    }

    const obj = item as Record<string, unknown>
    const word = typeof obj.word === 'string' ? obj.word.trim() : ''
    const category = typeof obj.category === 'string' ? obj.category.trim().toLowerCase() : ''
    const points = typeof obj.points === 'number' ? obj.points : undefined

    if (!word) {
      result.errors.push(`Row ${i + 1}: Missing or empty "word" field`)
      continue
    }

    // Validate word
    const validation = validateWord(word)
    if (!validation.valid) {
      result.errors.push(`Row ${i + 1} ("${word}"): ${validation.error}`)
      result.skipped++
      continue
    }

    // Validate category
    if (!category || !VALID_CATEGORIES.includes(category as WordCategory)) {
      result.errors.push(`Row ${i + 1} ("${word}"): Invalid category "${obj.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`)
      result.skipped++
      continue
    }

    // Check for duplicates (case-insensitive) against existing + already-imported
    const normalized = word.toLowerCase()
    const currentWords = getCustomWords()
    if (currentWords.some((w) => w.word.toLowerCase() === normalized)) {
      result.skipped++
      continue
    }

    // Check max limit
    if (getCustomWords().length >= MAX_CUSTOM_WORDS) {
      result.errors.push(`Maximum ${MAX_CUSTOM_WORDS} custom words reached. Stopping import.`)
      break
    }

    const finalPoints = points !== undefined && points > 0 ? points : calculatePoints(word)
    const addError = addCustomWord({ word: normalized, category: category as WordCategory, points: finalPoints })
    if (addError) {
      result.skipped++
    } else {
      result.imported++
    }
  }

  return result
}

/** Export all custom words as a CSV string */
export function exportCustomWordsCSV(): string {
  const words = getCustomWords()
  const lines = ['word,category,points']
  for (const w of words) {
    // Quote fields that might contain commas (unlikely for words, but safe)
    const wordField = w.word.includes(',') ? `"${w.word}"` : w.word
    const catField = w.category.includes(',') ? `"${w.category}"` : w.category
    lines.push(`${wordField},${catField},${w.points}`)
  }
  return lines.join('\n')
}

/** Parse a CSV line handling quoted fields */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  fields.push(current)
  return fields
}

/** Import custom words from a CSV string. Returns import result. */
export function importCustomWordsCSV(csvString: string): { imported: number; skipped: number; errors: string[] } {
  const result = { imported: 0, skipped: 0, errors: [] as string[] }

  const lines = csvString.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) {
    result.errors.push('CSV is empty')
    return result
  }

  // Check if first line is header
  const firstLine = parseCSVLine(lines[0]).map((f) => f.trim().toLowerCase())
  const startIdx = (firstLine.includes('word') && firstLine.includes('category')) ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]).map((f) => f.trim())
    const rowNumber = i + 1

    if (fields.length < 2) {
      result.errors.push(`Row ${rowNumber}: Not enough fields (expected word, category, points)`)
      continue
    }

    const word = fields[0]
    const category = fields[1].toLowerCase()
    const pointsStr = fields[2]
    const points = pointsStr ? parseInt(pointsStr, 10) : undefined

    if (!word) {
      result.errors.push(`Row ${rowNumber}: Empty word field`)
      continue
    }

    // Validate word
    const validation = validateWord(word)
    if (!validation.valid) {
      result.errors.push(`Row ${rowNumber} ("${word}"): ${validation.error}`)
      result.skipped++
      continue
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category as WordCategory)) {
      result.errors.push(`Row ${rowNumber} ("${word}"): Invalid category "${fields[1]}". Must be one of: ${VALID_CATEGORIES.join(', ')}`)
      result.skipped++
      continue
    }

    // Check for duplicates
    const normalized = word.toLowerCase()
    const currentWords = getCustomWords()
    if (currentWords.some((w) => w.word.toLowerCase() === normalized)) {
      result.skipped++
      continue
    }

    // Check max limit
    if (getCustomWords().length >= MAX_CUSTOM_WORDS) {
      result.errors.push(`Maximum ${MAX_CUSTOM_WORDS} custom words reached. Stopping import.`)
      break
    }

    const finalPoints = points !== undefined && !isNaN(points) && points > 0 ? points : calculatePoints(word)
    const addError = addCustomWord({ word: normalized, category: category as WordCategory, points: finalPoints })
    if (addError) {
      result.skipped++
    } else {
      result.imported++
    }
  }

  return result
}

/** Generate a sample JSON string for reference */
export function generateSampleJSON(): string {
  const sample: CustomWord[] = [
    { word: 'serenity', category: 'emotion', points: 15 },
    { word: 'crystal', category: 'element', points: 14 },
    { word: 'phoenix', category: 'creature', points: 14 },
  ]
  return JSON.stringify(sample, null, 2)
}

/** Generate a sample CSV string for reference */
export function generateSampleCSV(): string {
  return `word,category,points
serenity,emotion,15
crystal,element,14
phoenix,creature,14`
}
