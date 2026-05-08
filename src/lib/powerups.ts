// Power-ups System for Word Snake Game

export type PowerUpType = 'slow_mo' | 'double_points' | 'shrink' | 'magnet' | 'shield'

export interface PowerUpConfig {
  type: PowerUpType
  emoji: string
  label: string
  color: string
  duration: number // seconds, 0 for instant
  description: string
}

export const POWERUP_CONFIG: Record<PowerUpType, PowerUpConfig> = {
  slow_mo: {
    type: 'slow_mo',
    emoji: '🐢',
    label: 'Slow-Mo',
    color: '#38bdf8',
    duration: 8,
    description: 'Reduces snake speed by 40% for 8 seconds',
  },
  double_points: {
    type: 'double_points',
    emoji: '💎',
    label: 'Double Pts',
    color: '#c084fc',
    duration: 10,
    description: 'Doubles point value for 10 seconds',
  },
  shrink: {
    type: 'shrink',
    emoji: '✂️',
    label: 'Shrink',
    color: '#fb923c',
    duration: 0,
    description: 'Removes the last 3 segments from the snake',
  },
  magnet: {
    type: 'magnet',
    emoji: '🧲',
    label: 'Magnet',
    color: '#f472b6',
    duration: 7,
    description: 'Word food moves 1 cell closer to the snake head each tick',
  },
  shield: {
    type: 'shield',
    emoji: '🛡️',
    label: 'Shield',
    color: '#60a5fa',
    duration: 12,
    description: 'Survive one collision (wall or self) for 12 seconds',
  },
}

const POWERUP_TYPES: PowerUpType[] = ['slow_mo', 'double_points', 'shrink', 'magnet', 'shield']

export function getRandomPowerUpType(): PowerUpType {
  return POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)]
}

export const POWERUP_SPAWN_CHANCE = 0.15 // 15% chance after eating a word
export const POWERUP_DESPAWN_TIME = 15000 // 15 seconds before uncollected power-up disappears
