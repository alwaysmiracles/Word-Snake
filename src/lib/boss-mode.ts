// Boss Mode System for Word Snake Game
// Special multi-hit word targets that award bonus points

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Position {
  x: number
  y: number
}

export interface BossWord {
  word: string
  category: string
  points: number
  requiredPasses: number // how many times snake must pass through (default: 3)
  currentPasses: number
  position: Position // { x: number, y: number }
  spawnTime: number
  phase: 'idle' | 'active' | 'defeated'
  hitEffect: number // timestamp of last hit for animation
  defeatedEffect: number // timestamp of defeat for animation
}

export interface BossConfig {
  word: string
  category: string
  points: number
  requiredPasses: number
  tier: 'minor' | 'major' | 'legendary'
  rewardMultiplier: number
  description: string
}

// ─── Configuration ──────────────────────────────────────────────────────────

export const BOSS_POOL: BossConfig[] = [
  // ── Minor tier (3 passes, ×2 reward) ──
  {
    word: 'Behemoth',
    category: 'creature',
    points: 20,
    requiredPasses: 3,
    tier: 'minor',
    rewardMultiplier: 2,
    description: 'A massive beast that lurks in the depths of the grid.',
  },
  {
    word: 'Titan',
    category: 'mythology',
    points: 20,
    requiredPasses: 3,
    tier: 'minor',
    rewardMultiplier: 2,
    description: 'An ancient giant of immense power, guarding precious letters.',
  },
  {
    word: 'Colossus',
    category: 'creature',
    points: 25,
    requiredPasses: 3,
    tier: 'minor',
    rewardMultiplier: 2,
    description: 'A towering construct that blocks your path to victory.',
  },
  {
    word: 'Sentinel',
    category: 'creature',
    points: 25,
    requiredPasses: 3,
    tier: 'minor',
    rewardMultiplier: 2,
    description: 'An ever-watchful guardian that tests your resolve.',
  },
  // ── Major tier (4 passes, ×3 reward) ──
  {
    word: 'Leviathan',
    category: 'mythology',
    points: 30,
    requiredPasses: 4,
    tier: 'major',
    rewardMultiplier: 3,
    description: 'A legendary sea serpent of unfathomable size and ferocity.',
  },
  {
    word: 'Phoenix',
    category: 'mythology',
    points: 35,
    requiredPasses: 4,
    tier: 'major',
    rewardMultiplier: 3,
    description: 'A fiery bird that rises anew — you must strike it four times.',
  },
  // ── Legendary tier (5 passes, ×5 reward) ──
  {
    word: 'Kraken',
    category: 'mythology',
    points: 40,
    requiredPasses: 5,
    tier: 'legendary',
    rewardMultiplier: 5,
    description: 'The apex predator of the deep — only the bravest snakes dare challenge it.',
  },
  {
    word: 'Dragon',
    category: 'mythology',
    points: 40,
    requiredPasses: 5,
    tier: 'legendary',
    rewardMultiplier: 5,
    description: 'The king of all creatures. Requires five passes to fell.',
  },
]

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum words eaten before bosses can spawn */
const MIN_WORDS_FOR_BOSS = 10

/** Chance per word eaten (after the threshold) that a boss appears */
const BOSS_SPAWN_CHANCE = 0.10

/** Time in ms before an undefeated boss despawns */
export const BOSS_DESPAWN_TIME = 30000

/** Margin from snake head when placing a boss */
const BOSS_HEAD_MARGIN = 10

/** Margin from grid edges when placing a boss */
const BOSS_EDGE_MARGIN = 1

/** Maximum placement attempts before giving up */
const MAX_PLACEMENT_ATTEMPTS = 500

// ─── Tier Display Info ──────────────────────────────────────────────────────

const TIER_INFO: Record<
  string,
  { emoji: string; label: string; color: string; glowColor: string }
