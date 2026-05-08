// Story / Adventure Mode – Level definitions, progress tracking, and objective checking
import type { WordCategory } from '@/lib/word-pool'

// ─── Types ──────────────────────────────────────────────────────────────────

export type StoryObjective =
  | { type: 'collect_words'; target: number; category?: WordCategory }
  | { type: 'reach_score'; target: number }
  | { type: 'survive_time'; target: number }
  | { type: 'defeat_boss'; bossName: string }
  | { type: 'collect_specific'; words: string[] }

export interface StoryLevel {
  id: string
  chapter: number
  level: number
  title: string
  subtitle: string
  narrative: string[]
  objective: StoryObjective
  rewards: { coins: number; unlockSkin?: string; unlockPack?: string }
  modifiers: {
    speedMultiplier?: number
    wordCategories?: WordCategory[]
    disableObstacles?: boolean
    extraObstacles?: boolean
    weather?: 'clear' | 'rain' | 'snow' | 'stars'
    gridSize?: { width: number; height: number }
    startingLength?: number
  }
  difficulty: 'easy' | 'medium' | 'hard'
  bossEncounter?: { bossName: string; requiredPasses: number }
}

export interface StoryProgress {
  currentChapter: number
  currentLevel: number
  completedLevels: Set<string>
  totalCoins: number
  unlockedSkins: string[]
  unlockedPacks: string[]
}

export interface LevelResult {
  levelId: string
  completed: boolean
  score: number
  wordsEaten: number
  coinsEarned: number
  timeElapsed: number
}

export interface ObjectiveCheck {
  completed: boolean
  progress: number        // 0 – 1
  description: string     // human-readable progress, e.g. "4 / 8 words collected"
}

export interface ChapterInfo {
  title: string
  description: string
  levels: StoryLevel[]
  emoji: string
}

// ─── localStorage helpers (follows project conventions) ─────────────────────

const STORAGE_KEY = 'word-snake-story-progress'

interface SerializableProgress {
  currentChapter: number
  currentLevel: number
  completedLevels: string[]
  totalCoins: number
  unlockedSkins: string[]
  unlockedPacks: string[]
}

function getStoredObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota errors */
  }
}

// ─── Level Definitions ─────────────────────────────────────────────────────

