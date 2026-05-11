'use client'

// Multilingual-themed achievements for the Word Snake game
import { type Achievement, type AchievementStats, unlockAchievement } from './achievements'

// ─── Extended stats with per-language word counts ────────────────────────────

export interface MultilingualAchievementStats extends AchievementStats {
  multilingualWords: { ko: number; fr: number; es: number }
  languagesUsed: number
  multilingualPacksUnlocked: number
  totalMultilingual: number
}

// ─── Multilingual achievement definitions ────────────────────────────────────

export const MULTILINGUAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'polyglot_beginner',
    title: 'Polyglot Beginner',
    description: 'Collect words in 2+ different languages',
    emoji: '🌍',
    condition: (s: any) => (s.languagesUsed as number) >= 2,
  },
  {
    id: 'polyglot_intermediate',
    title: 'Language Explorer',
    description: 'Collect 5+ words in any single foreign language',
    emoji: '🗺️',
    condition: (s: any) => {
      const w = s.multilingualWords as { ko: number; fr: number; es: number }
      return Math.max(w.ko, w.fr, w.es) >= 5
    },
  },
  {
    id: 'polyglot_master',
    title: 'Multilingual Master',
    description: 'Collect 15+ words in each unlocked language',
    emoji: '👑',
    condition: (s: any) => {
      const w = s.multilingualWords as { ko: number; fr: number; es: number }
      return w.ko >= 15 && w.fr >= 15 && w.es >= 15
    },
  },
  {
    id: 'korean_scholar',
    title: 'Korean Scholar',
    description: 'Collect all 24 Korean words',
    emoji: '🎓',
    condition: (s: any) => (s.multilingualWords as { ko: number }).ko >= 24,
  },
  {
    id: 'french_connoisseur',
    title: 'French Connoisseur',
    description: 'Collect all 25 French words',
    emoji: '🥐',
    condition: (s: any) => (s.multilingualWords as { fr: number }).fr >= 25,
  },
  {
    id: 'spanish_adventurer',
    title: 'Spanish Adventurer',
    description: 'Collect all 26 Spanish words',
    emoji: '☀️',
    condition: (s: any) => (s.multilingualWords as { es: number }).es >= 26,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the IDs of all six multilingual achievements. */
export function getAllMultilingualAchievementIds(): string[] {
  return MULTILINGUAL_ACHIEVEMENTS.map((a) => a.id)
}

/** Look up a single multilingual achievement by its ID. */
export function getMultilingualAchievementById(id: string): Achievement | undefined {
  return MULTILINGUAL_ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Merge base achievement stats with multilingual-specific fields into a
 * single MultilingualAchievementStats object.
 */
export function createMultilingualStats(
  base: AchievementStats,
  extra: {
    ko: number
    fr: number
    es: number
    languagesUsed: number
    packsUnlocked: number
    totalMultilingual: number
  },
): MultilingualAchievementStats {
  return {
    ...base,
    multilingualWords: { ko: extra.ko, fr: extra.fr, es: extra.es },
    languagesUsed: extra.languagesUsed,
    multilingualPacksUnlocked: extra.packsUnlocked,
    totalMultilingual: extra.totalMultilingual,
  }
}

/**
 * Evaluate every multilingual achievement against the given stats and return
 * only the ones that are newly unlocked (i.e. weren't already in storage).
 */
export function checkMultilingualAchievements(stats: MultilingualAchievementStats): Achievement[] {
  const newlyUnlocked: Achievement[] = []
  for (const achievement of MULTILINGUAL_ACHIEVEMENTS) {
    if (achievement.condition(stats)) {
      if (unlockAchievement(achievement.id)) {
        newlyUnlocked.push(achievement)
      }
    }
  }
  return newlyUnlocked
}