> = {
  minor: {
    emoji: '👹',
    label: 'Minor',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  major: {
    emoji: '🔥',
    label: 'Major',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
  },
  legendary: {
    emoji: '💀',
    label: 'Legendary',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
  },
}

// ─── Spawn Logic ────────────────────────────────────────────────────────────

/**
 * Determines whether a boss should spawn after eating a word.
 * Bosses only appear after eating 10+ words. After that, there is
 * a 10% chance per word. Only one boss may be active at a time.
 *
 * @param wordsEaten Total words the snake has consumed so far
 * @param hasActiveBoss Whether a boss is already on the grid
 * @returns true if a new boss should be spawned
 */
export function shouldSpawnBoss(
  wordsEaten: number,
  hasActiveBoss: boolean = false,
): boolean {
  if (hasActiveBoss) return false
  if (wordsEaten < MIN_WORDS_FOR_BOSS) return false
  return Math.random() < BOSS_SPAWN_CHANCE
}

// ─── Boss Generation ────────────────────────────────────────────────────────

/**
 * Picks a random boss configuration from the pool and places it on the grid
 * at a valid position that doesn't overlap with the snake, word food, or obstacles.
 * Maintains a 10-cell margin from the snake head for fairness.
 *
 * @returns A fully initialized BossWord, or null if no valid position was found
 */
export function generateBoss(
  snake: Position[],
  wordFood: Position | null,
  obstacles: { position: Position }[],
  gridSize: { width: number; height: number },
): BossWord | null {
  // Pick a random boss config from the pool
  const config = BOSS_POOL[Math.floor(Math.random() * BOSS_POOL.length)]
  const now = Date.now()

  // Build occupied position set
  const occupied = new Set<string>()

  // Add all snake body segments
  for (const seg of snake) {
    occupied.add(`${seg.x},${seg.y}`)
  }

  // Add a safe margin around the snake head
  if (snake.length > 0) {
    const head = snake[0]
    for (let dx = -BOSS_HEAD_MARGIN; dx <= BOSS_HEAD_MARGIN; dx++) {
      for (let dy = -BOSS_HEAD_MARGIN; dy <= BOSS_HEAD_MARGIN; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) <= BOSS_HEAD_MARGIN) {
          occupied.add(`${head.x + dx},${head.y + dy}`)
        }
      }
    }
  }

  // Add word food position
  if (wordFood) {
    occupied.add(`${wordFood.x},${wordFood.y}`)
  }

  // Add obstacle positions
  for (const obs of obstacles) {
    occupied.add(`${obs.position.x},${obs.position.y}`)
  }

  // Attempt to find a valid position
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const x =
      BOSS_EDGE_MARGIN +
      Math.floor(
        Math.random() * (gridSize.width - BOSS_EDGE_MARGIN * 2),
      )
    const y =
      BOSS_EDGE_MARGIN +
      Math.floor(
        Math.random() * (gridSize.height - BOSS_EDGE_MARGIN * 2),
      )
    const key = `${x},${y}`

    if (occupied.has(key)) continue

    return {
      word: config.word,
      category: config.category,
      points: config.points,
      requiredPasses: config.requiredPasses,
      currentPasses: 0,
      position: { x, y },
      spawnTime: now,
      phase: 'active',
      hitEffect: 0,
      defeatedEffect: 0,
    }
  }

  // No valid position found
  return null
}

// ─── Hit Detection ──────────────────────────────────────────────────────────

/**
 * Checks if the snake head is on the boss position and updates pass progress.
 * Each time the snake passes through the boss, currentPasses increments.
 * When currentPasses reaches requiredPasses, the boss is marked as defeated.
 *
 * @returns An object indicating whether a hit occurred and whether the boss was defeated
 */
export function checkBossHit(
  head: Position,
  boss: BossWord | null,
): { hit: boolean; defeated: boolean } {
  if (!boss || boss.phase === 'defeated') {
    return { hit: false, defeated: false }
  }

  if (head.x !== boss.position.x || head.y !== boss.position.y) {
    return { hit: false, defeated: false }
  }

  // Snake head is on the boss — register a hit
  boss.currentPasses++
  boss.hitEffect = Date.now()

  if (boss.currentPasses >= boss.requiredPasses) {
    boss.phase = 'defeated'
    boss.defeatedEffect = Date.now()
    return { hit: true, defeated: true }
  }

  return { hit: true, defeated: false }
}

