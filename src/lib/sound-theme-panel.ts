/**
 * sound-theme-panel.ts — Sound Theme Panel Manager
 *
 * Client-side only module for the Word Snake game. Provides a centralised UI
 * layer for managing every audio setting: tab navigation, preset switching,
 * section expand/collapse, audio visualizer configuration, and volume summaries.
 *
 * All localStorage operations are wrapped in try/catch so the module degrades
 * gracefully when storage is unavailable (e.g. private browsing).
 */
'use client';

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface SoundThemePanelConfig {
  expandedSections: Record<string, boolean>;
  previewDuration: number;
  showVisualizer: boolean;
  showWaveform: boolean;
  compactMode: boolean;
  selectedTab: 'music' | 'sfx' | 'ambient' | 'presets';
}

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  musicVolume: number;   // 0 – 1
  sfxVolume: number;     // 0 – 1
  masterVolume: number;  // 0 – 1
  sfxCategoryVolumes: Record<string, number>;
  theme: string;         // Sound theme id to activate
}

export interface AudioVisualizerConfig {
  enabled: boolean;
  style: 'bars' | 'wave' | 'circle' | 'particles';
  colorScheme: string;
  sensitivity: number;
  smoothing: number;
  barCount: number;
  showLabels: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'ws_sound_panel_';

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'default', name: 'Balanced', description: 'Balanced defaults for an enjoyable experience',
    emoji: '🎵', musicVolume: 0.6, sfxVolume: 0.7, masterVolume: 0.8,
    sfxCategoryVolumes: { eat: 0.7, game: 0.7, powerup: 0.8, achievement: 0.8, ui: 0.6, ambient: 0.5, combo: 0.75, easter_egg: 0.7, weather: 0.6 },
    theme: 'default' },
  { id: 'focus', name: 'Focus', description: 'Low music, clear SFX for concentration',
    emoji: '🎯', musicVolume: 0.25, sfxVolume: 0.8, masterVolume: 0.7,
    sfxCategoryVolumes: { eat: 0.7, game: 0.9, powerup: 0.85, achievement: 0.8, ui: 0.5, ambient: 0.3, combo: 0.9, easter_egg: 0.6, weather: 0.3 },
    theme: 'focus' },
  { id: 'immersive', name: 'Immersive', description: 'Full immersion, balanced everything',
    emoji: '🎧', musicVolume: 0.8, sfxVolume: 0.75, masterVolume: 0.9,
    sfxCategoryVolumes: { eat: 0.75, game: 0.75, powerup: 0.8, achievement: 0.85, ui: 0.65, ambient: 0.8, combo: 0.8, easter_egg: 0.8, weather: 0.75 },
    theme: 'immersive' },
  { id: 'chill', name: 'Chill', description: 'Low everything, ambient focus',
    emoji: '☕', musicVolume: 0.35, sfxVolume: 0.4, masterVolume: 0.5,
    sfxCategoryVolumes: { eat: 0.4, game: 0.35, powerup: 0.45, achievement: 0.5, ui: 0.3, ambient: 0.55, combo: 0.4, easter_egg: 0.4, weather: 0.55 },
    theme: 'chill' },
  { id: 'party', name: 'Party', description: 'High energy, loud SFX',
    emoji: '🎉', musicVolume: 0.9, sfxVolume: 1.0, masterVolume: 1.0,
    sfxCategoryVolumes: { eat: 1.0, game: 0.95, powerup: 1.0, achievement: 1.0, ui: 0.8, ambient: 0.6, combo: 1.0, easter_egg: 1.0, weather: 0.7 },
    theme: 'party' },
  { id: 'night', name: 'Night', description: 'Very low, nighttime play',
    emoji: '🌙', musicVolume: 0.2, sfxVolume: 0.25, masterVolume: 0.3,
    sfxCategoryVolumes: { eat: 0.25, game: 0.2, powerup: 0.3, achievement: 0.3, ui: 0.2, ambient: 0.35, combo: 0.25, easter_egg: 0.25, weather: 0.35 },
    theme: 'night' },
  { id: 'competitive', name: 'Competitive', description: 'SFX-focused, minimal music',
    emoji: '🏆', musicVolume: 0.15, sfxVolume: 0.95, masterVolume: 0.85,
    sfxCategoryVolumes: { eat: 0.9, game: 1.0, powerup: 0.95, achievement: 0.9, ui: 0.4, ambient: 0.2, combo: 1.0, easter_egg: 0.5, weather: 0.2 },
    theme: 'competitive' },
  { id: 'silent', name: 'Silent', description: 'Muted, visual-only feedback',
    emoji: '🔇', musicVolume: 0, sfxVolume: 0, masterVolume: 0,
    sfxCategoryVolumes: { eat: 0, game: 0, powerup: 0, achievement: 0, ui: 0, ambient: 0, combo: 0, easter_egg: 0, weather: 0 },
    theme: 'silent' },
];

// ── Panel Config ───────────────────────────────────────────────────────────

/** Factory: returns a fresh default panel configuration. */
export function createPanelConfig(): SoundThemePanelConfig {
  return {
    expandedSections: { music: true, sfx: true, ambient: false, visualizer: false },
    previewDuration: 2.0, showVisualizer: true, showWaveform: false,
    compactMode: false, selectedTab: 'music',
  };
}

/** Read the persisted panel config from localStorage, falling back to defaults. */
export function loadPanelConfig(): SoundThemePanelConfig {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'config');
    if (!raw) return createPanelConfig();
    return { ...createPanelConfig(), ...JSON.parse(raw) };
  } catch {
    return createPanelConfig();
  }
}

