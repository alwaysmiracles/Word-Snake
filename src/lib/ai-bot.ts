// =============================================================================
// AI Bot Opponent System for Word Snake Game
// =============================================================================
// Provides an AI-controlled snake opponent with configurable difficulty levels.
// The bot uses greedy pathfinding with dead-end avoidance and occasional
// random moves to create a realistic but beatable opponent.
// =============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Grid width in cells */
export const GRID_WIDTH = 30;

/** Grid height in cells */
export const GRID_HEIGHT = 25;

/** Configuration settings per difficulty level */
export const AI_BOT_CONFIG = {
  easy: {
    intelligence: 0.3,
    label: 'Easy',
    description: 'Slow reactions, frequent random moves',
  },
  medium: {
    intelligence: 0.6,
    label: 'Medium',
    description: 'Balanced — seeks food but makes occasional mistakes',
  },
  hard: {
    intelligence: 0.9,
    label: 'Hard',
    description: 'Near-optimal pathfinding with minimal errors',
  },
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Four cardinal directions the snake can move */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** A grid position in cell coordinates */
export interface Position {
  x: number;
  y: number;
}

/** Full state of an AI bot instance */
export interface AiBotState {
  /** The bot's snake body — index 0 is the head */
  snake: Position[];
  /** Current movement direction */
  direction: Direction;
  /** Current score */
  score: number;
  /** Words the bot has eaten (in order) */
  wordsEaten: string[];
  /** Whether the bot is still alive */
  alive: boolean;
  /** Intelligence factor from 0.0 (random) to 1.0 (optimal) */
  intelligence: number;
}

/** Color information for rendering the AI bot snake */
export interface AiBotDrawInfo {
  /** Hex color for the snake head */
  headColor: string;
  /** Gradient start color (near head) */
  bodyStartColor: string;
  /** Gradient end color (near tail) */
  bodyEndColor: string;
  /** Glow / shadow color */
  glowColor: string;
  /** White part of the eye */
  eyeWhiteColor: string;
  /** Dark pupil color */
  eyePupilColor: string;
}

/** Return type for `updateAiBot` */
export interface AiBotUpdateResult {
  ateFood: boolean;
  word?: string;
}

// ---------------------------------------------------------------------------
// Direction utilities
// ---------------------------------------------------------------------------

/** All four directions in a consistent order for iteration */
const ALL_DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

/** Movement vector for each direction (dx, dy) */
const DIR_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  UP:    { dx: 0,  dy: -1 },
  DOWN:  { dx: 0,  dy: 1  },
  LEFT:  { dx: -1, dy: 0  },
  RIGHT: { dx: 1,  dy: 0  },
};

/** Opposite direction — used to prevent 180° reversal */
const OPPOSITE: Record<Direction, Direction> = {
  UP:    'DOWN',
  DOWN:  'UP',
  LEFT:  'RIGHT',
  RIGHT: 'LEFT',
};

/**
 * Apply a direction to a position, returning the resulting neighbour cell.
 */
function step(from: Position, dir: Direction): Position {
  const v = DIR_VECTORS[dir];
  return { x: from.x + v.dx, y: from.y + v.dy };
}

/**
 * Check whether a position is inside the grid bounds.
 */
function isInsideGrid(pos: Position): boolean {
  return pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT;
}

/**
 * Convert a position to a string key for Set lookups.
 */
function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

// ---------------------------------------------------------------------------
// AI Bot Creation
// ---------------------------------------------------------------------------

/**
 * Create a new AI bot with the specified difficulty.
 *
 * The bot spawns at (24, 12) facing LEFT with 3 body segments:
 *   head → (24, 12)
 *   body → (25, 12)
 *   tail → (26, 12)
 *
 * @param difficulty - `'easy'` | `'medium'` | `'hard'`
 * @returns A fresh `AiBotState`
 */
export function createAiBot(difficulty: 'easy' | 'medium' | 'hard'): AiBotState {
  const config = AI_BOT_CONFIG[difficulty];

  return {
    snake: [
      { x: 24, y: 12 },
      { x: 25, y: 12 },
      { x: 26, y: 12 },
    ],
    direction: 'LEFT',
    score: 0,
    wordsEaten: [],
    alive: true,
    intelligence: config.intelligence,
  };
}

