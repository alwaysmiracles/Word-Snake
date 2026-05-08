/**
 * XP Progression Wire — provides a visible, live XP progression system for the
 * Word Snake game UI.
 *
 * This module tracks XP bar state, level history, session breakdowns, title
 * progress, milestone rewards, and session velocity.  All session state is
 * persisted to localStorage so it survives page refreshes within a session.
 *
 * Storage keys used:
 *   ws_xp_progression_session — per-session XP event log & breakdown
 *   ws_xp_level_history       — rolling list of recent level-ups (max 50)
 */

'use client';

import {
  loadProfile,
  saveProfile,
  calculateLevel,
  checkTitleUnlocks,
  createDefaultProfile,
  XP_PER_LEVEL,
  PLAYER_TITLES,
} from '@/lib/player-profile';
import type { PlayerProfile, PlayerTitle } from '@/lib/player-profile';

import type {
  XPEventType,
  XPBreakdown,
} from '@/lib/xp-scoring-wire';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = 'ws_xp_progression_session';
const LEVEL_HISTORY_KEY = 'ws_xp_level_history';
const MAX_LEVEL_HISTORY_ENTRIES = 50;

/** How frequently `logXPEvent` flushes accumulated events to localStorage. */
const FLUSH_INTERVAL_MS = 2_000;

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** Shape of the XP bar as consumed by the UI. */
export interface XPBarData {
  currentXP: number;
  xpToNextLevel: number;
  percentage: number;       // 0–1
  currentLevel: number;
  levelTitle: string;       // display string like "Level 12 · Word Master"
  displayXP: string;        // formatted "47 / 100"
  displayLevel: string;     // "Lv. 12"
}

/** Single entry in the level-up history. */
export interface LevelUpEntry {
  level: number;
  timestamp: number;        // Date.now()
  xpAtLevelUp: number;
  titlesUnlocked: string[]; // title IDs unlocked at this level
}

/** Categorised XP breakdown for the current session. */
export interface SessionXPBreakdown {
  word: number;
  combo: number;
  powerup: number;
  achievement: number;
  game: number;
  special: number;
  total: number;
  /** Per-event-type detail array for the UI tooltip. */
  details: XPBreakdownDetail[];
}

/** A single line-item inside the session breakdown. */
export interface XPBreakdownDetail {
  type: XPEventType;
  label: string;
  amount: number;
  eventCount: number;
}

/** Information about the next title the player can unlock. */
export interface TitleProgress {
  nextTitle: PlayerTitle | null;
  currentProgress: string;  // human-readable progress, e.g. "35 / 50 words"
  progressFraction: number; // 0–1, or 1 if already available
  unlockedCount: number;
  totalCount: number;
}

/** A milestone reward granted every 5 levels. */
export interface MilestoneReward {
  level: number;
  type: 'coinBonus' | 'avatarUnlock' | 'titleUnlock';
  description: string;
  coinAmount?: number;
  avatarHint?: string;
  titleHint?: string;
  icon: string;
}

/** Result returned by `getXPSessionVelocity`. */
export interface SessionVelocity {
  xpPerMinute: number;
  totalXPThisSession: number;
  sessionDurationMinutes: number;
  eventCount: number;
  estimatedMinutesToNextLevel: number | null; // null = can't estimate
}

/** A single logged XP event (chronological record). */
export interface XPEventLogEntry {
  type: XPEventType;
  amount: number;
  timestamp: number;
}

