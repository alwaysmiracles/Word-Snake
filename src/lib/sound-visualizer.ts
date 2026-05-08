// Sound Visualizer — pulse-based (no AnalyserNode needed)
// Triggers visual feedback on the canvas when game sounds play.

import { getVisualizerPulseIntensity } from '@/lib/sounds'

// ── Types ──────────────────────────────────────────────────────────────

export interface VisualizerBar {
  x: number
  height: number
  maxHeight: number
  color: string
  speed: number
}

export interface VisualizerParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface VisualizerRing {
  radius: number
  maxRadius: number
  opacity: number
  color: string
  speed: number
}

export type VisualizerStyle = 'bars' | 'wave' | 'ring' | 'particles'
export type VisualizerPosition = 'bottom' | 'top' | 'left' | 'right'
export type VisualizerColorScheme = 'rainbow' | 'neon' | 'pastel' | 'fire'

export interface VisualizerConfig {
  enabled: boolean
  style: VisualizerStyle
  position: VisualizerPosition
  opacity: number
  colorScheme: VisualizerColorScheme
  intensity: number // 0.5 – 2.0
}

// ── Constants ──────────────────────────────────────────────────────────

const VISUALIZER_STORAGE_KEY = 'word-snake-visualizer'

export const DEFAULT_VISUALIZER_CONFIG: VisualizerConfig = {
  enabled: true,
  style: 'bars',
  position: 'bottom',
  opacity: 0.6,
  colorScheme: 'neon',
  intensity: 1.0,
}

export const COLOR_SCHEMES: Record<VisualizerColorScheme, string[]> = {
  neon: ['#00ff87', '#60efff', '#ff00e5', '#ff6b00', '#ffe600'],
  rainbow: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
  pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff'],
  fire: ['#ff4500', '#ff6b00', '#ffa500', '#ffd700', '#ffff00'],
}

const MAX_BARS = 64
const MAX_PARTICLES = 30
const PULSE_DECAY_RATE = 2.0 // intensity units per second
const BAR_MAX_HEIGHT_RATIO = 0.15 // max bar height as fraction of canvas dimension

// ── Module state ───────────────────────────────────────────────────────

let config: VisualizerConfig = { ...DEFAULT_VISUALIZER_CONFIG }
let bars: VisualizerBar[] = []
let particles: VisualizerParticle[] = []
let rings: VisualizerRing[] = []
let waveOffset = 0
let initialized = false

// ── Config persistence ─────────────────────────────────────────────────

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getVisualizerConfig(): VisualizerConfig {
  return { ...config }
}

export function saveVisualizerConfig(partial: Partial<VisualizerConfig>): void {
  config = { ...config, ...partial }
  try {
    localStorage.setItem(VISUALIZER_STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* ignore */
  }
  // Re-initialize bars when style changes
  if (partial.style) {
    initialized = false
  }
}

function loadConfig(): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(VISUALIZER_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as unknown
      if (isObject(parsed)) {
        config = {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_VISUALIZER_CONFIG.enabled,
          style: ['bars', 'wave', 'ring', 'particles'].includes(parsed.style as string)
            ? (parsed.style as VisualizerStyle)
            : DEFAULT_VISUALIZER_CONFIG.style,
          position: ['bottom', 'top', 'left', 'right'].includes(parsed.position as string)
            ? (parsed.position as VisualizerPosition)
            : DEFAULT_VISUALIZER_CONFIG.position,
          opacity: typeof parsed.opacity === 'number' ? parsed.opacity : DEFAULT_VISUALIZER_CONFIG.opacity,
          colorScheme: ['rainbow', 'neon', 'pastel', 'fire'].includes(parsed.colorScheme as string)
            ? (parsed.colorScheme as VisualizerColorScheme)
            : DEFAULT_VISUALIZER_CONFIG.colorScheme,
          intensity: typeof parsed.intensity === 'number' ? parsed.intensity : DEFAULT_VISUALIZER_CONFIG.intensity,
        }
      }
    }
  } catch {
    /* ignore */
  }
}

// ── Pulse control ──────────────────────────────────────────────────────

export function triggerVisualizerPulse(_duration?: number): void {
  // Pulse is triggered by sounds.ts — no-op here for compatibility
  void _duration
}

export function isVisualizerActive(): boolean {
  return config.enabled
}

