// Easter Eggs System for Word Snake Game
// Hidden features triggered by eating specific word combinations

export interface EasterEgg {
  id: string
  name: string
  emoji: string
  description: string
  type: 'sequence' | 'collection' | 'special_word'
  // For sequence: words must be eaten in exact order (case-insensitive)
  sequence?: string[]
  // For collection: words must all be collected (in any order, case-insensitive)
  requiredWords?: string[]
  // For special_word: eating this single word triggers the effect (case-insensitive)
  triggerWord?: string
  effect: EasterEggEffect
  duration?: number // ms for timed effects
  message: string // Show to player when triggered
  oneTime: boolean // Can only trigger once per session?
}

export type EasterEggEffect =
  | 'rainbow_snake'
  | 'giant_food'
  | 'reverse_controls'
  | 'confetti_burst'
  | 'speed_boost'
  | 'extra_life'
  | 'color_explosion'
  | 'slow_mo'

export const EASTER_EGGS: EasterEgg[] = [
  // Sequence easter eggs
  {
    id: 'nature_trio',
    name: "Nature's Harmony",
    emoji: '🌿',
    description: 'Eat Nature, Serenity, and Blossom in sequence',
    type: 'sequence',
    sequence: ['nature', 'serenity', 'blossom'],
    effect: 'rainbow_snake',
    duration: 15000,
    message: "🌿 Nature's Harmony! Rainbow Snake for 15 seconds!",
    oneTime: false,
  },
  {
    id: 'elemental_fury',
    name: 'Elemental Fury',
    emoji: '🔥',
    description: 'Eat Fire, Water, and Storm in sequence',
    type: 'sequence',
    sequence: ['fire', 'water', 'storm'],
    effect: 'color_explosion',
    message: '🔥 Elemental Fury! Color explosion on the grid!',
    oneTime: false,
  },
  {
    id: 'time_lord',
    name: 'Time Lord',
    emoji: '⏰',
    description: 'Eat Dawn, Dusk, and Eternity in sequence',
    type: 'sequence',
    sequence: ['dawn', 'dusk', 'eternity'],
    effect: 'slow_mo',
    duration: 10000,
    message: '⏰ Time Lord! Time slows down for 10 seconds!',
    oneTime: false,
  },
  // Collection easter eggs
  {
    id: 'word_master',
    name: 'True Word Master',
    emoji: '📚',
    description: 'Collect 5 different virtue words (Joy, Grace, Hope, Peace, Valor)',
    type: 'collection',
    requiredWords: ['joy', 'grace', 'hope', 'peace', 'valor'],
    effect: 'confetti_burst',
    message: '📚 True Word Master! You collected all virtue words!',
    oneTime: true,
  },
  // Special word easter eggs
  {
    id: 'snake_food',
    name: 'Ouroboros',
    emoji: '🐍',
    description: 'Eat the word "Wisdom" — the snake of wisdom grants a gift!',
    type: 'special_word',
    triggerWord: 'wisdom',
    effect: 'extra_life',
    message: '🐍 Ouroboros! The snake of wisdom grants you an extra life!',
    oneTime: true,
  },
  {
    id: 'chaos_mode',
    name: 'Chaos Mode',
    emoji: '🌪️',
    description: 'Eat the word "Lightning" — reverse controls!',
    type: 'special_word',
    triggerWord: 'lightning',
    effect: 'reverse_controls',
    duration: 8000,
    message: '🌪️ Chaos Mode! Controls are reversed for 8 seconds!',
    oneTime: false,
  },
]

// Session-scoped state (survives across games within same page load)
const triggeredThisSession = new Set<string>()
let recentWords: string[] = []
const MAX_RECENT_WORDS = 10

// Active timed effects
export interface ActiveEasterEggEffect {
  effect: EasterEggEffect
  easterEggId: string
  expiresAt: number
}
const activeEffects: Map<string, ActiveEasterEggEffect> = new Map()

/**
 * Check if eating a word triggers any easter eggs.
 * Call this every time the snake eats a word.
 * Returns array of newly triggered easter eggs.
 */
