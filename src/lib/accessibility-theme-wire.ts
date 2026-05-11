'use client'

// =============================================================================
// Accessibility & Theme Wire — Unified management layer for Word Snake
// =============================================================================
// Aggregates settings from the six specialised accessibility / appearance
// modules into a single API.  Getters read from the authoritative source;
// setters persist to both the domain key and the unified `ws_accessibility_theme`
// cache so consumers can read a full snapshot in one call.

import {
  type AccessibilityConfig,
  loadAccessibilityConfig,
  updateConfig,
  applyAccessibilityStyles,
  shouldReduceMotion,
} from '@/lib/accessibility-manager'

import {
  type NightModeConfig,
  getNightModeConfig,
  saveNightModeConfig,
  shouldAutoEnableNightMode,
} from '@/lib/night-mode'

import {
  type HighContrastConfig,
  getHighContrastConfig,
  saveHighContrastConfig,
  getHighContrastClasses,
  getCanvasColors,
} from '@/lib/high-contrast'

import {
  isKeyboardUser,
} from '@/lib/keyboard-navigation'

import {
  type ColorBlindMode,
  COLOR_BLIND_FILTER_CONFIGS,
  getFilterCSS,
  getColorBlindOverlayStyle,
} from '@/lib/color-blind-filters'

import {
  type GridThemeId,
  type GridThemeConfig,
  getGridTheme as resolveGridTheme,
  getSavedGridTheme,
  saveGridTheme,
} from '@/lib/grid-themes'

// ── Unified persistence key ──────────────────────────────────────────────────

const UNIFIED_KEY = 'ws_accessibility_theme'

// ── Types ────────────────────────────────────────────────────────────────────

/** Full snapshot of every accessibility & theme setting. */
export interface UnifiedThemeProfile {
  theme: 'dark' | 'light'
  nightMode: NightModeConfig
  highContrast: HighContrastConfig
  accessibility: AccessibilityConfig
  colorBlindMode: ColorBlindMode
  gridTheme: GridThemeId
  fontSize: number
  reducedMotion: boolean
  lastUpdated: string
}

export type QuickPreset = 'accessibility' | 'comfortable' | 'minimal'

/** Per-category breakdown of an accessibility score (0-100). */
export interface AccessibilityScore {
  total: number
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent'
  breakdown: {
    category: string
    score: number
    maxScore: number
    details: string
  }[]
}

/** Colour-blind filter settings returned by `getColorBlindSettings`. */
export interface ColorBlindSettings {
  mode: ColorBlindMode
  label: string
  description: string
  filterCSS: string
  matrix: number[][]
}

/** Current theme with all live settings. */
export interface ActiveTheme {
  mode: 'dark' | 'light'
  nightMode: NightModeConfig
  highContrast: HighContrastConfig
  accessibility: AccessibilityConfig
  cssVariables: Record<string, string>
  highContrastClasses: Record<string, string>
}

