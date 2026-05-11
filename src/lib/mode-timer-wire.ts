// ─── Mode Timer Wire ─────────────────────────────────────────────────────────
// Pure logic module that wires the game mode engine's timer into the main game
// tick loop.  Bridges the gap between `game-mode-engine.updateModeTimer()` and
// the actual per-frame game loop so that timed modes (Timed 60s, Blitz 30s,
// Marathon 5min) correctly count down.
//
// No React, no DOM, no side-effects beyond the returned mutable wire object.

import { type GameModeEngine } from '@/lib/game-mode-engine';

// ─── Public Types ─────────────────────────────────────────────────────────────

/** Real-time timer snapshot for the HUD overlay. */
export interface TimerDisplayData {
  /** Remaining time in whole seconds (e.g. 45). */
  remaining: number;
  /** Human-readable time string — "MM:SS" when ≥ 1 min, else "0:SS". */
  formatted: string;
  /** Linear progress from 0 (expired) to 100 (full time). */
  progress: number;
  /** Severity level for visual/audio warnings. */
  warningLevel: 'none' | 'normal' | 'warning' | 'critical';
  /** Whether the timer is actively counting down. */
  isActive: boolean;
  /** Whether the timer has been manually paused. */
  isPaused: boolean;
  /** Time limit in seconds, or `null` for untimed modes. */
  timeLimit: number | null;
}

/** Summary produced when a timed mode's countdown reaches zero. */
export interface ModeCompletionResult {
  /** Machine-readable mode identifier (e.g. "timed", "blitz", "marathon"). */
  modeId: string;
  /** Human-readable mode name (e.g. "Timed", "Blitz 30s"). */
  modeName: string;
  /** Score at the moment the timer expired. */
  finalScore: number;
  /** Total elapsed time in milliseconds. */
  timeElapsed: number;
  /** Bonus points: remaining seconds × TIME_BONUS_MULTIPLIER. */
  timeBonus: number;
  /** Final score including the time bonus. */
  totalWithBonus: number;
}

