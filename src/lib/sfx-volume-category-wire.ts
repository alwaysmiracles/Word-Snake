/**
 * sfx-volume-category-wire.ts — SFX Category Volume Wiring Module
 *
 * Pure logic module that wires SFX category volumes to the sound preset system.
 * Bridges `sfx-volume-control.ts` (per-category volume controls) with
 * `sound-theme-panel.ts` (8 audio presets) so that selecting a preset affects
 * every SFX category — not just the music track.
 *
 * NO React imports. Safe for both client and server bundles (SSR-safe
 * requestAnimationFrame guard).
 */

// ── Public Interfaces ─────────────────────────────────────────────────────

/** Returned after applying a preset so callers can diff before/after. */
export interface VolumeChangeResult {
  /** `true` when at least one category actually changed value. */
  changed: boolean;
  /** Snapshot of every category volume before the preset was applied. */
  oldVolumes: Record<string, number>;
  /** Snapshot of every category volume after the preset was applied. */
  newVolumes: Record<string, number>;
  /** The preset name that was requested (or `"unknown"`). */
  presetName: string;
}

/** Top-level API surface exposed by `createSfxVolumeCategoryWire()`. */
export interface SfxVolumeCategoryWire {
  /** Apply a named preset to all six SFX + music categories. */
  applyPreset(presetName: string): VolumeChangeResult;

  /** Set the volume of a single category (0–1, clamped). */
  setCategoryVolume(category: string, volume: number): void;

  /** Read the raw volume for a category (master NOT applied). */
  getCategoryVolume(category: string): number;

  /** Snapshot of all six raw category volumes. */
  getAllVolumes(): Record<string, number>;

  /** Scale every category by the given master volume (0–1, clamped). */
  setMasterVolume(volume: number): void;

  /** Current master volume (0–1). */
  getMasterVolume(): number;

  /** Silence all audio instantly (effective volume → 0). */
  mute(): void;

  /** Restore audio to the pre-mute state. */
  unmute(): void;

  /** Whether the wire is currently muted. */
  isMuted(): boolean;

  /**
   * Switch game context so ambient/music receive automatic multipliers.
   * Accepted values: `'menu'` | `'playing'` | `'paused'` | `'gameover'`.
   */
  setGameContext(context: 'menu' | 'playing' | 'paused' | 'gameover'): void;

  /**
   * Effective (final) volume for a category after applying:
   * game-context multiplier → master volume → mute.
   */
  getEffectiveVolume(category: string): number;

  /** Smoothly interpolate every listed category to `targetVolumes`. */
  smoothTransitionTo(targetVolumes: Record<string, number>, durationMs: number): void;

  /** Persist the current configuration under a custom name. */
  saveProfile(name: string): void;

  /** Restore a previously saved profile. Returns `true` on success. */
  loadProfile(name: string): boolean;

  /** List all user-saved profile names. */
  getSavedProfiles(): string[];

  /** Reset every category + master to the built-in "Default" preset. */
  resetToDefault(): void;
}

// ── Constants ─────────────────────────────────────────────────────────────

/** The six audio categories managed by this wire. */
export const SFX_CATEGORIES = [
  'eat',
  'collision',
  'powerup',
  'ui',
  'ambient',
  'music',
] as const;

/** Exhaustive union of category names. */
export type SfxVolumeCategory = (typeof SFX_CATEGORIES)[number];

/** localStorage key for persisting category state + custom profiles. */
const STORAGE_KEY = 'ws_sfx_volume_category';

/** Default base volumes before any preset or context is applied. */
const DEFAULT_VOLUMES: Record<SfxVolumeCategory, number> = {
  eat:       0.8,
  collision: 0.6,
  powerup:   0.7,
  ui:        0.5,
  ambient:   0.4,
  music:     0.6,
};

/** Game-context multipliers applied to `ambient` and `music` channels. */
const CONTEXT_MULTIPLIERS: Record<
  'menu' | 'playing' | 'paused' | 'gameover',
  { ambient: number; music: number }
> = {
  menu:     { ambient: 0.8, music: 1.0 },
  playing:  { ambient: 0.5, music: 0.7 },
  paused:   { ambient: 0.3, music: 0.4 },
  gameover: { ambient: 0.2, music: 0.3 },
};

