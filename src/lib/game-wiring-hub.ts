/**
 * game-wiring-hub.ts
 *
 * Central wiring module that handles ALL remaining unwired game systems.
 * This is a pure coordination layer — it does NOT duplicate logic that lives
 * in other modules, but rather calls existing functions at the correct
 * integration points from the game loop (snake-game.tsx).
 *
 * Persistence: wiring status is saved to localStorage under
 * "ws_game_wiring_hub" so the hub can report its last-known state across
 * page reloads.
 *
 * No React dependencies — safe to import from both server and client code.
 */

// ─── Imports from the wiring ecosystem ────────────────────────────────────────

import type {
  PowerUpEffectWire,
  EffectResult,
} from './powerup-effect-wire';

import type { GameModeEngine } from './game-mode-engine';
import { handleCollisionForMode, updateModeTimer } from './game-mode-engine';

import { recordWordEaten } from './score-live-wire';

import { onAchievementUnlocked } from './notif-event-wire';

import { awardXP } from './xp-scoring-wire';
import type { XPScoringWire, XPEventType } from './xp-scoring-wire';

import type { EventBusWire } from './game-event-bus-wire';

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Structured return for collision handling — tells the caller whether the
 * snake survived and what action was taken.
 */
export interface CollisionResult {
  /** True if the collision was absorbed (practice, zen, shield). */
  survived: boolean;
  /** Human-readable action identifier for logging / analytics. */
  action: string;
}

/**
 * Structured return for timer ticks — tells the caller whether the timed
 * mode has ended and why.
 */
export interface TimerTickResult {
  /** True when the timed mode has expired. */
  modeEnded: boolean;
  /** Reason string when modeEnded is true (undefined otherwise). */
  reason?: string;
}

/**
 * Data passed when P2 eats a word in a PvP scenario.
 */
export interface P2WordEatenData {
  word: string;
  basePoints: number;
  combo: number;
  powerUps: string[];
  difficulty: string;
  rarity: string;
  category: string;
  timeElapsed: number;
}

/**
 * Achievement descriptor used when wiring achievement notifications.
 */
export interface AchievementDescriptor {
  title: string;
  description: string;
  emoji: string;
}

/**
 * Boolean status snapshot of every wiring connection in the hub.
 */
export interface WiringStatus {
  practiceModeWired: boolean;
  effectModifiersWired: boolean;
  p2ScoreWired: boolean;
  modeTimerWired: boolean;
  allEventsWired: boolean;
  achievementNotifsWired: boolean;
}

/**
 * The hub object returned by `createGameWiringHub()`.
 * All methods are safe (no-throw) — they return defaults on error.
 */
export interface GameWiringHub {
  /** Apply power-up effects to movement speed (method 1). */
  applyPowerUpEffectsToSpeed(
    effectiveSpeed: number,
    effectWire: PowerUpEffectWire,
  ): number;

  /** Apply power-up effects to score (method 2). */
  applyPowerUpEffectsToScore(
    basePoints: number,
    effectWire: PowerUpEffectWire,
  ): number;

  /** Handle collision with mode-awareness (method 3). */
  handlePracticeCollision(
    gameState: Record<string, unknown>,
    modeEngine: GameModeEngine,
  ): CollisionResult;

  /** Wire P2 word eat into the score live wire (method 4). */
  wireP2ScoreLive(
    p2WordData: P2WordEatenData,
    scoreLiveWire: unknown,
  ): void;

  /** Wire timed-mode timer tick (method 5). */
  wireModeTimerTick(
    modeEngine: GameModeEngine,
    gameState: Record<string, unknown>,
  ): TimerTickResult;

  /** Wire achievement notifications + XP (method 6). */
  wireAchievementNotifications(
    achievements: AchievementDescriptor[],
    notifWire: unknown,
    xpWire: unknown,
  ): void;

  /** Emit ALL remaining game events in one batch (method 7). */
  wireAllEvents(
    eventBusWire: unknown,
    gameState: Record<string, unknown>,
  ): void;

  /** Return the current wiring status for every connection (method 8). */
  getWiringStatus(): WiringStatus;

  /** Return descriptions of any systems not yet wired (method 9). */
  getUnwiredItems(): string[];

  /** Reset all wiring status flags and clear persisted state. */
  reset(): void;
}

// ─── Persistence helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_game_wiring_hub';

interface PersistedWiringState {
  /** Which wiring connections have been activated at least once. */
  activatedFlags: WiringStatus;
  /** Optional: names of any unwired systems discovered at last check. */
  unwiredItems: string[];
  /** ISO timestamp of the last status save. */
  lastSavedAt: string;
}