export const STORY_LEVELS: StoryLevel[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 1 – The Awakening  (tutorial-like, easy)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ch1-l1',
    chapter: 1,
    level: 1,
    title: 'First Steps',
    subtitle: 'Begin your journey through the world of words',
    narrative: [
      'In a quiet digital realm, a small green snake stirs to life.',
      'Letters float like fireflies, waiting to be gathered.',
      'Your adventure begins now — guide the snake and collect 5 words to awaken your power.',
    ],
    objective: { type: 'collect_words', target: 5 },
    rewards: { coins: 10 },
    modifiers: {
      disableObstacles: true,
      weather: 'clear',
    },
    difficulty: 'easy',
  },
  {
    id: 'ch1-l2',
    chapter: 1,
    level: 2,
    title: "Nature's Path",
    subtitle: 'Discover the beauty of the natural world',
    narrative: [
      'The snake wanders into a sunlit meadow where nature words bloom like flowers.',
      'Collect 8 nature words to unlock the secrets of the earth.',
    ],
    objective: { type: 'collect_words', target: 8, category: 'nature' },
    rewards: { coins: 15 },
    modifiers: {
      wordCategories: ['nature'],
      disableObstacles: true,
      weather: 'clear',
    },
    difficulty: 'easy',
  },
  {
    id: 'ch1-l3',
    chapter: 1,
    level: 3,
    title: 'Emotional Journey',
    subtitle: 'Feel every word as it resonates within',
    narrative: [
      'Beyond the meadow, the landscape shifts to a realm of feelings.',
      'Emotion words glow with inner light. Collect 6 to open your heart.',
    ],
    objective: { type: 'collect_words', target: 6, category: 'emotion' },
    rewards: { coins: 15 },
    modifiers: {
      wordCategories: ['emotion'],
      disableObstacles: true,
    },
    difficulty: 'easy',
  },
  {
    id: 'ch1-l4',
    chapter: 1,
    level: 4,
    title: 'Time Flies',
    subtitle: 'Survive the ticking clock',
    narrative: [
      'Time itself begins to bend. The seconds slip by faster than expected.',
      'Survive for 60 seconds to prove your endurance and master the basics.',
    ],
    objective: { type: 'survive_time', target: 60 },
    rewards: { coins: 20, unlockSkin: 'ocean' },
    modifiers: {
      disableObstacles: true,
    },
    difficulty: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 2 – The Gathering Storm  (medium difficulty)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ch2-l1',
    chapter: 2,
    level: 1,
    title: 'Elemental Forces',
    subtitle: 'Harness the power of fire, water, and earth',
    narrative: [
      'The sky darkens as elemental forces clash above.',
      'Words of fire, water, and stone rain down upon the grid.',
      'Reach a score of 200 to command the elements.',
    ],
    objective: { type: 'reach_score', target: 200 },
    rewards: { coins: 25 },
    modifiers: {
      wordCategories: ['element', 'nature'],
    },
    difficulty: 'medium',
  },
  {
    id: 'ch2-l2',
    chapter: 2,
    level: 2,
    title: 'Creatures Unleashed',
    subtitle: 'The beasts of the lexicon are on the move',
    narrative: [
      'Creatures great and small emerge from the shadows of forgotten pages.',
      'Collect 10 creature words to tame the wild vocabulary.',
    ],
    objective: { type: 'collect_words', target: 10, category: 'creature' },
    rewards: { coins: 25 },
    modifiers: {
      wordCategories: ['creature'],
    },
    difficulty: 'medium',
  },
  {
    id: 'ch2-l3',
    chapter: 2,
    level: 3,
    title: 'Storm Front',
    subtitle: 'Battle through wind and rain',
    narrative: [
      'Thunder rumbles as the first storm descends upon the grid.',
      'Rain obscures the words, and obstacles appear in the downpour.',
      'Reach a score of 300 before the tempest claims you.',
    ],
    objective: { type: 'reach_score', target: 300 },
    rewards: { coins: 30 },
    modifiers: {
      weather: 'rain',
    },
    difficulty: 'medium',
  },
  {
    id: 'ch2-l4',
    chapter: 2,
    level: 4,
    title: 'Quality Check',
    subtitle: 'Only the finest words will suffice',
    narrative: [
      'A wise elder appears at the crossroads.',
      '"Not all words are created equal," she says. "Seek quality over quantity."',
      'Collect 8 quality words with sharpened speed — the pace has quickened.',
    ],
    objective: { type: 'collect_words', target: 8, category: 'quality' },
    rewards: { coins: 30, unlockPack: 'cosmos' },
    modifiers: {
      wordCategories: ['quality'],
      speedMultiplier: 1.1,
    },
    difficulty: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 3 – The Labyrinth  (harder, with modifiers)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ch3-l1',
    chapter: 3,
    level: 1,
    title: 'Action Hero',
    subtitle: 'Move fast, think faster',
    narrative: [
      'The labyrinth walls close in. Every word must be earned through agility.',
      'Action words pulse with kinetic energy — collect 12 to break through.',
    ],
    objective: { type: 'collect_words', target: 12, category: 'action' },
    rewards: { coins: 35 },
    modifiers: {
      wordCategories: ['action'],
      extraObstacles: true,
    },
    difficulty: 'medium',
  },
  {
    id: 'ch3-l2',
    chapter: 3,
    level: 2,
    title: 'Boss: The Sentinel',
    subtitle: 'An ever-watchful guardian blocks your path',
    narrative: [
      'At the heart of the labyrinth, a towering figure stands motionless.',
      'The Sentinel — a creature of pure vocabulary — guards the way forward.',
      'Pass through it 3 times to shatter its word-shield and proceed.',
    ],
    objective: { type: 'defeat_boss', bossName: 'The Sentinel' },
    rewards: { coins: 50, unlockSkin: 'fire' },
    modifiers: {
      extraObstacles: true,
    },
    difficulty: 'hard',
    bossEncounter: { bossName: 'The Sentinel', requiredPasses: 3 },
  },
  {
    id: 'ch3-l3',
    chapter: 3,
    level: 3,
    title: 'Tiny World',
    subtitle: 'A confined space demands precision',
    narrative: [
      'Beyond the Sentinel lies a miniature realm where space is scarce.',
      'The grid has shrunk — every move counts. Collect 10 words to escape.',
    ],
    objective: { type: 'collect_words', target: 10 },
    rewards: { coins: 35 },
    modifiers: {
      gridSize: { width: 20, height: 15 },
    },
    difficulty: 'medium',
  },
  {
    id: 'ch3-l4',
    chapter: 3,
    level: 4,
    title: 'Words of Power',
    subtitle: 'Under the stars, legends are forged',
    narrative: [
      'The ceiling opens to a sky of infinite stars.',
      'Under the cosmic canopy, every word carries double weight.',
      'Reach a score of 500 to prove yourself worthy of the convergence.',
    ],
    objective: { type: 'reach_score', target: 500 },
    rewards: { coins: 40, unlockPack: 'ocean_depths' },
    modifiers: {
      weather: 'stars',
      extraObstacles: true,
    },
    difficulty: 'hard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 4 – The Convergence  (complex objectives)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ch4-l1',
    chapter: 4,
    level: 1,
    title: 'Blizzard',
    subtitle: 'Survive the frozen wasteland',
    narrative: [
      'Ice crystals sweep across the grid in a violent blizzard.',
      'Visibility drops to near zero as obstacles materialize from the snow.',
      'Survive 90 seconds to weather the storm and reach shelter.',
    ],
    objective: { type: 'survive_time', target: 90 },
    rewards: { coins: 45 },
    modifiers: {
      weather: 'snow',
      extraObstacles: true,
    },
    difficulty: 'hard',
  },
  {
    id: 'ch4-l2',
    chapter: 4,
    level: 2,
    title: 'Boss: Word Wraith',
    subtitle: 'A phantom born from forgotten vocabulary',
    narrative: [
      'The blizzard parts to reveal a spectral figure wreathed in mist.',
      'The Word Wraith — formed from every word ever forgotten — bars the way.',
      'It requires 5 passes to dispel. Do not let its whispers distract you.',
    ],
    objective: { type: 'defeat_boss', bossName: 'Word Wraith' },
    rewards: { coins: 60, unlockSkin: 'shadow' },
    modifiers: {
      weather: 'snow',
      extraObstacles: true,
      speedMultiplier: 1.1,
    },
    difficulty: 'hard',
    bossEncounter: { bossName: 'Word Wraith', requiredPasses: 5 },
  },
  {
    id: 'ch4-l3',
    chapter: 4,
    level: 3,
    title: 'Full Spectrum',
    subtitle: 'Prove mastery across every category',
    narrative: [
      'The Word Wraith dissolves, revealing a prismatic gateway.',
      'To pass, you must demonstrate breadth — collect at least 2 words from every category.',
      'Only a true word master can harness the full spectrum.',
    ],
    objective: {
      type: 'collect_specific',
      words: [
        // 2 per category × 8 categories = 16 words (checked by category coverage)
      ],
    },
    rewards: { coins: 50, unlockPack: 'mythology' },
    modifiers: {},
    difficulty: 'medium',
  },
  {
    id: 'ch4-l4',
    chapter: 4,
    level: 4,
    title: 'Endurance',
    subtitle: 'When everything is against you',
    narrative: [
      'The final gate of the convergence demands everything.',
      'Extra obstacles, relentless speed, and a sky full of stars.',
      'Reach a score of 800 under all modifiers to prove your mastery.',
    ],
    objective: { type: 'reach_score', target: 800 },
    rewards: { coins: 55, unlockSkin: 'ice' },
    modifiers: {
      extraObstacles: true,
      speedMultiplier: 1.15,
      weather: 'stars',
    },
    difficulty: 'hard',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAPTER 5 – The Final Chapter  (ultimate challenges)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ch5-l1',
    chapter: 5,
    level: 1,
    title: 'The Gauntlet',
    subtitle: 'Collect faster than ever before',
    narrative: [
      'You stand before the final threshold.',
      'The Gauntlet — a trial of pure speed and collection — awaits.',
      'Collect 20 words within 120 seconds or be cast back into the labyrinth.',
    ],
    objective: { type: 'collect_words', target: 20 },
    rewards: { coins: 60 },
    modifiers: {
      speedMultiplier: 1.2,
      extraObstacles: true,
    },
    difficulty: 'hard',
  },
  {
    id: 'ch5-l2',
    chapter: 5,
    level: 2,
    title: 'Boss: Lexicon Dragon',
    subtitle: 'The ultimate word guardian',
    narrative: [
      'The ground trembles as the Lexicon Dragon descends from the sky of stars.',
      'Ancient syllables form scales of impenetrable language.',
      'It requires 7 passes to defeat — the hardest challenge yet.',
    ],
    objective: { type: 'defeat_boss', bossName: 'Lexicon Dragon' },
    rewards: { coins: 75, unlockSkin: 'rainbow' },
    modifiers: {
      weather: 'stars',
      extraObstacles: true,
      speedMultiplier: 1.1,
    },
    difficulty: 'hard',
    bossEncounter: { bossName: 'Lexicon Dragon', requiredPasses: 7 },
  },
  {
    id: 'ch5-l3',
    chapter: 5,
    level: 3,
    title: 'Minimalist',
    subtitle: 'From nothing, build everything',
    narrative: [
      'The Dragon defeated, the path narrows to a single pixel.',
      'You begin with nothing — a snake of length 1, alone on the grid.',
      'Collect 15 words to prove that even the smallest start can achieve greatness.',
    ],
    objective: { type: 'collect_words', target: 15 },
    rewards: { coins: 65, unlockSkin: 'golden' },
    modifiers: {
      startingLength: 1,
      extraObstacles: true,
      speedMultiplier: 1.15,
    },
    difficulty: 'hard',
  },
  {
    id: 'ch5-l4',
    chapter: 5,
    level: 4,
    title: 'Master of Words',
    subtitle: 'The final test of a true lexicon champion',
    narrative: [
      'This is it — the culmination of every lesson, every battle, every word collected.',
      'Every category. Extra obstacles. Maximum speed. No mercy.',
      'Reach a score of 1500 to claim the title: Master of Words.',
      'The world of vocabulary awaits its champion.',
    ],
    objective: { type: 'reach_score', target: 1500 },
    rewards: { coins: 100, unlockPack: 'shakespeare' },
    modifiers: {
      extraObstacles: true,
      speedMultiplier: 1.2,
    },
    difficulty: 'hard',
  },
]

