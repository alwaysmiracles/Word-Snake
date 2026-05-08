'use client'

import { type WordCategory, CATEGORY_COLORS, getAllWords, getWordEntry } from '@/lib/word-pool'

// ── Types & defaults ────────────────────────────────────────────────────────

export type WordBookExportConfig = {
  width: number; height: number; title: string; subtitle: string
  showDefinitions: boolean; showCategories: boolean; showStats: boolean
  theme: 'dark' | 'light' | 'neon'
  columns: number; fontSize: 'small' | 'medium' | 'large'; cardStyle: 'grid' | 'list' | 'compact'
}

export type ExportStats = {
  totalWords: number; categories: Record<string, number>
  rarestWord: string; mostCommonCategory: string; completionPercent: number
}

export const DEFAULT_EXPORT_CONFIG: WordBookExportConfig = {
  width: 1080, height: 1920, title: 'My Word Collection', subtitle: '',
  showDefinitions: false, showCategories: true, showStats: true,
  theme: 'dark', columns: 3, fontSize: 'medium', cardStyle: 'grid',
}

// ── Internals ───────────────────────────────────────────────────────────────

const THEMES = {
  dark:  { bg: '#0f172a', card: '#1e293b', text: '#f8fafc', muted: '#94a3b8' },
  light: { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', muted: '#64748b' },
  neon:  { bg: '#0a0a1a', card: '#12122a', text: '#e0f0ff', muted: '#7b8baa' },
} as const

const CAT_KEYS = Object.keys(CATEGORY_COLORS) as WordCategory[]

const fp = (s: 'small' | 'medium' | 'large') => ({ small: 11, medium: 14, large: 18 })[s]

/** Draw a rounded-rect path (call fill/stroke separately) */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}

// ── Stats ───────────────────────────────────────────────────────────────────

export function calculateExportStats(collectedWords: string[]): ExportStats {
  const pool = getAllWords()
  const cats: Record<string, number> = {}
  for (const w of collectedWords) {
    const cat = getWordEntry(w)?.category ?? 'unknown'
    cats[cat] = (cats[cat] ?? 0) + 1
  }
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1])
  return {
    totalWords: collectedWords.length, categories: cats,
    rarestWord: collectedWords[collectedWords.length - 1] ?? '',
    mostCommonCategory: sorted[0]?.[0] ?? 'nature',
    completionPercent: pool.length ? Math.round((collectedWords.length / pool.length) * 100) : 0,
  }
}

// ── Canvas generation ───────────────────────────────────────────────────────

