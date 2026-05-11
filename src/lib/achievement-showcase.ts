'use client'

// Achievement showcase canvas generator for Word Snake
import { ACHIEVEMENTS, type Achievement, getUnlockedAchievements } from './achievements'

// ── Types ──

export type AchievementShowcaseConfig = {
  width: number; height: number; title: string
  layout: 'badge_grid' | 'timeline' | 'stats_card'
  showLocked: boolean; theme: 'gold' | 'silver' | 'neon'
  highlightNewest: boolean
}

export type ShowcaseStats = {
  total: number; unlocked: number; percent: number
  newestTitle: string; newestEmoji: string
}

// ── Defaults ──

export const DEFAULT_SHOWCASE_CONFIG: AchievementShowcaseConfig = {
  width: 1080, height: 1080, title: 'Achievement Showcase',
  layout: 'badge_grid', showLocked: false, theme: 'gold', highlightNewest: true,
}

// ── Theme palettes ──

const THEMES = {
  gold: {
    bg: '#1a1510', bgAccent: '#2a2218', header: '#f5c842', accent: '#d4a017',
    text: '#fff8e7', muted: '#a08e6a', glow: 'rgba(245,200,66,0.45)',
    ring: '#ffd700', locked: '#3a3530', lockedText: '#6a6050',
  },
  silver: {
    bg: '#0f1419', bgAccent: '#1a2030', header: '#c0d0e0', accent: '#7aa2cc',
    text: '#e8eff8', muted: '#7090b0', glow: 'rgba(140,180,220,0.4)',
    ring: '#b0c8e8', locked: '#253040', lockedText: '#4a5a6a',
  },
  neon: {
    bg: '#0a0a12', bgAccent: '#12121f', header: '#00ffcc', accent: '#ff2d95',
    text: '#e0e0ff', muted: '#6a6a90', glow: 'rgba(0,255,204,0.5)',
    ring: '#00ffcc', locked: '#1a1a28', lockedText: '#3a3a55',
  },
} as const

type Colors = (typeof THEMES)[AchievementShowcaseConfig['theme']]

// ── Stats ──

export function calculateShowcaseStats(): ShowcaseStats {
  const ids = getUnlockedAchievements()
  const newest = ids.length ? ACHIEVEMENTS.find(a => a.id === ids[ids.length - 1]) : undefined
  return {
    total: ACHIEVEMENTS.length, unlocked: ids.length,
    percent: ACHIEVEMENTS.length ? Math.round((ids.length / ACHIEVEMENTS.length) * 100) : 0,
    newestTitle: newest?.title ?? '', newestEmoji: newest?.emoji ?? '',
  }
}

// ── Layout: Badge Grid ──

