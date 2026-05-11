/**
 * game-event-bus-wire.ts
 *
 * A wiring layer that emits structured game events throughout the game lifecycle.
 * Provides typed convenience methods for every major game event, with built-in
 * throttling (direction_change, timer_tick), event logging, and localStorage
 * persistence of cumulative event counts.
 *
 * Usage:
 *   const wire = createEventBusWire();
 *   wire.onGameStart({ mode: 'classic', seed: 42 });
 *   wire.onWordEat('serendipity', 150, 3, {});
 *
 * Individual functions are also exported for direct (stateless) usage — they
 * operate on a shared default wire instance.
 */

import { emitGameEvent, type GameHookEvent } from '@/lib/game-event-hooks';

// ── Types ──────────────────────────────────────────────────────────────────────

/** Single entry in the in-memory event log. */
export interface EventLogEntry {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/** Summary returned by `getEventSummary()`. */
export interface EventSummary {
  totalEmitted: number;
  byType: Record<string, number>;
  lastEvents: Array<{ type: string; timestamp: number }>;
}

/**
 * The primary wire interface. Each method corresponds to a well-known game
 * event and builds the appropriate structured payload before delegating to
 * `emitGameEvent`.
 */
export interface EventBusWire {
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onGameStart(gameState: Record<string, unknown>): void;
  onGameEnd(gameState: Record<string, unknown>): void;
  onGamePause(gameState: Record<string, unknown>): void;
  onGameResume(gameState: Record<string, unknown>): void;

  // ── Gameplay ──────────────────────────────────────────────────────────────
  onWordEat(word: string, points: number, combo: number, gameState: Record<string, unknown>): void;
  onScoreChange(oldScore: number, newScore: number, reason: string): void;
  onComboChange(oldCombo: number, newCombo: number): void;
  onCollision(type: string, position: { x: number; y: number }, fatal: boolean): void;

  // ── Power-ups ─────────────────────────────────────────────────────────────
  onPowerUpSpawn(type: string, position: { x: number; y: number }): void;
  onPowerUpCollect(type: string, effect: Record<string, unknown>): void;
  onPowerUpExpire(type: string): void;
  onShieldBreak(): void;

  // ── Progression & state ───────────────────────────────────────────────────
  onDifficultyChange(oldDiff: string, newDiff: string): void;
  onDirectionChange(newDir: string, oldDir: string): void;
  onSnakeGrow(length: number): void;
  onTimerTick(timeRemaining: number): void;

  // ── Achievements & levelling ──────────────────────────────────────────────
  onAchievementUnlock(achievementId: string, name: string): void;
  onLevelUp(oldLevel: number, newLevel: number, xp: number): void;

  // ── Modes ─────────────────────────────────────────────────────────────────
  onModeStart(modeId: string): void;
  onModeEnd(modeId: string, stats: Record<string, unknown>): void;

  // ── Special modes ─────────────────────────────────────────────────────────
  onDailyChallengeStart(words: string[], target: number): void;
  onDailyChallengeEnd(result: Record<string, unknown>): void;
  onSpeedRunTick(timeLeft: number): void;

  // ── Customisation ─────────────────────────────────────────────────────────
  onWeatherChange(newWeather: string): void;
  onSkinChange(skinId: string): void;

