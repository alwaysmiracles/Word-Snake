/**
 * word-bomb-wire.ts
 *
 * Pure logic module providing word-bomb gameplay integration for the
 * Word Snake game. When the bomb is active and the snake eats a word,
 * a blast area around the eaten word is cleared of obstacles, food, and
 * other items. This module wires the actual gameplay impact — the
 * `powerup-effect-wire.ts` only handles visual explosion effects.
 *
 * Persistence: lifetime statistics saved to localStorage under
 * `ws_word_bomb_wire`. Max chain depth: 3.
 *
 * NO React imports — pure TypeScript logic.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_word_bomb_wire'
const DEFAULT_RADIUS = 1
const MAX_CHAIN_DEPTH = 3
const POINTS_PER_OBSTACLE = 50
const AREA_CLEAR_THRESHOLD = 3
const AREA_CLEAR_BONUS = 100
const CHAIN_MULTIPLIER_PER_LEVEL = 1.5

// ── Public interfaces ────────────────────────────────────────────────────────

/** Result of a single bomb detonation. */
export interface BombDetonationResult {
  /** All grid cells within the blast radius (bounds-checked). */
  affectedCells: Array<{ x: number; y: number }>
  /** Number of obstacle cells that were cleared. */
  obstaclesCleared: number
  /** Number of word (food) cells that were cleared. */
  wordsCleared: number
  /** Total score bonus for this detonation (includes chain multiplier). */
  scoreBonus: number
  /** Current chain depth (0 = initial bomb, 1 = first chain, etc.). */
  chainLevel: number
  /** Effective blast radius used for this detonation. */
  radius: number
  /** Positions of secondary bomb power-ups caught in the blast. */
  secondaryBombs: Array<{ x: number; y: number }>
}

/** Lifetime statistics tracked across all game sessions. */
export interface WordBombStats {
  totalDetonated: number
  totalObstaclesCleared: number
  totalCellsAffected: number
  biggestChain: number
  totalScoreFromBombs: number
}

/** Primary API surface for the word-bomb wire. Instantiate via `createWordBombWire()`. */
export interface WordBombWire {
  /** Compute all grid cells within a blast radius. NOT bounds-checked. */
  computeBombArea(centerX: number, centerY: number, radius?: number): Array<{ x: number; y: number }>
  /** Detonate a bomb at the given position. Bounds-checked. Returns full detonation result. */
  detonateBomb(
    centerX: number, centerY: number,
    gridWidth: number, gridHeight: number,
    chainLevel?: number,
  ): BombDetonationResult
  /** Arm the bomb — it will detonate on the next word-eat event. */
  armBomb(): void
  /** Disarm the bomb without detonating it. */
  disarmBomb(): void
  /** Returns true when the bomb is armed and awaiting a word eat. */
  isBombArmed(): boolean
  /** Mark the bomb as consumed after detonation. Updates lifetime stats. */
  consumeBomb(): void
  /** Convenience check: should the game detonate on the next word eat? */
  shouldDetonateOnEat(): boolean
  /** Calculate the score bonus for a detonation based on obstacles cleared and cells affected. */
  calculateBombScore(obstaclesCleared: number, cellsAffected: number): number
  /** Return a snapshot of the lifetime bomb statistics. */
  getStats(): WordBombStats
  /** Reset all lifetime statistics to zero and persist. */
  resetStats(): void
}

// ── Internal persistence ─────────────────────────────────────────────────────

interface PersistedBombStats {
  totalDetonated: number
  totalObstaclesCleared: number
  totalCellsAffected: number
  biggestChain: number
  totalScoreFromBombs: number
}

const DEFAULT_STATS: PersistedBombStats = {
  totalDetonated: 0,
  totalObstaclesCleared: 0,
  totalCellsAffected: 0,
  biggestChain: 0,
  totalScoreFromBombs: 0,
}

/** Attempt to load persisted bomb statistics from localStorage. Returns null on failure. */
function loadStats(): PersistedBombStats | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PersistedBombStats
    if (
      typeof p.totalDetonated !== 'number' ||
      typeof p.totalObstaclesCleared !== 'number' ||
      typeof p.totalCellsAffected !== 'number' ||
      typeof p.biggestChain !== 'number' ||
      typeof p.totalScoreFromBombs !== 'number'
    ) return null
    return p
  } catch {
    return null
  }
}