// ── Helper: pick a color from the scheme ───────────────────────────────

function pickColor(scheme: string[], index: number): string {
  return scheme[index % scheme.length]
}

// ── Initialize bars for the current canvas size ────────────────────────

function initBars(canvasWidth: number, canvasHeight: number): void {
  const isHorizontal = config.position === 'bottom' || config.position === 'top'
  const size = isHorizontal ? canvasWidth : canvasHeight
  const count = Math.min(MAX_BARS, Math.floor(size / 8))
  const colors = COLOR_SCHEMES[config.colorScheme]

  bars = Array.from({ length: count }, (_, i) => ({
    x: (size / count) * i,
    height: 0,
    maxHeight: (isHorizontal ? canvasHeight : canvasWidth) * BAR_MAX_HEIGHT_RATIO * config.intensity,
    color: pickColor(colors, i),
    speed: 0.8 + Math.random() * 0.4,
  }))

  initialized = true
}

// ── Update (called each frame) ─────────────────────────────────────────

export function updateVisualizer(deltaTime: number): VisualizerBar[] {
  // Lazy-load config on first call
  if (!initialized) loadConfig()
  if (!config.enabled) return bars

  const dt = Math.min(deltaTime, 0.1) // cap to avoid huge jumps

  // Read pulse intensity from sounds module
  const pulseIntensity = getVisualizerPulseIntensity()

  const colors = COLOR_SCHEMES[config.colorScheme]

  // Update bars
  if (config.style === 'bars') {
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i]
      const target = bar.maxHeight * pulseIntensity * (0.6 + Math.sin(Date.now() / 200 + i * 0.3) * 0.4)
      const targetHeight = Math.max(0, target * config.intensity)
      // Smooth approach
      bar.height += (targetHeight - bar.height) * bar.speed * dt * 8
      bar.color = pickColor(colors, i)
    }
  }

  // Update wave
  if (config.style === 'wave') {
    const waveSpeed = 2 + pulseIntensity * 8
    waveOffset += waveSpeed * dt
  }

  // Spawn particles on pulse
  if (config.style === 'particles' && pulseIntensity > 0.3) {
    const spawnChance = pulseIntensity * 0.6
    if (Math.random() < spawnChance && particles.length < MAX_PARTICLES) {
      particles.push({
        x: Math.random() * 600,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 80,
        life: 0.6 + Math.random() * 0.6,
        maxLife: 0.6 + Math.random() * 0.6,
        color: pickColor(colors, Math.floor(Math.random() * colors.length)),
        size: 2 + Math.random() * 3 * config.intensity,
      })
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 20 * dt // slight gravity
    p.life -= dt
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }

  // Update rings
  if (config.style === 'ring' && pulseIntensity > 0.1) {
    // Spawn new ring on pulse
    if (rings.length === 0 || rings[rings.length - 1].radius > 10) {
      const maxR = Math.min(600, 500) * 0.3 * config.intensity
      rings.push({
        radius: 5,
        maxRadius: maxR + Math.random() * 30,
        opacity: 0.8,
        color: pickColor(colors, Math.floor(Math.random() * colors.length)),
        speed: 60 + Math.random() * 40,
      })
    }
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i]
    r.radius += r.speed * dt * config.intensity
    r.opacity = Math.max(0, 1 - r.radius / r.maxRadius)
    if (r.opacity <= 0) {
      rings.splice(i, 1)
    }
  }

  return bars
}

// ── Drawing ────────────────────────────────────────────────────────────

