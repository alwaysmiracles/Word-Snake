// ─────────────────────────────────────────────────────────────────────────────
// mini-map-wire.ts — Mini Map Navigator system for the Word Snake game
// (单词贪吃蛇). Provides full game-map logic and UI helper data for a
// pan/zoomable grid with fog-of-war, zones, markers, waypoints, bookmarks,
// snake tracking, and heatmap analytics.
//
// Persistence: Zustand + localStorage (key: ws_mini_map_wire)
// No React imports — pure TypeScript with Zustand store pattern.
//
// Exported: 1 store hook + 34 standalone functions = 35 named exports
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════════════════

export type MarkerType = 'food' | 'danger' | 'special' | 'note' | 'waypoint' | 'custom'
export type PanDirection = 'up' | 'down' | 'left' | 'right'

export interface MapMarker {
  id: string
  x: number
  y: number
  type: MarkerType
  label: string
  color: string
  createdAt: number
}

export interface Waypoint {
  id: string
  x: number
  y: number
  label: string
  order: number
  completed: boolean
}

export interface MapTrail {
  points: { x: number; y: number }[]
  color: string
  width: number
  opacity: number
}

export interface FoodEntry {
  x: number
  y: number
  type: string
  word: string
}

export interface MapZone {
  id: string
  name: string
  description: string
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  color: string
  bgGradient: string
  scoreMultiplier: number
  effects: string[]
  entryRequirement: string
  danger: number
}

export interface MapBookmark {
  id: string
  x: number
  y: number
  name: string
  icon: string
  createdAt: number
}

export interface ViewportBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface ZoomLevel {
  value: number
  label: string
}

export interface MapDataSnapshot {
  mapWidth: number
  mapHeight: number
  zoomLevel: number
  panX: number
  panY: number
  viewportWidth: number
  viewportHeight: number
  snakePosition: { x: number; y: number }
  foodPositions: FoodEntry[]
  markers: MapMarker[]
  waypoints: Waypoint[]
  trails: MapTrail[]
  activeZone: string | null
  discoveredArea: number
  showGrid: boolean
  showLabels: boolean
  showTrails: boolean
  fogOfWar: boolean
}

export interface WaypointRouteStep {
  waypoint: Waypoint
  direction: string
  distance: number
}

export interface MiniMapOverview {
  totalDistance: number
  uniqueCellsVisited: number
  discoveredArea: number
  activeZone: string | null
  markerCount: number
  waypointCount: number
  bookmarkCount: number
  snakePosition: { x: number; y: number }
  maxDistanceFromStart: number
}

export interface MapGridCell {
  x: number
  y: number
  revealed: boolean
  visited: boolean
  visitCount: number
  zoneId: string | null
  hasMarker: boolean
  hasFood: boolean
  dangerLevel: number
}

export interface StatsGridItem {
  label: string
  value: string | number
  icon: string
  color: string
}

export interface ZoneOverlayEntry {
  zone: MapZone
  label: string
  color: string
  opacity: number
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  scoreMultiplier: number
}

export interface HeatmapEntry {
  x: number
  y: number
  intensity: number
}

export interface MinimapSettingsSnapshot {
  showGrid: boolean
  showLabels: boolean
  showTrails: boolean
  trailLength: number
  minimapOpacity: number
  fogOfWar: boolean
  revealRadius: number
  zoomLevel: number
}

export interface SnakeHistoryEntry {
  x: number
  y: number
  timestamp: number
}

// ─── Persisted State (Sets → string[] for JSON compat) ─────────────────────

interface PersistedMiniMapState {
  mapWidth: number
  mapHeight: number
  zoomLevel: number
  panX: number
  panY: number
  viewportWidth: number
  viewportHeight: number
  markers: MapMarker[]
  waypoints: Waypoint[]
  trails: MapTrail[]
  snakePosition: { x: number; y: number }
  snakeHistory: SnakeHistoryEntry[]
  foodPositions: FoodEntry[]
  discoveredArea: number
  visitedCellsArr: string[]
  totalCells: number
  zones: MapZone[]
  activeZone: string | null
  totalDistance: number
  maxDistanceFromStart: number
  uniqueCellsVisited: number
  showGrid: boolean
  showLabels: boolean
  showTrails: boolean
  trailLength: number
  minimapOpacity: number
  bookmarks: MapBookmark[]
  fogOfWar: boolean
  revealedCellsArr: string[]
  revealRadius: number
}

// ─── Store Actions ──────────────────────────────────────────────────────

