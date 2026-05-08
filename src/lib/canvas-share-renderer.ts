// ─── Canvas Share Renderer ───────────────────────────────────────────────────
// Renders high-quality share cards on an offscreen canvas (600×400) and returns
// them as PNG data URLs. Pure browser API — no React, no external deps.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

/** Data required for a game-result share card. */
export interface GameResultData {
  score: number
  wordsEaten: number
  combo: number
  mode: string
  rating: string       // e.g. "S", "A", "B", "C"
  time: number         // seconds elapsed
  playerName?: string
  avatar?: string      // data-URL or external image URL
}

/** Data required for an achievement share card. */
export interface AchievementData {
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  unlockedAt: string   // ISO date string
}

/** Data required for a streak share card. */
export interface StreakData {
  currentStreak: number
  bestStreak: number
  totalDays: number
}

/** Data required for a collection share card. */
export interface CollectionData {
  completed: number
  total: number
  rarestWord: string
  categories: string[] // category names
}

/** Data required for a battle-pass share card. */
export interface BattlePassData {
  seasonName: string
  currentTier: number
  maxTier: number
  xpProgress: number   // 0–100 percent
}

/** Public surface returned by the factory function. */
export interface CanvasShareRenderer {
  renderGameResultCard(data: GameResultData): string
  renderAchievementCard(data: AchievementData): string
  renderStreakCard(data: StreakData): string
  renderCollectionCard(data: CollectionData): string
  renderBattlePassCard(data: BattlePassData): string
  downloadCard(dataURL: string, filename: string): void
  getCardDimensions(): { width: number; height: number }
  drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
  ): void
  drawGradientText(
    ctx: CanvasRenderingContext2D,
    text: string, x: number, y: number,
    font: string, colors: string[],
  ): void
  formatNumber(n: number): string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_W = 600
const CARD_H = 400

/** Rating badge colours keyed by letter grade. */
const RATING_COLORS: Record<string, string> = {
  S: '#facc15', A: '#4ade80', B: '#60a5fa', C: '#94a3b8',
}

/** Rarity → gradient colour pairs. */
const RARITY_GRADIENTS: Record<string, [string, string]> = {
  common:    ['#9ca3af', '#6b7280'],   // silver
  uncommon:  ['#cd7f32', '#a0522d'],   // bronze
  rare:      ['#facc15', '#f59e0b'],   // gold
  epic:      ['#c084fc', '#a855f7'],   // purple
  legendary: ['#f472b6', '#ec4899'],   // pink
}

/** Rarity → display label. */
const RARITY_LABELS: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon',
  rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format seconds into "Xm Ys". */
function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

/** Short-date from ISO string, e.g. "Jan 5, 2025". */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return iso
  }
}

/** 1.2K-style compact number formatting. */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

/** Create an offscreen canvas with a 2D context. Returns null if unavailable. */
function createCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  return { canvas, ctx }
}

// ─── Drawing Primitives ──────────────────────────────────────────────────────

/** Draw a rectangle with rounded corners. */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

/** Fill a horizontal gradient behind text, then render the text with that fill. */
function drawGradientText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  font: string, colors: string[],
): void {
  ctx.save()
  ctx.font = font
  const metrics = ctx.measureText(text)
  const grad = ctx.createLinearGradient(
    x - metrics.width / 2, y,
    x + metrics.width / 2, y,
  )
  colors.forEach((c, i) => {
    grad.addColorStop(i / Math.max(colors.length - 1, 1), c)
  })
  ctx.fillStyle = grad
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/** Draw a horizontal progress bar with optional rounded caps. */
function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  progress: number, bgColor: string, fgColor: string,
): void {
  // Background track
  drawRoundedRect(ctx, x, y, w, h, h / 2)
  ctx.fillStyle = bgColor
  ctx.fill()

  // Foreground fill (clamped 0–100%)
  const pct = Math.max(0, Math.min(progress, 100)) / 100
  const fillW = Math.max(h, w * pct) // ensure minimum visible if > 0
  if (pct > 0) {
    drawRoundedRect(ctx, x, y, fillW, h, h / 2)
    ctx.fillStyle = fgColor
    ctx.fill()
  }
}

