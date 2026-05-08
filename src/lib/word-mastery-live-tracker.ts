/**
 * Word Mastery Live Tracker — Pure logic module for real-time word mastery tracking during gameplay.
 *
 * Bridges the gap between word-mastery.ts persistence and the game loop so vocabulary mastery
 * actually progresses as the player encounters words. Manages session-scoped encounter tracking,
 * level-up detection, encounter frequency analytics, and dashboard aggregation data.
 *
 * No React imports — safe for SSR and non-UI contexts.
 */

import {
  recordEncounter,
  getMastery,
  getMasteryLevel,
  getMasteryProgress,
  MASTERY_THRESHOLDS,
  MASTERY_COLORS,
  MASTERY_EMOJIS,
  type MasteryLevel,
  type WordMastery,
} from '@/lib/word-mastery';

// ── Types ───────────────────────────────────────────────────────────────────

/** A single word tracked during the current game session. */
export interface SessionWordEntry {
  /** The word itself. */
  word: string;
  /** Category the word belongs to (e.g. 'animals', 'science'). */
  category: string;
  /** Difficulty label (e.g. 'easy', 'medium', 'hard'). */
  difficulty: string;
  /** Unix timestamp (ms) of the first encounter this session. */
  firstSeenAt: number;
  /** Unix timestamp (ms) of the most recent encounter this session. */
  lastSeenAt: number;
  /** Number of times this word was encountered this session. */
  encounterCount: number;
  /** Current mastery level as of the last encounter. */
  currentLevel: string;
}

/** Emitted when a word crosses a mastery threshold during gameplay. */
export interface LevelUpNotification {
  /** The word that leveled up. */
  word: string;
  /** The mastery level before the level-up. */
  oldLevel: string;
  /** The mastery level after the level-up. */
  newLevel: string;
  /** Emoji representing the new level. */
  emoji: string;
  /** Hex color representing the new level. */
  color: string;
  /** Unix timestamp (ms) when the level-up occurred. */
  timestamp: number;
}

/** Aggregate mastery statistics for the live dashboard. */
export interface LiveMasteryStats {
  /** Total word encounters recorded this session. */
  totalEncounters: number;
  /** Number of unique words encountered this session. */
  uniqueWords: number;
  /** Count of session words grouped by mastery level. */
  byLevel: Record<string, number>;
  /** Top 5 words closest to reaching their next mastery level, sorted by progress descending. */
  closestToLevelUp: Array<{ word: string; currentLevel: string; progress: number }>;
  /** Count of encounters grouped by word category. */
  categoryDistribution: Record<string, number>;
  /** Total number of level-ups that occurred this session. */
  levelUpsThisSession: number;
}

/** Serializable session data for post-game analysis and persistence. */
export interface SessionData {
  /** Session version for future migration. */
  version: number;
  /** Unix timestamp (ms) when the session started. */
  sessionStartTime: number;
  /** Unix timestamp (ms) when the session was saved (or ended). */
  savedAt: number;
  /** All words encountered during the session. */
  words: SessionWordEntry[];
  /** All level-up events that occurred during the session. */
  levelUps: LevelUpNotification[];
  /** Total number of encounters across all words. */
  totalEncounters: number;
}

/** The public API surface returned by `createWordMasteryLiveTracker`. */
export interface WordMasteryLiveTracker {
  /**
   * Record a word encounter during gameplay.
   * Delegates to `recordEncounter()` from word-mastery.ts and updates session state.
   * @returns A `LevelUpNotification` if the word crossed a mastery threshold, otherwise `null`.
   */
  recordWordEncounter(word: string, category: string, difficulty: string): LevelUpNotification | null;

  /** Get all unique words encountered in the current session with their session metadata. */
  getSessionWords(): SessionWordEntry[];

  /** Get a summary of mastery statistics for the current session (alias for `getLiveMasteryStats`). */
  getSessionSummary(): LiveMasteryStats;

  /** Check whether a word has been encountered at all during this session. */
  isNewWordThisSession(word: string): boolean;

  /** Get the total number of encounters across all words in the current session. */
  getSessionEncounterCount(): number;

