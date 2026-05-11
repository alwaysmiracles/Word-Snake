'use client'

// ─── Types ───────────────────────────────────────────────────────────────────
/** A single data point for any chart type */
export type ChartDataPoint = { label: string; value: number; color?: string }

/** Full chart configuration for styling and layout */
export type ChartConfig = {
  width: number; height: number; title: string;
  backgroundColor: string; textColor: string;
  gridColor: string; accentColor: string;
  fontFamily: string; showLegend: boolean;
  showValues: boolean; padding: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
/** Auto-assign palette for pie/bar segments when no explicit color is given */
export const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
]

/** Dark-theme defaults matching the game's night-mode palette */
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 400, height: 200, title: '',
  backgroundColor: '#0f172a', textColor: '#94a3b8',
  gridColor: '#1e293b', accentColor: '#3b82f6',
  fontFamily: 'system-ui, sans-serif',
  showLegend: true, showValues: true, padding: 20,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Merge user overrides into the default config */
function mergeConfig(cfg?: Partial<ChartConfig>): ChartConfig {
  return { ...DEFAULT_CHART_CONFIG, ...cfg }
}

/** Convert an HSL-like hex to rgba string (simplified: just returns hex for now) */
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Compute nice Y-axis tick values */
function niceYTicks(maxVal: number, count = 5): number[] {
  if (maxVal <= 0) return [0]
  const rough = maxVal / count
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = mag === 0 ? 1 : [1, 2, 5, 10].find(n => n * mag >= rough) ?? mag
  const ticks: number[] = []
  for (let v = 0; v <= maxVal + step * 0.5; v += step) ticks.push(Math.round(v))
  return ticks
}

/** Draw a rounded-top rectangle (bar shape) */
function roundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return
  r = Math.min(r, w / 2, h)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Line Chart ──────────────────────────────────────────────────────────────
