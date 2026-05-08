import { getUnlockedAchievements } from '@/lib/achievements'
import { getBestScore } from '@/lib/leaderboard'
import type { Difficulty } from '@/lib/leaderboard'

export interface AiBotSkin {
  id: string
  name: string
  headEmoji: string       // emoji displayed above bot head (instead of '🤖')
  headColor: string       // hex color for bot head
  bodyColor: string       // hex color for bot body gradient start
  bodyColorEnd: string    // hex color for bot body gradient end
  glowColor: string       // hex color for glow effect
  trailColor: string      // hex color for trail particles
  label: string           // display label (e.g., 'Classic Bot', 'Ghost Bot')
  unlockType: 'free' | 'achievement' | 'score' | 'boss'
  unlockRequirement?: string
  description: string
}

export const AI_BOT_SKINS: AiBotSkin[] = [
  {
    id: 'classic',
    name: 'Classic Bot',
    headEmoji: '🤖',
    headColor: '#f97316',
    bodyColor: '#fb923c',
    bodyColorEnd: '#c2410c',
    glowColor: '#f97316',
    trailColor: '#fb923c',
    label: 'Classic Bot',
    unlockType: 'free',
    description: 'The original AI opponent. Reliable and steady.',
  },
  {
    id: 'ghost',
    name: 'Ghost Bot',
    headEmoji: '👻',
    headColor: '#c4b5fd',
    bodyColor: '#a78bfa',
    bodyColorEnd: '#7c3aed',
    glowColor: '#a78bfa',
    trailColor: '#c4b5fd',
    label: 'Ghost Bot',
    unlockType: 'free',
    description: 'A spooky translucent bot that haunts the board.',
  },
  {
    id: 'ninja',
    name: 'Ninja Bot',
    headEmoji: '🥷',
    headColor: '#374151',
    bodyColor: '#4b5563',
    bodyColorEnd: '#1f2937',
    glowColor: '#4b5563',
    trailColor: '#374151',
    label: 'Ninja Bot',
    unlockType: 'free',
    description: 'A stealthy dark bot that strikes from the shadows.',
  },
  {
    id: 'alien',
    name: 'Alien Bot',
    headEmoji: '👽',
    headColor: '#4ade80',
    bodyColor: '#22c55e',
    bodyColorEnd: '#15803d',
    glowColor: '#22c55e',
    trailColor: '#4ade80',
    label: 'Alien Bot',
    unlockType: 'score',
    unlockRequirement: '300',
    description: 'A sci-fi green bot from another world.',
  },
  {
    id: 'wizard',
    name: 'Wizard Bot',
    headEmoji: '🧙',
    headColor: '#c084fc',
    bodyColor: '#a855f7',
    bodyColorEnd: '#7e22ce',
    glowColor: '#a855f7',
    trailColor: '#c084fc',
    label: 'Wizard Bot',
    unlockType: 'score',
    unlockRequirement: '500',
    description: 'A magical purple bot versed in ancient word spells.',
  },
  {
    id: 'dragon_bot',
    name: 'Dragon Bot',
    headEmoji: '🐲',
    headColor: '#f87171',
    bodyColor: '#ef4444',
    bodyColorEnd: '#b91c1c',
    glowColor: '#ef4444',
    trailColor: '#f87171',
    label: 'Dragon Bot',
    unlockType: 'score',
    unlockRequirement: '1000',
    description: 'A fierce fire-breathing bot of immense power.',
  },
  {
    id: 'angel',
    name: 'Angel Bot',
    headEmoji: '👼',
    headColor: '#fbbf24',
    bodyColor: '#f59e0b',
    bodyColorEnd: '#d97706',
    glowColor: '#fbbf24',
    trailColor: '#f59e0b',
    label: 'Angel Bot',
    unlockType: 'achievement',
    unlockRequirement: 'lexicon_master',
    description: 'A holy golden bot granted to masters of the lexicon.',
  },
  {
    id: 'demon',
    name: 'Demon Bot',
    headEmoji: '👹',
    headColor: '#dc2626',
    bodyColor: '#991b1b',
    bodyColorEnd: '#450a0a',
    glowColor: '#dc2626',
    trailColor: '#991b1b',
    label: 'Demon Bot',
    unlockType: 'boss',
    unlockRequirement: '10',
    description: 'A dark boss bot. Only the bravest warriors earn this skin.',
  },
]

const BOSS_DEFEATS_KEY = 'word-snake-boss-defeats'
const BOT_SKIN_KEY = 'word-snake-bot-skin'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

/**
 * Get the overall best score across all difficulties.
 */
function getOverallBestScore(): number {
  return Math.max(
    getBestScore('easy'),
    getBestScore('medium'),
    getBestScore('hard'),
  )
}

/**
 * Get the number of bosses the player has defeated.
 */
function getBossDefeats(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(BOSS_DEFEATS_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

/**
 * Look up a bot skin by its ID.
 */
export function getBotSkin(id: string): AiBotSkin | undefined {
  return AI_BOT_SKINS.find((skin) => skin.id === id)
}

/**
 * Return the default (classic) bot skin.
 */
export function getDefaultBotSkin(): AiBotSkin {
  return AI_BOT_SKINS[0]
}

/**
 * Check whether a given bot skin is unlocked based on its unlock conditions.
 */
export function isBotSkinUnlocked(id: string): boolean {
  const skin = getBotSkin(id)
  if (!skin) return false

  switch (skin.unlockType) {
    case 'free':
      return true

    case 'score': {
      const required = parseInt(skin.unlockRequirement || '0', 10)
      return getOverallBestScore() >= required
    }

    case 'achievement': {
      const achievementId = skin.unlockRequirement || ''
      const unlocked = getUnlockedAchievements()
      return unlocked.includes(achievementId)
    }

    case 'boss': {
      const required = parseInt(skin.unlockRequirement || '0', 10)
      return getBossDefeats() >= required
    }

    default:
      return false
  }
}

/**
 * Return all skins that are currently unlocked.
 */
export function getUnlockedBotSkins(): AiBotSkin[] {
  return AI_BOT_SKINS.filter((skin) => isBotSkinUnlocked(skin.id))
}

/**
 * Read the player's chosen bot skin ID from localStorage.
 * Falls back to 'classic' if nothing is saved or the saved ID is invalid.
 */
export function getSavedBotSkin(): string {
  if (typeof window === 'undefined') return 'classic'
  try {
    const saved = localStorage.getItem(BOT_SKIN_KEY)
    if (saved && getBotSkin(saved)) {
      return saved
    }
  } catch {
    // ignore
  }
  return 'classic'
}

/**
 * Persist the player's chosen bot skin ID to localStorage.
 */
export function saveBotSkin(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(BOT_SKIN_KEY, id)
  } catch {
    // ignore
  }
}
