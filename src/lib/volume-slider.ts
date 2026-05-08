'use client';
// ─── Types ───────────────────────────────────────────────────────────────────
/** Configuration for the music volume slider control. */
export interface VolumeSliderConfig {
  /** Current volume level, clamped between min and max (0–1). */
  volume: number;
  /** Whether audio output is silenced. */
  muted: boolean;
  /** Minimum allowed volume value. */
  min: number;
  /** Maximum allowed volume value. */
  max: number;
  /** Smallest increment when adjusting volume. */
  step: number;
  /** Emoji icon representing the current volume state. */
  icon: string;
  /** Human-readable label for the current volume level. */
  label: string;
}
// ─── Presets ─────────────────────────────────────────────────────────────────
/** Named volume presets for quick selection. */
export const VOLUME_PRESETS: { name: string; emoji: string; volume: number }[] = [
  { name: 'Silent',     emoji: '🔇', volume: 0 },
  { name: 'Background', emoji: '🔈', volume: 0.15 },
  { name: 'Normal',     emoji: '🔉', volume: 0.35 },
  { name: 'Loud',       emoji: '🔊', volume: 0.6 },
  { name: 'Max',        emoji: '🔊', volume: 1.0 },
];
// ─── Factory & Persistence ──────────────────────────────────────────────────
const STORAGE_KEY = 'wordsnake_volume_config';
/** Create the default volume configuration. */
export function createInitialVolumeConfig(): VolumeSliderConfig {
  return {
    volume: 0.15,
    muted: false,
    min: 0,
    max: 1,
    step: 0.05,
    icon: getVolumeIcon(0.15, false),
    label: getVolumeLabel(0.15),
  };
}
/** Persist the volume config to localStorage. */
export function saveVolumeConfig(config: VolumeSliderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable (private browsing, quota, etc.)
  }
}
/** Load a previously saved volume config, or return defaults. */
export function loadVolumeConfig(): VolumeSliderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VolumeSliderConfig;
      // Merge with defaults in case schema changed between versions
      return {
        ...createInitialVolumeConfig(),
        ...parsed,
        icon: getVolumeIcon(parsed.volume, parsed.muted),
        label: parsed.muted ? 'Muted' : getVolumeLabel(parsed.volume),
      };
    }
  } catch {
    // Corrupt data — fall back to defaults
  }
  return createInitialVolumeConfig();
}
// ─── Display Helpers ─────────────────────────────────────────────────────────
/** Return the appropriate speaker emoji for a volume/mute state. */
export function getVolumeIcon(volume: number, muted: boolean): string {
  if (muted || volume === 0) return '🔇';
  if (volume < 0.3) return '🔈';
  if (volume < 0.7) return '🔉';
  return '🔊';
}
/** Return a human-readable label describing the volume intensity. */
export function getVolumeLabel(volume: number): string {
  if (volume === 0)   return 'Muted';
  if (volume < 0.15)  return 'Very Low';
  if (volume < 0.35)  return 'Low';
  if (volume < 0.6)   return 'Medium';
  if (volume < 0.85)  return 'High';
  if (volume < 1)     return 'Very High';
  return 'Maximum';
}
/** Format volume as a percentage string (e.g. "15%"). */
export function formatVolumePercent(volume: number): string {
  return `${Math.round(volume * 100)}%`;
}
// ─── Preset Helpers ──────────────────────────────────────────────────────────
/** Find the closest preset to the given volume level. */
export function getClosestPreset(volume: number): (typeof VOLUME_PRESETS)[number] {
  let closest = VOLUME_PRESETS[0];
  let minDist = Math.abs(volume - closest.volume);
  for (const preset of VOLUME_PRESETS) {
    const dist = Math.abs(volume - preset.volume);
    if (dist < minDist) { minDist = dist; closest = preset; }
  }
  return closest;
}
// ─── Mutations ───────────────────────────────────────────────────────────────
/** Toggle mute on/off while preserving the pre-mute volume. */
export function toggleMute(config: VolumeSliderConfig): VolumeSliderConfig {
  const muted = !config.muted;
  return {
    ...config,
    muted,
    icon: getVolumeIcon(config.volume, muted),
    label: muted ? 'Muted' : getVolumeLabel(config.volume),
  };
}
/** Snap volume to a named preset and ensure audio is unmuted. */
export function snapToPreset(
  config: VolumeSliderConfig,
  presetIndex: number,
): VolumeSliderConfig {
  const preset = VOLUME_PRESETS[Math.min(presetIndex, VOLUME_PRESETS.length - 1)];
  return {
    ...config,
    volume: preset.volume,
    muted: false,
    icon: preset.emoji,
    label: getVolumeLabel(preset.volume),
  };
}
