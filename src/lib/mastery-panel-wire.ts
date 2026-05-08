/**
 * mastery-panel-wire.ts — Word Snake Mastery Panel Wire
 *
 * Wires the MasteryTrackerPanel (data consumer / presentation layer) with the
 * WordMasteryLiveTracker (data producer / game-event layer) so the mastery
 * sidebar panel always shows live, up-to-date data.
 *
 * Responsibilities:
 *  - Forward tracker state into the panel via `refreshFromTracker()`
 *  - Expose thin accessor passthroughs for every panel query method
 *  - Provide enriched analytics (top words, weak categories, velocity)
 *  - Manage an auto-refresh interval so the panel stays current
 *  - Hook into game lifecycle events (word eaten, game start, game end)
 *  - Return level-up notifications suitable for in-game toasts
 *
 * No React imports — safe for SSR and non-UI contexts.
 */

import type {
  MasteryTrackerPanel,
  MasteryPanelData,
  LevelBreakdown,
  ClosestWord,
  RecentLevelUp,
  SessionCard,
  CategoryProgress,
} from '@/lib/mastery-tracker-panel';

import type { WordMasteryLiveTracker } from '@/lib/word-mastery-live-tracker';

// ── Exported types ──────────────────────────────────────────────────────────

/** A word entry ranked by encounter count for the current session. */
export interface TopWordEntry {
  /** The word text. */
  word: string
  /** Category the word belongs to (e.g. "Animals"). */
  category: string
  /** Number of encounters this session. */
  encounters: number
  /** Current mastery level name. */
  currentLevel: string
  /** Progress toward the next level as a percentage (0–100). */
  progress: number
}

/** A category flagged as needing improvement. */
export interface WeakCategory {
  /** Category name. */
  category: string
  /** Total unique words from this category. */
  totalWords: number
  /** Average mastery progress across category words (0–100). */
  avgProgress: number
  /** Number of words at Master (20+) encounters or above. */
  masteredCount: number
  /** Human-readable suggestion for the player. */
  suggestion: string
}

/** Comprehensive session summary with derived analytics. */
export interface MasterySessionSummary {
  /** Total word encounters this session. */
  totalEncounters: number
  /** Number of unique words encountered. */
  uniqueWords: number
  /** Total level-up events this session. */
  levelUps: number
  /** Category with the highest mastery progress. */
  topCategory: string
  /** Category with the lowest mastery progress. */
  weakestCategory: string
  /** Words encountered per minute. */
  wordsPerMinute: number
  /** Human-readable session duration (e.g. "5m 12s"). */
  sessionDuration: string
  /** Level-ups per minute. */
  masteryVelocity: number
}

/** Level-up notification suitable for in-game toasts / popups. */
export interface LevelUpNotification {
  /** The word that leveled up. */
  word: string
  /** Mastery level before the level-up. */
  oldLevel: string
  /** Mastery level after the level-up. */
  newLevel: string
  /** Emoji for the new level. */
  emoji: string
  /** Hex color for the new level. */
  color: string
  /** Human-readable congratulatory message. */
  message: string
}

/**
 * The public API surface for the mastery panel wire.
 *
 * Created via `createMasteryPanelWire(panel, tracker)`.
 */
export interface MasteryPanelWire {
  // ── Data refresh ──────────────────────────────────────────────
  /** Pull latest tracker state into the panel. Call periodically or on word eat. */
  refreshFromTracker(): void

  // ── Panel data accessors (passthrough) ────────────────────────
  /** Gather all data needed to render the sidebar panel. */
  getPanelData(): MasteryPanelData
  /** Get the 6-tier level distribution breakdown. */
  getLevelBreakdown(): LevelBreakdown[]
  /** Get top N words closest to leveling up. */
  getWordsClosestToLevelUp(limit?: number): ClosestWord[]
  /** Get the most recent level-up events. */
  getRecentLevelUps(limit?: number): RecentLevelUp[]
  /** Get a compact session summary card. */
  getSessionCard(): SessionCard
  /** Get per-category mastery progress. */
  getCategoryProgress(): CategoryProgress[]
  /** Generate formatted text for social sharing. */
  getShareText(): string

  // ── Enhanced analytics ────────────────────────────────────────
  /** Words sorted by session encounter count with level info. */
  getTopWordsThisSession(limit?: number): TopWordEntry[]
  /** Categories with < 30% avg mastery, with actionable suggestions. */
  getWeakCategories(): WeakCategory[]
  /** Level-ups per minute (0 if session is too short). */
  getMasteryVelocity(): number
  /** Comprehensive session summary with derived metrics. */
  getSessionSummary(): MasterySessionSummary

