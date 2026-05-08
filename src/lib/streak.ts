// Streak system for Word Snake
// Rewards players for playing consecutive days

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastPlayDate: string // YYYY-MM-DD
}

export interface StreakBonus {
  days: number
  name: string
  emoji: string
  multiplier: number
  description: string
}

// Streak milestone bonuses
export const STREAK_BONUSES: StreakBonus[] = [
  {
    days: 3,
    name: 'Warm Hands',
    emoji: '🔥',
    multiplier: 1.1,
    description: '10% score bonus',
  },
  {
    days: 7,
    name: 'On Fire',
    emoji: '🔥',
    multiplier: 1.25,
    description: '25% score bonus',
  },
  {
    days: 14,
    name: 'Unstoppable',
    emoji: '🔥',
    multiplier: 1.5,
    description: '50% score bonus',
  },
  {
    days: 30,
    name: 'Legendary',
    emoji: '🔥',
    multiplier: 2.0,
    description: '2× score multiplier',
  },
]

const STREAK_STORAGE_KEY = 'word-snake-streak'

// Get today's date string (local time)
function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get yesterday's date string
function getYesterdayString(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get current streak info from localStorage
 */
export function getStreak(): StreakInfo {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastPlayDate: '' }
  }
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!stored) {
      return { currentStreak: 0, longestStreak: 0, lastPlayDate: '' }
    }
    return JSON.parse(stored)
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastPlayDate: '' }
  }
}

/**
 * Update streak when a game is played.
 * Should be called once per game session.
 * Returns the updated StreakInfo.
 */
export function updateStreak(): StreakInfo {
  const streak = getStreak()
  const today = getTodayString()
  const yesterday = getYesterdayString()

  if (streak.lastPlayDate === today) {
    // Already played today, no change
    return streak
  }

  if (streak.lastPlayDate === yesterday) {
    // Played yesterday, increment streak
    streak.currentStreak += 1
  } else if (streak.lastPlayDate === '') {
    // First time ever playing
    streak.currentStreak = 1
  } else {
    // Streak broken, start fresh
    streak.currentStreak = 1
  }

  streak.lastPlayDate = today
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak)

  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak))
  } catch {
    /* ignore */
  }

  return streak
}

/**
 * Get the current streak multiplier based on streak days
 */
export function getStreakMultiplier(streakDays: number): number {
  let multiplier = 1.0
  for (const bonus of STREAK_BONUSES) {
    if (streakDays >= bonus.days) {
      multiplier = bonus.multiplier
    }
  }
  return multiplier
}

/**
 * Get the current active streak bonus (the highest achieved)
 */
export function getActiveStreakBonus(streakDays: number): StreakBonus | null {
  let active: StreakBonus | null = null
  for (const bonus of STREAK_BONUSES) {
    if (streakDays >= bonus.days) {
      active = bonus
    }
  }
  return active
}

/**
 * Get the next milestone the player is working toward
 */
export function getNextMilestone(
  streakDays: number
): StreakBonus | null {
  for (const bonus of STREAK_BONUSES) {
    if (streakDays < bonus.days) {
      return bonus
    }
  }
  return null // All milestones achieved
}

/**
 * Apply streak bonus to a score
 */
export function applyStreakBonus(
  score: number,
  streakDays: number
): { finalScore: number; bonus: number; multiplier: number } {
  const multiplier = getStreakMultiplier(streakDays)
  const finalScore = Math.round(score * multiplier)
  const bonus = finalScore - score
  return { finalScore, bonus, multiplier }
}