/** Persisted session blob. */
export interface PersistedSession {
  sessionStart: number;
  events: XPEventLogEntry[];
  breakdown: XPBreakdown;
  totalXPEarned: number;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** In-memory cache of the current persisted session. */
let sessionCache: PersistedSession | null = null;

/** In-memory cache of the level history array. */
let levelHistoryCache: LevelUpEntry[] | null = null;

/** Debounce timer for flushing session data. */
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// ---------------------------------------------------------------------------
// Friendly labels for event types (used in breakdown details)
// ---------------------------------------------------------------------------

const EVENT_TYPE_LABELS: Record<XPEventType, string> = {
  wordEat: 'Words Eaten',
  comboReached: 'Combos Reached',
  powerUpCollected: 'Power-Ups',
  achievementUnlocked: 'Achievements',
  gameComplete: 'Games Completed',
  dailyChallengeComplete: 'Daily Challenges',
  speedRunComplete: 'Speed Runs',
  bossDefeated: 'Bosses Defeated',
  quizCorrect: 'Quizzes Correct',
  milestoneReached: 'Milestones',
  streakBonus: 'Streak Bonuses',
  newWordCollected: 'New Words',
  perfectGame: 'Perfect Games',
};

/** Map each XPEventType to a breakdown category. */
function eventTypeToCategory(event: XPEventType): keyof XPBreakdown {
  switch (event) {
    case 'wordEat':
    case 'newWordCollected':
      return 'word';
    case 'comboReached':
      return 'combo';
    case 'powerUpCollected':
      return 'powerup';
    case 'achievementUnlocked':
      return 'achievement';
    case 'gameComplete':
    case 'dailyChallengeComplete':
    case 'speedRunComplete':
    case 'perfectGame':
      return 'game';
    default:
      return 'special';
  }
}

// ---------------------------------------------------------------------------
// Safe localStorage helpers
// ---------------------------------------------------------------------------

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Persisted session — read / write
// ---------------------------------------------------------------------------

function loadSession(): PersistedSession {
  if (sessionCache) return sessionCache;

  const raw = safeGetItem(SESSION_STORAGE_KEY);
  const parsed = safeParseJSON<PersistedSession | null>(raw, null);

  if (parsed && typeof parsed.sessionStart === 'number' && Array.isArray(parsed.events)) {
    sessionCache = parsed;
    return parsed;
  }

  // Create a fresh session
  const fresh: PersistedSession = {
    sessionStart: Date.now(),
    events: [],
    breakdown: { word: 0, combo: 0, powerup: 0, achievement: 0, game: 0, special: 0 },
    totalXPEarned: 0,
  };
  sessionCache = fresh;
  safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function persistSession(): void {
  if (!sessionCache) return;
  safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(sessionCache));
}

/** Debounced flush — coalesces rapid writes. */
function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    persistSession();
  }, FLUSH_INTERVAL_MS);
}

// ---------------------------------------------------------------------------
// Level history — read / write
// ---------------------------------------------------------------------------

function loadLevelHistory(): LevelUpEntry[] {
  if (levelHistoryCache) return levelHistoryCache;

  const raw = safeGetItem(LEVEL_HISTORY_KEY);
  const parsed = safeParseJSON<LevelUpEntry[]>(raw, []);
  levelHistoryCache = Array.isArray(parsed) ? parsed : [];
  return levelHistoryCache;
}

function persistLevelHistory(): void {
  if (!levelHistoryCache) return;
  safeSetItem(LEVEL_HISTORY_KEY, JSON.stringify(levelHistoryCache));
}

function addLevelHistoryEntry(entry: LevelUpEntry): void {
  const history = loadLevelHistory();
  history.unshift(entry); // newest first
  if (history.length > MAX_LEVEL_HISTORY_ENTRIES) {
    history.length = MAX_LEVEL_HISTORY_ENTRIES;
  }
  levelHistoryCache = history;
  persistLevelHistory();
}

// ---------------------------------------------------------------------------
// 1. getXPBarData
// ---------------------------------------------------------------------------