interface MiniMapActions {
  // Zoom & Pan
  setZoom: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  pan: (direction: PanDirection, amount?: number) => void
  centerOn: (x: number, y: number) => void
  centerOnSnake: () => void
  fitToContent: () => void
  // Markers
  addMarker: (x: number, y: number, type: MarkerType, label: string) => void
  removeMarker: (id: string) => void
  updateMarker: (id: string, data: Partial<Pick<MapMarker, 'x' | 'y' | 'type' | 'label' | 'color'>>) => void
  // Waypoints
  addWaypoint: (x: number, y: number, label: string) => void
  removeWaypoint: (id: string) => void
  getNextWaypoint: () => Waypoint | null
  getWaypointRoute: () => WaypointRouteStep[]
  clearWaypoints: () => void
  // Snake
  updateSnakePosition: (x: number, y: number) => void
  // Discovery & Fog
  revealCell: (x: number, y: number) => void
  setRevealRadius: (radius: number) => void
  toggleFogOfWar: () => void
  // Bookmarks
  addBookmark: (x: number, y: number, name: string, icon: string) => void
  removeBookmark: (id: string) => void
  // Settings
  setShowGrid: (v: boolean) => void
  setShowLabels: (v: boolean) => void
  setShowTrails: (v: boolean) => void
  setTrailLength: (v: number) => void
  setMinimapOpacity: (v: number) => void
  setViewport: (w: number, h: number) => void
  // Reset
  resetMap: () => void
}

export type MiniMapState = PersistedMiniMapState & MiniMapActions

// ═══════════════════════════════════════════════════════════════════════════════
// Static Data — 8 zones arranged in a 3×3 grid (last row has 2)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_ZONES: MapZone[] = [
  {
    id: 'green_meadow',
    name: 'Green Meadow',
    description:
      'A peaceful starting area — safe and forgiving. The grass is soft, ' +
      'words grow like flowers, and there are no hazards to worry about.',
    bounds: { minX: 0, minY: 0, maxX: 50, maxY: 50 },
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
    scoreMultiplier: 1,
    effects: ['safe_zone'],
    entryRequirement: 'none',
    danger: 0,
  },
  {
    id: 'crystal_cave',
    name: 'Crystal Cave',
    description:
      'Narrow crystal corridors that shimmer with ancient vocabulary. ' +
      'Paths are tight — precision is key. Score multiplied by ×2.',
    bounds: { minX: 50, minY: 0, maxX: 100, maxY: 50 },
    color: '#7C4DFF',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    scoreMultiplier: 2,
    effects: ['narrow_paths', 'sparkle'],
    entryRequirement: 'score_500',
    danger: 1,
  },
  {
    id: 'storm_peaks',
    name: 'Storm Peaks',
    description:
      'Lightning-struck mountain tops with ×3 score multiplier. Random ' +
      'obstacles flash into existence during electrical storms.',
    bounds: { minX: 0, minY: 50, maxX: 50, maxY: 100 },
    color: '#42A5F5',
    bgGradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    scoreMultiplier: 3,
    effects: ['random_obstacles', 'lightning_flashes'],
    entryRequirement: 'score_1500',
    danger: 2,
  },
  {
    id: 'shadow_forest',
    name: 'Shadow Forest',
    description:
      'A dark woodland where food words are hidden until the snake ' +
      'approaches closely. Limited visibility adds tension.',
    bounds: { minX: 50, minY: 50, maxX: 100, maxY: 100 },
    color: '#37474F',
    bgGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    scoreMultiplier: 1.5,
    effects: ['hidden_food', 'dark_overlay'],
    entryRequirement: 'score_3000',
    danger: 2,
  },
  {
    id: 'ember_volcano',
    name: 'Ember Volcano',
    description:
      'Rivers of molten lava carve word-shaped channels. Score ×4 with ' +
      'speed-boost tiles, but lava hazards are deadly.',
    bounds: { minX: 100, minY: 0, maxX: 150, maxY: 50 },
    color: '#FF5722',
    bgGradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    scoreMultiplier: 4,
    effects: ['speed_boost', 'lava_hazard'],
    entryRequirement: 'score_5000',
    danger: 3,
  },
  {
    id: 'sky_islands',
    name: 'Sky Islands',
    description:
      'Floating islands above the clouds with tricky gaps. Words drift ' +
      'on wind currents — timing your grabs is essential.',
    bounds: { minX: 100, minY: 50, maxX: 150, maxY: 100 },
    color: '#03A9F4',
    bgGradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
    scoreMultiplier: 2.5,
    effects: ['floating_paths', 'wind_push'],
    entryRequirement: 'score_8000',
    danger: 2,
  },
  {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    description:
      'The deepest seas where forgotten words lie buried in ancient ' +
      'ruins. Movement is slower but rare words can be found.',
    bounds: { minX: 0, minY: 100, maxX: 50, maxY: 150 },
    color: '#00695C',
    bgGradient: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
    scoreMultiplier: 3,
    effects: ['slow_movement', 'bubble_particles'],
    entryRequirement: 'score_12000',
    danger: 2,
  },
  {
    id: 'final_frontier',
    name: 'Final Frontier',
    description:
      'The ultimate challenge — a cosmic boss zone with ×5 multiplier. ' +
      'Only the most skilled word snakes survive here.',
    bounds: { minX: 50, minY: 100, maxX: 100, maxY: 150 },
    color: '#AA00FF',
    bgGradient: 'linear-gradient(135deg, #0c0c1d 0%, #4a00e0 50%, #8e2de2 100%)',
    scoreMultiplier: 5,
    effects: ['boss_spawn', 'cosmic_particles', 'time_distortion'],
    entryRequirement: 'score_20000',
    danger: 4,
  },
]

