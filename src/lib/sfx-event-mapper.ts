'use client';

import type { SfxCategory } from './sfx-volume-control';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GameEventType =
  | 'word_eat' | 'word_eat_rare' | 'word_eat_legendary'
  | 'powerup_collect' | 'powerup_activate' | 'powerup_expire'
  | 'achievement_unlock' | 'achievement_progress'
  | 'game_over' | 'game_start' | 'game_pause' | 'game_resume'
  | 'combo_chain' | 'combo_break'
  | 'boss_appear' | 'boss_hit' | 'boss_defeat'
  | 'quiz_correct' | 'quiz_wrong' | 'quiz_timeout'
  | 'portal_enter' | 'portal_exit'
  | 'wall_hit' | 'wall_destroy' | 'shield_block'
  | 'coin_collect' | 'coin_spend'
  | 'ui_click' | 'ui_toggle' | 'ui_slide'
  | 'easter_egg_trigger'
  | 'snake_grow' | 'speed_increase'
  | 'daily_challenge_complete'
  | 'streak_milestone'
  | 'replay_record' | 'replay_play';

export type SfxSoundProfile = {
  frequency: number; duration: number; waveType: OscillatorType;
  attack: number; decay: number; sustain: number; release: number; volume: number;
  detune?: number; sweepTo?: number; sweepTime?: number;
};

export type SfxEventMapping = {
  eventType: GameEventType;
  category: SfxCategory;
  profiles: SfxSoundProfile[];
};

// ─── Descriptions ─────────────────────────────────────────────────────────────

const EVENT_DESCRIPTIONS: Record<GameEventType, string> = {
  word_eat: 'Snake eats a regular word', word_eat_rare: 'Snake eats a rare word',
  word_eat_legendary: 'Snake eats a legendary word',
  powerup_collect: 'Power-up collected', powerup_activate: 'Power-up activated',
  powerup_expire: 'Power-up expired',
  achievement_unlock: 'Achievement unlocked', achievement_progress: 'Achievement progress updated',
  game_over: 'Game ended', game_start: 'Game started', game_pause: 'Game paused',
  game_resume: 'Game resumed', combo_chain: 'Combo chain continuing',
  combo_break: 'Combo chain broken', boss_appear: 'Boss appeared on the field',
  boss_hit: 'Boss took damage', boss_defeat: 'Boss defeated',
  quiz_correct: 'Quiz answer was correct', quiz_wrong: 'Quiz answer was wrong',
  quiz_timeout: 'Quiz timed out', portal_enter: 'Entered a portal',
  portal_exit: 'Exited a portal', wall_hit: 'Snake hit a wall',
  wall_destroy: 'Destructible wall destroyed', shield_block: 'Shield blocked a hit',
  coin_collect: 'Coin collected', coin_spend: 'Coins spent',
  ui_click: 'UI element clicked', ui_toggle: 'UI toggle switched',
  ui_slide: 'UI slider moved', easter_egg_trigger: 'Easter egg discovered',
  snake_grow: 'Snake grew in length', speed_increase: 'Game speed increased',
  daily_challenge_complete: 'Daily challenge completed',
  streak_milestone: 'Streak milestone reached', replay_record: 'Replay recording started',
  replay_play: 'Replay playback started',
};

// ─── Shorthand ────────────────────────────────────────────────────────────────

/** Build a profile object with less boilerplate. */
const p = (
  freq: number, dur: number, wave: OscillatorType, vol: number,
  a: number, d: number, s: number, r: number,
  opts?: { detune?: number; sweepTo?: number; sweepTime?: number },
): SfxSoundProfile => ({ frequency: freq, duration: dur, waveType: wave, volume: vol,
  attack: a, decay: d, sustain: s, release: r, ...opts });

// ─── Mappings ─────────────────────────────────────────────────────────────────