// ---------------------------------------------------------------------------
// AI Movement Logic
// ---------------------------------------------------------------------------

/**
 * Count the number of safe neighbours around a given position.
 *
 * A neighbour is "safe" when it is inside the grid and not occupied by any
 * obstacle (snake bodies, etc.). This is used as a lightweight dead-end
 * detector — positions with fewer safe exits are more likely to be traps.
 */
function countSafeNeighbours(
  pos: Position,
  obstacles: Set<string>,
  currentDir: Direction,
): number {
  let count = 0;

  for (const dir of ALL_DIRECTIONS) {
    // Skip reversing direction — a snake can't go backwards
    if (dir === OPPOSITE[currentDir]) continue;

    const next = step(pos, dir);
    if (isInsideGrid(next) && !obstacles.has(posKey(next))) {
      count++;
    }
  }

  return count;
}

/**
 * Calculate the next direction for the AI bot.
 *
 * Strategy (greedy with dead-end avoidance):
 * 1. If there is no food, pick any safe direction (randomly).
 * 2. Determine the "ideal" direction toward food (prefer the axis with the
 *    larger distance first, breaking ties towards horizontal).
 * 3. With probability `(1 - intelligence)`, ignore the ideal direction and
 *    pick a random safe move instead (makes the bot beatable).
 * 4. Check whether the ideal direction's next cell is safe.
 *    - If safe → use it.
 *    - If not → try the other non-opposite directions.
 * 5. When multiple directions are equally viable, prefer the one whose
 *    destination has the most safe neighbours (avoids dead ends).
 *
 * @param bot       - Current bot state
 * @param foodPos   - Position of the current food, or `null` if none
 * @param playerSnake - Player's snake body array (used as obstacles)
 * @param obstacles   - Set of `"x,y"` keys for all occupied cells
 * @returns The direction the bot should move next
 */
export function calculateAiBotMove(
  bot: AiBotState,
  foodPos: Position | null,
  playerSnake: Position[],
  obstacles: Set<string>,
): Direction {
  if (!bot.alive) return bot.direction;

  const head = bot.snake[0];
  const currentDir = bot.direction;
  const reverseDir = OPPOSITE[currentDir];

  // Build a quick "is safe?" predicate
  const isSafe = (pos: Position): boolean =>
    isInsideGrid(pos) && !obstacles.has(posKey(pos));

  // Collect all candidate directions (never reverse)
  const candidates = ALL_DIRECTIONS.filter((d) => d !== reverseDir);
  const safeCandidates = candidates.filter((d) => isSafe(step(head, d)));

  // If nothing is safe, just keep going (will die next tick anyway)
  if (safeCandidates.length === 0) {
    return currentDir;
  }

  // -----------------------------------------------------------------------
  // No food — wander randomly among safe directions
  // -----------------------------------------------------------------------
  if (foodPos === null) {
    return safeCandidates[Math.floor(Math.random() * safeCandidates.length)];
  }

  // -----------------------------------------------------------------------
  // Determine ideal direction(s) toward food
  // -----------------------------------------------------------------------
  const dx = foodPos.x - head.x;
  const dy = foodPos.y - head.y;

  // We prefer moving along the axis with the larger gap.  This creates more
  // direct paths and helps the bot navigate around obstacles.
  const idealDirs: Direction[] = [];

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx !== 0) idealDirs.push(dx > 0 ? 'RIGHT' : 'LEFT');
    if (dy !== 0) idealDirs.push(dy > 0 ? 'DOWN' : 'UP');
  } else {
    if (dy !== 0) idealDirs.push(dy > 0 ? 'DOWN' : 'UP');
    if (dx !== 0) idealDirs.push(dx > 0 ? 'RIGHT' : 'LEFT');
  }

  // -----------------------------------------------------------------------
  // Random move chance (makes bot less robotic on lower difficulties)
  // -----------------------------------------------------------------------
  if (Math.random() > bot.intelligence) {
    return safeCandidates[Math.floor(Math.random() * safeCandidates.length)];
  }

  // -----------------------------------------------------------------------
  // Try ideal directions first; fall back to others
  // -----------------------------------------------------------------------

  // Score each safe candidate: +10 if it matches an ideal direction,
  // +safeNeighbourCount for dead-end avoidance.
  type ScoredDir = { dir: Direction; score: number };
  const scored: ScoredDir[] = [];

  for (const dir of safeCandidates) {
    let score = 0;

    // Bonus for being an ideal direction
    if (idealDirs.includes(dir)) {
      score += 10;
    }

    // Dead-end avoidance: prefer positions with more exits
    const nextPos = step(head, dir);
    score += countSafeNeighbours(nextPos, obstacles, dir);

    scored.push({ dir, score });
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored[0].dir;
}