/** High-contrast mode state with derived rendering data. */
export interface HighContrastStatus {
  enabled: boolean
  intensity: HighContrastConfig['intensity']
  largeText: boolean
  reduceMotion: boolean
  canvasColors: ReturnType<typeof getCanvasColors>
  cssClasses: Record<string, string>
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FONT_SIZE = 1
const FONT_SIZE_KEY = 'word-snake-font-size'
const COLOR_BLIND_KEY = 'word-snake-colorblind'
const MIN_FONT_SIZE = 0.75
const MAX_FONT_SIZE = 2.0
const FONT_SIZE_STEP = 0.1

// ── Preset definitions ───────────────────────────────────────────────────────

const PRESETS: Record<QuickPreset, Omit<UnifiedThemeProfile, 'lastUpdated'>> = {
  accessibility: {
    theme: 'light',
    nightMode: { enabled: false, warmth: 0, dimLevel: 0, autoEnabled: false },
    highContrast: { enabled: true, intensity: 'high', reduceMotion: true, largeText: true },
    accessibility: {
      screenReader: true, highContrast: true, reducedMotion: true,
      largeText: true, focusIndicators: true, keyboardNav: true,
      colorBlindMode: 'none', textToSpeech: true, speechRate: 0.9,
    },
    colorBlindMode: 'none', gridTheme: 'classic', fontSize: 1.2, reducedMotion: true,
  },
  comfortable: {
    theme: 'dark',
    nightMode: { enabled: true, warmth: 50, dimLevel: 15, autoEnabled: true },
    highContrast: { enabled: false, intensity: 'medium', reduceMotion: false, largeText: false },
    accessibility: {
      screenReader: false, highContrast: false, reducedMotion: false,
      largeText: false, focusIndicators: true, keyboardNav: true,
      colorBlindMode: 'none', textToSpeech: false, speechRate: 1,
    },
    colorBlindMode: 'none', gridTheme: 'classic', fontSize: 1, reducedMotion: false,
  },
  minimal: {
    theme: 'light',
    nightMode: { enabled: false, warmth: 0, dimLevel: 0, autoEnabled: false },
    highContrast: { enabled: false, intensity: 'medium', reduceMotion: false, largeText: false },
    accessibility: {
      screenReader: false, highContrast: false, reducedMotion: false,
      largeText: false, focusIndicators: false, keyboardNav: true,
      colorBlindMode: 'none', textToSpeech: false, speechRate: 1,
    },
    colorBlindMode: 'none', gridTheme: 'classic', fontSize: 1, reducedMotion: false,
  },
}

// ── Safe localStorage wrappers ───────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

// ── Unified snapshot persistence ─────────────────────────────────────────────

/** Build a full profile from current subsystem state and persist. */
function buildAndPersistProfile(): UnifiedThemeProfile {
  const nightMode = getNightModeConfig()
  const autoActive = shouldAutoEnableNightMode(nightMode)
  const accessibility = loadAccessibilityConfig()
  const highContrast = getHighContrastConfig()
  const colorBlindMode = readColorBlindMode()
  const gridTheme = getSavedGridTheme()
  const fontSize = readFontSize()
  const reducedMotion = shouldReduceMotion() || highContrast.reduceMotion

  const profile: UnifiedThemeProfile = {
    theme: autoActive ? 'dark' : 'light',
    nightMode, highContrast, accessibility,
    colorBlindMode, gridTheme, fontSize, reducedMotion,
    lastUpdated: new Date().toISOString(),
  }

  safeSetItem(UNIFIED_KEY, JSON.stringify(profile))
  return profile
}

/** Load the cached unified profile, or null when unavailable. */
function loadCachedProfile(): UnifiedThemeProfile | null {
  const raw = safeGetItem(UNIFIED_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as UnifiedThemeProfile } catch { return null }
}

// ── Colour-blind helpers ─────────────────────────────────────────────────────

function readColorBlindMode(): ColorBlindMode {
  const mode = safeGetItem(COLOR_BLIND_KEY)
  if (mode && mode in COLOR_BLIND_FILTER_CONFIGS) return mode as ColorBlindMode
  return loadAccessibilityConfig().colorBlindMode
}

function writeColorBlindMode(mode: ColorBlindMode): void {
  safeSetItem(COLOR_BLIND_KEY, mode)
  updateConfig({ colorBlindMode: mode })
}

// ── Font-size helpers ────────────────────────────────────────────────────────

function readFontSize(): number {
  const raw = safeGetItem(FONT_SIZE_KEY)
  if (raw !== null) {
    const parsed = parseFloat(raw)
    if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) return parsed
  }
  return DEFAULT_FONT_SIZE
}

function writeFontSize(size: number): void {
  const clamped = Math.round(Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size)) * 100) / 100
  safeSetItem(FONT_SIZE_KEY, String(clamped))
}

// =============================================================================
// 1. Theme Manager — getActiveTheme()
// =============================================================================

/** Returns the current theme (dark/light) with all live rendering settings. */
export function getActiveTheme(): ActiveTheme {
  const nightMode = getNightModeConfig()
  const autoActive = shouldAutoEnableNightMode(nightMode)
  const mode: 'dark' | 'light' = autoActive ? 'dark' : 'light'
  const highContrast = getHighContrastConfig()
  const accessibility = loadAccessibilityConfig()

  // When high contrast is enabled, treat as dark for consistent rendering.
  const effectiveMode = highContrast.enabled ? 'dark' : mode

  return {
    mode: effectiveMode,
    nightMode,
    highContrast,
    accessibility,
    cssVariables: applyAccessibilityStyles(accessibility),
    highContrastClasses: getHighContrastClasses(highContrast),
  }
}