export function getXPBarData(): XPBarData {
  try {
    const profile = loadProfile() ?? createDefaultProfile();
    const lvl = calculateLevel(profile.xp);
    const pct = lvl.xpToNext > 0 ? lvl.currentXp / lvl.xpToNext : 0;

    // Derive a title string from the profile's active title or a level-based one
    let levelTitle = `Level ${lvl.level}`;
    if (profile.activeTitle) {
      const match = PLAYER_TITLES.find((t) => t.id === profile.activeTitle);
      if (match) {
        levelTitle = `Level ${lvl.level} · ${match.icon} ${match.name}`;
      }
    }

    return {
      currentXP: lvl.currentXp,
      xpToNextLevel: lvl.xpToNext,
      percentage: Math.min(pct, 1),
      currentLevel: lvl.level,
      levelTitle,
      displayXP: `${lvl.currentXp} / ${lvl.xpToNext}`,
      displayLevel: `Lv. ${lvl.level}`,
    };
  } catch {
    return {
      currentXP: 0,
      xpToNextLevel: XP_PER_LEVEL,
      percentage: 0,
      currentLevel: 1,
      levelTitle: 'Level 1',
      displayXP: `0 / ${XP_PER_LEVEL}`,
      displayLevel: 'Lv. 1',
    };
  }
}

// ---------------------------------------------------------------------------
// 2. getLevelHistory
// ---------------------------------------------------------------------------

