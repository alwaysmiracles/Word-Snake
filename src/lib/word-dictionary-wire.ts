'use client'

/**
 * word-dictionary-wire.ts
 * ────────────────────────────
 * Unified dictionary experience for the Word Snake game.
 * Aggregates definitions, sentences, phonetics, mastery, favorites,
 * search, quiz generation, and pronunciation into a single API surface.
 *
 * localStorage keys:
 *   ws_dictionary_favorites  – string[] (JSON array of words)
 *   ws_dictionary_lookups    – RecentLookup[] (JSON array, max 100)
 */

import { getWordDefinition, getAllDefinitions } from '@/lib/word-definitions'
import type { WordDefinition } from '@/lib/word-definitions'
import { isSpeechSupported, pronounceWord, stopSpeech } from '@/lib/word-pronunciation'
import { getWordSentences, getSentenceOfTheDay, generateFillerSentence } from '@/lib/word-sentences'
import type { WordSentence } from '@/lib/word-sentences'
import { getMastery, getMasteryProgress, getLevelName, getLevelEmoji, getLevelColor } from '@/lib/word-mastery'
import type { MasteryLevel, MasteryProgress, WordMastery } from '@/lib/word-mastery'
import { getAllWords, getTotalWordCount, getCategoryInfo } from '@/lib/word-pool'
import type { WordCategory } from '@/lib/word-pool'

// ── Public types ────────────────────────────────────────────────────────────

export interface DictionaryEntry {
  word: string
  definition: WordDefinition | null
  sentences: WordSentence[]
  phoneticHint: string
  mastery: WordMastery | null
  masteryLevel: MasteryLevel
  masteryLabel: string
  masteryEmoji: string
  masteryColor: string
  masteryProgress: MasteryProgress
  isFavorite: boolean
}

export interface RecentLookup {
  word: string
  timestamp: number
}

export interface DictionaryStats {
  totalWords: number
  totalCategories: number
  categoriesCovered: { category: string; label: string; color: string; emoji: string; wordCount: number }[]
  averageDefinitionsPerWord: number
  totalSentencesAvailable: number
  favoriteCount: number
  totalLookups: number
}

export interface SearchResult {
  word: string
  definition: string | null
  category: string | null
  matchType: 'prefix' | 'contains' | 'fuzzy'
}

export interface CategoryBrowserResult {
  category: string
  label: string
  color: string
  emoji: string
  entries: DictionaryEntry[]
}

export type QuizQuestionType = 'definition-to-word' | 'word-to-definition'

export interface QuizQuestion {
  prompt: string
  options: string[]
  correctIndex: number
  correctAnswer: string
  word: string
  type: QuizQuestionType
}

export interface SpeakResult {
  success: boolean
  error: string | null
  word: string
  supported: boolean
}

// ── Constants ───────────────────────────────────────────────────────────────

const FAVORITES_KEY = 'ws_dictionary_favorites'
const LOOKUPS_KEY = 'ws_dictionary_lookups'
const MAX_LOOKUPS = 100
const MAX_RECENT_SEEN = 20

const ALL_CATEGORIES: WordCategory[] = [
  'nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action',
]