export const GAME_EVENT_MAPPINGS: SfxEventMapping[] = [
  // Eating
  { eventType: 'word_eat', category: 'eat', profiles: [
    p(440, 0.1, 'sine', 0.15, 0.005, 0.03, 0.6, 0.065),
  ]},
  { eventType: 'word_eat_rare', category: 'eat', profiles: [
    p(440, 0.15, 'sine', 0.18, 0.005, 0.04, 0.7, 0.065, { sweepTo: 660, sweepTime: 0.15 }),
  ]},
  { eventType: 'word_eat_legendary', category: 'eat', profiles: [
    p(440, 0.1, 'sine', 0.18, 0.005, 0.03, 0.7, 0.065),
    p(660, 0.1, 'sine', 0.18, 0.005, 0.03, 0.7, 0.065, { sweepTo: 880, sweepTime: 0.1 }),
  ]},

  // Power-ups
  { eventType: 'powerup_collect', category: 'powerup', profiles: [
    p(300, 0.2, 'triangle', 0.15, 0.01, 0.05, 0.5, 0.14, { sweepTo: 1200, sweepTime: 0.2 }),
  ]},
  { eventType: 'powerup_activate', category: 'powerup', profiles: [
    p(200, 0.3, 'sawtooth', 0.1, 0.02, 0.08, 0.4, 0.2, { sweepTo: 400, sweepTime: 0.3 }),
  ]},
  { eventType: 'powerup_expire', category: 'powerup', profiles: [
    p(600, 0.2, 'sine', 0.12, 0.01, 0.05, 0.3, 0.14, { sweepTo: 200, sweepTime: 0.2 }),
  ]},

  // Achievements
  { eventType: 'achievement_unlock', category: 'achievement', profiles: [
    p(523, 0.15, 'square', 0.1, 0.005, 0.04, 0.6, 0.065),
    p(659, 0.15, 'square', 0.1, 0.005, 0.04, 0.6, 0.065),
    p(784, 0.2, 'square', 0.1, 0.005, 0.05, 0.5, 0.145),
  ]},
  { eventType: 'achievement_progress', category: 'achievement', profiles: [
    p(880, 0.15, 'sine', 0.12, 0.005, 0.04, 0.5, 0.105),
  ]},

  // Game flow
  { eventType: 'game_over', category: 'gameOver', profiles: [
    p(440, 0.2, 'sawtooth', 0.1, 0.01, 0.05, 0.5, 0.14, { sweepTo: 220, sweepTime: 0.2 }),
    p(220, 0.2, 'sawtooth', 0.1, 0.005, 0.04, 0.4, 0.155, { sweepTo: 110, sweepTime: 0.2 }),
    p(110, 0.2, 'sawtooth', 0.1, 0.005, 0.04, 0.3, 0.155),
  ]},
  { eventType: 'game_start', category: 'ui', profiles: [
    p(262, 0.1, 'triangle', 0.12, 0.005, 0.03, 0.5, 0.065),
    p(330, 0.1, 'triangle', 0.12, 0.005, 0.03, 0.5, 0.065),
    p(392, 0.1, 'triangle', 0.12, 0.005, 0.03, 0.5, 0.065),
  ]},
  { eventType: 'game_pause', category: 'ui', profiles: [
    p(600, 0.05, 'sine', 0.08, 0.002, 0.015, 0.3, 0.033),
  ]},
  { eventType: 'game_resume', category: 'ui', profiles: [
    p(600, 0.05, 'sine', 0.08, 0.002, 0.015, 0.3, 0.033, { sweepTo: 800, sweepTime: 0.05 }),
  ]},

  // Combos
  { eventType: 'combo_chain', category: 'combo', profiles: [
    p(400, 0.12, 'sine', 0.14, 0.005, 0.03, 0.6, 0.085, { sweepTo: 800, sweepTime: 0.12 }),
  ]},
  { eventType: 'combo_break', category: 'combo', profiles: [
    p(300, 0.15, 'square', 0.1, 0.005, 0.04, 0.3, 0.105, { sweepTo: 100, sweepTime: 0.15 }),
  ]},

  // Boss
  { eventType: 'boss_appear', category: 'boss', profiles: [
    p(80, 0.5, 'sawtooth', 0.12, 0.05, 0.15, 0.6, 0.3),
  ]},
  { eventType: 'boss_hit', category: 'boss', profiles: [
    p(200, 0.1, 'square', 0.12, 0.002, 0.03, 0.3, 0.068),
  ]},
  { eventType: 'boss_defeat', category: 'boss', profiles: [
    p(523, 0.2, 'square', 0.1, 0.005, 0.05, 0.6, 0.145),
    p(659, 0.2, 'square', 0.1, 0.005, 0.05, 0.6, 0.145),
    p(784, 0.2, 'square', 0.1, 0.005, 0.05, 0.6, 0.145),
    p(1047, 0.2, 'square', 0.12, 0.005, 0.05, 0.5, 0.145),
  ]},

  // Quiz
  { eventType: 'quiz_correct', category: 'quiz', profiles: [
    p(880, 0.2, 'sine', 0.14, 0.005, 0.05, 0.5, 0.145),
  ]},
  { eventType: 'quiz_wrong', category: 'quiz', profiles: [
    p(150, 0.2, 'square', 0.1, 0.005, 0.05, 0.3, 0.145),
  ]},
  { eventType: 'quiz_timeout', category: 'quiz', profiles: [
    p(440, 0.3, 'sine', 0.1, 0.01, 0.08, 0.4, 0.21, { sweepTo: 220, sweepTime: 0.3 }),
  ]},

  // Portals
  { eventType: 'portal_enter', category: 'eat', profiles: [
    p(200, 0.2, 'sine', 0.12, 0.01, 0.05, 0.5, 0.14, { sweepTo: 800, sweepTime: 0.2 }),
  ]},
  { eventType: 'portal_exit', category: 'eat', profiles: [
    p(800, 0.2, 'sine', 0.12, 0.01, 0.05, 0.5, 0.14, { sweepTo: 200, sweepTime: 0.2 }),
  ]},

  // Walls & shield
  { eventType: 'wall_hit', category: 'eat', profiles: [
    p(100, 0.1, 'square', 0.12, 0.002, 0.03, 0.2, 0.068),
  ]},
  { eventType: 'wall_destroy', category: 'eat', profiles: [
    p(100, 0.15, 'sawtooth', 0.14, 0.002, 0.04, 0.3, 0.108, { sweepTo: 200, sweepTime: 0.15 }),
  ]},
  { eventType: 'shield_block', category: 'powerup', profiles: [
    p(1200, 0.15, 'triangle', 0.12, 0.002, 0.04, 0.4, 0.108),
  ]},

  // Coins
  { eventType: 'coin_collect', category: 'ui', profiles: [
    p(1200, 0.1, 'square', 0.08, 0.002, 0.025, 0.4, 0.073, { sweepTo: 1600, sweepTime: 0.1 }),
  ]},
  { eventType: 'coin_spend', category: 'ui', profiles: [
    p(1600, 0.1, 'square', 0.08, 0.002, 0.025, 0.4, 0.073, { sweepTo: 1200, sweepTime: 0.1 }),
  ]},

  // UI interactions
  { eventType: 'ui_click', category: 'ui', profiles: [
    p(800, 0.03, 'sine', 0.06, 0.001, 0.01, 0.3, 0.019),
  ]},
  { eventType: 'ui_toggle', category: 'ui', profiles: [
    p(600, 0.05, 'triangle', 0.06, 0.002, 0.015, 0.4, 0.033, { sweepTo: 800, sweepTime: 0.05 }),
  ]},
  { eventType: 'ui_slide', category: 'ui', profiles: [
    p(400, 0.08, 'sine', 0.05, 0.002, 0.02, 0.3, 0.058, { sweepTo: 600, sweepTime: 0.08 }),
  ]},

  // Easter egg
  { eventType: 'easter_egg_trigger', category: 'easterEgg', profiles: [
    p(440, 0.13, 'sine', 0.14, 0.005, 0.03, 0.6, 0.095, { sweepTo: 880, sweepTime: 0.13 }),
    p(880, 0.13, 'sine', 0.14, 0.005, 0.03, 0.6, 0.095, { sweepTo: 440, sweepTime: 0.13 }),
    p(440, 0.14, 'sine', 0.12, 0.005, 0.04, 0.4, 0.1),
  ]},

  // Snake & speed
  { eventType: 'snake_grow', category: 'eat', profiles: [
    p(300, 0.1, 'triangle', 0.08, 0.005, 0.03, 0.4, 0.065, { sweepTo: 350, sweepTime: 0.1 }),
  ]},
  { eventType: 'speed_increase', category: 'combo', profiles: [
    p(200, 0.2, 'sawtooth', 0.1, 0.01, 0.05, 0.4, 0.14, { sweepTo: 600, sweepTime: 0.2 }),
  ]},

  // Challenges & streaks
  { eventType: 'daily_challenge_complete', category: 'achievement', profiles: [
    p(523, 0.13, 'triangle', 0.14, 0.005, 0.03, 0.6, 0.095),
    p(659, 0.13, 'triangle', 0.14, 0.005, 0.03, 0.6, 0.095),
    p(784, 0.14, 'triangle', 0.14, 0.005, 0.04, 0.5, 0.1),
  ]},
  { eventType: 'streak_milestone', category: 'combo', profiles: [
    p(440, 0.075, 'sine', 0.12, 0.003, 0.02, 0.6, 0.052, { sweepTo: 660, sweepTime: 0.075 }),
    p(660, 0.075, 'sine', 0.12, 0.003, 0.02, 0.6, 0.052, { sweepTo: 880, sweepTime: 0.075 }),
    p(880, 0.075, 'sine', 0.12, 0.003, 0.02, 0.6, 0.052, { sweepTo: 1100, sweepTime: 0.075 }),
    p(1100, 0.075, 'sine', 0.14, 0.003, 0.02, 0.5, 0.052),
  ]},

  // Replay
  { eventType: 'replay_record', category: 'ui', profiles: [
    p(900, 0.08, 'sine', 0.08, 0.005, 0.02, 0.5, 0.055, { sweepTo: 1200, sweepTime: 0.08 }),
  ]},
  { eventType: 'replay_play', category: 'ui', profiles: [
    p(1200, 0.08, 'sine', 0.08, 0.005, 0.02, 0.5, 0.055, { sweepTo: 900, sweepTime: 0.08 }),
  ]},
];