export function drawLineChart(
  canvas: HTMLCanvasElement, data: ChartDataPoint[], cfg?: Partial<ChartConfig>,
): void {
  const c = mergeConfig(cfg)
  const dpr = window.devicePixelRatio ?? 1
  canvas.width = c.width * dpr; canvas.height = c.height * dpr
  canvas.style.width = `${c.width}px`; canvas.style.height = `${c.height}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = c.backgroundColor; ctx.fillRect(0, 0, c.width, c.height)

  const { padding: p } = c
  const titleH = c.title ? 22 : 0
  const left = p + 40, right = c.width - p, top = p + titleH, bottom = c.height - p - 20
  const plotW = right - left, plotH = bottom - top
  if (data.length === 0) return

  // Title
  if (c.title) {
    ctx.fillStyle = c.textColor; ctx.font = `bold 13px ${c.fontFamily}`
    ctx.textAlign = 'center'; ctx.fillText(c.title, c.width / 2, p + 14)
  }

  const values = data.map(d => d.value)
  const maxV = Math.max(...values, 1)
  const ticks = niceYTicks(maxV)

  // Grid + Y-axis labels
  ctx.strokeStyle = c.gridColor; ctx.lineWidth = 1
  ctx.fillStyle = c.textColor; ctx.font = `10px ${c.fontFamily}`; ctx.textAlign = 'right'
  for (const t of ticks) {
    const y = bottom - (t / ticks[ticks.length - 1]) * plotH
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke()
    ctx.fillText(String(t), left - 6, y + 3)
  }

  // Plot data points
  const points = data.map((d, i) => ({
    x: left + (i / Math.max(data.length - 1, 1)) * plotW,
    y: bottom - (d.value / ticks[ticks.length - 1]) * plotH,
  }))

  // Gradient fill under curve
  const grad = ctx.createLinearGradient(0, top, 0, bottom)
  grad.addColorStop(0, hexAlpha(c.accentColor, 0.3))
  grad.addColorStop(1, hexAlpha(c.accentColor, 0.0))
  ctx.beginPath(); ctx.moveTo(points[0].x, bottom)
  for (let i = 0; i < points.length; i++) {
    if (i === 0) { ctx.lineTo(points[0].x, points[0].y); continue }
    const prev = points[i - 1], cur = points[i]
    const cpx = (prev.x + cur.x) / 2
    ctx.bezierCurveTo(cpx, prev.y, cpx, cur.y, cur.x, cur.y)
  }
  ctx.lineTo(points[points.length - 1].x, bottom); ctx.closePath()
  ctx.fillStyle = grad; ctx.fill()

  // Line + dots
  ctx.strokeStyle = c.accentColor; ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    if (i === 0) { ctx.moveTo(points[0].x, points[0].y); continue }
    const prev = points[i - 1], cur = points[i]
    const cpx = (prev.x + cur.x) / 2
    ctx.bezierCurveTo(cpx, prev.y, cpx, cur.y, cur.x, cur.y)
  }
  ctx.stroke()

  for (const pt of points) {
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = c.accentColor; ctx.fill()
  }

  // X-axis labels rotated 45°
  ctx.save(); ctx.fillStyle = c.textColor; ctx.font = `9px ${c.fontFamily}`; ctx.textAlign = 'right'
  data.forEach((d, i) => {
    const x = left + (i / Math.max(data.length - 1, 1)) * plotW
    ctx.save(); ctx.translate(x, bottom + 4); ctx.rotate(-Math.PI / 4)
    ctx.fillText(d.label, 0, 0); ctx.restore()
  })
  ctx.restore()
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
export function drawBarChart(
  canvas: HTMLCanvasElement, data: ChartDataPoint[], cfg?: Partial<ChartConfig>,
): void {
  const c = mergeConfig(cfg)
  const dpr = window.devicePixelRatio ?? 1
  canvas.width = c.width * dpr; canvas.height = c.height * dpr
  canvas.style.width = `${c.width}px`; canvas.style.height = `${c.height}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  ctx.fillStyle = c.backgroundColor; ctx.fillRect(0, 0, c.width, c.height)

  const { padding: p } = c
  const titleH = c.title ? 22 : 0
  const left = p + 40, right = c.width - p, top = p + titleH, bottom = c.height - p - 24
  const plotW = right - left, plotH = bottom - top
  if (data.length === 0) return

  if (c.title) {
    ctx.fillStyle = c.textColor; ctx.font = `bold 13px ${c.fontFamily}`
    ctx.textAlign = 'center'; ctx.fillText(c.title, c.width / 2, p + 14)
  }

  const maxV = Math.max(...data.map(d => d.value), 1)
  const ticks = niceYTicks(maxV)

  ctx.strokeStyle = c.gridColor; ctx.lineWidth = 1
  ctx.fillStyle = c.textColor; ctx.font = `10px ${c.fontFamily}`; ctx.textAlign = 'right'
  for (const t of ticks) {
    const y = bottom - (t / ticks[ticks.length - 1]) * plotH
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke()
    ctx.fillText(String(t), left - 6, y + 3)
  }

  // Bars
  const gap = Math.max(4, plotW / data.length * 0.2)
  const barW = (plotW - gap * (data.length + 1)) / data.length

  data.forEach((d, i) => {
    const x = left + gap + i * (barW + gap)
    const h = (d.value / ticks[ticks.length - 1]) * plotH
    const y = bottom - h
    const color = d.color ?? CHART_COLORS[i % CHART_COLORS.length]

    // Bar gradient
    const grad = ctx.createLinearGradient(x, y, x, bottom)
    grad.addColorStop(0, color); grad.addColorStop(1, hexAlpha(color, 0.5))

    roundedBar(ctx, x, y, barW, h, 4)
    ctx.fillStyle = grad; ctx.fill()

    // Value label on top
    if (c.showValues) {
      ctx.fillStyle = c.textColor; ctx.font = `bold 10px ${c.fontFamily}`
      ctx.textAlign = 'center'; ctx.fillText(String(d.value), x + barW / 2, y - 4)
    }

    // Category label below
    ctx.fillStyle = c.textColor; ctx.font = `9px ${c.fontFamily}`
    ctx.textAlign = 'center'; ctx.fillText(d.label, x + barW / 2, bottom + 14)
  })
}