// Compact phonetic map for words in the definitions database
const PHONETICS: Record<string, string> = {
  river:'ˈrɪv.ər', ocean:'ˈoʊ.ʃən', forest:'ˈfɔːr.ɪst', mountain:'ˈmaʊn.tɪn',
  flower:'ˈflaʊ.ər', breeze:'briːz', sunset:'ˈsʌn.sɛt', rainbow:'ˈreɪn.boʊ',
  thunder:'ˈθʌn.dər', meadow:'ˈmɛd.oʊ', valley:'ˈvæl.i', island:'ˈaɪ.lənd',
  desert:'ˈdɛz.ərt', glacier:'ˈɡleɪ.ʃər', aurora:'ɔːˈrɔːr.ə', storm:'stɔːrm',
  canyon:'ˈkæn.jən', reef:'riːf', volcano:'vɒlˈkeɪ.noʊ', prairie:'ˈprɛr.i',
  tundra:'ˈtʌn.drə', oasis:'oʊˈeɪ.sɪs', waterfall:'ˈwɔː.tər.fɔːl', horizon:'həˈraɪ.zən',
  joy:'dʒɔɪ', hope:'hoʊp', peace:'piːs', dream:'driːm', wonder:'ˈwʌn.dər',
  courage:'ˈkʌr.ɪdʒ', bliss:'blɪs', calm:'kɑːm', fury:'ˈfjʊər.i', grace:'ɡreɪs',
  pride:'praɪd', faith:'feɪθ', love:'lʌv', zeal:'ziːl', mirth:'mɜːrθ', dread:'drɛd',
  nostalgia:'nɒˈstæl.dʒə', ecstasy:'ˈɛk.stə.si', sorrow:'ˈsɒr.oʊ', envy:'ˈɛn.vi',
  anguish:'ˈæŋ.ɡwɪʃ', resolve:'rɪˈzɒlv', fire:'ˈfaɪ.ər', water:'ˈwɔː.tər',
  earth:'ɜːrθ', wind:'wɪnd', light:'laɪt', shadow:'ˈʃæd.oʊ', frost:'frɒst',
  flame:'fleɪm', spark:'spɑːrk', stone:'stoʊn', crystal:'ˈkrɪs.təl', ember:'ˈɛm.bər',
  smoke:'smoʊk', cloud:'klaʊd', tide:'taɪd', dew:'djuː', mist:'mɪst',
  quartz:'kwɔːrts', monsoon:'mɒnˈsuːn', eclipse:'ɪˈklɪps', solstice:'ˈsɒl.stɪs',
  dawn:'dɔːn', dusk:'dʌsk', twilight:'ˈtwaɪ.laɪt', eternity:'ɪˈtɜːr.nɪ.ti',
  moment:'ˈmoʊ.mənt', season:'ˈsiː.zən', epoch:'ˈɛp.ək', hour:'aʊ.ər',
  heartbeat:'ˈhɑːrt.biːt', millennium:'mɪˈlɛn.i.əm', aftermath:'ˈæf.tər.mæθ',
  interlude:'ˈɪn.tər.luːd', genesis:'ˈdʒɛn.ə.sɪs', eagle:'ˈiː.ɡəl',
  wolf:'wʊlf', dolphin:'ˈdɒl.fɪn', phoenix:'ˈfiː.nɪks', dragon:'ˈdræɡ.ən',
  falcon:'ˈfɔːl.kən', tiger:'ˈtaɪ.ɡər', swan:'swɒn', panther:'ˈpæn.θər',
  raven:'ˈreɪ.vən', cobra:'ˈkoʊ.brə', mantis:'ˈmæn.tɪs', whale:'weɪl',
  wisdom:'ˈwɪz.dəm', beauty:'ˈbjuː.ti', strength:'strɛŋθ', freedom:'ˈfriː.dəm',
  magic:'ˈmædʒ.ɪk', power:'ˈpaʊ.ər', honor:'ˈɒn.ər', truth:'truːθ',
  resilience:'rɪˈzɪl.i.əns', harmony:'ˈhɑːr.mə.ni', ambition:'æmˈbɪʃ.ən',
  loyalty:'ˈlɔɪ.əl.ti', sword:'sɔːrd', crown:'kraʊn', shield:'ʃiːld',
  lantern:'ˈlæn.tərn', mirror:'ˈmɪr.ər', compass:'ˈkʌm.pəs', feather:'ˈfɛð.ər',
  key:'kiː', scroll:'skroʊl', gem:'dʒɛm', anchor:'ˈæŋ.kər', prism:'ˈprɪz.əm',
  soar:'sɔːr', dance:'dæns', shine:'ʃaɪn', bloom:'bluːm', whisper:'ˈwɪs.pər',
  glow:'ɡloʊ', sparkle:'ˈspɑːr.kəl', drift:'drɪft', conquer:'ˈkɒŋ.kər',
  flourish:'ˈflɜːr.ɪʃ', wander:'ˈwɒn.dər', ascend:'əˈsɛnd',
}

