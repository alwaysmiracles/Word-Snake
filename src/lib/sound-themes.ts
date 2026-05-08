// Sound theme configuration for Word Snake
// Each theme defines oscillator parameters for different sound types

export type SoundThemeId = 'default' | 'retro' | 'soft' | 'epic'

export interface SoundThemeParams {
  id: SoundThemeId
  name: string
  emoji: string
  description: string
  // Waveform types for different sounds
  eatWave: OscillatorType
  eatOverlayWave: OscillatorType
  gameOverWave: OscillatorType
  gameOverRumbleWave: OscillatorType
  startWave: OscillatorType
  pauseWave: OscillatorType
  poemWave: OscillatorType
  poemOverlayWave: OscillatorType
  powerUpWave: OscillatorType
  powerUpOverlayWave: OscillatorType
  clickWave: OscillatorType
  // ADSR parameters (attack, decay, sustain level, release in seconds)
  eatADSR: { a: number; d: number; s: number; r: number }
  gameOverADSR: { a: number; d: number; s: number; r: number }
  startADSR: { a: number; d: number; s: number; r: number }
  // Detune in cents
  eatDetune: number
  poemDetune: number
  powerUpDetune: number
  // Volume multiplier
  volumeScale: number
}

export const SOUND_THEMES: Record<SoundThemeId, SoundThemeParams> = {
  default: {
    id: 'default',
    name: 'Default',
    emoji: '🔊',
    description: 'Clean sine waves with triangle shimmer',
    eatWave: 'sine',
    eatOverlayWave: 'triangle',
    gameOverWave: 'sawtooth',
    gameOverRumbleWave: 'sine',
    startWave: 'sine',
    pauseWave: 'sine',
    poemWave: 'sine',
    poemOverlayWave: 'triangle',
    powerUpWave: 'sine',
    powerUpOverlayWave: 'triangle',
    clickWave: 'sine',
    eatADSR: { a: 0.0, d: 0.15, s: 0.5, r: 0.1 },
    gameOverADSR: { a: 0.0, d: 0.3, s: 0.3, r: 0.2 },
    startADSR: { a: 0.0, d: 0.08, s: 0.4, r: 0.07 },
    eatDetune: 0,
    poemDetune: 0,
    powerUpDetune: 0,
    volumeScale: 1.0,
  },
  retro: {
    id: 'retro',
    name: 'Retro 8-bit',
    emoji: '🕹️',
    description: 'Square waves with harsh digital tone',
    eatWave: 'square',
    eatOverlayWave: 'square',
    gameOverWave: 'square',
    gameOverRumbleWave: 'sawtooth',
    startWave: 'square',
    pauseWave: 'square',
    poemWave: 'square',
    poemOverlayWave: 'square',
    powerUpWave: 'square',
    powerUpOverlayWave: 'square',
    clickWave: 'square',
    eatADSR: { a: 0.0, d: 0.08, s: 0.2, r: 0.04 },
    gameOverADSR: { a: 0.0, d: 0.15, s: 0.1, r: 0.1 },
    startADSR: { a: 0.0, d: 0.05, s: 0.3, r: 0.03 },
    eatDetune: -10,
    poemDetune: -5,
    powerUpDetune: -8,
    volumeScale: 0.7,
  },
  soft: {
    id: 'soft',
    name: 'Soft Ambient',
    emoji: '🎵',
    description: 'Gentle sine waves with long sustain',
    eatWave: 'sine',
    eatOverlayWave: 'sine',
    gameOverWave: 'sine',
    gameOverRumbleWave: 'sine',
    startWave: 'sine',
    pauseWave: 'sine',
    poemWave: 'sine',
    poemOverlayWave: 'sine',
    powerUpWave: 'sine',
    powerUpOverlayWave: 'sine',
    clickWave: 'sine',
    eatADSR: { a: 0.02, d: 0.2, s: 0.7, r: 0.2 },
    gameOverADSR: { a: 0.05, d: 0.4, s: 0.4, r: 0.4 },
    startADSR: { a: 0.03, d: 0.12, s: 0.6, r: 0.1 },
    eatDetune: 5,
    poemDetune: 3,
    powerUpDetune: 4,
    volumeScale: 0.8,
  },
  epic: {
    id: 'epic',
    name: 'Epic Orchestra',
    emoji: '🎺',
    description: 'Sawtooth brass with rich harmonics',
    eatWave: 'sawtooth',
    eatOverlayWave: 'triangle',
    gameOverWave: 'sawtooth',
    gameOverRumbleWave: 'sawtooth',
    startWave: 'sawtooth',
    pauseWave: 'triangle',
    poemWave: 'sawtooth',
    poemOverlayWave: 'triangle',
    powerUpWave: 'sawtooth',
    powerUpOverlayWave: 'triangle',
    clickWave: 'triangle',
    eatADSR: { a: 0.01, d: 0.12, s: 0.5, r: 0.15 },
    gameOverADSR: { a: 0.0, d: 0.25, s: 0.3, r: 0.3 },
    startADSR: { a: 0.01, d: 0.1, s: 0.5, r: 0.08 },
    eatDetune: -3,
    poemDetune: -2,
    powerUpDetune: -3,
    volumeScale: 0.65,
  },
}

const THEME_ORDER: SoundThemeId[] = ['default', 'retro', 'soft', 'epic']
const SOUND_THEME_STORAGE_KEY = 'word-snake-sound-theme'

export function getSoundTheme(id: SoundThemeId): SoundThemeParams {
  return SOUND_THEMES[id] ?? SOUND_THEMES.default
}

export function getAllSoundThemes(): SoundThemeParams[] {
  return THEME_ORDER.map((id) => SOUND_THEMES[id])
}

export function getSavedSoundTheme(): SoundThemeId {
  if (typeof window === 'undefined') return 'default'
  try {
    const stored = localStorage.getItem(SOUND_THEME_STORAGE_KEY)
    if (stored && stored in SOUND_THEMES) {
      return stored as SoundThemeId
    }
  } catch { /* ignore */ }
  return 'default'
}

export function saveSoundTheme(id: SoundThemeId): void {
  try {
    localStorage.setItem(SOUND_THEME_STORAGE_KEY, id)
  } catch { /* ignore */ }
}