// ─── Pie / Donut Chart ───────────────────────────────────────────────────────
export function drawPieChart(
  canvas: HTMLCanvasElement, data: ChartDataPoint[], cfg?: Partial<ChartConfig>,
): void {
  const c = mergeConfig(cfg)
  const dpr = window.devicePixelRatio ?? 1
  canvas.width = c.width * dpr; canvas.height = c.height * dpr
  canvas.style.width = `${c.width}px`; canvas.style.height = `${c.height}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  ctx.fillStyle = c.backgroundColor; ctx.fillRect(0, 0, c.width, c.height)

  if (data.length === 0) return
  if (c.title) {
    ctx.fillStyle = c.textColor; ctx.font = `bold 13px ${c.fontFamily}`
    ctx.textAlign = 'center'; ctx.fillText(c.title, c.width / 2, c.padding + 14)
  }

  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const cx = c.width / 2
  const titleOffset = c.title ? 22 : 0
  const cy = (c.height + titleOffset) / 2 - (c.showLegend ? 16 : 0)
  const radius = Math.min(c.width, c.height - titleOffset - (c.showLegend ? 40 : 0)) / 2 - c.padding
  const innerRadius = radius * 0.55 // donut hole

  let startAngle = -Math.PI / 2
  data.forEach((d, i) => {
    const slice = (d.value / total) * Math.PI * 2
    const color = d.color ?? CHART_COLORS[i % CHART_COLORS.length]

    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(startAngle) * innerRadius, cy + Math.sin(startAngle) * innerRadius)
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice)
    ctx.arc(cx, cy, innerRadius, startAngle + slice, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = color; ctx.fill()

    // Percentage label
    const midAngle = startAngle + slice / 2
    const labelR = radius * 0.78
    const pct = ((d.value / total) * 100).toFixed(0) + '%'
    ctx.fillStyle = '#fff'; ctx.font = `bold 10px ${c.fontFamily}`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(pct, cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR)

    startAngle += slice
  })

  // Legend below
  if (c.showLegend) {
    const legendY = c.height - 14
    ctx.font = `9px ${c.fontFamily}`; ctx.textBaseline = 'middle'
    const totalLegendW = data.reduce((s, d) => s + ctx.measureText(d.label).width + 20, 0)
    let lx = (c.width - totalLegendW) / 2
    data.forEach((d, i) => {
      const color = d.color ?? CHART_COLORS[i % CHART_COLORS.length]
      ctx.fillStyle = color; ctx.fillRect(lx, legendY - 4, 8, 8)
      lx += 10
      ctx.fillStyle = c.textColor; ctx.textAlign = 'left'
      ctx.fillText(d.label, lx, legendY); lx += ctx.measureText(d.label).width + 10
    })
  }
}

// ─── Download Helper ─────────────────────────────────────────────────────────
/** Convert canvas to a PNG and trigger a browser download */
export function downloadChartImage(canvas: HTMLCanvasElement, filename = 'chart.png'): void {
  const link = document.createElement('a')
  link.download = filename; link.href = canvas.toDataURL('image/png')
  link.click()
}

// ─── Stats Integration ───────────────────────────────────────────────────────
import { getSessions, type GameSession } from './stats-compare-enhanced'

/** Create 3 pre-populated charts from localStorage session data */
export function generateStatsCharts(): {
  scoreChart: HTMLCanvasElement
  wordsChart: HTMLCanvasElement
  categoryChart: HTMLCanvasElement
} {
  const sessions = getSessions().reverse() // chronological order
  if (sessions.length === 0) {
    const empty = document.createElement('canvas')
    return { scoreChart: empty.cloneNode() as HTMLCanvasElement,
             wordsChart: empty.cloneNode() as HTMLCanvasElement,
             categoryChart: empty.cloneNode() as HTMLCanvasElement }
  }

  // 1) Score trend — line chart (last 10 games)
  const recent = sessions.slice(-10)
  const scoreData: ChartDataPoint[] = recent.map((s, i) => ({
    label: `#${i + 1}`, value: s.score,
  }))
  const scoreChart = document.createElement('canvas')
  drawLineChart(scoreChart, scoreData, { title: 'Score Trend (Last 10 Games)' })

  // 2) Words per game — bar chart (last 8 games)
  const barSessions = sessions.slice(-8)
  const wordsData: ChartDataPoint[] = barSessions.map((s, i) => ({
    label: `#${i + 1}`, value: s.wordsEaten,
  }))
  const wordsChart = document.createElement('canvas')
  drawBarChart(wordsChart, wordsData, { title: 'Words Per Game (Last 8)', width: 360 })

  // 3) Category (difficulty) distribution — pie chart
  const diffCounts: Record<string, number> = {}
  for (const s of sessions) diffCounts[s.difficulty] = (diffCounts[s.difficulty] ?? 0) + 1
  const catData: ChartDataPoint[] = Object.entries(diffCounts).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1), value,
  }))
  const categoryChart = document.createElement('canvas')
  drawPieChart(categoryChart, catData, { title: 'Difficulty Distribution', width: 300, height: 220 })

  return { scoreChart, wordsChart, categoryChart }
}