// ── localStorage helpers ────────────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null
  } catch { return null }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.setItem(key, value)
    return true
  } catch { return false }
}

function loadFavorites(): Set<string> {
  try {
    const raw = safeGetItem(FAVORITES_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set()
  } catch { return new Set() }
}

function persistFavorites(favs: Set<string>): void {
  safeSetItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)))
}

function loadLookups(): RecentLookup[] {
  try {
    const raw = safeGetItem(LOOKUPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((v): v is RecentLookup =>
        typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).word === 'string' &&
        typeof (v as Record<string, unknown>).timestamp === 'number',
      )
      .sort((a, b) => b.timestamp - a.timestamp)
  } catch { return [] }
}

function persistLookups(lookups: RecentLookup[]): void {
  safeSetItem(LOOKUPS_KEY, JSON.stringify(lookups.slice(0, MAX_LOOKUPS)))
}

// ── Internal helpers ────────────────────────────────────────────────────────

function buildPhoneticHint(word: string): string {
  return PHONETICS[word.toLowerCase()] ?? `/—${word}—/`
}

function buildDictionaryEntry(word: string, favorites: Set<string>): DictionaryEntry {
  const def = getWordDefinition(word)
  let sentences = getWordSentences(word)
  if (sentences.length === 0 && def) {
    sentences = [generateFillerSentence(word, def.category)]
  }
  const mastery = getMastery(word)
  const masteryLevel = mastery?.masteryLevel ?? 'new'
  return {
    word, definition: def ?? null, sentences,
    phoneticHint: buildPhoneticHint(word),
    mastery: mastery ?? null, masteryLevel,
    masteryLabel: getLevelName(masteryLevel), masteryEmoji: getLevelEmoji(masteryLevel),
    masteryColor: getLevelColor(masteryLevel), masteryProgress: getMasteryProgress(word),
    isFavorite: favorites.has(word.toLowerCase()),
  }
}

function recordLookup(word: string): void {
  try {
    const lookups = loadLookups()
    const filtered = lookups.filter((l) => l.word.toLowerCase() !== word.toLowerCase())
    filtered.unshift({ word, timestamp: Date.now() })
    persistLookups(filtered)
  } catch { /* non-critical */ }
}

function getRecentSeenWords(): Set<string> {
  try {
    return new Set(loadLookups().slice(0, MAX_RECENT_SEEN).map((l) => l.word.toLowerCase()))
  } catch { return new Set() }
}

function getDailySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row: number[] = Array(n + 1).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return dp[m][n]
}

// ── 1. Lookup ───────────────────────────────────────────────────────────────

/**
 * Look up a word and return its full dictionary entry in a single call.
 * Also records the lookup in recent history.
 */
export function lookupWord(word: string): DictionaryEntry | null {
  try {
    if (!word || typeof word !== 'string') return null
    const trimmed = word.trim().toLowerCase()
    if (!trimmed) return null
    const favs = loadFavorites()
    const entry = buildDictionaryEntry(trimmed, favs)
    if (entry.definition || entry.sentences.length > 0) recordLookup(trimmed)
    return entry
  } catch { return null }
}

// ── 2. Word of the Day ──────────────────────────────────────────────────────

/**
 * Returns a rotating word-of-the-day with full dictionary data.
 * Deterministic — the same word is returned for the entire calendar day.
 */
export function getWordOfTheDay(): DictionaryEntry | null {
  try {
    const allDefs = getAllDefinitions()
    if (allDefs.length === 0) return null
    const index = getDailySeed() % allDefs.length
    const favs = loadFavorites()
    return buildDictionaryEntry(allDefs[index].word, favs)
  } catch { return null }
}

