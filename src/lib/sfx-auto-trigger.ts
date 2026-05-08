'use client';

import {
  onAnyEvent,
  type GameHookEvent,
  type GameEventPayload,
} from './game-event-hooks';
import {
  triggerGameEvent,
  createEventTriggerer,
  type SfxIntegrationConfig,
} from './sfx-event-integrator';
import { getSfxVolume, loadSfxConfig, type SfxVolumeConfig } from './sfx-volume-control';

// ─── Hook → SFX Action Mapping ────────────────────────────────────────────────
//
// Every `GameHookEvent` (38 total) is mapped to a dot-notation SFX action
// string understood by `sfx-event-integrator`.  This is the single source
// of truth that wires the game event bus to the audio subsystem.

export const HOOK_TO_SFX_MAP: Record<GameHookEvent, string> = {
  'game:start':        'game.start',
  'game:end':          'game.over',
  'game:pause':        'game.pause',
  'game:resume':       'game.resume',
  'word:eat':          'word.eat',
  'word:spawn':        'ui.click',
  'word:rare':         'word.eat.rare',
  'word:legendary':    'word.eat.legendary',
  'score:change':      'coin.collect',
  'combo:start':       'combo.chain',
  'combo:end':         'combo.break',
  'combo:increase':    'combo.chain',
  'powerup:spawn':     'ui.click',
  'powerup:collect':   'powerup.collect',
  'powerup:activate':  'powerup.activate',
  'powerup:expire':    'powerup.expire',
  'obstacle:spawn':    'wall.hit',
  'obstacle:hit':      'wall.hit',
  'obstacle:destroy':  'wall.destroy',
  'portal:enter':      'portal.enter',
  'portal:exit':       'portal.exit',
  'boss:appear':       'boss.appear',
  'boss:hit':          'boss.hit',
  'boss:defeat':       'boss.defeat',
  'quiz:show':         'quiz.timeout',
  'quiz:correct':      'quiz.correct',
  'quiz:wrong':        'quiz.wrong',
  'achievement:unlock':'achievement.unlock',
  'coin:earn':         'coin.collect',
  'coin:spend':        'coin.spend',
  'weather:change':    'ui.toggle',
  'difficulty:change': 'speed.increase',
  'skin:change':       'ui.toggle',
  'theme:change':      'ui.slide',
  'easter:egg':        'easter.egg',
  'pvp:start':         'game.start',
  'pvp:end':           'game.over',
  'daily:start':       'game.start',
  'daily:complete':    'daily.complete',
};

// ─── Module State ─────────────────────────────────────────────────────────────

let _autoSfxInitialized = false;

// ─── Core: initAutoSfx ────────────────────────────────────────────────────────

/**
 * Subscribe to ALL game events via the wildcard bus and automatically fire
 * the corresponding SFX through the integrator.
 *
 * Call once during app bootstrap (e.g. inside a React `useEffect`).
 * The returned cleanup function unsubscribes and tears down the wiring.
 *
 * @param sfxEnabled  Whether the SFX system is active.
 * @param sfxConfig   Current per-category volume config (may be null).
 * @returns           An unsubscribe function to tear down the wiring.
 */
export function initAutoSfx(
  sfxEnabled: boolean,
  sfxConfig: SfxVolumeConfig | null,
): () => void {
  const config: SfxIntegrationConfig = {
    enabled: sfxEnabled,
    masterVolume: sfxConfig?.volume ?? 0.7,
    sfxConfig,
  };

  const handle = onAnyEvent((payload: GameEventPayload) => {
    const action = HOOK_TO_SFX_MAP[payload.type];
    if (action) {
      triggerGameEvent(action, config);
    }
  });

  _autoSfxInitialized = true;

  // Return a cleanup that updates the flag and unsubscribes
  return () => {
    handle.unsubscribe();
    _autoSfxInitialized = false;
  };
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

/** Return a shallow copy of the full hook→SFX mapping table. */
export function getHookToSfxMapping(): Record<string, string> {
  return { ...HOOK_TO_SFX_MAP };
}

/** Whether `initAutoSfx` has been called and is currently active. */
export function isSfxWired(): boolean {
  return _autoSfxInitialized;
}

/**
 * Return any `GameHookEvent` values that are NOT present in the mapping.
 * Useful for debugging coverage after adding new events.
 */
export function getUnmappedEvents(): string[] {
  const allEvents: GameHookEvent[] = [
    'game:start', 'game:end', 'game:pause', 'game:resume',
    'word:eat', 'word:spawn', 'word:rare', 'word:legendary',
    'score:change', 'combo:start', 'combo:end', 'combo:increase',
    'powerup:spawn', 'powerup:collect', 'powerup:activate', 'powerup:expire',
    'obstacle:spawn', 'obstacle:hit', 'obstacle:destroy',
    'portal:enter', 'portal:exit',
    'boss:appear', 'boss:hit', 'boss:defeat',
    'quiz:show', 'quiz:correct', 'quiz:wrong',
    'achievement:unlock',
    'coin:earn', 'coin:spend',
    'weather:change', 'difficulty:change',
    'skin:change', 'theme:change',
    'easter:egg',
    'pvp:start', 'pvp:end',
    'daily:start', 'daily:complete',
  ];
  return allEvents.filter((e) => !(e in HOOK_TO_SFX_MAP));
}
