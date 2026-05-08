export type GridThemeId = 'classic' | 'neon' | 'retro' | 'nature'

export type GridType = 'dots' | 'lines' | 'crosshatch' | 'organic'

export interface GridThemeConfig {
  id: GridThemeId
  name: string
  emoji: string
  bgColor: string
  gridColor: string
  gridType: GridType
  borderColor: string
  borderGlowColor: string
  description: string
  scanlines: boolean
}

export const GRID_THEMES: Record<GridThemeId, GridThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    emoji: '🌙',
    bgColor: '#0f172a',
    gridColor: '#1e293b',
    gridType: 'dots',
    borderColor: 'rgba(34, 197, 94, 0.1)',
    borderGlowColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Dark navy with subtle dot grid',
    scanlines: false,
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    emoji: '💠',
    bgColor: '#000000',
    gridColor: '#00ffcc',
    gridType: 'lines',
    borderColor: 'rgba(0, 255, 204, 0.25)',
    borderGlowColor: 'rgba(0, 255, 100, 0.2)',
    description: 'Cyberpunk neon grid lines',
    scanlines: false,
  },
  retro: {
    id: 'retro',
    name: 'Retro',
    emoji: '📺',
    bgColor: '#0a1a0a',
    gridColor: '#00ff41',
    gridType: 'crosshatch',
    borderColor: 'rgba(0, 255, 65, 0.2)',
    borderGlowColor: 'rgba(0, 255, 65, 0.15)',
    description: 'CRT phosphor green monitor',
    scanlines: true,
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    emoji: '🌿',
    bgColor: '#0a1f0a',
    gridColor: '#3d5c2e',
    gridType: 'organic',
    borderColor: 'rgba(139, 90, 43, 0.2)',
    borderGlowColor: 'rgba(101, 67, 33, 0.15)',
    description: 'Dark forest with earthy tones',
    scanlines: false,
  },
}

const THEME_ORDER: GridThemeId[] = ['classic', 'neon', 'retro', 'nature']

const THEME_STORAGE_KEY = 'word-snake-grid-theme'

export function getGridTheme(id: GridThemeId): GridThemeConfig {
  return GRID_THEMES[id] ?? GRID_THEMES.classic
}

export function getAllGridThemes(): GridThemeConfig[] {
  return THEME_ORDER.map((id) => GRID_THEMES[id])
}

export function getSavedGridTheme(): GridThemeId {
  if (typeof window === 'undefined') return 'classic'
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && stored in GRID_THEMES) {
      return stored as GridThemeId
    }
  } catch { /* ignore */ }
  return 'classic'
}

export function saveGridTheme(id: GridThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id)
  } catch { /* ignore */ }
}
