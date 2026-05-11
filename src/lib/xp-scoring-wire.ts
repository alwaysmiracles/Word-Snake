/**
 * XP Scoring Wire — bridges game scoring events to the Player Profile XP system.
 *
 * Every meaningful game action (word eaten, combo, achievement, game complete, etc.)
 * flows through `awardXP()`, which calculates base XP, applies active multipliers,
 * mutates the profile, and returns a result payload for UI consumption.
 */

import {
  loadProfile,
  saveProfile,
  addXP,
  calculateLevel,
  checkTitleUnlocks,
  createDefaultProfile,
} from '@/lib/player-profile';
import type { PlayerProfile, PlayerTitle } from '@/lib/player-profile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type XPEventType =
  | 'wordEat'
  | 'comboReached'
  | 'powerUpCollected'
  | 'achievementUnlocked'
  | 'gameComplete'
  | 'dailyChallengeComplete'
  | 'speedRunComplete'
  | 'bossDefeated'
  | 'quizCorrect'
  | 'milestoneReached'
  | 'streakBonus'
  | 'newWordCollected'
  | 'perfectGame';

export type WordDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

export interface XPEventContext {
  wordDifficulty?: WordDifficulty;
  comboSize?: number;
  score?: number;
  timeElapsed?: number;       // seconds (for speed runs)
  streakDays?: number;
  difficultyLevel?: number;   // game difficulty above normal (0 = normal)
  [key: string]: unknown;
}

export interface XPMultiplier {
  source: string;
  multiplier: number;
  expiresAt: number;          // Date.now() timestamp; 0 = permanent
}

export interface XPAwardResult {
  xpAwarded: number;
  totalXP: number;
  levelUp: boolean;
  newLevel: number;
  newTitles: PlayerTitle[];
}

export interface SessionStats {
  totalXPEarned: number;
  eventsTriggered: number;
  biggestXPAward: number;
  multiplierCount: number;
}

export interface XPBreakdown {
  word: number;
  combo: number;
  powerup: number;
  achievement: number;
  game: number;
  special: number;
}

export interface XPProgress {
  currentXP: number;
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  progress: number;           // 0-1
  activeMultipliers: XPMultiplier[];
}

export interface XPScoringWire {
  profile: PlayerProfile;
  multipliers: XPMultiplier[];
  sessionStats: SessionStats;
  sessionBreakdown: XPBreakdown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIRE_STATE_KEY = 'ws_xp_wire_state';

const WORD_DIFFICULTY_MULTIPLIER: Record<WordDifficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  boss: 3.0,
};

