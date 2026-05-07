export type SnakeSkin = 'classic' | 'ocean' | 'fire' | 'royal' | 'ice' | 'shadow' | 'rainbow' | 'golden'

export type SkinPattern = 'solid' | 'striped' | 'dotted' | 'rainbow' | 'gradient'

export interface SnakeSkinConfig {
  id: SnakeSkin
  name: string
  emoji: string
  description: string
  headColor: string
  bodyGradient: [string, string] // [tail color, head color]
  glowColor: string
  eyeColor: string
  pattern: SkinPattern
}

export const SNAKE_SKINS: Record<SnakeSkin, SnakeSkinConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    emoji: '🟢',
    description: 'Default green snake',
    headColor: '#4ade80',
    bodyGradient: ['#166534', '#4ade80'],
    glowColor: '#22c55e',
    eyeColor: '#ffffff',
    pattern: 'solid',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Blue ocean serpent',
    headColor: '#38bdf8',
    bodyGradient: ['#0c4a6e', '#38bdf8'],
    glowColor: '#0ea5e9',
    eyeColor: '#e0f2fe',
    pattern: 'gradient',
  },
  fire: {
    id: 'fire',
    name: 'Fire Wyrm',
    emoji: '🔥',
    description: 'Red fire wyrm',
    headColor: '#f97316',
    bodyGradient: ['#7c2d12', '#f97316'],
    glowColor: '#ef4444',
    eyeColor: '#fef08a',
    pattern: 'striped',
  },
  royal: {
    id: 'royal',
    name: 'Royal',
    emoji: '👑',
    description: 'Purple royal python',
    headColor: '#a78bfa',
    bodyGradient: ['#3b0764', '#a78bfa'],
    glowColor: '#8b5cf6',
    eyeColor: '#fde68a',
    pattern: 'dotted',
  },
  ice: {
    id: 'ice',
    name: 'Frost',
    emoji: '❄️',
    description: 'Cyan frost snake',
    headColor: '#67e8f9',
    bodyGradient: ['#164e63', '#67e8f9'],
    glowColor: '#06b6d4',
    eyeColor: '#ecfeff',
    pattern: 'gradient',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    emoji: '🌑',
    description: 'Dark shadow viper',
    headColor: '#6b7280',
    bodyGradient: ['#1f2937', '#6b7280'],
    glowColor: '#4b5563',
    eyeColor: '#c084fc',
    pattern: 'solid',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    description: 'Rainbow serpent',
    headColor: '#f472b6',
    bodyGradient: ['#f472b6', '#a78bfa'],
    glowColor: '#e879f9',
    eyeColor: '#ffffff',
    pattern: 'rainbow',
  },
  golden: {
    id: 'golden',
    name: 'Golden',
    emoji: '🐉',
    description: 'Golden dragon',
    headColor: '#fbbf24',
    bodyGradient: ['#78350f', '#fbbf24'],
    glowColor: '#f59e0b',
    eyeColor: '#fef3c7',
    pattern: 'striped',
  },
}

const SKIN_ORDER: SnakeSkin[] = ['classic', 'ocean', 'fire', 'royal', 'ice', 'shadow', 'rainbow', 'golden']

const SKIN_STORAGE_KEY = 'word-snake-skin'

export function getSnakeSkin(id: SnakeSkin): SnakeSkinConfig {
  return SNAKE_SKINS[id] ?? SNAKE_SKINS.classic
}

export function getAllSkins(): SnakeSkinConfig[] {
  return SKIN_ORDER.map((id) => SNAKE_SKINS[id])
}

export function getSavedSkin(): SnakeSkin {
  if (typeof window === 'undefined') return 'classic'
  try {
    const stored = localStorage.getItem(SKIN_STORAGE_KEY)
    if (stored && stored in SNAKE_SKINS) {
      return stored as SnakeSkin
    }
  } catch { /* ignore */ }
  return 'classic'
}

export function saveSnakeSkin(id: SnakeSkin): void {
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, id)
  } catch { /* ignore */ }
}
