'use client'

// Achievement Progress Tracker for Word Snake
// Combines base, extra, and multilingual achievements into unified progress data.

import { ACHIEVEMENTS, type AchievementStats, getUnlockedAchievements } from './achievements'
import { EXTRA_ACHIEVEMENTS, getExtraAchievementProgress, type ExtraAchievementStats } from './achievements-extra'
import { MULTILINGUAL_ACHIEVEMENTS, type MultilingualAchievementStats } from './multilingual-achievements'

export type AchievementProgressItem = {
  id: string
  title: string
  description: string
  emoji: string
  category: 'base' | 'combat' | 'exploration' | 'knowledge' | 'social' | 'collection' | 'multilingual'
  current: number
  target: number
  percent: number  // 0-100
  unlocked: boolean
  reward?: { type: string; value: number | string }
}

export type AchievementProgressGroup = {
  category: string
  emoji: string
  items: AchievementProgressItem[]
  totalPercent: number
}

export type AchievementProgressSummary = {
  totalAchievements: number
  unlockedCount: number
  overallPercent: number
  groups: AchievementProgressGroup[]
  nearCompletion: AchievementProgressItem[]  // 70%+ but not unlocked
  recentlyUnlocked: AchievementProgressItem[]
}

export const ACHIEVEMENT_CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  base:         { emoji: '⭐', label: 'Base Achievements',   color: '#6366f1' },
  combat:       { emoji: '⚔️', label: 'Combat',              color: '#ef4444' },
  exploration:  { emoji: '🧭', label: 'Exploration',          color: '#22c55e' },
  knowledge:    { emoji: '🧠', label: 'Knowledge',            color: '#3b82f6' },
  social:       { emoji: '👥', label: 'Social',               color: '#f59e0b' },
  collection:   { emoji: '💎', label: 'Collection',           color: '#a855f7' },
  multilingual: { emoji: '🌐', label: 'Multilingual',         color: '#06b6d4' },
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function computePercent(current: number, target: number): number {
  if (!target || target <= 0) return 0
  return clampPercent((current / target) * 100)
}

function makeProgressItem(
  id: string, title: string, description: string, emoji: string,
  category: AchievementProgressItem['category'],
  current: number, target: number, unlocked: boolean,
  reward?: { type: string; value: number | string },
): AchievementProgressItem {
  const percent = unlocked ? 100 : computePercent(current, target)
  return { id, title, description, emoji, category, current, target, percent, unlocked, reward }
}

const BASE_TARGETS: Record<string, number> = {
  first_bite:        1,
  word_collector:    10,
  lexicon_builder:   25,
  vocabulary_master: 50,
  first_poem:        1,
  poet_laureate:     5,
  century_score:     100,
  high_roller:       500,
  category_diver:    3,
  full_spectrum:     8,
  marathon:          10,
}

function getBaseCurrent(id: string, stats: AchievementStats): number {
  switch (id) {
    case 'first_bite':
    case 'word_collector':
    case 'lexicon_builder':
    case 'vocabulary_master':
      return stats.totalWordsCollected
    case 'first_poem':
    case 'poet_laureate':
      return stats.poemsCreated
    case 'century_score':
    case 'high_roller':
      return stats.highScore
    case 'category_diver':
    case 'full_spectrum':
      return stats.categories.length
    case 'marathon':
      return stats.gamesPlayed
    default:
      return 0
  }
}

export function getBaseAchievementProgress(stats: AchievementStats): AchievementProgressItem[] {
  if (!stats) return []

  const unlocked = new Set(getUnlockedAchievements())

  return ACHIEVEMENTS.map((ach) => {
    const target = BASE_TARGETS[ach.id] ?? 1
    const current = getBaseCurrent(ach.id, stats)
    return makeProgressItem(
      ach.id, ach.title, ach.description, ach.emoji,
      'base', current, target, unlocked.has(ach.id),
    )
  })
}

const MULTI_TARGETS: Record<string, number> = {
  polyglot_beginner:      2,
  polyglot_intermediate:  5,
  polyglot_master:        15,
  korean_scholar:         24,
  french_connoisseur:     25,
  spanish_adventurer:     26,
}

function getMultilingualCurrent(id: string, stats: MultilingualAchievementStats): number {
  if (!stats || !stats.multilingualWords) return 0
  const w = stats.multilingualWords
  switch (id) {
    case 'polyglot_beginner':
      return stats.languagesUsed ?? 0
    case 'polyglot_intermediate':
      return Math.max(w.ko ?? 0, w.fr ?? 0, w.es ?? 0)
    case 'polyglot_master':
      return Math.min(w.ko ?? 0, w.fr ?? 0, w.es ?? 0)
    case 'korean_scholar':
      return w.ko ?? 0
    case 'french_connoisseur':
      return w.fr ?? 0
    case 'spanish_adventurer':
      return w.es ?? 0
    default:
      return 0
  }
}

