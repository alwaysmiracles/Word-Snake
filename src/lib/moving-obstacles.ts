// Moving Obstacles System for Word Snake Game
// Dynamic obstacles that move around the grid — patrol, chase, orbit, and bounce.

import type { Position } from './obstacles'

// ─── Types ──────────────────────────────────────────────────────────────────

export type MovingObstacleType = 'patrol' | 'chaser' | 'orbiter' | 'bouncer'

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export interface MovingObstacle {
  id: number
  type: MovingObstacleType
  position: Position
  direction: Direction
  speed: number // moves every N game ticks (e.g., 3 = moves every 3rd tick)
  tickCounter: number
  emoji: string
  color: string
  // For patrol: moves back and forth along a line
  patrol?: {
    axis: 'x' | 'y'
    min: number
    max: number
  }
  // For orbiter: orbits around a center point
  orbit?: {
    centerX: number
    centerY: number
    radius: number
    angle: number // current angle in radians
    angularSpeed: number // radians per move
  }
  // For bouncer: bounces off walls
  bouncer?: {
    velocityX: number
    velocityY: number
  }
  damage: number // -1 = death, positive = segments lost
  active: boolean
}

export interface MovingObstacleDrawInfo {
  emoji: string
  color: string
  opacity: number
  scale: number
  rotation: number
}

export interface MovingObstacleCollisionResult {
  hit: boolean
  obstacle: MovingObstacle | null
  damage: number
}

// ─── Configuration ──────────────────────────────────────────────────────────

export interface MovingObstacleConfigEntry {
  emoji: string
  color: string
  damage: number
  speed: number
  description: string
  spawnWeight: number // relative probability when picking a random type
}

export const MOVING_OBSTACLE_CONFIG: Record<MovingObstacleType, MovingObstacleConfigEntry> = {
  patrol: {
    emoji: '🚶',
    color: '#22c55e', // green
    damage: -1, // death
    speed: 4,
    description: 'Moves back and forth along a line — instant death on contact',
    spawnWeight: 40,
  },
  chaser: {
    emoji: '👻',
    color: '#a855f7', // purple
    damage: 2, // 2 segments lost
    speed: 5,
    description: 'Slowly pursues the snake head — removes 2 segments on contact',
    spawnWeight: 10,
  },
  orbiter: {
    emoji: '🌀',
    color: '#06b6d4', // cyan
    damage: -1, // death
    speed: 3,
    description: 'Orbits in a circle around a fixed point — instant death on contact',
    spawnWeight: 20,
  },
  bouncer: {
    emoji: '🏀',
    color: '#f97316', // orange
    damage: 1, // 1 segment lost
    speed: 2,
    description: 'Bounces off walls diagonally — removes 1 segment on contact',
    spawnWeight: 30,
  },
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum words eaten before moving obstacles can spawn */
const MIN_WORDS_FOR_MOVING = 8

/** Base spawn chance per word eaten (6%) */
const BASE_SPAWN_CHANCE = 0.06

/** Minimum Manhattan distance from snake head for spawning */
const SPAWN_HEAD_MARGIN = 10

/** Maximum spawn attempts before giving up */
const MAX_SPAWN_ATTEMPTS = 80

/** Orbiter radius range (cells) */
const ORBITER_MIN_RADIUS = 3
const ORBITER_MAX_RADIUS = 5

/** Grid margin to keep obstacles away from edges */
const GRID_MARGIN = 2

/** Next unique ID for generated obstacles */
let nextMovingObstacleId = 1

// ─── Max Count ──────────────────────────────────────────────────────────────

/**
 * Returns the maximum number of moving obstacles allowed based on difficulty.
 *   - easy:   2
 *   - medium: 4
 *   - hard:   6
 */
export function getMaxMovingObstacles(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 2
    case 'hard':
      return 6
    default:
      return 4
  }
}

// ─── Spawn Decision ─────────────────────────────────────────────────────────

/**
 * Determines if a moving obstacle should be spawned after eating a word.
 * Only triggers after 8+ words eaten, with a 6% base chance that scales
 * with progress and respects the per-difficulty max count.
 */
