// Game Statistics tracking for Word Snake

import { getUnlockedAchievements, ACHIEVEMENTS } from './achievements'
import { getStreak, type StreakInfo } from './streak'
import { getBestScore, getLeaderboard, type Difficulty } from './leaderboard'
import { isDailyChallengePlayed, getDailyChallengeResult } from './daily-challenge'
import { RARITY_CONFIG, type WordRarity, type WordCategory } from './word-pool'
import { getSavedSkin, getAllSkins, type SnakeSkin } from './snake-skins'

export interface GameStats {
  totalGamesPlayed: number
  totalWordsEaten: number
  totalScore: number // cumulative across all games
  bestScore: number
  bestScoreDifficulty: string
  averageScore: number
  totalPoemsCreated: number
  totalWordsUsedInPoems: number
  favoriteStyle: string
  longestStreak: number
  currentStreak: number
  totalPlayTime: number // milliseconds
  achievementsUnlocked: number
  totalAchievements: number
  mostEatenCategory: string
  mostEatenCategoryCount: number
  rarestWordEaten: string
  dailyChallengesCompleted: number
  dailyChallengesPlayed: number
  powerUpsCollected: number
  maxCombo: number
  skinsUsed: string[]
}

// localStorage keys
const KEY_TOTAL_WORDS_EATEN = 'word-snake-total-words-eaten'
const KEY_TOTAL_SCORE = 'word-snake-total-score'
const KEY_CATEGORY_STATS = 'word-snake-category-stats'
const KEY_RARITY_STATS = 'word-snake-rarity-stats'
const KEY_TOTAL_PLAY_TIME = 'word-snake-total-play-time'
const KEY_POWERUPS_COLLECTED = 'word-snake-powerups-collected'
const KEY_MAX_COMBO = 'word-snake-max-combo'
const KEY_SKINS_USED = 'word-snake-skins-used'
const KEY_POEMS_COUNT = 'word-snake-poems-count'
const KEY_POEM_STYLE_STATS = 'word-snake-poem-style-stats'
const KEY_POEM_WORDS_TOTAL = 'word-snake-poem-words-total'
const KEY_DAILY_PLAYED = 'word-snake-daily-played'
const KEY_DAILY_COMPLETED = 'word-snake-daily-completed'

// Helpers for safe localStorage access
function getStoredNumber(key: string, defaultValue = 0): number {
  if (typeof window === 'undefined') return defaultValue
  try {
    const val = localStorage.getItem(key)
    return val ? parseInt(val, 10) : defaultValue
  } catch {
    return defaultValue
  }
}

function getStoredObject<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) as T : defaultValue
  } catch {
    return defaultValue
  }
}

function setStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    if (typeof value === 'number') {
      localStorage.setItem(key, String(value))
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch { /* ignore */ }
}

/**
 * Compute all game statistics from localStorage data
 */
export function getGameStats(): GameStats {
  const totalGamesPlayed = getStoredNumber('word-snake-games')
  const totalWordsEaten = getStoredNumber(KEY_TOTAL_WORDS_EATEN)
  const totalScore = getStoredNumber(KEY_TOTAL_SCORE)
  const totalPlayTime = getStoredNumber(KEY_TOTAL_PLAY_TIME)

  // Best score across all difficulties
  let bestScore = 0
  let bestScoreDifficulty = ''
  for (const diff of ['easy', 'medium', 'hard'] as Difficulty[]) {
    const best = getBestScore(diff)
    if (best > bestScore) {
      bestScore = best
      bestScoreDifficulty = diff.charAt(0).toUpperCase() + diff.slice(1)
    }
  }

  const averageScore = totalGamesPlayed > 0 ? Math.round(totalScore / totalGamesPlayed) : 0

  // Poem stats
  const totalPoemsCreated = getStoredNumber(KEY_POEMS_COUNT)
  const totalWordsUsedInPoems = getStoredNumber(KEY_POEM_WORDS_TOTAL)
  const poemStyleStats = getStoredObject<Record<string, number>>(KEY_POEM_STYLE_STATS, {})
  const favoriteStyle = Object.entries(poemStyleStats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None'

  // Streak
  const streak: StreakInfo = getStreak()
  const currentStreak = streak.currentStreak
  const longestStreak = streak.longestStreak

  // Achievements
  const unlocked = getUnlockedAchievements()
  const achievementsUnlocked = unlocked.length
  const totalAchievements = ACHIEVEMENTS.length

  // Category stats
  const categoryStats = getStoredObject<Record<string, number>>(KEY_CATEGORY_STATS, {})
  const mostEatenEntry = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]
  const mostEatenCategory = mostEatenEntry ? mostEatenEntry[0] : 'None'
  const mostEatenCategoryCount = mostEatenEntry ? mostEatenEntry[1] : 0

  // Rarest word eaten
  const rarityStats = getStoredObject<Record<string, number>>(KEY_RARITY_STATS, {})
  const rarityOrder: WordRarity[] = ['legendary', 'rare', 'uncommon', 'common']
  let rarestWordEaten = 'None'
  for (const rarity of rarityOrder) {
    if ((rarityStats[rarity] ?? 0) > 0) {
      rarestWordEaten = `${RARITY_CONFIG[rarity]?.emoji ?? '•'} ${RARITY_CONFIG[rarity]?.label ?? rarity}`
      break
    }
  }

  // Daily challenge stats
  const dailyPlayed = getStoredNumber(KEY_DAILY_PLAYED)
  const dailyCompleted = getStoredNumber(KEY_DAILY_COMPLETED)

  // Power-ups
  const powerUpsCollected = getStoredNumber(KEY_POWERUPS_COLLECTED)

  // Max combo
  const maxCombo = getStoredNumber(KEY_MAX_COMBO)

  // Skins used
  const skinsUsed = getStoredObject<string[]>(KEY_SKINS_USED, [])

  return {
    totalGamesPlayed,
    totalWordsEaten,
    totalScore,
    bestScore,
    bestScoreDifficulty,
    averageScore,
    totalPoemsCreated,
    totalWordsUsedInPoems,
    favoriteStyle,
    longestStreak,
    currentStreak,
    totalPlayTime,
    achievementsUnlocked,
    totalAchievements,
    mostEatenCategory,
    mostEatenCategoryCount,
    rarestWordEaten,
    dailyChallengesPlayed: dailyPlayed,
    dailyChallengesCompleted: dailyCompleted,
    powerUpsCollected,
    maxCombo,
    skinsUsed,
  }
}

