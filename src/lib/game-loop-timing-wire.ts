// ─── Game Loop Timing Wire ─────────────────────────────────────────────────
// Accumulator-based timing controller that wires SpeedConfig and GameModeEngine
// frame-interval modifiers into the actual game tick cadence.
//
// Pure logic module — no React, no DOM, no side-effects beyond the returned
// mutable controller object.

import type { SpeedConfig } from './game-speed-config';
import { getFrameInterval } from './game-speed-config';
import type { GameModeEngine } from './game-mode-engine';
import { getFrameIntervalModifier } from './game-mode-engine';

// ─── Constants ─────────────────────────────────────────────────────────────

/** Hard lower-bound on the interval between game ticks (≈33 FPS cap). */
const MIN_INTERVAL_MS = 30;

/** Hard upper-bound on the interval between game ticks (≈2 FPS floor). */
const MAX_INTERVAL_MS = 500;

/** Maximum number of FPS samples kept for rolling-average calculations. */
const FPS_HISTORY_SIZE = 60;

/** Percentage threshold for the "isAccurate" flag in getMetrics(). */
const ACCURACY_THRESHOLD = 0.05; // 5 %

/** Turbo mode multiplier — halves the interval for 2× speed. */
const TURBO_MULTIPLIER = 0.5;

/** The absolute floor even turbo mode cannot breach. */
const TURBO_FLOOR_MS = 30;

// ─── Types ─────────────────────────────────────────────────────────────────

/** Snap-shot of timing metrics, suitable for HUD overlays or dev-tools. */
export interface TimingMetrics {
  /** Instantaneous frames-per-second derived from the last delta. */
  currentFPS: number;
  /** Rolling average FPS over the last N samples. */
  avgFPS: number;
  /** The computed interval (ms) the controller is currently targeting. */
  targetIntervalMs: number;
  /** Total number of game ticks emitted since the last reset. */
  tickCount: number;
  /** Whether the actual tick rate is within 5 % of the target. */
  isAccurate: boolean;
}

/** The public surface returned by createTimingController(). */
export interface TimingController {
  /** Absolute timestamp (ms) of the most recent tick. */
  lastTickTime: number;
  /** Computed target interval (ms) between ticks. */
  targetIntervalMs: number;
  /** Accumulator used for fixed-timestep interpolation. */
  accumulator: number;
  /** Whether the controller is currently paused. */
  isPaused: boolean;
  /** Monotonically increasing count of ticks emitted. */
  tickCount: number;
  /** Ring-buffer of recent frame-delta measurements (in ms). */
  fpsHistory: number[];
  /** Instantaneous FPS computed from the last frame delta. */
  currentFPS: number;
  /** Whether turbo mode is active. */
  isTurbo: boolean;

  // ── Core methods ──

  /**
   * Recompute the target tick interval from a speed config and an optional
   * game-mode engine.  Call this whenever either source changes (e.g. mode
   * switch, speed slider drag).
   */
  updateTiming(speedConfig: SpeedConfig, modeEngine: GameModeEngine | null): void;

  /**
   * Feed a frame delta (ms) into the accumulator.  Returns `true` when one
   * or more game ticks should fire.  Each call may consume multiple intervals
   * when the game is running at very slow speeds (large intervals).
   *
   * IMPORTANT: call this in a loop until it returns `false` to drain all
   * pending ticks, or handle the accumulator remainder yourself.
   */
  shouldTick(deltaTimeMs: number): boolean;

  /** Return a TimingMetrics snapshot suitable for display or logging. */
  getMetrics(): TimingMetrics;

  /** Freeze the controller — shouldTick will always return false. */
  pause(): void;

  /** Unfreeze the controller and reset the accumulator so ticks resume cleanly. */
  resume(): void;

  /** Reset all internal state to initial values. */
  reset(): void;

