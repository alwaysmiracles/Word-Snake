// ─── Word Art Gallery Wire ─────────────────────────────────────────────────────
// Transforms collected words into decorative visual art pieces and manages
// an art gallery. Standalone module — no class, just exported functions.
// localStorage key: ws_word_art_gallery

// ─── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_word_art_gallery'
const ALBUMS_KEY = 'ws_word_art_albums'
const MAX_GALLERY = 500
const RAINBOW_COLORS = ['#e6194b', '#f58231', '#ffe119', '#3cb44b', '#4363d8', '#911eb4', '#f032e6']

const THEME_PALETTES: Record<ArtTheme, string[]> = {
  classic: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'],
  dark:    ['#0d0d0d', '#1a1a1a', '#2d2d2d', '#444444', '#666666'],
  pastel:  ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff'],
  neon:    ['#ff00ff', '#00ffff', '#ff0080', '#80ff00', '#ffff00', '#ff4500'],
  retro:   ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#f4f1de'],
  nature:  ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
  ocean:   ['#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4'],
  sunset:  ['#ff6b6b', '#ee5a24', '#f9ca24', '#f0932b', '#eb4d4b'],
}

const FRAME_STYLES: Record<FrameStyle, { top: string; bottom: string; side: string }> = {
  none:     { top: '', bottom: '', side: '' },
  simple:   { top: '─', bottom: '─', side: '│' },
  ornate:   { top: '═', bottom: '═', side: '║' },
  minimal:  { top: '···', bottom: '···', side: '·' },
  polaroid: { top: '▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔', bottom: '▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁', side: ' ' },
  stamp:    { top: '|████████████████████|', bottom: '|████████████████████|', side: '█' },
  ticket:   { top: '┌────────────────────┐', bottom: '└────────────────────┘', side: '│' },
}

// ─── Type definitions ──────────────────────────────────────────────────────────

export type ArtStyle =
  | 'banner' | 'wave' | 'spiral' | 'grid' | 'tower'
  | 'rainbow' | 'pixel' | 'neon' | 'minimal'

export type ArtTheme =
  | 'classic' | 'dark' | 'pastel' | 'neon' | 'retro' | 'nature' | 'ocean' | 'sunset'

export type FrameStyle =
  | 'none' | 'simple' | 'ornate' | 'minimal' | 'polaroid' | 'stamp' | 'ticket'

export interface ArtData {
  id: string
  content: string
  style: ArtStyle
  words: string[]
  theme: ArtTheme
  frame: FrameStyle
  category: string
  title: string
  width: number
  height: number
  createdAt: number
  ratings: number[]
  isFavorite: boolean
}

export interface Album {
  id: string
  name: string
  description: string
  artIds: string[]
  createdAt: number
  updatedAt: number
}

export interface GalleryStats {
  totalItems: number
  byStyle: Record<string, number>
  byCategory: Record<string, number>
  avgRating: number
  oldestItem: number | null
  newestItem: number | null
}

export interface MilestoneResult {
  milestone: boolean
  message: string
  suggestedStyle: ArtStyle
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadGallery(): ArtData[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item: unknown): item is ArtData =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as ArtData).id === 'string' &&
        typeof (item as ArtData).content === 'string' &&
        typeof (item as ArtData).style === 'string',
    )
  } catch {
    return []
  }
}

function saveGallery(items: ArtData[]): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_GALLERY)))
  } catch { /* storage unavailable */ }
}

function loadAlbums(): Album[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(ALBUMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item: unknown): item is Album =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as Album).id === 'string' &&
        Array.isArray((item as Album).artIds),
    )
  } catch {
    return []
  }
}

function saveAlbums(albums: Album[]): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
  } catch { /* storage unavailable */ }
}