// =============================================================================
// 2. Quick Toggle — toggleTheme()
// =============================================================================

/** Toggles between dark and light mode and rebuilds the unified cache. */
export function toggleTheme(): 'dark' | 'light' {
  const current = getNightModeConfig()
  const next: NightModeConfig = {
    ...current,
    enabled: !current.enabled,
    autoEnabled: false, // manual toggle disables auto scheduling
  }
  saveNightModeConfig(next)
  buildAndPersistProfile()
  return next.enabled ? 'dark' : 'light'
}

// =============================================================================
// 3. Accessibility Profile — getAccessibilityProfile()
// =============================================================================

/** Returns a full snapshot of all accessibility & theme settings. */
export function getAccessibilityProfile(): UnifiedThemeProfile {
  const cached = loadCachedProfile()
  if (cached) return cached
  return buildAndPersistProfile()
}

// =============================================================================
// 4. Color Blind Mode — getColorBlindSettings()
// =============================================================================

/** Returns colour-blind filter settings: CSS string, SVG matrix, label. */
export function getColorBlindSettings(): ColorBlindSettings {
  const mode = readColorBlindMode()
  const config = COLOR_BLIND_FILTER_CONFIGS[mode]
  return {
    mode,
    label: config.label,
    description: config.description,
    filterCSS: getFilterCSS(mode),
    matrix: config.matrix,
  }
}

/** Programmatically set the colour-blind filter mode and persist. */
export function setColorBlindMode(mode: ColorBlindMode): ColorBlindSettings {
  writeColorBlindMode(mode)
  buildAndPersistProfile()
  return getColorBlindSettings()
}

/** Returns React CSS properties for the current colour-blind overlay. */
export function getActiveColorBlindOverlayStyle(): Record<string, string> {
  return getColorBlindOverlayStyle(readColorBlindMode()) as Record<string, string>
}

// =============================================================================
// 5. High Contrast — getHighContrastStatus()
// =============================================================================

/** Returns the high-contrast state with derived canvas colours and CSS classes. */
export function getHighContrastStatus(): HighContrastStatus {
  const config = getHighContrastConfig()
  return {
    enabled: config.enabled,
    intensity: config.intensity,
    largeText: config.largeText,
    reduceMotion: config.reduceMotion,
    canvasColors: getCanvasColors(config),
    cssClasses: getHighContrastClasses(config),
  }
}

/** Enable / disable high-contrast, optionally specifying intensity. */
export function setHighContrast(
  enabled: boolean,
  intensity?: HighContrastConfig['intensity'],
): HighContrastStatus {
  const current = getHighContrastConfig()
  const next: HighContrastConfig = {
    ...current,
    enabled,
    intensity: intensity ?? current.intensity,
  }
  saveHighContrastConfig(next)
  updateConfig({ highContrast: enabled })
  buildAndPersistProfile()
  return getHighContrastStatus()
}

/** Cycle through intensity levels: medium → high → maximum → medium. */
export function cycleHighContrastIntensity(): HighContrastStatus {
  const current = getHighContrastConfig()
  if (!current.enabled) return setHighContrast(true, 'medium')
  const order: Array<HighContrastConfig['intensity']> = ['medium', 'high', 'maximum']
  const idx = order.indexOf(current.intensity)
  const nextIntensity = order[(idx + 1) % order.length] ?? 'medium'
  return setHighContrast(true, nextIntensity)
}

// =============================================================================
// 6. Grid Theme — getGridTheme()
// =============================================================================

/** Returns the full config for the currently selected canvas grid theme. */
export function getGridTheme(): GridThemeConfig {
  return resolveGridTheme(getSavedGridTheme())
}

// =============================================================================
// 7. Font Size — getFontSize() / setFontSize(size)
// =============================================================================

