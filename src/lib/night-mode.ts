// Night Mode theme for Word Snake — reduces blue light, warmer tones

export interface NightModeConfig {
  enabled: boolean
  warmth: number // 0-100, how much to warm the colors (0 = normal, 100 = very warm)
  dimLevel: number // 0-100, how much to dim (0 = normal, 100 = very dim)
  autoEnabled: boolean // automatically enable based on time (7pm-7am)
}

const STORAGE_KEY = 'word-snake-night-mode'

const DEFAULT_CONFIG: NightModeConfig = {
  enabled: false,
  warmth: 40,
  dimLevel: 20,
  autoEnabled: false,
}

export function getNightModeConfig(): NightModeConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG
}

export function saveNightModeConfig(config: NightModeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch { /* ignore */ }
}

export function isNightTime(): boolean {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 7
}

export function shouldAutoEnableNightMode(config: NightModeConfig): boolean {
  if (!config.autoEnabled) return config.enabled
  return isNightTime()
}

// Generate CSS filter string for night mode overlay
export function getNightModeFilter(config: NightModeConfig): string {
  if (!config.enabled) return 'none'
  const sepia = (config.warmth / 100) * 0.3 // 0 to 0.3
  const brightness = 1 - (config.dimLevel / 100) * 0.3 // 1 to 0.7
  const saturate = 1 - (config.warmth / 100) * 0.2 // 1 to 0.8
  return `sepia(${sepia}) brightness(${brightness}) saturate(${saturate})`
}

// Get a night-mode compatible background color (warm shifted)
export function getNightModeBgAdjustment(config: NightModeConfig): string {
  if (!config.enabled) return ''
  return `background-color: rgba(30, 20, 10, ${config.dimLevel / 200})`
}

// Night mode transition class for smooth toggling
export function getNightModeTransitionClass(config: NightModeConfig): string {
  if (!config.enabled) return ''
  return 'night-mode-active'
}