/** Draw a decorative snake made of green circles along a sine wave. */
function drawSnakeDecoration(
  ctx: CanvasRenderingContext2D,
  originX: number, originY: number,
  segments: number, amplitude: number, segmentRadius: number,
): void {
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const x = originX + t * 160
    const y = originY + Math.sin(t * Math.PI * 3) * amplitude
    // Green gradient from head (bright) to tail (darker)
    const green = Math.round(200 - t * 80)
    const alpha = 0.3 + (1 - t) * 0.5
    ctx.beginPath()
    ctx.arc(x, y, segmentRadius * (1 - t * 0.4), 0, Math.PI * 2)
    ctx.fillStyle = `rgba(34, ${green}, 60, ${alpha})`
    ctx.fill()
  }
  // Eyes on the head
  const headX = originX
  const headY = originY
  ctx.beginPath()
  ctx.arc(headX - 3, headY - 3, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(headX + 3, headY - 3, 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

/** Draw flame-like circles for streak card decoration. */
function drawFlameDecoration(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number,
): void {
  const flames = [
    { dx: 0, dy: -size * 0.6, r: size * 0.5, color: '#facc15' },
    { dx: -size * 0.35, dy: -size * 0.3, r: size * 0.4, color: '#f97316' },
    { dx: size * 0.35, dy: -size * 0.3, r: size * 0.4, color: '#f97316' },
    { dx: 0, dy: 0, r: size * 0.45, color: '#ef4444' },
    { dx: -size * 0.15, dy: -size * 0.8, r: size * 0.3, color: '#fde047' },
    { dx: size * 0.15, dy: -size * 0.85, r: size * 0.25, color: '#fde047' },
  ]
  for (const f of flames) {
    ctx.beginPath()
    ctx.arc(cx + f.dx, cy + f.dy, f.r, 0, Math.PI * 2)
    ctx.fillStyle = f.color
    ctx.globalAlpha = 0.7
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** Draw a progress circle (arc stroke) for the collection card. */
function drawProgressCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number,
  progress: number, trackColor: string, fillColor: string,
): void {
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + (Math.PI * 2) * Math.max(0, Math.min(progress, 100)) / 100

  // Track
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = trackColor
  ctx.lineWidth = 8
  ctx.stroke()

  // Fill arc
  if (progress > 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.strokeStyle = fillColor
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.lineCap = 'butt'
  }
}

// ─── Card Renderers ──────────────────────────────────────────────────────────

/**
 * Game Result Card — dark purple→blue gradient with score, stats, and snake art.
 */
function renderGameResultCard(data: GameResultData): string {
  const setup = createCanvas()
  if (!setup) return ''
  const { canvas, ctx } = setup

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#2e1065')   // deep purple
  bg.addColorStop(0.5, '#1e1b4b') // indigo
  bg.addColorStop(1, '#172554')    // dark blue
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = bg
  ctx.fill()

  // ── Subtle grid overlay ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let gx = 0; gx < CARD_W; gx += 30) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CARD_H); ctx.stroke()
  }
  for (let gy = 0; gy < CARD_H; gy += 30) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CARD_W, gy); ctx.stroke()
  }

  // ── Decorative snake (bottom-left) ──
  drawSnakeDecoration(ctx, 30, CARD_H - 40, 14, 18, 8)

  // ── Title ──
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f8fafc'
  ctx.fillText('🐍 WORD SNAKE', CARD_W / 2, 45)

  // Mode subtitle
  ctx.font = '14px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`${data.mode}`, CARD_W / 2, 68)

  // ── Score ──
  drawGradientText(ctx, String(data.score), CARD_W / 2, 115,
    'bold 48px sans-serif', ['#fbbf24', '#f59e0b', '#fde047'])
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('points', CARD_W / 2, 142)

  // ── Rating badge ──
  const ratingColor = RATING_COLORS[data.rating] ?? '#94a3b8'
  drawRoundedRect(ctx, CARD_W / 2 - 22, 152, 44, 28, 14)
  ctx.fillStyle = ratingColor
  ctx.fill()
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#0f172a'
  ctx.fillText(data.rating, CARD_W / 2, 170)

  // ── Stats row ──
  const statsY = 210
  const colW = CARD_W / 3

  // Words eaten
  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#4ade80'
  ctx.textAlign = 'center'
  ctx.fillText(`📝 ${data.wordsEaten}`, colW * 0.5, statsY)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText('words', colW * 0.5, statsY + 16)

  // Combo
  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#f472b6'
  ctx.fillText(`🔥 ×${data.combo}`, colW * 1.5, statsY)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText('combo', colW * 1.5, statsY + 16)

  // Time
  ctx.font = 'bold 20px sans-serif'
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(`⏱ ${formatDuration(data.time)}`, colW * 2.5, statsY)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText('time', colW * 2.5, statsY + 16)

  // ── Player name (optional) ──
  if (data.playerName) {
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#cbd5e1'
    ctx.textAlign = 'center'
    ctx.fillText(`by ${data.playerName}`, CARD_W / 2, 255)
  }

  // ── Decorative accent line ──
  const accentGrad = ctx.createLinearGradient(60, 0, CARD_W - 60, 0)
  accentGrad.addColorStop(0, '#22c55e')
  accentGrad.addColorStop(0.5, '#8b5cf6')
  accentGrad.addColorStop(1, '#ec4899')
  drawRoundedRect(ctx, 60, 275, CARD_W - 120, 3, 1.5)
  ctx.fillStyle = accentGrad
  ctx.fill()

  // ── Footer ──
  ctx.font = '13px sans-serif'
  ctx.fillStyle = '#475569'
  ctx.textAlign = 'center'
  ctx.fillText('#WordSnake', CARD_W / 2, 300)

  // ── Decorative snake (top-right) ──
  drawSnakeDecoration(ctx, CARD_W - 190, 30, 10, 12, 6)

  return canvas.toDataURL('image/png')
}