function loadPersistedState(): PersistedWiringState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWiringState;
    if (parsed && typeof parsed.activatedFlags === 'object') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function persistState(state: PersistedWiringState): void {
  try {
    state.lastSavedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently degrade.
  }
}

// ─── Safe-call wrapper ───────────────────────────────────────────────────────

/**
 * Wraps a function call so that any thrown error is caught and a fallback
 * value is returned instead.  This keeps the hub's public API no-throw.
 */
function safeCall<T>(fn: () => T, fallback: T, context: string): T {
  try {
    return fn();
  } catch (err) {
    // Structured warning for debugging without crashing the game loop.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[game-wiring-hub] Error in "${context}": ${msg}. Returning fallback.`,
    );
    return fallback;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a `GameWiringHub` instance.
 *
 * Restores previously persisted wiring status from localStorage on creation,
 * so `getWiringStatus()` reflects historical activation even across reloads.
 */
export function createGameWiringHub(): GameWiringHub {
  // ── Internal mutable wiring state ──
  const persisted = loadPersistedState();
  const activatedFlags: WiringStatus = persisted?.activatedFlags ?? {
    practiceModeWired: false,
    effectModifiersWired: false,
    p2ScoreWired: false,
    modeTimerWired: false,
    allEventsWired: false,
    achievementNotifsWired: false,
  };
  let unwiredItems: string[] = persisted?.unwiredItems ?? [];

  // Track previous difficulty label to detect changes (for wireAllEvents).
  let previousDifficultyLabel: string | null = null;
  // Track previous weather and skin for change detection.
  let previousWeather: string | null = null;
  let previousSkin: string | null = null;
  // Track previous direction for change detection.
  let previousDirection: string | null = null;
  // Track whether a collision occurred this frame.
  let collisionThisFrame = false;

  /** Persist the current wiring state to localStorage. */
  function save(): void {
    persistState({ activatedFlags: { ...activatedFlags }, unwiredItems: [...unwiredItems], lastSavedAt: '' });
  }

  // ── Build the hub ──
  const hub: GameWiringHub = {
    // ────────────────────────────────────────────────────────────────────────
    // Method 1 — applyPowerUpEffectsToSpeed
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called from the game loop to compute the final tick interval.
    // 1. Calls `effectWire.applyEffects()` to get cumulative modifiers.
    // 2. Divides effectiveSpeed by `movementSpeedMod`:
    //      - speed_boost 1.5× → effectiveSpeed / 1.5 (snake moves faster)
    //      - slow_mo    0.6× → effectiveSpeed / 0.6 (snake moves slower)
    // 3. If ghost mode `freezeObstacles` is active, optionally caps speed
    //    to prevent the ghost frame from spinning wildly.
    // 4. Marks `effectModifiersWired` as active.
    //
    applyPowerUpEffectsToSpeed(effectiveSpeed, effectWire): number {
      return safeCall(() => {
        // Get the current cumulative effect result.  Passing null gameState
        // and 0 deltaTime is safe — applyEffects handles both gracefully.
        const result: EffectResult = effectWire.applyEffects(null, 0);

        // Apply movement speed modifier.
        // A modifier > 1.0 means the snake should move faster, so we divide
        // the interval by it (shorter interval = faster movement).
        let modifiedSpeed = effectiveSpeed / result.movementSpeedMod;

        // Ghost mode: if obstacles are frozen, prevent speed from going below
        // a floor of 20ms per tick so the game doesn't stutter at 60fps.
        if (result.freezeObstacles && modifiedSpeed < 20) {
          modifiedSpeed = 20;
        }

        // Ensure speed never drops below a playable minimum (10ms).
        modifiedSpeed = Math.max(10, modifiedSpeed);

        // Mark this wiring as active and persist.
        activatedFlags.effectModifiersWired = true;
        save();

        return modifiedSpeed;
      }, effectiveSpeed, 'applyPowerUpEffectsToSpeed');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 2 — applyPowerUpEffectsToScore
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called when awarding points for eating a word.
    // 1. Calls `effectWire.applyEffects()` to get the cumulative scoreMod.
    // 2. Multiplies basePoints by scoreMod.
    // 3. Ghost/freeze effects don't affect scoring directly.
    //
    applyPowerUpEffectsToScore(basePoints, effectWire): number {
      return safeCall(() => {
        const result: EffectResult = effectWire.applyEffects(null, 0);

        // The scoreMod is the highest active multiplier (e.g. double_points 2.0,
        // score_multiplier 3.0). Penalties (slow_mo 0.8) are also applied
        // multiplicatively inside the effect wire.
        const modifiedPoints = Math.round(basePoints * result.scoreMod);

        // Ensure non-negative score.
        activatedFlags.effectModifiersWired = true;
        save();

        return Math.max(0, modifiedPoints);
      }, basePoints, 'applyPowerUpEffectsToScore');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 3 — handlePracticeCollision
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called when the snake collides.  Delegates to the mode engine's
    // `handleCollisionForMode` which handles practice resets, zen immunity,
    // challenge lives, etc.
    //
    handlePracticeCollision(gameState, modeEngine): CollisionResult {
      return safeCall(() => {
        // Cast to MutableGameState shape expected by handleCollisionForMode.
        // Using a shallow copy to avoid mutating the caller's reference
        // directly — the mode engine writes to the object it receives.
        const mutableState = {
          gameOver: Boolean(gameState.gameOver),
          gameStarted: Boolean(gameState.gameStarted),
          paused: Boolean(gameState.paused),
          score: Number(gameState.score) || 0,
          elapsedTime: Number(gameState.elapsedTime) || 0,
          isSpeedRun: Boolean(gameState.isSpeedRun),
          startTime: Number(gameState.startTime) || Date.now(),
          snake: (Array.isArray(gameState.snake) ? gameState.snake : []) as Array<{ x: number; y: number }>,
          obstacles: Array.isArray(gameState.obstacles) ? gameState.obstacles : [],
          powerUp: gameState.powerUp ?? null,
          activePowerUps: Array.isArray(gameState.activePowerUps) ? gameState.activePowerUps : [],
          wordsEaten: Number(gameState.wordsEaten) || 0,
          ...(gameState as Record<string, unknown>),
        };

        // handleCollisionForMode returns true if the game should end.
        const shouldEndGame = handleCollisionForMode(modeEngine, mutableState);

        // Mark practice mode as wired regardless of outcome.
        activatedFlags.practiceModeWired = true;
        save();

        if (!shouldEndGame) {
          // Collision was absorbed — determine which mode handled it.
          if (modeEngine.isPracticeMode) {
            return { survived: true, action: 'practice_reset' };
          }
          if (modeEngine.isZenMode) {
            return { survived: true, action: 'zen_ignored' };
          }
          if (modeEngine.activeMode === 'challenge') {
            return { survived: true, action: 'challenge_life_lost' };
          }
          // Shield or other absorption mechanism.
          return { survived: true, action: 'collision_absorbed' };
        }

        // Standard game over.
        return { survived: false, action: 'death' };
      }, { survived: false, action: 'death' }, 'handlePracticeCollision');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 4 — wireP2ScoreLive
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called when Player 2 eats a word in a PvP game.
    // Delegates to `recordWordEaten` from the score-live-wire module.
    //
    wireP2ScoreLive(p2WordData, scoreLiveWire): void {
      safeCall(() => {
        // Guard: ensure the wire has the expected shape.
        if (
          !scoreLiveWire ||
          typeof (scoreLiveWire as Record<string, unknown>).breakdown !== 'object'
        ) {
          console.warn('[game-wiring-hub] wireP2ScoreLive: invalid scoreLiveWire');
          return;
        }

        // Map P2WordEatenData → WordEatenData shape expected by recordWordEaten.
        recordWordEaten(scoreLiveWire as Parameters<typeof recordWordEaten>[0], {
          word: p2WordData.word,
          basePoints: p2WordData.basePoints,
          combo: p2WordData.combo,
          activePowerUps: p2WordData.powerUps,
          difficulty: p2WordData.difficulty,
          rarity: p2WordData.rarity,
          category: p2WordData.category,
          timeElapsed: p2WordData.timeElapsed,
        });

        activatedFlags.p2ScoreWired = true;
        save();
      }, undefined, 'wireP2ScoreLive');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 5 — wireModeTimerTick
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called each frame for timed modes (timed, blitz, marathon).
    // Delegates to `updateModeTimer` from game-mode-engine.
    //
    wireModeTimerTick(modeEngine, gameState): TimerTickResult {
      return safeCall(() => {
        if (!modeEngine.isTimedMode) {
          return { modeEnded: false };
        }

        // Cast to the MutableGameState shape expected by updateModeTimer.
        const mutableState = {
          gameOver: Boolean(gameState.gameOver),
          gameStarted: Boolean(gameState.gameStarted),
          paused: Boolean(gameState.paused),
          score: Number(gameState.score) || 0,
          elapsedTime: Number(gameState.elapsedTime) || 0,
          startTime: Number(gameState.startTime) || Date.now(),
          isSpeedRun: Boolean(gameState.isSpeedRun),
          snake: Array.isArray(gameState.snake) ? gameState.snake : [],
          obstacles: [],
          powerUp: null,
          activePowerUps: [],
          wordsEaten: 0,
        };

        // Snapshot before update to detect whether this tick caused the end.
        const wasOver = mutableState.gameOver;

        updateModeTimer(modeEngine, mutableState.elapsedTime, mutableState);

        activatedFlags.modeTimerWired = true;
        save();

        // If the game was not over before but is now, the timer expired.
        if (!wasOver && mutableState.gameOver) {
          return { modeEnded: true, reason: 'timed_out' };
        }

        // Check edge case: timeRemaining already at or below zero.
        if (modeEngine.timeRemaining <= 0 && mutableState.gameOver) {
          return { modeEnded: true, reason: 'timed_out' };
        }

        return { modeEnded: false };
      }, { modeEnded: false }, 'wireModeTimerTick');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 6 — wireAchievementNotifications
    // ────────────────────────────────────────────────────────────────────────
    //
    // Called when one or more achievements have been unlocked.
    // For each achievement:
    //   1. Fires an in-game notification via `onAchievementUnlocked`.
    //   2. Awards XP via `awardXP` with event type 'achievementUnlocked'.
    //
    wireAchievementNotifications(achievements, notifWire, xpWire): void {
      safeCall(() => {
        if (!Array.isArray(achievements) || achievements.length === 0) {
          return;
        }

        for (const ach of achievements) {
          // ── Notification ──
          // Guard: ensure notifWire has the expected shape.
          if (
            notifWire &&
            typeof (notifWire as Record<string, unknown>).queue === 'object' &&
            typeof (notifWire as Record<string, unknown>).settings === 'object'
          ) {
            onAchievementUnlocked(
              notifWire as Parameters<typeof onAchievementUnlocked>[0],
              ach.title,
              ach.description,
              ach.emoji,
            );
          }

          // ── XP award ──
          // Guard: ensure xpWire has the expected shape.
          if (
            xpWire &&
            typeof (xpWire as Record<string, unknown>).profile === 'object'
          ) {
            awardXP(
              xpWire as Parameters<typeof awardXP>[0],
              'achievementUnlocked' as XPEventType,
            );
          }
        }

        activatedFlags.achievementNotifsWired = true;
        save();
      }, undefined, 'wireAchievementNotifications');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 7 — wireAllEvents
    // ────────────────────────────────────────────────────────────────────────
    //
    // Emits ALL remaining game events in one call.  This method should be
    // invoked from the game loop at an appropriate point (e.g. end of tick).
    // It detects state changes and fires the corresponding events:
    //
    //   - onCollision()     — if a collision occurred this frame
    //   - onDirectionChange() — if the direction queue was processed
    //   - onDifficultyChange() — if in-game difficulty shifted
    //   - onTimerTick()     — for timed / speed-run modes
    //   - onWeatherChange() — if the weather visual changed
    //   - onSkinChange()    — if the active skin changed
    //
    // The caller should set `collisionThisFrame` via `gameState` before
    // calling this, or the hub will detect it from the state snapshot.
    //
    wireAllEvents(eventBusWire, gameState): void {
      safeCall(() => {
        // Guard: ensure eventBusWire looks correct.
        if (
          !eventBusWire ||
          typeof (eventBusWire as Record<string, unknown>).onCollision !== 'function'
        ) {
          return;
        }

        const bus = eventBusWire as EventBusWire;

        // ── 1. Collision event ──
        // Check if the game state signals a collision this frame.
        const hasCollision = Boolean(gameState.collisionThisFrame) ||
          Boolean(gameState._collisionThisFrame) ||
          collisionThisFrame;

        if (hasCollision) {
          const collisionType = String(gameState.collisionType ?? 'unknown');
          const position = {
            x: Number((gameState.collisionPosition as { x: number } | undefined)?.x ?? 0),
            y: Number((gameState.collisionPosition as { y: number } | undefined)?.y ?? 0),
          };
          const fatal = Boolean(gameState.collisionFatal ?? true);
          bus.onCollision(collisionType, position, fatal);

          // Reset the flag so it doesn't re-fire.
          collisionThisFrame = false;
        }

        // ── 2. Direction change event ──
        const currentDirection = String(gameState.direction ?? 'RIGHT');
        if (previousDirection !== null && previousDirection !== currentDirection) {
          bus.onDirectionChange(currentDirection, previousDirection);
        }
        previousDirection = currentDirection;

        // ── 3. Difficulty change event ──
        const currentDiffLabel = String(gameState.difficultyLabel ?? gameState.difficulty ?? '');
        if (currentDiffLabel && previousDifficultyLabel !== null &&
            previousDifficultyLabel !== currentDiffLabel) {
          bus.onDifficultyChange(previousDifficultyLabel, currentDiffLabel);
        }
        previousDifficultyLabel = currentDiffLabel || null;

        // ── 4. Timer tick event ──
        // Emit for timed and speed-run modes.
        const isTimed = Boolean(gameState.isTimedMode) ||
          Boolean(gameState.isSpeedRun);
        const timeRemaining = Number(gameState.timeRemaining ?? 0);
        if (isTimed && timeRemaining > 0) {
          bus.onTimerTick(timeRemaining);
        }

        // ── 5. Weather change event ──
        const currentWeather = String(gameState.weather ?? 'clear');
        if (previousWeather !== null && previousWeather !== currentWeather) {
          bus.onWeatherChange(currentWeather);
        }
        previousWeather = currentWeather;

        // ── 6. Skin change event ──
        const currentSkin = String(gameState.activeSkin ?? gameState.skin ?? 'default');
        if (previousSkin !== null && previousSkin !== currentSkin) {
          bus.onSkinChange(currentSkin);
        }
        previousSkin = currentSkin;

        activatedFlags.allEventsWired = true;
        save();
      }, undefined, 'wireAllEvents');
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 8 — getWiringStatus
    // ────────────────────────────────────────────────────────────────────────
    //
    // Returns a snapshot of which wiring connections have been activated.
    // Each flag becomes `true` the first time its corresponding method is
    // successfully called, and is persisted to localStorage.
    //
    getWiringStatus(): WiringStatus {
      return { ...activatedFlags };
    },

    // ────────────────────────────────────────────────────────────────────────
    // Method 9 — getUnwiredItems
    // ────────────────────────────────────────────────────────────────────────
    //
    // Scans the current wiring status and returns human-readable descriptions
    // of any systems that have not yet been wired (i.e. their method has
    // never been called successfully).
    //
    getUnwiredItems(): string[] {
      const items: string[] = [];

      if (!activatedFlags.practiceModeWired) {
        items.push(
          'Practice mode collision handling not yet wired — ' +
          'call handlePracticeCollision() on each collision event',
        );
      }
      if (!activatedFlags.effectModifiersWired) {
        items.push(
          'Power-up effect modifiers (speed/score) not yet wired — ' +
          'call applyPowerUpEffectsToSpeed() and applyPowerUpEffectsToScore() in the game loop',
        );
      }
      if (!activatedFlags.p2ScoreWired) {
        items.push(
          'P2 score live wire not yet connected — ' +
          'call wireP2ScoreLive() when P2 eats a word in PvP mode',
        );
      }
      if (!activatedFlags.modeTimerWired) {
        items.push(
          'Mode timer tick not yet wired — ' +
          'call wireModeTimerTick() each frame for timed/blitz/marathon modes',
        );
      }
      if (!activatedFlags.allEventsWired) {
        items.push(
          'All-events bus not yet wired — ' +
          'call wireAllEvents() at the end of each game loop tick to emit collision, ' +
          'direction, difficulty, timer, weather, and skin events',
        );
      }
      if (!activatedFlags.achievementNotifsWired) {
        items.push(
          'Achievement notifications + XP not yet wired — ' +
          'call wireAchievementNotifications() when achievements unlock',
        );
      }

      // Cache for debugging / telemetry.
      unwiredItems = items;
      save();

      return items;
    },

    // ────────────────────────────────────────────────────────────────────────
    // reset — clear all flags and persisted state
    // ────────────────────────────────────────────────────────────────────────
    reset(): void {
      activatedFlags.practiceModeWired = false;
      activatedFlags.effectModifiersWired = false;
      activatedFlags.p2ScoreWired = false;
      activatedFlags.modeTimerWired = false;
      activatedFlags.allEventsWired = false;
      activatedFlags.achievementNotifsWired = false;
      unwiredItems = [];
      previousDifficultyLabel = null;
      previousWeather = null;
      previousSkin = null;
      previousDirection = null;
      collisionThisFrame = false;

      // Clear persisted state.
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore.
      }
    },
  };

  return hub;
}