  // ── Auto-refresh configuration ────────────────────────────────
  /** Set the auto-refresh interval in ms. Default is 5000 ms. */
  setAutoRefreshInterval(ms: number): void
  /** Start periodic auto-refresh. */
  startAutoRefresh(): void
  /** Stop periodic auto-refresh and clear the interval. */
  stopAutoRefresh(): void
  /** Whether auto-refresh is currently active. */
  isAutoRefreshing(): boolean

  // ── Event hooks ───────────────────────────────────────────────
  /**
   * Called when the snake eats a word.
   * Records the encounter, refreshes the panel, and returns a
   * level-up notification if one occurred (null otherwise).
   */
  onWordEaten(word: string, category: string, difficulty: string): LevelUpNotification | null
  /** Called when the game ends. Saves session data and stops auto-refresh. */
  onGameEnd(): void
  /** Called when a new game starts. Starts auto-refresh. */
  onGameStart(): void

  // ── Stats / introspection ─────────────────────────────────────
  /** Total number of times `refreshFromTracker()` has been called. */
  getTotalRefreshes(): number
  /** Unix timestamp (ms) of the last successful refresh, or 0. */
  getLastRefreshTime(): number
  /** Cumulative level-up count this session. */
  getSessionLevelUpCount(): number
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Default auto-refresh interval in milliseconds. */
const DEFAULT_AUTO_REFRESH_MS = 5000;

/** Minimum session duration (ms) before velocity is considered meaningful. */
const VELOCITY_MIN_SESSION_MS = 10_000;

/** Threshold below which a category is flagged as "weak". */
const WEAK_CATEGORY_THRESHOLD = 30;

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Build a congratulatory message for a level-up notification.
 */
function buildLevelUpMessage(word: string, newLevel: string): string {
  const messages: Record<string, string> = {
    seen: `"${word}" is now recognized! Keep it up!`,
    learning: `"${word}" moved to Learning. Great progress!`,
    familiar: `"${word}" is now Familiar. Almost there!`,
    mastered: `"${word}" is Mastered! Outstanding work!`,
    legendary: `"${word}" reached Legendary! Truly remarkable!`,
  };
  return messages[newLevel] ?? `"${word}" leveled up to ${newLevel}!`;
}

/**
 * Generate an actionable suggestion for a weak category.
 */
function buildWeakCategorySuggestion(category: string, avgProgress: number): string {
  if (avgProgress < 10) {
    return `Focus on ${category} words — they need the most attention!`;
  }
  if (avgProgress < 20) {
    return `${category} is progressing but needs more practice.`;
  }
  return `${category} is close to breaking through — keep going!`;
}

// ── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a new MasteryPanelWire instance.
 *
 * The wire binds a `MasteryTrackerPanel` (consumer) to a
 * `WordMasteryLiveTracker` (producer) and exposes a unified API that
 * the game loop and UI layer can call without knowing about the
 * internal separation.
 *
 * @param panel  - A panel created by `createMasteryTrackerPanel()`.
 * @param tracker - A tracker created by `createWordMasteryLiveTracker()`.
 * @returns A fully wired `MasteryPanelWire` ready to use.
 */
export function createMasteryPanelWire(
  panel: MasteryTrackerPanel,
  tracker: WordMasteryLiveTracker,
): MasteryPanelWire {
  // ── Internal mutable state ──

  /** Total number of refreshFromTracker calls. */
  let totalRefreshes = 0;

  /** Unix timestamp (ms) of the last successful refresh. */
  let lastRefreshTime = 0;

  /** Running count of level-ups observed this session via onWordEaten. */
  let sessionLevelUpCount = 0;

  /** Auto-refresh interval in milliseconds. */
  let autoRefreshMs = DEFAULT_AUTO_REFRESH_MS;

  /** The active setInterval id, or null if auto-refresh is off. */
  let autoRefreshTimerId: ReturnType<typeof setInterval> | null = null;

  // ── Data refresh ─────────────────────────────────────────────────────────

  function refreshFromTracker(): void {
    try {
      panel.updateFromTracker(tracker);
      totalRefreshes++;
      lastRefreshTime = Date.now();
    } catch (err) {
      console.error('[MasteryPanelWire] refreshFromTracker failed:', err);
    }
  }

  // ── Panel data accessors (safe passthroughs) ─────────────────────────────

  function getPanelData(): MasteryPanelData {
    try {
      return panel.getPanelData();
    } catch (err) {
      console.error('[MasteryPanelWire] getPanelData failed:', err);
      return {
        totalEncounters: 0,
        uniqueWords: 0,
        levelBreakdown: [],
        closestToLevelUp: [],
        recentLevelUps: [],
        sessionDuration: 0,
        categoryProgress: [],
      };
    }
  }

  function getLevelBreakdown(): LevelBreakdown[] {
    try {
      return panel.getLevelBreakdown();
    } catch (err) {
      console.error('[MasteryPanelWire] getLevelBreakdown failed:', err);
      return [];
    }
  }

  function getWordsClosestToLevelUp(limit?: number): ClosestWord[] {
    try {
      return panel.getWordsClosestToLevelUp(limit);
    } catch (err) {
      console.error('[MasteryPanelWire] getWordsClosestToLevelUp failed:', err);
      return [];
    }
  }

  function getRecentLevelUps(limit?: number): RecentLevelUp[] {
    try {
      return panel.getRecentLevelUps(limit);
    } catch (err) {
      console.error('[MasteryPanelWire] getRecentLevelUps failed:', err);
      return [];
    }
  }

  function getSessionCard(): SessionCard {
    try {
      return panel.getSessionCard();
    } catch (err) {
      console.error('[MasteryPanelWire] getSessionCard failed:', err);
      return {
        wordsEncountered: 0,
        uniqueWords: 0,
        levelUps: 0,
        duration: '0m 0s',
        wordsPerMinute: 0,
      };
    }
  }

  function getCategoryProgress(): CategoryProgress[] {
    try {
      return panel.getCategoryProgress();
    } catch (err) {
      console.error('[MasteryPanelWire] getCategoryProgress failed:', err);
      return [];
    }
  }

  function getShareText(): string {
    try {
      return panel.getShareText();
    } catch (err) {
      console.error('[MasteryPanelWire] getShareText failed:', err);
      return '';
    }
  }

  // ── Enhanced analytics ───────────────────────────────────────────────────

  /**
   * Return session words sorted by encounter count descending, enriched
   * with their current level and progress toward the next level.
   */
  function getTopWordsThisSession(limit: number = 10): TopWordEntry[] {
    try {
      const sessionWords = tracker.getSessionWords();
      const stats = tracker.getLiveMasteryStats();

      // Sort by encounter count descending
      const sorted = [...sessionWords].sort((a, b) => b.encounterCount - a.encounterCount);

      const results: TopWordEntry[] = [];
      for (const entry of sorted.slice(0, limit)) {
        const match = stats.closestToLevelUp?.find((c) => c.word === entry.word);
        const progress = match?.progress ?? 0;

        results.push({
          word: entry.word,
          category: entry.category,
          encounters: entry.encounterCount,
          currentLevel: entry.currentLevel,
          progress,
        });
      }

      return results;
    } catch (err) {
      console.error('[MasteryPanelWire] getTopWordsThisSession failed:', err);
      return [];
    }
  }

  /**
   * Identify categories whose average mastery progress falls below the
   * weak-category threshold (30%). Each entry includes an actionable
   * suggestion for the player.
   */
  function getWeakCategories(): WeakCategory[] {
    try {
      const categories = panel.getCategoryProgress();

      const weak: WeakCategory[] = [];
      for (const cat of categories) {
        if (cat.progressPercent >= WEAK_CATEGORY_THRESHOLD) continue;

        weak.push({
          category: cat.category,
          totalWords: cat.totalWords,
          avgProgress: cat.progressPercent,
          masteredCount: cat.masteredWords,
          suggestion: buildWeakCategorySuggestion(cat.category, cat.progressPercent),
        });
      }

      // Sort weakest first
      weak.sort((a, b) => a.avgProgress - b.avgProgress);
      return weak;
    } catch (err) {
      console.error('[MasteryPanelWire] getWeakCategories failed:', err);
      return [];
    }
  }

  /**
   * Compute mastery velocity — level-ups per minute.
   * Returns 0 if the session hasn't been running long enough.
   */
  function getMasteryVelocity(): number {
    try {
      const card = panel.getSessionCard();
      // Parse the session duration back to ms via the panel data
      const data = panel.getPanelData();
      const durationMs = data.sessionDuration;
      const durationMin = durationMs / 60000;

      if (durationMin < VELOCITY_MIN_SESSION_MS / 60000) return 0;

      return card.levelUps > 0
        ? Math.round((card.levelUps / durationMin) * 100) / 100
        : 0;
    } catch (err) {
      console.error('[MasteryPanelWire] getMasteryVelocity failed:', err);
      return 0;
    }
  }

  /**
   * Produce a comprehensive session summary combining panel data with
   * derived analytics (top/weakest category, velocity, etc.).
   */
  function getSessionSummary(): MasterySessionSummary {
    try {
      const data = panel.getPanelData();
      const card = panel.getSessionCard();
      const categories = panel.getCategoryProgress();
      const velocity = getMasteryVelocity();

      // Determine top and weakest categories
      const topCategory = categories.length > 0
        ? categories.reduce((best, c) => c.progressPercent > best.progressPercent ? c : best, categories[0]).category
        : '—';

      const weakestCategory = categories.length > 0
        ? categories.reduce((worst, c) => c.progressPercent < worst.progressPercent ? c : worst, categories[0]).category
        : '—';

      // Only consider "real" weakest if there are multiple categories
      const actualWeakest = categories.length > 1 ? weakestCategory : '—';

      return {
        totalEncounters: data.totalEncounters,
        uniqueWords: data.uniqueWords,
        levelUps: card.levelUps,
        topCategory,
        weakestCategory: actualWeakest,
        wordsPerMinute: card.wordsPerMinute,
        sessionDuration: card.duration,
        masteryVelocity: velocity,
      };
    } catch (err) {
      console.error('[MasteryPanelWire] getSessionSummary failed:', err);
      return {
        totalEncounters: 0,
        uniqueWords: 0,
        levelUps: 0,
        topCategory: '—',
        weakestCategory: '—',
        wordsPerMinute: 0,
        sessionDuration: '0m 0s',
        masteryVelocity: 0,
      };
    }
  }

  // ── Auto-refresh ─────────────────────────────────────────────────────────

  function setAutoRefreshInterval(ms: number): void {
    autoRefreshMs = Math.max(1000, ms); // Floor at 1 second
    // If already running, restart with the new interval
    if (autoRefreshTimerId !== null) {
      stopAutoRefresh();
      startAutoRefresh();
    }
  }

  function startAutoRefresh(): void {
    if (autoRefreshTimerId !== null) return; // Already running

    autoRefreshTimerId = setInterval(() => {
      refreshFromTracker();
    }, autoRefreshMs);
  }

  function stopAutoRefresh(): void {
    if (autoRefreshTimerId !== null) {
      clearInterval(autoRefreshTimerId);
      autoRefreshTimerId = null;
    }
  }

  function isAutoRefreshing(): boolean {
    return autoRefreshTimerId !== null;
  }

  // ── Event hooks ──────────────────────────────────────────────────────────

  /**
   * Called when the snake eats a word during gameplay.
   *
   * 1. Records the encounter on the live tracker.
   * 2. Refreshes the panel so it reflects the updated state.
   * 3. If a level-up occurred, returns a `LevelUpNotification` suitable
   *    for showing an in-game toast.
   *
   * @returns A notification if the word leveled up, `null` otherwise.
   */
  function onWordEaten(
    word: string,
    category: string,
    difficulty: string,
  ): LevelUpNotification | null {
    try {
      const result = tracker.recordWordEncounter(word, category, difficulty);

      // Refresh the panel so it picks up the latest tracker state
      refreshFromTracker();

      if (result) {
        sessionLevelUpCount++;
        return {
          word: result.word,
          oldLevel: result.oldLevel,
          newLevel: result.newLevel,
          emoji: result.emoji,
          color: result.color,
          message: buildLevelUpMessage(result.word, result.newLevel),
        };
      }

      return null;
    } catch (err) {
      console.error('[MasteryPanelWire] onWordEaten failed:', err);
      return null;
    }
  }

  /**
   * Called when a game session ends.
   * Persists session data and stops the auto-refresh timer.
   */
  function onGameEnd(): void {
    try {
      tracker.saveSessionData();
    } catch (err) {
      console.error('[MasteryPanelWire] saveSessionData failed:', err);
    }

    // Final refresh so the panel has the very latest state
    refreshFromTracker();
    stopAutoRefresh();
  }

  /**
   * Called when a new game session starts.
   * Kicks off the auto-refresh interval so the panel stays live.
   */
  function onGameStart(): void {
    // Ensure the panel is synced right away
    refreshFromTracker();
    startAutoRefresh();
  }

  // ── Stats / introspection ────────────────────────────────────────────────

  function getTotalRefreshes(): number {
    return totalRefreshes;
  }

  function getLastRefreshTime(): number {
    return lastRefreshTime;
  }

  function getSessionLevelUpCount(): number {
    return sessionLevelUpCount;
  }

  // ── Return the public surface ────────────────────────────────────────────

  return {
    // Data refresh
    refreshFromTracker,

    // Panel accessors
    getPanelData,
    getLevelBreakdown,
    getWordsClosestToLevelUp,
    getRecentLevelUps,
    getSessionCard,
    getCategoryProgress,
    getShareText,

    // Enhanced analytics
    getTopWordsThisSession,
    getWeakCategories,
    getMasteryVelocity,
    getSessionSummary,

    // Auto-refresh
    setAutoRefreshInterval,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshing,

    // Event hooks
    onWordEaten,
    onGameEnd,
    onGameStart,

    // Stats
    getTotalRefreshes,
    getLastRefreshTime,
    getSessionLevelUpCount,
  };
}