/**
 * Achievement Card — rarity-themed gradient, large emoji, name, description.
 */
function renderAchievementCard(data: AchievementData): string {
  const setup = createCanvas()
  if (!setup) return ''
  const { canvas, ctx } = setup

  // ── Background gradient based on rarity ──
  const [c1, c2] = RARITY_GRADIENTS[data.rarity] ?? RARITY_GRADIENTS.common
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, c1)
  bg.addColorStop(1, c2)
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = bg
  ctx.fill()

  // Dark overlay for readability
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fill()

  // ── Sparkle decorations (random small circles) ──
  const seed = data.name.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  for (let i = 0; i < 20; i++) {
    const sx = ((seed * (i + 1) * 7) % CARD_W)
    const sy = ((seed * (i + 1) * 13) % CARD_H)
    const sr = 1 + (i % 3)
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fill()
  }

  // ── Header ──
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('🏆 Achievement Unlocked!', CARD_W / 2, 45)

  // ── Large emoji ──
  ctx.font = '72px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.emoji, CARD_W / 2, 140)

  // ── Name ──
  ctx.font = 'bold 28px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.name, CARD_W / 2, 190)

  // ── Description ──
  ctx.font = '15px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText(data.description, CARD_W / 2, 220)

  // ── Date ──
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(`Unlocked ${formatDate(data.unlockedAt)}`, CARD_W / 2, 250)

  // ── Rarity badge (top-right corner) ──
  const label = RARITY_LABELS[data.rarity] ?? data.rarity
  ctx.font = 'bold 12px sans-serif'
  const badgeW = ctx.measureText(label).width + 20
  drawRoundedRect(ctx, CARD_W - badgeW - 16, 16, badgeW, 26, 13)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fill()
  ctx.strokeStyle = c1
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, CARD_W - badgeW - 16, 16, badgeW, 26, 13)
  ctx.stroke()
  ctx.fillStyle = c1
  ctx.textAlign = 'center'
  ctx.fillText(label, CARD_W - badgeW / 2 - 16, 33)

  // ── Footer ──
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('#WordSnake', CARD_W / 2, CARD_H - 20)

  return canvas.toDataURL('image/png')
}

/**
 * Streak Card — orange/red fire gradient with flame decorations and progress bar.
 */