// ─── Derived Exports ──────────────────────────────────────────────────────────

/** All 35 game event types in definition order. */
export const ALL_GAME_EVENT_TYPES: GameEventType[] =
  GAME_EVENT_MAPPINGS.map(m => m.eventType);

const MAPPING_BY_EVENT = new Map<GameEventType, SfxEventMapping>(
  GAME_EVENT_MAPPINGS.map(m => [m.eventType, m]),
);

// ─── AudioContext Singleton ───────────────────────────────────────────────────

let sharedCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!sharedCtx) {
    try { sharedCtx = new AudioContext(); } catch { return null; }
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

// ─── Sound Synthesis ──────────────────────────────────────────────────────────

/**
 * Play the synthesised SFX for a game event.
 *
 * Profiles in the mapping are scheduled sequentially using the Web Audio API
 * clock so timing stays precise regardless of the main thread frame rate.
 *
 * @param eventType  The game event whose sound should play.
 * @param volume     Overall volume multiplier (0–1). The caller should already
 *                   factor in category volume via `getSfxVolume` from volume-control.
 */
export function playGameEventSound(eventType: GameEventType, volume: number = 1.0): void {
  const mapping = MAPPING_BY_EVENT.get(eventType);
  if (!mapping) return;

  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  let offset = 0;

  for (const profile of mapping.profiles) {
    scheduleProfile(ctx, now + offset, profile, volume);
    offset += profile.duration;
  }
}

/** Schedule one oscillator with ADSR envelope into the AudioContext. */
function scheduleProfile(
  ctx: AudioContext, startTime: number, profile: SfxSoundProfile, masterVolume: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = profile.waveType;
  if (profile.detune !== undefined) osc.detune.setValueAtTime(profile.detune, startTime);
  osc.frequency.setValueAtTime(profile.frequency, startTime);

  if (profile.sweepTo !== undefined && profile.sweepTime !== undefined) {
    osc.frequency.linearRampToValueAtTime(profile.sweepTo, startTime + profile.sweepTime);
  }

  // ADSR envelope
  const peak = profile.volume * masterVolume;
  const susLevel = peak * profile.sustain;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + profile.attack);
  gain.gain.linearRampToValueAtTime(susLevel, startTime + profile.attack + profile.decay);
  gain.gain.setValueAtTime(susLevel, startTime + profile.duration - profile.release);
  gain.gain.linearRampToValueAtTime(0, startTime + profile.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + profile.duration + 0.01);
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

/** Return the SFX volume category for a given game event. */
export function getEventCategory(eventType: GameEventType): SfxCategory {
  return MAPPING_BY_EVENT.get(eventType)?.category ?? 'ui';
}

/** Return a human-readable description of a game event. */
export function getEventDescription(eventType: GameEventType): string {
  return EVENT_DESCRIPTIONS[eventType] ?? eventType;
}
