// =============================================================================
// Portal Pairs System for Word Snake Game
// =============================================================================
// Two linked portals on the grid. When the snake enters one, it teleports
// to the other. A cooldown prevents immediate re-teleport.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A grid position in cell coordinates */
export interface Position {
  x: number;
  y: number;
}

/** A single portal on the grid */
export interface Portal {
  position: Position;
  color: string;
  glowColor: string;
  pairId: number;
}

/** A pair of linked portals */
export interface PortalPair {
  id: number;
  portalA: Portal;
  portalB: Portal;
  spawnTime: number;
  cooldownEnd: number; // prevents immediate re-teleport (Date.now() + 1000)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Available color themes for portal pairs (6 pairs) */
export const PORTAL_COLORS = [
  { color: '#06b6d4', glowColor: '#06b6d440' },
  { color: '#a855f7', glowColor: '#a855f740' },
  { color: '#22c55e', glowColor: '#22c55e40' },
  { color: '#f43f5e', glowColor: '#f43f5e40' },
  { color: '#eab308', glowColor: '#eab30840' },
  { color: '#ec4899', glowColor: '#ec489940' },
] as const;

/** Minimum Manhattan distance between the two portals in a pair */
const MIN_PORTAL_DISTANCE = 10;

/** Margin from grid edges when placing portals */
const PORTAL_MARGIN = 5;

/** Cooldown after teleporting (ms) */
const TELEPORT_COOLDOWN_MS = 1000;

/** Number of words that must be eaten before portals can spawn */
const SPAWN_THRESHOLD = 5;

/** Per-word chance of spawning a portal (after threshold is met) */
const SPAWN_CHANCE_PER_WORD = 0.08;

/** Max portal pairs per 10 words eaten */
const PAIRS_PER_TIER = 10;

/** Hard cap on the number of portal pairs */
const MAX_PORTAL_PAIRS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a position to a string key for Set lookups */
function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

/** Manhattan distance between two positions */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Check whether a position is within the grid with margin */
function isInBounds(pos: Position, gridSize: { width: number; height: number }): boolean {
  return (
    pos.x >= PORTAL_MARGIN &&
    pos.x < gridSize.width - PORTAL_MARGIN &&
    pos.y >= PORTAL_MARGIN &&
    pos.y < gridSize.height - PORTAL_MARGIN
  );
}

/**
 * Build a set of occupied cell keys from snake, food, and obstacles.
 */
function buildOccupiedSet(
  snake: Position[],
  wordFood: Position | null,
  obstacles: { position: Position }[],
): Set<string> {
  const occupied = new Set<string>();
  for (const seg of snake) {
    occupied.add(posKey(seg));
  }
  if (wordFood) {
    occupied.add(posKey(wordFood));
  }
  for (const obs of obstacles) {
    occupied.add(posKey(obs.position));
  }
  return occupied;
}

/**
 * Generate a random valid position that is at least `minDistance` away from
 * `anchor`, not in the `occupied` set, and within grid bounds.
 *
 * Tries up to `maxAttempts` random candidates before giving up.
 */
function findValidPosition(
  anchor: Position,
  minDistance: number,
  occupied: Set<string>,
  gridSize: { width: number; height: number },
  maxAttempts: number,
): Position | null {
  const xMin = PORTAL_MARGIN;
  const xMax = gridSize.width - PORTAL_MARGIN - 1;
  const yMin = PORTAL_MARGIN;
  const yMax = gridSize.height - PORTAL_MARGIN - 1;

  for (let i = 0; i < maxAttempts; i++) {
    const pos: Position = {
      x: Math.floor(Math.random() * (xMax - xMin + 1)) + xMin,
      y: Math.floor(Math.random() * (yMax - yMin + 1)) + yMin,
    };

    if (occupied.has(posKey(pos))) continue;
    if (manhattanDistance(pos, anchor) < minDistance) continue;

    return pos;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determine whether a portal should spawn based on how many words have been eaten.
 *
 * After the player has eaten 5+ words, each subsequent word eaten has an 8%
 * chance of triggering a portal spawn.
 *
 * @param wordsEaten - Total number of words eaten so far
 * @returns `true` if a portal pair should be spawned
 */
export function shouldSpawnPortal(wordsEaten: number): boolean {
  if (wordsEaten < SPAWN_THRESHOLD) return false;
  return Math.random() < SPAWN_CHANCE_PER_WORD;
}

/**
 * Calculate the maximum number of portal pairs allowed based on words eaten.
 *
 * - 1 pair per 10 words eaten
 * - Hard cap at 3 pairs
 *
 * @param wordsEaten - Total number of words eaten so far
 * @returns Maximum allowed portal pairs
 */
export function getMaxPortalPairs(wordsEaten: number): number {
  return Math.min(Math.floor(wordsEaten / PAIRS_PER_TIER), MAX_PORTAL_PAIRS);
}

/**
 * Generate a new portal pair at valid positions on the grid.
 *
 * Both portals are placed:
 * - At least `PORTAL_MARGIN` (5) cells from all edges
 * - At least 10 Manhattan-distance cells apart from each other
 * - Not overlapping with the snake body, word food, or obstacles
 *
 * The pair receives matching colors from `PORTAL_COLORS`.
 *
 * @param snake     - Current snake body positions
 * @param wordFood  - Current food position (or null if none)
 * @param obstacles - Array of obstacles with position
 * @param gridSize  - Grid dimensions `{ width, height }`
 * @param nextId    - Unique id to assign to the new pair
 * @returns A `PortalPair` if valid positions were found, otherwise `null`
 */
export function generatePortalPair(
  snake: Position[],
  wordFood: Position | null,
  obstacles: { position: Position }[],
  gridSize: { width: number; height: number },
  nextId: number,
): PortalPair | null {
  const occupied = buildOccupiedSet(snake, wordFood, obstacles);

  // Pick a color scheme for this pair
  const colorIndex = nextId % PORTAL_COLORS.length;
  const colorTheme = PORTAL_COLORS[colorIndex];

  // Try to find two valid positions
  const maxAttempts = 200;

  // Find first portal position
  const posA = findValidPosition(
    // Use the snake head as anchor so portal A is far from the snake
    snake[0] || { x: 0, y: 0 },
    0, // no minimum distance from anchor for portal A
    occupied,
    gridSize,
    maxAttempts,
  );
  if (!posA) return null;

  // Add portal A to occupied set so portal B won't overlap
  occupied.add(posKey(posA));

  // Find second portal position (must be far from portal A)
  const posB = findValidPosition(
    posA,
    MIN_PORTAL_DISTANCE,
    occupied,
    gridSize,
    maxAttempts,
  );
  if (!posB) return null;

  const now = Date.now();

  return {
    id: nextId,
    portalA: {
      position: posA,
      color: colorTheme.color,
      glowColor: colorTheme.glowColor,
      pairId: nextId,
    },
    portalB: {
      position: posB,
      color: colorTheme.color,
      glowColor: colorTheme.glowColor,
      pairId: nextId,
    },
    spawnTime: now,
    cooldownEnd: 0, // no cooldown initially
  };
}

/**
 * Check whether the snake head is on a portal and can teleport.
 *
 * If the head is on a portal and the pair's cooldown has expired, returns
 * the destination (the other portal's position) and updates the pair's
 * cooldown. If the head is on a portal but cooldown is active, or if the
 * head is not on any portal, returns `{ teleport: false, destination: null, pairId: 0 }`.
 *
 * **Note:** This function mutates the `portalPairs` array in place by setting
 * `cooldownEnd` on the triggered pair.
 *
 * @param head        - Current position of the snake head
 * @param portalPairs - Array of active portal pairs
 * @param now         - Current timestamp (typically `Date.now()`)
 * @returns Teleport result with destination position and pair id
 */
export function checkPortalTeleport(
  head: Position,
  portalPairs: PortalPair[],
  now: number,
): { teleport: boolean; destination: Position | null; pairId: number } {
  for (const pair of portalPairs) {
    const onA =
      head.x === pair.portalA.position.x && head.y === pair.portalA.position.y;
    const onB =
      head.x === pair.portalB.position.x && head.y === pair.portalB.position.y;

    if (onA || onB) {
      // Check cooldown — prevent immediate re-teleport
      if (now < pair.cooldownEnd) {
        continue;
      }

      // Set cooldown to prevent teleporting back immediately
      pair.cooldownEnd = now + TELEPORT_COOLDOWN_MS;

      // Return the OTHER portal's position
      const destination = onA ? pair.portalB.position : pair.portalA.position;
      return {
        teleport: true,
        destination,
        pairId: pair.id,
      };
    }
  }

  return {
    teleport: false,
    destination: null,
    pairId: 0,
  };
}

/**
 * Compute rendering information for a portal.
 *
 * Provides animated properties for canvas drawing:
 * - **pulseScale**: oscillates between ~0.85 and 1.15 based on time
 * - **rotation**: continuous rotation in radians (one full turn per 2 seconds)
 *
 * @param portal - The portal to compute draw info for
 * @param now    - Current timestamp (typically `Date.now()`)
 * @returns Drawing properties for the portal
 */
export function getPortalDrawInfo(
  portal: Portal,
  now: number,
): { color: string; glowColor: string; pulseScale: number; rotation: number } {
  // Pulse: oscillates with a period of ~1.5 seconds
  const pulseT = (Math.sin(now / 750) + 1) / 2; // 0 → 1
  const pulseScale = 0.85 + pulseT * 0.3; // 0.85 → 1.15

  // Rotation: one full revolution every 2 seconds
  const rotation = ((now % 2000) / 2000) * Math.PI * 2;

  return {
    color: portal.color,
    glowColor: portal.glowColor,
    pulseScale,
    rotation,
  };
}
