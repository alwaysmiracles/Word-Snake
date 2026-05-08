// Enhanced Combo Visual Effects System
// Provides increasingly spectacular visual effects as the combo multiplier increases.

export interface ComboVfxConfig {
  multiplier: number
  name: string       // display name for the combo level
  emoji: string
  color: string
  glowColor: string
  particleCount: number
  particleSize: number
  particleSpeed: number
  screenShake: number // 0 = no shake, 1-5 = intensity
  trailWidth: number
  bgPulse: boolean
  textScale: number
}

export interface ComboParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: 'burst' | 'spiral' | 'ring' | 'star'
}

// ---------------------------------------------------------------------------
// VFX configuration per combo level
// ---------------------------------------------------------------------------

const BASE_CONFIG: ComboVfxConfig = {
  multiplier: 1.0,
  name: 'None',
  emoji: '',
  color: '#ffffff',
  glowColor: '#ffffff',
  particleCount: 0,
  particleSize: 1,
  particleSpeed: 1,
  screenShake: 0,
  trailWidth: 1,
  bgPulse: false,
  textScale: 1,
}

export const COMBO_VFX_LEVELS: Record<number, ComboVfxConfig> = {
  1.0: {
    ...BASE_CONFIG,
    name: 'None',
  },
  1.5: {
    ...BASE_CONFIG,
    multiplier: 1.5,
    name: 'Nice!',
    emoji: '✨',
    color: '#22c55e',
    glowColor: '#22c55e80',
    particleCount: 5,
    particleSize: 3,
    particleSpeed: 1.2,
  },
  2.0: {
    ...BASE_CONFIG,
    multiplier: 2.0,
    name: 'Great!',
    emoji: '🔥',
    color: '#f59e0b',
    glowColor: '#f59e0b80',
    particleCount: 10,
    particleSize: 4,
    particleSpeed: 1.5,
    screenShake: 1,
    trailWidth: 2,
  },
  2.5: {
    ...BASE_CONFIG,
    multiplier: 2.5,
    name: 'Amazing!',
    emoji: '💥',
    color: '#f97316',
    glowColor: '#f9731680',
    particleCount: 15,
    particleSize: 5,
    particleSpeed: 1.8,
    screenShake: 2,
    trailWidth: 3,
    bgPulse: true,
  },
  3.0: {
    ...BASE_CONFIG,
    multiplier: 3.0,
    name: 'INCREDIBLE!',
    emoji: '⚡',
    color: '#ef4444',
    glowColor: '#ef444480',
    particleCount: 25,
    particleSize: 6,
    particleSpeed: 2.2,
    screenShake: 3,
    trailWidth: 4,
    bgPulse: true,
    textScale: 1.2,
  },
  3.5: {
    ...BASE_CONFIG,
    multiplier: 3.5,
    name: 'LEGENDARY!',
    emoji: '🌟',
    color: '#a855f7',
    glowColor: '#a855f780',
    particleCount: 35,
    particleSize: 7,
    particleSpeed: 2.6,
    screenShake: 4,
    trailWidth: 5,
    bgPulse: true,
    textScale: 1.3,
  },
  4.0: {
    ...BASE_CONFIG,
    multiplier: 4.0,
    name: 'GODLIKE!',
    emoji: '👑',
    color: '#fbbf24',
    glowColor: '#fbbf2480',
    particleCount: 50,
    particleSize: 8,
    particleSpeed: 3.0,
    screenShake: 5,
    trailWidth: 6,
    bgPulse: true,
    textScale: 1.5,
  },
}

/** Ordered keys from lowest to highest combo multiplier. */
const SORTED_LEVELS = Object.keys(COMBO_VFX_LEVELS)
  .map(Number)
  .sort((a, b) => a - b)

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns the VFX config for the current multiplier.
 * Caps at the highest defined level (4.0+ → GODLIKE).
 */
export function getComboVfx(multiplier: number): ComboVfxConfig {
  for (let i = SORTED_LEVELS.length - 1; i >= 0; i--) {
    if (multiplier >= SORTED_LEVELS[i]) {
      return { ...COMBO_VFX_LEVELS[SORTED_LEVELS[i]] }
    }
  }
  return { ...COMBO_VFX_LEVELS[1.0] }
}

/**
 * Generates particles at the given position based on the combo level.
 *
 * @param x        Center X position
 * @param y        Center Y position
 * @param multiplier  Current combo multiplier
 * @param now      Current timestamp (ms), used as a seed for variety
 * @returns        Array of freshly spawned particles
 */
