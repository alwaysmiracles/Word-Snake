// Grid Obstacles & Hazards System for Word Snake Game

// ─── Types ──────────────────────────────────────────────────────────────────

export type ObstacleType = 'wall' | 'spike' | 'ice' | 'lava'

export interface Position {
  x: number
  y: number
}

export interface Obstacle {
  type: ObstacleType
  position: Position
  spawnTime: number
  active: boolean // for lava pulsing
}

export interface ObstacleConfigEntry {
  emoji: string
  label: string
  color: string
  description: string
}

export interface CollisionResult {
  collision: boolean
  type: ObstacleType | null
  damage: number // -1 = instant death, positive = segments lost, 0 = no damage
}

export interface ObstacleDrawInfo {
  emoji: string
  opacity: number
  pulseScale: number
}

// ─── Configuration ──────────────────────────────────────────────────────────

export const OBSTACLE_CONFIG: Record<ObstacleType, ObstacleConfigEntry> = {
  wall: {
    emoji: '🧱',
    label: 'Wall',
    color: '#78716c',
    description: 'Solid wall - instant death on contact',
  },
  spike: {
    emoji: '🔻',
    label: 'Spike',
    color: '#ef4444',
    description: 'Sharp spikes - removes 2 segments',
  },
  ice: {
    emoji: '🧊',
    label: 'Ice',
    color: '#7dd3fc',
    description: 'Slippery surface - slide 1 extra cell',
  },
  lava: {
    emoji: '🌋',
    label: 'Lava',
    color: '#f97316',
    description: 'Pulsing lava - kills when active, safe when dormant',
  },
}

const OBSTACLE_TYPES: ObstacleType[] = ['wall', 'spike', 'ice', 'lava']

// ─── Weighted obstacle type selection ───────────────────────────────────────
// Walls and spikes are more common; ice and lava are rarer

const OBSTACLE_WEIGHTS: Record<ObstacleType, number> = {
  wall: 35,
  spike: 30,
  ice: 20,
  lava: 15,
}

function getRandomObstacleType(difficulty: string): ObstacleType {
  // On hard difficulty, increase lava and spike frequency
  const weights = { ...OBSTACLE_WEIGHTS }
  if (difficulty === 'hard') {
    weights.wall += 5
    weights.spike += 10
    weights.lava += 10
    weights.ice -= 5
  } else if (difficulty === 'easy') {
    weights.wall += 10
    weights.ice += 10
    weights.lava -= 10
    weights.spike -= 10
  }

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * totalWeight

  for (const type of OBSTACLE_TYPES) {
    roll -= weights[type]
    if (roll <= 0) return type
  }

  return 'wall'
}

// ─── Lava Pulsing ───────────────────────────────────────────────────────────

const LAVA_PULSE_INTERVAL = 3000 // 3 seconds per pulse cycle

/**
 * Determines whether a lava obstacle is currently active (deadly) or dormant (safe).
 * Lava alternates: active for 3s, then dormant for 3s, etc.
 * The initial state depends on when the obstacle was spawned relative to the pulse cycle.
 */
export function isLavaActive(obstacle: Obstacle, now: number): boolean {
  if (obstacle.type !== 'lava') return true
  const elapsed = now - obstacle.spawnTime
  const phase = Math.floor(elapsed / LAVA_PULSE_INTERVAL)
  // Even phases = active, odd phases = dormant
  return phase % 2 === 0
}

// ─── Spawn Logic ────────────────────────────────────────────────────────────

/**
 * Determines if an obstacle should be spawned after eating a word.
 * Obstacles start appearing after eating 3 words.
 * Spawn chance increases with words eaten. Harder difficulty = more obstacles.
 */
export function shouldSpawnObstacle(wordsEaten: number, difficulty: string): boolean {
  if (wordsEaten < 3) return false

  // Base chance increases with progress
  const progressFactor = Math.min((wordsEaten - 3) * 0.04, 0.4) // up to +40%

  // Difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'easy' ? 0.5 : difficulty === 'hard' ? 1.5 : 1.0

  const chance = (0.1 + progressFactor) * difficultyMultiplier
  return Math.random() < chance
}

/**
 * Returns the maximum number of obstacles allowed based on progress and difficulty.
 */
export function getMaxObstacles(wordsEaten: number, difficulty: string): number {
  // Scale max with words eaten, with difficulty multiplier
  const baseMax = Math.min(3 + Math.floor(wordsEaten * 0.8), 25)

  const difficultyCap =
    difficulty === 'easy' ? 8 : difficulty === 'hard' ? 25 : 15

  return Math.min(baseMax, difficultyCap)
}

/**
 * Generates random obstacles that don't overlap with snake, food, or each other.
 * Maintains a safe margin of 8 cells from the snake head to ensure fair gameplay.
 */
