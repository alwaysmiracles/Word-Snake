// Story Mode Wire – Pure logic module that bridges story-mode-levels into the game loop
// No React dependencies. All state is managed internally + persisted via localStorage.
import type {
  StoryLevel,
  StoryProgress,
  LevelResult,
  ObjectiveCheck,
  StoryObjective,
} from '@/lib/story-mode-levels'
import {
  STORY_LEVELS,
  getLevel,
  getAllLevels,
  getChapterLevels,
  getChapterInfo,
  getTotalChapters,
  isLevelUnlocked,
  isLevelCompleted,
  getStoryProgress,
  saveStoryProgress,
  completeLevel as completeLevelInLib,
  checkLevelObjective,
  getStoryStars,
} from '@/lib/story-mode-levels'

// ─── Display / Result Types ────────────────────────────────────────────────

export interface LevelStartResult {
  level: StoryLevel
  objectiveDescription: string
  gameStateOverrides: Record<string, unknown>
}

export interface LevelEndResult {
  completed: boolean
  objectiveCheck: ObjectiveCheck
  coinsEarned: number
  newUnlocks: string[]
  starsAwarded: number
  nextLevelId: string | null
}

export interface StoryProgressData {
  totalCoins: number
  completedLevels: number
  totalLevels: number
  currentChapter: number
  totalChapters: number
  overallProgress: number
  unlockedSkins: string[]
  unlockedPacks: string[]
}

export interface ChapterDisplayData {
  chapter: number
  title: string
  description: string
  emoji: string
  totalLevels: number
  completedLevels: number
  isUnlocked: boolean
  progressPercent: number
  levels: LevelDisplayData[]
}

export interface LevelDisplayData {
  id: string
  title: string
  subtitle: string
  difficulty: string
  isCompleted: boolean
  isUnlocked: boolean
  stars: number
  objectivePreview: string
}

// ─── Wire Settings (persisted separately from core story progress) ─────────

const WIRE_STORAGE_KEY = 'ws_story_mode_wire'

interface WireSettings {
  narrativeSpeed: 'slow' | 'normal' | 'fast'
  autoAdvance: boolean
}

interface LevelBestScore {
  score: number
  wordsEaten: number
  timeElapsed: number
  stars: number
  completed: boolean
}

interface SessionStats {
  totalSessions: number
  attemptsByLevel: Record<string, number>
  completionsByLevel: Record<string, number>
}

interface WirePersistedData {
  settings: WireSettings
  bestScores: Record<string, LevelBestScore>
  sessionStats: SessionStats
}

function getDefaultWireData(): WirePersistedData {
  return {
    settings: {
      narrativeSpeed: 'normal',
      autoAdvance: true,
    },
    bestScores: {},
    sessionStats: {
      totalSessions: 0,
      attemptsByLevel: {},
      completionsByLevel: {},
    },
  }
}

// ─── localStorage helpers (SSR-safe) ──────────────────────────────────────