export function shouldSpawnMovingObstacle(
  wordsEaten: number,
  difficulty: string,
  currentCount: number,
): boolean {
  // Must have eaten enough words
  if (wordsEaten < MIN_WORDS_FOR_MOVING) return false

  // Respect max count
  if (currentCount >= getMaxMovingObstacles(difficulty)) return false

  // Scale chance with progress: +0.5% per word beyond threshold, capped at +20%
  const progressFactor = Math.min((wordsEaten - MIN_WORDS_FOR_MOVING) * 0.005, 0.2)

  // Difficulty multiplier
  const difficultyMultiplier =
    difficulty === 'easy' ? 0.6 : difficulty === 'hard' ? 1.6 : 1.0

  const chance = (BASE_SPAWN_CHANCE + progressFactor) * difficultyMultiplier
  return Math.random() < chance
}

// ─── Type Selection ─────────────────────────────────────────────────────────

/**
 * Picks a weighted random moving obstacle type.
 * Enforces the "max 1 chaser at a time" rule by removing chaser from
 * the pool if one already exists among the current obstacles.
 */
function pickMovingObstacleType(
  existing: MovingObstacle[],
  difficulty: string,
): MovingObstacleType | null {
  const hasChaser = existing.some((o) => o.type === 'chaser' && o.active)

  // Build weight map, excluding chaser if one already exists
  const weights: Partial<Record<MovingObstacleType, number>> = {}

  for (const [type, config] of Object.entries(MOVING_OBSTACLE_CONFIG)) {
    if (type === 'chaser' && hasChaser) continue
    weights[type as MovingObstacleType] = config.spawnWeight
  }

  // Adjust weights based on difficulty
  if (difficulty === 'hard') {
    weights.chaser = (weights.chaser ?? 0) + 5
    weights.orbiter = (weights.orbiter ?? 0) + 5
  } else if (difficulty === 'easy') {
    weights.patrol = (weights.patrol ?? 0) + 10
    weights.bouncer = (weights.bouncer ?? 0) + 5
  }

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  if (totalWeight === 0) return null

  let roll = Math.random() * totalWeight

  for (const [type, weight] of Object.entries(weights)) {
    roll -= weight!
    if (roll <= 0) return type as MovingObstacleType
  }

  // Fallback
  return 'patrol'
}

// ─── Position Helpers ───────────────────────────────────────────────────────

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function posKey(x: number, y: number): string {
  return `${x},${y}`
}

// ─── Generation ─────────────────────────────────────────────────────────────

/**
 * Generates a new moving obstacle that:
 *  - Uses weighted random type selection (patrol 40%, bouncer 30%, orbiter 20%, chaser 10%)
 *  - Enforces the 1-chaser-max rule
 *  - Spawns at least 10 cells (Manhattan distance) from the snake head
 *  - Does not overlap with existing obstacles or snake body
 *  - Returns null if no valid position can be found after MAX_SPAWN_ATTEMPTS
 */
export function generateMovingObstacle(
  snake: Position[],
  gridSize: { width: number; height: number },
  difficulty: string,
  existing: MovingObstacle[],
): MovingObstacle | null {
  const type = pickMovingObstacleType(existing, difficulty)
  if (!type) return null

  const head = snake[0]
  const config = MOVING_OBSTACLE_CONFIG[type]

  // Build set of all occupied positions
  const occupied = new Set<string>()
  for (const seg of snake) {
    occupied.add(posKey(seg.x, seg.y))
  }
  for (const obs of existing) {
    occupied.add(posKey(obs.position.x, obs.position.y))
  }

  // Attempt to find a valid spawn position
  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
    const x = GRID_MARGIN + Math.floor(Math.random() * (gridSize.width - GRID_MARGIN * 2))
    const y = GRID_MARGIN + Math.floor(Math.random() * (gridSize.height - GRID_MARGIN * 2))

    // Check head margin
    if (manhattanDistance({ x, y }, head) < SPAWN_HEAD_MARGIN) continue

    // Check overlap
    if (occupied.has(posKey(x, y))) continue

    // Build the obstacle based on type
    const obstacle = buildMovingObstacle(type, x, y, gridSize)
    if (!obstacle) continue

    // For patrol, verify the patrol line doesn't immediately go out of bounds
    // (buildMovingObstacle already handles this, but double-check)
    if (obstacle.patrol) {
      const p = obstacle.patrol
      if (p.min >= p.max) continue
      if (p.axis === 'x' && (p.min < 0 || p.max >= gridSize.width)) continue
      if (p.axis === 'y' && (p.min < 0 || p.max >= gridSize.height)) continue
    }

    return obstacle
  }

  return null
}

