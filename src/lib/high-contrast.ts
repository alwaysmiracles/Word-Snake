/**
 * High Contrast Mode Accessibility System
 *
 * Provides accessibility support for visually impaired users in the Word Snake game.
 * Manages high contrast display settings, reduced motion preferences, and
 * large text scaling — all persisted to localStorage.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration options for the high-contrast accessibility system. */
export interface HighContrastConfig {
  /** Whether high-contrast mode is currently active. */
  enabled: boolean
  /** Level of contrast boost applied when enabled. */
  intensity: 'medium' | 'high' | 'maximum'
  /** When true, all decorative / ambient animations are suppressed. */
  reduceMotion: boolean
  /** When true, text sizing is increased across the UI. */
  largeText: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key used to persist the user's preferences. */
const STORAGE_KEY = 'word-snake-highcontrast'

/** Default configuration handed to new users or when storage is empty. */
const DEFAULT_CONFIG: HighContrastConfig = {
  enabled: false,
  intensity: 'medium',
  reduceMotion: false,
  largeText: false,
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Load the high-contrast configuration from localStorage.
 * If the key is missing or contains invalid JSON the default config is returned.
 */
export function getHighContrastConfig(): HighContrastConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }

    const parsed: unknown = JSON.parse(raw)

    // Basic shape validation — fall back to defaults for any corrupt value.
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_CONFIG }

    const obj = parsed as Record<string, unknown>

    return {
      enabled: typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_CONFIG.enabled,
      intensity:
        obj.intensity === 'medium' || obj.intensity === 'high' || obj.intensity === 'maximum'
          ? obj.intensity
          : DEFAULT_CONFIG.intensity,
      reduceMotion:
        typeof obj.reduceMotion === 'boolean' ? obj.reduceMotion : DEFAULT_CONFIG.reduceMotion,
      largeText: typeof obj.largeText === 'boolean' ? obj.largeText : DEFAULT_CONFIG.largeText,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Persist the given high-contrast configuration to localStorage.
 */
export function saveHighContrastConfig(config: HighContrastConfig): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Storage full or unavailable — silently ignore so the game keeps running.
  }
}

// ---------------------------------------------------------------------------
// Quick boolean checks
// ---------------------------------------------------------------------------

/** Returns `true` when high-contrast mode is currently enabled. */
export function isHighContrastEnabled(): boolean {
  return getHighContrastConfig().enabled
}

/** Returns `true` when the user has opted into reduced motion. */
export function isReduceMotionEnabled(): boolean {
  return getHighContrastConfig().reduceMotion
}

// ---------------------------------------------------------------------------
// CSS class generator
// ---------------------------------------------------------------------------

/**
 * Returns a map of Tailwind class overrides keyed by semantic slot names.
 *
 * When high-contrast is **disabled** every value is an empty string so that
 * callers can spread the result harmlessly:
 *
 * ```tsx
 * const hc = getHighContrastClasses(config)
 * <div className={`bg-gray-900 ${hc.container}`}>
 * ```
 *
 * | Slot       | Description                              |
 * |------------|------------------------------------------|
 * | container  | Additional classes for the root wrapper  |
 * | text       | Text colour                               |
 * | bg         | Background colour                        |
 * | border     | Generic border styling                    |
 * | canvas     | Canvas element border                     |
 * | badge      | Badge / chip styling                      |
 * | card       | Card panel styling                        |
 * | button     | Interactive button styling                |
 * | input      | Text input / form field styling           |
 */