/** Returns the current font-size multiplier (1 = 100%). */
export function getFontSize(): number {
  return readFontSize()
}

/** Sets font-size multiplier, clamped between 0.75 and 2.0. Returns the clamped value. */
export function setFontSize(size: number): number {
  writeFontSize(size)
  buildAndPersistProfile()
  return readFontSize()
}

/** Increases font size by one step (0.1). No-op at max. */
export function increaseFontSize(): number {
  const current = readFontSize()
  if (current >= MAX_FONT_SIZE) return current
  return setFontSize(current + FONT_SIZE_STEP)
}

/** Decreases font size by one step (0.1). No-op at min. */
export function decreaseFontSize(): number {
  const current = readFontSize()
  if (current <= MIN_FONT_SIZE) return current
  return setFontSize(current - FONT_SIZE_STEP)
}

/** Resets font size back to default (1 = 100%). */
export function resetFontSize(): number {
  return setFontSize(DEFAULT_FONT_SIZE)
}

/** Returns CSS custom-property pairs for the current font-size scale. */
export function getFontSizeCSS(): Record<string, string> {
  const scale = readFontSize()
  return { '--ws-font-scale': String(scale), 'font-size': `${scale * 100}%` }
}

// =============================================================================
// 8. Reduced Motion — getMotionPreference()
// =============================================================================

/**
 * Returns true when the user prefers reduced / no animations.
 * Checks high-contrast, core a11y, and OS `prefers-reduced-motion`.
 */
export function getMotionPreference(): boolean {
  const hc = getHighContrastConfig()
  const a11y = loadAccessibilityConfig()
  return hc.reduceMotion || a11y.reducedMotion || shouldReduceMotion()
}

/** Toggle reduced-motion preference on or off. */
export function setMotionPreference(reduced: boolean): boolean {
  saveHighContrastConfig({ ...getHighContrastConfig(), reduceMotion: reduced })
  updateConfig({ reducedMotion: reduced })
  buildAndPersistProfile()
  return getMotionPreference()
}

// =============================================================================
// 9. Quick Settings — applyQuickPreset(preset)
// =============================================================================

/**
 * Applies a named preset that overwrites multiple settings at once:
 *   - `accessibility` — maximises all a11y aids for visually-impaired users.
 *   - `comfortable`  — dark theme with warm night-mode, moderate settings.
 *   - `minimal`      — light theme, everything off — vanilla experience.
 */
export function applyQuickPreset(preset: QuickPreset): UnifiedThemeProfile {
  const p = PRESETS[preset]
  saveNightModeConfig(p.nightMode)
  saveHighContrastConfig(p.highContrast)
  updateConfig(p.accessibility)
  writeColorBlindMode(p.colorBlindMode)
  saveGridTheme(p.gridTheme)
  writeFontSize(p.fontSize)
  setMotionPreference(p.reducedMotion)
  return buildAndPersistProfile()
}

/** Returns metadata about all available presets for UI display. */
export function getAvailablePresets(): {
  id: QuickPreset; label: string; description: string
}[] {
  return [
    {
      id: 'accessibility',
      label: 'Accessibility',
      description: 'Enables screen reader, high contrast, large text, TTS, focus indicators, and reduced motion.',
    },
    {
      id: 'comfortable',
      label: 'Comfortable',
      description: 'Dark theme with warm night mode, subtle dimming, and keyboard navigation enabled.',
    },
    {
      id: 'minimal',
      label: 'Minimal',
      description: 'Light theme with all accessibility features off — clean vanilla experience.',
    },
  ]
}

// =============================================================================
// 10. Accessibility Score — getAccessibilityScore()
// =============================================================================

/**
 * Rates how accessible the current settings are (0-100) broken down by category:
 *   Contrast (25), Text legibility (20), Motion (15), Keyboard (15),
 *   Screen reader & TTS (10), Colour vision (10), Navigation context (5).
 */