/** Wire object returned by `createModeTimerWire()`. Call `tick()` every frame. */
export interface ModeTimerWire {
  /**
   * Advance the timer by `elapsedMs` ms. Pass total elapsed since game start.
   * `expired` is `true` the first frame the timer hits zero.
   */
  tick(elapsedMs: number): { expired: boolean; display: TimerDisplayData };
  /** Freeze the countdown without resetting it. */
  pause(): void;
  /** Resume the countdown from where it was paused. */
  resume(): void;
  /** Reset the timer back to the mode's full time limit. */
  reset(): void;
  /** Get the current display data without advancing the timer. */
  getDisplay(): TimerDisplayData;
  /** Build a completion result for the current timed mode. */
  getCompletionResult(score: number): ModeCompletionResult | null;
  /** True when the active mode has a countdown timer. */
  isTimerActive(): boolean;
  /** Add bonus seconds (e.g. from a +10s power-up). Clamped at 150% of base. */
  addBonusTime(seconds: number): void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Seconds remaining at which the "warning" tier activates (flashing amber). */
const WARNING_THRESHOLD_S = 10;

/** Seconds remaining at which the "critical" tier activates (flashing red). */
const CRITICAL_THRESHOLD_S = 5;

/** Points awarded per remaining second when the timer expires. */
const TIME_BONUS_MULTIPLIER = 10;

/** Minimum delta (ms) to accept — ignores frame spikes from tab-switch. */
const MIN_DELTA_MS = 0;

/** Maximum delta (ms) to accept — caps catch-up after long pauses. */
const MAX_DELTA_MS = 500;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Format a whole-second count into a display string.
 * Uses "M:SS" format when the time is under an hour.
 * Uses "MM:SS" format when ≥ 1 minute (e.g. "4:57" for marathon).
 */
function formatTime(totalSeconds: number): string {
  if (totalSeconds < 0) return '0:00';

  const s = Math.floor(totalSeconds);
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;

  if (minutes === 0) {
    // Short format for sub-minute modes: "0:45"
    return `0:${seconds.toString().padStart(2, '0')}`;
  }

  // Minutes format: "1:23" or "4:57"
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Determine the warning level from the remaining seconds.
 *   - > 10 s  → 'normal'
 *   - ≤ 10 s  → 'warning'  (flashing amber)
 *   - ≤ 5 s   → 'critical' (flashing red)
 *   - 0 s     → 'critical' (expired)
 */
function computeWarningLevel(remainingSec: number): TimerDisplayData['warningLevel'] {
  if (remainingSec <= 0) return 'critical';
  if (remainingSec <= CRITICAL_THRESHOLD_S) return 'critical';
  if (remainingSec <= WARNING_THRESHOLD_S) return 'warning';
  return 'normal';
}

/**
 * Safely clamp a value within [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a `ModeTimerWire` bound to the given game mode engine.
 *
 * Tracks its own `timeRemainingMs` independently of the engine so that
 * pause/resume and bonus-time additions stay accurate.
 *
 * @example
 * ```ts
 * const engine = createGameModeEngine('timed');
 * const wire = createModeTimerWire(engine);
 * const { expired, display } = wire.tick(elapsedMs);
 * if (expired) endGame();
 * ```
 */
export function createModeTimerWire(engine: GameModeEngine): ModeTimerWire {
  // ── Internal mutable state ──

  /** Total time limit for this mode in ms (immutable per session). */
  const totalTimeLimitMs: number =
    engine.modeConfig.timeLimit !== null ? engine.modeConfig.timeLimit : 0;

  /** Effective limit including bonus time additions. */
  let effectiveTimeLimitMs: number = totalTimeLimitMs;

  /** Current remaining time in ms. Decremented each tick. */
  let timeRemainingMs: number = effectiveTimeLimitMs;

  /** Timestamp (performance.now) of when the latest pause began, or 0. */
  let pauseStartedAt: number = 0;

  /** Whether the timer is currently paused. */
  let isPaused: boolean = false;

  /** Whether the timer has already fired the "expired" event. */
  let hasExpired: boolean = false;

  /** ElapsedMs at the moment of expiration (for completion result). */
  let expiredAtElapsedMs: number = 0;

  /** ElapsedMs from the previous tick, used to compute deltas. */
  let previousElapsedMs: number = 0;

  // ── Core display builder ──

  /**
   * Build a `TimerDisplayData` snapshot from the current internal state.
   */
  function buildDisplay(): TimerDisplayData {
    const remainingSec = Math.max(0, Math.ceil(timeRemainingMs / 1000));
    const isActive = engine.isTimedMode && !hasExpired;

    // Progress: 0 = expired, 100 = full time.
    const progress =
      effectiveTimeLimitMs > 0
        ? clamp((timeRemainingMs / effectiveTimeLimitMs) * 100, 0, 100)
        : 0;

    const warningLevel = isActive ? computeWarningLevel(remainingSec) : 'none';

    return {
      remaining: remainingSec,
      formatted: formatTime(remainingSec),
      progress: Math.round(progress * 10) / 10,
      warningLevel,
      isActive,
      isPaused,
      timeLimit: engine.isTimedMode ? Math.round(effectiveTimeLimitMs / 1000) : null,
    };
  }

  // ── tick ──

  function tick(elapsedMs: number): { expired: boolean; display: TimerDisplayData } {
    // If not a timed mode, return an inert display immediately.
    if (!engine.isTimedMode || totalTimeLimitMs <= 0) {
      return { expired: false, display: buildDisplay() };
    }

    // If already expired, just return the current (frozen) display.
    if (hasExpired) {
      return { expired: false, display: buildDisplay() };
    }

    // If paused, don't decrement — but still return display.
    if (isPaused) {
      return { expired: false, display: buildDisplay() };
    }

    // ── Compute the delta from the previous tick ──
    let deltaMs: number;

    if (previousElapsedMs <= 0) {
      // First tick — no previous reference.  Use the full elapsed as the
      // baseline, but cap it to avoid counting pre-game time.
      deltaMs = Math.min(elapsedMs, MAX_DELTA_MS);
    } else {
      deltaMs = elapsedMs - previousElapsedMs;
    }

    // Sanitize: ignore negative deltas (clock drift) and extreme spikes.
    if (deltaMs < MIN_DELTA_MS || deltaMs > MAX_DELTA_MS) {
      deltaMs = 0;
    }

    previousElapsedMs = elapsedMs;

    // ── Subtract the delta from remaining time ──
    timeRemainingMs = Math.max(0, timeRemainingMs - deltaMs);

    // ── Sync the engine's own timeRemaining for downstream consumers ──
    engine.timeRemaining = timeRemainingMs;

    // ── Check for expiration ──
    let expired = false;

    if (timeRemainingMs <= 0) {
      timeRemainingMs = 0;
      engine.timeRemaining = 0;
      hasExpired = true;
      expiredAtElapsedMs = elapsedMs;
      expired = true;
    }

    return { expired, display: buildDisplay() };
  }

  // ── pause ──

  function pause(): void {
    if (isPaused || hasExpired) return;

    isPaused = true;
    pauseStartedAt = performance.now();
  }

  // ── resume ──

  function resume(): void {
    if (!isPaused) return;
    isPaused = false;
    pauseStartedAt = 0;
    // Reset previousElapsedMs so the next tick doesn't compute a huge
    // delta spanning the pause period.
    previousElapsedMs = 0;
  }

  // ── reset ──

  function reset(): void {
    effectiveTimeLimitMs = totalTimeLimitMs;
    timeRemainingMs = effectiveTimeLimitMs;
    pauseStartedAt = 0;
    isPaused = false;
    hasExpired = false;
    expiredAtElapsedMs = 0;
    previousElapsedMs = 0;

    // Sync the engine state back to the fresh limit.
    engine.timeRemaining = engine.modeConfig.timeLimit ?? Infinity;
  }

  // ── getDisplay ──

  function getDisplay(): TimerDisplayData {
    return buildDisplay();
  }

  // ── getCompletionResult ──

  /**
   * Build a completion result for the current timed mode.
   * Works even if the game ended early (e.g. collision death), computing
   * the time bonus from whatever time was remaining.
   */
  function getCompletionResult(score: number): ModeCompletionResult | null {
    if (!engine.isTimedMode) return null;

    const remainingSec = Math.max(0, Math.ceil(timeRemainingMs / 1000));
    const timeBonus = remainingSec * TIME_BONUS_MULTIPLIER;
    const timeElapsed = expiredAtElapsedMs > 0
      ? expiredAtElapsedMs
      : effectiveTimeLimitMs - timeRemainingMs;

    return {
      modeId: engine.activeMode,
      modeName: engine.modeConfig.name,
      finalScore: score,
      timeElapsed: Math.round(timeElapsed),
      timeBonus,
      totalWithBonus: score + timeBonus,
    };
  }

  // ── isTimerActive ──

  function isTimerActive(): boolean {
    return engine.isTimedMode && !hasExpired;
  }

  // ── addBonusTime ──

  /**
   * Add bonus seconds (time-extend power-ups). Clamped at 150% of base limit.
   * If the timer has expired, bonus time will revive it.
   */
  function addBonusTime(seconds: number): void {
    if (!engine.isTimedMode) return;
    if (seconds <= 0) return;

    const bonusMs = seconds * 1000;

    // Allow the timer to exceed the base limit by up to 50%.
    const maxAllowedMs = Math.floor(totalTimeLimitMs * 1.5);

    timeRemainingMs = Math.min(timeRemainingMs + bonusMs, maxAllowedMs);
    effectiveTimeLimitMs = Math.max(effectiveTimeLimitMs, timeRemainingMs);

    // If the timer was expired, revive it.
    if (hasExpired && timeRemainingMs > 0) {
      hasExpired = false;
      expiredAtElapsedMs = 0;
    }

    // Sync the engine.
    engine.timeRemaining = timeRemainingMs;
  }

  // ── Return the wire surface ──

  return {
    tick,
    pause,
    resume,
    reset,
    getDisplay,
    getCompletionResult,
    isTimerActive,
    addBonusTime,
  };
}

// ─── Integration Helpers (free functions) ─────────────────────────────────────

/**
 * Returns `true` if the given mode engine represents a timed mode that
 * requires per-frame timer ticking.
 *
 * Timed modes: `'timed'` (60s), `'blitz'` (30s), `'marathon'` (300s).
 * All other modes return `false`.
 */
export function shouldTick(engine: GameModeEngine): boolean {
  return engine.isTimedMode;
}

/**
 * Returns the time limit for the current mode in seconds, or `null` if
 * the mode has no time limit (classic, practice, zen, challenge, pvp).
 */
export function getTimeLimit(engine: GameModeEngine): number | null {
  if (!engine.isTimedMode || engine.modeConfig.timeLimit === null) {
    return null;
  }
  return Math.round(engine.modeConfig.timeLimit / 1000);
}

/**
 * Calculates the time bonus for a given remaining seconds value.
 * Uses the standard TIME_BONUS_MULTIPLIER (remaining × 10 points).
 *
 * @param remainingSec - Seconds left when the game ended.
 * @returns Bonus points (0 if remainingSec ≤ 0).
 */
export function getBonusTime(remainingSec: number): number {
  if (remainingSec <= 0) return 0;
  return Math.floor(remainingSec) * TIME_BONUS_MULTIPLIER;
}

/**
 * Quick utility: determine the warning level for a given remaining time.
 * Useful for components that need to check the level without a full wire.
 */
export function getWarningLevel(remainingSec: number): TimerDisplayData['warningLevel'] {
  return computeWarningLevel(remainingSec);
}

/**
 * Quick utility: format seconds into a display string.
 * Mirrors the formatting used inside the wire for consistency.
 */
export function formatTimerString(totalSeconds: number): string {
  return formatTime(totalSeconds);
}
