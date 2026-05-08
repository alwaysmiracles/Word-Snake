'use client';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Every sound-effect category in the Word Snake game. */
export type SfxCategory =
  | 'eat' | 'powerup' | 'achievement' | 'gameOver'
  | 'ui' | 'combo' | 'boss' | 'quiz' | 'easterEgg';

/** Full SFX volume configuration stored in state / localStorage. */
export type SfxVolumeConfig = {
  /** Master volume for all sound effects (0–1). */
  volume: number;
  /** Whether all SFX are silenced. */
  muted: boolean;
  /** Per-category volume multipliers (0–1 each). */
  categories: Record<SfxCategory, number>;
};

// ─── Category Defaults ───────────────────────────────────────────────────────

/** Label, emoji, and default volume for every SFX category. */
export const SFX_CATEGORY_DEFAULTS: Record<
  SfxCategory, { label: string; emoji: string; defaultVolume: number }
> = {
  eat:         { label: 'Eat',          emoji: '🍎', defaultVolume: 1.0  },
  powerup:     { label: 'Power-Up',     emoji: '⚡', defaultVolume: 0.8  },
  achievement: { label: 'Achievement',  emoji: '🏆', defaultVolume: 0.9  },
  gameOver:    { label: 'Game Over',    emoji: '💀', defaultVolume: 0.7  },
  ui:          { label: 'UI',           emoji: '🖱️', defaultVolume: 0.5  },
  combo:       { label: 'Combo',        emoji: '🔥', defaultVolume: 0.85 },
  boss:        { label: 'Boss',         emoji: '👹', defaultVolume: 0.9  },
  quiz:        { label: 'Quiz',         emoji: '❓', defaultVolume: 0.7  },
  easterEgg:   { label: 'Easter Egg',   emoji: '🥚', defaultVolume: 1.0  },
};

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Build the default SFX config (master 0.7, categories at their defaults). */
export function createInitialSfxConfig(): SfxVolumeConfig {
  const categories = {} as Record<SfxCategory, number>;
  for (const key of Object.keys(SFX_CATEGORY_DEFAULTS) as SfxCategory[]) {
    categories[key] = SFX_CATEGORY_DEFAULTS[key].defaultVolume;
  }
  return { volume: 0.7, muted: false, categories };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'wordsnake_sfx_volume_config';

/** Persist the SFX config to localStorage. */
export function saveSfxConfig(config: SfxVolumeConfig): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* storage unavailable */ }
}

/** Load a previously saved SFX config, falling back to defaults. */
export function loadSfxConfig(): SfxVolumeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SfxVolumeConfig>;
      const base = createInitialSfxConfig();
      return {
        ...base,
        volume: typeof parsed.volume === 'number' ? parsed.volume : base.volume,
        muted: typeof parsed.muted === 'boolean' ? parsed.muted : base.muted,
        categories: { ...base.categories, ...parsed.categories },
      };
    }
  } catch { /* corrupt data — fall back to defaults */ }
  return createInitialSfxConfig();
}

// ─── Volume Resolution ───────────────────────────────────────────────────────

/**
 * Resolve the effective volume for a given SFX category.
 * Returns 0 when muted; otherwise category volume × master volume.
 */
export function getSfxVolume(config: SfxVolumeConfig, category: SfxCategory): number {
  if (config.muted) return 0;
  const catVol = config.categories[category];
  return catVol !== undefined ? catVol * config.volume : config.volume;
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Return a new config with the master volume updated (clamped 0–1). */
export function setSfxMasterVolume(config: SfxVolumeConfig, volume: number): SfxVolumeConfig {
  return { ...config, volume: Math.max(0, Math.min(1, volume)) };
}

/** Return a new config with a single category volume updated (clamped 0–1). */
export function setSfxCategoryVolume(
  config: SfxVolumeConfig, category: SfxCategory, volume: number,
): SfxVolumeConfig {
  return {
    ...config,
    categories: { ...config.categories, [category]: Math.max(0, Math.min(1, volume)) },
  };
}

/** Return a new config with muted toggled. */
export function toggleSfxMute(config: SfxVolumeConfig): SfxVolumeConfig {
  return { ...config, muted: !config.muted };
}

/** Return a new config with all category volumes reset to their defaults. */
export function resetSfxCategories(config: SfxVolumeConfig): SfxVolumeConfig {
  const categories = {} as Record<SfxCategory, number>;
  for (const key of Object.keys(SFX_CATEGORY_DEFAULTS) as SfxCategory[]) {
    categories[key] = SFX_CATEGORY_DEFAULTS[key].defaultVolume;
  }
  return { ...config, categories };
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

/** Speaker icon matching the volume-slider thresholds: 🔇 🔈 🔉 🔊 */
export function getSfxIcon(volume: number, muted: boolean): string {
  if (muted || volume === 0) return '🔇';
  if (volume < 0.3) return '🔈';
  if (volume < 0.7) return '🔉';
  return '🔊';
}

/** Format a 0–1 volume as a human-readable percentage string (e.g. '70%'). */
export function formatSfxPercent(volume: number): string {
  return `${Math.round(volume * 100)}%`;
}

// ─── Mixer Presets ───────────────────────────────────────────────────────────

/** Named mixer presets that adjust master + selective category volumes. */
export const SFX_MIXER_PRESETS: {
  name: string;
  emoji: string;
  masterVolume: number;
  categoryOverrides: Partial<Record<SfxCategory, number>>;
}[] = [
  { name: 'Balanced',  emoji: '⚖️', masterVolume: 0.7, categoryOverrides: {} },
  { name: 'Immersive', emoji: '🎧', masterVolume: 1.0, categoryOverrides: { achievement: 1.0, combo: 1.0 } },
  { name: 'Minimal',   emoji: '🤫', masterVolume: 0.3, categoryOverrides: { ui: 0.15 } },
  { name: 'Focus',     emoji: '🎯', masterVolume: 0.5, categoryOverrides: { ui: 0.2, achievement: 0.6 } },
];

/** Apply a mixer preset by index, returning a new config (clamped to valid range). */
export function applySfxPreset(config: SfxVolumeConfig, presetIndex: number): SfxVolumeConfig {
  const preset = SFX_MIXER_PRESETS[Math.min(Math.max(presetIndex, 0), SFX_MIXER_PRESETS.length - 1)];
  return {
    ...config,
    volume: preset.masterVolume,
    muted: false,
    categories: { ...config.categories, ...preset.categoryOverrides },
  };
}
