'use client'

// ─── External imports ─────────────────────────────────────────────────────────
import {
  getFavoritePoems,
  addFavoritePoem,
  removeFavoritePoem,
  isFavoritePoem,
  type FavoritePoem,
} from '@/lib/poem-favorites'

import {
  COLLAGE_LAYOUTS,
  generatePoemCollage,
  getCollagePoemSources,
  type PoemCollageItem,
  type CollageLayout,
} from '@/lib/poem-collage'

import {
  generateShareImage,
  sharePoem as sharePoemBlob,
} from '@/lib/poem-share'

// ─── Constants ────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'ws_poem_studio_history'
const MAX_HISTORY = 100

// ─── Type definitions ─────────────────────────────────────────────────────────

export type PoemStyleId = 'free_verse' | 'haiku' | 'acrostic' | 'rhyming_couplet'

export interface PoemEntry {
  poem: string
  usedWords: string[]
  timestamp: number
  style: PoemStyleId
  wordCount: number
}

export interface PoemStats {
  totalPoems: number
  totalFavorites: number
  mostUsedStyle: { style: string; count: number } | null
  wordDiversity: number
  totalUniqueWords: number
  styleBreakdown: Record<string, number>
  averageWordsPerPoem: number
}

export interface WordCloudItem {
  word: string
  count: number
  tier: 'common' | 'uncommon' | 'rare'
}

export interface StyleTemplate {
  id: PoemStyleId
  name: string
  description: string
  example: string
  syllableHint: string
  minWords: number
  maxWords: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface DailyChallenge {
  date: string
  words: string[]
  bonusWord: string
  theme: string
  hint: string
}

export interface SearchResult {
  entry: PoemEntry
  matchType: 'content' | 'word' | 'style'
  relevanceScore: number
}

// ─── Style templates ──────────────────────────────────────────────────────────

const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'free_verse', name: 'Free Verse',
    description: 'Unbound by meter or rhyme — let your words flow like a river of thought.',
    example: 'The morning light slips\nthrough half-closed blinds,\ncasting long amber shadows\nwhere dust motes dance.',
    syllableHint: 'No strict count — focus on imagery and emotion',
    minWords: 3, maxWords: 12, difficulty: 'easy',
  },
  {
    id: 'haiku', name: 'Haiku',
    description: 'A traditional Japanese form: three lines with 5-7-5 syllable pattern.',
    example: 'Cherry blossoms fall\nfloating on the quiet pond\nspring returns once more',
    syllableHint: '5 syllables — 7 syllables — 5 syllables',
    minWords: 3, maxWords: 8, difficulty: 'medium',
  },
  {
    id: 'acrostic', name: 'Acrostic',
    description: 'Each line begins with the first letter of your words, spelling them vertically.',
    example: 'Sunlight warms the ancient stones\nPetals drift across the stream\nRain whispers through the trees',
    syllableHint: 'Each line starts with a letter from your words',
    minWords: 2, maxWords: 10, difficulty: 'medium',
  },
  {
    id: 'rhyming_couplet', name: 'Rhyming Couplet',
    description: 'Pairs of rhyming lines that bounce your words into rhythmic verse.',
    example: 'The stars above begin to gleam,\na silver river in a dream.',
    syllableHint: 'Pairs of lines where the end words rhyme',
    minWords: 4, maxWords: 10, difficulty: 'hard',
  },
]

// ─── Daily challenge themes ───────────────────────────────────────────────────