export function checkEasterEggs(
  eatenWord: string,
  allCollectedWords: Set<string>
): EasterEgg[] {
  const normalized = eatenWord.toLowerCase()
  const triggered: EasterEgg[] = []

  // Add to recent words list
  recentWords.push(normalized)
  if (recentWords.length > MAX_RECENT_WORDS) {
    recentWords = recentWords.slice(-MAX_RECENT_WORDS)
  }

  for (const egg of EASTER_EGGS) {
    // Skip if already triggered this session (for one-time eggs)
    if (egg.oneTime && triggeredThisSession.has(egg.id)) continue

    // Skip if this effect is already active (for timed effects)
    if (egg.duration) {
      const existing = activeEffects.get(egg.id)
      if (existing && existing.expiresAt > Date.now()) continue
    }

    let isMatch = false

    switch (egg.type) {
      case 'special_word': {
        isMatch = normalized === egg.triggerWord
        break
      }
      case 'sequence': {
        if (!egg.sequence) break
        const seq = egg.sequence.map(w => w.toLowerCase())
        // Check if the last N recent words match the sequence exactly
        const tail = recentWords.slice(-seq.length)
        isMatch = tail.length === seq.length && tail.every((w, i) => w === seq[i])
        break
      }
      case 'collection': {
        if (!egg.requiredWords) break
        const required = egg.requiredWords.map(w => w.toLowerCase())
        const collected = new Set(Array.from(allCollectedWords).map(w => w.toLowerCase()))
        isMatch = required.every(w => collected.has(w))
        break
      }
    }

    if (isMatch) {
      triggered.push(egg)
      triggeredThisSession.add(egg.id)

      // For timed effects, register the active effect
      if (egg.duration) {
        activeEffects.set(egg.id, {
          effect: egg.effect,
          easterEggId: egg.id,
          expiresAt: Date.now() + egg.duration,
        })
      }

      // For sequence type, clear recent words so they can trigger again
      if (egg.type === 'sequence') {
        recentWords = []
      }
    }
  }

  return triggered
}

/**
 * Check if a specific easter egg has been triggered this session
 */
export function isEasterEggTriggered(id: string): boolean {
  return triggeredThisSession.has(id)
}

/**
 * Get all currently active easter egg effects (not expired)
 */
export function getActiveEasterEggEffects(): Map<string, ActiveEasterEggEffect> {
  return new Map(activeEffects)
}

/**
 * Check if a specific effect type is currently active
 */
export function hasActiveEffect(effectType: EasterEggEffect): boolean {
  for (const entry of activeEffects.values()) {
    if (entry.effect === effectType && entry.expiresAt > Date.now()) {
      return true
    }
  }
  return false
}

/**
 * Remove expired effects. Call periodically (e.g., each game tick).
 */
export function expireEasterEggEffects(): void {
  const now = Date.now()
  for (const [key, value] of activeEffects) {
    if (value.expiresAt > 0 && value.expiresAt <= now) {
      activeEffects.delete(key)
    }
  }
}

/**
 * Reset all session state (e.g., on page reload or explicit reset)
 */
export function resetEasterEggSession(): void {
  triggeredThisSession.clear()
  recentWords = []
  activeEffects.clear()
}

/**
 * Reset state for a new game (keep session-triggered status, clear recent words)
 */
export function resetEasterEggForNewGame(): void {
  recentWords = []
  activeEffects.clear()
}

/**
 * Get the list of all easter eggs with their triggered status (for UI display)
 */
export function getEasterEggStatus(): Array<{
  egg: EasterEgg
  triggered: boolean
  active: boolean
}> {
  const now = Date.now()
  return EASTER_EGGS.map(egg => {
    const active = activeEffects.has(egg.id) && (activeEffects.get(egg.id)!.expiresAt > now || activeEffects.get(egg.id)!.expiresAt === 0)
    return {
      egg,
      triggered: triggeredThisSession.has(egg.id),
      active,
    }
  })
}
