// Extra achievements system for Word Snake — tied to newer game features
// (obstacles, portals, quiz, boss, bot skins, PvP stealing, seasonal, scramble, coins)

import { getUnlockedAchievements } from './achievements'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtraAchievement {
  id: string
  title: string
  description: string
  emoji: string
  condition: string // identifier used by the checker
  category: 'combat' | 'exploration' | 'knowledge' | 'social' | 'collection'
  reward?: { type: 'coins' | 'skin' | 'title'; value: number | string }
}

export interface ExtraAchievementStats {
  bossDefeats: number
  legendaryBossDefeats: number
  portalTeleports: number
  obstacleSurvivals: number
  spikeWordsEaten: number
  totalWordsCollected: number
  seasonalSeasonsPlayed: string[]
  unlockedBotSkins: number
  maxComboMultiplier: number
  quizCorrectAnswers: number
  quizFastestTime: number
  scramblesSolved: number
  pvpSteals: number
  pvpWins: number
  totalCoins: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'word-snake-extra-achievements'

/** Total number of AI bot skins available in the game — update when new skins ship. */
const TOTAL_BOT_SKINS = 10

/** The four seasons the player must play through. */
const ALL_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const

// ---------------------------------------------------------------------------
// Achievement definitions (15 total)
// ---------------------------------------------------------------------------

export const EXTRA_ACHIEVEMENTS: ExtraAchievement[] = [
  // ── Combat (5) ──────────────────────────────────────────────────────────
  {
    id: 'obstacle_survivor',
    title: 'Obstacle Survivor',
    description: 'Survive 50 obstacle collisions via shield',
    emoji: '🛡️',
    condition: 'obstacle_survivor',
    category: 'combat',
    reward: { type: 'coins', value: 100 },
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Defeat 5 bosses in total',
    emoji: '💀',
    condition: 'boss_slayer',
    category: 'combat',
    reward: { type: 'title', value: 'Boss Slayer' },
  },
  {
    id: 'boss_legend',
    title: 'Legendary Hunter',
    description: 'Defeat a Legendary-tier boss',
    emoji: '👑',
    condition: 'boss_legend',
    category: 'combat',
    reward: { type: 'title', value: 'Legendary Hunter' },
  },
  {
    id: 'portal_master',
    title: 'Portal Master',
    description: 'Use 20 portal teleports',
    emoji: '🌀',
    condition: 'portal_master',
    category: 'combat',
    reward: { type: 'skin', value: 'Portal Viper' },
  },
  {
    id: 'spike_dodger',
    title: 'Spike Dodger',
    description: 'Eat 10 words while spikes are on the grid',
    emoji: '🔻',
    condition: 'spike_dodger',
    category: 'combat',
    reward: { type: 'coins', value: 75 },
  },

  // ── Exploration (4) ─────────────────────────────────────────────────────
  {
    id: 'word_collector_100',
    title: 'Centurion',
    description: 'Collect 100 unique words',
    emoji: '📚',
    condition: 'word_collector_100',
    category: 'exploration',
    reward: { type: 'title', value: 'Centurion' },
  },
  {
    id: 'seasonal_explorer',
    title: 'Seasonal Explorer',
    description: 'Play during all 4 seasons',
    emoji: '🌍',
    condition: 'seasonal_explorer',
    category: 'exploration',
    reward: { type: 'coins', value: 150 },
  },
  {
    id: 'all_skins',
    title: 'Fashionista',
    description: 'Unlock all AI bot skins',
    emoji: '👗',
    condition: 'all_skins',
    category: 'exploration',
    reward: { type: 'title', value: 'Fashionista' },
  },
  {
    id: 'combo_master_5',
    title: 'Combo Master',
    description: 'Reach a x3.0 combo chain',
    emoji: '🔥',
    condition: 'combo_master_5',
    category: 'exploration',
    reward: { type: 'skin', value: 'Blaze Worm' },
  },

  // ── Knowledge (3) ───────────────────────────────────────────────────────
  {
    id: 'quiz_genius',
    title: 'Quiz Genius',
    description: 'Answer 10 word quizzes correctly',
    emoji: '🧠',
    condition: 'quiz_genius',
    category: 'knowledge',
    reward: { type: 'coins', value: 100 },
  },
  {
    id: 'quiz_speed',
    title: 'Speed Thinker',
    description: 'Answer a quiz in under 2 seconds',
    emoji: '⚡',
    condition: 'quiz_speed',
    category: 'knowledge',
    reward: { type: 'title', value: 'Speed Thinker' },
  },
  {
    id: 'scramble_master',
    title: 'Unscrambler',
    description: 'Solve 5 word scrambles',
    emoji: '🔤',
    condition: 'scramble_master',
    category: 'knowledge',
    reward: { type: 'coins', value: 50 },
  },

  // ── Social (2) ──────────────────────────────────────────────────────────
  {
    id: 'pvp_thief',
    title: 'Power Thief',
    description: 'Steal 5 power-ups in PvP',
    emoji: '🫳',
    condition: 'pvp_thief',
    category: 'social',
    reward: { type: 'title', value: 'Power Thief' },
  },
  {
    id: 'pvp_dominant',
    title: 'PvP Champion',
    description: 'Win 10 PvP matches',
    emoji: '🏆',
    condition: 'pvp_dominant',
    category: 'social',
    reward: { type: 'skin', value: 'Champion Serpent' },
  },

  // ── Collection (1) ──────────────────────────────────────────────────────
  {
    id: 'coin_hoarder',
    title: 'Coin Hoarder',
    description: 'Accumulate 500 coins',
    emoji: '💰',
    condition: 'coin_hoarder',
    category: 'collection',
    reward: { type: 'title', value: 'Coin Hoarder' },
  },
]

// ---------------------------------------------------------------------------
// Condition evaluator — maps the string condition id to a predicate
// ---------------------------------------------------------------------------

function evaluateCondition(id: string, stats: ExtraAchievementStats): boolean {
  switch (id) {
    // Combat
    case 'obstacle_survivor':
      return stats.obstacleSurvivals >= 50
    case 'boss_slayer':
      return stats.bossDefeats >= 5
    case 'boss_legend':
      return stats.legendaryBossDefeats >= 1
    case 'portal_master':
      return stats.portalTeleports >= 20
    case 'spike_dodger':
      return stats.spikeWordsEaten >= 10

    // Exploration
    case 'word_collector_100':
      return stats.totalWordsCollected >= 100
    case 'seasonal_explorer':
      return ALL_SEASONS.every((s) => stats.seasonalSeasonsPlayed.includes(s))
    case 'all_skins':
      return stats.unlockedBotSkins >= TOTAL_BOT_SKINS
    case 'combo_master_5':
      return stats.maxComboMultiplier >= 3.0

    // Knowledge
    case 'quiz_genius':
      return stats.quizCorrectAnswers >= 10
    case 'quiz_speed':
      return stats.quizFastestTime > 0 && stats.quizFastestTime < 2
    case 'scramble_master':
      return stats.scramblesSolved >= 5

    // Social
    case 'pvp_thief':
      return stats.pvpSteals >= 5
    case 'pvp_dominant':
      return stats.pvpWins >= 10

    // Collection
    case 'coin_hoarder':
      return stats.totalCoins >= 500

    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Target value lookup — returns the numeric (or array-length) target for progress
// ---------------------------------------------------------------------------

function getTarget(id: string): number {
  switch (id) {
    case 'obstacle_survivor': return 50
    case 'boss_slayer': return 5
    case 'boss_legend': return 1
    case 'portal_master': return 20
    case 'spike_dodger': return 10
    case 'word_collector_100': return 100
    case 'seasonal_explorer': return ALL_SEASONS.length // 4
    case 'all_skins': return TOTAL_BOT_SKINS
    case 'combo_master_5': return 3 // stored as float, target is 3.0
    case 'quiz_genius': return 10
    case 'quiz_speed': return 2 // upper-bound in seconds (< 2)
    case 'scramble_master': return 5
    case 'pvp_thief': return 5
    case 'pvp_dominant': return 10
    case 'coin_hoarder': return 500
    default: return 0
  }
}

/** Returns the current numeric value for a given condition id from stats. */
function getCurrentValue(id: string, stats: ExtraAchievementStats): number {
  switch (id) {
    case 'obstacle_survivor': return stats.obstacleSurvivals
    case 'boss_slayer': return stats.bossDefeats
    case 'boss_legend': return stats.legendaryBossDefeats
    case 'portal_master': return stats.portalTeleports
    case 'spike_dodger': return stats.spikeWordsEaten
    case 'word_collector_100': return stats.totalWordsCollected
    case 'seasonal_explorer': {
      return ALL_SEASONS.filter((s) => stats.seasonalSeasonsPlayed.includes(s)).length
    }
    case 'all_skins': return stats.unlockedBotSkins
    case 'combo_master_5': return stats.maxComboMultiplier
    case 'quiz_genius': return stats.quizCorrectAnswers
    case 'quiz_speed': return stats.quizFastestTime > 0 ? stats.quizFastestTime : 0
    case 'scramble_master': return stats.scramblesSolved
    case 'pvp_thief': return stats.pvpSteals
    case 'pvp_dominant': return stats.pvpWins
    case 'coin_hoarder': return stats.totalCoins
    default: return 0
  }
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

export function getExtraAchievementsUnlocked(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function markExtraAchievementUnlocked(id: string): void {
  const unlocked = getExtraAchievementsUnlocked()
  if (unlocked.includes(id)) return
  unlocked.push(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks all extra achievements against the provided stats and returns
 * any that were *newly* unlocked by this call (persisted to localStorage).
 */
export function checkExtraAchievements(stats: ExtraAchievementStats): ExtraAchievement[] {
  const newlyUnlocked: ExtraAchievement[] = []

  // For compatibility, avoid double-counting achievements already unlocked
  // in the original achievement store (e.g. if a future migration merges them).
  const legacyUnlocked = getUnlockedAchievements()
  const extraUnlocked = getExtraAchievementsUnlocked()
  const allUnlocked = new Set([...legacyUnlocked, ...extraUnlocked])

  for (const achievement of EXTRA_ACHIEVEMENTS) {
    if (allUnlocked.has(achievement.id)) continue
    if (evaluateCondition(achievement.condition, stats)) {
      markExtraAchievementUnlocked(achievement.id)
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

/**
 * Returns progress information for every extra achievement.
 *
 * - For `quiz_speed`, `current` shows the fastest answer time and `target` is 2;
 *   the achievement unlocks when `current > 0 && current < target`.
 * - For all others the achievement unlocks when `current >= target`.
 */
export function getExtraAchievementProgress(
  stats: ExtraAchievementStats,
): Record<string, { current: number; target: number; unlocked: boolean }> {
  const unlocked = new Set(getExtraAchievementsUnlocked())

  const progress: Record<string, { current: number; target: number; unlocked: boolean }> = {}

  for (const achievement of EXTRA_ACHIEVEMENTS) {
    const target = getTarget(achievement.condition)
    const current = getCurrentValue(achievement.condition, stats)
    progress[achievement.id] = {
      current,
      target,
      unlocked: unlocked.has(achievement.id),
    }
  }

  return progress
}