export function spawnComboParticles(
  x: number,
  y: number,
  multiplier: number,
  now: number,
): ComboParticle[] {
  const config = getComboVfx(multiplier)
  if (config.particleCount === 0) return []

  const particles: ComboParticle[] = []
  const seed = now * 0.001 // deterministic-ish from clock

  for (let i = 0; i < config.particleCount; i++) {
    const angle = (seed * 1000 + i) * 2.399963 // golden-angle spacing
    const speed = config.particleSpeed * (0.5 + pseudoRandom(i + seed * 100) * 1.0)
    const life = 0.6 + pseudoRandom(i + seed * 200) * 0.8 // 0.6 – 1.4 s
    const size = config.particleSize * (0.6 + pseudoRandom(i + seed * 300) * 0.8)

    let vx: number
    let vy: number

    switch (config.particleCount <= 10 ? 'burst' : config.particleCount <= 15 ? 'spiral' : config.particleCount <= 25 ? 'ring' : 'star') {
      case 'burst': {
        vx = Math.cos(angle) * speed * 60
        vy = Math.sin(angle) * speed * 60
        break
      }
      case 'spiral': {
        const spiralAngle = angle + life * 4
        vx = Math.cos(spiralAngle) * speed * 50
        vy = Math.sin(spiralAngle) * speed * 50
        break
      }
      case 'ring': {
        const ringAngle = (i / config.particleCount) * Math.PI * 2
        vx = Math.cos(ringAngle) * speed * 70
        vy = Math.sin(ringAngle) * speed * 70
        break
      }
      case 'star': {
        const starAngle = (i / config.particleCount) * Math.PI * 2 * 5 // 5-point star
        const r = i % 2 === 0 ? speed * 80 : speed * 35
        vx = Math.cos(starAngle) * r
        vy = Math.sin(starAngle) * r
        break
      }
    }

    // Determine particle type based on combo level
    const type: ComboParticle['type'] =
      multiplier >= 3.5 ? 'star'
        : multiplier >= 3.0 ? 'ring'
          : multiplier >= 2.5 ? 'spiral'
            : 'burst'

    particles.push({
      x,
      y,
      vx,
      vy,
      life,
      maxLife: life,
      color: config.color,
      size,
      type,
    })
  }

  return particles
}

/**
 * Updates all particles by the given delta-time.
 *
 * @param particles  Current particle array
 * @param dt         Delta time in seconds
 * @returns          Only the particles still alive
 */
export function updateComboParticles(
  particles: ComboParticle[],
  dt: number,
): ComboParticle[] {
  return particles.filter((p) => {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 40 * dt // gentle gravity
    p.vx *= 0.98 // drag
    p.vy *= 0.98
    p.life -= dt
    return p.life > 0
  })
}

/**
 * Computes a screen-shake offset based on the combo's intensity.
 *
 * @param multiplier  Current combo multiplier
 * @param now         Current timestamp (ms)
 * @returns           { dx, dy } pixel offsets to apply to the canvas
 */
export function getComboScreenShake(
  multiplier: number,
  now: number,
): { dx: number; dy: number } {
  const config = getComboVfx(multiplier)
  const intensity = config.screenShake
  if (intensity === 0) return { dx: 0, dy: 0 }

  const t = now * 0.01
  const amplitude = intensity * 1.5

  // Shake decays quickly — use a short envelope so it feels punchy
  const dx = Math.sin(t * 47.3) * amplitude + Math.cos(t * 23.7) * amplitude * 0.4
  const dy = Math.cos(t * 51.1) * amplitude + Math.sin(t * 19.3) * amplitude * 0.4

  return { dx, dy }
}

/**
 * Returns display text info for a combo label.
 */
export function getComboTextConfig(multiplier: number): {
  text: string
  emoji: string
  color: string
  scale: number
} {
  const config = getComboVfx(multiplier)
  return {
    text: config.name,
    emoji: config.emoji,
    color: config.color,
    scale: config.textScale,
  }
}

/**
 * Returns trail rendering config based on the combo multiplier.
 */
export function getComboTrailConfig(multiplier: number): {
  width: number
  color: string
  glow: boolean
} {
  const config = getComboVfx(multiplier)
  return {
    width: config.trailWidth,
    color: config.color,
    glow: config.multiplier >= 2.0,
  }
}

// ---------------------------------------------------------------------------
// Announcement detection
// ---------------------------------------------------------------------------

let _lastAnnouncedMultiplier = 0

/**
 * Returns true when the multiplier changes to a *new* level.
 * A "new level" means it is strictly higher than any previously announced level
 * within this call sequence.
 *
 * Call `resetComboAnnouncement()` to restart tracking (e.g. on game over).
 */
export function shouldShowComboAnnouncement(multiplier: number): boolean {
  const config = getComboVfx(multiplier)
  if (config.multiplier > _lastAnnouncedMultiplier && config.multiplier > 1.0) {
    _lastAnnouncedMultiplier = config.multiplier
    return true
  }
  return false
}

/**
 * Resets the internal announcement tracker. Call this on game start / restart.
 */
export function resetComboAnnouncement(): void {
  _lastAnnouncedMultiplier = 0
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Very simple deterministic pseudo-random in [0, 1) from a seed.
 * Not cryptographically secure — just fast and repeatable for particle variety.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