/** Persist bomb statistics. Silently degrades on failure. */
function saveStats(s: PersistedBombStats): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* noop */ }
}

// ── Pure helper functions ────────────────────────────────────────────────────

/**
 * Calculate the raw score bonus for a detonation.
 * +50 per obstacle, +100 bonus if ≥3 cells affected. Chain multiplier
 * is applied separately inside `detonateBomb()`.
 */
export function calculateBombScore(obstaclesCleared: number, cellsAffected: number): number {
  let score = obstaclesCleared * POINTS_PER_OBSTACLE
  if (cellsAffected >= AREA_CLEAR_THRESHOLD) score += AREA_CLEAR_BONUS
  return score
}

/**
 * Compute all grid cells within a square blast radius centred on
 * (centerX, centerY). NOT bounds-checked against the grid.
 */
export function computeBombArea(
  centerX: number, centerY: number, radius: number = DEFAULT_RADIUS,
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = []
  for (let dx = -radius; dx <= radius; dx++)
    for (let dy = -radius; dy <= radius; dy++)
      cells.push({ x: centerX + dx, y: centerY + dy })
  return cells
}

/** Compounding chain multiplier for a given level. Level 0 = ×1.0. */
function chainMultiplier(level: number): number {
  return Math.pow(CHAIN_MULTIPLIER_PER_LEVEL, level)
}