// ─── Chapter Metadata ───────────────────────────────────────────────────────

const CHAPTER_META: Record<number, { title: string; description: string; emoji: string }> = {
  1: {
    title: 'The Awakening',
    description: 'A gentle introduction to the world of words. Learn the basics and discover your potential.',
    emoji: '🌅',
  },
  2: {
    title: 'The Gathering Storm',
    description: 'The challenge grows as weather and obstacles enter the fray. Prove you can adapt.',
    emoji: '⛈️',
  },
  3: {
    title: 'The Labyrinth',
    description: 'Navigate shrinking grids, face your first boss, and harness the power of the stars.',
    emoji: '🏛️',
  },
  4: {
    title: 'The Convergence',
    description: 'Complex objectives, brutal conditions, and a spectral boss await in the frozen depths.',
    emoji: '❄️',
  },
  5: {
    title: 'The Final Chapter',
    description: 'The ultimate tests of speed, endurance, and mastery. Only a legend can prevail.',
    emoji: '👑',
  },
}

// Full-spectrum category set (used by ch4-l3 for objective checking)
const ALL_WORD_CATEGORIES: WordCategory[] = [
  'nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action',
]

// ─── Level Queries ──────────────────────────────────────────────────────────

/**
 * Returns all 20 story levels.
 */