// ── Preset Definitions ────────────────────────────────────────────────────

/**
 * Describes the target volumes for all six categories inside one preset.
 * Only the six keys listed in `SFX_CATEGORIES` are considered valid; extras
 * are silently ignored.
 */
export interface VolumePreset {
  /** Human-readable preset name (case-insensitive lookup). */
  name: string;
  /** Emoji icon shown in UI surfaces. */
  emoji: string;
  /** Short description for tooltips / aria labels. */
  description: string;
  /** Target volume for each of the six categories (0–1). */
  volumes: Record<SfxVolumeCategory, number>;
}

/**
 * The eight built-in presets. "Custom" has the same values as Default so it
 * acts as a neutral starting point that users then tweak and re-save.
 */
export const VOLUME_PRESETS: VolumePreset[] = [
  {
    name: 'Default',
    emoji: '🎵',
    description: 'Balanced defaults for an enjoyable experience',
    volumes: { eat: 0.8, collision: 0.6, powerup: 0.7, ui: 0.5, ambient: 0.4, music: 0.6 },
  },
  {
    name: 'Chill',
    emoji: '☕',
    description: 'Low everything with warm ambient focus',
    volumes: { eat: 0.4, collision: 0.35, powerup: 0.45, ui: 0.3, ambient: 0.6, music: 0.35 },
  },
  {
    name: 'Intense',
    emoji: '🔥',
    description: 'Punchy SFX, minimal distractions',
    volumes: { eat: 1.0, collision: 0.95, powerup: 0.9, ui: 0.5, ambient: 0.2, music: 0.5 },
  },
  {
    name: 'Focus',
    emoji: '🎯',
    description: 'Low ambient and music, clear SFX for concentration',
    volumes: { eat: 0.7, collision: 0.65, powerup: 0.7, ui: 0.4, ambient: 0.15, music: 0.2 },
  },
  {
    name: 'Party',
    emoji: '🎉',
    description: 'High energy, everything turned up',
    volumes: { eat: 1.0, collision: 0.9, powerup: 1.0, ui: 0.8, ambient: 0.7, music: 0.95 },
  },
  {
    name: 'Lo-Fi',
    emoji: '🎧',
    description: 'Mellow beats, soft SFX',
    volumes: { eat: 0.45, collision: 0.35, powerup: 0.4, ui: 0.3, ambient: 0.7, music: 0.55 },
  },
  {
    name: 'Epic',
    emoji: '⚔️',
    description: 'Cinematic volume balance for dramatic moments',
    volumes: { eat: 0.85, collision: 0.8, powerup: 0.9, ui: 0.55, ambient: 0.65, music: 0.85 },
  },
  {
    name: 'Custom',
    emoji: '✏️',
    description: 'User-defined — starts from defaults and can be saved',
    volumes: { ...DEFAULT_VOLUMES },
  },
];

// ── Internal Persistence Schema ───────────────────────────────────────────

interface PersistedState {
  /** Raw category volumes (0–1). */
  volumes: Record<string, number>;
  /** Master volume (0–1). */
  masterVolume: number;
  /** Whether the wire was muted when last persisted. */
  muted: boolean;
  /** User-saved custom profiles keyed by name. */
  profiles: Record<string, Record<string, number>>;
  /** Last applied preset name (for rehydration). */
  activePreset: string;
  /** Current game context at save time. */
  gameContext: 'menu' | 'playing' | 'paused' | 'gameover';
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Clamp any number into the [0, 1] range. */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Case-insensitive preset lookup. */
function findPresetByName(name: string): VolumePreset | undefined {
  const lower = name.toLowerCase();
  return VOLUME_PRESETS.find((p) => p.name.toLowerCase() === lower);
}

/** Snapshot the current category map into a plain object. */
function snapshotVolumes(volumes: Map<SfxVolumeCategory, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const cat of SFX_CATEGORIES) {
    out[cat] = volumes.get(cat) ?? 0;
  }
  return out;
}

/**
 * Compare two volume snapshots. Returns `true` when at least one category
 * differs by more than floating-point epsilon (1e-6).
 */
