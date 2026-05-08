// Achievement Milestone Rewards — bonus perks at achievement completion thresholds

import { ACHIEVEMENTS, getUnlockedAchievements } from '@/lib/achievements'

export type BonusType = 'points_per_word' | 'extra_life' | 'spawn_rate' | 'golden_trail'

export interface MilestoneConfig {
  id: string
  name: string
  threshold: number // number of achievements needed
  emoji: string
  description: string
  bonusType: BonusType
  bonusValue: number
  color: string
  glowColor: string
}

export const MILESTONE_CONFIG: MilestoneConfig[] = [
  {
    id: 'bronze',
    name: 'Apprentice Wordsmith',
    threshold: 3,
    emoji: '🥉',
    description: '+5 points per word eaten',
    bonusType: 'points_per_word',
    bonusValue: 5,
    color: '#cd7f32',
    glowColor: 'rgba(205, 127, 50, 0.15)',
  },
  {
    id: 'silver',
    name: 'Journeyman Poet',
    threshold: 6,
    emoji: '🥈',
    description: '1 extra life per game',
    bonusType: 'extra_life',
    bonusValue: 1,
    color: '#c0c0c0',
    glowColor: 'rgba(192, 192, 192, 0.15)',
  },
  {
    id: 'gold',
    name: 'Master Lexicon',
    threshold: 9,
    emoji: '🥇',
    description: '2× word spawn rate',
    bonusType: 'spawn_rate',
    bonusValue: 2,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.15)',
  },
  {
    id: 'platinum',
    name: 'Legendary Scribe',
    threshold: 11,
    emoji: '💎',
    description: 'Golden sparkle particle trail',
    bonusType: 'golden_trail',
    bonusValue: 1,
    color: '#e5e4e2',
    glowColor: 'rgba(229, 228, 226, 0.2)',
  },
]

const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length
const STORAGE_KEY = 'word-snake-milestones'

// Get current unlocked milestone IDs from localStorage
export function getUnlockedMilestones(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save a milestone unlock to localStorage, returns true if newly unlocked
function unlockMilestone(id: string): boolean {
  const unlocked = getUnlockedMilestones()
  if (unlocked.includes(id)) return false
  unlocked.push(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  return true
}

// Get all milestone statuses based on current unlock count
export function getMilestones(unlockedCount: number): {
  milestone: MilestoneConfig
  unlocked: boolean
  progress: number // 0-100
}[] {
  return MILESTONE_CONFIG.map((m) => ({
    milestone: m,
    unlocked: unlockedCount >= m.threshold,
    progress: Math.min(100, Math.round((unlockedCount / m.threshold) * 100)),
  }))
}

// Check for newly unlocked milestones — returns array of newly unlocked milestone configs
export function checkMilestones(): MilestoneConfig[] {
  const unlockedCount = getUnlockedAchievements().length
  const previouslyUnlocked = getUnlockedMilestones()
  const newlyUnlocked: MilestoneConfig[] = []

  for (const m of MILESTONE_CONFIG) {
    if (unlockedCount >= m.threshold && !previouslyUnlocked.includes(m.id)) {
      if (unlockMilestone(m.id)) {
        newlyUnlocked.push(m)
      }
    }
  }

  return newlyUnlocked
}

// Get active milestone bonuses (all unlocked milestone bonus types and values)
export function getActiveMilestoneBonuses(): {
  pointsPerWord: number
  extraLife: number
  spawnRateMultiplier: number
  hasGoldenTrail: boolean
} {
  const unlockedIds = getUnlockedMilestones()
  let pointsPerWord = 0
  let extraLife = 0
  let spawnRateMultiplier = 1
  let hasGoldenTrail = false

  for (const m of MILESTONE_CONFIG) {
    if (unlockedIds.includes(m.id)) {
      switch (m.bonusType) {
        case 'points_per_word':
          pointsPerWord += m.bonusValue
          break
        case 'extra_life':
          extraLife += m.bonusValue
          break
        case 'spawn_rate':
          spawnRateMultiplier *= m.bonusValue
          break
        case 'golden_trail':
          hasGoldenTrail = true
          break
      }
    }
  }

  return { pointsPerWord, extraLife, spawnRateMultiplier, hasGoldenTrail }
}

// Get the next locked milestone (for progress indicator)
export function getNextMilestone(unlockedCount: number): {
  milestone: MilestoneConfig
  remaining: number
} | null {
  for (const m of MILESTONE_CONFIG) {
    if (unlockedCount < m.threshold) {
      return { milestone: m, remaining: m.threshold - unlockedCount }
    }
  }
  return null // All milestones unlocked
}

// Get overall milestone completion percentage
export function getMilestoneProgress(unlockedCount: number): number {
  if (TOTAL_ACHIEVEMENTS === 0) return 0
  return Math.round((unlockedCount / TOTAL_ACHIEVEMENTS) * 100)
}