export function generateWordBookCanvas(
  collectedWords: string[], config?: Partial<WordBookExportConfig>,
): HTMLCanvasElement {
  const c = { ...DEFAULT_EXPORT_CONFIG, ...config }
  const { width, height, title, subtitle, showDefinitions, showCategories, showStats, theme, columns, fontSize, cardStyle } = c
  const t = THEMES[theme], s = fp(fontSize)
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = t.bg; ctx.fillRect(0, 0, width, height)
  if (theme === 'neon') {
    ctx.shadowBlur = 40; ctx.shadowColor = '#6366f1'
    ctx.fillStyle = '#6366f120'; ctx.fillRect(0, 0, width, 4); ctx.shadowBlur = 0
  }

  // Title banner with gradient
  const tH = 120
  const gr = ctx.createLinearGradient(0, 0, width, 0)
  gr.addColorStop(0, '#6366f1'); gr.addColorStop(1, '#ec4899')
  ctx.fillStyle = gr; rr(ctx, 24, 24, width - 48, tH, 16); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = `bold ${s + 16}px system-ui,sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText(title, 48, 24 + tH / 2 - (subtitle ? 14 : 0))
  if (subtitle) {
    ctx.font = `${s}px system-ui,sans-serif`; ctx.globalAlpha = 0.85
    ctx.fillText(subtitle, 48, 24 + tH / 2 + 18); ctx.globalAlpha = 1
  }

  // Stats row
  let y = 24 + tH + 24
  if (showStats) {
    const st = calculateExportStats(collectedWords)
    ctx.font = `${s}px system-ui,sans-serif`; ctx.fillStyle = t.muted
    ctx.fillText(`${st.totalWords} words · ${Object.keys(st.categories).length} categories · ${st.completionPercent}% complete`, 48, y + s)
    y += s * 2 + 12
  }

  // Word cards
  const gap = 12
  const cW = cardStyle === 'list' ? width - 72 : (width - 48 - (columns - 1) * gap) / columns
  const cH = cardStyle === 'compact' ? s * 2.4 : cardStyle === 'list' ? s * 3.6 : s * 4.2

  for (let i = 0; i < collectedWords.length; i++) {
    const word = collectedWords[i]
    const cat: WordCategory = getWordEntry(word)?.category ?? CAT_KEYS[i % CAT_KEYS.length]
    const col = cardStyle === 'list' ? 0 : i % columns
    const row = cardStyle === 'list' ? i : Math.floor(i / columns)
    const cx = 36 + col * (cW + gap), cy = y + row * (cH + gap)
    if (cy + cH > height - 100) break

    // Card bg
    ctx.fillStyle = t.card; rr(ctx, cx, cy, cW, cH, 10); ctx.fill()

    // Neon glow border
    if (theme === 'neon') {
      ctx.shadowBlur = 12; ctx.shadowColor = CATEGORY_COLORS[cat]
      ctx.strokeStyle = CATEGORY_COLORS[cat]; ctx.lineWidth = 1
      rr(ctx, cx, cy, cW, cH, 10); ctx.stroke(); ctx.shadowBlur = 0
    }

    // Category dot + label
    if (showCategories) {
      ctx.fillStyle = CATEGORY_COLORS[cat]; ctx.beginPath()
      ctx.arc(cx + 14, cy + (cardStyle === 'compact' ? cH / 2 : 18), 5, 0, Math.PI * 2); ctx.fill()
      if (cardStyle !== 'compact') {
        ctx.font = `${s - 3}px system-ui,sans-serif`; ctx.fillStyle = t.muted; ctx.textBaseline = 'top'
        ctx.fillText(cat, cx + 24, cy + 10)
      }
    }

    // Word
    ctx.fillStyle = t.text; ctx.font = `bold ${s + 2}px system-ui,sans-serif`; ctx.textBaseline = 'top'
    const wy = cardStyle === 'compact' ? cy + cH / 2 - s / 2 : cy + (showCategories ? 28 : 12)
    ctx.fillText(word, cx + 14, wy)

    // Definition placeholder
    if (showDefinitions && cardStyle !== 'compact') {
      ctx.font = `${s - 3}px system-ui,sans-serif`; ctx.fillStyle = t.muted
      ctx.fillText('No definition available', cx + 14, wy + s + 6)
    }
  }

  // Category legend
  const ly = height - 64; ctx.font = `${s - 2}px system-ui,sans-serif`; ctx.textBaseline = 'middle'
  let lx = 36
  for (const cat of CAT_KEYS) {
    ctx.fillStyle = CATEGORY_COLORS[cat]; ctx.beginPath()
    ctx.arc(lx + 5, ly, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = t.muted; ctx.fillText(cat, lx + 14, ly)
    lx += ctx.measureText(cat).width + 32
    if (lx > width - 60) break
  }

  // Watermark
  ctx.fillStyle = t.muted; ctx.font = `${s}px system-ui,sans-serif`
  ctx.textAlign = 'center'; ctx.globalAlpha = 0.6
  ctx.fillText('Word Snake 🐍', width / 2, height - 24)
  ctx.globalAlpha = 1; ctx.textAlign = 'start'

  return canvas
}

// ── Download helper ──────────────────────────────────────────────────────────

export function downloadWordBookImage(canvas: HTMLCanvasElement, filename?: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename ?? `word-book-${Date.now()}.png`
    a.click(); URL.revokeObjectURL(url)
  }, 'image/png')
}

// ── Async wrapper ───────────────────────────────────────────────────────────

export async function exportWordBook(
  collectedWords: string[], config?: Partial<WordBookExportConfig>,
): Promise<void> {
  downloadWordBookImage(generateWordBookCanvas(collectedWords, config))
}