/**
 * Constructs a MovingObstacle of the given type at the specified position.
 */
function buildMovingObstacle(
  type: MovingObstacleType,
  x: number,
  y: number,
  gridSize: { width: number; height: number },
): MovingObstacle | null {
  const config = MOVING_OBSTACLE_CONFIG[type]
  const id = nextMovingObstacleId++

  const base: Omit<MovingObstacle, 'patrol' | 'orbit' | 'bouncer'> = {
    id,
    type,
    position: { x, y },
    direction: 'RIGHT',
    speed: config.speed,
    tickCounter: 0,
    emoji: config.emoji,
    color: config.color,
    damage: config.damage,
    active: true,
  }

  switch (type) {
    case 'patrol': {
      // Randomly choose horizontal or vertical patrol
      const axis: 'x' | 'y' = Math.random() < 0.5 ? 'x' : 'y'
      const maxExtent = axis === 'x' ? gridSize.width : gridSize.height

      // Pick a patrol length between 3 and 8 cells, clamped to grid
      const patrolLength = Math.min(
        3 + Math.floor(Math.random() * 6),
        maxExtent - GRID_MARGIN * 2,
      )

      // Center the patrol range around the spawn position
      let min = Math.max(GRID_MARGIN, (axis === 'x' ? x : y) - Math.floor(patrolLength / 2))
      let max = Math.min(
        (axis === 'x' ? gridSize.width : gridSize.height) - GRID_MARGIN,
        min + patrolLength,
      )

      // Ensure min < max
      if (min >= max) min = GRID_MARGIN
      if (max <= min) max = min + 2

      return {
        ...base,
        patrol: { axis, min, max },
      }
    }

    case 'chaser': {
      return {
        ...base,
        direction: 'DOWN',
      }
    }

    case 'orbiter': {
      const radius = ORBITER_MIN_RADIUS + Math.floor(Math.random() * (ORBITER_MAX_RADIUS - ORBITER_MIN_RADIUS + 1))

      // Center the orbit around the spawn position, but ensure the center
      // keeps the orbit within grid bounds
      const centerX = Math.max(
        GRID_MARGIN + radius,
        Math.min(gridSize.width - GRID_MARGIN - radius, x),
      )
      const centerY = Math.max(
        GRID_MARGIN + radius,
        Math.min(gridSize.height - GRID_MARGIN - radius, y),
      )

      const angle = Math.random() * Math.PI * 2
      const angularSpeed = (0.15 + Math.random() * 0.15) * (Math.random() < 0.5 ? 1 : -1) // radians per move

      // Set initial position to be on the orbit circle
      const startPos = {
        x: Math.round(centerX + Math.cos(angle) * radius),
        y: Math.round(centerY + Math.sin(angle) * radius),
      }

      return {
        ...base,
        position: startPos,
        orbit: { centerX, centerY, radius, angle, angularSpeed },
      }
    }

    case 'bouncer': {
      // Always moves diagonally; randomize direction
      const velocityX = Math.random() < 0.5 ? 1 : -1
      const velocityY = Math.random() < 0.5 ? 1 : -1

      // Set direction based on velocity
      let direction: Direction = 'RIGHT'
      if (velocityX > 0 && velocityY > 0) direction = 'RIGHT'
      else if (velocityX > 0 && velocityY < 0) direction = 'RIGHT'
      else if (velocityX < 0 && velocityY > 0) direction = 'LEFT'
      else direction = 'LEFT'

      return {
        ...base,
        direction,
        bouncer: { velocityX, velocityY },
      }
    }

    default:
      return null
  }
}

// ─── Movement Update ────────────────────────────────────────────────────────

/**
 * Updates a single moving obstacle each game tick.
 * The obstacle only actually moves when `tickCounter` reaches `speed`.
 * Returns a new object (immutable update).
 */