  /**
   * Consume and return any queued level-up notifications since the last call.
   * After calling, the internal notification buffer is cleared.
   */
  checkForLevelUps(): LevelUpNotification[];

  /** Get aggregate mastery statistics for the live dashboard. */
  getLiveMasteryStats(): LiveMasteryStats;

  /** Reset all session state (words, notifications, timers). Does not affect persisted mastery data. */
  resetSession(): void;

  /** Persist the current session data to localStorage under `ws_mastery_live_session`. */
  saveSessionData(): void;
}

// ── Internal types ──────────────────────────────────────────────────────────

/** Tracks encounter timestamps per word for frequency calculations. */
interface EncounterTimeline {
  /** Ordered list of Unix timestamps (ms) when this word was encountered. */
  timestamps: number[];
}

/** Internal mutable session state managed by the tracker. */
interface SessionState {
  /** Map of word → session entry for all words seen this session. */
  words: Map<string, SessionWordEntry>;
  /** Map of word → encounter timeline for frequency analytics. */
  timelines: Map<string, EncounterTimeline>;
  /** Buffer of level-up notifications produced by `recordWordEncounter`. */
  pendingLevelUps: LevelUpNotification[];
  /** Complete list of all level-up events this session. */
  allLevelUps: LevelUpNotification[];
  /** Unix timestamp (ms) when the session was started. */
  sessionStartTime: number;
  /** Running total of all encounters this session. */
  totalEncounters: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Ordered mastery levels from lowest to highest. */
const LEVEL_ORDER: MasteryLevel[] = [
  'new', 'seen', 'learning', 'familiar', 'mastered', 'legendary',
];

/** localStorage key for persisted session data. */
const SESSION_STORAGE_KEY = 'ws_mastery_live_session';

/** Maximum number of "closest to level up" entries to include in stats. */
const MAX_CLOSEST_TO_LEVEL_UP = 5;

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Compute the current mastery level from a raw encounter count.
 * Mirrors the logic in word-mastery.ts for cases where we need it inline.
 */
function computeLevelFromEncounters(encounters: number): MasteryLevel {
  let level: MasteryLevel = 'new';
  for (const lv of LEVEL_ORDER) {
    if (encounters >= MASTERY_THRESHOLDS[lv]) level = lv;
  }
  return level;
}

/**
 * Calculate how close a word is to its next mastery level.
 * @returns Progress as a number between 0–100, or 100 if already legendary.
 */
function calculateLevelProgress(encounters: number, currentLevel: MasteryLevel): number {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx >= LEVEL_ORDER.length - 1) return 100;

  const nextLevel = LEVEL_ORDER[idx + 1];
  const currentThreshold = MASTERY_THRESHOLDS[currentLevel];
  const nextThreshold = MASTERY_THRESHOLDS[nextLevel];
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;

  const progress = encounters - currentThreshold;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

/**
 * Determine if a word is at the maximum mastery level and cannot level up further.
 */
function isMaxLevel(level: MasteryLevel): boolean {
  return level === 'legendary';
}

/**
 * SSR-safe localStorage getter.
 */
function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * SSR-safe localStorage setter.
 */
function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  } catch {
    // Ignore quota or security errors
  }
}

/**
 * Serialize a SessionState into the persistable SessionData format.
 */
function serializeSessionState(state: SessionState): SessionData {
  return {
    version: 1,
    sessionStartTime: state.sessionStartTime,
    savedAt: Date.now(),
    words: Array.from(state.words.values()),
    levelUps: [...state.allLevelUps],
    totalEncounters: state.totalEncounters,
  };
}

/**
 * Deserialize a persisted SessionData object back into internal SessionState.
 * Validates the shape defensively — malformed data returns a fresh state.
 */