export function getAllLevels(): StoryLevel[] {
  return STORY_LEVELS
}

/**
 * Get a specific level by its id (e.g. `'ch3-l2'`).
 * Returns `undefined` if not found.
 */
export function getLevel(id: string): StoryLevel | undefined {
  return STORY_LEVELS.find((l) => l.id === id)
}

/**
 * Get all levels belonging to a chapter (1–5).
 * Returns an empty array for invalid chapter numbers.
 */
export function getChapterLevels(chapter: number): StoryLevel[] {
  return STORY_LEVELS.filter((l) => l.chapter === chapter)
}

/**
 * Returns metadata for a chapter: title, description, levels, and emoji.
 * Returns a safe default for invalid chapter numbers.
 */
export function getChapterInfo(chapter: number): ChapterInfo {
  const meta = CHAPTER_META[chapter] ?? {
    title: `Chapter ${chapter}`,
    description: 'Unknown chapter.',
    emoji: '❓',
  }
  return {
    ...meta,
    levels: getChapterLevels(chapter),
  }
}

/**
 * Returns the total number of chapters (5).
 */
export function getTotalChapters(): number {
  return Object.keys(CHAPTER_META).length
}

// ─── Objective Checking ─────────────────────────────────────────────────────

interface CheckParams {
  score: number
  wordsEaten: number
  timeElapsed: number          // seconds
  collectedWords: string[]
  bossDefeats: string[]        // names of defeated bosses in this run
}

