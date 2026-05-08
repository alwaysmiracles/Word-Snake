// ─── Canvas Share Connector ───────────────────────────────────────────────────
// Bridges the ASCII-based social-share system with the canvas-share-renderer so
// users can generate and download high-quality PNG share images.  Pure logic
// module — no React, no external dependencies.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CanvasShareRenderer,
  GameResultData,
  AchievementData,
  StreakData,
  CollectionData,
  BattlePassData,
} from '@/lib/canvas-share-renderer'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Share data for a finished game round. */
export interface GameShareData {
  score: number
  wordsEaten: number
  combo: number
  mode: string
  rating: string
  time: number
  playerName?: string
}

/** Share data for an unlocked achievement. */
export interface AchievementShareData {
  name: string
  description: string
  emoji: string
  rarity: string
  unlockedAt: string
}

/** Share data for a daily streak snapshot. */
export interface StreakShareData {
  currentStreak: number
  bestStreak: number
  totalDays: number
}

/** Share data for a word-collection album snapshot. */
export interface CollectionShareData {
  completed: number
  total: number
  rarestWord: string
  categories: string[]
}

/** Share data for a battle-pass season snapshot. */
export interface BattlePassShareData {
  seasonName: string
  currentTier: number
  maxTier: number
  xpProgress: number
}

/** Persisted statistics about canvas card usage. */
export interface ConnectorStats {
  totalGenerated: number
  totalDownloaded: number
  byType: Record<string, number>
  lastGeneratedAt: string | null
}

/** recognised card types for the connector. */
export type CardType = 'game_result' | 'achievement' | 'streak' | 'collection' | 'battle_pass'

/** Result of a batch card generation. */
export interface BatchCardResult {
  type: CardType
  dataURL: string
  filename: string
}

/** Opaque handle returned by the factory — the public API surface. */
export interface CanvasShareConnector {
  // ── One-click generation + download ─────────────────────────
  generateAndDownloadGameResult(
    renderer: CanvasShareRenderer,
    data: GameShareData,
    filename?: string,
  ): string | null
  generateAndDownloadAchievement(
    renderer: CanvasShareRenderer,
    data: AchievementShareData,
    filename?: string,
  ): string | null
  generateAndDownloadStreak(
    renderer: CanvasShareRenderer,
    data: StreakShareData,
    filename?: string,
  ): string | null
  generateAndDownloadCollection(
    renderer: CanvasShareRenderer,
    data: CollectionShareData,
    filename?: string,
  ): string | null
  generateAndDownloadBattlePass(
    renderer: CanvasShareRenderer,
    data: BattlePassShareData,
    filename?: string,
  ): string | null

  // ── Preview ─────────────────────────────────────────────────
  getPreviewDataURL(
    renderer: CanvasShareRenderer,
    type: string,
    data: Record<string, unknown>,
  ): string

  // ── Batch operations ────────────────────────────────────────
  generateAllCards(
    renderer: CanvasShareRenderer,
    gameData: GameShareData & {
      achievement?: AchievementShareData
      streak?: StreakShareData
      collection?: CollectionShareData
      battlePass?: BattlePassShareData
    },
  ): BatchCardResult[]
  downloadAllCards(
    renderer: CanvasShareRenderer,
    gameData: GameShareData & {
      achievement?: AchievementShareData
      streak?: StreakShareData
      collection?: CollectionShareData
      battlePass?: BattlePassShareData
    },
  ): void