function loadWireData(): WirePersistedData {
  if (typeof window === 'undefined') return getDefaultWireData()
  try {
    const raw = localStorage.getItem(WIRE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WirePersistedData>
      const defaults = getDefaultWireData()
      return {
        settings: { ...defaults.settings, ...parsed.settings },
        bestScores: { ...defaults.bestScores, ...parsed.bestScores },
        sessionStats: {
          ...defaults.sessionStats,
          attemptsByLevel: { ...defaults.sessionStats.attemptsByLevel, ...parsed.sessionStats?.attemptsByLevel },
          completionsByLevel: { ...defaults.sessionStats.completionsByLevel, ...parsed.sessionStats?.completionsByLevel },
          totalSessions: parsed.sessionStats?.totalSessions ?? 0,
        },
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  return getDefaultWireData()
}

function persistWireData(data: WirePersistedData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WIRE_STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota errors */
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Build a short human-readable preview string for a level's objective.
 */
function buildObjectivePreview(objective: StoryObjective): string {
  switch (objective.type) {
    case 'collect_words': {
      const cat = objective.category ? ` ${objective.category}` : ''
      return `Collect ${objective.target}${cat} words`
    }
    case 'reach_score':
      return `Reach score of ${objective.target}`
    case 'survive_time':
      return `Survive ${objective.target}s`
    case 'defeat_boss':
      return `Defeat ${objective.bossName}`
    case 'collect_specific': {
      if (objective.words.length === 0) {
        return 'Collect from all categories'
      }
      return `Collect ${objective.words.length} specific words`
    }
    default: {
      const _exhaustive: never = objective
      return 'Unknown objective'
    }
  }
}

/**
 * Build a human-readable objective description with context of current progress.
 */
function buildObjectiveDescription(objective: StoryObjective): string {
  switch (objective.type) {
    case 'collect_words': {
      const cat = objective.category ? ` ${objective.category}` : ''
      return `Collect ${objective.target}${cat} word${objective.target > 1 ? 's' : ''}`
    }
    case 'reach_score':
      return `Reach a score of ${objective.target}`
    case 'survive_time':
      return `Survive for ${objective.target} seconds`
    case 'defeat_boss':
      return `Defeat the boss: ${objective.bossName}`
    case 'collect_specific': {
      if (objective.words.length === 0) {
        return 'Collect at least 2 words from every category'
      }
      return `Collect all ${objective.words.length} target words`
    }
    default: {
      const _exhaustive: never = objective
      return 'Complete the objective'
    }
  }
}

/**
 * Find the next level ID after the given one, or null if it was the last.
 */
function findNextLevelId(currentLevelId: string): string | null {
  const idx = STORY_LEVELS.findIndex((l) => l.id === currentLevelId)
  if (idx < 0 || idx >= STORY_LEVELS.length - 1) return null
  return STORY_LEVELS[idx + 1].id
}

/**
 * Compute 0-3 stars for a completed level run using score-based thresholds.
 * 1 = completed, 2 = 1.5x target, 3 = 2x target (adjusted per objective type).
 */
function computeStars(level: StoryLevel, score: number, wordsEaten: number, timeElapsed: number): number {
  const obj = level.objective

  switch (obj.type) {
    case 'collect_words': {
      const ratio = wordsEaten / obj.target
      if (ratio >= 2) return 3
      if (ratio >= 1.5) return 2
      return 1
    }
    case 'reach_score': {
      const ratio = score / obj.target
      if (ratio >= 2) return 3
      if (ratio >= 1.5) return 2
      return 1
    }
    case 'survive_time': {
      const ratio = timeElapsed / obj.target
      if (ratio >= 1.5) return 3
      if (ratio >= 1.25) return 2
      return 1
    }
    case 'defeat_boss': {
      if (wordsEaten >= 15) return 3
      if (wordsEaten >= 10) return 2
      return 1
    }
    case 'collect_specific': {
      const base = obj.words.length > 0 ? obj.words.length : 16
      const ratio = wordsEaten / base
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

// ─── StoryModeWire Implementation ──────────────────────────────────────────

interface ActiveSession {
  level: StoryLevel
  collectedWords: string[]
  bossDefeats: string[]
}

export interface StoryModeWire {
  // Level management
  startLevel(levelId: string): LevelStartResult
  endLevel(score: number, wordsEaten: number, elapsedTime: number): LevelEndResult
  getCurrentLevel(): StoryLevel | null
  getCurrentObjective(): ObjectiveCheck | null
  isActive(): boolean

  // Progress
  getProgress(): StoryProgressData
  getChapterList(): ChapterDisplayData[]
  isLevelPlayable(levelId: string): boolean

  // Game loop integration
  applyLevelModifiers(gameState: Record<string, unknown>): void
  checkObjectiveProgress(score: number, wordsEaten: number, elapsedTime: number): ObjectiveCheck

  // Narrative
  getNarrativeTexts(): string[]
  getLevelTitle(): string
  getLevelSubtitle(): string

  // Stats
  getTotalCoins(): number
  getCompletedCount(): number
  getCurrentChapter(): number
  getStarsForLevel(levelId: string): number
  getOverallProgress(): number

  // Settings
  setNarrativeSpeed(speed: 'slow' | 'normal' | 'fast'): void
  setAutoAdvance(enabled: boolean): void
}

export function createStoryModeWire(): StoryModeWire {
  // ── Internal mutable state ───────────────────────────────────────────
  let wireData = loadWireData()
  let activeSession: ActiveSession | null = null

  // ── Helpers (closures over wireData / activeSession) ─────────────────

  function flushWireData(): void {
    persistWireData(wireData)
  }

  function incrementAttempts(levelId: string): void {
    wireData.sessionStats.attemptsByLevel[levelId] =
      (wireData.sessionStats.attemptsByLevel[levelId] ?? 0) + 1
    wireData.sessionStats.totalSessions += 1
  }

  function incrementCompletions(levelId: string): void {
    wireData.sessionStats.completionsByLevel[levelId] =
      (wireData.sessionStats.completionsByLevel[levelId] ?? 0) + 1
  }

  function updateBestScore(levelId: string, score: number, wordsEaten: number, timeElapsed: number, stars: number, completed: boolean): void {
    const prev = wireData.bestScores[levelId]
    // Keep the best score; if not completed before, always update
    if (!prev || score > prev.score) {
      wireData.bestScores[levelId] = { score, wordsEaten, timeElapsed, stars, completed }
    } else if (completed && !prev.completed) {
      // First completion — update even if score isn't higher
      wireData.bestScores[levelId] = { score, wordsEaten, timeElapsed, stars, completed }
    } else if (completed && prev.completed && stars > prev.stars) {
      // Better star rating on a subsequent completion
      wireData.bestScores[levelId] = { score, wordsEaten, timeElapsed, stars, completed }
    }
  }

  // ── Build game-state overrides from a level's modifiers ──────────────

  function buildGameStateOverrides(level: StoryLevel): Record<string, unknown> {
    const m = level.modifiers
    const overrides: Record<string, unknown> = {}

    if (m.speedMultiplier !== undefined) {
      overrides.speedMultiplier = m.speedMultiplier
    }
    if (m.wordCategories !== undefined && m.wordCategories.length > 0) {
      overrides.wordCategories = [...m.wordCategories]
    }
    if (m.disableObstacles !== undefined) {
      overrides.disableObstacles = m.disableObstacles
    }
    if (m.extraObstacles !== undefined) {
      overrides.extraObstacles = m.extraObstacles
    }
    if (m.weather !== undefined) {
      overrides.weather = m.weather
    }
    if (m.gridSize !== undefined) {
      overrides.gridSize = { ...m.gridSize }
    }
    if (m.startingLength !== undefined) {
      overrides.startingLength = m.startingLength
    }

    // If the level has a boss encounter, add boss metadata
    if (level.bossEncounter) {
      overrides.bossEncounter = { ...level.bossEncounter }
    }

    return overrides
  }

  // ── The returned wire object ─────────────────────────────────────────

  const wire: StoryModeWire = {

    // ════════════════════════════════════════════════════════════════════
    // Level management
    // ════════════════════════════════════════════════════════════════════

    startLevel(levelId: string): LevelStartResult {
      const level = getLevel(levelId)
      if (!level) {
        throw new Error(`[StoryModeWire] Unknown level id: "${levelId}"`)
      }

      // Track attempt
      incrementAttempts(levelId)

      // Activate the session
      activeSession = {
        level,
        collectedWords: [],
        bossDefeats: [],
      }

      return {
        level,
        objectiveDescription: buildObjectiveDescription(level.objective),
        gameStateOverrides: buildGameStateOverrides(level),
      }
    },

    endLevel(score: number, wordsEaten: number, elapsedTime: number): LevelEndResult {
      if (!activeSession) {
        throw new Error('[StoryModeWire] No active level session. Call startLevel() first.')
      }

      const level = activeSession.level
      const { collectedWords, bossDefeats } = activeSession

      // Run the library's objective checker
      const objectiveCheck: ObjectiveCheck = checkLevelObjective(
        level.objective,
        score,
        wordsEaten,
        elapsedTime,
        collectedWords,
        bossDefeats,
      )

      const completed = objectiveCheck.completed
      const newUnlocks: string[] = []
      let coinsEarned = 0
      let starsAwarded = 0

      if (completed) {
        starsAwarded = computeStars(level, score, wordsEaten, elapsedTime)
        coinsEarned = level.rewards.coins

        // Gather new unlocks before calling completeLevel
        const prevProgress = getStoryProgress()
        const prevSkins = new Set(prevProgress.unlockedSkins)
        const prevPacks = new Set(prevProgress.unlockedPacks)

        // Persist completion through the library
        const result: LevelResult = {
          levelId: level.id,
          completed: true,
          score,
          wordsEaten,
          coinsEarned,
          timeElapsed: elapsedTime,
        }
        completeLevelInLib(result)

        // Compare post-completion state to find new unlocks
        const postProgress = getStoryProgress()
        for (const skin of postProgress.unlockedSkins) {
          if (!prevSkins.has(skin)) newUnlocks.push(`skin:${skin}`)
        }
        for (const pack of postProgress.unlockedPacks) {
          if (!prevPacks.has(pack)) newUnlocks.push(`pack:${pack}`)
        }

        incrementCompletions(level.id)
      }

      // Update best score
      updateBestScore(level.id, score, wordsEaten, elapsedTime, starsAwarded, completed)
      flushWireData()

      // Clear session
      activeSession = null

      return {
        completed,
        objectiveCheck,
        coinsEarned,
        newUnlocks,
        starsAwarded,
        nextLevelId: completed ? findNextLevelId(level.id) : null,
      }
    },

    getCurrentLevel(): StoryLevel | null {
      return activeSession?.level ?? null
    },

    getCurrentObjective(): ObjectiveCheck | null {
      if (!activeSession) return null
      // Return a fresh check — callers usually use checkObjectiveProgress instead.
      // Here we just check against zero values to see if objective is still pending.
      return checkLevelObjective(
        activeSession.level.objective,
        0, 0, 0,
        activeSession.collectedWords,
        activeSession.bossDefeats,
      )
    },

    isActive(): boolean {
      return activeSession !== null
    },

    // ════════════════════════════════════════════════════════════════════
    // Progress
    // ════════════════════════════════════════════════════════════════════

    getProgress(): StoryProgressData {
      const progress = getStoryProgress()
      const completedCount = progress.completedLevels.size
      const totalLevels = STORY_LEVELS.length
      const totalChapters = getTotalChapters()
      const overallProgress = totalLevels > 0 ? (completedCount / totalLevels) * 100 : 0

      return {
        totalCoins: progress.totalCoins,
        completedLevels: completedCount,
        totalLevels,
        currentChapter: progress.currentChapter,
        totalChapters,
        overallProgress: Math.round(overallProgress * 100) / 100,
        unlockedSkins: [...progress.unlockedSkins],
        unlockedPacks: [...progress.unlockedPacks],
      }
    },

    getChapterList(): ChapterDisplayData[] {
      const totalChapters = getTotalChapters()
      const progress = getStoryProgress()
      const chapters: ChapterDisplayData[] = []

      for (let ch = 1; ch <= totalChapters; ch++) {
        const info = getChapterInfo(ch)
        const levels = getChapterLevels(ch)

        // A chapter is unlocked if any of its levels are unlocked
        const chapterIsUnlocked = levels.length > 0 && isLevelUnlocked(levels[0].id)

        let completedInChapter = 0
        const levelDisplays: LevelDisplayData[] = []

        for (const lvl of levels) {
          const lvlCompleted = progress.completedLevels.has(lvl.id)
          const lvlUnlocked = isLevelUnlocked(lvl.id)
          const bestScore = wireData.bestScores[lvl.id]
          const stars = bestScore?.stars ?? (lvlCompleted ? 1 : 0)

          if (lvlCompleted) completedInChapter++

          levelDisplays.push({
            id: lvl.id,
            title: lvl.title,
            subtitle: lvl.subtitle,
            difficulty: lvl.difficulty,
            isCompleted: lvlCompleted,
            isUnlocked: lvlUnlocked,
            stars,
            objectivePreview: buildObjectivePreview(lvl.objective),
          })
        }

        const progressPercent =
          levels.length > 0 ? (completedInChapter / levels.length) * 100 : 0

        chapters.push({
          chapter: ch,
          title: info.title,
          description: info.description,
          emoji: info.emoji,
          totalLevels: levels.length,
          completedLevels: completedInChapter,
          isUnlocked: chapterIsUnlocked,
          progressPercent: Math.round(progressPercent * 100) / 100,
          levels: levelDisplays,
        })
      }

      return chapters
    },

    isLevelPlayable(levelId: string): boolean {
      if (activeSession) return false
      return isLevelUnlocked(levelId)
    },

    // ════════════════════════════════════════════════════════════════════
    // Game loop integration
    // ════════════════════════════════════════════════════════════════════

    applyLevelModifiers(gameState: Record<string, unknown>): void {
      if (!activeSession) return

      const m = activeSession.level.modifiers
      if (m.speedMultiplier !== undefined) {
        gameState.speedMultiplier = m.speedMultiplier
      }
      if (m.wordCategories !== undefined && m.wordCategories.length > 0) {
        gameState.wordCategories = [...m.wordCategories]
      }
      if (m.disableObstacles !== undefined) {
        gameState.disableObstacles = m.disableObstacles
      }
      if (m.extraObstacles !== undefined) {
        gameState.extraObstacles = m.extraObstacles
      }
      if (m.weather !== undefined) {
        gameState.weather = m.weather
      }
      if (m.gridSize !== undefined) {
        gameState.gridSize = { ...m.gridSize }
      }
      if (m.startingLength !== undefined) {
        gameState.startingLength = m.startingLength
      }

      // Boss encounter data
      if (activeSession.level.bossEncounter) {
        gameState.bossEncounter = { ...activeSession.level.bossEncounter }
      }
    },

    checkObjectiveProgress(score: number, wordsEaten: number, elapsedTime: number): ObjectiveCheck {
      if (!activeSession) {
        return { completed: false, progress: 0, description: 'No active level' }
      }

      return checkLevelObjective(
        activeSession.level.objective,
        score,
        wordsEaten,
        elapsedTime,
        activeSession.collectedWords,
        activeSession.bossDefeats,
      )
    },

    // ════════════════════════════════════════════════════════════════════
    // Narrative
    // ════════════════════════════════════════════════════════════════════

    getNarrativeTexts(): string[] {
      if (!activeSession) return []
      return [...activeSession.level.narrative]
    },

    getLevelTitle(): string {
      if (!activeSession) return ''
      return activeSession.level.title
    },

    getLevelSubtitle(): string {
      if (!activeSession) return ''
      return activeSession.level.subtitle
    },

    // ════════════════════════════════════════════════════════════════════
    // Stats
    // ════════════════════════════════════════════════════════════════════

    getTotalCoins(): number {
      return getStoryProgress().totalCoins
    },

    getCompletedCount(): number {
      return getStoryProgress().completedLevels.size
    },

    getCurrentChapter(): number {
      return getStoryProgress().currentChapter
    },

    getStarsForLevel(levelId: string): number {
      const best = wireData.bestScores[levelId]
      if (best?.stars !== undefined) return best.stars
      // Fall back to library if the level is completed but we have no local record
      if (isLevelCompleted(levelId)) {
        return 1
      }
      return 0
    },

    getOverallProgress(): number {
      const progress = getStoryProgress()
      const total = STORY_LEVELS.length
      if (total === 0) return 0
      return Math.round((progress.completedLevels.size / total) * 10000) / 100 // 0-100 with 2 decimals
    },

    // ════════════════════════════════════════════════════════════════════
    // Settings
    // ════════════════════════════════════════════════════════════════════

    setNarrativeSpeed(speed: 'slow' | 'normal' | 'fast'): void {
      wireData.settings.narrativeSpeed = speed
      flushWireData()
    },

    setAutoAdvance(enabled: boolean): void {
      wireData.settings.autoAdvance = enabled
      flushWireData()
    },
  }

  return wire
}