function generateId(): string {
  return `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── 1. Word Art Generation ────────────────────────────────────────────────────

function padLine(text: string, width: number): string {
  const half = Math.max(0, Math.floor((width - text.length) / 2))
  return ' '.repeat(half) + text + ' '.repeat(Math.max(0, width - text.length - half))
}

function generateBannerArt(words: string[]): string {
  const display = words.slice(0, 5).map(w => w.toUpperCase()).join('  ')
  const width = Math.max(display.length + 4, 40)
  const top = '╔' + '═'.repeat(width - 2) + '╗'
  const bot = '╚' + '═'.repeat(width - 2) + '╝'
  const mid = '║' + padLine(display, width - 2) + '║'
  const deco = '║' + padLine('★ WORD SNAKE ★', width - 2) + '║'
  const lines = words.map(w => '║' + padLine(w, width - 2) + '║')
  return [top, deco, '╠' + '═'.repeat(width - 2) + '╣', mid, '╠' + '═'.repeat(width - 2) + '╣', ...lines, bot].join('\n')
}

function generateWaveArt(words: string[]): string {
  const lines: string[] = []
  const maxLen = 60
  for (let row = 0; row < Math.min(words.length, 12); row++) {
    const word = words[row] ?? '·'
    const indent = Math.round(Math.sin(row * 0.8) * 8)
    const padding = Math.abs(indent)
    const tilde = indent >= 0 ? '～' : '〰'
    const spaces = ' '.repeat(padding)
    const prefix = row % 2 === 0 ? '~ ' : '  '
    lines.push(spaces + prefix + tilde.repeat(Math.max(1, 3 - Math.abs(indent) / 4)) + ' ' + word)
  }
  return lines.join('\n')
}

function generateSpiralArt(words: string[]): string {
  const size = Math.min(21, Math.max(9, words.length + 6))
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill('  '))
  let top = 0, bottom = size - 1, left = 0, right = size - 1
  let idx = 0
  while (top <= bottom && left <= right && idx < words.length) {
    for (let x = left; x <= right && idx < words.length; x++) grid[top][x] = words[idx++].padEnd(2).slice(0, 2)
    top++
    for (let y = top; y <= bottom && idx < words.length; y++) grid[y][right] = words[idx++].padEnd(2).slice(0, 2)
    right--
    if (top <= bottom) {
      for (let x = right; x >= left && idx < words.length; x--) grid[bottom][x] = words[idx++].padEnd(2).slice(0, 2)
      bottom--
    }
    if (left <= right) {
      for (let y = bottom; y >= top && idx < words.length; y--) grid[y][left] = words[idx++].padEnd(2).slice(0, 2)
      left++
    }
  }
  return grid.map(row => row.join(' ')).join('\n')
}

function generateGridArt(words: string[]): string {
  const cols = 4
  const colWidth = 14
  const rows: string[] = []
  const chunks: string[][] = []
  for (let i = 0; i < words.length; i += cols) {
    chunks.push(words.slice(i, i + cols))
  }
  for (const chunk of chunks) {
    const top = '┌' + chunk.map(() => '─'.repeat(colWidth)).join('┬') + '┐'
    const mid = '├' + chunk.map(() => '─'.repeat(colWidth)).join('┼') + '┤'
    const cells = '│' + chunk.map(w => padLine(w, colWidth)).join('│') + '│'
    const bot = '└' + chunk.map(() => '─'.repeat(colWidth)).join('┴') + '┘'
    rows.push(top, cells, bot)
    rows.push('')
  }
  return rows.join('\n').trim()
}

function generateTowerArt(words: string[]): string {
  const maxWordLen = Math.max(...words.map(w => w.length), 4)
  const lines: string[] = []
  const sorted = [...words].sort((a, b) => a.length - b.length)
  for (let i = 0; i < sorted.length; i++) {
    const word = sorted[i]
    const brickW = Math.max(word.length + 2, 6)
    const indent = Math.floor((40 - brickW) / 2)
    const top = ' '.repeat(indent) + '┌' + '─'.repeat(brickW) + '┐'
    const mid = ' '.repeat(indent) + '│' + padLine(word, brickW) + '│'
    const bot = ' '.repeat(indent) + '└' + '─'.repeat(brickW) + '┘'
    lines.push(top, mid, bot)
  }
  return lines.join('\n')
}

function generateRainbowArt(words: string[]): string {
  return words.map((word, i) => {
    const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length]
    const bar = '▓'.repeat(word.length + 4)
    return `${color}|${bar}| ${word.toUpperCase()} ${bar}|`
  }).join('\n')
}

function generatePixelArt(words: string[]): string {
  const lines: string[] = []
  const allLetters = words.join('').toUpperCase()
  const width = 16
  const pixelGrid: string[][] = Array.from({ length: 6 }, () => Array(width).fill('░'))
  let x = 0
  for (const ch of allLetters.slice(0, 20)) {
    if (x >= width) break
    pixelGrid[1][x] = '▓'; pixelGrid[2][x] = '▓'; pixelGrid[3][x] = '▓'; pixelGrid[4][x] = '▓'
    pixelGrid[0][x] = '▒'; pixelGrid[5][x] = '▒'
    x++
  }
  lines.push('┌' + '─'.repeat(width * 2) + '┐')
  for (const row of pixelGrid) {
    lines.push('│' + row.map(c => c + c).join(' ') + '│')
  }
  lines.push('└' + '─'.repeat(width * 2) + '┘')
  lines.push(words.slice(0, 4).join(' · '))
  return lines.join('\n')
}

function generateNeonArt(words: string[]): string {
  const text = words.slice(0, 3).map(w => w.toUpperCase()).join(' ✦ ')
  const width = Math.max(text.length + 6, 30)
  const glow1 = '  ░' + '░'.repeat(width) + '░'
  const glow2 = '  ▒' + '▒'.repeat(width) + '▒'
  const glow3 = '  █' + '█'.repeat(width) + '█'
  const center = '  ║' + padLine(text, width) + '║'
  return [glow1, glow2, glow3, center, glow3, glow2, glow1].join('\n')
}

function generateMinimalArt(words: string[]): string {
  const lines: string[] = ['']
  lines.push(words.slice(0, 8).map(w => `  ${w}`).join('\n'))
  lines.push('')
  lines.push('  ─── ' + words.length + ' word' + (words.length !== 1 ? 's' : '') + ' collected ───')
  return lines.join('\n')
}

export function generateWordArt(words: string[], style: ArtStyle): string {
  try {
    const safe = Array.isArray(words)
      ? words.filter((w): w is string => typeof w === 'string' && w.trim().length > 0).map(w => w.trim())
      : []
    if (safe.length === 0) return '(no words to display)'
    const generators: Record<ArtStyle, (w: string[]) => string> = {
      banner: generateBannerArt,
      wave: generateWaveArt,
      spiral: generateSpiralArt,
      grid: generateGridArt,
      tower: generateTowerArt,
      rainbow: generateRainbowArt,
      pixel: generatePixelArt,
      neon: generateNeonArt,
      minimal: generateMinimalArt,
    }
    return generators[style]?.(safe) ?? generateMinimalArt(safe)
  } catch {
    return '(error generating art)'
  }
}

export function generateWordCloud(words: string[]): string {
  try {
    const freq: Record<string, number> = {}
    for (const w of words) {
      const key = w.toLowerCase().trim()
      if (key) freq[key] = (freq[key] ?? 0) + 1
    }
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30)
    const maxSize = 8
    const minSize = 1
    const maxCount = sorted[0]?.[1] ?? 1
    const cloudWords = sorted.map(([word, count]) => ({
      word,
      size: count === maxCount ? maxSize : Math.max(minSize, Math.round((count / maxCount) * maxSize)),
      padding: Math.max(0, (maxSize - count) * 2),
    }))
    const lines: string[] = ['╔══════════════ WORD CLOUD ══════════════╗']
    let currentLine = '  '
    const maxCol = 52
    for (const item of cloudWords) {
      const entry = ' '.repeat(item.padding) + item.word
      if (currentLine.length + entry.length > maxCol) {
        lines.push(currentLine)
        currentLine = '  '
      }
      currentLine += entry + '  '
    }
    if (currentLine.trim()) lines.push(currentLine)
    lines.push('╚═══════════════════════════════════════╝')
    return lines.join('\n')
  } catch {
    return '(error generating word cloud)'
  }
}

export function generateTypoArt(word: string): string {
  try {
    const w = (word ?? '').trim().toUpperCase()
    if (!w) return '(empty word)'
    const lines: string[] = []
    const big = w.split('').map(ch => `┌─┐\n│${ch}│\n└─┘`)
    const rows = w.length
    for (let r = 0; r < 3; r++) {
      const parts: string[] = []
      for (let c = 0; c < rows; c++) {
        const block = big[c]?.split('\n') ?? ['  ', '  ', '  ']
        parts.push(block[r] ?? '  ')
      }
      lines.push(parts.join(' '))
    }
    lines.push('')
    lines.push('  ◆ ' + w + ' ◆')
    lines.push('  ' + '━'.repeat(w.length * 4 + 2))
    return lines.join('\n')
  } catch {
    return '(error generating typo art)'
  }
}

export function generateCollectionBanner(category: string): string {
  try {
    const cat = category ?? 'General'
    const width = 50
    const lines: string[] = []
    lines.push('╔' + '═'.repeat(width) + '╗')
    lines.push('║' + padLine(`✦ ${cat.toUpperCase()} COLLECTION ✦`, width) + '║')
    lines.push('╠' + '═'.repeat(width) + '╣')
    lines.push('║' + padLine('Words gathered on your journey', width) + '║')
    lines.push('║' + padLine('through the Word Snake', width) + '║')
    lines.push('╚' + '═'.repeat(width) + '╝')
    return lines.join('\n')
  } catch {
    return '(error generating banner)'
  }
}

// ─── 2. Gallery Management ─────────────────────────────────────────────────────

export function saveArtToGallery(artData: Partial<ArtData> & { content: string; style: ArtStyle; words: string[] }): ArtData | null {
  try {
    const item: ArtData = {
      id: artData.id ?? generateId(),
      content: artData.content,
      style: artData.style,
      words: Array.isArray(artData.words) ? artData.words : [],
      theme: artData.theme ?? 'classic',
      frame: artData.frame ?? 'none',
      category: artData.category ?? 'general',
      title: artData.title ?? `Art #${Date.now()}`,
      width: artData.width ?? 40,
      height: artData.height ?? 10,
      createdAt: artData.createdAt ?? Date.now(),
      ratings: Array.isArray(artData.ratings) ? artData.ratings : [],
      isFavorite: artData.isFavorite ?? false,
    }
    const gallery = loadGallery()
    gallery.unshift(item)
    saveGallery(gallery)
    return item
  } catch {
    return null
  }
}