const MARKER_COLORS: Record<MarkerType, string> = {
  food: '#FF6B6B',
  danger: '#FF1744',
  special: '#FFD700',
  note: '#90CAF9',
  waypoint: '#69F0AE',
  custom: '#CE93D8',
}

// ═══════════════════════════════════════════════════════════════════════════════
// Internal Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_MAP_WIDTH = 200
const DEFAULT_MAP_HEIGHT = 200
const DEFAULT_TRAIL_LENGTH = 50
const DEFAULT_MINIMAP_OPACITY = 0.85
const DEFAULT_REVEAL_RADIUS = 3

function createDefaultState(): PersistedMiniMapState {
  return {
    mapWidth: DEFAULT_MAP_WIDTH,
    mapHeight: DEFAULT_MAP_HEIGHT,
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    viewportWidth: 800,
    viewportHeight: 600,
    markers: [],
    waypoints: [],
    trails: [],
    snakePosition: { x: 100, y: 100 },
    snakeHistory: [],
    foodPositions: [],
    discoveredArea: 0,
    visitedCellsArr: [],
    totalCells: DEFAULT_MAP_WIDTH * DEFAULT_MAP_HEIGHT,
    zones: DEFAULT_ZONES,
    activeZone: null,
    totalDistance: 0,
    maxDistanceFromStart: 0,
    uniqueCellsVisited: 0,
    showGrid: true,
    showLabels: true,
    showTrails: true,
    trailLength: DEFAULT_TRAIL_LENGTH,
    minimapOpacity: DEFAULT_MINIMAP_OPACITY,
    bookmarks: [],
    fogOfWar: true,
    revealedCellsArr: [],
    revealRadius: DEFAULT_REVEAL_RADIUS,
  }
}

/** Serialise a grid cell coordinate into a string key for Set storage. */
function cellKey(x: number, y: number): string {
  return `${x},${y}`
}