export function updateMovingObstacle(
  obs: MovingObstacle,
  snakeHead: Position,
  gridSize: { width: number; height: number },
): MovingObstacle {
  if (!obs.active) return obs

  const newTickCounter = obs.tickCounter + 1

  // Only move when the tick counter reaches the speed threshold
  if (newTickCounter < obs.speed) {
    return { ...obs, tickCounter: newTickCounter }
  }

  // Reset counter for next move cycle
  let updated: MovingObstacle = { ...obs, tickCounter: 0 }

  switch (obs.type) {
    case 'patrol':
      updated = updatePatrol(updated, gridSize)
      break
    case 'chaser':
      updated = updateChaser(updated, snakeHead)
      break
    case 'orbiter':
      updated = updateOrbiter(updated)
      break
    case 'bouncer':
      updated = updateBouncer(updated, gridSize)
      break
  }

  return updated
}

/**
 * Patrol: move back and forth along the patrol axis.
 */
function updatePatrol(obs: MovingObstacle, gridSize: { width: number; height: number }): MovingObstacle {
  if (!obs.patrol) return obs

  const { axis, min, max } = obs.patrol
  const pos = { ...obs.position }

  if (axis === 'x') {
    // Determine direction: if at or past max, go left; if at or past min, go right
    if (pos.x >= max) {
      pos.x -= 1
      return { ...obs, position: pos, direction: 'LEFT' }
    } else if (pos.x <= min) {
      pos.x += 1
      return { ...obs, position: pos, direction: 'RIGHT' }
    } else {
      // Keep going in current direction
      if (obs.direction === 'LEFT') {
        pos.x -= 1
      } else {
        pos.x += 1
      }
      return { ...obs, position: pos }
    }
  } else {
    // axis === 'y'
    if (pos.y >= max) {
      pos.y -= 1
      return { ...obs, position: pos, direction: 'UP' }
    } else if (pos.y <= min) {
      pos.y += 1
      return { ...obs, position: pos, direction: 'DOWN' }
    } else {
      if (obs.direction === 'UP') {
        pos.y -= 1
      } else {
        pos.y += 1
      }
      return { ...obs, position: pos }
    }
  }
}

/**
 * Chaser: move 1 cell closer to the snake head along the axis
 * with the greater distance. Only moves one cell per step.
 */
function updateChaser(obs: MovingObstacle, snakeHead: Position): MovingObstacle {
  const dx = snakeHead.x - obs.position.x
  const dy = snakeHead.y - obs.position.y
  const pos = { ...obs.position }

  // Choose the axis with the larger absolute distance
  // If tied, prefer horizontal
  if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
    pos.x += dx > 0 ? 1 : -1
    return { ...obs, position: pos, direction: dx > 0 ? 'RIGHT' : 'LEFT' }
  } else if (dy !== 0) {
    pos.y += dy > 0 ? 1 : -1
    return { ...obs, position: pos, direction: dy > 0 ? 'DOWN' : 'UP' }
  }

  // Already at snake head — don't move
  return obs
}

/**
 * Orbiter: advance the angle and compute new position from center + radius.
 */
