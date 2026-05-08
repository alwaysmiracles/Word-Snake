export type SnakeSkin = 'classic' | 'ocean' | 'fire' | 'royal' | 'ice' | 'shadow' | 'rainbow' | 'golden' | 'custom'

export type SkinPattern = 'solid' | 'striped' | 'dotted' | 'rainbow' | 'gradient'

export interface SnakeSkinConfig {
  id: SnakeSkin
  name: string
  emoji: string
  description: string
  headColor: string
  bodyGradient: [string, string] // [tail color, head color]
  glowColor: string
  eyeColor: string
  pattern: SkinPattern
  unlockType?: 'achievement' | 'milestone'
  unlockRequirement?: string
  unlockLabel?: string
}

export const SNAKE_SKINS: Record<Exclude<SnakeSkin, 'custom'>, SnakeSkinConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    emoji: '🟢',
    description: 'Default green snake',
    headColor: '#4ade80',
    bodyGradient: ['#166534', '#4ade80'],
    glowColor: '#22c55e',
    eyeColor: '#ffffff',
    pattern: 'solid',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Blue ocean serpent',
    headColor: '#38bdf8',
    bodyGradient: ['#0c4a6e', '#38bdf8'],
    glowColor: '#0ea5e9',
    eyeColor: '#e0f2fe',
    pattern: 'gradient',
  },
  fire: {
    id: 'fire',
    name: 'Fire Wyrm',
    emoji: '🔥',
    description: 'Red fire wyrm',
    headColor: '#f97316',
    bodyGradient: ['#7c2d12', '#f97316'],
    glowColor: '#ef4444',
    eyeColor: '#fef08a',
    pattern: 'striped',
    unlockType: 'achievement',
    unlockRequirement: 'high_roller',
    unlockLabel: 'Unlock: Score 500+',
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    emoji: '👑',
    description: 'Purple royal python',
    headColor: '#a78bfa',
    bodyGradient: ['#3b0764', '#a78bfa'],
    glowColor: '#8b5cf6',
    eyeColor: '#fde68a',
    pattern: 'dotted',
    unlockType: 'achievement',
    unlockRequirement: 'poet_laureate',
    unlockLabel: 'Unlock: Create 5 Poems',
  },
  ice: {
    id: 'ice',
    name: 'Frost',
    emoji: '❄️',
    description: 'Cyan frost snake',
    headColor: '#67e8f9',
    bodyGradient: ['#164e63', '#67e8f9'],
    glowColor: '#06b6d4',
    eyeColor: '#ecfeff',
    pattern: 'gradient',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    emoji: '🌑',
    description: 'Dark shadow viper',
    headColor: '#6b7280',
    bodyGradient: ['#1f2937', '#6b7280'],
    glowColor: '#4b5563',
    eyeColor: '#c084fc',
    pattern: 'solid',
    unlockType: 'achievement',
    unlockRequirement: 'marathon',
    unlockLabel: 'Unlock: Play 10 Games',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    description: 'Rainbow serpent',
    headColor: '#f472b6',
    bodyGradient: ['#f472b6', '#a78bfa'],
    glowColor: '#e879f9',
    eyeColor: '#ffffff',
    pattern: 'rainbow',
  },
  golden: {
    id: 'golden',
    name: 'Golden',
    emoji: '🐉',
    description: 'Golden dragon',
    headColor: '#fbbf24',
    bodyGradient: ['#78350f', '#fbbf24'],
    glowColor: '#f59e0b',
    eyeColor: '#fef3c7',
    pattern: 'striped',
    unlockType: 'milestone',
    unlockRequirement: 'milestone:9',
    unlockLabel: 'Unlock: 9 Achievements (Gold Tier)',
  },
}

const SKIN_ORDER: SnakeSkin[] = ['classic', 'ocean', 'fire', 'royal', 'ice', 'shadow', 'rainbow', 'golden', 'custom']

const SKIN_STORAGE_KEY = 'word-snake-skin'

// --- Custom Skin ---

export interface CustomSkinData {
  headColor: string
  bodyColor: string
  tailColor: string
  glowColor: string
  name: string
}

const CUSTOM_SKIN_KEY = 'word-snake-custom-skin'

export const DEFAULT_CUSTOM_SKIN: CustomSkinData = {
  headColor: '#22c55e',
  bodyColor: '#16a34a',
  tailColor: '#15803d',
  glowColor: '#4ade80',
  name: 'My Custom',
}