/** Base XP for each event type. Some events apply additional scaling in `calcBaseXP`. */
const XP_REWARDS: Record<XPEventType, number> = {
  wordEat:              10,
  comboReached:         5,
  powerUpCollected:     15,
  achievementUnlocked:  50,
  gameComplete:         100,
  dailyChallengeComplete: 200,
  speedRunComplete:     150,
  bossDefeated:         75,
  quizCorrect:          30,
  milestoneReached:     40,
  streakBonus:          20,
  newWordCollected:     25,
  perfectGame:          300,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Which breakdown bucket does an event belong to? */
function eventCategory(event: XPEventType): keyof XPBreakdown {
  if (event === 'wordEat' || event === 'newWordCollected') return 'word';
  if (event === 'comboReached') return 'combo';
  if (event === 'powerUpCollected') return 'powerup';
  if (event === 'achievementUnlocked') return 'achievement';
  if (
    event === 'gameComplete' ||
    event === 'dailyChallengeComplete' ||
    event === 'speedRunComplete' ||
    event === 'perfectGame'
  )
    return 'game';
  return 'special';
}

/** Compute base XP for an event, incorporating contextual multipliers that are
 *  *part of the base calculation* (not the active XPMultiplier stack). */
function calcBaseXP(event: XPEventType, ctx?: XPEventContext): number {
  let base = XP_REWARDS[event];

  switch (event) {
    case 'wordEat':
      base *= WORD_DIFFICULTY_MULTIPLIER[ctx?.wordDifficulty ?? 'easy'];
      break;

    case 'comboReached':
      base *= Math.max(1, ctx?.comboSize ?? 1);
      break;

    case 'gameComplete':
      base += Math.floor((ctx?.score ?? 0) / 10);
      break;

    case 'speedRunComplete': {
      base += Math.floor((ctx?.score ?? 0) / 20);
      const t = ctx?.timeElapsed ?? Infinity;
      if (t < 30) base += 100;
      else if (t < 60) base += 50;
      break;
    }

    case 'streakBonus':
      base *= Math.max(1, ctx?.streakDays ?? 1);
      break;

    default:
      break;
  }

  return Math.round(base);
}

/** Collapse the active multiplier stack into a single scalar. */
function effectiveMultiplier(multipliers: XPMultiplier[]): number {
  let m = 1.0;
  for (const entry of multipliers) {
    m += (entry.multiplier - 1); // additive contribution
  }
  return Math.max(1.0, m);
}

/** Persist multiplier state to localStorage (best-effort). */
function persistMultipliers(multipliers: XPMultiplier[]): void {
  try {
    localStorage.setItem(WIRE_STATE_KEY, JSON.stringify(multipliers));
  } catch {
    /* noop */
  }
}

function loadMultipliers(): XPMultiplier[] {
  try {
    const raw = localStorage.getItem(WIRE_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* noop */
  }
  return [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Initialise a new wire instance, loading profile + persisted multipliers. */
export function createXPScoringWire(): XPScoringWire {
  const profile = loadProfile() ?? createDefaultProfile();
  const multipliers = loadMultipliers();
  return {
    profile,
    multipliers,
    sessionStats: {
      totalXPEarned: 0,
      eventsTriggered: 0,
      biggestXPAward: 0,
      multiplierCount: 0,
    },
    sessionBreakdown: {
      word: 0,
      combo: 0,
      powerup: 0,
      achievement: 0,
      game: 0,
      special: 0,
    },
  };
}

// ---- 5. awardXP ----

export function awardXP(
  wire: XPScoringWire,
  event: XPEventType,
  ctx?: XPEventContext,
): XPAwardResult {
  updateMultipliers(wire); // prune expired before awarding

  const base = calcBaseXP(event, ctx);
  const mult = effectiveMultiplier(wire.multipliers);
  const xpAwarded = Math.round(base * mult);

  // Mutate profile
  const result = addXP(wire.profile, xpAwarded);
  wire.profile = result.profile;

  // Persist
  saveProfile(wire.profile);

  // Check for new titles
  const newTitles = checkTitleUnlocks(wire.profile);
  for (const title of newTitles) {
    if (!wire.profile.titles.includes(title.id)) {
      wire.profile = {
        ...wire.profile,
        titles: [...wire.profile.titles, title.id],
      };
    }
  }
  if (newTitles.length > 0) saveProfile(wire.profile);

  // Session tracking
  wire.sessionStats.totalXPEarned += xpAwarded;
  wire.sessionStats.eventsTriggered += 1;
  if (xpAwarded > wire.sessionStats.biggestXPAward) {
    wire.sessionStats.biggestXPAward = xpAwarded;
  }

  const cat = eventCategory(event);
  wire.sessionBreakdown[cat] += xpAwarded;

  return {
    xpAwarded,
    totalXP: wire.profile.xp,
    levelUp: result.leveledUp,
    newLevel: result.newLevel,
    newTitles,
  };
}

// ---- 6. addMultiplier ----

export function addMultiplier(
  wire: XPScoringWire,
  source: string,
  multiplier: number,
  durationMs?: number,
): void {
  // Replace existing multiplier from the same source
  wire.multipliers = wire.multipliers.filter((m) => m.source !== source);

  wire.multipliers.push({
    source,
    multiplier,
    expiresAt: durationMs ? Date.now() + durationMs : 0,
  });

  wire.sessionStats.multiplierCount = wire.multipliers.length;
  persistMultipliers(wire.multipliers);
}

// ---- 7. removeMultiplier ----

export function removeMultiplier(wire: XPScoringWire, source: string): void {
  wire.multipliers = wire.multipliers.filter((m) => m.source !== source);
  wire.sessionStats.multiplierCount = wire.multipliers.length;
  persistMultipliers(wire.multipliers);
}

// ---- 8. updateMultipliers ----

export function updateMultipliers(wire: XPScoringWire): void {
  const now = Date.now();
  const before = wire.multipliers.length;
  wire.multipliers = wire.multipliers.filter(
    (m) => m.expiresAt === 0 || m.expiresAt > now,
  );
  if (wire.multipliers.length !== before) {
    wire.sessionStats.multiplierCount = wire.multipliers.length;
    persistMultipliers(wire.multipliers);
  }
}

// ---- 9. getSessionStats ----

export function getSessionStats(wire: XPScoringWire): SessionStats {
  return { ...wire.sessionStats };
}

// ---- 10. resetSessionStats ----

export function resetSessionStats(wire: XPScoringWire): void {
  wire.sessionStats = {
    totalXPEarned: 0,
    eventsTriggered: 0,
    biggestXPAward: 0,
    multiplierCount: wire.multipliers.length,
  };
  wire.sessionBreakdown = {
    word: 0,
    combo: 0,
    powerup: 0,
    achievement: 0,
    game: 0,
    special: 0,
  };
}

// ---- 11. getXPProgress ----

export function getXPProgress(wire: XPScoringWire): XPProgress {
  const lvl = calculateLevel(wire.profile.xp);
  return {
    currentXP: wire.profile.xp,
    level: lvl.level,
    currentLevelXP: lvl.currentXp,
    xpToNextLevel: lvl.xpToNext,
    progress: lvl.progress,
    activeMultipliers: [...wire.multipliers],
  };
}

// ---- 12. formatXP ----

export function formatXP(amount: number): string {
  return Math.round(amount).toLocaleString('en-US');
}

// ---- 13. getXPBreakdown ----

export function getXPBreakdown(wire: XPScoringWire): XPBreakdown {
  return { ...wire.sessionBreakdown };
}

// ---------------------------------------------------------------------------
// Convenience: preset multiplier builders
// ---------------------------------------------------------------------------

/** Activate the Double-XP power-up (2× for 30 s). */
export function activateDoubleXP(wire: XPScoringWire): void {
  addMultiplier(wire, 'double_xp_powerup', 2.0, 30_000);
}

/** Activate streak bonus (+0.5× per day, capped at +3×). */
export function activateStreakBonus(wire: XPScoringWire, streakDays: number): void {
  const bonus = Math.min(streakDays * 0.5, 3.0);
  addMultiplier(wire, 'streak_bonus', 1.0 + bonus); // 30-day streak → 4×
}

/** Activate difficulty bonus (+0.25× per level above normal). */
export function activateDifficultyBonus(wire: XPScoringWire, difficultyLevel: number): void {
  if (difficultyLevel <= 0) return;
  const bonus = Math.min(difficultyLevel * 0.25, 2.0);
  addMultiplier(wire, 'difficulty_bonus', 1.0 + bonus);
}