// ── 3. Random Discovery ────────────────────────────────────────────────────

/**
 * Returns a random word that the user hasn't seen recently.
 * Falls back to any random word if all have been seen recently.
 */
export function discoverRandomWord(): DictionaryEntry | null {
  try {
    const allDefs = getAllDefinitions()
    if (allDefs.length === 0) return null
    const seen = getRecentSeenWords()
    const unseen = allDefs.filter((d) => !seen.has(d.word.toLowerCase()))
    const pool = unseen.length > 0 ? unseen : allDefs
    const pick = pool[Math.floor(Math.random() * pool.length)]
    return buildDictionaryEntry(pick.word, loadFavorites())
  } catch { return null }
}

// ── 4. Search ───────────────────────────────────────────────────────────────

/**
 * Search the dictionary by query string.
 * Supports prefix matching, substring matching, and fuzzy matching
 * (Levenshtein distance ≤ max(2, 40% of query length)). Also searches within
 * definitions if word matches are sparse. Results sorted: prefix → contains → fuzzy.
 */
export function searchDictionary(query: string): SearchResult[] {
  try {
    if (!query || typeof query !== 'string') return []
    const q = query.trim().toLowerCase()
    if (!q) return []
    const allDefs = getAllDefinitions()
    const results: SearchResult[] = []

    for (const def of allDefs) {
      const w = def.word.toLowerCase()
      if (w.startsWith(q)) {
        results.push({ word: def.word, definition: def.definition, category: def.category, matchType: 'prefix' })
        continue
      }
      if (w.includes(q)) {
        results.push({ word: def.word, definition: def.definition, category: def.category, matchType: 'contains' })
        continue
      }
      if (q.length >= 2 && levenshtein(w, q) <= Math.max(2, Math.floor(q.length * 0.4))) {
        results.push({ word: def.word, definition: def.definition, category: def.category, matchType: 'fuzzy' })
      }
    }

    // Also search within definitions if under 5 word-level hits
    if (results.length < 5) {
      for (const def of allDefs) {
        if (!results.some((r) => r.word === def.word) && def.definition.toLowerCase().includes(q)) {
          results.push({ word: def.word, definition: def.definition, category: def.category, matchType: 'contains' })
        }
      }
    }

    const typeOrder: Record<string, number> = { prefix: 0, contains: 1, fuzzy: 2 }
    const seen = new Set<string>()
    const deduped: SearchResult[] = []
    for (const r of results) {
      const k = r.word.toLowerCase()
      if (!seen.has(k)) { seen.add(k); deduped.push(r) }
    }
    return deduped.sort((a, b) => (typeOrder[a.matchType] ?? 3) - (typeOrder[b.matchType] ?? 3)).slice(0, 50)
  } catch { return [] }
}

// ── 5. Category Browser ────────────────────────────────────────────────────

/**
 * Browse all words in a given category with full dictionary data.
 */
export function browseByCategory(category: string): CategoryBrowserResult | null {
  try {
    if (!category || typeof category !== 'string') return null
    const cat = category.toLowerCase() as WordCategory
    if (!ALL_CATEGORIES.includes(cat)) return null
    const info = getCategoryInfo(cat)
    const categoryDefs = getAllDefinitions().filter((d) => d.category === cat)
    const favs = loadFavorites()
    return {
      category: cat, label: info.label, color: info.color, emoji: info.emoji,
      entries: categoryDefs.map((d) => buildDictionaryEntry(d.word, favs)),
    }
  } catch { return null }
}

/**
 * Get all available categories with metadata and word counts.
 */
export function getAllCategories(): { category: string; label: string; color: string; emoji: string; wordCount: number }[] {
  try {
    const allDefs = getAllDefinitions()
    return ALL_CATEGORIES.map((cat) => {
      const info = getCategoryInfo(cat)
      return { category: cat, label: info.label, color: info.color, emoji: info.emoji,
        wordCount: allDefs.filter((d) => d.category === cat).length }
    }).filter((c) => c.wordCount > 0)
  } catch { return [] }
}