export function drawVisualizer(
  ctx: CanvasRenderingContext2D,
  canvas: { width: number; height: number },
  barData: VisualizerBar[],
  visualizerConfig?: VisualizerConfig,
): void {
  const cfg = visualizerConfig ?? config
  if (!cfg.enabled) return

  // Lazy-init bars if needed
  if (!initialized || (cfg.style === 'bars' && barData.length === 0)) {
    initBars(canvas.width, canvas.height)
    // Copy to barData reference
    for (let i = 0; i < bars.length; i++) {
      if (i < barData.length) {
        barData[i] = bars[i]
      }
    }
    return
  }

  const { width, height } = canvas
  const colors = COLOR_SCHEMES[cfg.colorScheme]
  ctx.save()
  ctx.globalAlpha = cfg.opacity

  switch (cfg.style) {
    case 'bars':
      drawBars(ctx, barData, cfg, width, height, colors)
      break
    case 'wave':
      drawWave(ctx, cfg, width, height, colors)
      break
    case 'ring':
      drawRings(ctx, width, height)
      break
    case 'particles':
      drawParticles(ctx, width, height)
      break
  }

  ctx.restore()
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  barData: VisualizerBar[],
  cfg: VisualizerConfig,
  width: number,
  height: number,
  colors: string[],
): void {
  // Ensure bars are initialized for current size
  if (!initialized) {
    initBars(width, height)
  }
  // Use the module-level bars array for current state
  const currentBars = bars.length > 0 ? bars : barData
  const count = currentBars.length

  if (count === 0) return

  const isHorizontal = cfg.position === 'bottom' || cfg.position === 'top'
  const barWidth = isHorizontal
    ? Math.max(2, width / count - 1)
    : Math.max(2, height / count - 1)

  for (let i = 0; i < count; i++) {
    const bar = currentBars[i]
    const h = Math.max(0, bar.height * cfg.intensity)
    if (h < 0.5) continue

    const color = pickColor(colors, i)

    // Add glow
    ctx.shadowColor = color
    ctx.shadowBlur = 4 + h * 0.1
    ctx.fillStyle = color

    if (cfg.position === 'bottom') {
      const x = (width / count) * i
      ctx.fillRect(x, height - h, barWidth, h)
    } else if (cfg.position === 'top') {
      const x = (width / count) * i
      ctx.fillRect(x, 0, barWidth, h)
    } else if (cfg.position === 'left') {
      const y = (height / count) * i
      ctx.fillRect(0, y, h, barWidth)
    } else if (cfg.position === 'right') {
      const y = (height / count) * i
      ctx.fillRect(width - h, y, h, barWidth)
    }
  }

  ctx.shadowBlur = 0
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  cfg: VisualizerConfig,
  width: number,
  height: number,
  colors: string[],
): void {
  const pulse = getVisualizerPulseIntensity()
  const amplitude = 8 + pulse * 35 * cfg.intensity
  const frequency = 0.015 + pulse * 0.01
  const layers = 3

  for (let layer = 0; layer < layers; layer++) {
    const color = pickColor(colors, layer)
    const layerOffset = layer * 0.8
    const layerAmplitude = amplitude * (1 - layer * 0.25)

    ctx.strokeStyle = color
    ctx.lineWidth = 2 - layer * 0.5
    ctx.shadowColor = color
    ctx.shadowBlur = 6 + pulse * 4

    ctx.beginPath()

    if (cfg.position === 'bottom') {
      const baseY = height - 10 - layer * 15
      for (let x = 0; x <= width; x += 2) {
        const y = baseY + Math.sin(x * frequency + waveOffset + layerOffset) * layerAmplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (cfg.position === 'top') {
      const baseY = 10 + layer * 15
      for (let x = 0; x <= width; x += 2) {
        const y = baseY + Math.sin(x * frequency + waveOffset + layerOffset) * layerAmplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else if (cfg.position === 'left') {
      const baseX = 10 + layer * 15
      for (let y = 0; y <= height; y += 2) {
        const x = baseX + Math.sin(y * frequency + waveOffset + layerOffset) * layerAmplitude
        if (y === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    } else {
      const baseX = width - 10 - layer * 15
      for (let y = 0; y <= height; y += 2) {
        const x = baseX + Math.sin(y * frequency + waveOffset + layerOffset) * layerAmplitude
        if (y === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  ctx.shadowBlur = 0
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const cx = width / 2
  const cy = height / 2

  for (const ring of rings) {
    ctx.strokeStyle = ring.color
    ctx.lineWidth = 2
    ctx.globalAlpha = ring.opacity * config.opacity
    ctx.shadowColor = ring.color
    ctx.shadowBlur = 8

    ctx.beginPath()
    ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = config.opacity
  ctx.shadowBlur = 0
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife)
    ctx.globalAlpha = alpha * config.opacity
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 4

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = config.opacity
  ctx.shadowBlur = 0
}

// ── Reset (call on game reset) ─────────────────────────────────────────

export function resetVisualizer(): void {
  bars = []
  particles = []
  rings = []
  waveOffset = 0
  initialized = false
}

// ── Init on first load ─────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  loadConfig()
}