/** Persist the given panel config to localStorage. */
export function savePanelConfig(config: SoundThemePanelConfig): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + 'config', JSON.stringify(config));
  } catch { /* storage unavailable — silently ignore */ }
}

/** Toggle an accordion section's expanded state (immutable). */
export function toggleSection(config: SoundThemePanelConfig, sectionId: string): SoundThemePanelConfig {
  const expanded = { ...config.expandedSections };
  expanded[sectionId] = !expanded[sectionId];
  return { ...config, expandedSections: expanded };
}

/** Switch the active settings tab (immutable). */
export function selectTab(config: SoundThemePanelConfig, tabId: SoundThemePanelConfig['selectedTab']): SoundThemePanelConfig {
  return { ...config, selectedTab: tabId };
}

// ── Presets ────────────────────────────────────────────────────────────────

/** Look up a single preset by its id. */
export function getPreset(id: string): SoundPreset | undefined {
  return SOUND_PRESETS.find((p) => p.id === id);
}

export function getAllPresets(): SoundPreset[] {
  return [...SOUND_PRESETS];
}

export function applyPreset(presetId: string): {
  musicVolume: number; sfxVolume: number; masterVolume: number;
  sfxCategoryVolumes: Record<string, number>; theme: string;
} | null {
  const p = getPreset(presetId);
  if (!p) return null;
  return {
    musicVolume: p.musicVolume, sfxVolume: p.sfxVolume, masterVolume: p.masterVolume,
    sfxCategoryVolumes: { ...p.sfxCategoryVolumes }, theme: p.theme,
  };
}

/**
 * Compare three core volume values against a preset.
 * Returns a match score 0–100 where 100 = perfect match.
 */
export function compareVolumes(
  current: { musicVolume: number; sfxVolume: number; masterVolume: number },
  preset: SoundPreset,
): number {
  const tol = 0.05;
  const deltas = [
    current.musicVolume - preset.musicVolume,
    current.sfxVolume - preset.sfxVolume,
    current.masterVolume - preset.masterVolume,
  ];
  const totalDelta = deltas.reduce((sum, d) => sum + Math.min(Math.abs(d) / tol, 1), 0);
  return Math.round(((3 - totalDelta) / 3) * 100);
}

/**
 * Determine which built-in preset best matches the given volume settings.
 * All three volumes must be within ±0.05 of the preset values to qualify.
 */
export function getActivePreset(
  config: { musicVolume: number; sfxVolume: number; masterVolume: number },
): SoundPreset | null {
  const TOL = 0.05;
  let bestMatch: SoundPreset | null = null;
  let bestScore = 0;

  for (const preset of SOUND_PRESETS) {
    if (
      Math.abs(config.musicVolume - preset.musicVolume) <= TOL &&
      Math.abs(config.sfxVolume - preset.sfxVolume) <= TOL &&
      Math.abs(config.masterVolume - preset.masterVolume) <= TOL
    ) {
      const score = compareVolumes(config, preset);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = preset;
      }
    }
  }
  return bestMatch;
}

// ── Visualizer ─────────────────────────────────────────────────────────────

export function createVisualizerConfig(overrides?: Partial<AudioVisualizerConfig>): AudioVisualizerConfig {
  return {
    enabled: true, style: 'bars', colorScheme: 'rainbow',
    sensitivity: 0.75, smoothing: 0.8, barCount: 32,
    showLabels: false, ...overrides,
  };
}

const STYLE_DESCRIPTIONS: Record<AudioVisualizerConfig['style'], string> = {
  bars: 'Classic frequency bars that dance with the beat',
  wave: 'Smooth flowing waveform oscilloscope',
  circle: 'Radial frequency display around a center point',
  particles: 'Reactive particles that respond to audio intensity',
};

export function getVisualizerStyleDescription(style: AudioVisualizerConfig['style']): string {
  return STYLE_DESCRIPTIONS[style] ?? '';
}

export function getVisualizerStyles(): { id: AudioVisualizerConfig['style']; description: string }[] {
  return (Object.entries(STYLE_DESCRIPTIONS) as [AudioVisualizerConfig['style'], string][])
    .map(([id, description]) => ({ id, description }));
}

// ── Formatting & summaries ─────────────────────────────────────────────────

/** Format a 0–1 ratio as a percentage string, e.g. 0.7 → "70%". */
export function formatVolume(percent: number): string {
  return `${Math.round(percent * 100)}%`;
}

/** One-line text summary of the three main volumes. */
export function getVolumeSummary(musicVol: number, sfxVol: number, masterVol: number): string {
  return `Music: ${formatVolume(musicVol)}, SFX: ${formatVolume(sfxVol)}, Master: ${formatVolume(masterVol)}`;
}

// ── SFX categories ─────────────────────────────────────────────────────────

/** The nine SFX category keys and their display labels. */
export function getSfxCategories(): { id: string; label: string }[] {
  return [
    { id: 'eat', label: 'Eating' },
    { id: 'game', label: 'Game Events' },
    { id: 'powerup', label: 'Power-ups' },
    { id: 'achievement', label: 'Achievements' },
    { id: 'ui', label: 'UI Sounds' },
    { id: 'ambient', label: 'Ambient' },
    { id: 'combo', label: 'Combos' },
    { id: 'easter_egg', label: 'Easter Eggs' },
    { id: 'weather', label: 'Weather' },
  ];
}

// ── Reset ──────────────────────────────────────────────────────────────────

/** Returns default volumes for a full audio reset (delegates to the "default" preset). */
export function resetAllAudio(): {
  musicVolume: number; sfxVolume: number; masterVolume: number;
  sfxCategoryVolumes: Record<string, number>;
} {
  return applyPreset('default')!;
}