export function getAccessibilityScore(): AccessibilityScore {
  const profile = getAccessibilityProfile()
  const bd: AccessibilityScore['breakdown'] = []

  // ── Contrast (max 25) ────────────────────────────────────────────────────
  let contrastScore = 0
  if (profile.highContrast.enabled) {
    contrastScore += 10
    if (profile.highContrast.intensity === 'high') contrastScore += 10
    if (profile.highContrast.intensity === 'maximum') contrastScore += 15
  }
  if (contrastScore > 25) contrastScore = 25
  bd.push({
    category: 'Contrast', score: contrastScore, maxScore: 25,
    details: profile.highContrast.enabled
      ? `Enabled at ${profile.highContrast.intensity} intensity.`
      : 'High contrast is not enabled.',
  })

  // ── Text legibility (max 20) ─────────────────────────────────────────────
  let textScore = 0
  if (profile.highContrast.largeText) textScore += 10
  if (profile.accessibility.largeText) textScore += 5
  if (profile.fontSize >= 1.1) textScore += 5
  if (textScore > 20) textScore = 20
  bd.push({
    category: 'Text Legibility', score: textScore, maxScore: 20,
    details: `Font scale ${profile.fontSize}x; large text ${profile.highContrast.largeText ? 'on' : 'off'}.`,
  })

  // ── Motion (max 15) ──────────────────────────────────────────────────────
  const motionOn = profile.reducedMotion
  bd.push({
    category: 'Motion', score: motionOn ? 15 : 0, maxScore: 15,
    details: motionOn ? 'Reduced motion is active.' : 'Animations are enabled.',
  })

  // ── Keyboard support (max 15) ────────────────────────────────────────────
  let keyboardScore = 0
  if (profile.accessibility.keyboardNav) keyboardScore += 7
  if (profile.accessibility.focusIndicators) keyboardScore += 8
  bd.push({
    category: 'Keyboard Support', score: keyboardScore, maxScore: 15,
    details: `Keyboard nav ${profile.accessibility.keyboardNav ? 'on' : 'off'}; focus indicators ${profile.accessibility.focusIndicators ? 'on' : 'off'}.`,
  })

  // ── Screen reader & TTS (max 10) ─────────────────────────────────────────
  let srScore = 0
  if (profile.accessibility.screenReader) srScore += 5
  if (profile.accessibility.textToSpeech) srScore += 5
  bd.push({
    category: 'Screen Reader & TTS', score: srScore, maxScore: 10,
    details: `Screen reader ${profile.accessibility.screenReader ? 'on' : 'off'}; TTS ${profile.accessibility.textToSpeech ? 'on' : 'off'}.`,
  })

  // ── Colour vision (max 10) ───────────────────────────────────────────────
  const cbScore = profile.colorBlindMode !== 'none' ? 10 : 0
  bd.push({
    category: 'Colour Vision', score: cbScore, maxScore: 10,
    details: profile.colorBlindMode !== 'none'
      ? `Colour-blind filter active (${profile.colorBlindMode}).`
      : 'No colour-blind correction applied.',
  })

  // ── Navigation context (max 5) ───────────────────────────────────────────
  const navScore = isKeyboardUser() ? 5 : 0
  bd.push({
    category: 'Navigation Context', score: navScore, maxScore: 5,
    details: isKeyboardUser()
      ? 'Keyboard user detected — navigation aids in use.'
      : 'Mouse / touch input detected.',
  })

  const total = bd.reduce((sum, b) => sum + b.score, 0)

  let label: AccessibilityScore['label'] = 'Poor'
  if (total >= 75) label = 'Excellent'
  else if (total >= 50) label = 'Good'
  else if (total >= 25) label = 'Fair'

  return { total, label, breakdown: bd }
}

// =============================================================================
// Reset — clear everything back to defaults
// =============================================================================

/** Resets all settings to defaults and clears the unified cache. */
export function resetAllSettings(): UnifiedThemeProfile {
  safeRemoveItem('word-snake-a11y')
  safeRemoveItem('word-snake-night-mode')
  safeRemoveItem('word-snake-highcontrast')
  safeRemoveItem(COLOR_BLIND_KEY)
  safeRemoveItem('word-snake-grid-theme')
  safeRemoveItem(FONT_SIZE_KEY)
  safeRemoveItem(UNIFIED_KEY)
  return buildAndPersistProfile()
}