export function getCustomSkin(): CustomSkinData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CUSTOM_SKIN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CustomSkinData>
    // Validate required fields
    if (
      typeof parsed.headColor === 'string' &&
      typeof parsed.bodyColor === 'string' &&
      typeof parsed.tailColor === 'string' &&
      typeof parsed.glowColor === 'string' &&
      typeof parsed.name === 'string'
    ) {
      return {
        headColor: parsed.headColor,
        bodyColor: parsed.bodyColor,
        tailColor: parsed.tailColor,
        glowColor: parsed.glowColor,
        name: parsed.name,
      }
    }
    // Corrupted data — clean up
    deleteCustomSkin()
  } catch {
    deleteCustomSkin()
  }
  return null
}

export function saveCustomSkin(skin: CustomSkinData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CUSTOM_SKIN_KEY, JSON.stringify(skin))
  } catch { /* ignore */ }
}

export function deleteCustomSkin(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CUSTOM_SKIN_KEY)
  } catch { /* ignore */ }
}

export function customSkinToConfig(data: CustomSkinData): SnakeSkinConfig {
  return {
    id: 'custom',
    name: data.name,
    emoji: '🎨',
    description: `Custom: ${data.name}`,
    headColor: data.headColor,
    bodyGradient: [data.tailColor, data.bodyColor],
    glowColor: data.glowColor,
    eyeColor: '#ffffff',
    pattern: 'gradient',
  }
}

export function getSnakeSkin(id: SnakeSkin): SnakeSkinConfig {
  if (id === 'custom') {
    const custom = getCustomSkin()
    if (custom) return customSkinToConfig(custom)
    return SNAKE_SKINS.classic
  }
  return SNAKE_SKINS[id] ?? SNAKE_SKINS.classic
}

export function getAllSkins(): SnakeSkinConfig[] {
  return SKIN_ORDER.map((id) => {
    if (id === 'custom') {
      const custom = getCustomSkin()
      if (custom) return customSkinToConfig(custom)
      return null
    }
    return SNAKE_SKINS[id]
  }).filter((s): s is SnakeSkinConfig => s !== null)
}

export function getSavedSkin(): SnakeSkin {
  if (typeof window === 'undefined') return 'classic'
  try {
    const stored = localStorage.getItem(SKIN_STORAGE_KEY)
    if (stored) {
      if (stored === 'custom') {
        // Only allow custom if custom skin data exists
        if (getCustomSkin()) return 'custom'
        return 'classic'
      }
      if (stored in SNAKE_SKINS) {
        return stored as SnakeSkin
      }
    }
  } catch { /* ignore */ }
  return 'classic'
}

export function saveSnakeSkin(id: SnakeSkin): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, id)
  } catch { /* ignore */ }
}

import { getUnlockedAchievements } from './achievements'

/**
 * Check if a skin is unlocked for the current user.
 * Free skins (no unlockType) are always unlocked.
 * Achievement skins require the specific achievement to be unlocked.
 * Milestone skins require the user to have reached the achievement count threshold.
 */
export function isSkinUnlocked(skinId: string): boolean {
  // Custom skin is always unlocked
  if (skinId === 'custom') return true
  const skin = SNAKE_SKINS[skinId as SnakeSkin]
  if (!skin || !skin.unlockType) return true

  if (skin.unlockType === 'achievement') {
    const unlocked = getUnlockedAchievements()
    return unlocked.includes(skin.unlockRequirement!)
  }

  if (skin.unlockType === 'milestone' && skin.unlockRequirement?.startsWith('milestone:')) {
    const threshold = parseInt(skin.unlockRequirement.split(':')[1], 10)
    if (isNaN(threshold)) return false
    const unlocked = getUnlockedAchievements()
    return unlocked.length >= threshold
  }

  return false
}

/**
 * Get all skin IDs that the current user has unlocked.
 */
export function getUnlockedSkins(): string[] {
  return SKIN_ORDER.filter((id) => isSkinUnlocked(id))
}

/**
 * Get the mapping of achievement/milestone IDs to the skin they unlock.
 */
export function getSkinUnlockMap(): Record<string, { skinId: SnakeSkin; skinName: string; skinEmoji: string }> {
  const map: Record<string, { skinId: SnakeSkin; skinName: string; skinEmoji: string }> = {}
  for (const skin of getAllSkins()) {
    if (skin.unlockRequirement) {
      map[skin.unlockRequirement] = {
        skinId: skin.id,
        skinName: skin.name,
        skinEmoji: skin.emoji,
      }
    }
  }
  return map
}
