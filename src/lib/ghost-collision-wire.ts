/**
 * ghost-collision-wire.ts
 *
 * Pure-logic module that wires ghost mode collision bypass into the game loop.
 * When the ghost power-up is active (indicated by `ghostMode: boolean` from
 * `powerup-effect-wire`'s `EffectResult`), this module:
 *
 *   • Bypasses wall, self-body, and obstacle collisions entirely
 *   • Wraps the snake head to the opposite grid edge (portal-style) when it
 *     exits bounds
 *   • Provides visual feedback parameters (alpha, trail length) for the canvas
 *     renderer
 *   • Tracks session & lifetime statistics with localStorage persistence
 *
 * Persistence key: `ws_ghost_collision_wire`
 *
 * This module has NO React imports — it is safe to call from the game loop,
 * canvas renderer, or any non-UI context.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Cumulative statistics for ghost mode across all sessions.
 * Persisted to `localStorage` so they survive page reloads.
 */
export interface GhostCollisionStats {
  /** Total number of times ghost mode was activated. */
  totalActivations: number
  /** Total walls passed through (wrap-arounds). */
  totalWallsPassed: number
  /** Total times the snake passed through its own body. */
  totalSelfPasses: number
  /** Total obstacles passed through. */
  totalObstaclesPassed: number
  /** Cumulative seconds spent in ghost mode. */
  totalGhostTime: number
}

/**
 * The ghost collision wire — one instance should be created per application
 * lifecycle and shared across the game loop, renderer, and UI.
 */
export interface GhostCollisionWire {
  // ---- Collision bypass queries (called every frame from game loop) ----

  /**
   * Returns `true` when ghost mode is active and wall collisions should be
   * bypassed in favour of portal-style wrapping.
   */
  shouldBypassWallCollision(ghostMode: boolean): boolean

  /**
   * Returns `true` when ghost mode is active and self-body collisions should
   * be ignored (the snake can overlap itself freely).
   */
  shouldBypassSelfCollision(ghostMode: boolean): boolean

  /**
   * Returns `true` when ghost mode is active and obstacle collisions should
   * be ignored (the snake passes through obstacles).
   */
  shouldBypassObstacleCollision(ghostMode: boolean): boolean

  // ---- Position wrapping (called after movement, before collision check) ----

  /**
   * Wraps a grid position to the opposite edge when it falls outside the
   * grid bounds.
   *
   * @param x           - Current x coordinate (may be out of bounds).
   * @param y           - Current y coordinate (may be out of bounds).
   * @param gridWidth   - Width of the grid in cells.
   * @param gridHeight  - Height of the grid in cells.
   * @returns The wrapped `{x, y}` position guaranteed to be in-bounds.
   */
  wrapPosition(
    x: number,
    y: number,
    gridWidth: number,
    gridHeight: number,
  ): { x: number; y: number }

  // ---- Visual feedback data (consumed by canvas renderer) ----

  /**
   * Returns the opacity/alpha the snake should be rendered at.
   * Ghost mode uses a semi-transparent look (0.35) so the player can see
   * through the snake to the cells beneath.
   */
  getGhostAlpha(ghostMode: boolean): number

  /**
   * Returns the number of afterimage trail segments to draw behind the
   * snake head while ghost mode is active.
   */
  getGhostTrailLength(ghostMode: boolean): number

  // ---- Lifecycle hooks (called by the power-up system) ----

  /**
   * Notify the wire that ghost mode was just activated.
   * Increments the activation counter and starts the duration timer.
   */
  onGhostActivated(): void

  /**
   * Notify the wire that ghost mode has ended.
   * Stops the duration timer and persists statistics.
   */
  onGhostDeactivated(): void

  // ---- Pass-through event counters (called on bypass) ----

  /** Increment the wall-pass counter (called each time the snake wraps). */
  onWallPass(): void

  /** Increment the self-pass counter (called each frame a self overlap is bypassed). */
  onSelfPass(): void