  // ── Analytics ─────────────────────────────────────────────────────────────
  getEventSummary(): EventSummary;
  getRecentEvents(count: number): EventLogEntry[];
}

// ── Constants ────────────────────────────────────────────────────────────────

/** localStorage key used to persist cumulative event counts across sessions. */
const STORAGE_KEY = 'ws_event_bus_wire';

/** Maximum number of event log entries kept in memory (ring buffer). */
const MAX_LOG_SIZE = 500;

/**
 * Throttle configuration: event name → minimum interval in ms between
 * successive emissions. Events not listed here are unthrottled.
 */
const THROTTLE_INTERVALS: Record<string, number> = {
  'game:direction_change': 50,   // max 1 per 50 ms — avoids flooding during rapid input
  'game:timer_tick': 1000,       // max 1 per 1000 ms — once per second is sufficient
};

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Persist current event counts to localStorage. Errors are silently caught
 * (e.g. in environments where localStorage is unavailable).
 */
function persistCounts(byType: Record<string, number>, totalEmitted: number): void {
  try {
    const payload = JSON.stringify({ totalEmitted, byType });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Storage full, unavailable, or blocked — ignore.
  }
}

/**
 * Load previously persisted event counts from localStorage. Returns
 * `{ totalEmitted, byType }` with sensible defaults when nothing is stored.
 */
function loadPersistedCounts(): { totalEmitted: number; byType: Record<string, number> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { totalEmitted: 0, byType: {} };
    const parsed = JSON.parse(raw);
    return {
      totalEmitted: typeof parsed.totalEmitted === 'number' ? parsed.totalEmitted : 0,
      byType: typeof parsed.byType === 'object' && parsed.byType !== null ? parsed.byType : {},
    };
  } catch {
    return { totalEmitted: 0, byType: {} };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a new `EventBusWire` instance.
 *
 * Each wire maintains its own in-memory event log and counters, but cumulative
 * totals are shared across instances via localStorage so that counts survive
 * page reloads.
 */
export function createEventBusWire(): EventBusWire {
  // Mutable internal state — scoped to this wire instance.
  let totalEmitted = 0;
  const byType: Record<string, number> = {};
  const eventLog: EventLogEntry[] = [];
  const lastEmitTime: Record<string, number> = {};

  // Bootstrap persisted counts on creation.
  const persisted = loadPersistedCounts();
  totalEmitted = persisted.totalEmitted;
  Object.assign(byType, persisted.byType);

  // ── Core emit helper ──────────────────────────────────────────────────────

  /**
   * Central emit helper. Checks throttling, updates internal tracking,
   * persists to localStorage, then delegates to `emitGameEvent`.
   *
   * @returns `true` if the event was actually emitted, `false` if throttled.
   */
  function trackAndEmit(type: string, payload: Record<string, unknown>): boolean {
    const now = Date.now();

    // ── Throttle check ──────────────────────────────────────────────────────
    const minInterval = THROTTLE_INTERVALS[type];
    if (minInterval !== undefined) {
      const lastTime = lastEmitTime[type] ?? 0;
      if (now - lastTime < minInterval) {
        return false; // suppressed by throttle
      }
    }

    // ── Update tracking ─────────────────────────────────────────────────────
    lastEmitTime[type] = now;
    totalEmitted++;
    byType[type] = (byType[type] ?? 0) + 1;

    // ── Append to in-memory log (ring buffer) ───────────────────────────────
    const entry: EventLogEntry = { type, payload: { ...payload }, timestamp: now };
    eventLog.push(entry);
    if (eventLog.length > MAX_LOG_SIZE) {
      eventLog.shift();
    }

    // ── Persist counts ──────────────────────────────────────────────────────
    persistCounts(byType, totalEmitted);

    // ── Delegate to the game event bus ──────────────────────────────────────
    emitGameEvent(type as GameHookEvent, payload);

    return true;
  }

  // ── Build the wire object ─────────────────────────────────────────────────

  return {
    // ────────────────────────────────────────────────────────────────────────
    // Lifecycle events
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Emitted when a new game session begins.
     * Payload includes a generated `sessionId` and any metadata from `gameState`.
     */
    onGameStart(gameState) {
      trackAndEmit('game:start', {
        sessionId: Date.now(),
        ...gameState,
      });
    },

    /**
     * Emitted when the game session ends (win, lose, quit, or timeout).
     * Payload includes `finalScore`, `wordsEaten`, `duration`, and any extra state.
     */
    onGameEnd(gameState) {
      trackAndEmit('game:end', {
        duration: Date.now() - Number(gameState.sessionStartTime ?? Date.now()),
        ...gameState,
      });
    },

    /** Emitted when the player pauses the game. */
    onGamePause(gameState) {
      trackAndEmit('game:pause', { ...gameState });
    },

    /** Emitted when the player resumes from pause. */
    onGameResume(gameState) {
      trackAndEmit('game:resume', { ...gameState });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Core gameplay events
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Emitted whenever the snake eats a word tile.
     * Captures the word text, points awarded, and current combo size.
     */
    onWordEat(word, points, combo, gameState) {
      trackAndEmit('game:word_eat', {
        word,
        points,
        combo,
        ...gameState,
      });
    },

    /**
     * Emitted when the score changes for any reason (word eaten, bonus, penalty).
     * Includes both old and new values plus a human-readable reason string.
     */
    onScoreChange(oldScore, newScore, reason) {
      trackAndEmit('game:score_change', {
        oldScore,
        newScore,
        delta: newScore - oldScore,
        reason,
      });
    },

    /**
     * Emitted when the combo counter increases or resets.
     * `newCombo === 0` indicates a combo break.
     */
    onComboChange(oldCombo, newCombo) {
      trackAndEmit('game:combo_change', {
        oldCombo,
        newCombo,
        broken: newCombo < oldCombo || newCombo === 0,
      });
    },

    /**
     * Emitted when the snake collides with an obstacle, wall, or itself.
     * `fatal` indicates whether the collision ends the game.
     */
    onCollision(type, position, fatal) {
      trackAndEmit('game:collision', {
        collisionType: type,
        position,
        fatal,
      });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Power-up events
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted when a power-up spawns on the grid. */
    onPowerUpSpawn(type, position) {
      trackAndEmit('game:powerup_spawn', { type, position });
    },

    /** Emitted when the snake collects (picks up) a power-up. */
    onPowerUpCollect(type, effect) {
      trackAndEmit('game:powerup_collect', { type, ...effect });
    },

    /** Emitted when an active power-up effect expires. */
    onPowerUpExpire(type) {
      trackAndEmit('game:powerup_expire', { type });
    },

    /** Emitted specifically when the shield power-up absorbs a fatal hit. */
    onShieldBreak() {
      trackAndEmit('game:shield_break', {});
    },

    // ────────────────────────────────────────────────────────────────────────
    // Progression & state changes
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted when the dynamic difficulty level changes. */
    onDifficultyChange(oldDiff, newDiff) {
      trackAndEmit('game:difficulty_change', {
        oldDifficulty: oldDiff,
        newDifficulty: newDiff,
      });
    },

    /**
     * Emitted when the snake changes direction.
     * **Throttled** to at most once every 50 ms.
     */
    onDirectionChange(newDir, oldDir) {
      trackAndEmit('game:direction_change', {
        newDirection: newDir,
        oldDirection: oldDir,
      });
    },

    /** Emitted when the snake grows by eating a word or power-up. */
    onSnakeGrow(length) {
      trackAndEmit('game:snake_grow', { length });
    },

    /**
     * Emitted every tick in timed game modes.
     * **Throttled** to at most once every 1000 ms (once per second).
     */
    onTimerTick(timeRemaining) {
      trackAndEmit('game:timer_tick', { timeRemaining });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Achievements & levelling
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted when an achievement is unlocked. */
    onAchievementUnlock(achievementId, name) {
      trackAndEmit('game:achievement', {
        achievementId,
        name,
      });
    },

    /** Emitted when the player gains a level. Includes current XP value. */
    onLevelUp(oldLevel, newLevel, xp) {
      trackAndEmit('game:level_up', {
        oldLevel,
        newLevel,
        xp,
      });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Game modes
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted when a specific game mode begins (e.g. 'classic', 'zen', 'pvp'). */
    onModeStart(modeId) {
      trackAndEmit('game:mode_start', { modeId });
    },

    /** Emitted when a game mode ends, carrying a stats snapshot. */
    onModeEnd(modeId, stats) {
      trackAndEmit('game:mode_end', { modeId, ...stats });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Special modes (daily challenge, speed run)
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted at the start of a daily challenge, listing target words and score. */
    onDailyChallengeStart(words, target) {
      trackAndEmit('game:daily_start', {
        words,
        target,
        wordCount: words.length,
      });
    },

    /** Emitted when the daily challenge concludes, carrying the final result. */
    onDailyChallengeEnd(result) {
      trackAndEmit('game:daily_end', { ...result });
    },

    /** Emitted on each speed-run timer tick. */
    onSpeedRunTick(timeLeft) {
      trackAndEmit('game:speedrun_tick', { timeLeft });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Customisation
    // ────────────────────────────────────────────────────────────────────────

    /** Emitted when the in-game weather visual effect changes. */
    onWeatherChange(newWeather) {
      trackAndEmit('game:weather_change', { newWeather });
    },

    /** Emitted when the player equips a different snake skin. */
    onSkinChange(skinId) {
      trackAndEmit('game:skin_change', { skinId });
    },

    // ────────────────────────────────────────────────────────────────────────
    // Analytics / introspection
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Returns a snapshot of cumulative event statistics.
     * `lastEvents` is limited to the most recent 20 distinct emissions.
     */
    getEventSummary(): EventSummary {
      const lastEvents = eventLog.slice(-20).map((e) => ({
        type: e.type,
        timestamp: e.timestamp,
      }));

      return {
        totalEmitted,
        byType: { ...byType },
        lastEvents,
      };
    },

    /**
     * Returns the most recent `count` entries from the in-memory event log.
     * Useful for debugging or building a real-time event feed UI.
     */
    getRecentEvents(count: number): EventLogEntry[] {
      const start = Math.max(0, eventLog.length - count);
      return eventLog.slice(start).map((e) => ({ ...e, payload: { ...e.payload } }));
    },
  };
}

// ── Default singleton ─────────────────────────────────────────────────────────

/**
 * A shared default wire instance. Individual exported helper functions below
 * all delegate to this instance, allowing callers to use them without manually
 * creating a wire.
 */
let _defaultWire: EventBusWire | null = null;

function defaultWire(): EventBusWire {
  if (!_defaultWire) {
    _defaultWire = createEventBusWire();
  }
  return _defaultWire;
}

// ── Individual (standalone) convenience exports ────────────────────────────────
//
// These allow consumers to call e.g. `wireOnGameStart(state)` without first
// creating an `EventBusWire`. They operate on the shared default instance.

/** @see EventBusWire.onGameStart */
export function wireOnGameStart(gameState: Record<string, unknown>): void {
  defaultWire().onGameStart(gameState);
}

/** @see EventBusWire.onGameEnd */
export function wireOnGameEnd(gameState: Record<string, unknown>): void {
  defaultWire().onGameEnd(gameState);
}

/** @see EventBusWire.onGamePause */
export function wireOnGamePause(gameState: Record<string, unknown>): void {
  defaultWire().onGamePause(gameState);
}

/** @see EventBusWire.onGameResume */
export function wireOnGameResume(gameState: Record<string, unknown>): void {
  defaultWire().onGameResume(gameState);
}

/** @see EventBusWire.onWordEat */
export function wireOnWordEat(
  word: string,
  points: number,
  combo: number,
  gameState: Record<string, unknown>,
): void {
  defaultWire().onWordEat(word, points, combo, gameState);
}

/** @see EventBusWire.onScoreChange */
export function wireOnScoreChange(oldScore: number, newScore: number, reason: string): void {
  defaultWire().onScoreChange(oldScore, newScore, reason);
}

/** @see EventBusWire.onComboChange */
export function wireOnComboChange(oldCombo: number, newCombo: number): void {
  defaultWire().onComboChange(oldCombo, newCombo);
}

/** @see EventBusWire.onCollision */
export function wireOnCollision(
  type: string,
  position: { x: number; y: number },
  fatal: boolean,
): void {
  defaultWire().onCollision(type, position, fatal);
}

/** @see EventBusWire.onPowerUpSpawn */
export function wireOnPowerUpSpawn(
  type: string,
  position: { x: number; y: number },
): void {
  defaultWire().onPowerUpSpawn(type, position);
}

/** @see EventBusWire.onPowerUpCollect */
export function wireOnPowerUpCollect(
  type: string,
  effect: Record<string, unknown>,
): void {
  defaultWire().onPowerUpCollect(type, effect);
}

/** @see EventBusWire.onPowerUpExpire */
export function wireOnPowerUpExpire(type: string): void {
  defaultWire().onPowerUpExpire(type);
}

/** @see EventBusWire.onShieldBreak */
export function wireOnShieldBreak(): void {
  defaultWire().onShieldBreak();
}

/** @see EventBusWire.onDifficultyChange */
export function wireOnDifficultyChange(oldDiff: string, newDiff: string): void {
  defaultWire().onDifficultyChange(oldDiff, newDiff);
}

/** @see EventBusWire.onDirectionChange */
export function wireOnDirectionChange(newDir: string, oldDir: string): void {
  defaultWire().onDirectionChange(newDir, oldDir);
}

/** @see EventBusWire.onSnakeGrow */
export function wireOnSnakeGrow(length: number): void {
  defaultWire().onSnakeGrow(length);
}

/** @see EventBusWire.onTimerTick */
export function wireOnTimerTick(timeRemaining: number): void {
  defaultWire().onTimerTick(timeRemaining);
}

/** @see EventBusWire.onAchievementUnlock */
export function wireOnAchievementUnlock(achievementId: string, name: string): void {
  defaultWire().onAchievementUnlock(achievementId, name);
}

/** @see EventBusWire.onLevelUp */
export function wireOnLevelUp(oldLevel: number, newLevel: number, xp: number): void {
  defaultWire().onLevelUp(oldLevel, newLevel, xp);
}

/** @see EventBusWire.onModeStart */
export function wireOnModeStart(modeId: string): void {
  defaultWire().onModeStart(modeId);
}

/** @see EventBusWire.onModeEnd */
export function wireOnModeEnd(modeId: string, stats: Record<string, unknown>): void {
  defaultWire().onModeEnd(modeId, stats);
}

/** @see EventBusWire.onDailyChallengeStart */
export function wireOnDailyChallengeStart(words: string[], target: number): void {
  defaultWire().onDailyChallengeStart(words, target);
}

/** @see EventBusWire.onDailyChallengeEnd */
export function wireOnDailyChallengeEnd(result: Record<string, unknown>): void {
  defaultWire().onDailyChallengeEnd(result);
}

/** @see EventBusWire.onSpeedRunTick */
export function wireOnSpeedRunTick(timeLeft: number): void {
  defaultWire().onSpeedRunTick(timeLeft);
}

/** @see EventBusWire.onWeatherChange */
export function wireOnWeatherChange(newWeather: string): void {
  defaultWire().onWeatherChange(newWeather);
}

/** @see EventBusWire.onSkinChange */
export function wireOnSkinChange(skinId: string): void {
  defaultWire().onSkinChange(skinId);
}

/** @see EventBusWire.getEventSummary — convenience accessor on the default wire. */
export function wireGetEventSummary(): EventSummary {
  return defaultWire().getEventSummary();
}

/** @see EventBusWire.getRecentEvents — convenience accessor on the default wire. */
export function wireGetRecentEvents(count: number): EventLogEntry[] {
  return defaultWire().getRecentEvents(count);
}