export function getGallery(): ArtData[] {
  try {
    return loadGallery().sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function getGalleryItem(id: string): ArtData | null {
  try {
    return loadGallery().find(item => item.id === id) ?? null
  } catch {
    return null
  }
}

export function deleteGalleryItem(id: string): boolean {
  try {
    const gallery = loadGallery().filter(item => item.id !== id)
    saveGallery(gallery)
    // Also remove from albums
    const albums = loadAlbums().map(a => ({
      ...a,
      artIds: a.artIds.filter(aid => aid !== id),
    }))
    saveAlbums(albums)
    return true
  } catch {
    return false
  }
}

export function getGalleryCount(): number {
  try {
    return loadGallery().length
  } catch {
    return 0
  }
}

export function getRecentArt(count: number = 10): ArtData[] {
  try {
    const safeCount = Math.max(1, Math.min(count, 100))
    return loadGallery().sort((a, b) => b.createdAt - a.createdAt).slice(0, safeCount)
  } catch {
    return []
  }
}

// ─── 3. Art Categories & Filtering ─────────────────────────────────────────────

export function getArtByStyle(style: string): ArtData[] {
  try {
    return loadGallery().filter(item => item.style === style)
  } catch {
    return []
  }
}

export function getArtByCategory(wordCategory: string): ArtData[] {
  try {
    return loadGallery().filter(item => item.category === wordCategory)
  } catch {
    return []
  }
}

export function getArtByDateRange(start: number, end: number): ArtData[] {
  try {
    return loadGallery().filter(
      item => item.createdAt >= start && item.createdAt <= end,
    )
  } catch {
    return []
  }
}

export function getFeaturedArt(): ArtData[] {
  try {
    const gallery = loadGallery()
    if (gallery.length <= 3) return gallery
    const shuffled = [...gallery].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(5, gallery.length))
  } catch {
    return []
  }
}

export function getGalleryStats(): GalleryStats {
  try {
    const gallery = loadGallery()
    const byStyle: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    let totalRating = 0
    let ratingCount = 0

    for (const item of gallery) {
      byStyle[item.style] = (byStyle[item.style] ?? 0) + 1
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1
      if (item.ratings.length > 0) {
        totalRating += item.ratings.reduce((s, r) => s + r, 0)
        ratingCount += item.ratings.length
      }
    }

    const sorted = [...gallery].sort((a, b) => a.createdAt - b.createdAt)
    return {
      totalItems: gallery.length,
      byStyle,
      byCategory,
      avgRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
      oldestItem: sorted[0]?.createdAt ?? null,
      newestItem: sorted[sorted.length - 1]?.createdAt ?? null,
    }
  } catch {
    return { totalItems: 0, byStyle: {}, byCategory: {}, avgRating: 0, oldestItem: null, newestItem: null }
  }
}

// ─── 4. Art Rating & Favorites ─────────────────────────────────────────────────

export function rateArt(id: string, rating: number): boolean {
  try {
    const r = Math.max(1, Math.min(5, Math.round(rating)))
    const gallery = loadGallery()
    const item = gallery.find(i => i.id === id)
    if (!item) return false
    item.ratings.push(r)
    saveGallery(gallery)
    return true
  } catch {
    return false
  }
}

export function getAverageRating(id: string): number {
  try {
    const item = loadGallery().find(i => i.id === id)
    if (!item || item.ratings.length === 0) return 0
    return Math.round((item.ratings.reduce((s, r) => s + r, 0) / item.ratings.length) * 10) / 10
  } catch {
    return 0
  }
}

export function toggleFavorite(id: string): boolean {
  try {
    const gallery = loadGallery()
    const item = gallery.find(i => i.id === id)
    if (!item) return false
    item.isFavorite = !item.isFavorite
    saveGallery(gallery)
    return item.isFavorite
  } catch {
    return false
  }
}

export function getFavorites(): ArtData[] {
  try {
    return loadGallery().filter(item => item.isFavorite).sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function getTopRated(count: number = 5): ArtData[] {
  try {
    const safeCount = Math.max(1, Math.min(count, 50))
    return loadGallery()
      .filter(item => item.ratings.length > 0)
      .map(item => ({ item, avg: item.ratings.reduce((s, r) => s + r, 0) / item.ratings.length }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, safeCount)
      .map(e => e.item)
  } catch {
    return []
  }
}

// ─── 5. Auto-Generation Triggers ──────────────────────────────────────────────

export function checkMilestones(wordCount: number, categoryBreakdown: Record<string, number>): MilestoneResult[] {
  try {
    const results: MilestoneResult[] = []
    const multiples = [50, 100, 200, 500, 1000]
    for (const m of multiples) {
      if (wordCount >= m && wordCount % m === 0) {
        results.push({
          milestone: true,
          message: `🎉 ${m} words collected! A magnificent milestone!`,
          suggestedStyle: m >= 500 ? 'banner' : m >= 200 ? 'neon' : m >= 100 ? 'spiral' : 'wave',
        })
      }
    }
    if (categoryBreakdown) {
      for (const [cat, count] of Object.entries(categoryBreakdown)) {
        if (count > 0 && count % 10 === 0) {
          results.push({
            milestone: true,
            message: `📚 Complete set: ${cat} has ${count} words!`,
            suggestedStyle: 'grid',
          })
        }
      }
    }
    if (results.length === 0) {
      results.push({ milestone: false, message: '', suggestedStyle: 'minimal' })
    }
    return results
  } catch {
    return [{ milestone: false, message: '', suggestedStyle: 'minimal' }]
  }
}

export function getAutoArtSuggestion(): { style: ArtStyle; reason: string; words: string[] } | null {
  try {
    const gallery = loadGallery()
    if (gallery.length === 0) {
      return { style: 'minimal', reason: 'Start your gallery with a simple piece!', words: [] }
    }
    const allWords = gallery.flatMap(g => g.words)
    const uniqueWords = Array.from(new Set(allWords.map(w => w.toLowerCase())))
    if (uniqueWords.length >= 10) {
      return { style: 'spiral', reason: `${uniqueWords.length} unique words — try a spiral!`, words: uniqueWords.slice(0, 20) }
    }
    const usedStyles = new Set(gallery.map(g => g.style))
    const allStyles: ArtStyle[] = ['banner', 'wave', 'spiral', 'grid', 'tower', 'rainbow', 'pixel', 'neon', 'minimal']
    const unused = allStyles.find(s => !usedStyles.has(s))
    if (unused) {
      return { style: unused, reason: `You haven't tried the "${unused}" style yet!`, words: uniqueWords.slice(0, 8) }
    }
    return { style: pick(allStyles), reason: 'Try creating something new!', words: uniqueWords.slice(0, 8) }
  } catch {
    return null
  }
}

export function generateAchievementArt(achievement: string): string {
  try {
    const name = (achievement ?? 'Achievement').toUpperCase()
    const width = Math.max(name.length + 8, 40)
    const border = '═'.repeat(width)
    const lines: string[] = []
    lines.push('┏' + border + '┓')
    lines.push('┃' + padLine('🏆 ACHIEVEMENT UNLOCKED 🏆', width) + '┃')
    lines.push('┣' + border + '┫')
    lines.push('┃' + padLine('', width) + '┃')
    lines.push('┃' + padLine(name, width) + '┃')
    lines.push('┃' + padLine('', width) + '┃')
    lines.push('┣' + border + '┫')
    lines.push('┃' + padLine('✨ ' + new Date().toLocaleDateString() + ' ✨', width) + '┃')
    lines.push('┗' + border + '┛')
    return lines.join('\n')
  } catch {
    return '(error generating achievement art)'
  }
}

export function generateStreakArt(streakDays: number): string {
  try {
    const days = Math.max(1, streakDays)
    const flames = '🔥'.repeat(Math.min(days, 20))
    const stars = '⭐'.repeat(Math.min(Math.floor(days / 3), 15))
    const width = 44
    const border = '━'.repeat(width)
    const lines: string[] = []
    lines.push('┏' + border + '┓')
    lines.push('┃' + padLine(`${flames} ${days}-DAY STREAK ${flames}`, width) + '┃')
    lines.push('┃' + padLine(stars, width) + '┃')
    lines.push('┃' + padLine('Keep the fire burning!', width) + '┃')
    lines.push('┗' + border + '┛')
    return lines.join('\n')
  } catch {
    return '(error generating streak art)'
  }
}

// ─── 6. Art Customization ──────────────────────────────────────────────────────

export function getArtThemes(): { id: ArtTheme; name: string; colors: string[] }[] {
  return Object.entries(THEME_PALETTES).map(([id, colors]) => ({
    id: id as ArtTheme,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    colors,
  }))
}

export function applyTheme(artData: ArtData, theme: ArtTheme): ArtData {
  try {
    const palette = THEME_PALETTES[theme] ?? THEME_PALETTES.classic
    const header = `── theme: ${theme} ── colors: ${palette.slice(0, 3).join(', ')} ──`
    const themed = `${header}\n${artData.content}`
    return { ...artData, content: themed, theme }
  } catch {
    return artData
  }
}

export function getFrameStyles(): { id: FrameStyle; name: string; preview: string }[] {
  return (Object.entries(FRAME_STYLES) as [FrameStyle, typeof FRAME_STYLES[FrameStyle]][]).map(([id, f]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    preview: `${f.top}\n${f.side} content ${f.side}\n${f.bottom}`,
  }))
}

export function applyFrame(artData: ArtData, frameStyle: FrameStyle): ArtData {
  try {
    if (frameStyle === 'none') return { ...artData, frame: 'none' }
    const frame = FRAME_STYLES[frameStyle] ?? FRAME_STYLES.simple
    const contentLines = artData.content.split('\n')
    const maxLine = Math.max(...contentLines.map(l => l.length), 20)
    const topW = Math.max(frame.top.length, maxLine + 2)
    const lines: string[] = []
    const topBorder = frame.top === '···' ? '···' + '·'.repeat(topW - 3) : (frame.top.length > 0 ? frame.top.padEnd(topW).slice(0, topW) : '')
    const botBorder = frame.bottom === '···' ? '···' + '·'.repeat(topW - 3) : (frame.bottom.length > 0 ? frame.bottom.padEnd(topW).slice(0, topW) : '')
    if (topBorder) lines.push(topBorder)
    for (const cl of contentLines) {
      const side = frame.side || '│'
      if (side.length > 0) {
        lines.push(side + padLine(cl, topW - (side.length * 2)) + side)
      } else {
        lines.push(cl)
      }
    }
    if (botBorder) lines.push(botBorder)
    return { ...artData, content: lines.join('\n'), frame: frameStyle }
  } catch {
    return artData
  }
}

export function resizeArt(id: string, width: number, height: number): ArtData | null {
  try {
    const gallery = loadGallery()
    const item = gallery.find(i => i.id === id)
    if (!item) return null
    item.width = Math.max(10, width)
    item.height = Math.max(3, height)
    saveGallery(gallery)
    return item
  } catch {
    return null
  }
}

// ─── 7. Art Sharing ────────────────────────────────────────────────────────────

export function generateShareText(id: string): string {
  try {
    const item = loadGallery().find(i => i.id === id)
    if (!item) return '(art not found)'
    const rating = item.ratings.length > 0
      ? ` ★ ${Math.round(item.ratings.reduce((s, r) => s + r, 0) / item.ratings.length * 10) / 10}/5`
      : ''
    return [
      `── Word Snake Art Gallery ──`,
      `Style: ${item.style} | Theme: ${item.theme}`,
      '',
      item.content,
      '',
      `Words: ${item.words.join(', ')}`,
      `Category: ${item.category}${rating}`,
      `Created: ${new Date(item.createdAt).toLocaleDateString()}`,
      '────────────────────────',
    ].join('\n')
  } catch {
    return '(error generating share text)'
  }
}

export function getArtHTML(id: string): string {
  try {
    const item = loadGallery().find(i => i.id === id)
    if (!item) return '<p>Art not found</p>'
    const escaped = item.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return [
      `<div style="font-family:monospace;background:#1a1a2e;color:#e0e0e0;padding:1.5rem;border-radius:8px;max-width:600px;">`,
      `<h3 style="color:#e94560;margin:0 0 0.5rem;">${item.title}</h3>`,
      `<span style="font-size:0.8rem;color:#888;">Style: ${item.style} · Theme: ${item.theme}</span>`,
      `<pre style="white-space:pre-wrap;margin:1rem 0;line-height:1.4;">${escaped}</pre>`,
      `<p style="font-size:0.75rem;color:#666;">Words: ${item.words.join(', ')}</p>`,
      `</div>`,
    ].join('\n')
  } catch {
    return '<p>Error generating HTML</p>'
  }
}

export function downloadArtAsText(id: string): boolean {
  try {
    const text = generateShareText(id)
    if (text.startsWith('(art not found)')) return false
    if (typeof window === 'undefined') return false
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `word-snake-art-${id}-${Date.now()}.txt`
    link.href = url
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch {
    return false
  }
}

export function getShareableArt(count: number = 5): string[] {
  try {
    const safeCount = Math.max(1, Math.min(count, 20))
    const gallery = loadGallery()
      .sort((a, b) => {
        const aScore = (a.ratings.length > 0 ? a.ratings.reduce((s, r) => s + r, 0) / a.ratings.length : 3) + (a.isFavorite ? 2 : 0)
        const bScore = (b.ratings.length > 0 ? b.ratings.reduce((s, r) => s + r, 0) / b.ratings.length : 3) + (b.isFavorite ? 2 : 0)
        return bScore - aScore
      })
    return gallery.slice(0, safeCount).map(item => generateShareText(item.id))
  } catch {
    return []
  }
}

// ─── 8. Art Collections / Albums ───────────────────────────────────────────────

export function createAlbum(name: string, description: string): Album | null {
  try {
    if (!name || typeof name !== 'string' || name.trim().length === 0) return null
    const album: Album = {
      id: `album_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      description: description ?? '',
      artIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const albums = loadAlbums()
    albums.unshift(album)
    saveAlbums(albums)
    return album
  } catch {
    return null
  }
}

export function addToAlbum(artId: string, albumId: string): boolean {
  try {
    const gallery = loadGallery()
    const artExists = gallery.some(i => i.id === artId)
    if (!artExists) return false
    const albums = loadAlbums()
    const album = albums.find(a => a.id === albumId)
    if (!album) return false
    if (album.artIds.includes(artId)) return true
    album.artIds.push(artId)
    album.updatedAt = Date.now()
    saveAlbums(albums)
    return true
  } catch {
    return false
  }
}

export function removeFromAlbum(artId: string, albumId: string): boolean {
  try {
    const albums = loadAlbums()
    const album = albums.find(a => a.id === albumId)
    if (!album) return false
    album.artIds = album.artIds.filter(id => id !== artId)
    album.updatedAt = Date.now()
    saveAlbums(albums)
    return true
  } catch {
    return false
  }
}

export function getAlbums(): (Album & { itemCount: number })[] {
  try {
    const albums = loadAlbums()
    return albums.map(a => ({ ...a, itemCount: a.artIds.length }))
  } catch {
    return []
  }
}

export function getAlbumContent(albumId: string): ArtData[] {
  try {
    const album = loadAlbums().find(a => a.id === albumId)
    if (!album) return []
    const gallery = loadGallery()
    return album.artIds
      .map(id => gallery.find(item => item.id === id))
      .filter((item): item is ArtData => item !== null && item !== undefined)
  } catch {
    return []
  }
}

export function deleteAlbum(albumId: string): boolean {
  try {
    const albums = loadAlbums().filter(a => a.id !== albumId)
    saveAlbums(albums)
    return true
  } catch {
    return false
  }
}

// ─── 9. Art Statistics ─────────────────────────────────────────────────────────

export function getCreationTimeline(): { date: string; count: number }[] {
  try {
    const gallery = loadGallery()
    const buckets: Record<string, number> = {}
    for (const item of gallery) {
      const date = new Date(item.createdAt).toISOString().split('T')[0]
      buckets[date] = (buckets[date] ?? 0) + 1
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  } catch {
    return []
  }
}

export function getMostUsedWordsInArt(): { word: string; count: number }[] {
  try {
    const freq: Record<string, number> = {}
    for (const item of loadGallery()) {
      for (const w of item.words) {
        const key = w.toLowerCase().trim()
        if (key) freq[key] = (freq[key] ?? 0) + 1
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }))
  } catch {
    return []
  }
}

export function getStylePopularity(): { style: string; count: number; percentage: number }[] {
  try {
    const gallery = loadGallery()
    if (gallery.length === 0) return []
    const freq: Record<string, number> = {}
    for (const item of gallery) {
      freq[item.style] = (freq[item.style] ?? 0) + 1
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([style, count]) => ({
        style,
        count,
        percentage: Math.round((count / gallery.length) * 1000) / 10,
      }))
  } catch {
    return []
  }
}

export function getGalleryCompletion(): number {
  try {
    const gallery = loadGallery()
    if (gallery.length === 0) return 0
    const allStyles: ArtStyle[] = ['banner', 'wave', 'spiral', 'grid', 'tower', 'rainbow', 'pixel', 'neon', 'minimal']
    const allThemes: ArtTheme[] = ['classic', 'dark', 'pastel', 'neon', 'retro', 'nature', 'ocean', 'sunset']
    const allFrames: FrameStyle[] = ['none', 'simple', 'ornate', 'minimal', 'polaroid', 'stamp', 'ticket']
    const usedStyles = new Set(gallery.map(g => g.style))
    const usedThemes = new Set(gallery.map(g => g.theme))
    const usedFrames = new Set(gallery.map(g => g.frame))
    const hasFavorites = gallery.some(g => g.isFavorite)
    const hasRatings = gallery.some(g => g.ratings.length > 0)
    const stylePct = usedStyles.size / allStyles.length
    const themePct = usedThemes.size / allThemes.length
    const framePct = usedFrames.size / allFrames.length
    const total = (stylePct + themePct + framePct + (hasFavorites ? 1 : 0) + (hasRatings ? 1 : 0)) / 5
    return Math.round(total * 1000) / 10
  } catch {
    return 0
  }
}

// ─── 10. UI Helpers ────────────────────────────────────────────────────────────

export function getGalleryOverview(): {
  stats: GalleryStats
  recentArt: ArtData[]
  featuredArt: ArtData[]
  completionPct: number
  stylePopularity: { style: string; count: number; percentage: number }[]
} {
  try {
    return {
      stats: getGalleryStats(),
      recentArt: getRecentArt(5),
      featuredArt: getFeaturedArt(),
      completionPct: getGalleryCompletion(),
      stylePopularity: getStylePopularity(),
    }
  } catch {
    return {
      stats: { totalItems: 0, byStyle: {}, byCategory: {}, avgRating: 0, oldestItem: null, newestItem: null },
      recentArt: [],
      featuredArt: [],
      completionPct: 0,
      stylePopularity: [],
    }
  }
}

export interface ArtCard {
  id: string
  title: string
  style: ArtStyle
  theme: ArtTheme
  category: string
  wordCount: number
  preview: string
  avgRating: number
  isFavorite: boolean
  createdAt: number
  createdAtFormatted: string
}

export function getArtCard(id: string): ArtCard | null {
  try {
    const item = loadGallery().find(i => i.id === id)
    if (!item) return null
    const previewLines = item.content.split('\n').slice(0, 3).join(' | ')
    const avgRating = item.ratings.length > 0
      ? Math.round(item.ratings.reduce((s, r) => s + r, 0) / item.ratings.length * 10) / 10
      : 0
    return {
      id: item.id,
      title: item.title,
      style: item.style,
      theme: item.theme,
      category: item.category,
      wordCount: item.words.length,
      preview: previewLines,
      avgRating,
      isFavorite: item.isFavorite,
      createdAt: item.createdAt,
      createdAtFormatted: new Date(item.createdAt).toLocaleDateString(),
    }
  } catch {
    return null
  }
}

export function getCreationSuggestions(count: number = 5): { style: ArtStyle; reason: string; wordsNeeded: number }[] {
  try {
    const gallery = loadGallery()
    const allWords = new Set(gallery.flatMap(g => g.words.map(w => w.toLowerCase())))
    const usedStyles = new Set(gallery.map(g => g.style))
    const allStyles: ArtStyle[] = ['banner', 'wave', 'spiral', 'grid', 'tower', 'rainbow', 'pixel', 'neon', 'minimal']
    const suggestions: { style: ArtStyle; reason: string; wordsNeeded: number }[] = []

    // Suggest unused styles first
    for (const style of allStyles) {
      if (!usedStyles.has(style)) {
        const needed = style === 'spiral' ? 6 : style === 'banner' ? 3 : style === 'grid' ? 4 : 2
        suggestions.push({
          style,
          reason: `Try the "${style}" style — you haven't used it yet!`,
          wordsNeeded: Math.max(needed - allWords.size, 1),
        })
      }
    }

    // Suggest themed collection if many words
    if (allWords.size >= 10 && !usedStyles.has('spiral')) {
      suggestions.push({ style: 'spiral', reason: `${allWords.size} words — perfect for a spiral!`, wordsNeeded: 0 })
    }

    // Suggest neon for special pieces
    if (gallery.length >= 5) {
      suggestions.push({ style: 'neon', reason: 'Create a glowing neon piece from your best words!', wordsNeeded: 3 })
    }

    // Suggest pixel art
    if (!usedStyles.has('pixel')) {
      suggestions.push({ style: 'pixel', reason: 'Retro pixel art — give your words a 8-bit vibe!', wordsNeeded: 2 })
    }

    // Suggest re-creating in a different style if gallery has items
    if (gallery.length > 0 && gallery.length < 5) {
      suggestions.push({ style: 'banner', reason: 'Create a banner to showcase your growing collection!', wordsNeeded: 3 })
    }

    return suggestions.slice(0, Math.max(1, Math.min(count, 10)))
  } catch {
    return []
  }
}

export function getArtPreview(words: string[], style: ArtStyle): { preview: string; dimensions: { width: number; height: number } } {
  try {
    const content = generateWordArt(words, style)
    const lines = content.split('\n')
    const maxWidth = Math.max(...lines.map(l => l.length))
    return {
      preview: lines.slice(0, 5).join('\n') + (lines.length > 5 ? '\n  ...' : ''),
      dimensions: { width: maxWidth, height: lines.length },
    }
  } catch {
    return { preview: '(preview unavailable)', dimensions: { width: 20, height: 5 } }
  }
}