// ─── Drawing Info ───────────────────────────────────────────────────────────

/**
 * Returns rendering information for drawing a boss on the canvas.
 * - Size is 1.5× normal word size
 * - Progress ring shows passes / required passes
 * - Glow color is tier-dependent (amber / red / purple)
 * - Shake animation when recently hit
 * - Special explosion effect when defeated
 */
export function getBossDrawInfo(
  boss: BossWord,
  now: number,
): {
  emoji: string
  size: number
  opacity: number
  glow: string
  progress: number
  shakeX: number
} {
  const tierKey = findTierForBoss(boss)
  const tierInfo = TIER_INFO[tierKey]

  // ── Defeated state ──
  if (boss.phase === 'defeated') {
    const elapsed = now - boss.defeatedEffect
    const defeatDuration = 1500 // 1.5s explosion animation

    if (elapsed < defeatDuration) {
      // Explosion scale: quickly expand then fade
      const t = elapsed / defeatDuration
      const explosionScale = 1.5 + t * 2.5 // grows from 1.5× to 4×
      const opacity = Math.max(0, 1 - t) // fades to 0

      return {
        emoji: '💥',
        size: explosionScale,
        opacity,
        glow: tierInfo.glowColor,
        progress: 1,
        shakeX: 0,
      }
    }

    // Fully faded after animation
    return {
      emoji: tierInfo.emoji,
      size: 1.5,
      opacity: 0,
      glow: tierInfo.glowColor,
      progress: 1,
      shakeX: 0,
    }
  }

  // ── Active state ──
  // Base size: 1.5× normal
  let size = 1.5

  // Subtle idle pulse (2-second cycle)
  const pulsePhase = ((now - boss.spawnTime) % 2000) / 2000 * Math.PI * 2
  size += Math.sin(pulsePhase) * 0.1

  // Opacity: full when active
  const opacity = 1.0

  // Progress: fraction of required passes completed
  const progress = boss.currentPasses / boss.requiredPasses

  // Glow: based on tier
  const glow = tierInfo.glowColor

  // Shake effect when recently hit (lasts 300ms)
  let shakeX = 0
  if (boss.hitEffect > 0) {
    const hitElapsed = now - boss.hitEffect
    if (hitElapsed < 300) {
      // Damped oscillation: amplitude decays over 300ms
      const t = hitElapsed / 300
      const amplitude = 4 * (1 - t)
      shakeX = Math.sin(hitElapsed * 0.05) * amplitude
    }
  }

  return {
    emoji: tierInfo.emoji,
    size,
    opacity,
    glow,
    progress,
    shakeX,
  }
}

// ─── Tier Info ──────────────────────────────────────────────────────────────

/**
 * Returns display metadata for a boss tier.
 */
export function getBossTierInfo(
  tier: string,
): { emoji: string; label: string; color: string; glowColor: string } {
  return (
    TIER_INFO[tier] || {
      emoji: '❓',
      label: 'Unknown',
      color: '#6b7280',
      glowColor: 'rgba(107, 114, 128, 0.6)',
    }
  )
}

// ─── Despawn Logic ──────────────────────────────────────────────────────────

/**
 * Checks whether a boss should be despawned due to timeout.
 * A boss expires if it has been on the grid longer than BOSS_DESPAWN_TIME
 * and has not been defeated.
 */
export function isBossExpired(boss: BossWord, now: number): boolean {
  if (boss.phase === 'defeated') return false
  return now - boss.spawnTime > BOSS_DESPAWN_TIME
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Looks up the tier for a boss by matching its word against the pool.
 * Falls back to guessing from required passes if no match is found.
 */
function findTierForBoss(boss: BossWord): string {
  const match = BOSS_POOL.find((config) => config.word === boss.word)
  if (match) return match.tier
  return guessTierFromPasses(boss.requiredPasses)
}

/**
 * Guesses the tier from the required passes count.
 * Used as a fallback when a BossWord doesn't carry tier info directly.
 */
function guessTierFromPasses(requiredPasses: number): string {
  if (requiredPasses >= 5) return 'legendary'
  if (requiredPasses >= 4) return 'major'
  return 'minor'
}
