'use client';

// ── Types ────────────────────────────────────────────────────

/** All game events that can trigger particle effects */
export type ParticleEventType =
  | 'word_eat' | 'combo' | 'powerup' | 'death'
  | 'level_up' | 'boss_defeat' | 'achievement' | 'portal'
  | 'quiz_correct' | 'shield_block';

/** Preset names users can assign – visual styles + themed composites */
export type ParticlePresetName =
  | 'burst' | 'spiral' | 'ring' | 'star' | 'trail'
  | 'confetti' | 'sparkle' | 'snow' | 'rain' | 'firework'
  | 'achievement_unlock' | 'boss_defeat' | 'portal_swirl' | 'level_up';

/** Maps each game event to its assigned particle preset (`null` = muted) */
export type ParticleEventMapping = Record<ParticleEventType, ParticlePresetName | null>;

/** Per-event toggle + global multiplier settings */
export interface ParticleCustomization {
  eventMapping: ParticleEventMapping;
  /** Global size multiplier (0.5–2.0, default 1.0) */
  sizeMultiplier: number;
  /** Global opacity (0.3–1.0, default 1.0) */
  opacity: number;
  /** Toggle individual events on/off */
  enabledEvents: Partial<Record<ParticleEventType, boolean>>;
}

/** Shape of one entry in a preset-category group */
export interface PresetCategory {
  label: string;
  emoji: string;
  presets: ParticlePresetName[];
}

// ── Constants ────────────────────────────────────────────────

const STORAGE_KEY = 'word-snake-particle-customization';

const ALL_EVENTS: ParticleEventType[] = [
  'word_eat', 'combo', 'powerup', 'death', 'level_up',
  'boss_defeat', 'achievement', 'portal', 'quiz_correct', 'shield_block',
];

/** Sensible default preset for every game event */
export const DEFAULT_EVENT_PRESETS: ParticleEventMapping = {
  word_eat:     'burst',
  combo:        'spiral',
  powerup:      'ring',
  death:        'firework',
  level_up:     'level_up',
  boss_defeat:  'boss_defeat',
  achievement:  'achievement_unlock',
  portal:       'portal_swirl',
  quiz_correct: 'sparkle',
  shield_block: 'star',
};

/** Group presets by visual style so the UI can render picker sections */
export const PRESET_CATEGORIES: PresetCategory[] = [
  { label: 'Explosions', emoji: '💥', presets: ['burst', 'firework', 'star'] },
  { label: 'Flowing',    emoji: '🌀', presets: ['spiral', 'ring', 'trail'] },
  { label: 'Festive',    emoji: '🎉', presets: ['confetti', 'sparkle'] },
  { label: 'Weather',    emoji: '🌦️', presets: ['snow', 'rain'] },
  { label: 'Themed',     emoji: '🎮', presets: ['achievement_unlock', 'boss_defeat', 'portal_swirl', 'level_up'] },
];

/** Factory that builds a clean customization object with all events enabled */
export function createDefaultCustomization(): ParticleCustomization {
  const enabledEvents: Partial<Record<ParticleEventType, boolean>> = {};
  for (const ev of ALL_EVENTS) enabledEvents[ev] = true;

  return {
    eventMapping: { ...DEFAULT_EVENT_PRESETS },
    sizeMultiplier: 1.0,
    opacity: 1.0,
    enabledEvents,
  };
}

// ── Persistence ──────────────────────────────────────────────

/**
 * Read the saved customization from localStorage.
 * Returns a fresh default if nothing is stored or the data is invalid.
 */
export function getSavedParticleCustomization(): ParticleCustomization {
  if (typeof window === 'undefined') return createDefaultCustomization();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultCustomization();

    const parsed = JSON.parse(raw) as ParticleCustomization;
    if (typeof parsed !== 'object' || parsed === null) return createDefaultCustomization();

    // Merge with defaults so missing fields from older saves are filled in
    const base = createDefaultCustomization();
    return {
      eventMapping: { ...base.eventMapping, ...parsed.eventMapping },
      sizeMultiplier: clamp(typeof parsed.sizeMultiplier === 'number' ? parsed.sizeMultiplier : 1, 0.5, 2.0),
      opacity: clamp(typeof parsed.opacity === 'number' ? parsed.opacity : 1, 0.3, 1.0),
      enabledEvents: { ...base.enabledEvents, ...parsed.enabledEvents },
    };
  } catch {
    return createDefaultCustomization();
  }
}

/** Persist a customization object to localStorage */
export function saveParticleCustomization(config: ParticleCustomization): void {
  if (typeof window === 'undefined') return;

  try {
    const serializable: ParticleCustomization = {
      eventMapping: { ...config.eventMapping },
      sizeMultiplier: clamp(config.sizeMultiplier, 0.5, 2.0),
      opacity: clamp(config.opacity, 0.3, 1.0),
      enabledEvents: { ...config.enabledEvents },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    console.warn('[ParticleCustomization] Failed to save to localStorage');
  }
}

// ── Lookup helpers ───────────────────────────────────────────

/**
 * Resolve which preset to use for a given event.
 * Returns `null` when the event is disabled or its mapping is `null`.
 */
export function getParticlePresetForEvent(
  eventType: ParticleEventType,
  customization: ParticleCustomization,
): ParticlePresetName | null {
  if (customization.enabledEvents[eventType] === false) return null;
  return customization.eventMapping[eventType];
}

// ── Internal helpers ─────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