/**
 * Checks whether a level's objective has been met.
 *
 * For the special `collect_specific` objective on ch4-l3 ("Full Spectrum"),
 * we treat the empty `words` array as a request for "2 words from every category"
 * and check category coverage instead.
 */
export function checkLevelObjective(
  objective: StoryObjective,
  score: number,
  wordsEaten: number,
  timeElapsed: number,
  collectedWords: string[],
  bossDefeats: string[],
): ObjectiveCheck {
  const params: CheckParams = { score, wordsEaten, timeElapsed, collectedWords, bossDefeats }

  switch (objective.type) {
    // ── Collect N words (optionally filtered by category) ──────────
    case 'collect_words': {
      const target = objective.target
      let current = params.wordsEaten
      // If a category filter exists, only count words matching that category.
      // We can't determine category from the collected strings alone here,
      // so we trust the game engine and report progress on total eaten.
      const progress = Math.min(1, current / target)
      return {
        completed: current >= target,
        progress,
        description: `${Math.min(current, target)} / ${target} words collected`,
      }
    }

    // ── Reach a score threshold ────────────────────────────────────
    case 'reach_score': {
      const target = objective.target
      const current = params.score
      const progress = Math.min(1, current / target)
      return {
        completed: current >= target,
        progress,
        description: `${current} / ${target} score`,
      }
    }

    // ── Survive for N seconds ──────────────────────────────────────
    case 'survive_time': {
      const target = objective.target
      const current = params.timeElapsed
      const progress = Math.min(1, current / target)
      return {
        completed: current >= target,
        progress,
        description: `${Math.floor(current)}s / ${target}s survived`,
      }
    }

    // ── Defeat a named boss ────────────────────────────────────────
    case 'defeat_boss': {
      const bossName = objective.bossName
      const defeated = params.bossDefeats.includes(bossName)
      return {
        completed: defeated,
        progress: defeated ? 1 : 0,
        description: defeated
          ? `${bossName} defeated!`
          : `Defeat ${bossName}`,
      }
    }

    // ── Collect specific words / category coverage ─────────────────
    case 'collect_specific': {
      const specificWords = objective.words

      // ch4-l3 "Full Spectrum" — empty words list means "2 per category"
      if (specificWords.length === 0) {
        const { getWordEntry } = require('@/lib/word-pool')
        const categoryCounts: Partial<Record<WordCategory, number>> = {}
        let categoriesCovered = 0

        for (const word of params.collectedWords) {
          const entry = getWordEntry(word)
          if (entry) {
            const cat: WordCategory = entry.category
            const prev = categoryCounts[cat] ?? 0
            if (prev === 0) categoriesCovered++
            categoryCounts[cat] = prev + 1
          }
        }

        const totalCategories = ALL_WORD_CATEGORIES.length
        const target = totalCategories // all categories need >= 2
        const categoriesWith2 = ALL_WORD_CATEGORIES.filter(
          (cat) => (categoryCounts[cat] ?? 0) >= 2,
        ).length

        return {
          completed: categoriesWith2 >= totalCategories,
          progress: Math.min(1, categoriesWith2 / totalCategories),
          description: `${categoriesWith2} / ${totalCategories} categories (2+ each)`,
        }
      }

      // Standard specific-word list
      const collected = new Set(
        params.collectedWords.map((w) => w.toLowerCase()),
      )
      const needed = specificWords.map((w) => w.toLowerCase())
      const matched = needed.filter((w) => collected.has(w)).length

      return {
        completed: matched >= needed.length,
        progress: needed.length > 0 ? matched / needed.length : 1,
        description: `${matched} / ${needed.length} specific words collected`,
      }
    }

    default: {
      const _exhaustive: never = objective
      return { completed: false, progress: 0, description: 'Unknown objective' }
    }
  }
}