const CHALLENGE_THEMES = [
  { theme: 'Morning Light', words: ['dawn', 'gold', 'mist', 'awaken', 'ray', 'glow'], bonusWord: 'sunrise', hint: 'Capture the first moments of a new day' },
  { theme: 'Ocean Dreams', words: ['wave', 'tide', 'deep', 'shore', 'salt', 'drift'], bonusWord: 'current', hint: 'Let the sea carry your imagination' },
  { theme: 'Forest Whispers', words: ['bark', 'fern', 'moss', 'canopy', 'owl', 'trail'], bonusWord: 'ancient', hint: 'Listen to the stories the trees tell' },
  { theme: 'Winter Frost', words: ['ice', 'crystal', 'white', 'fire', 'warmth', 'frost'], bonusWord: 'ember', hint: 'Find warmth in the coldest moments' },
  { theme: 'Garden Bloom', words: ['petal', 'root', 'seed', 'vine', 'color', 'bee'], bonusWord: 'blossom', hint: 'Watch life unfold petal by petal' },
  { theme: 'Star Gazing', words: ['constellation', 'bright', 'orbit', 'meteor', 'dark', 'vast'], bonusWord: 'infinity', hint: 'Look up and wonder at the cosmos' },
  { theme: 'Rain Song', words: ['puddle', 'drum', 'rhythm', 'grey', 'umbrella', 'silver'], bonusWord: 'thunder', hint: 'Find music in the falling rain' },
  { theme: 'Wild River', words: ['rush', 'rapid', 'bend', 'fish', 'rock', 'foam'], bonusWord: 'cascade', hint: 'Follow the untamed current' },
]

// ─── Poem building blocks ─────────────────────────────────────────────────────

const FV_OPENERS = [
  'In the quiet hours', 'Beneath the surface', 'Where light meets shadow',
  'Beyond the horizon', 'Through the open window', 'Between breath and silence',
]
const FV_BRIDGES = ['we find', 'there lives', 'the world holds', 'time reveals', 'nature keeps', 'the wind carries']
const FV_CLOSERS = [
  'a truth too old for words', 'the echo of something beautiful',
  'what silence always meant to say', 'the song the river hums at night',
  'the dance of dust and golden rays', 'a small and perfect kind of grace',
]
const FV_CONNECTORS = ['surrounded by', 'gentle as', 'drifting like', 'rising from', 'woven through']

const HAIKU_L1 = [
  'Soft light on the {0}', 'The {0} gently sways', '{0} beneath the sky',
  'A {0} drifts away', 'Quiet {0} at rest', 'Still the {0} whispers low',
]
const HAIKU_L2 = [
  'floating on a silver stream', 'holding secrets of the earth',
  'waiting for the wind to come', 'dancing in the morning mist',
  'painting colors on the clouds', 'echoing across the hills',
]
const HAIKU_L3 = [
  'the world breathes again', 'all is still and whole',
  'nature finds its way', 'silence speaks the most',
  'beauty lingers on', 'life begins anew',
]

const COUPLET_PAIRS = [
  { t: ['Like {0} upon the {1}', 'the {2} fills the {3}'], r: ['sky', 'eye'] },
  { t: ['The {0} shines so {1}', 'while {2} softly sigh'], r: ['bright', 'night'] },
  { t: ['When {0} meets the {1}', 'a {2} starts to grow'], r: ['rain', 'plain'] },
  { t: ['Beneath the ancient {0}', 'the {1} softly glows'], r: ['tree', 'free'] },
  { t: ['The {0} calls its {1}', 'across the open {2}'], r: ['song', 'long'] },
  { t: ['Where {0} meets the {1}', 'the {2} finds its home'], r: ['shore', 'more'] },
]

const ACROSTIC_STARTERS = [
  'Silent and steady, the world turns', 'Petals unfurl in patient grace',
  'Rivers carve through ancient stone', 'In every ending, a new dawn wakes',
  'Nature writes its own poetry', 'Gold light spills across the meadow',
  'Echoes of tomorrow drift like mist', 'Tides carry whispers from the deep',
  'Horizons paint the sky in wonder', 'Every heartbeat is a small miracle',
]

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadHistory(): PoemEntry[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item: unknown): item is PoemEntry =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as PoemEntry).poem === 'string' &&
        typeof (item as PoemEntry).timestamp === 'number' &&
        typeof (item as PoemEntry).style === 'string',
    )
  } catch {
    return []
  }
}

function saveHistory(entries: PoemEntry[]): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch { /* storage unavailable */ }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function pickN<T>(arr: T[], n: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) }

function todaySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function seededRng(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// ─── Poem generation engines ──────────────────────────────────────────────────

function generateFreeVerse(words: string[]): string {
  if (words.length === 0) return `${pick(FV_OPENERS)}\n${pick(FV_BRIDGES)}\n${pick(FV_CLOSERS)}`

  const lines: string[] = [pick(FV_OPENERS)]

  if (words.length >= 3) {
    const mid = pickN(words.slice(1, -1), Math.min(3, words.length - 2))
    for (const w of mid) lines.push(`${pick(FV_CONNECTORS)} ${w}`)
  }

  lines.push(`${pick(FV_BRIDGES)} the ${words[0]}`)
  lines.push('')
  lines.push(pick(FV_CLOSERS))

  if (words.length > 3) {
    const extras = words.slice(3).slice(0, 3)
    if (extras.length > 0) { lines.push(''); lines.push(`— ${extras.join(' · ')}`) }
  }
  return lines.join('\n')
}

function generateHaiku(words: string[]): string {
  const w0 = words[0] ?? 'world'
  const line1 = pick(HAIKU_L1).replace('{0}', w0)
  const line2 = pick(HAIKU_L2)
  let line3 = pick(HAIKU_L3)
  if (words.length >= 2) line3 = `${words[1]} in the ${line3}`
  return [line1, line2, line3].join('\n')
}

function generateAcrostic(words: string[]): string {
  if (words.length === 0) return 'No words to form an acrostic.'
  const adjectives = ['Quiet', 'Bright', 'Wild', 'Deep', 'Soft', 'Warm', 'Cool', 'Vast', 'Still', 'Bold']
  const nouns = ['forest', 'river', 'mountain', 'ocean', 'meadow', 'valley', 'garden', 'shore', 'canyon', 'field']
  const verbs = ['whispers', 'glows', 'dreams', 'sings', 'waits', 'dances', 'breathes', 'shines', 'flows', 'rests']

  return words.map(w => {
    const letter = w.charAt(0).toUpperCase()
    let line = ACROSTIC_STARTERS.find(s => s.charAt(0) === letter)
    if (!line) {
      const adj = adjectives.find(a => a[0] === letter) ?? pick(adjectives)
      const noun = nouns.find(n => n[0] === letter) ?? pick(nouns)
      const verb = verbs.find(v => v[0] === letter) ?? pick(verbs)
      line = `${adj} ${noun} ${verb}`
    }
    return line.toLowerCase().includes(w.toLowerCase()) ? line : `${line} — ${w}`
  }).join('\n')
}

function generateRhymingCouplet(words: string[]): string {
  if (words.length < 2) {
    const s = words[0] ?? 'the world'
    return `The gentle ${s} softly glows,\nlike starlight on a midnight rose.`
  }

  const filler = ['dream', 'light', 'song', 'wind', 'rain', 'sky', 'sea', 'hope', 'star', 'moon']
  const couplets: string[] = []

  for (let i = 0; i < words.length; i += 2) {
    const w1 = words[i]
    const w2 = words[i + 1] ?? pick(filler)

    if (i === 0) {
      const pair = pick(COUplet_PAIRS)
      const line1 = pair.t[0].replace('{0}', w1).replace('{1}', w2)
      couplets.push(line1)
      couplets.push(`${line1.slice(0, line1.lastIndexOf(' '))} ${pair.r[0]} and ${pair.r[1]}`)
    } else {
      const openers = [`And ${w1} begins to ${w2}`, `While ${w1} meets the ${w2}`, `The ${w1} holds the ${w2}`]
      const closers = ['like flowers in the breeze', 'beneath the fading sun', 'across the silent plain']
      couplets.push(pick(openers) + ',')
      couplets.push(pick(closers) + '.')
    }
    if (couplets.length >= 6) break
  }

  const result: string[] = []
  for (let i = 0; i < couplets.length; i += 2) {
    if (i > 0) result.push('')
    result.push(couplets[i])
    if (i + 1 < couplets.length) result.push(couplets[i + 1])
  }
  return result.join('\n')
}

// ─── 1. Create Poem ───────────────────────────────────────────────────────────

export function createPoem(words: string[], style: PoemStyleId): PoemEntry {
  try {
    const safeWords = Array.isArray(words)
      ? words.filter((w): w is string => typeof w === 'string' && w.trim().length > 0).map(w => w.trim())
      : []

    const validStyles: PoemStyleId[] = ['free_verse', 'haiku', 'acrostic', 'rhyming_couplet']
    const safeStyle: PoemStyleId = validStyles.includes(style) ? style : 'free_verse'

    const generators: Record<PoemStyleId, (w: string[]) => string> = {
      free_verse: generateFreeVerse,
      haiku: generateHaiku,
      acrostic: generateAcrostic,
      rhyming_couplet: generateRhymingCouplet,
    }

    const poem = generators[safeStyle](safeWords)
    const entry: PoemEntry = { poem, usedWords: safeWords, timestamp: Date.now(), style: safeStyle, wordCount: safeWords.length }

    const history = loadHistory()
    history.unshift(entry)
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
    saveHistory(history)
    return entry
  } catch {
    return {
      poem: 'Words gathered, like stars finding their constellation.',
      usedWords: Array.isArray(words) ? words.filter(w => typeof w === 'string') : [],
      timestamp: Date.now(), style: 'free_verse', wordCount: 0,
    }
  }
}

// ─── 2. Poem History ──────────────────────────────────────────────────────────

export function getPoemHistory(): PoemEntry[] {
  try { return loadHistory() } catch { return [] }
}

export function clearPoemHistory(): boolean {
  try { saveHistory([]); return true } catch { return false }
}

export function deletePoemEntry(timestamp: number): boolean {
  try { saveHistory(loadHistory().filter(e => e.timestamp !== timestamp)); return true } catch { return false }
}

// ─── 3. Favorite Management ───────────────────────────────────────────────────

export function addFavorite(timestamp: number): FavoritePoem | null {
  try {
    const entry = loadHistory().find(e => e.timestamp === timestamp)
    if (!entry) return null
    return addFavoritePoem({ poem: entry.poem, usedWords: entry.usedWords, timestamp: entry.timestamp, style: entry.style })
  } catch { return null }
}

export function removeFavorite(timestamp: number): boolean {
  try { removeFavoritePoem(timestamp); return true } catch { return false }
}

export function getFavorites(): FavoritePoem[] {
  try { return getFavoritePoems() } catch { return [] }
}

export function isFavorite(timestamp: number): boolean {
  try { return isFavoritePoem(timestamp) } catch { return false }
}

// ─── 4. Collage Generator ────────────────────────────────────────────────────

export function generateCollagePreview(
  layoutId: string,
  options?: { title?: string; author?: string },
): HTMLCanvasElement | null {
  try {
    const layout = COLLAGE_LAYOUTS.find(l => l.id === layoutId) ?? COLLAGE_LAYOUTS[0]
    const sources = getCollagePoemSources()
    const items: PoemCollageItem[] = sources.favorites.length > 0 ? sources.favorites : sources.recent
    if (items.length === 0) return null
    return generatePoemCollage(items, layout, options)
  } catch { return null }
}

export function getAvailableLayouts(): CollageLayout[] {
  return [...COLLAGE_LAYOUTS]
}

export function downloadCollage(layoutId: string, filename?: string): boolean {
  try {
    const canvas = generateCollagePreview(layoutId)
    if (!canvas) return false
    const link = document.createElement('a')
    link.download = filename ?? `poem-collage-${layoutId}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    return true
  } catch { return false }
}

// ─── 5. Poem Stats ────────────────────────────────────────────────────────────

export function getPoemStats(): PoemStats {
  try {
    const history = loadHistory()
    const favorites = getFavoritePoems()
    const styleBreakdown: Record<string, number> = {}
    const allWords: string[] = []

    for (const e of history) {
      styleBreakdown[e.style] = (styleBreakdown[e.style] ?? 0) + 1
      allWords.push(...e.usedWords.map(w => w.toLowerCase()))
    }

    let mostUsedStyle: { style: string; count: number } | null = null
    for (const [s, c] of Object.entries(styleBreakdown)) {
      if (!mostUsedStyle || c > mostUsedStyle.count) mostUsedStyle = { style: s, count: c }
    }

    const uniqueWords = new Set(allWords)
    const wordDiversity = allWords.length > 0 ? Math.round((uniqueWords.size / allWords.length) * 100) / 100 : 0
    const avg = history.length > 0 ? Math.round(history.reduce((s, e) => s + e.wordCount, 0) / history.length * 10) / 10 : 0

    return {
      totalPoems: history.length,
      totalFavorites: favorites.length,
      mostUsedStyle,
      wordDiversity,
      totalUniqueWords: uniqueWords.size,
      styleBreakdown,
      averageWordsPerPoem: avg,
    }
  } catch {
    return { totalPoems: 0, totalFavorites: 0, mostUsedStyle: null, wordDiversity: 0, totalUniqueWords: 0, styleBreakdown: {}, averageWordsPerPoem: 0 }
  }
}

// ─── 6. Word Cloud ────────────────────────────────────────────────────────────

export function getWordCloud(maxItems?: number): WordCloudItem[] {
  try {
    const freq: Record<string, number> = {}
    for (const e of loadHistory()) {
      for (const w of e.usedWords) {
        const n = w.toLowerCase().trim()
        if (n.length > 0) freq[n] = (freq[n] ?? 0) + 1
      }
    }
    const items: WordCloudItem[] = Object.entries(freq)
      .map(([word, count]) => ({ word, count, tier: count >= 5 ? 'common' as const : count >= 3 ? 'uncommon' as const : 'rare' as const }))
      .sort((a, b) => b.count - a.count)
    return maxItems ? items.slice(0, maxItems) : items
  } catch { return [] }
}

export function getTopWords(n: number): WordCloudItem[] {
  return getWordCloud(n)
}

// ─── 7. Style Templates ──────────────────────────────────────────────────────

export function getStyleTemplates(): StyleTemplate[] {
  return [...STYLE_TEMPLATES]
}

export function getStyleById(id: string): StyleTemplate | null {
  return STYLE_TEMPLATES.find(t => t.id === id) ?? null
}

export function validateWordsForStyle(words: string[], styleId: PoemStyleId): { valid: boolean; message: string } {
  try {
    const tpl = STYLE_TEMPLATES.find(t => t.id === styleId)
    if (!tpl) return { valid: false, message: `Unknown style: ${styleId}` }
    const n = words.length
    if (n < tpl.minWords) return { valid: false, message: `${tpl.name} needs at least ${tpl.minWords} word${tpl.minWords !== 1 ? 's' : ''}, you provided ${n}.` }
    if (n > tpl.maxWords) return { valid: true, message: `${tpl.name} works best with ${tpl.minWords}–${tpl.maxWords} words. Extra words add flavor.` }
    return { valid: true, message: `Perfect! ${n} word${n !== 1 ? 's' : ''} for ${tpl.name}.` }
  } catch { return { valid: false, message: 'Unable to validate words for this style.' } }
}

// ─── 8. Daily Poem Challenge ─────────────────────────────────────────────────

export function getDailyPoemChallenge(): DailyChallenge {
  try {
    const rng = seededRng(todaySeed())
    const themeData = CHALLENGE_THEMES[Math.floor(rng() * CHALLENGE_THEMES.length)]
    const shuffled = [...themeData.words].sort(() => rng() - 0.5)
    const count = 4 + Math.floor(rng() * 3)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    return { date: dateStr, words: selected, bonusWord: themeData.bonusWord, theme: themeData.theme, hint: themeData.hint }
  } catch {
    return {
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      words: ['light', 'dream', 'time', 'star'], bonusWord: 'wonder', theme: 'Daily Inspiration',
      hint: 'Let these words guide your creativity today',
    }
  }
}

export function isChallengeCompleted(challengeWords: string[]): boolean {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const challengeSet = new Set(challengeWords.map(w => w.toLowerCase()))
    return loadHistory()
      .filter(e => e.timestamp >= todayStart.getTime())
      .some(e => e.usedWords.some(w => challengeSet.has(w.toLowerCase())))
  } catch { return false }
}

// ─── 9. Share Poem ────────────────────────────────────────────────────────────

export type SharePlatform = 'native' | 'twitter' | 'copy' | 'download'

export async function sharePoemText(timestamp: number, platform: SharePlatform = 'native'): Promise<boolean> {
  try {
    const entry = loadHistory().find(e => e.timestamp === timestamp)
    if (!entry) return false
    const label = STYLE_TEMPLATES.find(t => t.id === entry.style)?.name ?? entry.style

    if (platform === 'download') {
      const blob = await generateShareImage(entry.poem, label, entry.usedWords)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `poem-${entry.style}-${entry.timestamp}.png`
      link.href = url; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return true
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${entry.poem}\n\n— Word Snake Poem (${label})\nWords: ${entry.usedWords.join(', ')}`)
      return true
    }

    if (platform === 'twitter') {
      const short = entry.poem.split('\n').slice(0, 4).join('\n')
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${short}\n\n✨ Created with Word Snake\n#${label.replace(/\s+/g, '')}Poem #WordSnake`)}`, '_blank', 'noopener,noreferrer')
      return true
    }

    const blob = await generateShareImage(entry.poem, label, entry.usedWords)
    await sharePoemBlob(blob)
    return true
  } catch { return false }
}