export function getLevelHistory(): LevelUpEntry[] {
  try {
    const history = loadLevelHistory();
    return [...history]; // defensive copy
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. getXPBreakdown
// ---------------------------------------------------------------------------

export function getXPBreakdown(): SessionXPBreakdown {
  try {
    const session = loadSession();
    const bd = session.breakdown;

    // Build detail rows — one per unique event type seen this session
    const eventMap = new Map<XPEventType, { amount: number; count: number }>();

    for (const evt of session.events) {
      const existing = eventMap.get(evt.type);
      if (existing) {
        existing.amount += evt.amount;
        existing.count += 1;
      } else {
        eventMap.set(evt.type, { amount: evt.amount, count: 1 });
      }
    }

    const details: XPBreakdownDetail[] = Array.from(eventMap.entries())
      .map(([type, { amount, count }]) => ({
        type,
        label: EVENT_TYPE_LABELS[type] ?? type,
        amount,
        eventCount: count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      word: bd.word,
      combo: bd.combo,
      powerup: bd.powerup,
      achievement: bd.achievement,
      game: bd.game,
      special: bd.special,
      total: session.totalXPEarned,
      details,
    };
  } catch {
    return {
      word: 0, combo: 0, powerup: 0, achievement: 0, game: 0, special: 0,
      total: 0, details: [],
    };
  }
}

// ---------------------------------------------------------------------------
// 4. getTitleProgress
// ---------------------------------------------------------------------------

export function getTitleProgress(): TitleProgress {
  try {
    const profile = loadProfile() ?? createDefaultProfile();
    const unlockedSet = new Set(profile.titles);
    const nextTitle =
      PLAYER_TITLES.find((t) => !unlockedSet.has(t.id)) ?? null;

    // Build a human-readable progress description
    let currentProgress = 'All titles unlocked!';
    let progressFraction = 1;

    if (nextTitle) {
      currentProgress = buildProgressDescription(profile, nextTitle);
      progressFraction = estimateTitleFraction(profile, nextTitle);
    }

    return {
      nextTitle,
      currentProgress,
      progressFraction,
      unlockedCount: profile.titles.length,
      totalCount: PLAYER_TITLES.length,
    };
  } catch {
    return {
      nextTitle: null,
      currentProgress: 'Unable to load',
      progressFraction: 0,
      unlockedCount: 0,
      totalCount: 0,
    };
  }
}

/**
 * Generate a friendly progress string for a title based on the player's stats.
 * Uses the title's condition string to infer what to measure.
 */
function buildProgressDescription(profile: PlayerProfile, title: PlayerTitle): string {
  const cond = title.condition;

  if (cond.includes('totalGamesPlayed')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 0;
    return `${Math.min(profile.totalGamesPlayed, target)} / ${target} games`;
  }
  if (cond.includes('totalWordsCollected')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 0;
    return `${Math.min(profile.totalWordsCollected, target)} / ${target} words`;
  }
  if (cond.includes('bestScore')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 0;
    return `${Math.min(profile.bestScore, target).toLocaleString()} / ${target.toLocaleString()} pts`;
  }
  if (cond.includes('totalScore')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 0;
    return `${Math.min(profile.totalScore, target).toLocaleString()} / ${target.toLocaleString()} total pts`;
  }
  if (cond.includes('favoriteMode === "speed"')) {
    return profile.favoriteMode === 'speed' ? 'Complete!' : 'Play a Speed Run';
  }
  if (cond.includes('favoriteMode === "marathon"')) {
    return profile.favoriteMode === 'marathon' ? 'Complete!' : 'Play a Marathon';
  }
  if (cond.includes('totalPlayTime')) {
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 23 || hour < 5;
    return isNight ? 'Complete!' : 'Play between 11 PM – 5 AM';
  }

  return `See: ${title.description}`;
}

/**
 * Rough fraction (0–1) estimating how close the player is to earning a title.
 * Only used for UI progress bar visualisation.
 */
function estimateTitleFraction(profile: PlayerProfile, title: PlayerTitle): number {
  const cond = title.condition;

  if (cond.includes('totalGamesPlayed')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 1;
    return Math.min(profile.totalGamesPlayed / target, 1);
  }
  if (cond.includes('totalWordsCollected')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 1;
    return Math.min(profile.totalWordsCollected / target, 1);
  }
  if (cond.includes('bestScore')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 1;
    return Math.min(profile.bestScore / target, 1);
  }
  if (cond.includes('totalScore')) {
    const match = cond.match(/(\d+)/);
    const target = match ? parseInt(match[1], 10) : 1;
    return Math.min(profile.totalScore / target, 1);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// 5. getLevelMilestoneReward
// ---------------------------------------------------------------------------

/** Every 5 levels yields a milestone. The reward type rotates in a cycle of 3. */
const MILESTONE_CYCLE: MilestoneReward['type'][] = [
  'coinBonus',
  'avatarUnlock',
  'titleUnlock',
];

/** Number of coins awarded on coin-bonus milestones. Scales with level. */
function milestoneCoins(level: number): number {
  return 50 + level * 10;
}

/** Avatar unlock hint text for the given level. */
function milestoneAvatarHint(level: number): string {
  const hints = [
    'A mysterious creature awaits...',
    'An ancient artifact can be found...',
    'A rare beast emerges...',
    'A legendary companion appears...',
    'An otherworldly guardian...',
    'A mythical spirit awakens...',
    'A celestial watcher descends...',
    'A primordial force materialises...',
    'A forgotten deity returns...',
    'A transcendent being manifests...',
  ];
  return hints[(level / 5 - 1) % hints.length];
}

/** Title unlock hint for the given level. */
function milestoneTitleHint(level: number): string {
  const hints = [
    'A new title of distinction is yours.',
    'Words of power echo in your name.',
    'The snake recognises your prowess.',
    'Your legend grows across the grid.',
    'Mastery is etched into your identity.',
    'A heraldic title befits your rank.',
    'Your skill demands recognition.',
    'A grand title is inscribed for you.',
    'The word-realm celebrates your ascent.',
    'An ultimate title is bestowed upon you.',
  ];
  return hints[(level / 5 - 1) % hints.length];
}

export function getLevelMilestoneReward(level: number): MilestoneReward | null {
  try {
    // Only every 5th level has a milestone
    if (level <= 0 || level % 5 !== 0) return null;

    const cycleIndex = ((level / 5) - 1) % MILESTONE_CYCLE.length;
    const rewardType = MILESTONE_CYCLE[cycleIndex];

    switch (rewardType) {
      case 'coinBonus':
        return {
          level,
          type: 'coinBonus',
          description: `Earn ${milestoneCoins(level)} bonus coins!`,
          coinAmount: milestoneCoins(level),
          icon: '🪙',
        };
      case 'avatarUnlock':
        return {
          level,
          type: 'avatarUnlock',
          description: milestoneAvatarHint(level),
          avatarHint: milestoneAvatarHint(level),
          icon: '🎭',
        };
      case 'titleUnlock':
        return {
          level,
          type: 'titleUnlock',
          description: milestoneTitleHint(level),
          titleHint: milestoneTitleHint(level),
          icon: '🏅',
        };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Get all upcoming milestones from the current level onward. */
export function getUpcomingMilestones(currentLevel: number, count: number = 3): MilestoneReward[] {
  const milestones: MilestoneReward[] = [];
  let lvl = currentLevel + 1;
  while (milestones.length < count && lvl <= 100) {
    const reward = getLevelMilestoneReward(lvl);
    if (reward) milestones.push(reward);
    lvl++;
  }
  return milestones;
}

// ---------------------------------------------------------------------------
// 6. getXPSessionVelocity
// ---------------------------------------------------------------------------

export function getXPSessionVelocity(): SessionVelocity {
  try {
    const session = loadSession();
    const now = Date.now();
    const elapsedMs = now - session.sessionStart;
    const elapsedMin = Math.max(elapsedMs / 60_000, 0.01); // avoid divide-by-zero

    const xpPerMinute = session.totalXPEarned / elapsedMin;

    // Estimate minutes until next level
    let estimatedMinutesToNextLevel: number | null = null;
    try {
      const profile = loadProfile() ?? createDefaultProfile();
      const lvl = calculateLevel(profile.xp);
      const remainingXP = lvl.xpToNext - lvl.currentXp;
      if (remainingXP > 0 && xpPerMinute > 0) {
        estimatedMinutesToNextLevel = remainingXP / xpPerMinute;
      }
    } catch {
      /* unable to estimate */
    }

    return {
      xpPerMinute: Math.round(xpPerMinute * 100) / 100,
      totalXPThisSession: session.totalXPEarned,
      sessionDurationMinutes: Math.round(elapsedMin * 10) / 10,
      eventCount: session.events.length,
      estimatedMinutesToNextLevel,
    };
  } catch {
    return {
      xpPerMinute: 0,
      totalXPThisSession: 0,
      sessionDurationMinutes: 0,
      eventCount: 0,
      estimatedMinutesToNextLevel: null,
    };
  }
}

// ---------------------------------------------------------------------------
// 7. logXPEvent
// ---------------------------------------------------------------------------

export function logXPEvent(type: XPEventType, amount: number): void {
  try {
    const session = loadSession();

    const entry: XPEventLogEntry = {
      type,
      amount: Math.max(0, Math.round(amount)),
      timestamp: Date.now(),
    };

    session.events.push(entry);

    // Keep the event list from growing unbounded (last 500 events)
    if (session.events.length > 500) {
      // Keep the last 500, but preserve the sessionStart
      session.events = session.events.slice(-500);
    }

    // Accumulate into breakdown
    const cat = eventTypeToCategory(type);
    session.breakdown[cat] += entry.amount;
    session.totalXPEarned += entry.amount;

    sessionCache = session;
    scheduleFlush();
  } catch {
    /* silent — must not crash the game loop */
  }
}

// ---------------------------------------------------------------------------
// 8. onLevelUp
// ---------------------------------------------------------------------------

export function onLevelUp(newLevel: number): LevelUpEntry {
  try {
    const profile = loadProfile() ?? createDefaultProfile();

    // Check for any title unlocks at this level
    const unlockedTitles = checkTitleUnlocks(profile);
    const titleIds = unlockedTitles.map((t) => t.id);

    const entry: LevelUpEntry = {
      level: newLevel,
      timestamp: Date.now(),
      xpAtLevelUp: profile.xp,
      titlesUnlocked: titleIds,
    };

    addLevelHistoryEntry(entry);

    // Persist any new titles into the profile
    if (unlockedTitles.length > 0) {
      for (const title of unlockedTitles) {
        if (!profile.titles.includes(title.id)) {
          profile.titles = [...profile.titles, title.id];
        }
      }
      saveProfile(profile);
    }

    return entry;
  } catch {
    // Return a safe fallback entry so callers never get null
    return {
      level: newLevel,
      timestamp: Date.now(),
      xpAtLevelUp: 0,
      titlesUnlocked: [],
    };
  }
}

// ---------------------------------------------------------------------------
// 9. syncWithProfile
// ---------------------------------------------------------------------------

export function syncWithProfile(): { synced: boolean; level: number; xp: number } {
  try {
    const profile = loadProfile();
    if (!profile) return { synced: false, level: 1, xp: 0 };

    // Invalidate caches so next read picks up fresh profile data
    sessionCache = null;
    levelHistoryCache = null;

    // Reload session and verify it references the current state
    const session = loadSession();

    // Ensure the profile-level fields in our cache are coherent
    const lvl = calculateLevel(profile.xp);

    return {
      synced: true,
      level: lvl.level,
      xp: profile.xp,
    };
  } catch {
    return { synced: false, level: 1, xp: 0 };
  }
}

// ---------------------------------------------------------------------------
// 10. resetSession
// ---------------------------------------------------------------------------

export function resetSession(): void {
  try {
    // Clear session cache and localStorage entry
    sessionCache = null;
    safeRemoveItem(SESSION_STORAGE_KEY);

    // Flush any pending write
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    // Level history is NOT cleared — it persists across sessions.
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------------
// Bonus: clearLevelHistory — for debugging or profile reset
// ---------------------------------------------------------------------------

export function clearLevelHistory(): void {
  try {
    levelHistoryCache = [];
    safeRemoveItem(LEVEL_HISTORY_KEY);
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------------
// Bonus: getSessionEventLog — raw event log for debugging / analytics
// ---------------------------------------------------------------------------

export function getSessionEventLog(): XPEventLogEntry[] {
  try {
    const session = loadSession();
    return [...session.events];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Bonus: getSessionStartTime — when the current session began
// ---------------------------------------------------------------------------

export function getSessionStartTime(): number {
  try {
    const session = loadSession();
    return session.sessionStart;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Bonus: isMilestoneLevel — quick check if a level is a 5× milestone
// ---------------------------------------------------------------------------

export function isMilestoneLevel(level: number): boolean {
  return level > 0 && level % 5 === 0;
}

// ---------------------------------------------------------------------------
// Bonus: formatDuration — formats ms into a human-readable string
// ---------------------------------------------------------------------------

export function formatSessionDuration(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Bonus: getTotalLevelUps — count of level-ups recorded in history
// ---------------------------------------------------------------------------

export function getTotalLevelUps(): number {
  try {
    return loadLevelHistory().length;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Bonus: getRecentLevelUps — last N level-ups for a feed display
// ---------------------------------------------------------------------------

export function getRecentLevelUps(count: number = 5): LevelUpEntry[] {
  try {
    const history = loadLevelHistory();
    return history.slice(0, count);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Bonus: getMostProductiveEventType — which event type earned the most XP
// ---------------------------------------------------------------------------

export function getMostProductiveEventType(): {
  type: XPEventType | null;
  label: string;
  amount: number;
} {
  try {
    const breakdown = getXPBreakdown();
    if (breakdown.details.length === 0) {
      return { type: null, label: 'None yet', amount: 0 };
    }
    const top = breakdown.details[0]; // already sorted by amount desc
    return {
      type: top.type,
      label: top.label,
      amount: top.amount,
    };
  } catch {
    return { type: null, label: 'Unknown', amount: 0 };
  }
}