  // ── Stats ───────────────────────────────────────────────────
  getStats(): ConnectorStats
  resetStats(): void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_canvas_share_connector'

/** Default values when no stats have been persisted yet. */
const EMPTY_STATS: ConnectorStats = {
  totalGenerated: 0,
  totalDownloaded: 0,
  byType: {},
  lastGeneratedAt: null,
}

/** Fallback filenames per card type when the caller doesn't supply one. */
const DEFAULT_FILENAMES: Record<CardType, string> = {
  game_result: 'word-snake-result.png',
  achievement: 'word-snake-achievement.png',
  streak: 'word-snake-streak.png',
  collection: 'word-snake-collection.png',
  battle_pass: 'word-snake-battlepass.png',
}

/** Delay (ms) between sequential downloads so the browser doesn't swallow them. */
const DOWNLOAD_STAGGER_MS = 350

// ─── LocalStorage helpers ────────────────────────────────────────────────────

/** Read persisted stats. Returns a fresh copy on any parse failure. */
function loadStats(): ConnectorStats {
  if (typeof window === 'undefined') return { ...EMPTY_STATS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY_STATS }
    const parsed = JSON.parse(raw) as Partial<ConnectorStats>
    return {
      totalGenerated: typeof parsed.totalGenerated === 'number' ? parsed.totalGenerated : 0,
      totalDownloaded: typeof parsed.totalDownloaded === 'number' ? parsed.totalDownloaded : 0,
      byType: (parsed.byType && typeof parsed.byType === 'object') ? { ...parsed.byType } : {},
      lastGeneratedAt: typeof parsed.lastGeneratedAt === 'string' ? parsed.lastGeneratedAt : null,
    }
  } catch {
    return { ...EMPTY_STATS }
  }
}

/** Persist stats to localStorage. Silently ignores quota errors. */
function saveStats(stats: ConnectorStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // quota exceeded — nothing to do
  }
}

// ─── Card Data Builders ──────────────────────────────────────────────────────

/**
 * Collect game state from various subsystems and produce a `GameShareData`
 * object suitable for the canvas renderer.
 *
 * @example
 * ```ts
 * const data = buildGameResultData({
 *   score: 4200,
 *   wordsEaten: 38,
 *   combo: 7,
 *   mode: 'Classic',
 *   rating: 'A',
 *   time: 185,
 *   playerName: 'Alice',
 * })
 * ```
 */
export function buildGameResultData(partial: Partial<GameShareData> & {
  score?: number
  wordsEaten?: number
  combo?: number
  mode?: string
  rating?: string
  time?: number
}): GameShareData {
  return {
    score: partial.score ?? 0,
    wordsEaten: partial.wordsEaten ?? 0,
    combo: partial.combo ?? 0,
    mode: partial.mode ?? 'Classic',
    rating: partial.rating ?? 'B',
    time: partial.time ?? 0,
    playerName: partial.playerName,
  }
}

/**
 * Format an achievement record into `AchievementShareData` for the canvas card.
 * Defaults sensible fallback values for missing fields.
 */
export function buildAchievementData(achievement: {
  name?: string
  description?: string
  emoji?: string
  rarity?: string
  unlockedAt?: string
}): AchievementShareData {
  return {
    name: achievement.name ?? 'Unknown Achievement',
    description: achievement.description ?? '',
    emoji: achievement.emoji ?? '🏅',
    rarity: achievement.rarity ?? 'common',
    unlockedAt: achievement.unlockedAt ?? new Date().toISOString(),
  }
}

/**
 * Format streak data into `StreakShareData` for the canvas card.
 */
export function buildStreakData(streak: {
  currentStreak?: number
  bestStreak?: number
  totalDays?: number
}): StreakShareData {
  return {
    currentStreak: streak.currentStreak ?? 0,
    bestStreak: streak.bestStreak ?? 0,
    totalDays: streak.totalDays ?? 0,
  }
}

/**
 * Format word-collection album data into `CollectionShareData` for the canvas card.
 */
export function buildCollectionData(album: {
  completed?: number
  total?: number
  rarestWord?: string
  categories?: string[]
}): CollectionShareData {
  return {
    completed: album.completed ?? 0,
    total: album.total ?? 0,
    rarestWord: album.rarestWord ?? '—',
    categories: album.categories ?? [],
  }
}

/**
 * Format battle-pass season data into `BattlePassShareData` for the canvas card.
 */
export function buildBattlePassData(pass: {
  seasonName?: string
  currentTier?: number
  maxTier?: number
  xpProgress?: number
}): BattlePassShareData {
  return {
    seasonName: pass.seasonName ?? 'Season 1',
    currentTier: pass.currentTier ?? 1,
    maxTier: pass.maxTier ?? 25,
    xpProgress: Math.max(0, Math.min(pass.xpProgress ?? 0, 100)),
  }
}

// ─── Internal rendering helpers ──────────────────────────────────────────────

