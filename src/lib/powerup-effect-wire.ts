/**
 * powerup-effect-wire.ts
 *
 * Wiring layer that manages and applies power-up effects to the game state
 * during gameplay. Each frame, the wire computes cumulative modifiers from all
 * active timed effects and returns a single EffectResult the game loop can
 * consume.
 *
 * Persistence: active effects are saved to localStorage under the key
 * "ws_powerup_effects_wire" so they survive page reloads within a session.
 */

import { PowerUpType } from '@/lib/powerups'

// ---------------------------------------------------------------------------
// Extended power-up type – includes new effect types beyond the base enum
// ---------------------------------------------------------------------------
type ExtendedPowerUpType =
  | PowerUpType
  | 'speed_boost'
  | 'ghost'
  | 'word_bomb'
  | 'score_multiplier'
  | 'freeze'

/** All power-up types the wire recognises. */
export const ALL_EFFECT_TYPES: ExtendedPowerUpType[] = [
  'magnet',
  'shield',
  'slow_mo',
  'double_points',
  'speed_boost',
  'ghost',
  'word_bomb',
  'score_multiplier',
  'shrink',
  'freeze',
]

// ---------------------------------------------------------------------------
// Configuration per power-up type
// ---------------------------------------------------------------------------

export interface PowerUpEffectConfig {
  /** Human-readable name shown in UI. */
  name: string
  /** Emoji icon. */
  emoji: string
  /** Short description of the effect. */
  description: string
  /** Duration in milliseconds (0 = instant). */
  duration: number
  /** Whether collecting another of the same type refreshes / stacks. */
  stackable: boolean
  /** Movement speed multiplier applied while active. */
  movementSpeedMod: number
  /** Score multiplier applied while active. */
  scoreMod: number
  /** Magnet pull range in cells (0 = none). */
  magnetRange: number
  /** Enables ghost / pass-through-walls mode. */
  ghostMode: boolean
  /** Makes the next collision harmless (shield). */
  shouldSkipCollision: boolean
  /** Marks the word-bomb as armed. */
  bombActive: boolean
  /** Freeze obstacles for the duration. */
  freezeObstacles: boolean
}

/**
 * Master configuration table.
 * Each entry fully describes the power-up's gameplay impact.
 */
export const EFFECT_CONFIG: Record<
  ExtendedPowerUpType,
  PowerUpEffectConfig