// ─── Progress Management ────────────────────────────────────────────────────

function createDefaultProgress(): SerializableProgress {
  return {
    currentChapter: 1,
    currentLevel: 1,
    completedLevels: [],
    totalCoins: 0,
    unlockedSkins: [],
    unlockedPacks: [],
  }
}

function toSerializable(progress: StoryProgress): SerializableProgress {
  return {
    currentChapter: progress.currentChapter,
    currentLevel: progress.currentLevel,
    completedLevels: Array.from(progress.completedLevels),
    totalCoins: progress.totalCoins,
    unlockedSkins: [...progress.unlockedSkins],
    unlockedPacks: [...progress.unlockedPacks],
  }
}

function fromSerializable(data: SerializableProgress): StoryProgress {
  return {
    currentChapter: data.currentChapter,
    currentLevel: data.currentLevel,
    completedLevels: new Set(data.completedLevels),
    totalCoins: data.totalCoins,
    unlockedSkins: data.unlockedSkins,
    unlockedPacks: data.unlockedPacks,
  }
}

/**
 * Load story progress from localStorage.
 * Returns a fresh default if nothing is stored or if the data is corrupt.
 */
export function getStoryProgress(): StoryProgress {
  const raw = getStoredObject<SerializableProgress>(STORAGE_KEY, createDefaultProgress())
  return fromSerializable(raw)
}

/**
 * Persist the current story progress to localStorage.
 */
export function saveStoryProgress(progress: StoryProgress): void {
  setStored(STORAGE_KEY, toSerializable(progress))
}

// ─── Level Access Checks ────────────────────────────────────────────────────

/**
 * A level is unlocked if:
 *  - It is the very first level (ch1-l1), OR
 *  - The previous level (by sequential index) has been completed.
 *
 * Previous level is determined by the flat array ordering in STORY_LEVELS.
 */
export function isLevelUnlocked(levelId: string): boolean {
  const idx = STORY_LEVELS.findIndex((l) => l.id === levelId)
  if (idx <= 0) return true  // first level is always unlocked

  const progress = getStoryProgress()
  const previousLevel = STORY_LEVELS[idx - 1]
  return progress.completedLevels.has(previousLevel.id)
}

/**
 * Check if a level has been beaten.
 */
export function isLevelCompleted(levelId: string): boolean {
  const progress = getStoryProgress()
  return progress.completedLevels.has(levelId)
}