export function generateObstacles(
  count: number,
  snake: Position[],
  wordFood: Position | null,
  existingObstacles: Obstacle[],
  gridSize: { width: number; height: number },
  difficulty: string = 'medium',
): Obstacle[] {
  const newObstacles: Obstacle[] = []
  const now = Date.now()

  // Build set of all occupied positions
  const occupied = new Set<string>()

  // Add snake body positions
  for (const seg of snake) {
    occupied.add(`${seg.x},${seg.y}`)
  }

  // Add snake head margin (8 cells around head)
  if (snake.length > 0) {
    const head = snake[0]
    for (let dx = -8; dx <= 8; dx++) {
      for (let dy = -8; dy <= 8; dy++) {
        // Use Chebyshev distance for a square margin
        if (Math.max(Math.abs(dx), Math.abs(dy)) <= 8) {
          occupied.add(`${head.x + dx},${head.y + dy}`)
        }
      }
    }
  }

  // Add word food position and surrounding cells
  if (wordFood) {
    occupied.add(`${wordFood.x},${wordFood.y}`)
    // Keep 2 cells clear around food so it's reachable
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        occupied.add(`${wordFood.x + dx},${wordFood.y + dy}`)
      }
    }
  }

  // Add existing obstacle positions
  for (const obs of existingObstacles) {
    occupied.add(`${obs.position.x},${obs.position.y}`)
  }

  // Add newly generated obstacle positions (in case of batch generation)
  for (const obs of newObstacles) {
    occupied.add(`${obs.position.x},${obs.position.y}`)
  }

  // Generate obstacles
  const margin = 1 // keep obstacles 1 cell away from grid edges
  let attempts = 0
  const maxAttempts = count * 50

  while (newObstacles.length < count && attempts < maxAttempts) {
    attempts++

    const x = margin + Math.floor(Math.random() * (gridSize.width - margin * 2))
    const y = margin + Math.floor(Math.random() * (gridSize.height - margin * 2))
    const key = `${x},${y}`

    if (occupied.has(key)) continue

    const type = getRandomObstacleType(difficulty)
    const obstacle: Obstacle = {
      type,
      position: { x, y },
      spawnTime: now,
      active: true,
    }

    newObstacles.push(obstacle)
    occupied.add(key)
  }

  return newObstacles
}

// ─── Collision Detection ────────────────────────────────────────────────────

/**
 * Checks if the snake head collides with any obstacle.
 * Returns collision info including type and damage:
 *   - wall:    damage = -1 (instant death)
 *   - spike:   damage = 2  (removes 2 segments)
 *   - lava:    damage = -1 only when active, no collision when dormant
 *   - ice:     damage = 0  (no damage, but triggers slide effect)
 */
export function checkObstacleCollision(
  head: Position,
  obstacles: Obstacle[],
  now: number,
): CollisionResult {
  for (const obs of obstacles) {
    if (obs.position.x !== head.x || obs.position.y !== head.y) continue

    switch (obs.type) {
      case 'wall':
        return { collision: true, type: 'wall', damage: -1 }

      case 'spike':
        return { collision: true, type: 'spike', damage: 2 }

      case 'ice':
        return { collision: true, type: 'ice', damage: 0 }

      case 'lava': {
        const active = isLavaActive(obs, now)
        if (active) {
          return { collision: true, type: 'lava', damage: -1 }
        }
        // Dormant lava — safe to pass through
        break
      }
    }
  }

  return { collision: false, type: null, damage: 0 }
}

// ─── Drawing Info ───────────────────────────────────────────────────────────

/**
 * Returns drawing information for rendering an obstacle on canvas.
 * Includes emoji, opacity (for lava pulsing), and subtle pulse animation scale.
 */
export function getObstacleDrawInfo(
  obstacle: Obstacle,
  now: number,
): ObstacleDrawInfo {
  const config = OBSTACLE_CONFIG[obstacle.type]
  const elapsed = now - obstacle.spawnTime

  // Subtle pulsing animation (sine wave, 2-second period)
  const pulsePhase = ((elapsed % 2000) / 2000) * Math.PI * 2
  const pulseScale = 1.0 + Math.sin(pulsePhase) * 0.08

  // Base opacity
  let opacity = 1.0

  if (obstacle.type === 'lava') {
    const active = isLavaActive(obstacle, now)
    if (active) {
      // Active lava: full opacity with a glow pulse
      opacity = 0.85 + Math.sin(pulsePhase) * 0.15
    } else {
      // Dormant lava: dimmed
      opacity = 0.3 + Math.sin(pulsePhase * 0.5) * 0.1
    }
  } else if (obstacle.type === 'ice') {
    // Ice has a shimmer effect
    opacity = 0.75 + Math.sin(pulsePhase * 1.5) * 0.15
  } else if (obstacle.type === 'spike') {
    // Spikes have a sharper pulse
    opacity = 0.9 + Math.sin(pulsePhase * 2) * 0.1
  }

  return {
    emoji: config.emoji,
    opacity,
    pulseScale,
  }
}

// ─── Utility: Check if a position is occupied by an obstacle ───────────────

/**
 * Checks whether a given position contains any obstacle.
 */
export function isPositionObstacle(
  pos: Position,
  obstacles: Obstacle[],
): Obstacle | null {
  for (const obs of obstacles) {
    if (obs.position.x === pos.x && obs.position.y === pos.y) {
      return obs
    }
  }
  return null
}

// ─── Utility: Filter obstacles by type ─────────────────────────────────────

/**
 * Returns only obstacles of a specific type.
 */
export function getObstaclesByType(
  obstacles: Obstacle[],
  type: ObstacleType,
): Obstacle[] {
  return obstacles.filter((o) => o.type === type)
}

// ─── Constants for external use ────────────────────────────────────────────

export const LAVA_PULSE_MS = LAVA_PULSE_INTERVAL
export const OBSTACLE_HEAD_MARGIN = 8
export const MIN_WORDS_FOR_OBSTACLES = 3