function updateOrbiter(obs: MovingObstacle): MovingObstacle {
  if (!obs.orbit) return obs

  const { centerX, centerY, radius, angle, angularSpeed } = obs.orbit
  const newAngle = angle + angularSpeed

  const newX = Math.round(centerX + Math.cos(newAngle) * radius)
  const newY = Math.round(centerY + Math.sin(newAngle) * radius)

  // Determine direction based on angle quadrant
  let direction: Direction = 'RIGHT'
  const normalised = ((newAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  if (normalised < Math.PI * 0.5) direction = 'RIGHT'
  else if (normalised < Math.PI) direction = 'DOWN'
  else if (normalised < Math.PI * 1.5) direction = 'LEFT'
  else direction = 'UP'

  return {
    ...obs,
    position: { x: newX, y: newY },
    direction,
    orbit: { ...obs.orbit, angle: newAngle },
  }
}

/**
 * Bouncer: apply velocity and bounce off grid walls.
 */
function updateBouncer(obs: MovingObstacle, gridSize: { width: number; height: number }): MovingObstacle {
  if (!obs.bouncer) return obs

  let { velocityX, velocityY } = obs.bouncer
  let x = obs.position.x + velocityX
  let y = obs.position.y + velocityY

  // Bounce off left/right walls
  if (x < GRID_MARGIN) {
    x = GRID_MARGIN
    velocityX *= -1
  } else if (x >= gridSize.width - GRID_MARGIN) {
    x = gridSize.width - GRID_MARGIN - 1
    velocityX *= -1
  }

  // Bounce off top/bottom walls
  if (y < GRID_MARGIN) {
    y = GRID_MARGIN
    velocityY *= -1
  } else if (y >= gridSize.height - GRID_MARGIN) {
    y = gridSize.height - GRID_MARGIN - 1
    velocityY *= -1
  }

  // Determine direction based on velocity
  let direction: Direction = 'RIGHT'
  if (velocityX > 0 && velocityY > 0) direction = 'RIGHT'
  else if (velocityX > 0 && velocityY < 0) direction = 'RIGHT'
  else if (velocityX < 0 && velocityY > 0) direction = 'LEFT'
  else direction = 'LEFT'

  return {
    ...obs,
    position: { x, y },
    direction,
    bouncer: { velocityX, velocityY },
  }
}

// ─── Collision Detection ────────────────────────────────────────────────────

/**
 * Checks if the snake head collides with any active moving obstacle.
 * Returns the first hit found (including damage value).
 */
export function checkMovingObstacleCollision(
  head: Position,
  obstacles: MovingObstacle[],
): MovingObstacleCollisionResult {
  for (const obs of obstacles) {
    if (!obs.active) continue
    if (obs.position.x !== head.x || obs.position.y !== head.y) continue

    return {
      hit: true,
      obstacle: obs,
      damage: obs.damage,
    }
  }

  return { hit: false, obstacle: null, damage: 0 }
}

// ─── Drawing Info ───────────────────────────────────────────────────────────

/**
 * Returns rendering information for a moving obstacle.
 * Includes per-type animation effects:
 *   - Chaser: pulsing opacity & scale
 *   - Orbiter: rotation matching orbit angle
 *   - Bouncer: scale oscillation on bounce
 *   - Patrol: subtle breathing scale
 */
export function getMovingObstacleDrawInfo(
  obs: MovingObstacle,
  now: number,
): MovingObstacleDrawInfo {
  const config = MOVING_OBSTACLE_CONFIG[obs.type]
  // Use tickCounter as a pseudo-time for tick-based animations
  const elapsed = now * 0.001 // convert to seconds for smoother sin waves

  let opacity = 1.0
  let scale = 1.0
  let rotation = 0

  switch (obs.type) {
    case 'chaser': {
      // Pulsing animation — faster pulse when closer (lower tickCounter means recently moved)
      const pulseSpeed = 4.0 // radians per second
      const pulse = Math.sin(elapsed * pulseSpeed)
      opacity = 0.7 + pulse * 0.3
      scale = 1.0 + pulse * 0.15
      break
    }

    case 'orbiter': {
      // Rotation based on orbit angle
      if (obs.orbit) {
        rotation = obs.orbit.angle
      }
      // Subtle scale breathing
      const breathe = Math.sin(elapsed * 2.5)
      scale = 1.0 + breathe * 0.06
      opacity = 0.9 + breathe * 0.1
      break
    }

    case 'bouncer': {
      // Scale oscillation — rhythmic bounce feel
      const bounce = Math.sin(elapsed * 6.0)
      scale = 1.0 + bounce * 0.12
      // Slight opacity variation
      opacity = 0.85 + Math.abs(bounce) * 0.15
      // Slight rotation based on velocity
      if (obs.bouncer) {
        rotation = Math.atan2(obs.bouncer.velocityY, obs.bouncer.velocityX)
      }
      break
    }

    case 'patrol': {
      // Subtle breathing scale
      const breathe = Math.sin(elapsed * 2.0)
      scale = 1.0 + breathe * 0.05
      opacity = 0.9 + breathe * 0.1
      break
    }
  }

  return {
    emoji: config.emoji,
    color: config.color,
    opacity,
    scale,
    rotation,
  }
}