export function getHighContrastClasses(
  config: HighContrastConfig,
): Record<string, string> {
  // When the feature is off, return all-empty strings for zero-cost spreading.
  if (!config.enabled) {
    return {
      container: '',
      text: '',
      bg: '',
      border: '',
      canvas: '',
      badge: '',
      card: '',
      button: '',
      input: '',
    }
  }

  // Large-text size overrides (applied regardless of intensity when toggled on).
  const largeTextClasses = config.largeText
    ? 'text-base sm:text-lg md:text-xl'
    : ''

  // Intensity-specific overrides
  switch (config.intensity) {
    case 'medium':
      return {
        container: 'bg-black',
        text: `text-white ${largeTextClasses}`.trim(),
        bg: 'bg-black',
        border: 'border-slate-400',
        canvas: 'border-2 border-slate-400',
        badge: 'border-slate-400 text-white bg-gray-900',
        card: 'bg-black border border-slate-400 text-white',
        button: 'border-slate-400 text-white hover:bg-gray-800',
        input: 'border-slate-400 bg-black text-white placeholder:text-slate-500',
      }

    case 'high':
      return {
        container: 'bg-black',
        text: `text-white ${largeTextClasses}`.trim(),
        bg: 'bg-black',
        border: 'border-yellow-400',
        canvas: 'border-2 border-yellow-400',
        badge: 'border-yellow-400 text-white bg-gray-900',
        card: 'bg-black border border-yellow-400 text-white',
        button: 'border-yellow-400 text-white hover:bg-gray-800',
        input: 'border-yellow-400 bg-black text-white placeholder:text-slate-500',
      }

    case 'maximum':
      return {
        container: 'bg-black',
        text: `text-yellow-300 ${largeTextClasses}`.trim(),
        bg: 'bg-black',
        border: 'border-yellow-300',
        canvas: 'border-3 border-yellow-300',
        badge: 'border-yellow-300 text-yellow-300 bg-black',
        card: 'bg-black border border-yellow-300 text-yellow-300',
        button: 'border-yellow-300 text-yellow-300 hover:bg-gray-900',
        input: 'border-yellow-300 bg-black text-yellow-300 placeholder:text-yellow-600',
      }

    default:
      // Exhaustiveness guard — should never be reached.
      return {
        container: '',
        text: '',
        bg: '',
        border: '',
        canvas: '',
        badge: '',
        card: '',
        button: '',
        input: '',
      }
  }
}

// ---------------------------------------------------------------------------
// Canvas colour overrides
// ---------------------------------------------------------------------------

/**
 * Returns hex colour values suitable for direct use on a `<canvas>` context
 * when high-contrast mode is active.
 *
 * When high-contrast is **disabled** the returned colours match the default
 * dark-theme palette so the caller does not need conditional branching.
 */
export function getCanvasColors(
  config: HighContrastConfig,
): {
  gridBg: string
  gridLine: string
  snakeHead: string
  snakeBody: string
  foodText: string
  foodBg: string
  wallColor: string
  textColor: string
} {
  // Default dark-theme palette (used when high contrast is off).
  const defaultColors = {
    gridBg: '#0a0a0a',
    gridLine: '#1a1a2e',
    snakeHead: '#4ade80',
    snakeBody: '#22c55e',
    foodText: '#ffffff',
    foodBg: '#dc2626',
    wallColor: '#374151',
    textColor: '#e5e7eb',
  }

  if (!config.enabled) return defaultColors

  switch (config.intensity) {
    // Medium: brighten existing colours without changing hue dramatically.
    case 'medium':
      return {
        gridBg: '#000000',
        gridLine: '#333333',
        snakeHead: '#66ff66',
        snakeBody: '#44ee44',
        foodText: '#ffffff',
        foodBg: '#ff4444',
        wallColor: '#888888',
        textColor: '#ffffff',
      }

    // High: use saturated, high-visibility colours with yellow accents.
    case 'high':
      return {
        gridBg: '#000000',
        gridLine: '#555555',
        snakeHead: '#00ff00',
        snakeBody: '#00cc00',
        foodText: '#ffffff',
        foodBg: '#ffff00',
        wallColor: '#facc15',
        textColor: '#ffffff',
      }

    // Maximum: pure white/yellow everywhere for maximum legibility.
    case 'maximum':
      return {
        gridBg: '#000000',
        gridLine: '#ffff00',
        snakeHead: '#ffff00',
        snakeBody: '#ffee00',
        foodText: '#000000',
        foodBg: '#ffffff',
        wallColor: '#ffff00',
        textColor: '#ffff00',
      }

    default:
      return defaultColors
  }
}

// ---------------------------------------------------------------------------
// Animation override
// ---------------------------------------------------------------------------

/**
 * Returns `false` when the user has enabled the *reduce motion* preference.
 *
 * The optional `motionType` parameter is reserved for future granularity —
 * e.g. allowing ambient motion while still disabling screen-shake. For now
 * any motion type is treated identically.
 *
 * @example
 * ```ts
 * if (shouldAnimate('shake'))  playShakeEffect()
 * if (shouldAnimate('pulse'))  playPulseEffect()
 * ```
 */
export function shouldAnimate(motionType?: string): boolean {
  // If reduceMotion is enabled, suppress everything regardless of type.
  if (isReduceMotionEnabled()) return false

  // Future: selectively allow certain motion types even with reduced motion.
  // if (motionType === 'essential') return true

  void motionType // acknowledged for future use

  return true
}