function deserializeSessionState(data: unknown): SessionState | null {
  try {
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    if (typeof d.version !== 'number') return null;
    if (!Array.isArray(d.words)) return null;
    if (!Array.isArray(d.levelUps)) return null;

    const words = new Map<string, SessionWordEntry>();
    const timelines = new Map<string, EncounterTimeline>();

    for (const w of d.words as SessionWordEntry[]) {
      if (typeof w.word !== 'string') continue;
      words.set(w.word, w);
      // Rebuild timeline from encounter count — timestamps are approximated
      // since we don't persist the full timeline array
      const timestamps: number[] = [];
      for (let i = 0; i < (w.encounterCount || 0); i++) {
        timestamps.push(w.lastSeenAt - (w.encounterCount - 1 - i) * 30000);
      }
      timelines.set(w.word, { timestamps });
    }

    const allLevelUps = (d.levelUps as LevelUpNotification[]).filter((lu) => typeof lu.word === 'string');

    return {
      words,
      timelines,
      pendingLevelUps: [],
      allLevelUps,
      sessionStartTime: typeof d.sessionStartTime === 'number' ? d.sessionStartTime : Date.now(),
      totalEncounters: typeof d.totalEncounters === 'number' ? d.totalEncounters : 0,
    };
  } catch {
    return null;
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a new `WordMasteryLiveTracker` instance.
 *
 * Each call produces an independent tracker with its own session state.
 * Typically a single tracker is created per game session and shared across
 * the game loop, UI components, and analytics.
 *
 * @returns A fully initialized tracker ready to receive encounter recordings.
 */
export function createWordMasteryLiveTracker(): WordMasteryLiveTracker {
  // ── Mutable session state ──

  const state: SessionState = {
    words: new Map(),
    timelines: new Map(),
    pendingLevelUps: [],
    allLevelUps: [],
    sessionStartTime: Date.now(),
    totalEncounters: 0,
  };

  // ── Public API implementation ──

  /**
   * Record a word encounter during gameplay.
   *
   * 1. Calls `recordEncounter()` from word-mastery.ts to update long-term mastery.
   * 2. Updates the session-level word entry.
   * 3. Records the encounter timestamp for frequency tracking.
   * 4. Detects level-ups and buffers a notification if one occurred.
   *
   * @param word - The word encountered on the game board.
   * @param category - Word category (e.g. 'animals', 'food').
   * @param difficulty - Difficulty label (e.g. 'easy', 'medium', 'hard').
   * @returns `LevelUpNotification` if the word reached a new mastery level, `null` otherwise.
   */
  function recordWordEncounter(
    word: string,
    category: string,
    difficulty: string,
  ): LevelUpNotification | null {
    const now = Date.now();

    // Capture the mastery level *before* recording the encounter
    const previousLevel = getMasteryLevel(word) as MasteryLevel;

    // Delegate to the persistence layer — collected=true for gameplay encounters
    const updated: WordMastery = recordEncounter(word, category, true, 0);
    const newLevel = updated.masteryLevel;

    // Update or create the session word entry
    const existing = state.words.get(word);
    const sessionEntry: SessionWordEntry = {
      word,
      category: existing?.category ?? category,
      difficulty: existing?.difficulty ?? difficulty,
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now,
      encounterCount: (existing?.encounterCount ?? 0) + 1,
      currentLevel: newLevel,
    };
    state.words.set(word, sessionEntry);

    // Update the encounter timeline for frequency tracking
    const timeline = state.timelines.get(word) ?? { timestamps: [] };
    timeline.timestamps.push(now);
    state.timelines.set(word, timeline);

    // Increment session encounter counter
    state.totalEncounters++;

    // Detect level-up
    if (previousLevel !== newLevel) {
      const notification: LevelUpNotification = {
        word,
        oldLevel: previousLevel,
        newLevel,
        emoji: MASTERY_EMOJIS[newLevel],
        color: MASTERY_COLORS[newLevel],
        timestamp: now,
      };

      state.pendingLevelUps.push(notification);
      state.allLevelUps.push(notification);

      return notification;
    }

    return null;
  }

  /**
   * Get all unique words encountered in the current session.
   * Each entry includes session-scoped encounter counts and timestamps.
   */
  function getSessionWords(): SessionWordEntry[] {
    return Array.from(state.words.values());
  }

  /**
   * Get aggregate mastery statistics for the current session.
   * Useful for a live dashboard showing mastery distribution.
   */
  function getSessionSummary(): LiveMasteryStats {
    return buildLiveStats();
  }

  /**
   * Check whether a word has been encountered at all during this session.
   */
  function isNewWordThisSession(word: string): boolean {
    return !state.words.has(word);
  }

  /**
   * Get the total number of encounters across all words in the current session.
   */
  function getSessionEncounterCount(): number {
    return state.totalEncounters;
  }

  /**
   * Consume and return all queued level-up notifications.
   * The internal buffer is cleared after this call.
   * Callers should invoke this periodically (e.g. each game tick or UI frame)
   * to display level-up animations or notifications.
   */
  function checkForLevelUps(): LevelUpNotification[] {
    const notifications = [...state.pendingLevelUps];
    state.pendingLevelUps = [];
    return notifications;
  }

  /**
   * Get aggregate mastery statistics for the live dashboard.
   * Identical to `getSessionSummary()` but provided as a semantically distinct
   * entry point for dashboard-oriented consumers.
   */
  function getLiveMasteryStats(): LiveMasteryStats {
    return buildLiveStats();
  }

  /**
   * Reset all session state.
   * Clears session words, timelines, level-up notifications, and encounter counts.
   * Does NOT affect the long-term mastery data stored in word-mastery.ts.
   */
  function resetSession(): void {
    state.words.clear();
    state.timelines.clear();
    state.pendingLevelUps = [];
    state.allLevelUps = [];
    state.sessionStartTime = Date.now();
    state.totalEncounters = 0;
  }

  /**
   * Persist the current session data to localStorage.
   * The data can later be loaded for post-game analysis or session restoration.
   * Uses SSR-safe storage access.
   */
  function saveSessionData(): void {
    const serialized = serializeSessionState(state);
    safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(serialized));
  }

  // ── Private helpers ──

  /**
   * Build the `LiveMasteryStats` from the current session state.
   * Extracted into a shared helper to keep `getSessionSummary` and
   * `getLiveMasteryStats` DRY.
   */
  function buildLiveStats(): LiveMasteryStats {
    const sessionWords = Array.from(state.words.values());

    // Count words per mastery level
    const byLevel: Record<string, number> = {};
    for (const level of LEVEL_ORDER) {
      byLevel[level] = 0;
    }
    for (const entry of sessionWords) {
      byLevel[entry.currentLevel] = (byLevel[entry.currentLevel] ?? 0) + 1;
    }

    // Category distribution — count encounters per category
    const categoryDistribution: Record<string, number> = {};
    for (const entry of sessionWords) {
      const cat = entry.category || 'unknown';
      categoryDistribution[cat] = (categoryDistribution[cat] ?? 0) + entry.encounterCount;
    }

    // Find words closest to leveling up (excluding legendary)
    const progressEntries: Array<{ word: string; currentLevel: string; progress: number }> = [];
    for (const entry of sessionWords) {
      const level = entry.currentLevel as MasteryLevel;
      if (isMaxLevel(level)) continue;

      // Use the persistent mastery data for accurate encounter counts
      const mastery = getMastery(entry.word);
      const encounters = mastery?.encounters ?? entry.encounterCount;
      const progress = calculateLevelProgress(encounters, level);

      progressEntries.push({
        word: entry.word,
        currentLevel: level,
        progress,
      });
    }

    // Sort by progress descending — highest progress first
    progressEntries.sort((a, b) => b.progress - a.progress);
    const closestToLevelUp = progressEntries.slice(0, MAX_CLOSEST_TO_LEVEL_UP);

    return {
      totalEncounters: state.totalEncounters,
      uniqueWords: sessionWords.length,
      byLevel,
      closestToLevelUp,
      categoryDistribution,
      levelUpsThisSession: state.allLevelUps.length,
    };
  }

  /**
   * Compute the encounter frequency for a specific word.
   * Returns encounters per minute based on session timeline data.
   * If the word hasn't been encountered or only once, returns 0.
   */
  function getEncounterFrequency(word: string): number {
    const timeline = state.timelines.get(word);
    if (!timeline || timeline.timestamps.length < 2) return 0;

    const first = timeline.timestamps[0];
    const last = timeline.timestamps[timeline.timestamps.length - 1];
    const elapsedMinutes = (last - first) / 60000;

    if (elapsedMinutes <= 0) return 0;

    return timeline.timestamps.length / elapsedMinutes;
  }

  /**
   * Identify "fast learners" — words that leveled up multiple times this session
   * or leveled up with fewer encounters than average.
   *
   * @returns Array of words ranked by learning speed, with their level-up details.
   */
  function getFastLearners(): Array<{
    word: string;
    levelUps: number;
    encountersToFirstLevelUp: number;
    avgFrequency: number;
  }> {
    // Count level-ups per word from this session
    const levelUpCounts = new Map<string, number>();
    for (const lu of state.allLevelUps) {
      levelUpCounts.set(lu.word, (levelUpCounts.get(lu.word) ?? 0) + 1);
    }

    const fastLearners: Array<{
      word: string;
      levelUps: number;
      encountersToFirstLevelUp: number;
      avgFrequency: number;
    }> = [];

    for (const [word, count] of levelUpCounts) {
      if (count < 1) continue;

      const entry = state.words.get(word);
      if (!entry) continue;

      // How many encounters until the first level-up?
      // We look at the first level-up event's timestamp and count encounters before it
      const firstLevelUp = state.allLevelUps.find((lu) => lu.word === word);
      const timeline = state.timelines.get(word);
      let encountersToFirstLevelUp = entry.encounterCount;

      if (firstLevelUp && timeline) {
        encountersToFirstLevelUp = timeline.timestamps.filter(
          (ts) => ts <= firstLevelUp.timestamp,
        ).length;
      }

      fastLearners.push({
        word,
        levelUps: count,
        encountersToFirstLevelUp,
        avgFrequency: getEncounterFrequency(word),
      });
    }

    // Sort: most level-ups first, then by fewest encounters to first level-up
    fastLearners.sort((a, b) => {
      if (b.levelUps !== a.levelUps) return b.levelUps - a.levelUps;
      return a.encountersToFirstLevelUp - b.encountersToFirstLevelUp;
    });

    return fastLearners;
  }

  // ── Return the public surface ──

  return {
    recordWordEncounter,
    getSessionWords,
    getSessionSummary,
    isNewWordThisSession,
    getSessionEncounterCount,
    checkForLevelUps,
    getLiveMasteryStats,
    resetSession,
    saveSessionData,
  };
}

// ── Session persistence utilities ───────────────────────────────────────────

/**
 * Load previously saved session data from localStorage.
 * Returns `null` if no valid session data exists or if called in a non-browser environment.
 *
 * @returns The deserialized `SessionData`, or `null`.
 */
export function loadSessionData(): SessionData | null {
  const raw = safeGetItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const d = parsed as Record<string, unknown>;

    // Basic shape validation
    if (
      typeof d.version !== 'number' ||
      typeof d.sessionStartTime !== 'number' ||
      typeof d.savedAt !== 'number' ||
      !Array.isArray(d.words) ||
      !Array.isArray(d.levelUps)
    ) {
      return null;
    }

    return d as unknown as SessionData;
  } catch {
    return null;
  }
}

/**
 * Create a tracker and optionally restore its state from a previously saved session.
 *
 * @param restoreFromSaved - If `true`, attempts to load session data from localStorage
 *   and restore the tracker's state. Defaults to `false`.
 * @returns A `WordMasteryLiveTracker` with optionally restored session state.
 */
export function createRestoredTracker(restoreFromSaved = false): WordMasteryLiveTracker {
  const tracker = createWordMasteryLiveTracker();

  if (!restoreFromSaved) return tracker;

  const saved = loadSessionData();
  if (!saved) return tracker;

  // Restore session words into the tracker's internal state
  // We call recordWordEncounter for each word to re-sync with word-mastery.ts
  // but we skip level-up notifications to avoid duplicate alerts
  for (const entry of saved.words) {
    tracker.recordWordEncounter(entry.word, entry.category, entry.difficulty);
  }

  // Drain any level-up notifications generated during restoration
  tracker.checkForLevelUps();

  return tracker;
}
