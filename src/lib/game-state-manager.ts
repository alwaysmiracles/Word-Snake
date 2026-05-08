'use client'

// ── Types ────────────────────────────────────────────────────────────────────

export type SerializableGameState = {
  version: number
  savedAt: number
  score: number
  wordsEaten: number
  difficulty: 'easy' | 'medium' | 'hard'
  elapsedTime: number
  snake: Array<{ x: number; y: number }>
  direction: string
  activePowerUps: Array<{ type: string; expiresAt: number }>
  comboCount: number
  comboMultiplier: number
  coinBalance: number
  weather: string
  activeCategories: string[]
  isDailyChallenge: boolean
  dailyWordsCollected: string[]
  dailyTargetScore: number
  streakMultiplier: number
  isSpeedRun: boolean
  speedRunTimeLeft: number
  wordsByCategory: Record<string, number>
  gridTheme: string
  activeSkin: string
  soundEnabled: boolean
}

export type SaveSlot = {
  id: number
  name: string
  state: SerializableGameState
  savedAt: number
  thumbnail?: string
  score: number
  wordsEaten: number
  difficulty: string
  playTime: number
}

export type SaveSlotConfig = {
  maxSlots: number
  autoSaveEnabled: boolean
  autoSaveInterval: number
  thumbnailSize: { width: number; height: number }
}

// ── Constants ────────────────────────────────────────────────────────────────

export const SAVE_VERSION = 3
export const DEFAULT_SLOT_CONFIG: SaveSlotConfig = {
  maxSlots: 8,
  autoSaveEnabled: true,
  autoSaveInterval: 30,
  thumbnailSize: { width: 64, height: 48 },
}
export const SAVE_STORAGE_KEY = 'word-snake-save-slots'
export const AUTOSAVE_KEY = 'word-snake-autosave'

