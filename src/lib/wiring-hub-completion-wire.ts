/**
 * wiring-hub-completion-wire.ts
 *
 * Wraps the GameWiringHub's 3 unwired methods (wireAllEvents,
 * wireAchievementNotifications, wireModeTimerTick) and provides a
 * single-call integration point for the game loop.
 *
 * This module is the bridge between the raw wiring-hub API and the
 * per-tick game loop in snake-game.tsx.  Every method is safe (no-throw):
 * errors are caught, logged as warnings, and reported via WiringResult.
 *
 * Persistence: call counts, error counts, and last-call timestamps are
 * saved to localStorage under `ws_wiring_hub_completion`.
 *
 * No React dependencies — safe to import from both server and client code.
 */

import {
  createGameWiringHub,
  type GameWiringHub,
  type TimerTickResult as HubTimerTickResult,
} from '@/lib/game-wiring-hub';

import { onAchievementUnlocked } from '@/lib/notif-event-wire';
import { awardXP } from '@/lib/xp-scoring-wire';
import type { XPEventType } from '@/lib/xp-scoring-wire';

// Re-export the underlying functions so callers can use them directly
// without needing a separate import from their original modules.
export { onAchievementUnlocked, awardXP };
export type { XPEventType };

// ─── Public types ─────────────────────────────────────────────────────────────

export interface AchievementInput {
  title: string;
  description: string;
  emoji: string;
  id: string;
  rarity?: string;
}

export interface WiringContext {
  /** For wireAllEvents */
  eventBusWire: unknown;
  gameState: Record<string, unknown>;

  /** For wireAchievementNotifications (only if new achievements detected) */
  newAchievements?: AchievementInput[];
  notifWire?: unknown;
  xpWire?: unknown;

  /** For wireModeTimerTick */
  modeEngine?: unknown;
}

export interface EventWiringContext {
  eventBusWire: unknown;
  gameState: Record<string, unknown>;
}

export interface WiringResult {
  eventsWired: boolean;
  achievementsWired: boolean;
  timerWired: boolean;
  errors: string[];
  modeEnded?: boolean;
  modeEndReason?: string;
}

export interface TimerTickResult {
  modeEnded: boolean;
  reason?: string;
}

export interface CompletionStatus {
  eventsConnected: boolean;
  achievementsConnected: boolean;
  timerConnected: boolean;
  totalCalls: number;
  lastCallAt: number;
  errorCount: number;
}

export interface WiringHubCompletionWire {
  /** Single-call integration — call at end of each game tick */
  wireAllRemainingSystems(context: WiringContext): WiringResult;

  /** Individual: wire events via GameWiringHub.wireAllEvents */
  wireEvents(context: EventWiringContext): void;

  /** Individual: fire achievement notifications + award XP */
  wireAchievements(
    newAchievements: AchievementInput[],
    notifWire: unknown,
    xpWire: unknown,
  ): void;

  /** Individual: tick timed-mode timer and detect expiry */
  wireTimerTick(modeEngine: unknown, gameState: unknown): TimerTickResult;

  /** Diagnostics */
  getCompletionStatus(): CompletionStatus;
  getUnwiredItems(): string[];
  getCallCounts(): Record<string, number>;
  resetStats(): void;
}

// ─── Persistence types ────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_wiring_hub_completion';

interface PersistedStats {
  callCounts: Record<string, number>;
  errorCounts: Record<string, number>;
  successFlags: Record<string, boolean>;
  timingMs: Record<string, number[]>;
  lastCallAt: number;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadStats(): PersistedStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw) as PersistedStats;
    if (parsed && typeof parsed.callCounts === 'object') {
      return parsed;
    }
    return freshStats();
  } catch {
    return freshStats();
  }
}

function freshStats(): PersistedStats {
  return {
    callCounts: {},
    errorCounts: {},
    successFlags: {},
    timingMs: {},
    lastCallAt: 0,
  };
}

function saveStats(stats: PersistedStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage full or unavailable — silently degrade.
  }
}

// ─── Timing helper ────────────────────────────────────────────────────────────

