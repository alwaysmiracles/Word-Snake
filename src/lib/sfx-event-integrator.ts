'use client';

import {
  playGameEventSound,
  getEventCategory,
  type GameEventType,
} from './sfx-event-mapper';
import {
  getSfxVolume,
  type SfxVolumeConfig,
} from './sfx-volume-control';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Describes a single game event that should be routed to the SFX system. */
export type GameEventContext = {
  type: GameEventType;
  data?: Record<string, number | string | boolean>;
  volume?: number;
  muted?: boolean;
};

/** Top-level integration config consumed by the trigger functions. */
export type SfxIntegrationConfig = {
  enabled: boolean;
  masterVolume: number;
  sfxConfig: SfxVolumeConfig | null;
};

// ─── Action → Event Mapping ───────────────────────────────────────────────────

/**
 * Maps dot-notation game action names to their `GameEventType`.
 * Decouples action producers from the concrete event enum.
 */
export const GAME_EVENT_TRIGGERS: Record<string, GameEventType> = {
  'word.eat': 'word_eat', 'word.eat.rare': 'word_eat_rare',
  'word.eat.legendary': 'word_eat_legendary',
  'powerup.collect': 'powerup_collect', 'powerup.activate': 'powerup_activate',
  'powerup.expire': 'powerup_expire',
  'achievement.unlock': 'achievement_unlock',
  'achievement.progress': 'achievement_progress',
  'game.over': 'game_over', 'game.start': 'game_start',
  'game.pause': 'game_pause', 'game.resume': 'game_resume',
  'combo.chain': 'combo_chain', 'combo.break': 'combo_break',
  'boss.appear': 'boss_appear', 'boss.hit': 'boss_hit', 'boss.defeat': 'boss_defeat',
  'quiz.correct': 'quiz_correct', 'quiz.wrong': 'quiz_wrong', 'quiz.timeout': 'quiz_timeout',
  'portal.enter': 'portal_enter', 'portal.exit': 'portal_exit',
  'wall.hit': 'wall_hit', 'wall.destroy': 'wall_destroy', 'shield.block': 'shield_block',
  'coin.collect': 'coin_collect', 'coin.spend': 'coin_spend',
  'ui.click': 'ui_click', 'ui.toggle': 'ui_toggle', 'ui.slide': 'ui_slide',
  'easter.egg': 'easter_egg_trigger',
  'snake.grow': 'snake_grow', 'speed.increase': 'speed_increase',
  'daily.complete': 'daily_challenge_complete', 'streak.milestone': 'streak_milestone',
  'replay.record': 'replay_record', 'replay.play': 'replay_play',
};

// ─── Trigger Functions ────────────────────────────────────────────────────────

/**
 * Look up the action in the trigger map, resolve the effective volume via
 * `getSfxVolume`, and play the corresponding game-event sound.
 * Does nothing when SFX is disabled or the action has no mapping.
 *
 * @param action  A dot-notation action string (e.g. `'word.eat'`).
 * @param config  Current integration config.
 */
export function triggerGameEvent(action: string, config: SfxIntegrationConfig): void {
  if (!config.enabled) return;

  const eventType = GAME_EVENT_TRIGGERS[action];
  if (!eventType) return;

  const category = getEventCategory(eventType);
  const volume = config.sfxConfig
    ? getSfxVolume(config.sfxConfig, category) * config.masterVolume
    : config.masterVolume;

  playGameEventSound(eventType, volume);
}

/**
 * Create a bound trigger function that closes over a given `config`.
 * Useful when many components need to fire SFX without passing config each time.
 *
 * ```ts
 * const fire = createEventTriggerer({ enabled: true, masterVolume: 0.7, sfxConfig });
 * fire('word.eat');
 * ```
 *
 * @param config  The integration config captured by the closure.
 * @returns       A function that accepts an action string.
 */
export function createEventTriggerer(
  config: SfxIntegrationConfig,
): (action: string) => void {
  return (action: string) => triggerGameEvent(action, config);
}

/**
 * Fire multiple game events in sequence with a configurable stagger delay.
 * Each event is scheduled via `setTimeout` to prevent audio overlap.
 *
 * @param actions  Array of dot-notation action strings.
 * @param config   Current integration config.
 * @param delayMs  Milliseconds between consecutive triggers (default `50`).
 */
export function batchTriggerEvents(
  actions: string[],
  config: SfxIntegrationConfig,
  delayMs: number = 50,
): void {
  actions.forEach((action, i) => {
    setTimeout(() => triggerGameEvent(action, config), i * delayMs);
  });
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

/**
 * Return the `GameEventType` associated with an action string, or `null`
 * if the action has no mapping.
 *
 * @param action  A dot-notation action string.
 */
export function getMappedAction(action: string): GameEventType | null {
  return GAME_EVENT_TRIGGERS[action] ?? null;
}

/**
 * Check whether a given action is both mapped and enabled in the config.
 *
 * @param action  A dot-notation action string.
 * @param config  Current integration config.
 */
export function isEventEnabled(action: string, config: SfxIntegrationConfig): boolean {
  return config.enabled && action in GAME_EVENT_TRIGGERS;
}

/**
 * Return aggregate statistics about the current event mapping table.
 * Useful for debugging or rendering an admin/developer overlay.
 *
 * - **totalEvents** — number of entries in `GAME_EVENT_TRIGGERS`.
 * - **mappedEvents** — same as `totalEvents` (all entries map to a valid type).
 * - **categories** — histogram of how many events belong to each SFX category.
 */
export function getEventStats(): {
  totalEvents: number;
  mappedEvents: number;
  categories: Record<string, number>;
} {
  const actions = Object.keys(GAME_EVENT_TRIGGERS);
  const categories: Record<string, number> = {};

  for (const action of actions) {
    const eventType = GAME_EVENT_TRIGGERS[action];
    const cat = getEventCategory(eventType);
    categories[cat] = (categories[cat] ?? 0) + 1;
  }

  return { totalEvents: actions.length, mappedEvents: actions.length, categories };
}