// ─── 10. Poem Search ──────────────────────────────────────────────────────────

export function searchPoems(query: string): SearchResult[] {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) return []
    const history = loadHistory()
    if (history.length === 0) return []

    const q = query.toLowerCase().trim()
    const qWords = q.split(/\s+/)
    const results: SearchResult[] = []

    for (const entry of history) {
      const lower = entry.poem.toLowerCase()

      // Content match
      if (lower.includes(q)) {
        results.push({ entry, matchType: 'content', relevanceScore: Math.max(1, 10 - Math.floor(lower.indexOf(q) / 50)) })
        continue
      }

      // Word match
      const matched = entry.usedWords.filter(w => w.toLowerCase().includes(q) || q.includes(w.toLowerCase()))
      if (matched.length > 0) {
        results.push({ entry, matchType: 'word', relevanceScore: matched.length * 3 })
        continue
      }

      // Style match
      if (entry.style.toLowerCase().includes(q)) {
        results.push({ entry, matchType: 'style', relevanceScore: 1 })
        continue
      }

      // Partial content match (any query word in poem)
      const partial = qWords.some(w => w.length >= 2 && lower.includes(w))
      if (partial) results.push({ entry, matchType: 'content', relevanceScore: 1 })
    }

    return results
      .sort((a, b) => b.relevanceScore !== a.relevanceScore ? b.relevanceScore - a.relevanceScore : b.entry.timestamp - a.entry.timestamp)
      .slice(0, 50)
  } catch { return [] }
}

export function searchByStyle(styleId: PoemStyleId): PoemEntry[] {
  try { return loadHistory().filter(e => e.style === styleId) } catch { return [] }
}

export function searchByDateRange(from: number, to: number): PoemEntry[] {
  try { return loadHistory().filter(e => e.timestamp >= from && e.timestamp <= to) } catch { return [] }
}

// ─── Bonus: Poem refinement ───────────────────────────────────────────────────

export function regeneratePoem(timestamp: number): PoemEntry | null {
  try {
    const entry = loadHistory().find(e => e.timestamp === timestamp)
    return entry ? createPoem(entry.usedWords, entry.style) : null
  } catch { return null }
}

export function rewritePoemInStyle(timestamp: number, newStyle: PoemStyleId): PoemEntry | null {
  try {
    const entry = loadHistory().find(e => e.timestamp === timestamp)
    return entry ? createPoem(entry.usedWords, newStyle) : null
  } catch { return null }
}

export function getPoemByTimestamp(timestamp: number): PoemEntry | null {
  try { return loadHistory().find(e => e.timestamp === timestamp) ?? null } catch { return null }
}
