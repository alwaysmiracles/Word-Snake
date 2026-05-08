// Snake trail types and rendering logic for Word Snake

export type SnakeTrailType = 'none' | 'fade' | 'particles' | 'sparkle' | 'rainbow'

export interface TrailConfig {
  id: SnakeTrailType
  name: string
  emoji: string
  description: string
  glowColor: string // CSS-compatible color for glow effect on buttons
}

export const TRAIL_CONFIGS: Record<SnakeTrailType, TrailConfig> = {
  none: {
    id: 'none',
    name: 'None',
    emoji: '⬛',
    description: 'No trail effect',
    glowColor: 'rgba(148, 163, 184, 0.3)',
  },
  fade: {
    id: 'fade',
    name: 'Fade',
    emoji: '🌫️',
    description: 'Fading ghost positions',
    glowColor: 'rgba(148, 163, 184, 0.5)',
  },
  particles: {
    id: 'particles',
    name: 'Particles',
    emoji: '✨',
    description: 'Left-behind shrinking dots',
    glowColor: 'rgba(251, 191, 36, 0.5)',
  },
  sparkle: {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '💫',
    description: 'Glittering star particles',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    description: 'Rainbow-colored segments',
    glowColor: 'rgba(236, 72, 153, 0.5)',
  },
}

const TRAIL_ORDER: SnakeTrailType[] = ['none', 'fade', 'particles', 'sparkle', 'rainbow']
const TRAIL_STORAGE_KEY = 'word-snake-trail'

export function getTrailConfig(id: SnakeTrailType): TrailConfig {
  return TRAIL_CONFIGS[id] ?? TRAIL_CONFIGS.none
}

export function getAllTrails(): TrailConfig[] {
  return TRAIL_ORDER.map((id) => TRAIL_CONFIGS[id])
}

export function getSavedTrail(): SnakeTrailType {
  if (typeof window === 'undefined') return 'none'
  try {
    const stored = localStorage.getItem(TRAIL_STORAGE_KEY)
    if (stored && stored in TRAIL_CONFIGS) {
      return stored as SnakeTrailType
    }
  } catch { /* ignore */ }
  return 'none'
}

export function saveTrail(id: SnakeTrailType): void {
  try {
    localStorage.setItem(TRAIL_STORAGE_KEY, id)
  } catch { /* ignore */ }
}

// Trail particle interface for runtime state
export interface TrailParticle {
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  color: string
  vx: number
  vy: number
  type: 'particle' | 'sparkle'
  rotation: number
  rotSpeed: number
}

// Spawn trail particles based on trail type
export function spawnTrailParticles(
  trailType: SnakeTrailType,
  particles: TrailParticle[],
  snake: { x: number; y: number }[],
  cellSize: number,
  snakeColor: string,
  time: number
): void {
  if (trailType === 'none' || snake.length < 2) return

  // Use last few segments (skip head)
  const trailSegments = snake.slice(-Math.min(snake.length - 1, 8))

  for (let i = 0; i < trailSegments.length; i++) {
    const seg = trailSegments[i]
    const cx = seg.x * cellSize + cellSize / 2
    const cy = seg.y * cellSize + cellSize / 2

    if (trailType === 'fade') {
      // Simple opacity-based fade — no particles needed, handled in draw
      continue
    }

    if (trailType === 'particles') {
      // Spawn 1 particle per segment per frame (throttled by randomness)
      if (Math.random() > 0.4) continue
      particles.push({
        x: cx + (Math.random() - 0.5) * cellSize * 0.6,
        y: cy + (Math.random() - 0.5) * cellSize * 0.6,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 1.5 + Math.random() * 2,
        color: snakeColor,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type: 'particle',
        rotation: 0,
        rotSpeed: 0,
      })
    }

    if (trailType === 'sparkle') {
      // Spawn 1 sparkle particle per segment per frame (throttled)
      if (Math.random() > 0.3) continue
      const sparkleColors = ['#ffd700', '#fff8dc', '#f0e68c', '#ffeaa7', '#dfe6e9']
      particles.push({
        x: cx + (Math.random() - 0.5) * cellSize,
        y: cy + (Math.random() - 0.5) * cellSize,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        size: 1 + Math.random() * 2.5,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.2 - Math.random() * 0.5,
        type: 'sparkle',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      })
    }

    if (trailType === 'rainbow') {
      // Rainbow uses segment coloring, no particles needed
      continue
    }
  }
}

// Draw trail effects on canvas context
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trailType: SnakeTrailType,
  snake: { x: number; y: number }[],
  particles: TrailParticle[],
  cellSize: number,
  snakeColor: string,
  time: number
): void {
  if (trailType === 'none') return

  const trailSegments = snake.length > 1 ? snake.slice(-Math.min(snake.length - 1, 8)) : []

  if (trailType === 'fade') {
    // Draw ghost positions with decreasing opacity
    for (let i = 0; i < trailSegments.length; i++) {
      const seg = trailSegments[i]
      const alpha = 0.03 + (i / trailSegments.length) * 0.07
      const cx = seg.x * cellSize + cellSize / 2
      const cy = seg.y * cellSize + cellSize / 2
      ctx.globalAlpha = alpha
      ctx.fillStyle = snakeColor
      ctx.beginPath()
      ctx.roundRect(seg.x * cellSize + 3, seg.y * cellSize + 3, cellSize - 6, cellSize - 6, 3)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  if (trailType === 'rainbow') {
    // Draw rainbow-colored trail segments
    for (let i = 0; i < trailSegments.length; i++) {
      const seg = trailSegments[i]
      const hue = ((time / 20) + i * 45) % 360
      const alpha = 0.15 + (i / trailSegments.length) * 0.25
      const cx = seg.x * cellSize + cellSize / 2
      const cy = seg.y * cellSize + cellSize / 2
      ctx.globalAlpha = alpha
      ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
      ctx.beginPath()
      ctx.roundRect(seg.x * cellSize + 3, seg.y * cellSize + 3, cellSize - 6, cellSize - 6, 3)
      ctx.fill()

      // Small glow around segment
      ctx.globalAlpha = alpha * 0.3
      ctx.beginPath()
      ctx.arc(cx, cy, cellSize * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // Draw particles (for 'particles' and 'sparkle' types)
  if (trailType === 'particles' || trailType === 'sparkle') {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife)

      if (p.type === 'sparkle') {
        // Draw 4-pointed star
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.beginPath()
        const s = p.size
        for (let j = 0; j < 4; j++) {
          const angle = (j * Math.PI) / 2
          ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s)
          ctx.lineTo(Math.cos(angle + Math.PI / 4) * s * 0.35, Math.sin(angle + Math.PI / 4) * s * 0.35)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      } else {
        // Draw dot
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  }
}

// Update trail particles (call each frame)
export function updateTrailParticles(
  particles: TrailParticle[],
  dt: number // frame delta time multiplier
): TrailParticle[] {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life -= dt
    p.x += p.vx
    p.y += p.vy
    p.rotation += p.rotSpeed
    p.size *= 0.998

    if (p.life <= 0 || p.size < 0.2) {
      particles.splice(i, 1)
    }
  }
  return particles
}