// ── Internal helpers ─────────────────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn(`[game-state-manager] Storage quota exceeded for key "${key}"`)
    } else {
      console.warn(`[game-state-manager] Failed to write key "${key}"`, err)
    }
    return false
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function readSlots(raw: string | null): SaveSlot[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

// ── Core API ─────────────────────────────────────────────────────────────────

/**
 * Build a full SerializableGameState from a partial snapshot, stamping it with
 * the current version and timestamp.
 */
export function serializeGameState(
  partialState: Partial<SerializableGameState>,
): SerializableGameState {
  const defaults: SerializableGameState = {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    score: 0,
    wordsEaten: 0,
    difficulty: 'medium',
    elapsedTime: 0,
    snake: [],
    direction: 'RIGHT',
    activePowerUps: [],
    comboCount: 0,
    comboMultiplier: 1,
    coinBalance: 0,
    weather: 'clear',
    activeCategories: [],
    isDailyChallenge: false,
    dailyWordsCollected: [],
    dailyTargetScore: 0,
    streakMultiplier: 1,
    isSpeedRun: false,
    speedRunTimeLeft: 0,
    wordsByCategory: {},
    gridTheme: 'default',
    activeSkin: 'default',
    soundEnabled: true,
  }
  return { ...defaults, ...partialState, version: SAVE_VERSION, savedAt: Date.now() }
}

/**
 * Capture a tiny base64 PNG thumbnail from the game canvas for slot previews.
 */
export function generateThumbnail(
  canvas: HTMLCanvasElement | null,
  config: SaveSlotConfig,
): string | null {
  if (!canvas) return null
  try {
    const { width, height } = config.thumbnailSize
    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const ctx = offscreen.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(canvas, 0, 0, width, height)
    return offscreen.toDataURL('image/png')
  } catch {
    return null
  }
}

/**
 * Load all save slots from localStorage.
 */
export function getSaveSlots(): SaveSlot[] {
  return readSlots(safeGetItem(SAVE_STORAGE_KEY))
}

/**
 * Persist a serializable game state into a numbered save slot.
 * Returns the created SaveSlot.
 */
export function saveToSlot(
  slotId: number,
  state: SerializableGameState,
  name: string,
  canvas?: HTMLCanvasElement | null,
): SaveSlot {
  const slots = getSaveSlots()
  const thumbnail = generateThumbnail(canvas ?? null, DEFAULT_SLOT_CONFIG)
  const slot: SaveSlot = {
    id: slotId,
    name,
    state,
    savedAt: Date.now(),
    thumbnail: thumbnail ?? undefined,
    score: state.score,
    wordsEaten: state.wordsEaten,
    difficulty: state.difficulty,
    playTime: state.elapsedTime,
  }

  const idx = slots.findIndex((s) => s.id === slotId)
  if (idx >= 0) {
    slots[idx] = slot
  } else {
    slots.push(slot)
  }

  safeSetItem(SAVE_STORAGE_KEY, JSON.stringify(slots))
  return slot
}

/**
 * Load a single save slot by its id.
 */
export function loadFromSlot(slotId: number): SaveSlot | null {
  const slots = getSaveSlots()
  return slots.find((s) => s.id === slotId) ?? null
}

/**
 * Delete a save slot. Returns true if a slot was actually removed.
 */
export function deleteSaveSlot(slotId: number): boolean {
  const slots = getSaveSlots()
  const idx = slots.findIndex((s) => s.id === slotId)
  if (idx < 0) return false
  slots.splice(idx, 1)
  safeSetItem(SAVE_STORAGE_KEY, JSON.stringify(slots))
  return true
}

// ── Autosave helpers ─────────────────────────────────────────────────────────

/**
 * Retrieve the current autosave, if any.
 */
export function getAutoSave(): SerializableGameState | null {
  const raw = safeGetItem(AUTOSAVE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SerializableGameState
  } catch {
    return null
  }
}

/**
 * Write (or overwrite) the autosave entry.
 */
export function setAutoSave(
  state: SerializableGameState,
  canvas?: HTMLCanvasElement | null,
): void {
  safeSetItem(AUTOSAVE_KEY, JSON.stringify(state))
}

/**
 * Clear the autosave entry.
 */
export function clearAutoSave(): void {
  safeRemoveItem(AUTOSAVE_KEY)
}

// ── Summary & diagnostics ────────────────────────────────────────────────────

/**
 * Return a high-level overview of all persisted save data.
 */
export function getSlotSummary(): {
  usedSlots: number
  totalSlots: number
  hasAutoSave: boolean
  autoSaveAge: number | null
  totalPlayTime: number
} {
  const slots = getSaveSlots()
  const autoSave = getAutoSave()
  let totalPlayTime = 0
  for (const slot of slots) {
    totalPlayTime += slot.state.elapsedTime
  }

  return {
    usedSlots: slots.length,
    totalSlots: DEFAULT_SLOT_CONFIG.maxSlots,
    hasAutoSave: autoSave !== null,
    autoSaveAge: autoSave ? autoSave.savedAt : null,
    totalPlayTime,
  }
}

// ── Import / Export ──────────────────────────────────────────────────────────

/**
 * Export every save slot (including autosave) as a portable JSON string.
 */
export function exportSaveData(): string {
  const slots = getSaveSlots()
  const autoSave = getAutoSave()
  const payload = { version: SAVE_VERSION, exportedAt: Date.now(), slots, autoSave }
  return JSON.stringify(payload)
}

/**
 * Import save slots from a previously exported JSON string.
 * Existing slots with the same id are overwritten; extras are kept.
 */
export function importSaveData(
  json: string,
): { success: boolean; slotsImported: number; errors: string[] } {
  const errors: string[] = []
  let slotsImported = 0

  try {
    const data = JSON.parse(json)
    if (!data || typeof data !== 'object') {
      errors.push('Invalid JSON structure')
      return { success: false, slotsImported: 0, errors }
    }

    const incomingSlots: SaveSlot[] = Array.isArray(data.slots) ? data.slots : []
    const existingSlots = getSaveSlots()

    for (const incoming of incomingSlots) {
      if (typeof incoming.id !== 'number' || !incoming.state) {
        errors.push(`Skipping invalid slot entry`)
        continue
      }
      const idx = existingSlots.findIndex((s) => s.id === incoming.id)
      if (idx >= 0) {
        existingSlots[idx] = incoming
      } else {
        existingSlots.push(incoming)
      }
      slotsImported++
    }

    safeSetItem(SAVE_STORAGE_KEY, JSON.stringify(existingSlots))

    // Restore autosave if present in the export
    if (data.autoSave) {
      safeSetItem(AUTOSAVE_KEY, JSON.stringify(data.autoSave))
    }

    return { success: true, slotsImported, errors }
  } catch (err) {
    errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`)
    return { success: false, slotsImported: 0, errors }
  }
}

// ── Display helpers ──────────────────────────────────────────────────────────

/**
 * Convert a timestamp to a human-readable "time ago" string.
 */
export function formatSaveAge(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  if (diffMs < 0) return 'just now'

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  return new Date(timestamp).toLocaleDateString()
}
