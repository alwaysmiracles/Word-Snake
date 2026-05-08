'use client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface ObstacleScalingConfig {
  /** Multiplier applied to the base per-frame spawn chance (0–1 range) */
  spawnChanceMultiplier: number;
  /** Multiplier applied to obstacle movement speed */
  speedMultiplier: number;
  /** Maximum simultaneous moving obstacles on-screen */
  maxCount: number;
  /** Minimum words the player must have eaten before obstacles appear */
  minWordsToSpawn: number;
  /** Obstacle behaviour types that may be chosen at this tier */
  typesEnabled: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Preset scaling values keyed by difficulty and progress tier (1–5).
 *
 * Tier word-count ranges:
 *   Tier 1  0–10   │  Tier 2  11–20  │  Tier 3  21–30
 *   Tier 4  31–40  │  Tier 5  40+
 */
export const OBSTACLE_SCALING_PRESETS: Record<
  GameDifficulty,
  Record<number, ObstacleScalingConfig>
> = {
  easy: {
    1: { spawnChanceMultiplier: 0.30, speedMultiplier: 0.50, maxCount: 1, minWordsToSpawn: 5, typesEnabled: ['basic'] },
    2: { spawnChanceMultiplier: 0.40, speedMultiplier: 0.60, maxCount: 1, minWordsToSpawn: 4, typesEnabled: ['basic', 'slow'] },
    3: { spawnChanceMultiplier: 0.50, speedMultiplier: 0.70, maxCount: 2, minWordsToSpawn: 3, typesEnabled: ['basic', 'slow'] },
    4: { spawnChanceMultiplier: 0.60, speedMultiplier: 0.85, maxCount: 2, minWordsToSpawn: 2, typesEnabled: ['basic', 'slow', 'zigzag'] },
    5: { spawnChanceMultiplier: 0.70, speedMultiplier: 1.00, maxCount: 2, minWordsToSpawn: 2, typesEnabled: ['basic', 'slow', 'zigzag'] },
  },
  medium: {
    1: { spawnChanceMultiplier: 0.50, speedMultiplier: 0.70, maxCount: 1, minWordsToSpawn: 3, typesEnabled: ['basic'] },
    2: { spawnChanceMultiplier: 0.60, speedMultiplier: 0.85, maxCount: 2, minWordsToSpawn: 3, typesEnabled: ['basic', 'slow'] },
    3: { spawnChanceMultiplier: 0.70, speedMultiplier: 1.00, maxCount: 2, minWordsToSpawn: 2, typesEnabled: ['basic', 'slow', 'zigzag'] },
    4: { spawnChanceMultiplier: 0.80, speedMultiplier: 1.20, maxCount: 3, minWordsToSpawn: 2, typesEnabled: ['basic', 'slow', 'zigzag'] },
    5: { spawnChanceMultiplier: 0.90, speedMultiplier: 1.40, maxCount: 3, minWordsToSpawn: 1, typesEnabled: ['basic', 'slow', 'zigzag', 'fast'] },
  },
  hard: {
    1: { spawnChanceMultiplier: 0.70, speedMultiplier: 1.00, maxCount: 2, minWordsToSpawn: 2, typesEnabled: ['basic'] },
    2: { spawnChanceMultiplier: 0.80, speedMultiplier: 1.20, maxCount: 3, minWordsToSpawn: 2, typesEnabled: ['basic', 'slow', 'zigzag'] },
    3: { spawnChanceMultiplier: 0.90, speedMultiplier: 1.40, maxCount: 3, minWordsToSpawn: 1, typesEnabled: ['basic', 'slow', 'zigzag', 'fast'] },
    4: { spawnChanceMultiplier: 1.00, speedMultiplier: 1.60, maxCount: 4, minWordsToSpawn: 1, typesEnabled: ['basic', 'slow', 'zigzag', 'fast'] },
    5: { spawnChanceMultiplier: 1.00, speedMultiplier: 2.00, maxCount: 5, minWordsToSpawn: 1, typesEnabled: ['basic', 'slow', 'zigzag', 'fast', 'teleport'] },
  },
};

/** Human-readable descriptions for each progress tier. */
export const SCALING_DESCRIPTIONS: Record<number, string> = {
  1: 'Calm — few, slow obstacles to get you started.',
  2: 'Warming up — slightly faster with new movement patterns.',
  3: 'Getting tricky — zigzag movers appear.',
  4: 'Intense — fast obstacles and higher max count.',
  5: 'Maximum danger — every obstacle type active at peak speed.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the current progress tier (1–5) based on words eaten.
 *
 * | Range | Tier |
 * |-------|------|
 * | 0–10  | 1    |
 * | 11–20 | 2    |
 * | 21–30 | 3    |
 * | 31–40 | 4    |
 * | 40+   | 5    |
 */
export function getProgressTier(wordsEaten: number): number {
  if (wordsEaten >= 40) return 5;
  if (wordsEaten >= 31) return 4;
  if (wordsEaten >= 21) return 3;
  if (wordsEaten >= 11) return 2;
  return 1;
}

/** Return the full scaling config for the given difficulty and word progress. */
export function getObstacleScaling(
  difficulty: GameDifficulty,
  wordsEaten: number,
): ObstacleScalingConfig {
  const tier = getProgressTier(wordsEaten);
  return OBSTACLE_SCALING_PRESETS[difficulty][tier];
}

/** Speed multiplier convenience accessor (1.0 – 2.0). */
export function getObstacleSpeedMultiplier(
  difficulty: GameDifficulty,
  wordsEaten: number,
): number {
  return getObstacleScaling(difficulty, wordsEaten).speedMultiplier;
}

/** Dynamic max obstacle count convenience accessor. */
export function getMaxScaledObstacles(
  difficulty: GameDifficulty,
  wordsEaten: number,
): number {
  return getObstacleScaling(difficulty, wordsEaten).maxCount;
}

/**
 * Decide whether a new obstacle should spawn this frame.
 *
 * Combines:
 *   • Minimum-words gate
 *   • Current-count cap
 *   • Random chance scaled by `spawnChanceMultiplier`
 */
export function shouldSpawnScaledObstacle(
  difficulty: GameDifficulty,
  wordsEaten: number,
  currentCount: number,
): boolean {
  const config = getObstacleScaling(difficulty, wordsEaten);

  if (wordsEaten < config.minWordsToSpawn) return false;
  if (currentCount >= config.maxCount) return false;

  // Base per-frame spawn probability is ~1.5 %; scale by the tier multiplier.
  const BASE_SPAWN_CHANCE = 0.015;
  return Math.random() < BASE_SPAWN_CHANCE * config.spawnChanceMultiplier;
}