/** Record a generation event and bump the counter for the given card type. */
function recordGeneration(cardType: string): ConnectorStats {
  const stats = loadStats()
  stats.totalGenerated++
  stats.byType[cardType] = (stats.byType[cardType] ?? 0) + 1
  stats.lastGeneratedAt = new Date().toISOString()
  saveStats(stats)
  return stats
}

/** Bump the download counter and persist. */
function recordDownload(): void {
  const stats = loadStats()
  stats.totalDownloaded++
  saveStats(stats)
}

/**
 * Normalise rarity strings to the limited set the canvas renderer expects.
 * The renderer only accepts: `'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'`.
 */
function normaliseRarity(rarity: string): AchievementData['rarity'] {
  const lower = rarity.toLowerCase()
  if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(lower)) {
    return lower as AchievementData['rarity']
  }
  // Map common alternative labels
  if (lower === 'common') return 'common'
  if (lower === 'bronze') return 'uncommon'
  if (lower === 'silver') return 'rare'
  if (lower === 'gold') return 'rare'
  if (lower === 'mythic') return 'legendary'
  return 'common'
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a `CanvasShareConnector` instance.
 *
 * The connector provides one-click render-and-download helpers, preview data URLs,
 * batch generation for gallery views, and usage statistics persisted to localStorage.
 *
 * @example
 * ```ts
 * const connector = createCanvasShareConnector()
 * const renderer  = createCanvasShareRenderer()
 *
 * connector.generateAndDownloadGameResult(renderer, {
 *   score: 4200,
 *   wordsEaten: 38,
 *   combo: 7,
 *   mode: 'Classic',
 *   rating: 'A',
 *   time: 185,
 *   playerName: 'Alice',
 * })
 * ```
 */
