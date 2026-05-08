'use client'

// ── Types ──────────────────────────────────────────────────────────────
export type NavItem = {
  id: string
  label: string
  action?: () => void
  children?: NavItem[]
  disabled?: boolean
  icon?: string
}

export type NavDirection = 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape' | 'tab' | 'shiftTab'
export type NavZone = 'sidebar' | 'game' | 'modal' | 'none'

// ── Helpers ────────────────────────────────────────────────────────────
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export function getArrowKeyDirection(e: KeyboardEvent): NavDirection | null {
  switch (e.key) {
    case 'ArrowUp': return 'up'
    case 'ArrowDown': return 'down'
    case 'ArrowLeft': return 'left'
    case 'ArrowRight': return 'right'
    case 'Enter': return 'enter'
    case ' ': return 'enter'
    case 'Escape': return 'escape'
    case 'Tab': return e.shiftKey ? 'shiftTab' : 'tab'
    default: return null
  }
}

export function focusElementByIndex(items: NavItem[], index: number): void {
  if (!isBrowser) return
  const target = items[index]
  if (!target) return
  const el = document.querySelector<HTMLElement>(`[data-nav-id="${target.id}"]`)
  el?.focus()
}

export function announceNavChange(item: NavItem, index: number): void {
  if (!isBrowser) return
  let region = document.getElementById('aria-nav-announcer')
  if (!region) {
    region = document.createElement('div')
    region.id = 'aria-nav-announcer'
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    Object.assign(region.style, { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' })
    document.body.appendChild(region)
  }
  region.textContent = `${item.label}, item ${index + 1}`
}

// ── Keyboard-user detection ────────────────────────────────────────────
let lastKeyboardActivity = 0

if (isBrowser) {
  document.addEventListener('keydown', () => { lastKeyboardActivity = Date.now() }, { capture: true, passive: true })
}

export function isKeyboardUser(): boolean {
  return Date.now() - lastKeyboardActivity < 10_000
}

// ── Core nav factory ───────────────────────────────────────────────────
const ZONE_ORDER: NavZone[] = ['sidebar', 'game', 'modal']

export function createKeyboardNav(options?: { initialZone?: NavZone }) {
  let currentZone: NavZone = options?.initialZone ?? 'game'
  const zoneItems: Record<string, NavItem[]> = {}
  const zoneIndex: Record<string, number> = {}
  const handler = (e: KeyboardEvent) => handleKeyDown(e)

  function focusZone(zone: NavZone) {
    currentZone = zone
  }

  function registerItems(zone: string, items: NavItem[]) {
    zoneItems[zone] = items
    if (zoneIndex[zone] === undefined) zoneIndex[zone] = 0
  }

  function getFocusedIndex() { return zoneIndex[currentZone] ?? 0 }
  function getFocusedZone() { return currentZone }

  function handleKeyDown(e: KeyboardEvent): boolean {
    const dir = getArrowKeyDirection(e)
    if (!dir) return false

    const items = zoneItems[currentZone] ?? []
    if (items.length === 0 && dir !== 'escape' && dir !== 'tab' && dir !== 'shiftTab') return false

    let idx = zoneIndex[currentZone] ?? 0

    switch (dir) {
      case 'up':
        e.preventDefault()
        idx = idx <= 0 ? items.length - 1 : idx - 1
        zoneIndex[currentZone] = idx
        focusElementByIndex(items, idx)
        announceNavChange(items[idx], idx)
        return true
      case 'down':
        e.preventDefault()
        idx = idx >= items.length - 1 ? 0 : idx + 1
        zoneIndex[currentZone] = idx
        focusElementByIndex(items, idx)
        announceNavChange(items[idx], idx)
        return true
      case 'enter': {
        e.preventDefault()
        const item = items[idx]
        if (item && !item.disabled) item.action?.()
        return !!items[idx]
      }
      case 'escape':
        focusZone('game')
        return true
      case 'tab': {
        e.preventDefault()
        const ci = ZONE_ORDER.indexOf(currentZone)
        focusZone(ZONE_ORDER[(ci + 1) % ZONE_ORDER.length] ?? 'game')
        return true
      }
      case 'shiftTab': {
        e.preventDefault()
        const ci = ZONE_ORDER.indexOf(currentZone)
        focusZone(ZONE_ORDER[(ci - 1 + ZONE_ORDER.length) % ZONE_ORDER.length] ?? 'game')
        return true
      }
      default:
        return false
    }
  }

  function reset() {
    for (const z of ZONE_ORDER) zoneIndex[z] = 0
    currentZone = options?.initialZone ?? 'game'
  }

  function destroy() {
    if (isBrowser) document.removeEventListener('keydown', handler)
  }

  if (isBrowser) document.addEventListener('keydown', handler)

  return { focusZone, registerItems, handleKeyDown, getFocusedIndex, getFocusedZone, reset, destroy }
}

// ── React hook ─────────────────────────────────────────────────────────
export function useKeyboardNav(zones: Record<string, NavItem[]>) {
  const nav = createKeyboardNav()
  let focusedZone: NavZone = 'game'
  let focusedIndex = 0

  if (isBrowser) {
    for (const [zone, items] of Object.entries(zones)) nav.registerItems(zone, items)
  }

  // Lightweight state tracking for consumers
  const wrapper: ReturnType<typeof createKeyboardNav> & {
    focusedZone: NavZone
    focusedIndex: number
    handleKeyDown: (e: KeyboardEvent) => boolean
  } = {
    ...nav,
    get focusedZone() { return nav.getFocusedZone() },
    get focusedIndex() { return nav.getFocusedIndex() },
    handleKeyDown(e: KeyboardEvent) { return nav.handleKeyDown(e) },
  }
  void focusedZone
  void focusedIndex
  return wrapper
}

// ── Sidebar nav items factory ──────────────────────────────────────────
export function createSidebarNavItems(): NavItem[] {
  return [
    { id: 'start-pause', label: 'Start / Pause Game', icon: '▶️' },
    { id: 'restart', label: 'Restart', icon: '🔄' },
    { id: 'speed-run', label: 'Speed Run', icon: '⚡' },
    { id: 'daily-challenge', label: 'Daily Challenge', icon: '📅' },
    { id: 'ai-bot', label: 'AI Bot Toggle', icon: '🤖' },
    { id: 'pvp-mode', label: 'PvP Mode', icon: '⚔️' },
    { id: 'difficulty', label: 'Difficulty', icon: '🎯', children: [
      { id: 'diff-easy', label: 'Easy' },
      { id: 'diff-medium', label: 'Medium' },
      { id: 'diff-hard', label: 'Hard' },
    ] },
    { id: 'settings', label: 'Settings', icon: '⚙️', children: [
      { id: 'settings-sound', label: 'Sound' },
      { id: 'settings-controls', label: 'Controls' },
    ] },
    { id: 'skins', label: 'Skins', icon: '🎨' },
    { id: 'themes', label: 'Themes', icon: '🎭' },
    { id: 'save-load', label: 'Save / Load', icon: '💾' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'word-book', label: 'Word Book', icon: '📖' },
  ]
}