/** Returns true if (x, y) is inside a grid of the given dimensions. */
function inBounds(x: number, y: number, w: number, h: number): boolean {
  return x >= 0 && x < w && y >= 0 && y < h
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a new `WordBombWire` instance.
 * Each instance holds its own armed state and lifetime statistics, loaded
 * from localStorage on creation and persisted after each detonation or reset.
 */
export function createWordBombWire(): WordBombWire {
  let armed = false
  let stats: PersistedBombStats = loadStats() ?? { ...DEFAULT_STATS }

  const persist = (): void => saveStats(stats)

  const wire: WordBombWire = {
    computeBombArea(
      centerX: number, centerY: number, radius: number = DEFAULT_RADIUS,
    ): Array<{ x: number; y: number }> {
      return computeBombArea(centerX, centerY, radius)
    },

    detonateBomb(
      centerX: number, centerY: number,
      gridWidth: number, gridHeight: number,
      chainLevel: number = 0,
    ): BombDetonationResult {
      const radius = DEFAULT_RADIUS
      const effectiveChain = Math.min(chainLevel, MAX_CHAIN_DEPTH)

      // Compute blast area and clamp to grid bounds
      const raw = computeBombArea(centerX, centerY, radius)
      const affectedCells = raw.filter((c) => inBounds(c.x, c.y, gridWidth, gridHeight))

      // The wire returns cells; the game loop classifies contents via
      // `classifyDetonation()`. Base result has zero obstacles/words.
      const obstaclesCleared = 0
      const wordsCleared = 0
      const secondaryBombs: Array<{ x: number; y: number }> = []

      // Score with chain multiplier
      const rawScore = calculateBombScore(obstaclesCleared, affectedCells.length)
      const multiplier = chainMultiplier(effectiveChain)
      const scoreBonus = Math.round(rawScore * multiplier)

      // Update lifetime statistics
      stats.totalDetonated += 1
      stats.totalObstaclesCleared += obstaclesCleared
      stats.totalCellsAffected += affectedCells.length
      stats.totalScoreFromBombs += scoreBonus
      if (effectiveChain > stats.biggestChain) stats.biggestChain = effectiveChain
      persist()

      return { affectedCells, obstaclesCleared, wordsCleared, scoreBonus, chainLevel: effectiveChain, radius, secondaryBombs }
    },

    armBomb(): void { armed = true },
    disarmBomb(): void { armed = false },
    isBombArmed(): boolean { return armed },
    consumeBomb(): void { armed = false },
    shouldDetonateOnEat(): boolean { return armed },

    calculateBombScore(obstaclesCleared: number, cellsAffected: number): number {
      return calculateBombScore(obstaclesCleared, cellsAffected)
    },

    getStats(): WordBombStats { return { ...stats } },

    resetStats(): void {
      stats = { ...DEFAULT_STATS }
      persist()
    },
  }

  return wire
}

// ── Chain reaction resolver ──────────────────────────────────────────────────

/**
 * Resolve a full chain-reaction sequence starting from an initial
 * detonation result. For each secondary bomb found in the blast,
 * recursively detonate via the wire until `MAX_CHAIN_DEPTH` is reached
 * or no more secondary bombs remain. BFS with visited set prevents loops.
 *
 * @returns Array of all detonation results in chain order (index 0 = initial blast).
 */
export function resolveChainReaction(
  wire: WordBombWire,
  initialResult: BombDetonationResult,
  gridWidth: number,
  gridHeight: number,
): BombDetonationResult[] {
  const chain: BombDetonationResult[] = [initialResult]
  const visited = new Set<string>()

  for (const cell of initialResult.affectedCells) visited.add(`${cell.x},${cell.y}`)

  const queue: Array<{ x: number; y: number; level: number }> = []
  for (const bomb of initialResult.secondaryBombs) {
    const key = `${bomb.x},${bomb.y}`
    if (!visited.has(key)) {
      visited.add(key)
      queue.push({ x: bomb.x, y: bomb.y, level: initialResult.chainLevel + 1 })
    }
  }

  while (queue.length > 0) {
    const next = queue.shift()!
    if (next.level > MAX_CHAIN_DEPTH) continue

    const result = wire.detonateBomb(next.x, next.y, gridWidth, gridHeight, next.level)
    chain.push(result)

    for (const bomb of result.secondaryBombs) {
      const key = `${bomb.x},${bomb.y}`
      if (!visited.has(key)) {
        visited.add(key)
        queue.push({ x: bomb.x, y: bomb.y, level: next.level + 1 })
      }
    }
  }

  return chain
}

// ── Utility: classify affected cells against game state ──────────────────────

/**
 * Given a raw detonation result and the current game-state arrays, produce
 * a classified result with accurate obstacle / word / secondary-bomb counts.
 * The game loop calls this AFTER `detonateBomb()` to get real counts.
 */
export function classifyDetonation(
  result: BombDetonationResult,
  obstacles: Array<{ x: number; y: number }>,
  words: Array<{ x: number; y: number }>,
  bombPowerUps: Array<{ x: number; y: number }>,
): BombDetonationResult {
  const blast = new Set<string>()
  for (const c of result.affectedCells) blast.add(`${c.x},${c.y}`)

  const inBlast = (p: { x: number; y: number }): boolean => blast.has(`${p.x},${p.y}`)

  const obstaclesCleared = obstacles.filter(inBlast).length
  const wordsCleared = words.filter(inBlast).length
  const secondaryBombs = bombPowerUps.filter(inBlast)

  // Recalculate score with real obstacle count and chain multiplier
  const rawScore = calculateBombScore(obstaclesCleared, result.affectedCells.length)
  const scoreBonus = Math.round(rawScore * Math.pow(CHAIN_MULTIPLIER_PER_LEVEL, result.chainLevel))

  return { ...result, obstaclesCleared, wordsCleared, scoreBonus, secondaryBombs }
}

// ── Utility: merge chain results into a single summary ───────────────────────

/**
 * Merge all chain-reaction results into a single aggregated
 * `BombDetonationResult` for UI display (e.g. combined score overlay).
 */
export function mergeChainResults(chainResults: BombDetonationResult[]): BombDetonationResult {
  if (chainResults.length === 0) {
    return {
      affectedCells: [], obstaclesCleared: 0, wordsCleared: 0,
      scoreBonus: 0, chainLevel: 0, radius: DEFAULT_RADIUS, secondaryBombs: [],
    }
  }

  const allCells: Array<{ x: number; y: number }> = []
  const seen = new Set<string>()
  let totalObstacles = 0, totalWords = 0, totalScore = 0
  let maxChain = 0, maxRadius = DEFAULT_RADIUS
  const allSecondary: Array<{ x: number; y: number }> = []

  for (const r of chainResults) {
    for (const cell of r.affectedCells) {
      const key = `${cell.x},${cell.y}`
      if (!seen.has(key)) { seen.add(key); allCells.push(cell) }
    }
    totalObstacles += r.obstaclesCleared
    totalWords += r.wordsCleared
    totalScore += r.scoreBonus
    if (r.chainLevel > maxChain) maxChain = r.chainLevel
    if (r.radius > maxRadius) maxRadius = r.radius
    allSecondary.push(...r.secondaryBombs)
  }

  return {
    affectedCells: allCells, obstaclesCleared: totalObstacles, wordsCleared: totalWords,
    scoreBonus: totalScore, chainLevel: maxChain, radius: maxRadius, secondaryBombs: allSecondary,
  }
}