// ── 6. Pronunciation Control ───────────────────────────────────────────────

/**
 * Speak a word with error handling, history tracking, and a structured result.
 */
export function speakWord(word: string, rate: number = 1.0): SpeakResult {
  try {
    if (!word || typeof word !== 'string') return { success: false, error: 'Invalid word', word: word ?? '', supported: false }
    const trimmed = word.trim()
    if (!trimmed) return { success: false, error: 'Empty word', word: '', supported: false }
    if (!isSpeechSupported()) return { success: false, error: 'Speech synthesis not supported', word: trimmed, supported: false }
    pronounceWord(trimmed, rate)
    recordLookup(trimmed.toLowerCase())
    return { success: true, error: null, word: trimmed, supported: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error', word: word ?? '', supported: false }
  }
}

/** Stop any ongoing speech synthesis. */
export function stopSpeaking(): void { try { stopSpeech() } catch { /* noop */ } }

// ── 7. Recent Lookups ───────────────────────────────────────────────────────

/**
 * Returns recently looked-up words with timestamps and dictionary data.
 * @param count Maximum number of lookups to return (default 20)
 */
export function getRecentLookups(count: number = 20): (RecentLookup & { entry: DictionaryEntry | null })[] {
  try {
    const favs = loadFavorites()
    return loadLookups().slice(0, count).map((l) => ({ ...l, entry: buildDictionaryEntry(l.word, favs) }))
  } catch { return [] }
}

/** Clear all recent lookup history. */
export function clearRecentLookups(): void { try { persistLookups([]) } catch { /* noop */ } }

// ── 8. Word Stats ──────────────────────────────────────────────────────────

/**
 * Returns comprehensive statistics about the dictionary.
 */
export function getDictionaryStats(): DictionaryStats {
  try {
    const allDefs = getAllDefinitions()
    const allWords = getAllWords()
    const catSet = new Set(allDefs.map((d) => d.category))
    const categoriesCovered = Array.from(catSet).map((cat) => {
      let info: { label: string; color: string; emoji: string }
      try { info = getCategoryInfo(cat as WordCategory) } catch { info = { label: cat, color: '#6b7280', emoji: '📖' } }
      return { category: cat, ...info, wordCount: allDefs.filter((d) => d.category === cat).length }
    })
    let totalSentences = 0
    for (const def of allDefs) totalSentences += getWordSentences(def.word).length
    return {
      totalWords: getTotalWordCount(), totalCategories: catSet.size, categoriesCovered,
      averageDefinitionsPerWord: allWords.length > 0 ? parseFloat((allDefs.length / allWords.length).toFixed(2)) : 0,
      totalSentencesAvailable: totalSentences,
      favoriteCount: loadFavorites().size, totalLookups: loadLookups().length,
    }
  } catch {
    return { totalWords: 0, totalCategories: 0, categoriesCovered: [], averageDefinitionsPerWord: 0,
      totalSentencesAvailable: 0, favoriteCount: 0, totalLookups: 0 }
  }
}

// ── 9. Favorites ────────────────────────────────────────────────────────────

/**
 * Toggle a word as a favorite. Returns the updated favorite status (true = now favorited).
 */
export function toggleFavorite(word: string): boolean {
  try {
    if (!word || typeof word !== 'string') return false
    const trimmed = word.trim().toLowerCase()
    if (!trimmed) return false
    const favs = loadFavorites()
    if (favs.has(trimmed)) {
      favs.delete(trimmed)
    } else {
      favs.add(trimmed)
    }
    persistFavorites(favs)
    return favs.has(trimmed)
  } catch { return false }
}

/** Get all favorited words with full dictionary data, sorted alphabetically. */
export function getFavorites(): DictionaryEntry[] {
  try {
    const favs = loadFavorites()
    if (favs.size === 0) return []
    const results: DictionaryEntry[] = []
    for (const word of favs) {
      const entry = buildDictionaryEntry(word, favs)
      if (entry.definition) results.push(entry)
    }
    return results.sort((a, b) => a.word.localeCompare(b.word))
  } catch { return [] }
}

/** Check if a specific word is favorited. */
export function isFavorite(word: string): boolean {
  try { return !!word && loadFavorites().has(word.trim().toLowerCase()) } catch { return false }
}

/** Remove all favorites. */
export function clearFavorites(): void { try { persistFavorites(new Set()) } catch { /* noop */ } }

// ── 10. Quiz Mode ───────────────────────────────────────────────────────────

/**
 * Generate quiz questions where users match words to definitions or vice versa.
 * Each question has 4 multiple-choice options. Alternates quiz type.
 * @param count Number of questions to generate (default 5, max 20)
 */
export function generateDefinitionQuiz(count: number = 5): QuizQuestion[] {
  try {
    const safeCount = Math.min(Math.max(1, Math.round(count)), 20)
    const allDefs = getAllDefinitions()
    if (allDefs.length < 4) return []

    // Shuffle definitions
    const shuffled = [...allDefs]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const questions: QuizQuestion[] = []
    const usedWords = new Set<string>()

    for (const def of shuffled) {
      if (questions.length >= safeCount) break
      if (usedWords.has(def.word)) continue
      usedWords.add(def.word)

      const quizType: QuizQuestionType = questions.length % 2 === 0 ? 'word-to-definition' : 'definition-to-word'
      let prompt: string, options: string[], correctIndex: number

      if (quizType === 'word-to-definition') {
        prompt = `What is the definition of "${def.word}"?`
        const wrongs = allDefs.filter((d) => d.word !== def.word).sort(() => Math.random() - 0.5).slice(0, 3).map((d) => d.definition)
        if (wrongs.length < 3) continue
        const allOpts = [def.definition, ...wrongs]
        for (let i = allOpts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]] }
        options = allOpts
        correctIndex = options.indexOf(def.definition)
      } else {
        prompt = `Which word matches this definition?\n"${def.definition}"`
        const wrongs = allDefs.filter((d) => d.word !== def.word && !usedWords.has(d.word)).sort(() => Math.random() - 0.5).slice(0, 3).map((d) => d.word)
        if (wrongs.length < 3) continue
        const allOpts = [def.word, ...wrongs]
        for (let i = allOpts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]] }
        options = allOpts
        correctIndex = options.indexOf(def.word)
      }

      if (correctIndex === -1) correctIndex = 0
      questions.push({
        prompt, options, correctIndex,
        correctAnswer: quizType === 'word-to-definition' ? def.definition : def.word,
        word: def.word, type: quizType,
      })
    }
    return questions
  } catch { return [] }
}

// ── Bonus conveniences ──────────────────────────────────────────────────────

/** Get the sentence of the day with its word's full dictionary entry. */
export function getSentenceOfTheDayWithEntry(): { sentence: WordSentence; entry: DictionaryEntry | null } {
  try {
    const sentence = getSentenceOfTheDay()
    const favs = loadFavorites()
    return { sentence, entry: buildDictionaryEntry(sentence.word, favs) }
  } catch {
    return { sentence: { word: 'welcome', sentence: 'Welcome to the Word Snake dictionary!', category: 'general', difficulty: 'easy' }, entry: null }
  }
}

/** Look up multiple words at once. */
export function batchLookup(words: string[]): DictionaryEntry[] {
  try {
    if (!Array.isArray(words)) return []
    const favs = loadFavorites()
    return words.filter((w) => typeof w === 'string' && w.trim()).map((w) => buildDictionaryEntry(w.trim().toLowerCase(), favs))
  } catch { return [] }
}