/** Generate a unique ID prefixed with "mm_". */
function generateId(): string {
  return `mm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** Euclidean distance between two points. */
function eucDist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/** Clamp a number between a lower and upper bound. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/** Return the zone that contains the given world coordinate, or null. */
function zoneAtPoint(x: number, y: number, zones: MapZone[]): MapZone | null {
  for (const z of zones) {
    const b = z.bounds
    if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) return z
  }
  return null
}

/** Return a cardinal direction string between two points. */
function directionText(fx: number, fy: number, tx: number, ty: number): string {
  const dx = tx - fx
  const dy = ty - fy
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'East' : 'West'
  return dy > 0 ? 'South' : 'North'
}

/** Build a frequency map from snake history entries. */
function buildVisitFrequency(
  history: SnakeHistoryEntry[]
): Map<string, number> {
  const freq = new Map<string, number>()
  for (const h of history) {
    const k = cellKey(h.x, h.y)
    freq.set(k, (freq.get(k) ?? 0) + 1)
  }
  return freq
}

/** Convert a frequency map to sorted, normalised heatmap entries (top N). */
function frequencyToHeatmap(
  freq: Map<string, number>,
  limit: number
): HeatmapEntry[] {
  if (freq.size === 0) return []
  const mx = Math.max(...freq.values())
  const entries: HeatmapEntry[] = []
  for (const [key, count] of freq) {
    const [x, y] = key.split(',').map(Number)
    entries.push({ x, y, intensity: count / mx })
  }
  entries.sort((a, b) => b.intensity - a.intensity)
  return entries.slice(0, limit)
}

/** Reveals cells in a circle around (cx, cy) and returns the new array. */
function revealCircle(
  existing: string[],
  cx: number,
  cy: number,
  radius: number
): string[] {
  const set = new Set(existing)
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx * dx + dy * dy <= radius * radius) {
        set.add(cellKey(cx + dx, cy + dy))
      }
    }
  }
  return Array.from(set)
}

/** Available zoom level presets. */
const ZOOM_LEVELS: ZoomLevel[] = [
  { value: 0.25, label: '0.25×' },
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: '2×' },
  { value: 3, label: '3×' },
  { value: 4, label: '4×' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Zustand Store
// ═══════════════════════════════════════════════════════════════════════════════

export const useMiniMapStore = create<MiniMapState>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      // ── Zoom & Pan ───────────────────────────────────────────────

      setZoom: (level: number) => {
        set({ zoomLevel: Math.round(clamp(level, 0.25, 4) * 100) / 100 })
      },

      zoomIn: () => {
        set({
          zoomLevel: Math.round(Math.min(4, get().zoomLevel * 1.25) * 100) / 100,
        })
      },

      zoomOut: () => {
        set({
          zoomLevel: Math.round(Math.max(0.25, get().zoomLevel / 1.25) * 100) / 100,
        })
      },

      pan: (direction: PanDirection, amount = 50) => {
        const { panX, panY } = get()
        let px = panX
        let py = panY
        if (direction === 'up') py -= amount
        else if (direction === 'down') py += amount
        else if (direction === 'left') px -= amount
        else if (direction === 'right') px += amount
        set({ panX: px, panY: py })
      },

      centerOn: (x: number, y: number) => {
        const s = get()
        set({
          panX: x * s.zoomLevel - s.viewportWidth / 2,
          panY: y * s.zoomLevel - s.viewportHeight / 2,
        })
      },

      centerOnSnake: () => {
        const s = get()
        set({
          panX: s.snakePosition.x * s.zoomLevel - s.viewportWidth / 2,
          panY: s.snakePosition.y * s.zoomLevel - s.viewportHeight / 2,
        })
      },

      fitToContent: () => {
        const s = get()
        const pts: { x: number; y: number }[] = [
          s.snakePosition,
          ...s.markers.map((m) => ({ x: m.x, y: m.y })),
          ...s.waypoints.map((w) => ({ x: w.x, y: w.y })),
          ...s.foodPositions.map((f) => ({ x: f.x, y: f.y })),
        ]
        if (pts.length === 0) {
          set({ panX: 0, panY: 0, zoomLevel: 1 })
          return
        }
        let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity
        for (const p of pts) {
          mnX = Math.min(mnX, p.x)
          mnY = Math.min(mnY, p.y)
          mxX = Math.max(mxX, p.x)
          mxY = Math.max(mxY, p.y)
        }
        const cw = mxX - mnX + 20
        const ch = mxY - mnY + 20
        const z = clamp(
          Math.min(s.viewportWidth / cw, s.viewportHeight / ch),
          0.25,
          4
        )
        const cx = (mnX + mxX) / 2
        const cy = (mnY + mxY) / 2
        set({
          zoomLevel: Math.round(z * 100) / 100,
          panX: cx * z - s.viewportWidth / 2,
          panY: cy * z - s.viewportHeight / 2,
        })
      },

      // ── Markers ──────────────────────────────────────────────────

      addMarker: (x, y, type, label) => {
        const marker: MapMarker = {
          id: generateId(),
          x,
          y,
          type,
          label,
          color: MARKER_COLORS[type],
          createdAt: Date.now(),
        }
        set((s) => ({ markers: [...s.markers, marker] }))
      },

      removeMarker: (id) => {
        set((s) => ({ markers: s.markers.filter((m) => m.id !== id) }))
      },

      updateMarker: (id, data) => {
        set((s) => ({
          markers: s.markers.map((m) =>
            m.id === id
              ? { ...m, ...data, color: data.color ?? MARKER_COLORS[m.type] }
              : m
          ),
        }))
      },

      // ── Waypoints ───────────────────────────────────────────────

      addWaypoint: (x, y, label) => {
        const s = get()
        if (s.waypoints.length >= 10) return // enforce max 10
        const wp: Waypoint = {
          id: generateId(),
          x,
          y,
          label,
          order: s.waypoints.length,
          completed: false,
        }
        set((s) => ({ waypoints: [...s.waypoints, wp] }))
      },

      removeWaypoint: (id) => {
        set((s) => ({
          waypoints: s.waypoints
            .filter((w) => w.id !== id)
            .map((w, i) => ({ ...w, order: i })),
        }))
      },

      getNextWaypoint: () => {
        return get().waypoints.find((w) => !w.completed) ?? null
      },

      getWaypointRoute: () => {
        const s = get()
        const route: WaypointRouteStep[] = []
        let px = s.snakePosition.x
        let py = s.snakePosition.y
        for (const wp of s.waypoints) {
          route.push({
            waypoint: { ...wp },
            direction: directionText(px, py, wp.x, wp.y),
            distance: Math.round(eucDist(px, py, wp.x, wp.y) * 100) / 100,
          })
          px = wp.x
          py = wp.y
        }
        return route
      },

      clearWaypoints: () => {
        set({ waypoints: [] })
      },

      // ── Snake Tracking ──────────────────────────────────────────

      updateSnakePosition: (x, y) => {
        const s = get()
        const key = cellKey(x, y)
        const prevKey = cellKey(s.snakePosition.x, s.snakePosition.y)
        const moved = key !== prevKey
        const dist = moved
          ? eucDist(s.snakePosition.x, s.snakePosition.y, x, y)
          : 0

        // Append to history, cap at 500 entries
        const newHist: SnakeHistoryEntry[] = [
          ...s.snakeHistory,
          { x, y, timestamp: Date.now() },
        ]
        if (newHist.length > 500) newHist.splice(0, newHist.length - 500)

        // Track unique visited cells
        const visited = new Set(s.visitedCellsArr)
        if (!visited.has(key)) visited.add(key)

        // Fog-of-war reveal around snake
        let revealedArr = s.revealedCellsArr
        if (s.fogOfWar) {
          revealedArr = revealCircle(revealedArr, x, y, s.revealRadius)
        }

        // Detect the active zone
        const zone = zoneAtPoint(x, y, s.zones)

        // Update trail
        let trails = s.trails
        if (moved) {
          const cur = trails[trails.length - 1]
          const pts = cur ? [...cur.points, { x, y }] : [{ x, y }]
          const trimmed =
            pts.length > s.trailLength ? pts.slice(-s.trailLength) : pts
          trails =
            trails.length > 0
              ? [
                  ...trails.slice(0, -1),
                  {
                    ...cur!,
                    points: trimmed,
                    color: '#00ff88',
                    width: 2,
                    opacity: 0.6,
                  },
                ]
              : [{ points: trimmed, color: '#00ff88', width: 2, opacity: 0.6 }]
        }

        set({
          snakePosition: { x, y },
          snakeHistory: newHist,
          visitedCellsArr: Array.from(visited),
          uniqueCellsVisited: visited.size,
          totalDistance: Math.round((s.totalDistance + dist) * 100) / 100,
          maxDistanceFromStart: Math.max(
            s.maxDistanceFromStart,
            eucDist(100, 100, x, y)
          ),
          discoveredArea:
            s.totalCells > 0
              ? Math.round((revealedArr.length / s.totalCells) * 10000) / 100
              : 0,
          revealedCellsArr: revealedArr,
          activeZone: zone?.id ?? null,
          trails,
        })
      },

      // ── Discovery & Fog of War ───────────────────────────────────

      revealCell: (x, y) => {
        const s = get()
        const arr = revealCircle(s.revealedCellsArr, x, y, s.revealRadius)
        set({
          revealedCellsArr: arr,
          discoveredArea:
            s.totalCells > 0
              ? Math.round((arr.length / s.totalCells) * 10000) / 100
              : 0,
        })
      },

      setRevealRadius: (radius) => {
        set({ revealRadius: clamp(Math.round(radius), 1, 10) })
      },

      toggleFogOfWar: () => {
        set((s) => ({ fogOfWar: !s.fogOfWar }))
      },

      // ── Bookmarks ───────────────────────────────────────────────

      addBookmark: (x, y, name, icon) => {
        const bm: MapBookmark = {
          id: generateId(),
          x,
          y,
          name,
          icon,
          createdAt: Date.now(),
        }
        set((s) => ({ bookmarks: [...s.bookmarks, bm] }))
      },

      removeBookmark: (id) => {
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }))
      },

      // ── Settings ────────────────────────────────────────────────

      setShowGrid: (v) => set({ showGrid: v }),
      setShowLabels: (v) => set({ showLabels: v }),
      setShowTrails: (v) => set({ showTrails: v }),
      setTrailLength: (v) => set({ trailLength: clamp(Math.round(v), 10, 200) }),
      setMinimapOpacity: (v) => set({ minimapOpacity: clamp(v, 0.1, 1) }),
      setViewport: (w, h) => set({ viewportWidth: w, viewportHeight: h }),
      resetMap: () => set(createDefaultState()),
    }),
    {
      name: 'ws_mini_map_wire',
      version: 1,
      partialize: (state) => {
        // Strip all action functions — only persist data fields
        const {
          setZoom, zoomIn, zoomOut, pan, centerOn, centerOnSnake, fitToContent,
          addMarker, removeMarker, updateMarker,
          addWaypoint, removeWaypoint, getNextWaypoint, getWaypointRoute, clearWaypoints,
          updateSnakePosition,
          revealCell, setRevealRadius, toggleFogOfWar,
          addBookmark, removeBookmark,
          setShowGrid, setShowLabels, setShowTrails, setTrailLength,
          setMinimapOpacity, setViewport, resetMap,
          ...rest
        } = state
        return rest
      },
    }
  )
)

// ═══════════════════════════════════════════════════════════════════════════════
// Exported Standalone Functions (34 total)
//
// These thin wrappers read from or write to the Zustand store via getState()
// so they can be called from any context — not just React components.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Map Rendering Data (10 functions) ────────────────────────────────────

/**
 * Returns a complete, immutable snapshot of the map state suitable for
 * passing to the render layer. All nested objects are spread copies.
 *
 * @returns MapDataSnapshot with all current map values
 */
export function getMapData(): MapDataSnapshot {
  const s = useMiniMapStore.getState()
  return {
    mapWidth: s.mapWidth,
    mapHeight: s.mapHeight,
    zoomLevel: s.zoomLevel,
    panX: s.panX,
    panY: s.panY,
    viewportWidth: s.viewportWidth,
    viewportHeight: s.viewportHeight,
    snakePosition: { ...s.snakePosition },
    foodPositions: [...s.foodPositions],
    markers: [...s.markers],
    waypoints: [...s.waypoints],
    trails: [...s.trails],
    activeZone: s.activeZone,
    discoveredArea: s.discoveredArea,
    showGrid: s.showGrid,
    showLabels: s.showLabels,
    showTrails: s.showTrails,
    fogOfWar: s.fogOfWar,
  }
}

/**
 * Computes the axis-aligned bounding box of the currently visible area
 * in world (unzoomed) coordinates.
 *
 * @returns ViewportBounds with minX/minY/maxX/maxY and size
 */
export function getViewportBounds(): ViewportBounds {
  const s = useMiniMapStore.getState()
  const minX = s.panX / s.zoomLevel
  const minY = s.panY / s.zoomLevel
  const w = s.viewportWidth / s.zoomLevel
  const h = s.viewportHeight / s.zoomLevel
  return { minX, minY, maxX: minX + w, maxY: minY + h, width: w, height: h }
}

/**
 * Returns all discrete zoom levels the minimap supports, from 0.25× to 4×.
 *
 * @returns Array of ZoomLevel objects
 */
export function getZoomLevels(): ZoomLevel[] {
  return ZOOM_LEVELS
}

/**
 * Sets the zoom to a specific level, clamped between 0.25 and 4.
 *
 * @param level - Desired zoom multiplier
 */
export function setZoom(level: number): void {
  useMiniMapStore.getState().setZoom(level)
}

/**
 * Zooms in by multiplying the current zoom by 1.25 (max 4×).
 */
export function zoomIn(): void {
  useMiniMapStore.getState().zoomIn()
}

/**
 * Zooms out by dividing the current zoom by 1.25 (min 0.25×).
 */
export function zoomOut(): void {
  useMiniMapStore.getState().zoomOut()
}

/**
 * Pans the viewport by a given pixel amount in a cardinal direction.
 *
 * @param direction - Which direction to pan
 * @param amount - Pixel distance to pan (default 50)
 */
export function pan(direction: PanDirection, amount?: number): void {
  useMiniMapStore.getState().pan(direction, amount)
}

/**
 * Centers the viewport so that the given world coordinate is in the
 * middle of the screen.
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 */
export function centerOn(x: number, y: number): void {
  useMiniMapStore.getState().centerOn(x, y)
}

/**
 * Convenience: centers the viewport on the snake's current position.
 */
export function centerOnSnake(): void {
  useMiniMapStore.getState().centerOnSnake()
}

/**
 * Automatically calculates and applies the zoom level and pan offset
 * so that all markers, waypoints, food, and the snake are visible.
 */
export function fitToContent(): void {
  useMiniMapStore.getState().fitToContent()
}

// ─── 2. Markers & Pins (4 functions) ────────────────────────────────────────

/**
 * Places a new marker on the map. Six types are supported:
 * `food`, `danger`, `special`, `note`, `waypoint`, `custom`.
 * The colour is assigned automatically based on type.
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param type - Marker type
 * @param label - Human-readable label
 */
export function addMarker(
  x: number,
  y: number,
  type: MarkerType,
  label: string
): void {
  useMiniMapStore.getState().addMarker(x, y, type, label)
}

/**
 * Removes a marker by its unique ID.
 *
 * @param id - The marker's ID (from MapMarker.id)
 */
export function removeMarker(id: string): void {
  useMiniMapStore.getState().removeMarker(id)
}

/**
 * Updates mutable fields on an existing marker.
 *
 * @param id - The marker's ID
 * @param data - Partial update object
 */
export function updateMarker(
  id: string,
  data: Partial<Pick<MapMarker, 'x' | 'y' | 'type' | 'label' | 'color'>>
): void {
  useMiniMapStore.getState().updateMarker(id, data)
}

/**
 * Returns the total number of markers currently on the map.
 *
 * @returns Marker count
 */
export function getMarkerCount(): number {
  return useMiniMapStore.getState().markers.length
}

// ─── 3. Waypoint System (5 functions) ───────────────────────────────────────

/**
 * Adds a navigation waypoint. The system enforces a maximum of 10 waypoints.
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param label - Waypoint label (e.g. "Score 500 gate")
 */
export function addWaypoint(x: number, y: number, label: string): void {
  useMiniMapStore.getState().addWaypoint(x, y, label)
}

/**
 * Removes a waypoint by ID. Remaining waypoints are automatically re-indexed.
 *
 * @param id - The waypoint's ID
 */
export function removeWaypoint(id: string): void {
  useMiniMapStore.getState().removeWaypoint(id)
}

/**
 * Returns the next incomplete waypoint (lowest order index), or null
 * if all waypoints are completed or none exist.
 *
 * @returns Next Waypoint or null
 */
export function getNextWaypoint(): Waypoint | null {
  return useMiniMapStore.getState().getNextWaypoint()
}

/**
 * Returns the full ordered route from the snake's current position
 * through all waypoints. Each step includes a cardinal direction
 * and Euclidean distance.
 *
 * @returns Ordered array of route steps
 */
export function getWaypointRoute(): WaypointRouteStep[] {
  return useMiniMapStore.getState().getWaypointRoute()
}

/**
 * Removes all waypoints at once.
 */
export function clearWaypoints(): void {
  useMiniMapStore.getState().clearWaypoints()
}

// ─── 4. Snake Tracking (3 functions) ────────────────────────────────────────

/**
 * Updates the snake's position. Called by the game loop on every movement
 * tick. This function:
 *   - Appends to movement history (capped at 500 entries)
 *   - Tracks unique cells visited
 *   - Reveals fog-of-war cells around the snake
 *   - Updates the active zone
 *   - Extends the visual trail
 *   - Recalculates total distance and max distance from start
 *
 * @param x - New world X coordinate
 * @param y - New world Y coordinate
 */
export function updateSnakePosition(x: number, y: number): void {
  useMiniMapStore.getState().updateSnakePosition(x, y)
}

/**
 * Returns the snake's most recent positions for rendering the trail.
 *
 * @param length - Number of entries to return (default 50)
 * @returns Array of {x, y} coordinates
 */
export function getSnakeTrail(
  length: number = 50
): { x: number; y: number }[] {
  const hist = useMiniMapStore.getState().snakeHistory
  const start = Math.max(0, hist.length - length)
  return hist.slice(start).map((h) => ({ x: h.x, y: h.y }))
}

/**
 * Builds a visit-frequency heatmap from the snake's entire movement
 * history. The top 100 most-visited cells are returned, sorted by
 * descending frequency. Intensity values are normalised to 0–1.
 *
 * @returns Array of HeatmapEntry sorted by intensity
 */
export function getSnakeHeatmap(): HeatmapEntry[] {
  const history = useMiniMapStore.getState().snakeHistory
  return frequencyToHeatmap(buildVisitFrequency(history), 100)
}

// ─── 5. Discovery & Fog of War (3 functions) ─────────────────────────────────

/**
 * Reveals cells in a circular area around (x, y) using the current
 * reveal radius. Updates the discovered-area percentage automatically.
 *
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 */
export function revealCell(x: number, y: number): void {
  useMiniMapStore.getState().revealCell(x, y)
}

/**
 * Returns the percentage of the map that has been revealed (0–100).
 *
 * @returns Discovered percentage
 */
export function getRevealedPercentage(): number {
  return useMiniMapStore.getState().discoveredArea
}

/**
 * Sets the fog-of-war vision radius (1–10 cells). A larger radius
 * reveals more cells each time the snake moves or revealCell is called.
 *
 * @param radius - New reveal radius
 */
export function setRevealRadius(radius: number): void {
  useMiniMapStore.getState().setRevealRadius(radius)
}

// ─── 6. Bookmarks (2 functions) ──────────────────────────────────────────────

/**
 * Saves a bookmark at the given world location. Bookmarks allow the
 * player to quickly jump back to important positions.
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param name - Bookmark name
 * @param icon - Emoji or icon identifier
 */
export function addBookmark(
  x: number,
  y: number,
  name: string,
  icon: string
): void {
  useMiniMapStore.getState().addBookmark(x, y, name, icon)
}

/**
 * Removes a bookmark by ID.
 *
 * @param id - The bookmark's ID
 */
export function removeBookmark(id: string): void {
  useMiniMapStore.getState().removeBookmark(id)
}

// ─── 7. Analytics (2 functions) ──────────────────────────────────────────────

/**
 * Returns a normalised visit-frequency heatmap — identical to getSnakeHeatmap.
 * Kept as a separate entry point so UI panels can reference a semantically
 * named "visited heatmap" function.
 *
 * @returns Array of HeatmapEntry
 */
export function getVisitedHeatmap(): HeatmapEntry[] {
  const history = useMiniMapStore.getState().snakeHistory
  return frequencyToHeatmap(buildVisitFrequency(history), 100)
}

/**
 * Analyses the current state and suggests an optimal path for the snake.
 * The algorithm considers:
 *   1. Nearby food-density hotspots (weight ×2)
 *   2. Unexplored border cells close to the snake (weight ×1)
 *
 * Returns up to 20 target coordinates sorted by priority (descending).
 *
 * @returns Array of { x, y, priority } targets
 */
export function getOptimalPath(): {
  x: number
  y: number
  priority: number
}[] {
  const s = useMiniMapStore.getState()
  const snake = s.snakePosition
  const targets: { x: number; y: number; priority: number }[] = []

  // ── Food density ──
  const foodFreq = new Map<string, number>()
  for (const f of s.foodPositions) {
    const k = cellKey(f.x, f.y)
    foodFreq.set(k, (foodFreq.get(k) ?? 0) + 1)
  }
  if (foodFreq.size > 0) {
    const mx = Math.max(...foodFreq.values())
    for (const [key, count] of foodFreq) {
      const intensity = count / mx
      if (intensity > 0.5) {
        const [fx, fy] = key.split(',').map(Number)
        if (eucDist(snake.x, snake.y, fx, fy) < 30) {
          targets.push({ x: fx, y: fy, priority: intensity * 2 })
        }
      }
    }
  }

  // ── Unexplored border ──
  const revSet = new Set(s.revealedCellsArr)
  if (revSet.size > 0) {
    const offsets: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    const seen = new Set<string>()
    for (const rk of revSet) {
      const [cx, cy] = rk.split(',').map(Number)
      for (const [dx, dy] of offsets) {
        const nk = cellKey(cx + dx, cy + dy)
        if (!revSet.has(nk) && !seen.has(nk)) {
          seen.add(nk)
          if (eucDist(snake.x, snake.y, cx + dx, cy + dy) < 20) {
            targets.push({ x: cx + dx, y: cy + dy, priority: 0.5 })
          }
        }
      }
    }
  }

  targets.sort((a, b) => b.priority - a.priority)
  return targets.slice(0, 20)
}

// ─── 8. UI Helper Functions (5 functions) ───────────────────────────────────

/**
 * Returns an aggregated overview of the current minimap state, suitable
 * for the overview panel or HUD header.
 *
 * @returns MiniMapOverview with key stats
 */
export function getMiniMapOverview(): MiniMapOverview {
  const s = useMiniMapStore.getState()
  return {
    totalDistance: s.totalDistance,
    uniqueCellsVisited: s.uniqueCellsVisited,
    discoveredArea: s.discoveredArea,
    activeZone: s.activeZone,
    markerCount: s.markers.length,
    waypointCount: s.waypoints.filter((w) => !w.completed).length,
    bookmarkCount: s.bookmarks.length,
    snakePosition: { ...s.snakePosition },
    maxDistanceFromStart: s.maxDistanceFromStart,
  }
}

/**
 * Generates cell-level data for the visible viewport grid. Each cell
 * includes reveal status, visit count, zone membership, marker/food
 * presence, and danger level — everything needed to render the grid
 * overlay efficiently.
 *
 * @returns Array of MapGridCell for each cell in the viewport
 */
export function getMapGrid(): MapGridCell[] {
  const s = useMiniMapStore.getState()
  const bounds = getViewportBounds()
  const revSet = new Set(s.revealedCellsArr)
  const visSet = new Set(s.visitedCellsArr)

  // Build fast lookup maps
  const mkMap = new Map<string, MapMarker>()
  for (const m of s.markers) mkMap.set(cellKey(m.x, m.y), m)
  const fdMap = new Map<string, FoodEntry>()
  for (const f of s.foodPositions) fdMap.set(cellKey(f.x, f.y), f)

  // Visit frequency for heatmap shading
  const vFreq = buildVisitFrequency(s.snakeHistory)

  const sx = Math.max(0, Math.floor(bounds.minX))
  const sy = Math.max(0, Math.floor(bounds.minY))
  const ex = Math.min(s.mapWidth, Math.ceil(bounds.maxX))
  const ey = Math.min(s.mapHeight, Math.ceil(bounds.maxY))
  const cells: MapGridCell[] = []

  for (let y = sy; y <= ey; y++) {
    for (let x = sx; x <= ex; x++) {
      const k = cellKey(x, y)
      const zone = zoneAtPoint(x, y, s.zones)
      cells.push({
        x,
        y,
        revealed: !s.fogOfWar || revSet.has(k),
        visited: visSet.has(k),
        visitCount: vFreq.get(k) ?? 0,
        zoneId: zone?.id ?? null,
        hasMarker: mkMap.has(k),
        hasFood: fdMap.has(k),
        dangerLevel: zone?.danger ?? 0,
      })
    }
  }
  return cells
}

/**
 * Returns four key stats in a grid-friendly format for the minimap HUD.
 * Each item has a label, value, icon emoji, and accent colour.
 *
 * @returns Array of 4 StatsGridItem objects
 */
export function getStatsGrid(): StatsGridItem[] {
  const s = useMiniMapStore.getState()
  const zoneName = s.activeZone
    ? s.zones.find((z) => z.id === s.activeZone)?.name ?? 'Unknown'
    : 'None'
  return [
    {
      label: 'Distance',
      value: `${s.totalDistance.toFixed(1)} cells`,
      icon: '📐',
      color: '#60A5FA',
    },
    {
      label: 'Cells Visited',
      value: s.uniqueCellsVisited.toLocaleString(),
      icon: '👣',
      color: '#34D399',
    },
    {
      label: 'Explored',
      value: `${s.discoveredArea.toFixed(1)}%`,
      icon: '🗺️',
      color: '#FBBF24',
    },
    {
      label: 'Current Zone',
      value: zoneName,
      icon: '📍',
      color: '#A78BFA',
    },
  ]
}

/**
 * Returns zone overlay data for rendering coloured zone boundaries on
 * the minimap. Each entry includes the zone definition, label, colour,
 * opacity (fixed 0.25), and score multiplier.
 *
 * @returns Array of ZoneOverlayEntry, one per zone
 */
export function getZoneOverlay(): ZoneOverlayEntry[] {
  return useMiniMapStore.getState().zones.map((zone) => ({
    zone,
    label: zone.name,
    color: zone.color,
    opacity: 0.25,
    bounds: { ...zone.bounds },
    scoreMultiplier: zone.scoreMultiplier,
  }))
}

/**
 * Returns the current minimap settings in a plain object, suitable for
 * binding to UI controls (sliders, toggles, etc.).
 *
 * @returns MinimapSettingsSnapshot
 */
export function getMinimapSettings(): MinimapSettingsSnapshot {
  const s = useMiniMapStore.getState()
  return {
    showGrid: s.showGrid,
    showLabels: s.showLabels,
    showTrails: s.showTrails,
    trailLength: s.trailLength,
    minimapOpacity: s.minimapOpacity,
    fogOfWar: s.fogOfWar,
    revealRadius: s.revealRadius,
    zoomLevel: s.zoomLevel,
  }
}