function volumesDiffer(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  for (const key of SFX_CATEGORIES) {
    if (Math.abs((a[key] ?? 0) - (b[key] ?? 0)) > 1e-6) {
      return true;
    }
  }
  return false;
}

/** SSR-safe check: `true` when `requestAnimationFrame` is available. */
function hasRAF(): boolean {
  return (
    typeof requestAnimationFrame === 'function' &&
    typeof cancelAnimationFrame === 'function'
  );
}

/** Read persisted state from localStorage (degrades to null on failure). */
function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

/** Write the full persisted state to localStorage. */
function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — silently ignore
  }
}

// ── Factory ───────────────────────────────────────────────────────────────

/**
 * Create a new `SfxVolumeCategoryWire` instance.
 *
 * On the client, the initial state is hydrated from localStorage when
 * available. On the server (SSR), the built-in "Default" preset is used.
 */
export function createSfxVolumeCategoryWire(): SfxVolumeCategoryWire {
  // ── Internal mutable state ────────────────────────────────────────────
  const volumes = new Map<SfxVolumeCategory, number>();
  let masterVolume = 0.8;
  let muted = false;
  let gameContext: 'menu' | 'playing' | 'paused' | 'gameover' = 'menu';
  let activePreset = 'Default';

  /** User-saved profiles: name → category volumes. */
  const profiles = new Map<string, Record<string, number>>();

  // Transition state
  let transitionRAF: number | null = null;
  let transitionStart: number | null = null;
  let transitionDurationMs = 0;
  let transitionFrom: Map<SfxVolumeCategory, number> | null = null;
  let transitionTo: Map<SfxVolumeCategory, number> | null = null;

  // ── Hydration ─────────────────────────────────────────────────────────
  const saved = loadPersistedState();

  if (saved) {
    for (const cat of SFX_CATEGORIES) {
      const v = saved.volumes[cat];
      volumes.set(cat, typeof v === 'number' ? clamp01(v) : DEFAULT_VOLUMES[cat]);
    }
    masterVolume = clamp01(saved.masterVolume ?? 0.8);
    muted = !!saved.muted;
    gameContext =
      saved.gameContext && saved.gameContext in CONTEXT_MULTIPLIERS
        ? saved.gameContext
        : 'menu';
    activePreset = saved.activePreset || 'Default';

    if (saved.profiles && typeof saved.profiles === 'object') {
      for (const [name, cats] of Object.entries(saved.profiles)) {
        profiles.set(name, cats);
      }
    }
  } else {
    // Start from defaults
    for (const cat of SFX_CATEGORIES) {
      volumes.set(cat, DEFAULT_VOLUMES[cat]);
    }
  }

  // ── Persistence helper (debounced-like, call after any mutation) ─────
  function persist(): void {
    const state: PersistedState = {
      volumes: Object.fromEntries(volumes.entries()),
      masterVolume,
      muted,
      profiles: Object.fromEntries(profiles.entries()),
      activePreset,
      gameContext,
    };
    persistState(state);
  }

  // ── Transition tick ──────────────────────────────────────────────────
  function transitionTick(timestamp: number): void {
    if (
      transitionStart === null ||
      transitionFrom === null ||
      transitionTo === null
    ) {
      transitionRAF = null;
      return;
    }

    const elapsed = timestamp - transitionStart;
    const progress = Math.min(elapsed / transitionDurationMs, 1);

    for (const cat of SFX_CATEGORIES) {
      const from = transitionFrom.get(cat) ?? 0;
      const to = transitionTo.get(cat) ?? 0;
      volumes.set(cat, from + (to - from) * progress);
    }

    if (progress >= 1) {
      // Finalise: ensure we land exactly on target values
      for (const cat of SFX_CATEGORIES) {
        volumes.set(cat, transitionTo.get(cat) ?? 0);
      }
      transitionRAF = null;
      transitionFrom = null;
      transitionTo = null;
      transitionStart = null;
      persist();
      return;
    }

    if (hasRAF()) {
      transitionRAF = requestAnimationFrame(transitionTick);
    } else {
      // SSR fallback: jump to target immediately
      cancelTransition();
    }
  }

  /** Cancel any in-flight smooth transition. */
  function cancelTransition(): void {
    if (transitionRAF !== null && hasRAF()) {
      cancelAnimationFrame(transitionRAF);
    }
    transitionRAF = null;
    transitionFrom = null;
    transitionTo = null;
    transitionStart = null;
  }

  // ── Build the public API ─────────────────────────────────────────────

  const wire: SfxVolumeCategoryWire = {
    // ── Presets ────────────────────────────────────────────────────────

    /**
     * Apply a named volume preset to all six categories.
     *
     * @param presetName - Case-insensitive name (e.g. `"chill"`, `"Party"`)
     * @returns A `VolumeChangeResult` with before/after snapshots
     */
    applyPreset(presetName: string): VolumeChangeResult {
      const preset = findPresetByName(presetName);

      const oldVolumes = snapshotVolumes(volumes);

      if (preset) {
        cancelTransition();
        for (const cat of SFX_CATEGORIES) {
          volumes.set(cat, clamp01(preset.volumes[cat]));
        }
        activePreset = preset.name;
        muted = false; // Applying a preset unmutes
      }

      const newVolumes = snapshotVolumes(volumes);

      persist();

      return {
        changed: volumesDiffer(oldVolumes, newVolumes),
        oldVolumes,
        newVolumes,
        presetName: preset?.name ?? presetName,
      };
    },

    // ── Individual Category Control ────────────────────────────────────

    /**
     * Set the volume of a single category.
     * Cancels any active transition when invoked.
     *
     * @param category - One of the six SFX category keys
     * @param volume   - Target volume (clamped to 0–1)
     */
    setCategoryVolume(category: string, volume: number): void {
      if (!SFX_CATEGORIES.includes(category as SfxVolumeCategory)) return;
      cancelTransition();
      volumes.set(category as SfxVolumeCategory, clamp01(volume));
      persist();
    },

    /**
     * Get the raw (base) volume for a category before master or context.
     *
     * @param category - One of the six SFX category keys
     * @returns The stored volume (0–1), or 0 for unknown categories
     */
    getCategoryVolume(category: string): number {
      if (!SFX_CATEGORIES.includes(category as SfxVolumeCategory)) return 0;
      return volumes.get(category as SfxVolumeCategory) ?? 0;
    },

    /**
     * Get a snapshot of all six category volumes.
     * @returns Plain object keyed by category name
     */
    getAllVolumes(): Record<string, number> {
      return snapshotVolumes(volumes);
    },

    // ── Master Volume ──────────────────────────────────────────────────

    /**
     * Scale the global master volume. Does NOT affect stored category
     * volumes — only the final output via `getEffectiveVolume()`.
     *
     * @param volume - Master multiplier (clamped to 0–1)
     */
    setMasterVolume(volume: number): void {
      masterVolume = clamp01(volume);
      persist();
    },

    /** @returns Current master volume (0–1). */
    getMasterVolume(): number {
      return masterVolume;
    },

    /** Silence all output immediately. Category volumes are preserved. */
    mute(): void {
      muted = true;
      persist();
    },

    /** Restore output to the pre-mute state. */
    unmute(): void {
      muted = false;
      persist();
    },

    /** @returns Whether the wire is currently muted. */
    isMuted(): boolean {
      return muted;
    },

    // ── Game Context ───────────────────────────────────────────────────

    /**
     * Set the active game context. Ambient and music channels receive
     * automatic volume multipliers:
     *
     * | Context   | Ambient | Music |
     * |-----------|---------|-------|
     * | menu      | 0.8     | 1.0   |
     * | playing   | 0.5     | 0.7   |
     * | paused    | 0.3     | 0.4   |
     * | gameover  | 0.2     | 0.3   |
     *
     * @param context - One of `'menu'`, `'playing'`, `'paused'`, `'gameover'`
     */
    setGameContext(context: 'menu' | 'playing' | 'paused' | 'gameover'): void {
      gameContext = context;
      persist();
    },

    // ── Effective Volume ───────────────────────────────────────────────

    /**
     * Compute the final effective volume for a category after applying:
     * 1. Game-context multiplier (ambient & music only)
     * 2. Master volume
     * 3. Mute flag
     *
     * @param category - One of the six SFX category keys
     * @returns The effective volume (0–1). Returns 0 when muted or unknown.
     */
    getEffectiveVolume(category: string): number {
      if (muted) return 0;
      if (!SFX_CATEGORIES.includes(category as SfxVolumeCategory)) return 0;

      const base = volumes.get(category as SfxVolumeCategory) ?? 0;

      // Apply context multiplier for ambient and music channels
      let effective = base;
      if (category === 'ambient' || category === 'music') {
        const mult = CONTEXT_MULTIPLIERS[gameContext];
        effective = base * mult[category];
      }

      return clamp01(effective * masterVolume);
    },

    // ── Smooth Transitions ─────────────────────────────────────────────

    /**
     * Smoothly interpolate all listed categories from their current values
     * to `targetVolumes` over `durationMs` milliseconds using linear
     * interpolation.
     *
     * Any in-flight transition is cancelled when a new one starts.
     * On the server (no `requestAnimationFrame`), the jump is applied
     * instantly.
     *
     * @param targetVolumes - Map of category → target volume (0–1)
     * @param durationMs    - Transition length in milliseconds (min 16)
     */
    smoothTransitionTo(
      targetVolumes: Record<string, number>,
      durationMs: number,
    ): void {
      cancelTransition();

      // Snapshot "from" values (mid-transition if chaining)
      transitionFrom = new Map<SfxVolumeCategory, number>();
      for (const cat of SFX_CATEGORIES) {
        transitionFrom.set(cat, volumes.get(cat) ?? 0);
      }

      // Build "to" map — only include recognised categories
      transitionTo = new Map<SfxVolumeCategory, number>();
      for (const cat of SFX_CATEGORIES) {
        const target = targetVolumes[cat];
        transitionTo.set(
          cat,
          typeof target === 'number' ? clamp01(target) : (transitionFrom.get(cat) ?? 0),
        );
      }

      transitionDurationMs = Math.max(16, durationMs);
      transitionStart = null; // Will be set on first tick

      if (hasRAF()) {
        transitionRAF = requestAnimationFrame((timestamp) => {
          transitionStart = timestamp;
          transitionTick(timestamp);
        });
      } else {
        // SSR fallback: apply immediately
        for (const cat of SFX_CATEGORIES) {
          volumes.set(cat, transitionTo.get(cat) ?? 0);
        }
        transitionTo = null;
        transitionFrom = null;
        persist();
      }
    },

    // ── Profiles ───────────────────────────────────────────────────────

    /**
     * Save the current category volumes as a named profile.
     * Overwrites any existing profile with the same name.
     *
     * @param name - Profile identifier (trimmed, non-empty)
     * @throws Silently ignores empty or whitespace-only names
     */
    saveProfile(name: string): void {
      const trimmed = name.trim();
      if (!trimmed) return;
      profiles.set(trimmed, snapshotVolumes(volumes));
      persist();
    },

    /**
     * Load a saved profile by name, applying its volumes to all categories.
     *
     * @param name - Profile identifier to restore
     * @returns `true` when the profile was found and applied
     */
    loadProfile(name: string): boolean {
      const profile = profiles.get(name.trim());
      if (!profile) return false;

      cancelTransition();
      for (const cat of SFX_CATEGORIES) {
        const v = profile[cat];
        volumes.set(cat, typeof v === 'number' ? clamp01(v) : DEFAULT_VOLUMES[cat]);
      }
      activePreset = 'Custom';
      persist();
      return true;
    },

    /**
     * List all saved profile names in insertion order.
     * @returns Array of profile name strings
     */
    getSavedProfiles(): string[] {
      return Array.from(profiles.keys());
    },

    // ── Reset ──────────────────────────────────────────────────────────

    /**
     * Reset every category and the master volume to the built-in
     * "Default" preset values. Unmutes audio.
     */
    resetToDefault(): void {
      cancelTransition();
      const preset = findPresetByName('Default');
      if (preset) {
        for (const cat of SFX_CATEGORIES) {
          volumes.set(cat, preset.volumes[cat]);
        }
      }
      masterVolume = 0.8;
      muted = false;
      activePreset = 'Default';
      persist();
    },
  };

  return wire;
}
