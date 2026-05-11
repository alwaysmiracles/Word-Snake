'use client'

// ── Types ──────────────────────────────────────────────────────────────────
export type AccessibilityConfig = {
  screenReader: boolean
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  focusIndicators: boolean
  keyboardNav: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  textToSpeech: boolean
  speechRate: number
}

export type AriaLiveRegion = {
  id: string
  priority: 'polite' | 'assertive'
  content: string
  timestamp: number
}

export type FocusTrapZone = {
  id: string
  active: boolean
  previousFocus: HTMLElement | null
}

// ── Constants ──────────────────────────────────────────────────────────────
export const ACCESSIBILITY_STORAGE_KEY = 'word-snake-a11y'

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  screenReader: false,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusIndicators: false,
  keyboardNav: true,
  colorBlindMode: 'none',
  textToSpeech: false,
  speechRate: 1,
}

export const COLOR_BLIND_FILTERS: Record<string, string> = {
  none: 'none',
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
}

// ── Internal state ─────────────────────────────────────────────────────────
let announcementQueue: Array<{ message: string; priority: 'polite' | 'assertive' }> = []
let isProcessingQueue = false
let activeFocusTrapCleanup: (() => void) | null = null

// ── Persistence ────────────────────────────────────────────────────────────
export function loadAccessibilityConfig(): AccessibilityConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_ACCESSIBILITY_CONFIG }
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_CONFIG }
    return { ...DEFAULT_ACCESSIBILITY_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_CONFIG }
  }
}

export function saveAccessibilityConfig(config: AccessibilityConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

export function updateConfig(partial: Partial<AccessibilityConfig>): AccessibilityConfig {
  const current = loadAccessibilityConfig()
  const next = { ...current, ...partial }
  saveAccessibilityConfig(next)
  return next
}

// ── Screen-reader announcements ────────────────────────────────────────────
function getOrCreateLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
  if (typeof document === 'undefined') {
    return document as unknown as HTMLElement
  }
  const id = `aria-live-${priority}`
  let region = document.getElementById(id)
  if (!region) {
    region = document.createElement('div')
    region.id = id
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', priority)
    region.setAttribute('aria-atomic', 'true')
    Object.assign(region.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(region)
  }
  return region
}

function processAnnouncementQueue(): void {
  if (isProcessingQueue || announcementQueue.length === 0) return
  isProcessingQueue = true
  const { message, priority } = announcementQueue.shift()!
  const region = getOrCreateLiveRegion(priority)
  region.textContent = ''
  // Force a reflow so the screen reader detects the change
  void region.offsetHeight
  region.textContent = message
  setTimeout(() => {
    region.textContent = ''
    isProcessingQueue = false
    processAnnouncementQueue()
  }, 5000)
}

export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void {
  if (typeof document === 'undefined') return
  announcementQueue.push({ message, priority })
  processAnnouncementQueue()
}

// ── Focus management ───────────────────────────────────────────────────────
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

export function trapFocus(container: HTMLElement): () => void {
  if (typeof document === 'undefined') return () => {}
  const previousFocus = document.activeElement as HTMLElement | null
  const focusable = getFocusableElements(container)
  if (focusable.length > 0 && !container.contains(document.activeElement)) {
    focusable[0].focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    const currentFocusable = getFocusableElements(container)
    if (currentFocusable.length === 0) {
      e.preventDefault()
      return
    }
    const first = currentFocusable[0]
    const last = currentFocusable[currentFocusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  container.addEventListener('keydown', onKeyDown)

  // Cleanup previous trap if any
  if (activeFocusTrapCleanup) {
    activeFocusTrapCleanup()
  }

  const cleanup = () => {
    container.removeEventListener('keydown', onKeyDown)
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus()
    }
    if (activeFocusTrapCleanup === cleanup) {
      activeFocusTrapCleanup = null
    }
  }
  activeFocusTrapCleanup = cleanup
  return cleanup
}

// ── Style helpers ──────────────────────────────────────────────────────────
export function applyAccessibilityStyles(
  config: AccessibilityConfig,
): Record<string, string> {
  return {
    '--ws-font-scale': config.largeText ? '1.2' : '1',
    '--ws-contrast': config.highContrast ? 'high' : 'normal',
    '--ws-motion': config.reducedMotion ? 'none' : 'auto',
    '--ws-focus-ring': config.focusIndicators
      ? '3px solid cyan'
      : '2px solid rgba(59,130,246,0.5)',
  }
}

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false
  const config = loadAccessibilityConfig()
  const osPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return config.reducedMotion || osPrefersReduced
}

export function getHighContrastTheme(
  _config: AccessibilityConfig,
): Record<string, string> {
  return {
    '--ws-bg': '#000000',
    '--ws-text': '#ffffff',
    '--ws-border': '3px solid yellow',
    '--ws-focus-ring': '3px solid cyan',
    '--ws-surface': '#1a1a1a',
    '--ws-muted': '#cccccc',
  }
}

// ── Text-to-speech ─────────────────────────────────────────────────────────
export function speakText(text: string, rate?: number): void {
  if (typeof window === 'undefined') return
  const config = loadAccessibilityConfig()
  if (!config.textToSpeech) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate ?? config.speechRate
  utterance.pitch = 1
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false
  return window.speechSynthesis.speaking
}