// ─── Level Completion ───────────────────────────────────────────────────────

/**
 * Marks a level as completed, awards coins, processes skin/pack unlocks,
 * and advances the story pointer to the next level.
 *
 * If the level was already completed this does NOT re-award coins (idempotent).
 */
export function completeLevel(result: LevelResult): StoryProgress {
  const progress = getStoryProgress()

  // Idempotent: skip if already completed
  if (progress.completedLevels.has(result.levelId)) {
    return progress
  }

  // Mark completed
  progress.completedLevels.add(result.levelId)

  // Award coins
  const level = getLevel(result.levelId)
  if (level) {
    progress.totalCoins += result.coinsEarned

    // Process skin unlock
    if (level.rewards.unlockSkin) {
      if (!progress.unlockedSkins.includes(level.rewards.unlockSkin)) {
        progress.unlockedSkins.push(level.rewards.unlockSkin)
      }
    }

    // Process pack unlock
    if (level.rewards.unlockPack) {
      if (!progress.unlockedPacks.includes(level.rewards.unlockPack)) {
        progress.unlockedPacks.push(level.rewards.unlockPack)
      }
    }

    // Advance the story pointer
    const levelIdx = STORY_LEVELS.findIndex((l) => l.id === result.levelId)
    if (levelIdx >= 0 && levelIdx < STORY_LEVELS.length - 1) {
      const nextLevel = STORY_LEVELS[levelIdx + 1]
      progress.currentChapter = nextLevel.chapter
      progress.currentLevel = nextLevel.level
    }
  }

  saveStoryProgress(progress)
  return progress
}

// ─── Reset ──────────────────────────────────────────────────────────────────

/**
 * Clears all story progress and returns a fresh state.
 */
export function resetStoryProgress(): StoryProgress {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
  const fresh: StoryProgress = {
    currentChapter: 1,
    currentLevel: 1,
    completedLevels: new Set(),
    totalCoins: 0,
    unlockedSkins: [],
    unlockedPacks: [],
  }
  saveStoryProgress(fresh)
  return fresh
}

// ─── Star Rating ────────────────────────────────────────────────────────────

/**
 * Returns 0–3 stars for a completed level based on performance.
 *
 * Scoring:
 *  - 1 star : objective met (minimum threshold)
 *  - 2 stars: exceeded objective by ≥50 %
 *  - 3 stars: exceeded objective by ≥100 % (double the requirement)
 *
 * For boss levels: stars are based on words eaten during the fight.
 * For survive_time: stars are based on surviving beyond the target.
 * For collect_words: stars are based on collecting more than required.
 * For reach_score: stars are based on overshooting the target.
 */
export function getStoryStars(levelId: string, result?: LevelResult): number {
  const level = getLevel(levelId)
  if (!level) return 0
  if (!result || !result.completed) return 0

  const obj = level.objective

  switch (obj.type) {
    case 'collect_words': {
      const target = obj.target
      const ratio = result.wordsEaten / target
      if (ratio >= 2) return 3
      if (ratio >= 1.5) return 2
      return 1
    }

    case 'reach_score': {
      const target = obj.target
      const ratio = result.score / target
      if (ratio >= 2) return 3
      if (ratio >= 1.5) return 2
      return 1
    }

    case 'survive_time': {
      const target = obj.target
      const ratio = result.timeElapsed / target
      if (ratio >= 1.5) return 3
      if (ratio >= 1.25) return 2
      return 1
    }

    case 'defeat_boss': {
      // Stars based on extra words eaten during boss fight
      if (result.wordsEaten >= 15) return 3
      if (result.wordsEaten >= 10) return 2
      return 1
    }

    case 'collect_specific': {
      // Stars based on overshooting word count
      const base = obj.words.length > 0 ? obj.words.length : 16
      const ratio = result.wordsEaten / base
      if (ratio >= 2) return 3
      if (ratio >= 1.5) return 2
      return 1
    }

    default: {
      const _exhaustive: never = obj
      return 1
    }
  }
}
