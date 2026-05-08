// PvP (Player vs Player) Local Multiplayer State for Word Snake Game

import type { PowerUpType } from '@/lib/powerups'

export interface PvPActivePowerUp {
  type: PowerUpType
  expiresAt: number // Date.now() when it expires, 0 for instant
}

export interface PvPState {
  enabled: boolean
  player2Snake: { x: number; y: number }[]
  player2Direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  player2Score: number
  player2WordsEaten: string[]
  player2Alive: boolean
  player2ActivePowerUps: PvPActivePowerUp[]
  winner: 'player1' | 'player2' | 'tie' | null
}

/** Player 2 color palette (cyan/blue tones) */
export const P2_COLORS = {
  head: '#06b6d4',
  bodyStart: '#06b6d4',
  bodyEnd: '#0e7490',
  glow: '#22d3ee',
  eyeOuter: '#ffffff',
} as const

/**
 * Create a fresh PvP state. Player 2 starts at the bottom-right corner, facing LEFT.
 */
export function createPvPState(): PvPState {
  return {
    enabled: true,
    player2Snake: [
      { x: 24, y: 12 },
      { x: 25, y: 12 },
      { x: 26, y: 12 },
    ],
    player2Direction: 'LEFT',
    player2Score: 0,
    player2WordsEaten: [],
    player2Alive: true,
    player2ActivePowerUps: [],
    winner: null,
  }
}