function measureMs(fn: () => void): { elapsed: number; threw: boolean; error?: string } {
  const start = performance.now();
  try {
    fn();
    return { elapsed: performance.now() - start, threw: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { elapsed: performance.now() - start, threw: true, error: msg };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a `WiringHubCompletionWire` instance.
 *
 * Internally creates a `GameWiringHub` and delegates to its 3 unwired
 * methods.  Restores persisted stats from localStorage on creation.
 */
export function createWiringHubCompletionWire(): WiringHubCompletionWire {
  const hub: GameWiringHub = createGameWiringHub();
  const stats = loadStats();

  // ── Internal mutators ──

  function bumpCall(key: string): void {
    stats.callCounts[key] = (stats.callCounts[key] ?? 0) + 1;
    stats.lastCallAt = Date.now();
  }

  function bumpError(key: string, msg: string): void {
    stats.errorCounts[key] = (stats.errorCounts[key] ?? 0) + 1;
    console.warn(
      `[wiring-hub-completion-wire] ${key} failed: ${msg}`,
    );
  }

  function markSuccess(key: string): void {
    stats.successFlags[key] = true;
  }

  function pushTiming(key: string, ms: number): void {
    if (!stats.timingMs[key]) stats.timingMs[key] = [];
    stats.timingMs[key]!.push(ms);
    // Keep only the last 100 samples per key.
    if (stats.timingMs[key]!.length > 100) {
      stats.timingMs[key] = stats.timingMs[key]!.slice(-100);
    }
  }

  function flush(): void {
    saveStats(stats);
  }

  // ── Build the wire ──

  const wire: WiringHubCompletionWire = {
    // ────────────────────────────────────────────────────────────────────────
    // wireAllRemainingSystems
    // ────────────────────────────────────────────────────────────────────────
    //
    // Calls all 3 hub methods in sequence.  Each call is independently
    // try/caught so a failure in one does not block the others.
    //
    wireAllRemainingSystems(context: WiringContext): WiringResult {
      const errors: string[] = [];
      let eventsWired = false;
      let achievementsWired = false;
      let timerWired = false;
      let modeEnded: boolean | undefined;
      let modeEndReason: string | undefined;

      // ── 1. wireAllEvents ──
      {
        bumpCall('wireAllEvents');
        const { elapsed, threw, error } = measureMs(() => {
          hub.wireAllEvents(context.eventBusWire, context.gameState);
        });
        pushTiming('wireAllEvents', elapsed);

        if (threw) {
          errors.push(`wireAllEvents: ${error ?? 'unknown error'}`);
          bumpError('wireAllEvents', error ?? 'unknown');
        } else {
          eventsWired = true;
          markSuccess('wireAllEvents');
        }
      }

      // ── 2. wireAchievementNotifications ──
      {
        const hasAch =
          Array.isArray(context.newAchievements) &&
          context.newAchievements.length > 0 &&
          context.notifWire != null;

        if (hasAch) {
          bumpCall('wireAchievementNotifications');
          const { elapsed, threw, error } = measureMs(() => {
            hub.wireAchievementNotifications(
              context.newAchievements!.map((a) => ({
                title: a.title,
                description: a.description,
                emoji: a.emoji,
              })),
              context.notifWire,
              context.xpWire,
            );
          });
          pushTiming('wireAchievementNotifications', elapsed);

          if (threw) {
            errors.push(`wireAchievementNotifications: ${error ?? 'unknown error'}`);
            bumpError('wireAchievementNotifications', error ?? 'unknown');
          } else {
            achievementsWired = true;
            markSuccess('wireAchievementNotifications');
          }
        } else {
          // No achievements to process — mark as skipped, not wired.
          achievementsWired = false;
        }
      }

      // ── 3. wireModeTimerTick ──
      {
        const hasTimer = context.modeEngine != null;

        if (hasTimer) {
          bumpCall('wireModeTimerTick');
          const { elapsed, threw, error } = measureMs(() => {
            const result: HubTimerTickResult = hub.wireModeTimerTick(
              context.modeEngine as Parameters<typeof hub.wireModeTimerTick>[0],
              {
                gameOver: Boolean(
                  (context.gameState as Record<string, unknown>)?.gameOver,
                ),
                gameStarted: Boolean(
                  (context.gameState as Record<string, unknown>)?.gameStarted,
                ),
                paused: Boolean(
                  (context.gameState as Record<string, unknown>)?.paused,
                ),
                score: Number(
                  (context.gameState as Record<string, unknown>)?.score,
                ) || 0,
                elapsedTime: Number(
                  (context.gameState as Record<string, unknown>)?.elapsedTime,
                ) || 0,
                startTime: Number(
                  (context.gameState as Record<string, unknown>)?.startTime,
                ) || Date.now(),
                isSpeedRun: Boolean(
                  (context.gameState as Record<string, unknown>)?.isSpeedRun,
                ),
                isTimedMode: Boolean(
                  (context.gameState as Record<string, unknown>)?.isTimedMode,
                ),
                timeRemaining: Number(
                  (context.gameState as Record<string, unknown>)?.timeRemaining,
                ) || 0,
              },
            );

            if (result.modeEnded) {
              modeEnded = true;
              modeEndReason = result.reason;
            }
          });
          pushTiming('wireModeTimerTick', elapsed);

          if (threw) {
            errors.push(`wireModeTimerTick: ${error ?? 'unknown error'}`);
            bumpError('wireModeTimerTick', error ?? 'unknown');
          } else {
            timerWired = true;
            markSuccess('wireModeTimerTick');
          }
        } else {
          // No mode engine — timer wiring is not applicable this tick.
          timerWired = false;
        }
      }

      flush();
      return {
        eventsWired,
        achievementsWired,
        timerWired,
        errors,
        modeEnded,
        modeEndReason,
      };
    },

    // ────────────────────────────────────────────────────────────────────────
    // wireEvents — granular wrapper for hub.wireAllEvents
    // ────────────────────────────────────────────────────────────────────────
    wireEvents(context: EventWiringContext): void {
      bumpCall('wireAllEvents');
      const { elapsed, threw, error } = measureMs(() => {
        hub.wireAllEvents(context.eventBusWire, context.gameState);
      });
      pushTiming('wireAllEvents', elapsed);

      if (threw) {
        bumpError('wireAllEvents', error ?? 'unknown');
      } else {
        markSuccess('wireAllEvents');
      }
      flush();
    },

    // ────────────────────────────────────────────────────────────────────────
    // wireAchievements — fires notifications + awards XP directly
    // ────────────────────────────────────────────────────────────────────────
    wireAchievements(
      newAchievements: AchievementInput[],
      notifWire: unknown,
      xpWire: unknown,
    ): void {
      bumpCall('wireAchievementNotifications');
      const { elapsed, threw, error } = measureMs(() => {
        if (!Array.isArray(newAchievements) || newAchievements.length === 0) {
          return;
        }

        // Delegate to the hub's method which handles guards + cooldowns.
        hub.wireAchievementNotifications(
          newAchievements.map((a) => ({
            title: a.title,
            description: a.description,
            emoji: a.emoji,
          })),
          notifWire,
          xpWire,
        );
      });
      pushTiming('wireAchievementNotifications', elapsed);

      if (threw) {
        bumpError('wireAchievementNotifications', error ?? 'unknown');
      } else {
        markSuccess('wireAchievementNotifications');
      }
      flush();
    },

    // ────────────────────────────────────────────────────────────────────────
    // wireTimerTick — ticks timed mode timer and detects expiry
    // ────────────────────────────────────────────────────────────────────────
    wireTimerTick(modeEngine: unknown, gameState: unknown): TimerTickResult {
      bumpCall('wireModeTimerTick');

      let result: HubTimerTickResult = { modeEnded: false };
      const start = performance.now();

      try {
        result = hub.wireModeTimerTick(
          modeEngine as Parameters<typeof hub.wireModeTimerTick>[0],
          gameState as Parameters<typeof hub.wireModeTimerTick>[1],
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        pushTiming('wireModeTimerTick', performance.now() - start);
        bumpError('wireModeTimerTick', msg);
        flush();
        return { modeEnded: false };
      }

      pushTiming('wireModeTimerTick', performance.now() - start);
      markSuccess('wireModeTimerTick');
      flush();

      return {
        modeEnded: result.modeEnded,
        reason: result.reason,
      };
    },

    // ────────────────────────────────────────────────────────────────────────
    // getCompletionStatus
    // ────────────────────────────────────────────────────────────────────────
    getCompletionStatus(): CompletionStatus {
      return {
        eventsConnected: Boolean(stats.successFlags['wireAllEvents']),
        achievementsConnected: Boolean(
          stats.successFlags['wireAchievementNotifications'],
        ),
        timerConnected: Boolean(stats.successFlags['wireModeTimerTick']),
        totalCalls: Object.values(stats.callCounts).reduce((a, b) => a + b, 0),
        lastCallAt: stats.lastCallAt,
        errorCount: Object.values(stats.errorCounts).reduce((a, b) => a + b, 0),
      };
    },

    // ────────────────────────────────────────────────────────────────────────
    // getUnwiredItems
    // ────────────────────────────────────────────────────────────────────────
    getUnwiredItems(): string[] {
      const items: string[] = [];

      if (!stats.successFlags['wireAllEvents']) {
        items.push(
          'Event bus wiring — wireAllEvents() has never succeeded. ' +
            'Ensure eventBusWire has an onCollision method and gameState is populated.',
        );
      }
      if (!stats.successFlags['wireAchievementNotifications']) {
        items.push(
          'Achievement notification wiring — wireAchievementNotifications() ' +
            'has never succeeded. Ensure notifWire has queue+settings and xpWire has profile.',
        );
      }
      if (!stats.successFlags['wireModeTimerTick']) {
        items.push(
          'Mode timer wiring — wireModeTimerTick() has never succeeded. ' +
            'Ensure modeEngine is provided and isTimedMode is true.',
        );
      }

      return items;
    },

    // ────────────────────────────────────────────────────────────────────────
    // getCallCounts
    // ────────────────────────────────────────────────────────────────────────
    getCallCounts(): Record<string, number> {
      return { ...stats.callCounts };
    },

    // ────────────────────────────────────────────────────────────────────────
    // resetStats
    // ────────────────────────────────────────────────────────────────────────
    resetStats(): void {
      stats.callCounts = {};
      stats.errorCounts = {};
      stats.successFlags = {};
      stats.timingMs = {};
      stats.lastCallAt = 0;
      flush();

      // Also reset the underlying hub's wiring flags.
      hub.reset();

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore.
      }
    },
  };

  return wire;
}