function drawBadgeGrid(
  ctx: CanvasRenderingContext2D, w: number, y0: number,
  items: Achievement[], unlockedIds: string[], newestId: string,
  c: Colors, cfg: AchievementShowcaseConfig,
) {
  const cols = 6, gap = 16
  const r = Math.min((w - gap * (cols + 1)) / cols, 100)
  const sx = (w - (cols * r + (cols - 1) * gap)) / 2

  items.forEach((ach, i) => {
    const cx = sx + (i % cols) * (r + gap) + r / 2
    const cy = y0 + Math.floor(i / cols) * (r + gap + 24) + r / 2
    const ok = unlockedIds.includes(ach.id)
    const newest = cfg.highlightNewest && ach.id === newestId

    if (ok) { ctx.shadowColor = newest ? c.ring : c.glow; ctx.shadowBlur = newest ? 28 : 14 }
    ctx.beginPath(); ctx.arc(cx, cy, r / 2, 0, Math.PI * 2)
    ctx.fillStyle = ok ? c.bgAccent : c.locked; ctx.fill()
    if (newest) { ctx.lineWidth = 3; ctx.strokeStyle = c.ring; ctx.stroke() }
    ctx.shadowBlur = 0

    ctx.font = `${r * 0.42}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = ok ? c.text : c.lockedText
    ctx.fillText(ok ? ach.emoji : '🔒', cx, cy)

    ctx.font = `bold ${Math.round(r * 0.22)}px sans-serif`
    ctx.fillText(ach.title, cx, cy + r / 2 + Math.round(r * 0.26))
  })

  return Math.ceil(items.length / cols) * (r + gap + 24) + 10
}

// ── Layout: Timeline ──

function drawTimeline(
  ctx: CanvasRenderingContext2D, w: number, y0: number,
  items: Achievement[], unlockedIds: string[], newestId: string,
  c: Colors, cfg: AchievementShowcaseConfig,
) {
  const lx = 60, h = 56, startY = y0 + h / 2

  // Connecting vertical line
  ctx.strokeStyle = c.muted; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(lx, startY); ctx.lineTo(lx, startY + (items.length - 1) * h); ctx.stroke()

  items.forEach((ach, i) => {
    const cy = startY + i * h
    const ok = unlockedIds.includes(ach.id)
    const newest = cfg.highlightNewest && ach.id === newestId

    // Dot
    ctx.beginPath(); ctx.arc(lx, cy, 8, 0, Math.PI * 2)
    ctx.fillStyle = ok ? (newest ? c.ring : c.accent) : c.locked
    if (ok) { ctx.shadowColor = c.glow; ctx.shadowBlur = 10 }
    ctx.fill(); ctx.shadowBlur = 0

    // Text content: emoji, title, description
    ctx.font = '22px serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillStyle = ok ? c.text : c.lockedText
    ctx.fillText(ok ? ach.emoji : '🔒', lx + 22, cy)
    ctx.font = 'bold 18px sans-serif'; ctx.fillText(ach.title, lx + 52, cy - 8)
    ctx.font = '14px sans-serif'; ctx.fillStyle = c.muted
    ctx.fillText(ach.description, lx + 52, cy + 12)
  })
  return items.length * h + 20
}

// ── Layout: Stats Card ──

function drawStatsCard(ctx: CanvasRenderingContext2D, w: number, y0: number, s: ShowcaseStats, c: Colors) {
  const cx = w / 2
  // Large percentage display
  ctx.font = 'bold 120px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = c.header; ctx.shadowColor = c.glow; ctx.shadowBlur = 30
  ctx.fillText(`${s.percent}%`, cx, y0 + 70); ctx.shadowBlur = 0
  // Fraction line
  ctx.font = '28px sans-serif'; ctx.fillStyle = c.text
  ctx.fillText(`${s.unlocked} / ${s.total} Unlocked`, cx, y0 + 140)
  // Newest badge
  if (s.newestTitle) {
    ctx.font = '24px serif'; ctx.fillStyle = c.accent
    ctx.fillText(`${s.newestEmoji}  ${s.newestTitle}`, cx, y0 + 190)
  }
  // Category breakdown with mini progress bars
  const cats = ['Words', 'Poems', 'Score', 'Categories', 'Games']
  const catDone = [4, 2, 2, 2, 1]
  cats.forEach((cat, i) => {
    const ry = y0 + 250 + i * 40
    ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = c.text
    ctx.fillText(cat, cx - 200, ry)
    ctx.fillStyle = c.locked; ctx.fillRect(cx - 60, ry - 8, 200, 16)
    ctx.fillStyle = c.accent; ctx.fillRect(cx - 60, ry - 8, 200 * (catDone[i] / 4), 16)
    ctx.textAlign = 'right'; ctx.fillStyle = c.muted; ctx.fillText(`${catDone[i]}/4`, cx + 160, ry)
  })
  return 500
}

// ── Main Generator ──

export function generateAchievementShowcaseCanvas(
  cfg: Partial<AchievementShowcaseConfig> = {},
): HTMLCanvasElement {
  const config: AchievementShowcaseConfig = { ...DEFAULT_SHOWCASE_CONFIG, ...cfg }
  const { width, height, title, layout, showLocked, theme } = config
  const c = THEMES[theme]
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Background fill
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, width, height)

  // Accent bar across top
  const grad = ctx.createLinearGradient(0, 0, width, 0)
  grad.addColorStop(0, 'transparent'); grad.addColorStop(0.5, c.glow); grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, 4)

  // Header title with glow
  const stats = calculateShowcaseStats()
  ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillStyle = c.header; ctx.shadowColor = c.glow; ctx.shadowBlur = 12
  ctx.fillText(title, width / 2, 32); ctx.shadowBlur = 0

  // Stats subtitle
  ctx.font = '20px sans-serif'; ctx.fillStyle = c.muted
  ctx.fillText(`${stats.unlocked}/${stats.total} unlocked  ·  ${stats.percent}%`, width / 2, 78)

  // Build achievement list
  const unlockedIds = getUnlockedAchievements()
  const newestId = config.highlightNewest && unlockedIds.length ? unlockedIds[unlockedIds.length - 1] : ''
  const toDraw = showLocked ? [...ACHIEVEMENTS] : ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id))

  // Render layout
  if (layout === 'badge_grid')
    drawBadgeGrid(ctx, width, 120, toDraw, unlockedIds, newestId, c, config)
  else if (layout === 'timeline')
    drawTimeline(ctx, width, 120, toDraw, unlockedIds, newestId, c, config)
  else
    drawStatsCard(ctx, width, 120, stats, c)

  // Footer watermark
  ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  ctx.fillStyle = c.muted; ctx.fillText('Word Snake 🐍', width / 2, height - 24)

  return canvas
}

// ── Export Utilities ──

/** Convert canvas to PNG and trigger download */
export function downloadAchievementShowcase(canvas: HTMLCanvasElement, filename = 'achievement-showcase.png'): void {
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Generate and share/download showcase (uses Web Share API when available) */
export async function shareAchievementShowcase(config?: Partial<AchievementShowcaseConfig>): Promise<void> {
  const canvas = generateAchievementShowcaseCanvas(config)
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'))
  if (!blob) return
  const file = new File([blob], 'showcase.png', { type: 'image/png' })
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: 'My Word Snake Achievements', files: [file] })
  } else {
    downloadAchievementShowcase(canvas)
  }
}