  /** Increment the obstacle-pass counter (called each frame an obstacle is bypassed). */
  onObstaclePass(): void

  // ---- Timer & active state ----

  /**
   * Accumulate ghost-mode time. Call every frame with the delta in seconds
   * and the current ghost mode flag. Only accumulates when `ghostMode` is true.
   */
  updateGhostTime(deltaSeconds: number, ghostMode: boolean): void

  /**
   * Returns `true` if ghost mode is currently active.
   * Convenience wrapper around the `ghostMode` boolean.
   */
  isGhostActive(ghostMode: boolean): boolean

  /**
   * Returns the number of seconds the current ghost mode activation has been
   * running, or 0 if ghost mode is not active.
   */
  getGhostDuration(): number

  /**
   * Returns the total number of pass-through events (walls + self + obstacles)
   * during the current ghost activation.
   */
  getGhostPassCount(): number

  // ---- Statistics & persistence ----

  /** Returns a snapshot of cumulative ghost mode statistics. */
  getStats(): GhostCollisionStats

  /** Resets all statistics to zero and clears persisted data. */
  resetStats(): void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key used for persistence. */
const STORAGE_KEY = 'ws_ghost_collision_wire'

/** Alpha value for the snake while ghost mode is active. */
const GHOST_ALPHA = 0.35

/** Alpha value for the snake in normal mode (fully opaque). */
const NORMAL_ALPHA = 1.0

/** Number of afterimage trail segments while ghost mode is active. */
const GHOST_TRAIL_LENGTH = 8

/** Number of trail segments in normal mode (none). */
const NORMAL_TRAIL_LENGTH = 0

// ---------------------------------------------------------------------------
// Internal persisted state shape
// ---------------------------------------------------------------------------

/** Alias for persisted state shape. */
type PersistedState = GhostCollisionStats

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Reads persisted ghost stats from localStorage.
 * Returns `null` when no data exists or the data is corrupt.
 */
function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    // Corrupt or unavailable — start fresh.
    return null
  }
}

/**
 * Writes the current ghost stats to localStorage.
 * Silently degrades if storage is full or unavailable.
 */
function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently degrade.
  }
}

// ---------------------------------------------------------------------------
// Default stats factory
// ---------------------------------------------------------------------------