export function createCanvasShareConnector(): CanvasShareConnector {
  // ── One-click generation + download ──────────────────────────────

  /**
   * Render a game result card and immediately trigger a PNG download.
   * @returns The data URL of the rendered card, or `null` if rendering failed.
   */
  function generateAndDownloadGameResult(
    renderer: CanvasShareRenderer,
    data: GameShareData,
    filename?: string,
  ): string | null {
    const canvasData: GameResultData = {
      score: data.score,
      wordsEaten: data.wordsEaten,
      combo: data.combo,
      mode: data.mode,
      rating: data.rating,
      time: data.time,
      playerName: data.playerName,
    }
    const dataURL = renderer.renderGameResultCard(canvasData)
    if (!dataURL) return null

    recordGeneration('game_result')
    renderer.downloadCard(dataURL, filename ?? DEFAULT_FILENAMES.game_result)
    recordDownload()
    return dataURL
  }

  /**
   * Render an achievement card and immediately trigger a PNG download.
   * @returns The data URL of the rendered card, or `null` if rendering failed.
   */
  function generateAndDownloadAchievement(
    renderer: CanvasShareRenderer,
    data: AchievementShareData,
    filename?: string,
  ): string | null {
    const canvasData: AchievementData = {
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      rarity: normaliseRarity(data.rarity),
      unlockedAt: data.unlockedAt,
    }
    const dataURL = renderer.renderAchievementCard(canvasData)
    if (!dataURL) return null

    recordGeneration('achievement')
    renderer.downloadCard(dataURL, filename ?? DEFAULT_FILENAMES.achievement)
    recordDownload()
    return dataURL
  }

  /**
   * Render a streak card and immediately trigger a PNG download.
   * @returns The data URL of the rendered card, or `null` if rendering failed.
   */
  function generateAndDownloadStreak(
    renderer: CanvasShareRenderer,
    data: StreakShareData,
    filename?: string,
  ): string | null {
    const canvasData: StreakData = {
      currentStreak: data.currentStreak,
      bestStreak: data.bestStreak,
      totalDays: data.totalDays,
    }
    const dataURL = renderer.renderStreakCard(canvasData)
    if (!dataURL) return null

    recordGeneration('streak')
    renderer.downloadCard(dataURL, filename ?? DEFAULT_FILENAMES.streak)
    recordDownload()
    return dataURL
  }

  /**
   * Render a collection card and immediately trigger a PNG download.
   * @returns The data URL of the rendered card, or `null` if rendering failed.
   */
  function generateAndDownloadCollection(
    renderer: CanvasShareRenderer,
    data: CollectionShareData,
    filename?: string,
  ): string | null {
    const canvasData: CollectionData = {
      completed: data.completed,
      total: data.total,
      rarestWord: data.rarestWord,
      categories: data.categories,
    }
    const dataURL = renderer.renderCollectionCard(canvasData)
    if (!dataURL) return null

    recordGeneration('collection')
    renderer.downloadCard(dataURL, filename ?? DEFAULT_FILENAMES.collection)
    recordDownload()
    return dataURL
  }

  /**
   * Render a battle pass card and immediately trigger a PNG download.
   * @returns The data URL of the rendered card, or `null` if rendering failed.
   */
  function generateAndDownloadBattlePass(
    renderer: CanvasShareRenderer,
    data: BattlePassShareData,
    filename?: string,
  ): string | null {
    const canvasData: BattlePassData = {
      seasonName: data.seasonName,
      currentTier: data.currentTier,
      maxTier: data.maxTier,
      xpProgress: data.xpProgress,
    }
    const dataURL = renderer.renderBattlePassCard(canvasData)
    if (!dataURL) return null

    recordGeneration('battle_pass')
    renderer.downloadCard(dataURL, filename ?? DEFAULT_FILENAMES.battle_pass)
    recordDownload()
    return dataURL
  }

  // ── Preview ─────────────────────────────────────────────────────

  /**
   * Return a PNG data URL for a given card type and data blob.
   * Useful for rendering a preview image in a UI `<img src={...} />`.
   *
   * If the `type` is unrecognised, returns a transparent 1×1 PNG.
   */
  function getPreviewDataURL(
    renderer: CanvasShareRenderer,
    type: string,
    data: Record<string, unknown>,
  ): string {
    let dataURL = ''

    switch (type) {
      case 'game_result': {
        const d = buildGameResultData(data as Partial<GameShareData>)
        dataURL = renderer.renderGameResultCard({
          score: d.score,
          wordsEaten: d.wordsEaten,
          combo: d.combo,
          mode: d.mode,
          rating: d.rating,
          time: d.time,
          playerName: d.playerName,
        })
        break
      }
      case 'achievement': {
        const a = buildAchievementData(data as Record<string, string>)
        dataURL = renderer.renderAchievementCard({
          name: a.name,
          description: a.description,
          emoji: a.emoji,
          rarity: normaliseRarity(a.rarity),
          unlockedAt: a.unlockedAt,
        })
        break
      }
      case 'streak': {
        const s = buildStreakData(data as Record<string, number>)
        dataURL = renderer.renderStreakCard({
          currentStreak: s.currentStreak,
          bestStreak: s.bestStreak,
          totalDays: s.totalDays,
        })
        break
      }
      case 'collection': {
        const c = buildCollectionData(data as {
          completed?: number
          total?: number
          rarestWord?: string
          categories?: string[]
        })
        dataURL = renderer.renderCollectionCard({
          completed: c.completed,
          total: c.total,
          rarestWord: c.rarestWord,
          categories: c.categories,
        })
        break
      }
      case 'battle_pass': {
        const b = buildBattlePassData(data as {
          seasonName?: string
          currentTier?: number
          maxTier?: number
          xpProgress?: number
        })
        dataURL = renderer.renderBattlePassCard({
          seasonName: b.seasonName,
          currentTier: b.currentTier,
          maxTier: b.maxTier,
          xpProgress: b.xpProgress,
        })
        break
      }
      default:
        // Return a minimal transparent PNG so <img> doesn't 404
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg=='
    }

    // Track generation (lightweight — no download)
    recordGeneration(type)
    return dataURL
  }

  // ── Batch operations ────────────────────────────────────────────

  /**
   * Render all five card types and return their data URLs in an array.
   * Only card types that have corresponding data will be included.
   *
   * The game result card is always included (it is the primary card).
   * The remaining four cards are included only if their data is provided.
   */
  function generateAllCards(
    renderer: CanvasShareRenderer,
    gameData: GameShareData & {
      achievement?: AchievementShareData
      streak?: StreakShareData
      collection?: CollectionShareData
      battlePass?: BattlePassShareData
    },
  ): BatchCardResult[] {
    const results: BatchCardResult[] = []

    // Always include the game result card
    const gameDataURL = renderer.renderGameResultCard({
      score: gameData.score,
      wordsEaten: gameData.wordsEaten,
      combo: gameData.combo,
      mode: gameData.mode,
      rating: gameData.rating,
      time: gameData.time,
      playerName: gameData.playerName,
    })
    if (gameDataURL) {
      results.push({ type: 'game_result', dataURL: gameDataURL, filename: DEFAULT_FILENAMES.game_result })
    }
    recordGeneration('game_result')

    // Achievement (optional)
    if (gameData.achievement) {
      const a = buildAchievementData(gameData.achievement)
      const url = renderer.renderAchievementCard({
        name: a.name,
        description: a.description,
        emoji: a.emoji,
        rarity: normaliseRarity(a.rarity),
        unlockedAt: a.unlockedAt,
      })
      if (url) {
        results.push({ type: 'achievement', dataURL: url, filename: DEFAULT_FILENAMES.achievement })
      }
      recordGeneration('achievement')
    }

    // Streak (optional)
    if (gameData.streak) {
      const s = buildStreakData(gameData.streak)
      const url = renderer.renderStreakCard({
        currentStreak: s.currentStreak,
        bestStreak: s.bestStreak,
        totalDays: s.totalDays,
      })
      if (url) {
        results.push({ type: 'streak', dataURL: url, filename: DEFAULT_FILENAMES.streak })
      }
      recordGeneration('streak')
    }

    // Collection (optional)
    if (gameData.collection) {
      const c = buildCollectionData(gameData.collection)
      const url = renderer.renderCollectionCard({
        completed: c.completed,
        total: c.total,
        rarestWord: c.rarestWord,
        categories: c.categories,
      })
      if (url) {
        results.push({ type: 'collection', dataURL: url, filename: DEFAULT_FILENAMES.collection })
      }
      recordGeneration('collection')
    }

    // Battle pass (optional)
    if (gameData.battlePass) {
      const b = buildBattlePassData(gameData.battlePass)
      const url = renderer.renderBattlePassCard({
        seasonName: b.seasonName,
        currentTier: b.currentTier,
        maxTier: b.maxTier,
        xpProgress: b.xpProgress,
      })
      if (url) {
        results.push({ type: 'battle_pass', dataURL: url, filename: DEFAULT_FILENAMES.battle_pass })
      }
      recordGeneration('battle_pass')
    }

    return results
  }

  /**
   * Generate all available cards and trigger a sequential download with a
   * stagger delay so the browser doesn't suppress multiple simultaneous
   * downloads.
   *
   * If a ZIP library is available in the future, this can be upgraded to
   * produce a single archive.  For now it downloads individually.
   */
  function downloadAllCards(
    renderer: CanvasShareRenderer,
    gameData: GameShareData & {
      achievement?: AchievementShareData
      streak?: StreakShareData
      collection?: CollectionShareData
      battlePass?: BattlePassShareData
    },
  ): void {
    const cards = generateAllCards(renderer, gameData)

    cards.forEach((card, index) => {
      setTimeout(() => {
        renderer.downloadCard(card.dataURL, card.filename)
        recordDownload()
      }, index * DOWNLOAD_STAGGER_MS)
    })
  }

  // ── Stats ───────────────────────────────────────────────────────

  /** Return the current usage statistics snapshot. */
  function getStats(): ConnectorStats {
    return loadStats()
  }

  /**
   * Clear all persisted usage stats and reset counters to zero.
   * Useful for development or user-initiated privacy reset.
   */
  function resetStats(): void {
    saveStats({ ...EMPTY_STATS })
  }

  // ── Assemble and return ─────────────────────────────────────────

  return {
    generateAndDownloadGameResult,
    generateAndDownloadAchievement,
    generateAndDownloadStreak,
    generateAndDownloadCollection,
    generateAndDownloadBattlePass,
    getPreviewDataURL,
    generateAllCards,
    downloadAllCards,
    getStats,
    resetStats,
  }
}