function renderStreakCard(data: StreakData): string {
  const setup = createCanvas()
  if (!setup) return ''
  const { canvas, ctx } = setup

  // ── Fire gradient background ──
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#7c2d12')   // deep orange-brown
  bg.addColorStop(0.4, '#c2410c') // orange-red
  bg.addColorStop(0.7, '#ea580c') // bright orange
  bg.addColorStop(1, '#f97316')   // orange
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = bg
  ctx.fill()

  // Dark overlay
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fill()

  // ── Flame decorations ──
  drawFlameDecoration(ctx, 80, 90, 40)
  drawFlameDecoration(ctx, CARD_W - 80, 90, 35)
  drawFlameDecoration(ctx, CARD_W / 2, 60, 50)

  // ── Header ──
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fef3c7'
  ctx.fillText('🔥 Daily Streak', CARD_W / 2, 35)

  // ── Current streak (large number) ──
  drawGradientText(ctx, String(data.currentStreak), CARD_W / 2, 150,
    'bold 72px sans-serif', ['#fde047', '#fbbf24', '#f59e0b'])
  ctx.font = '16px sans-serif'
  ctx.fillStyle = '#fef3c7'
  ctx.fillText('day streak', CARD_W / 2, 185)

  // ── Best streak badge ──
  drawRoundedRect(ctx, CARD_W / 2 - 80, 200, 160, 36, 18)
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fill()
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = '#fbbf24'
  ctx.textAlign = 'center'
  ctx.fillText(`⭐ Best: ${data.bestStreak} days`, CARD_W / 2, 222)

  // ── Total days ──
  ctx.font = '14px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(`📅 ${formatNumber(data.totalDays)} total days played`, CARD_W / 2, 260)

  // ── Progress bar toward next milestone ──
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365]
  const nextMilestone = milestones.find(m => m > data.currentStreak) ?? milestones[milestones.length - 1]
  const prevMilestone = milestones.filter(m => m <= data.currentStreak).pop() ?? 0
  const progressPct = (nextMilestone > prevMilestone)
    ? ((data.currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100

  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText(`Next milestone: ${nextMilestone} days`, CARD_W / 2, 290)

  drawProgressBar(ctx, 80, 300, CARD_W - 160, 14,
    progressPct, 'rgba(0,0,0,0.3)', '#fbbf24')

  // ── Footer ──
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('#WordSnake', CARD_W / 2, CARD_H - 20)

  return canvas.toDataURL('image/png')
}

/**
 * Collection Card — blue/purple gradient with progress circle and stats grid.
 */
function renderCollectionCard(data: CollectionData): string {
  const setup = createCanvas()
  if (!setup) return ''
  const { canvas, ctx } = setup

  // ── Blue-purple gradient ──
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#1e3a5f')   // dark blue
  bg.addColorStop(0.5, '#312e81')  // indigo
  bg.addColorStop(1, '#581c87')    // purple
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = bg
  ctx.fill()

  // ── Header ──
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f8fafc'
  ctx.fillText('📖 Word Collection', CARD_W / 2, 40)

  // ── Progress circle ──
  const circleX = 150
  const circleY = 160
  const circleR = 65
  const pct = data.total > 0 ? (data.completed / data.total) * 100 : 0

  drawProgressCircle(ctx, circleX, circleY, circleR, pct,
    'rgba(255,255,255,0.15)', '#818cf8')

  // Percentage text inside circle
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e0e7ff'
  ctx.fillText(`${Math.round(pct)}%`, circleX, circleY - 5)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#a5b4fc'
  ctx.fillText('complete', circleX, circleY + 18)

  // ── Stats panel (right side) ──
  const panelX = 270
  let panelY = 90

  // Completed / total
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#e0e7ff'
  ctx.fillText(`${data.completed} / ${data.total}`, panelX, panelY)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#a5b4fc'
  ctx.fillText('words collected', panelX, panelY + 18)

  // Rarest word
  panelY += 55
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('💎 Rarest Word', panelX, panelY)
  ctx.font = 'bold 22px sans-serif'
  ctx.fillStyle = '#fde68a'
  ctx.fillText(data.rarestWord || '—', panelX, panelY + 28)

  // Categories
  panelY += 60
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = '#c4b5fd'
  ctx.fillText('📂 Categories', panelX, panelY)
  ctx.font = '13px sans-serif'
  ctx.fillStyle = '#a5b4fc'
  const catText = data.categories.length > 0
    ? data.categories.slice(0, 5).join(' • ')
    : 'None yet'
  ctx.fillText(catText, panelX, panelY + 20)

  if (data.categories.length > 5) {
    ctx.fillText(`+ ${data.categories.length - 5} more`, panelX, panelY + 38)
  }

  // ── Progress bar (bottom) ──
  drawProgressBar(ctx, 40, 310, CARD_W - 80, 12, pct,
    'rgba(255,255,255,0.1)', '#818cf8')

  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(
    `${data.completed} of ${data.total} words collected`,
    CARD_W / 2, 340,
  )

  // ── Footer ──
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('#WordSnake', CARD_W / 2, CARD_H - 20)

  return canvas.toDataURL('image/png')
}

/**
 * Battle Pass Card — season-themed gradient with tier progress and season info.
 */
function renderBattlePassCard(data: BattlePassData): string {
  const setup = createCanvas()
  if (!setup) return ''
  const { canvas, ctx } = setup

  // ── Season-themed gradient ──
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#0c4a6e')   // deep sky
  bg.addColorStop(0.4, '#1e3a5f') // navy
  bg.addColorStop(0.7, '#312e81') // indigo
  bg.addColorStop(1, '#4c1d95')   // violet
  drawRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 16)
  ctx.fillStyle = bg
  ctx.fill()

  // ── Subtle diagonal stripes ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 2
  for (let i = -CARD_H; i < CARD_W + CARD_H; i += 40) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + CARD_H, CARD_H)
    ctx.stroke()
  }

  // ── Header ──
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('BATTLE PASS', CARD_W / 2, 35)

  // Season name
  ctx.font = 'bold 30px sans-serif'
  ctx.fillStyle = '#f8fafc'
  ctx.fillText(data.seasonName, CARD_W / 2, 72)

  // ── Tier display (large) ──
  drawGradientText(ctx, `Tier ${data.currentTier}`, CARD_W / 2, 140,
    'bold 42px sans-serif', ['#a78bfa', '#818cf8', '#6366f1'])

  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`of ${data.maxTier}`, CARD_W / 2, 168)

  // ── Tier progress bar ──
  const barY = 190
  drawProgressBar(ctx, 60, barY, CARD_W - 120, 18,
    data.xpProgress, 'rgba(255,255,255,0.1)', '#8b5cf6')

  // Tier markers along the bar
  const barLeft = 60
  const barRight = CARD_W - 120 + 60
  const barWidth = CARD_W - 120
  const markerCount = Math.min(data.maxTier, 10)
  for (let i = 0; i <= markerCount; i++) {
    const mx = barLeft + (barWidth / markerCount) * i
    ctx.beginPath()
    ctx.arc(mx, barY + 9, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fill()
  }

  // XP percentage label
  ctx.font = 'bold 13px sans-serif'
  ctx.fillStyle = '#e0e7ff'
  ctx.textAlign = 'center'
  ctx.fillText(`${Math.round(data.xpProgress)}%`, CARD_W / 2, barY + 38)

  // ── Tier progress visualization (small boxes) ──
  const tierGridY = 260
  const tierGridX = 60
  const boxSize = 16
  const boxGap = 4
  const boxesPerRow = Math.min(data.maxTier, 25)

  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.textAlign = 'left'
  ctx.fillText('Tier Progress:', tierGridX, tierGridY - 10)

  for (let i = 1; i <= boxesPerRow; i++) {
    const bx = tierGridX + (i - 1) * (boxSize + boxGap)
    const by = tierGridY
    const filled = i <= data.currentTier

    drawRoundedRect(ctx, bx, by, boxSize, boxSize, 3)
    ctx.fillStyle = filled ? '#8b5cf6' : 'rgba(255,255,255,0.08)'
    ctx.fill()

    if (filled) {
      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, bx, by, boxSize, boxSize, 3)
      ctx.stroke()
    }

    // Tier number
    ctx.font = '8px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = filled ? '#ffffff' : 'rgba(255,255,255,0.3)'
    ctx.fillText(String(i), bx + boxSize / 2, by + boxSize / 2 + 3)
  }

  // ── Decorative accent bar at top ──
  const accentGrad = ctx.createLinearGradient(40, 0, CARD_W - 40, 0)
  accentGrad.addColorStop(0, '#6366f1')
  accentGrad.addColorStop(0.5, '#a78bfa')
  accentGrad.addColorStop(1, '#c084fc')
  drawRoundedRect(ctx, 40, 12, CARD_W - 80, 3, 1.5)
  ctx.fillStyle = accentGrad
  ctx.fill()

  // ── Footer ──
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.textAlign = 'center'
  ctx.fillText('#WordSnake', CARD_W / 2, CARD_H - 20)

  return canvas.toDataURL('image/png')
}

// ─── Download Helper ─────────────────────────────────────────────────────────

/** Trigger a browser download for a card data URL. */
function downloadCard(dataURL: string, filename: string): void {
  if (typeof document === 'undefined') return
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  // Click the link to start the download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a CanvasShareRenderer instance. All rendering happens on an offscreen
 * canvas (600×400 px). Returns empty string for any card if the DOM / Canvas
 * API is unavailable (e.g. during SSR).
 */
export function createCanvasShareRenderer(): CanvasShareRenderer {
  return {
    renderGameResultCard,
    renderAchievementCard,
    renderStreakCard,
    renderCollectionCard,
    renderBattlePassCard,
    downloadCard,
    getCardDimensions: () => ({ width: CARD_W, height: CARD_H }),
    drawRoundedRect,
    drawGradientText,
    formatNumber,
  }
}