function createDefaultStats(): GhostCollisionStats {
  return {
    totalActivations: 0,
    totalWallsPassed: 0,
    totalSelfPasses: 0,
    totalObstaclesPassed: 0,
    totalGhostTime: 0,
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new `GhostCollisionWire` instance.
 *
 * The wire is stateful. Create one instance per application lifecycle and
 * share it across the game loop, renderer, and any UI that needs ghost stats.
 *
 * On construction the wire loads previously persisted statistics from
 * localStorage so cumulative counters survive page reloads.
 */
export function createGhostCollisionWire(): GhostCollisionWire {
  // ---- Persisted lifetime statistics ----
  const persisted = loadPersistedState()
  const stats: GhostCollisionStats = persisted
    ? { ...persisted }
    : createDefaultStats()

  // ---- Per-activation runtime state ----

  /**
   * `true` between `onGhostActivated()` and `onGhostDeactivated()`.
   * Used to deduplicate activation/deactivation events.
   */
  let currentlyActive = false

  /**
   * Seconds elapsed since the most recent ghost activation.
   * Reset to 0 on each activation.
   */
  let currentDuration = 0

  /**
   * Number of pass-through events during the current activation.
   * Reset to 0 on each activation.
   */
  let currentPassCount = 0

  // ---- Internal helpers ----

  /** Persist current stats to localStorage. */
  function save(): void {
    persistState(stats)
  }

  /**
   * Modulo utility that always returns a positive remainder, even for
   * negative dividends. This is essential for wrapping positions that
   * may go below zero.
   *
   * Example: `positiveMod(-1, 10)` → `9`
   */
  function positiveMod(n: number, m: number): number {
    return ((n % m) + m) % m
  }

  // ---- Wire implementation ----

  const wire: GhostCollisionWire = {
    // -----------------------------------------------------------------------
    // Collision bypass queries
    // -----------------------------------------------------------------------

    shouldBypassWallCollision(ghostMode: boolean): boolean {
      return ghostMode === true
    },

    shouldBypassSelfCollision(ghostMode: boolean): boolean {
      return ghostMode === true
    },

    shouldBypassObstacleCollision(ghostMode: boolean): boolean {
      return ghostMode === true
    },

    // -----------------------------------------------------------------------
    // Position wrapping
    // -----------------------------------------------------------------------

    wrapPosition(
      x: number,
      y: number,
      gridWidth: number,
      gridHeight: number,
    ): { x: number; y: number } {
      // When the position is already within bounds, return it unchanged.
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        return { x, y }
      }

      // Use positive modulo to wrap negative values correctly.
      const wrappedX = positiveMod(x, gridWidth)
      const wrappedY = positiveMod(y, gridHeight)

      return { x: wrappedX, y: wrappedY }
    },

    // -----------------------------------------------------------------------
    // Visual feedback data
    // -----------------------------------------------------------------------

    getGhostAlpha(ghostMode: boolean): number {
      return ghostMode ? GHOST_ALPHA : NORMAL_ALPHA
    },

    getGhostTrailLength(ghostMode: boolean): number {
      return ghostMode ? GHOST_TRAIL_LENGTH : NORMAL_TRAIL_LENGTH
    },

    // -----------------------------------------------------------------------
    // Lifecycle hooks
    // -----------------------------------------------------------------------

    onGhostActivated(): void {
      // Guard against duplicate activations.
      if (currentlyActive) return

      currentlyActive = true
      currentDuration = 0
      currentPassCount = 0

      stats.totalActivations += 1
      save()
    },

    onGhostDeactivated(): void {
      // Guard against duplicate deactivations.
      if (!currentlyActive) return

      currentlyActive = false

      // The accumulated time has already been added via updateGhostTime,
      // but we ensure the final snapshot is persisted.
      save()
    },

    // -----------------------------------------------------------------------
    // Pass-through event counters
    // -----------------------------------------------------------------------

    onWallPass(): void {
      if (!currentlyActive) return
      stats.totalWallsPassed += 1
      currentPassCount += 1
      save()
    },

    onSelfPass(): void {
      if (!currentlyActive) return
      stats.totalSelfPasses += 1
      currentPassCount += 1
      save()
    },

    onObstaclePass(): void {
      if (!currentlyActive) return
      stats.totalObstaclesPassed += 1
      currentPassCount += 1
      save()
    },

    // -----------------------------------------------------------------------
    // Timer & active state
    // -----------------------------------------------------------------------

    updateGhostTime(deltaSeconds: number, ghostMode: boolean): void {
      if (!ghostMode) return
      if (!currentlyActive) return

      currentDuration += deltaSeconds
      stats.totalGhostTime += deltaSeconds
    },

    isGhostActive(ghostMode: boolean): boolean {
      return ghostMode === true
    },

    getGhostDuration(): number {
      return currentlyActive ? currentDuration : 0
    },

    getGhostPassCount(): number {
      return currentlyActive ? currentPassCount : 0
    },

    // -----------------------------------------------------------------------
    // Statistics & persistence
    // -----------------------------------------------------------------------

    getStats(): GhostCollisionStats {
      return { ...stats }
    },

    resetStats(): void {
      stats.totalActivations = 0
      stats.totalWallsPassed = 0
      stats.totalSelfPasses = 0
      stats.totalObstaclesPassed = 0
      stats.totalGhostTime = 0

      currentDuration = 0
      currentPassCount = 0
      currentlyActive = false

      save()
    },
  }

  return wire
}