/**
 * Track the end of a game — updates cumulative stats in localStorage
 */
export function trackGameEnd(score: number, wordsEaten: number, difficulty: string, playTimeMs: number, isDailyChallenge: boolean): void {
  // Total words eaten
  const totalWords = getStoredNumber(KEY_TOTAL_WORDS_EATEN) + wordsEaten
  setStored(KEY_TOTAL_WORDS_EATEN, totalWords)

  // Total score (cumulative)
  const totalScore = getStoredNumber(KEY_TOTAL_SCORE) + score
  setStored(KEY_TOTAL_SCORE, totalScore)

  // Total play time
  const totalTime = getStoredNumber(KEY_TOTAL_PLAY_TIME) + playTimeMs
  setStored(KEY_TOTAL_PLAY_TIME, totalTime)

  // Daily challenge tracking
  if (isDailyChallenge) {
    setStored(KEY_DAILY_PLAYED, getStoredNumber(KEY_DAILY_PLAYED) + 1)
    if (score > 0) {
      // Check if completed by looking at the daily challenge result
      const result = getDailyChallengeResult()
      if (result?.completed) {
        setStored(KEY_DAILY_COMPLETED, getStoredNumber(KEY_DAILY_COMPLETED) + 1)
      }
    }
  }

  // Track skin usage
  const currentSkin = getSavedSkin()
  const skinsUsed = getStoredObject<string[]>(KEY_SKINS_USED, [])
  if (!skinsUsed.includes(currentSkin)) {
    skinsUsed.push(currentSkin)
    setStored(KEY_SKINS_USED, skinsUsed)
  }
}

/**
 * Track when a word is eaten — updates category and rarity stats
 */
export function trackWordEaten(category: WordCategory, rarity: WordRarity): void {
  // Category stats
  const categoryStats = getStoredObject<Record<string, number>>(KEY_CATEGORY_STATS, {})
  categoryStats[category] = (categoryStats[category] ?? 0) + 1
  setStored(KEY_CATEGORY_STATS, categoryStats)

  // Rarity stats
  const rarityStats = getStoredObject<Record<string, number>>(KEY_RARITY_STATS, {})
  rarityStats[rarity] = (rarityStats[rarity] ?? 0) + 1
  setStored(KEY_RARITY_STATS, rarityStats)
}

/**
 * Track when a poem is created — updates poem stats
 */
export function trackPoemCreated(style: string, wordsUsed: number): void {
  // Poems count
  const count = getStoredNumber(KEY_POEMS_COUNT) + 1
  setStored(KEY_POEMS_COUNT, count)

  // Words used in poems
  const totalWords = getStoredNumber(KEY_POEM_WORDS_TOTAL) + wordsUsed
  setStored(KEY_POEM_WORDS_TOTAL, totalWords)

  // Style stats
  const styleStats = getStoredObject<Record<string, number>>(KEY_POEM_STYLE_STATS, {})
  styleStats[style] = (styleStats[style] ?? 0) + 1
  setStored(KEY_POEM_STYLE_STATS, styleStats)
}

/**
 * Track when a power-up is collected
 */
export function trackPowerUpCollected(): void {
  setStored(KEY_POWERUPS_COLLECTED, getStoredNumber(KEY_POWERUPS_COLLECTED) + 1)
}

/**
 * Track combo — updates max combo if current is higher
 */
export function trackCombo(comboCount: number): void {
  const currentMax = getStoredNumber(KEY_MAX_COMBO)
  if (comboCount > currentMax) {
    setStored(KEY_MAX_COMBO, comboCount)
  }
}

/**
 * Track daily challenge completion separately (call when daily is completed)
 */
export function trackDailyCompleted(): void {
  setStored(KEY_DAILY_COMPLETED, getStoredNumber(KEY_DAILY_COMPLETED) + 1)
}

/**
 * Track daily challenge played (called when starting a daily challenge)
 */
export function trackDailyPlayed(): void {
  setStored(KEY_DAILY_PLAYED, getStoredNumber(KEY_DAILY_PLAYED) + 1)
}

/**
 * Format milliseconds to Xh Ym format
 */
export function formatPlayTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
