// PvP Power-up Stealing System for Word Snake Game

import { POWERUP_CONFIG, type PowerUpType } from '@/lib/powerups'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Position {
  x: number
  y: number
}

export interface ActivePowerUp {
  type: string
  expiresAt: number
}

export interface StolenPowerUpEvent {
  fromPlayer: 1 | 2
  toPlayer: 1 | 2
  powerUpType: string
  timestamp: number
}

export interface PvpPowerUpState {
  stealCooldowns: Record<string, number> // powerUpType -> cooldownEnd timestamp
  recentSteals: StolenPowerUpEvent[]
  player1ActivePowerUps: ActivePowerUp[]
  player2ActivePowerUps: ActivePowerUp[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STEAL_COOLDOWN = 5000   // 5 seconds between steals
export const STEAL_RANGE = 3         // Manhattan distance threshold
export const MAX_RECENT_STEALS = 10  // Keep last 10 steals for display
export const STEAL_INDICATOR_DURATION = 2000 // How long steal indicator shows

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/**
 * Resolve the emoji for a power-up type. Falls back to a generic star.
 */
function powerUpEmoji(type: string): string {
  if (type in POWERUP_CONFIG) {
    return POWERUP_CONFIG[type as PowerUpType].emoji
  }
  return '⭐'
}

/**
 * Resolve the display label for a power-up type.
 */
function powerUpLabel(type: string): string {
  if (type in POWERUP_CONFIG) {
    return POWERUP_CONFIG[type as PowerUpType].label
  }
  return type
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a fresh PvP power-up state.
 */
export function createPvpPowerUpState(): PvpPowerUpState {
  return {
    stealCooldowns: {},
    recentSteals: [],
    player1ActivePowerUps: [],
    player2ActivePowerUps: [],
  }
}

/**
 * Check whether `thiefPlayer` can steal a power-up from `victimPlayer`.
 *
 * Returns `{ canSteal: true, targetType }` when the steal is possible,
 * where `targetType` is the victim's power-up that is expiring soonest.
 */
export function canStealPowerUp(
  thiefPlayer: 1 | 2,
  victimPlayer: 1 | 2,
  thiefPos: Position,
  victimPos: Position,
  victimPowerUps: ActivePowerUp[],
  state: PvpPowerUpState,
  now: number,
): { canSteal: boolean; targetType: string | null } {
  // Cannot steal from yourself
  if (thiefPlayer === victimPlayer) {
    return { canSteal: false, targetType: null }
  }

  // Must be within Manhattan range
  if (manhattanDistance(thiefPos, victimPos) > STEAL_RANGE) {
    return { canSteal: false, targetType: null }
  }

  // Victim must have active (non-expired) power-ups
  const active = victimPowerUps.filter((pu) => pu.expiresAt === 0 || pu.expiresAt > now)
  if (active.length === 0) {
    return { canSteal: false, targetType: null }
  }

  // Check if any of the victim's active power-ups are on cooldown for the thief
  // Cooldown is global per power-up type — if ANY of the victim's types are on
  // cooldown we still allow stealing a *different* type. We pick the one
  // expiring soonest that is NOT on cooldown.
  const sortedByExpiry = [...active].sort((a, b) => {
    // Power-ups with expiresAt === 0 (instant) are treated as expiring "now"
    const aExp = a.expiresAt === 0 ? 0 : a.expiresAt
    const bExp = b.expiresAt === 0 ? 0 : b.expiresAt
    return aExp - bExp
  })

  const available = sortedByExpiry.find(
    (pu) => !(pu.type in state.stealCooldowns) || state.stealCooldowns[pu.type] <= now,
  )

  if (!available) {
    // All stealable types are on cooldown
    return { canSteal: false, targetType: null }
  }

  return { canSteal: true, targetType: available.type }
}

/**
 * Execute a steal: remove the power-up from the victim's active list, set the
 * cooldown, and record the event.
 */
export function executeSteal(
  thiefPlayer: 1 | 2,
  victimPlayer: 1 | 2,
  targetType: string,
  state: PvpPowerUpState,
  now: number,
): { stolen: boolean; event: StolenPowerUpEvent | null } {
  // Pick the correct victim array
  const victimList =
    victimPlayer === 1 ? state.player1ActivePowerUps : state.player2ActivePowerUps

  // Remove the target power-up (first matching, non-expired)
  const idx = victimList.findIndex(
    (pu) => pu.type === targetType && (pu.expiresAt === 0 || pu.expiresAt > now),
  )
  if (idx === -1) {
    return { stolen: false, event: null }
  }

  victimList.splice(idx, 1)

  // Set cooldown for this power-up type
  state.stealCooldowns[targetType] = now + STEAL_COOLDOWN

  // Record the event
  const event: StolenPowerUpEvent = {
    fromPlayer: victimPlayer,
    toPlayer: thiefPlayer,
    powerUpType: targetType,
    timestamp: now,
  }

  // Keep only the last MAX_RECENT_STEALS events
  state.recentSteals.push(event)
  if (state.recentSteals.length > MAX_RECENT_STEALS) {
    state.recentSteals.splice(0, state.recentSteals.length - MAX_RECENT_STEALS)
  }

  return { stolen: true, event }
}

/**
 * Compute floating-text draw info for a stolen power-up event.
 *
 * Returns an object suitable for canvas rendering:
 * - `text`   — human-readable message like "P1 stole 🐢 from P2!"
 * - `x`      — horizontal offset (0 = centered)
 * - `y`      — vertical offset that drifts upward over time
 * - `opacity` — fades out over the indicator duration
 * - `color`  — the power-up's theme colour (or a steal-themed default)
 */
export function getStealDrawInfo(
  event: StolenPowerUpEvent,
  now: number,
): { text: string; x: number; y: number; opacity: number; color: string } {
  const elapsed = now - event.timestamp
  const progress = Math.min(elapsed / STEAL_INDICATOR_DURATION, 1)

  // Fade out linearly
  const opacity = Math.max(1 - progress, 0)

  // Float upward — starts at 0, drifts to -60px over the duration
  const y = -progress * 60

  const emoji = powerUpEmoji(event.powerUpType)
  const label = powerUpLabel(event.powerUpType)
  const text = `P${event.toPlayer} stole ${emoji} ${label} from P${event.fromPlayer}!`

  // Colour based on the stolen power-up type, falling back to a red "steal" tint
  let color = '#ef4444'
  if (event.powerUpType in POWERUP_CONFIG) {
    color = POWERUP_CONFIG[event.powerUpType as PowerUpType].color
  }

  return { text, x: 0, y, opacity, color }
}

/**
 * Returns static configuration values used by the UI layer to render steal
 * indicators and tooltips.
 */
export function getPvpPowerUpConfig(): {
  stealRange: number
  stealCooldown: number
  indicator: { color: string; emoji: string }
} {
  return {
    stealRange: STEAL_RANGE,
    stealCooldown: STEAL_COOLDOWN,
    indicator: {
      color: '#ef4444',
      emoji: '🫳',
    },
  }
}