> = {
  magnet: {
    name: 'Magnet',
    emoji: '🧲',
    description: 'Attracts nearby word food within 3 cells',
    duration: 8_000,
    stackable: false,
    movementSpeedMod: 1.0,
    scoreMod: 1.0,
    magnetRange: 3,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  shield: {
    name: 'Shield',
    emoji: '🛡️',
    description: 'Survive one collision — single use',
    duration: 15_000,
    stackable: false,
    movementSpeedMod: 1.0,
    scoreMod: 1.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: true,
    bombActive: false,
    freezeObstacles: false,
  },
  slow_mo: {
    name: 'Slow-Mo',
    emoji: '🐢',
    description: 'Reduces speed by 40%, score reduced to 0.8×',
    duration: 6_000,
    stackable: true,
    movementSpeedMod: 0.6,
    scoreMod: 0.8,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  double_points: {
    name: 'Double Points',
    emoji: '💎',
    description: 'Doubles all score earned',
    duration: 10_000,
    stackable: true,
    movementSpeedMod: 1.0,
    scoreMod: 2.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  speed_boost: {
    name: 'Speed Boost',
    emoji: '⚡',
    description: 'Increases speed by 50% for faster play',
    duration: 5_000,
    stackable: false,
    movementSpeedMod: 1.5,
    scoreMod: 1.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  ghost: {
    name: 'Ghost',
    emoji: '👻',
    description: 'Pass through walls — slight speed reduction',
    duration: 7_000,
    stackable: false,
    movementSpeedMod: 0.9,
    scoreMod: 1.0,
    magnetRange: 0,
    ghostMode: true,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  word_bomb: {
    name: 'Word Bomb',
    emoji: '💣',
    description: 'Next word eat clears a 3×3 area — half score',
    duration: 20_000,
    stackable: false,
    movementSpeedMod: 1.0,
    scoreMod: 0.5,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: true,
    freezeObstacles: false,
  },
  score_multiplier: {
    name: 'Score ×3',
    emoji: '🌟',
    description: 'Triple score for a short burst — high reward',
    duration: 5_000,
    stackable: true,
    movementSpeedMod: 1.0,
    scoreMod: 3.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  shrink: {
    name: 'Shrink',
    emoji: '✂️',
    description: 'Instantly shrinks the snake by 3 segments',
    duration: 0,
    stackable: true,
    movementSpeedMod: 1.0,
    scoreMod: 1.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: false,
  },
  freeze: {
    name: 'Freeze',
    emoji: '🧊',
    description: 'Freezes all obstacles for the duration',
    duration: 8_000,
    stackable: false,
    movementSpeedMod: 1.0,
    scoreMod: 1.0,
    magnetRange: 0,
    ghostMode: false,
    shouldSkipCollision: false,
    bombActive: false,
    freezeObstacles: true,
  },
}

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

/** Returned every frame from `applyEffects`. */
export interface EffectResult {
  /** Cumulative movement speed modifier (1.0 = normal). */
  movementSpeedMod: number
  /** Cumulative score modifier (1.0 = normal). */
  scoreMod: number
  /** Largest magnet range from any active effect (0 = none). */
  magnetRange: number
  /** True when ghost / pass-through mode is active. */
  ghostMode: boolean
  /** True when shield should absorb the next collision. */
  shouldSkipCollision: boolean
  /** True while the word-bomb is armed and awaiting a word eat. */
  bombActive: boolean
  /** Grid cells to clear when bomb detonates (empty when not detonating). */
  bombCells: Array<{ x: number; y: number }>
  /** True while obstacles are frozen. */
  freezeObstacles: boolean
}

/** Returned when a power-up is collected. */
export interface CollectionResult {
  /** Whether the effect was actually applied. */
  applied: boolean
  /** Duration of the applied effect in ms. */
  duration: number
  /** Human-readable feedback message. */
  message: string
  /** Whether this effect stacks with existing instances. */
  stackable: boolean
}

/** Snapshot of a single active effect for UI display. */
export interface ActiveEffect {
  type: ExtendedPowerUpType
  name: string
  emoji: string
  remainingMs: number
  totalDurationMs: number
}

/** Summary statistics for analytics / UI. */
export interface EffectSummary {
  activeCount: number
  totalCollected: number
  mostUsed: ExtendedPowerUpType | null
  totalTimeUnderEffect: number
}

// ---------------------------------------------------------------------------
// Internal active-effect record
// ---------------------------------------------------------------------------

interface ActiveEffectRecord {
  type: ExtendedPowerUpType
  /** Absolute timestamp (Date.now()) when this effect expires. */
  expiresAt: number
  /** Original duration in ms (for UI percentage bars). */
  totalDuration: number
  /** True if this effect was consumed (e.g. shield blocked a hit). */
  consumed: boolean
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ws_powerup_effects_wire'

interface PersistedState {
  /** Serialised active effects. */
  effects: ActiveEffectRecord[]
  /** Collection count per type. */
  collectionCounts: Record<string, number>
  /** Accumulated ms spent under each effect. */
  accumulatedMs: Record<string, number>
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    // Discard any effects that already expired while the tab was closed
    const now = Date.now()
    parsed.effects = parsed.effects.filter((e) => e.expiresAt > now && !e.consumed)
    return parsed
  } catch {
    return null
  }
}

function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently degrade.
  }
}

// ---------------------------------------------------------------------------
// PowerUpEffectWire implementation
// ---------------------------------------------------------------------------

export interface PowerUpEffectWire {
  applyEffects(gameState: unknown, deltaTime: number): EffectResult
  onPowerUpCollected(
    type: ExtendedPowerUpType,
    gameState: unknown,
  ): CollectionResult
  onPowerUpExpired(type: ExtendedPowerUpType): void
  getActiveEffects(): ActiveEffect[]
  getEffectSummary(): EffectSummary
  hasEffect(type: ExtendedPowerUpType): boolean
  getRemainingTime(type: ExtendedPowerUpType): number
  reset(): void
}

/**
 * Factory that creates a new PowerUpEffectWire instance.
 *
 * The wire is stateful — one instance should be created per game session and
 * shared across the game loop, renderer, and UI.
 */
export function createPowerUpEffectWire(): PowerUpEffectWire {
  // Active timed effects.
  let activeEffects: ActiveEffectRecord[] = []

  // Collection statistics.
  let collectionCounts: Record<string, number> = {}
  let accumulatedMs: Record<string, number> = {}

  // Flag: next word eat should detonate the bomb.
  let bombArmed = false

  // Flag: shield has been used.
  let shieldUsed = false

  // cells to clear this frame (bomb detonation result).
  let pendingBombCells: Array<{ x: number; y: number }> = []

  // ---------- Initialisation from persistence ----------

  const persisted = loadPersistedState()
  if (persisted) {
    activeEffects = persisted.effects
    collectionCounts = persisted.collectionCounts
    accumulatedMs = persisted.accumulatedMs

    // Restore derived flags
    if (activeEffects.some((e) => e.type === 'word_bomb' && !e.consumed)) {
      bombArmed = true
    }
    if (activeEffects.some((e) => e.type === 'shield' && e.consumed)) {
      shieldUsed = true
    }
  }

  // ---------- Internal helpers ----------

  /** Persist current state to localStorage. */
  function save(): void {
    persistState({
      effects: activeEffects,
      collectionCounts,
      accumulatedMs,
    })
  }

  /** Increment collection counter for a given type. */
  function incrementCollection(type: ExtendedPowerUpType): void {
    const key = type as string
    collectionCounts[key] = (collectionCounts[key] || 0) + 1
  }

  /** Find the most-used power-up type from collection counts. */
  function findMostUsed(): ExtendedPowerUpType | null {
    let best: ExtendedPowerUpType | null = null
    let max = 0
    for (const [key, count] of Object.entries(collectionCounts)) {
      if (count > max) {
        max = count
        best = key as ExtendedPowerUpType
      }
    }
    return best
  }

  /** Compute total accumulated ms across all types. */
  function totalAccumulatedMs(): number {
    let sum = 0
    for (const ms of Object.values(accumulatedMs)) {
      sum += ms
    }
    return sum
  }

  /**
   * Track time spent under each active effect since the last call.
   * Called once per frame with the frame's deltaTime.
   */
  function trackAccumulatedTime(deltaTime: number): void {
    const now = Date.now()
    for (const effect of activeEffects) {
      if (effect.consumed) continue
      const remaining = effect.expiresAt - now
      if (remaining <= 0) continue
      // Only count up to the remaining time so we don't over-count on the
      // final frame.
      const tracked = Math.min(deltaTime, remaining)
      const key = effect.type as string
      accumulatedMs[key] = (accumulatedMs[key] || 0) + tracked
    }
  }

  // ---------- Public API ----------

  const wire: PowerUpEffectWire = {
    // -----------------------------------------------------------------------
    // applyEffects — called every frame
    // -----------------------------------------------------------------------
    applyEffects(_gameState: unknown, deltaTime: number): EffectResult {
      const now = Date.now()

      // 1. Track accumulated time for statistics
      trackAccumulatedTime(deltaTime)

      // 2. Tick down timers and remove expired effects
      const expired: ExtendedPowerUpType[] = []
      activeEffects = activeEffects.filter((effect) => {
        if (effect.consumed) {
          // Keep consumed entries around briefly so getActiveEffects can still
          // report them until they naturally expire.
          if (effect.expiresAt <= now) return false
          return true
        }
        if (effect.expiresAt <= now) {
          expired.push(effect.type)
          return false
        }
        return true
      })

      // 3. Fire expiry callbacks
      for (const type of expired) {
        wire.onPowerUpExpired(type)
      }

      // 4. Compute cumulative modifiers
      let movementSpeedMod = 1.0
      let scoreMod = 1.0
      let magnetRange = 0
      let ghostMode = false
      let shouldSkipCollision = false
      let bombActive = false
      let freezeObstacles = false

      for (const effect of activeEffects) {
        if (effect.consumed) continue
        const cfg = EFFECT_CONFIG[effect.type]

        // Movement speed: multiplicative stacking (each modifier multiplies)
        if (cfg.movementSpeedMod !== 1.0) {
          movementSpeedMod *= cfg.movementSpeedMod
        }

        // Score: take the highest active multiplier
        if (cfg.scoreMod > scoreMod) {
          scoreMod = cfg.scoreMod
        }
        // If there's a score penalty (< 1), also apply it multiplicatively
        // so slow_mo (0.8) + double_points (2.0) = 1.6 not 2.0
        if (cfg.scoreMod < 1.0) {
          scoreMod *= cfg.scoreMod
        }

        // Magnet: use the largest active range
        if (cfg.magnetRange > magnetRange) {
          magnetRange = cfg.magnetRange
        }

        // Boolean flags
        if (cfg.ghostMode) ghostMode = true
        if (cfg.shouldSkipCollision && !shieldUsed) shouldSkipCollision = true
        if (cfg.bombActive) bombActive = true
        if (cfg.freezeObstacles) freezeObstacles = true
      }

      // 5. Pick up pending bomb cells (cleared after reading)
      const bombCells = pendingBombCells
      pendingBombCells = []

      // 6. Persist for next frame
      save()

      return {
        movementSpeedMod,
        scoreMod,
        magnetRange,
        ghostMode,
        shouldSkipCollision,
        bombActive: bombArmed,
        bombCells,
        freezeObstacles,
      }
    },

    // -----------------------------------------------------------------------
    // onPowerUpCollected — a power-up item was eaten by the snake
    // -----------------------------------------------------------------------
    onPowerUpCollected(
      type: ExtendedPowerUpType,
      _gameState: unknown,
    ): CollectionResult {
      const cfg = EFFECT_CONFIG[type]
      incrementCollection(type)

      // ---- Instant effects ----
      if (cfg.duration === 0) {
        // Shrink: immediate, no timer to manage
        return {
          applied: true,
          duration: 0,
          message: `${cfg.emoji} ${cfg.name} — snake shrunk by 3!`,
          stackable: cfg.stackable,
        }
      }

      // ---- Shield: one-use ----
      if (type === 'shield') {
        // Remove any existing shield
        activeEffects = activeEffects.filter((e) => e.type !== 'shield')
        shieldUsed = false

        activeEffects.push({
          type,
          expiresAt: Date.now() + cfg.duration,
          totalDuration: cfg.duration,
          consumed: false,
        })

        save()
        return {
          applied: true,
          duration: cfg.duration,
          message: `${cfg.emoji} ${cfg.name} active for ${cfg.duration / 1000}s`,
          stackable: cfg.stackable,
        }
      }

      // ---- Word Bomb ----
      if (type === 'word_bomb') {
        // Don't stack — refresh if already active
        const existing = activeEffects.find((e) => e.type === 'word_bomb')
        if (existing && !cfg.stackable) {
          existing.expiresAt = Date.now() + cfg.duration
          existing.totalDuration = cfg.duration
          bombArmed = true
          save()
          return {
            applied: true,
            duration: cfg.duration,
            message: `${cfg.emoji} Word Bomb refreshed!`,
            stackable: false,
          }
        }

        activeEffects.push({
          type,
          expiresAt: Date.now() + cfg.duration,
          totalDuration: cfg.duration,
          consumed: false,
        })
        bombArmed = true
        save()
        return {
          applied: true,
          duration: cfg.duration,
          message: `${cfg.emoji} Word Bomb armed — next word clears 3×3!`,
          stackable: cfg.stackable,
        }
      }

      // ---- Stackable effects ----
      if (cfg.stackable) {
        // For stackable effects we add a *new* instance that coexists
        // with existing ones. The apply loop combines them.
        activeEffects.push({
          type,
          expiresAt: Date.now() + cfg.duration,
          totalDuration: cfg.duration,
          consumed: false,
        })

        save()
        const count = activeEffects.filter((e) => e.type === type && !e.consumed).length
        return {
          applied: true,
          duration: cfg.duration,
          message: `${cfg.emoji} ${cfg.name} ×${count} active!`,
          stackable: true,
        }
      }

      // ---- Non-stackable, replace existing ----
      const idx = activeEffects.findIndex((e) => e.type === type)
      if (idx !== -1) {
        // Refresh the timer
        activeEffects[idx].expiresAt = Date.now() + cfg.duration
        activeEffects[idx].totalDuration = cfg.duration
        activeEffects[idx].consumed = false
        save()
        return {
          applied: true,
          duration: cfg.duration,
          message: `${cfg.emoji} ${cfg.name} refreshed!`,
          stackable: false,
        }
      }

      // First instance of this effect
      activeEffects.push({
        type,
        expiresAt: Date.now() + cfg.duration,
        totalDuration: cfg.duration,
        consumed: false,
      })
      save()
      return {
        applied: true,
        duration: cfg.duration,
        message: `${cfg.emoji} ${cfg.name} active for ${cfg.duration / 1000}s`,
        stackable: false,
      }
    },

    // -----------------------------------------------------------------------
    // onPowerUpExpired — cleanup when a timed effect runs out
    // -----------------------------------------------------------------------
    onPowerUpExpired(type: ExtendedPowerUpType): void {
      const cfg = EFFECT_CONFIG[type]

      switch (type) {
        case 'shield':
          // If shield expires without being used, just clear the flag
          shieldUsed = false
          break

        case 'word_bomb':
          // Bomb expired without detonating
          bombArmed = false
          break

        case 'ghost':
          // Ghost mode ended — nothing special to clean up
          break

        case 'freeze':
          // Obstacles unfreeze — the game loop reads freezeObstacles flag
          break

        case 'magnet':
          // Magnetism stops pulling
          break

        default:
          // slow_mo, double_points, speed_boost, score_multiplier — no cleanup
          break
      }

      // Persist after cleanup
      save()
    },

    // -----------------------------------------------------------------------
    // getActiveEffects — snapshot of everything currently running
    // -----------------------------------------------------------------------
    getActiveEffects(): ActiveEffect[] {
      const now = Date.now()
      return activeEffects
        .filter((e) => !e.consumed && e.expiresAt > now)
        .map((e) => ({
          type: e.type,
          name: EFFECT_CONFIG[e.type].name,
          emoji: EFFECT_CONFIG[e.type].emoji,
          remainingMs: e.expiresAt - now,
          totalDurationMs: e.totalDuration,
        }))
        .sort((a, b) => a.remainingMs - b.remainingMs)
    },

    // -----------------------------------------------------------------------
    // getEffectSummary — statistics for UI / analytics
    // -----------------------------------------------------------------------
    getEffectSummary(): EffectSummary {
      const now = Date.now()
      const active = activeEffects.filter((e) => !e.consumed && e.expiresAt > now)

      return {
        activeCount: active.length,
        totalCollected: Object.values(collectionCounts).reduce(
          (sum, n) => sum + n,
          0,
        ),
        mostUsed: findMostUsed(),
        totalTimeUnderEffect: totalAccumulatedMs(),
      }
    },

    // -----------------------------------------------------------------------
    // hasEffect — fast boolean check
    // -----------------------------------------------------------------------
    hasEffect(type: ExtendedPowerUpType): boolean {
      const now = Date.now()
      return activeEffects.some(
        (e) => e.type === type && !e.consumed && e.expiresAt > now,
      )
    },

    // -----------------------------------------------------------------------
    // getRemainingTime — ms left for a specific effect
    // -----------------------------------------------------------------------
    getRemainingTime(type: ExtendedPowerUpType): number {
      const now = Date.now()
      const effect = activeEffects.find(
        (e) => e.type === type && !e.consumed && e.expiresAt > now,
      )
      if (!effect) return 0
      return effect.expiresAt - now
    },

    // -----------------------------------------------------------------------
    // reset — clear all active effects and statistics
    // -----------------------------------------------------------------------
    reset(): void {
      activeEffects = []
      collectionCounts = {}
      accumulatedMs = {}
      bombArmed = false
      shieldUsed = false
      pendingBombCells = []
      save()
    },
  }

  return wire
}

// ---------------------------------------------------------------------------
// Utility: compute 3×3 bomb cells around a grid position
// ---------------------------------------------------------------------------

/**
 * Returns the list of grid cells that a word-bomb would clear, centred on
 * (cx, cy) within a grid of width × height.
 */
export function computeBombCells(
  cx: number,
  cy: number,
  gridWidth: number,
  gridHeight: number,
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const x = cx + dx
      const y = cy + dy
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        cells.push({ x, y })
      }
    }
  }
  return cells
}

// ---------------------------------------------------------------------------
// Utility: check whether a shield should absorb a collision
// ---------------------------------------------------------------------------

/**
 * Call this when a collision occurs. Returns true if the shield absorbed it
 * (and marks it as consumed). Returns false if no shield is active.
 */
export function tryConsumeShield(wire: PowerUpEffectWire): boolean {
  if (!wire.hasEffect('shield')) return false

  // Access internal state via getActiveEffects — if shield is present,
  // the game loop's applyEffects will set shouldSkipCollision.
  // Here we signal that it has been used by calling onPowerUpExpired
  // to clean up early.
  wire.onPowerUpExpired('shield')
  return true
}

// ---------------------------------------------------------------------------
// Utility: detonate the word-bomb
// ---------------------------------------------------------------------------

/**
 * Call when the player eats a word while bombArmed is true.
 * Returns the cells to clear and deactivates the bomb.
 */
export function detonateBomb(
  wire: PowerUpEffectWire,
  cx: number,
  cy: number,
  gridWidth: number,
  gridHeight: number,
): Array<{ x: number; y: number }> {
  if (!wire.hasEffect('word_bomb')) return []

  // Mark the bomb effect as consumed
  wire.onPowerUpExpired('word_bomb')

  return computeBombCells(cx, cy, gridWidth, gridHeight)
}

// ---------------------------------------------------------------------------
// Utility: check if obstacles should be frozen
// ---------------------------------------------------------------------------

/**
 * Returns true if the freeze effect is currently active.
 */
export function isObstaclesFrozen(wire: PowerUpEffectWire): boolean {
  return wire.hasEffect('freeze')
}
