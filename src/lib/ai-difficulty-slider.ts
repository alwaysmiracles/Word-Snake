'use client';

// =============================================================================
// AI Difficulty Slider — Real-time difficulty adjustment for AI bot opponents
// =============================================================================
// Provides a smooth 1–10 difficulty scale with interpolated parameters so the
// player can tweak the AI's competence mid-game via a slider UI.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Full descriptor for a single difficulty notch (1–10). */
export interface AiDifficultyLevel {
  level: number;
  label: string;
  description: string;
  emoji: string;
  color: string;
  /** Quality of pathfinding 0 (random) – 1 (optimal) */
  pathfindQuality: number;
  /** Reaction delay in ms before the bot moves */
  reactionDelay: number;
  /** Probability 0–1 of making a suboptimal move each tick */
  mistakeChance: number;
  /** How aggressively the bot prioritises target words 0–1 */
  targetPriority: number;
}

/** Mutable configuration snapshot for the slider controller. */
export interface AiDifficultyConfig {
  currentLevel: number;
  targetLevel: number;
  /** Lerp factor per second (higher = snappier transitions) */
  smoothing: number;
}

/** Public API returned by `createAiDifficultySlider`. */
export interface AiDifficultySlider {
  getLevel(): number;
  setLevel(level: number): void;
  adjustBy(delta: number): void;
  getLevelConfig(): AiDifficultyLevel;
  getPathfindQuality(): number;
  getReactionDelay(): number;
  getMistakeChance(): number;
  getTargetPriority(): number;
  update(dt: number): void;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Level Definitions (1–10)
// ---------------------------------------------------------------------------

const LEVELS: AiDifficultyLevel[] = [
  { level: 1,  label: 'Beginner',    description: 'Barely tries — lots of random wandering',      emoji: '🐣', color: '#a3e635', pathfindQuality: 0.10, reactionDelay: 800, mistakeChance: 0.70, targetPriority: 0.10 },
  { level: 2,  label: 'Easy',        description: 'Slow reactions, frequent blunders',             emoji: '🟢', color: '#4ade80', pathfindQuality: 0.20, reactionDelay: 650, mistakeChance: 0.55, targetPriority: 0.20 },
  { level: 3,  label: 'Casual',      description: 'Relaxed play, makes noticeable mistakes',       emoji: '🌿', color: '#34d399', pathfindQuality: 0.30, reactionDelay: 520, mistakeChance: 0.42, targetPriority: 0.30 },
  { level: 4,  label: 'Normal',      description: 'Balanced — seeks food but errs sometimes',      emoji: '⭐', color: '#facc15', pathfindQuality: 0.45, reactionDelay: 400, mistakeChance: 0.30, targetPriority: 0.45 },
  { level: 5,  label: 'Moderate',    description: 'Competent pathfinding, occasional slips',       emoji: '🔥', color: '#f59e0b', pathfindQuality: 0.55, reactionDelay: 300, mistakeChance: 0.22, targetPriority: 0.55 },
  { level: 6,  label: 'Hard',        description: 'Sharp reflexes, rarely falters',                emoji: '💪', color: '#f97316', pathfindQuality: 0.67, reactionDelay: 220, mistakeChance: 0.15, targetPriority: 0.67 },
  { level: 7,  label: 'Expert',      description: 'Near-optimal routes, very few mistakes',        emoji: '🧠', color: '#ef4444', pathfindQuality: 0.78, reactionDelay: 150, mistakeChance: 0.09, targetPriority: 0.78 },
  { level: 8,  label: 'Veteran',     description: 'Precise and aggressive word targeting',         emoji: '⚡', color: '#dc2626', pathfindQuality: 0.87, reactionDelay: 100, mistakeChance: 0.05, targetPriority: 0.87 },
  { level: 9,  label: 'Master',      description: 'Almost flawless — a real challenge',            emoji: '👑', color: '#b91c1c', pathfindQuality: 0.95, reactionDelay: 50,  mistakeChance: 0.02, targetPriority: 0.95 },
  { level: 10, label: 'Grandmaster', description: 'Peak performance — merciless AI',              emoji: '💀', color: '#7f1d1d', pathfindQuality: 1.00, reactionDelay: 10,  mistakeChance: 0.00, targetPriority: 1.00 },
];

/** Public read-only array of all 10 difficulty levels. */
export const AI_DIFFICULTY_LEVELS: ReadonlyArray<AiDifficultyLevel> = LEVELS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type InterpolatedField = 'pathfindQuality' | 'reactionDelay' | 'mistakeChance' | 'targetPriority';

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linearly interpolate a numeric field between two adjacent levels. */
function interpolate(level: number, field: InterpolatedField): number {
  const lo = clamp(Math.floor(level) - 1, 0, 8);
  const hi = clamp(lo + 1, 0, 9);
  const frac = level - Math.floor(level);
  return lerp(LEVELS[lo][field], LEVELS[hi][field], frac);
}

/** Return the level entry nearest to the given (possibly fractional) level. */
function nearestLevel(level: number): AiDifficultyLevel {
  return LEVELS[clamp(Math.round(level), 1, 10) - 1];
}

// ---------------------------------------------------------------------------
// Lookup Utilities (exported)
// ---------------------------------------------------------------------------

/** Return the hex colour for a given level (1–10). */
export function getDifficultyColor(level: number): string {
  return nearestLevel(level).color;
}

/** Return the human-readable label for a given level (1–10). */
export function getDifficultyLabel(level: number): string {
  return nearestLevel(level).label;
}

// ---------------------------------------------------------------------------
// Slider Factory
// ---------------------------------------------------------------------------

/**
 * Create a new AI difficulty slider controller.
 *
 * @param initialLevel - Starting level 1–10 (default 5)
 * @param smoothing    - Exponential-decay rate per second (default 4)
 */
export function createAiDifficultySlider(
  initialLevel = 5,
  smoothing = 4,
): AiDifficultySlider {
  let current = clamp(initialLevel, 1, 10);
  let target = current;
  let destroyed = false;

  const getLevel = (): number => current;

  const setLevel = (level: number): void => {
    if (!destroyed) target = clamp(level, 1, 10);
  };

  const adjustBy = (delta: number): void => {
    if (!destroyed) target = clamp(target + delta, 1, 10);
  };

  const getLevelConfig = (): AiDifficultyLevel => ({ ...nearestLevel(current) });

  const getPathfindQuality = (): number => interpolate(current, 'pathfindQuality');
  const getReactionDelay   = (): number => interpolate(current, 'reactionDelay');
  const getMistakeChance   = (): number => interpolate(current, 'mistakeChance');
  const getTargetPriority  = (): number => interpolate(current, 'targetPriority');

  const update = (dt: number): void => {
    if (destroyed) return;
    const factor = 1 - Math.exp(-smoothing * dt);
    current = lerp(current, target, factor);
  };

  const destroy = (): void => { destroyed = true; };

  return {
    getLevel, setLevel, adjustBy, getLevelConfig,
    getPathfindQuality, getReactionDelay, getMistakeChance, getTargetPriority,
    update, destroy,
  };
}
