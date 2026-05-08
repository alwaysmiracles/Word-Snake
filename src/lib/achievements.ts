// Achievement system for Word Snake

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  condition: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  totalWordsCollected: number
  totalWordsEaten: number // in current session
  poemsCreated: number
  highScore: number
  categories: string[]
  gamesPlayed: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_bite',
    title: 'First Bite',
    description: 'Eat your first word',
    emoji: '🍎',
    condition: (s) => s.totalWordsCollected >= 1,
  },
  {
    id: 'word_collector',
    title: 'Word Collector',
    description: 'Collect 10 words in total',
    emoji: '📚',
    condition: (s) => s.totalWordsCollected >= 10,
  },
  {
    id: 'lexicon_builder',
    title: 'Lexicon Builder',
    description: 'Collect 25 words in total',
    emoji: '📖',
    condition: (s) => s.totalWordsCollected >= 25,
  },
  {
    id: 'vocabulary_master',
    title: 'Vocabulary Master',
    description: 'Collect 50 words in total',
    emoji: '🎓',
    condition: (s) => s.totalWordsCollected >= 50,
  },
  {
    id: 'first_poem',
    title: 'First Poem',
    description: 'Generate your first poem',
    emoji: '✍️',
    condition: (s) => s.poemsCreated >= 1,
  },
  {
    id: 'poet_laureate',
    title: 'Poet Laureate',
    description: 'Generate 5 poems',
    emoji: '👑',
    condition: (s) => s.poemsCreated >= 5,
  },
  {
    id: 'century_score',
    title: 'Century',
    description: 'Score 100 points in one game',
    emoji: '💯',
    condition: (s) => s.highScore >= 100,
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score 500 points in one game',
    emoji: '🎰',
    condition: (s) => s.highScore >= 500,
  },
  {
    id: 'category_diver',
    title: 'Category Diver',
    description: 'Collect words from 3 different categories',
    emoji: '🌈',
    condition: (s) => s.categories.length >= 3,
  },
  {
    id: 'full_spectrum',
    title: 'Full Spectrum',
    description: 'Collect words from all 8 categories',
    emoji: '🎨',
    condition: (s) => s.categories.length >= 8,
  },
  {
    id: 'marathon',
    title: 'Marathon Runner',
    description: 'Play 10 games',
    emoji: '🏃',
    condition: (s) => s.gamesPlayed >= 10,
  },
]

// Track unlocked achievements in localStorage
const STORAGE_KEY = 'word-snake-achievements'

export function getUnlockedAchievements(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements()
  if (unlocked.includes(id)) return false
  unlocked.push(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  return true
}

export function checkAchievements(stats: AchievementStats): Achievement[] {
  const newlyUnlocked: Achievement[] = []
  for (const achievement of ACHIEVEMENTS) {
    if (achievement.condition(stats)) {
      if (unlockAchievement(achievement.id)) {
        newlyUnlocked.push(achievement)
      }
    }
  }
  return newlyUnlocked
}