  /**
   * Enable or disable turbo mode (2× speed).  When enabled the target
   * interval is halved (clamped to TURBO_FLOOR_MS).  When disabled the
   * interval is recalculated from the last known speed config / mode engine.
   */
  setTurboMode(enabled: boolean): void;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * Clamp a value between min and max.  Kept local to avoid pulling in a
 * generic math utility.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely record a frame-delta into a ring buffer, evicting the oldest entry
 * when the buffer is full.
 */
function pushFpsSample(history: number[], deltaMs: number): number[] {
  // Avoid poisoning the buffer with degenerate deltas (tab switches, etc.)
  const saneDelta = (deltaMs > 0 && deltaMs < 2000) ? deltaMs : 0;
  if (saneDelta === 0) return history;

  const updated = [...history];
  updated.push(saneDelta);
  if (updated.length > FPS_HISTORY_SIZE) {
    updated.shift();
  }
  return updated;
}

/**
 * Compute a rolling average FPS from a ring buffer of frame deltas.
 * Returns 0 when the buffer is empty or all samples are degenerate.
 */
function computeAverageFPS(history: number[]): number {
  if (history.length === 0) return 0;

  // Sum the deltas and derive average FPS
  const sum = history.reduce((acc, d) => acc + d, 0);
  if (sum === 0) return 0;

  const avgDeltaMs = sum / history.length;
  return parseFloat((1000 / avgDeltaMs).toFixed(1));
}

/**
 * Determine whether the observed FPS is within ACCURACY_THRESHOLD of the
 * target FPS derived from the target interval.
 */
function isWithinAccuracy(currentFPS: number, targetIntervalMs: number): boolean {
  if (currentFPS <= 0 || targetIntervalMs <= 0) return false;
  const targetFPS = 1000 / targetIntervalMs;
  const deviation = Math.abs(currentFPS - targetFPS) / targetFPS;
  return deviation <= ACCURACY_THRESHOLD;
}

// ─── Factory ───────────────────────────────────────────────────────────────

/**
 * Create a new TimingController.
 *
 * The controller starts in the *paused* state with zeroed accumulators.
 * Call `resume()` before feeding deltas, or call `updateTiming()` followed
 * by `resume()` when the game begins.
 */
export function createTimingController(): TimingController {
  // ── Mutable internal state ──
  let lastTickTime = 0;
  let targetIntervalMs = 150; // reasonable default (matches DEFAULT_SPEED_CONFIG)
  let accumulator = 0;
  let isPaused = true;        // start paused — caller must explicitly resume
  let tickCount = 0;
  let fpsHistory: number[] = [];
  let currentFPS = 0;
  let isTurbo = false;

  // We stash the last-known speed config & mode engine so that toggling
  // turbo off can recompute the base interval without the caller needing
  // to re-invoke updateTiming().
  let cachedSpeedConfig: SpeedConfig | null = null;
  let cachedModeEngine: GameModeEngine | null = null;

  // ── updateTiming ──
  function updateTiming(speedConfig: SpeedConfig, modeEngine: GameModeEngine | null): void {
    cachedSpeedConfig = speedConfig;
    cachedModeEngine = modeEngine;

    // 1. Base interval from speed config
    const baseInterval = getFrameInterval(speedConfig);

    // 2. Apply the game-mode modifier (null engine → modifier of 1.0)
    const modeModifier = modeEngine !== null
      ? getFrameIntervalModifier(modeEngine)
      : 1.0;

    // 3. Compute raw target and clamp to safety bounds
    const rawInterval = baseInterval * modeModifier;
    targetIntervalMs = clamp(rawInterval, MIN_INTERVAL_MS, MAX_INTERVAL_MS);

    // 4. If turbo is active, apply the turbo multiplier on top
    if (isTurbo) {
      targetIntervalMs = clamp(
        targetIntervalMs * TURBO_MULTIPLIER,
        TURBO_FLOOR_MS,
        MAX_INTERVAL_MS,
      );
    }
  }

  // ── shouldTick ──
  function shouldTick(deltaTimeMs: number): boolean {
    // When paused, never emit ticks
    if (isPaused) return false;

    // Sanitize the delta to avoid spiral-of-death on tab-refocus
    const safeDelta = deltaTimeMs > 0 && deltaTimeMs < 1000
      ? deltaTimeMs
      : 0;

    // Record the delta for FPS tracking even if no tick fires
    if (safeDelta > 0) {
      fpsHistory = pushFpsSample(fpsHistory, safeDelta);
      currentFPS = parseFloat((1000 / safeDelta).toFixed(1));
    }

    // Accumulate time
    accumulator += safeDelta;

    // Drain one interval's worth from the accumulator if enough time has
    // accumulated.  Supports multiple ticks per frame for slow speeds.
    if (accumulator >= targetIntervalMs) {
      accumulator -= targetIntervalMs;

      // Guard against extreme accumulator buildup — if more than 3
      // intervals are queued, skip the extras to prevent the snake
      // from teleporting across the grid after a long pause.
      if (accumulator > targetIntervalMs * 3) {
        accumulator = 0;
      }

      // Bookkeeping
      tickCount += 1;
      lastTickTime = performance.now();

      return true;
    }

    return false;
  }

  // ── getMetrics ──
  function getMetrics(): TimingMetrics {
    const avgFPS = computeAverageFPS(fpsHistory);
    const accurate = isWithinAccuracy(currentFPS, targetIntervalMs);

    return {
      currentFPS,
      avgFPS,
      targetIntervalMs: Math.round(targetIntervalMs * 100) / 100,
      tickCount,
      isAccurate: accurate,
    };
  }

  // ── pause ──
  function pause(): void {
    isPaused = true;
  }

  // ── resume ──
  function resume(): void {
    if (!isPaused) return; // already running

    isPaused = false;
    // Drain the accumulator so we don't get a burst of catch-up ticks
    // immediately after unpausing.
    accumulator = 0;
  }

  // ── reset ──
  function reset(): void {
    lastTickTime = 0;
    targetIntervalMs = 150;
    accumulator = 0;
    isPaused = true;
    tickCount = 0;
    fpsHistory = [];
    currentFPS = 0;
    isTurbo = false;
    cachedSpeedConfig = null;
    cachedModeEngine = null;
  }

  // ── setTurboMode ──
  function setTurboMode(enabled: boolean): void {
    isTurbo = enabled;

    if (isTurbo) {
      // Apply turbo: halve the interval, floored at TURBO_FLOOR_MS
      targetIntervalMs = clamp(
        targetIntervalMs * TURBO_MULTIPLIER,
        TURBO_FLOOR_MS,
        MAX_INTERVAL_MS,
      );
    } else {
      // Revert to base interval using cached config, or keep current if
      // no config has ever been set.
      if (cachedSpeedConfig !== null) {
        updateTiming(cachedSpeedConfig, cachedModeEngine);
      }
    }
  }

  // ── Return the controller surface ──
  return {
    get lastTickTime() { return lastTickTime; },
    set lastTickTime(v: number) { lastTickTime = v; },

    get targetIntervalMs() { return targetIntervalMs; },
    set targetIntervalMs(v: number) { targetIntervalMs = v; },

    get accumulator() { return accumulator; },
    set accumulator(v: number) { accumulator = v; },

    get isPaused() { return isPaused; },
    set isPaused(v: boolean) { isPaused = v; },

    get tickCount() { return tickCount; },
    set tickCount(v: number) { tickCount = v; },

    get fpsHistory() { return fpsHistory; },
    set fpsHistory(v: number[]) { fpsHistory = v; },

    get currentFPS() { return currentFPS; },
    set currentFPS(v: number) { currentFPS = v; },

    get isTurbo() { return isTurbo; },

    updateTiming,
    shouldTick,
    getMetrics,
    pause,
    resume,
    reset,
    setTurboMode,
  };
}