// ---------------------------------------------------------------------------
// AI Bot Update
// ---------------------------------------------------------------------------

/**
 * Move the AI bot one step forward and handle food collection.
 *
 * The bot's new head is placed at `step(head, newDirection)`.  If the head
 * lands on the food position, the tail is **not** removed (the snake grows)
 * and `ateFood` is set to `true`.
 *
 * @param bot       - Current bot state (mutated in place)
 * @param direction - The direction to move (should come from `calculateAiBotMove`)
 * @param foodPos   - Current food position, or `null`
 * @param word      - The word associated with the current food (used when eaten)
 * @returns `{ ateFood, word? }` indicating whether food was consumed
 */
export function updateAiBot(
  bot: AiBotState,
  direction: Direction,
  foodPos: Position | null,
  word: string | undefined,
): AiBotUpdateResult {
  if (!bot.alive) {
    return { ateFood: false };
  }

  // Update direction
  bot.direction = direction;

  // Calculate new head position
  const newHead = step(bot.snake[0], direction);

  // Insert new head at the front
  bot.snake.unshift(newHead);

  // Check if food was eaten
  if (foodPos !== null && newHead.x === foodPos.x && newHead.y === foodPos.y) {
    // Don't remove tail — snake grows
    bot.score += 10;
    if (word) {
      bot.wordsEaten.push(word);
    }
    return { ateFood: true, word };
  }

  // Remove tail (normal movement)
  bot.snake.pop();

  return { ateFood: false };
}

// ---------------------------------------------------------------------------
// Collision Detection
// ---------------------------------------------------------------------------

/**
 * Check whether the AI bot has collided with anything fatal.
 *
 * A collision occurs when the bot's head is:
 * - Outside the grid bounds (wall collision)
 * - Overlapping any segment of its own body (self collision)
 * - Overlapping any segment of the player's body (player collision)
 *
 * @param bot          - Current bot state
 * @param playerSnake  - Player's snake body array
 * @returns `true` if the bot is still alive, `false` if it has collided
 */
export function checkAiBotCollision(
  bot: AiBotState,
  playerSnake: Position[],
): boolean {
  if (!bot.alive) return false;

  const head = bot.snake[0];

  // Wall collision
  if (!isInsideGrid(head)) {
    bot.alive = false;
    return false;
  }

  // Self collision (skip index 0 — that's the head itself)
  for (let i = 1; i < bot.snake.length; i++) {
    if (bot.snake[i].x === head.x && bot.snake[i].y === head.y) {
      bot.alive = false;
      return false;
    }
  }

  // Player body collision
  for (const seg of playerSnake) {
    if (seg.x === head.x && seg.y === head.y) {
      bot.alive = false;
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Drawing Info
// ---------------------------------------------------------------------------

/**
 * Return color information for rendering the AI bot.
 *
 * Uses a distinct orange/red color scheme so the bot is easily distinguishable
 * from the player's snake at a glance.
 */
export function getAiBotDrawInfo(): AiBotDrawInfo {
  return {
    headColor:      '#f97316', // Tailwind orange-500
    bodyStartColor: '#fb923c', // Tailwind orange-400
    bodyEndColor:   '#c2410c', // Tailwind orange-700
    glowColor:      '#fdba74', // Tailwind orange-300
    eyeWhiteColor:  '#ffffff',
    eyePupilColor:  '#1c1917', // Tailwind stone-900 (dark)
  };
}