export function getMultilingualAchievementProgress(stats: MultilingualAchievementStats): AchievementProgressItem[] {
  if (!stats) return []

  const unlocked = new Set(getUnlockedAchievements())

  return MULTILINGUAL_ACHIEVEMENTS.map((ach) => {
    const target = MULTI_TARGETS[ach.id] ?? 1
    const current = getMultilingualCurrent(ach.id, stats)
    return makeProgressItem(
      ach.id, ach.title, ach.description, ach.emoji,
      'multilingual', current, target, unlocked.has(ach.id),
    )
  })
}

function getExtraAchievementItems(stats: ExtraAchievementStats): AchievementProgressItem[] {
  if (!stats) return []

  const progress = getExtraAchievementProgress(stats)

  return EXTRA_ACHIEVEMENTS.map((ach) => {
    const p = progress[ach.id] ?? { current: 0, target: 1, unlocked: false }
    return makeProgressItem(
      ach.id, ach.title, ach.description, ach.emoji,
      ach.category, p.current, p.target, p.unlocked, ach.reward,
    )
  })
}

export function getFullAchievementProgress(
  baseStats: AchievementStats,
  extraStats: ExtraAchievementStats,
  multiStats: MultilingualAchievementStats,
): AchievementProgressSummary {
  const baseItems = getBaseAchievementProgress(baseStats ?? {} as AchievementStats)
  const extraItems = getExtraAchievementItems(extraStats ?? {} as ExtraAchievementStats)
  const multiItems = getMultilingualAchievementProgress(multiStats ?? {} as MultilingualAchievementStats)

  const allItems = [...baseItems, ...extraItems, ...multiItems]
  const totalAchievements = allItems.length
  const unlockedCount = allItems.filter((i) => i.unlocked).length
  const overallPercent = totalAchievements > 0 ? clampPercent((unlockedCount / totalAchievements) * 100) : 0

  // Group by category, find near-completion (70%+ locked) and recently unlocked
  const categoryOrder = ['base', 'combat', 'exploration', 'knowledge', 'social', 'collection', 'multilingual'] as const
  const groups: AchievementProgressGroup[] = categoryOrder
    .map((cat) => {
      const config = ACHIEVEMENT_CATEGORY_CONFIG[cat] ?? { emoji: '🏷️', label: cat, color: '#888' }
      const items = allItems.filter((i) => i.category === cat)
      const totalPercent = items.length > 0
        ? clampPercent(items.reduce((sum, i) => sum + i.percent, 0) / items.length)
        : 0
      return { category: cat, emoji: config.emoji, items, totalPercent }
    })
    .filter((g) => g.items.length > 0)

  const nearCompletion = allItems
    .filter((i) => !i.unlocked && i.percent >= 70)
    .sort((a, b) => b.percent - a.percent)
  const recentlyUnlocked = allItems.filter((i) => i.unlocked).slice(0, 5)

  return { totalAchievements, unlockedCount, overallPercent, groups, nearCompletion, recentlyUnlocked }
}

const MOTIVATIONAL_TIERS: { min: number; max: number; messages: string[] }[] = [
  { min: 0,  max: 20,  messages: [
    'Every journey starts with a single step!',
    "You've just begun — great things await!",
  ]},
  { min: 20, max: 50,  messages: [
    'Keep going, you\'re making great progress!',
    'Steady as she goes — you\'re building momentum!',
  ]},
  { min: 50, max: 75,  messages: [
    'You\'re past the halfway mark — amazing!',
    'Over halfway there — the finish line is in sight!',
  ]},
  { min: 75, max: 95,  messages: [
    'Almost there — don\'t stop now!',
    'So close to mastery! One more push!',
  ]},
  { min: 95, max: 100, messages: [
    'Nearly perfect! Just a few more to go!',
    'Completionist in the making!',
  ]},
]

export function getMotivationalMessage(percent: number): string {
  if (percent >= 100) return '🎉 All achievements unlocked! You are a true Word Snake master!'

  const tier = MOTIVATIONAL_TIERS.find((t) => percent >= t.min && percent < t.max)
  if (!tier) return 'Keep playing and collecting words!'

  const index = Math.floor(Math.random() * tier.messages.length)
  return tier.messages[index]
}
