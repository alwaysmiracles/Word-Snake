'use client'

// Replay Analyzer — Deep metrics & insights from stored Word Snake game replays
// Analyzes player behavior, efficiency, weaknesses, and performance trends

import type { GameReplay, ReplayFrame } from '@/lib/game-replay'
import { getReplay, getReplays } from '@/lib/game-replay'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'word-snake-replays'

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

/** 2D intensity grid where each cell is 0–1 representing time-spent density */
export type HeatmapGrid = number[][]

export interface HeatmapResult {
  grid: HeatmapGrid
  gridSize: number
  peakCell: { x: number; y: number; intensity: number } | null
  totalFrames: number
}

export type DeathCause = 'wall' | 'self' | 'starvation' | 'power_up' | 'obstacle' | 'unknown'

export interface DeathAnalysis {
  deathFrame: number
  deathPosition: { x: number; y: number } | null
  cause: DeathCause
  timeAlive: number          // seconds from first frame to death
  snakeLength: number
  scoreAtDeath: number
  directionAtDeath: string
  lastEventBeforeDeath: string | null
}

export interface WordCoverageResult {
  uniqueCellsVisited: number
  totalGridCells: number
  coveragePercent: number
  visitedCells: Array<{ x: number; y: number }>
  hotZones: Array<{ x: number; y: number; visits: number }>
  coldZones: Array<{ x: number; y: number }>  // cells never visited
}

export interface EfficiencyResult {
  wordsPerSecond: number
  scorePerSecond: number
  coverageEfficiency: number     // 0–1, words eaten vs grid area traversed
  comboEfficiency: number        // 0–1, how much of max combo was maintained
  overallEfficiency: number      // composite 0–100
  grade: 'elite' | 'great' | 'good' | 'average' | 'needs_work'
}

export interface OptimalPathResult {
  actualPathLength: number
  optimalPathLength: number
  efficiencyRatio: number        // 0–1
  detourCount: number
  averageDetourLength: number
  pathDirectness: number          // 0–1, how straight-line the movement was
}

export interface ReplayComparison {
  replay1Id: string
  replay2Id: string
  scoreDiff: number
  scoreWinner: string | null
  durationDiff: number
  wordsDiff: number
  comboDiff: number
  coverageDiff: number
  efficiencyDiff: number
  summary: string
}

export interface SessionTrends {
  totalReplays: number
  averageScore: number
  medianScore: number
  bestScore: number
  worstScore: number
  averageDuration: number
  averageWordsPerGame: number
  averageCombo: number
  scoreTrend: 'improving' | 'declining' | 'stable'
  improvementRate: number         // % improvement per game (rolling)
  consistencyScore: number        // 0–100, lower std dev = higher consistency
  favoriteDifficulty: string
  mostCommonWord: string | null
  longestStreak: number           // consecutive games above avg
  recentScores: number[]
}

export type BestMomentType = 'highest_combo' | 'longest_survival' | 'power_up_sequence' | 'score_surge' | 'rare_find'

export interface BestMoment {
  type: BestMomentType
  label: string
  description: string
  frameIndex: number
  timestamp: number               // seconds into replay
  value: number                   // the key metric
  details: Record<string, unknown>
}

export interface BestMomentsResult {
  replayId: string
  moments: BestMoment[]           // top 3
}

export type WeaknessSeverity = 'critical' | 'moderate' | 'minor' | 'tip'

export interface WeaknessEntry {
  category: string
  severity: WeaknessSeverity
  description: string
  suggestion: string
  affectedGames: number            // how many replays show this weakness
  evidence: string
}

export interface WeaknessReport {
  generatedAt: string
  totalReplaysAnalyzed: number
  weaknesses: WeaknessEntry[]
  overallAssessment: string
  priorityAction: string
}

export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface PerformanceGradeResult {
  grade: PerformanceGrade
  score: number                   // 0–100 numeric
  breakdown: {
    survivalScore: number
    collectionScore: number
    comboScore: number
    efficiencyScore: number
    explorationScore: number
  }
  strengths: string[]
  areasToImprove: string[]
  summary: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Safe localStorage read — returns parsed value or fallback */
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Load all replays directly from storage (used as fallback) */
function loadAllReplaysDirect(): GameReplay[] {
  return safeGetItem<GameReplay[]>(STORAGE_KEY, [])
}

/** Get a single replay, trying the module function first, then direct storage */
function loadReplay(replayId: string): GameReplay | null {
  try {
    const fromModule = getReplay(replayId)
    if (fromModule) return fromModule
  } catch { /* fallback below */ }
  return loadAllReplaysDirect().find(r => r.id === replayId) ?? null
}

/** Get all replays sorted by date descending */
function loadAllReplays(): GameReplay[] {
  try {
    const fromModule = getReplays()
    if (fromModule.length > 0) return fromModule
  } catch { /* fallback below */ }
  return loadAllReplaysDirect()
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Calculate the Manhattan distance between two points */
function manhattanDist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/** Calculate the Euclidean distance between two points */
function euclideanDist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/** Estimate grid size from replay frames by finding max coordinates */
function estimateGridSize(frames: ReplayFrame[]): number {
  let maxX = 0
  let maxY = 0
  for (const frame of frames) {
    for (const seg of frame.snake) {
      if (seg.x > maxX) maxX = seg.x
      if (seg.y > maxY) maxY = seg.y
    }
    if (frame.food) {
      if (frame.food.x > maxX) maxX = frame.food.x
      if (frame.food.y > maxY) maxY = frame.food.y
    }
    if (frame.powerUp) {
      if (frame.powerUp.x > maxX) maxX = frame.powerUp.x
      if (frame.powerUp.y > maxY) maxY = frame.powerUp.y
    }
  }
  const maxDim = Math.max(maxX, maxY, 10) + 1
  return Math.max(10, Math.ceil(maxDim / 5) * 5) // round up to nearest 5
}

/** Calculate standard deviation of an array of numbers */
function stdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

/** Find the difficulty modifier for normalizing scores */
function difficultyMultiplier(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'hard': return 1.5
    case 'expert': return 2.0
    case 'insane': return 3.0
    case 'easy': return 0.6
    default: return 1.0
  }
}

// ---------------------------------------------------------------------------
// 1. Heatmap — where the snake spent the most time
// ---------------------------------------------------------------------------

export function generateHeatmap(replayId: string, gridSize?: number): HeatmapResult {
  const replay = loadReplay(replayId)
  const emptyResult: HeatmapResult = {
    grid: [],
    gridSize: gridSize ?? 20,
    peakCell: null,
    totalFrames: 0,
  }

  if (!replay || replay.frames.length === 0) return emptyResult

  const size = gridSize ?? estimateGridSize(replay.frames)

  // Initialize grid with zeros
  const grid: number[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  )

  // Count head position frequency for each frame
  for (const frame of replay.frames) {
    const head = frame.snake[0]
    if (!head) continue
    const gx = clamp(head.x, 0, size - 1)
    const gy = clamp(head.y, 0, size - 1)
    grid[gy][gx]++
  }

  // Find max value for normalization
  let maxVal = 0
  let peakX = 0
  let peakY = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x] > maxVal) {
        maxVal = grid[y][x]
        peakX = x
        peakY = y
      }
    }
  }

  // Normalize to 0–1
  if (maxVal > 0) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid[y][x] = grid[y][x] / maxVal
      }
    }
  }

  return {
    grid,
    gridSize: size,
    peakCell: maxVal > 0 ? { x: peakX, y: peakY, intensity: 1 } : null,
    totalFrames: replay.frames.length,
  }
}

// ---------------------------------------------------------------------------
// 2. Death Analysis — what killed the snake
// ---------------------------------------------------------------------------

export function analyzeDeath(replayId: string): DeathAnalysis | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length === 0) return null

  const lastFrame = replay.frames[replay.frames.length - 1]
  const firstFrame = replay.frames[0]
  const head = lastFrame.snake[0] ?? null
  const snakeLength = lastFrame.snake.length

  // Determine death cause
  let cause: DeathCause = 'unknown'

  // Check if the last frame itself has a death event
  if (lastFrame.event === 'death') {
    const eventData = lastFrame.eventData ?? {}
    const deathType = String(eventData.type ?? eventData.cause ?? '')
    if (deathType.includes('wall') || deathType.includes('boundary')) {
      cause = 'wall'
    } else if (deathType.includes('self') || deathType.includes('tail') || deathType.includes('collision')) {
      cause = 'self'
    } else if (deathType.includes('power') || deathType.includes('bomb') || deathType.includes('curse')) {
      cause = 'power_up'
    } else if (deathType.includes('obstacle')) {
      cause = 'obstacle'
    }
  }

  // Fallback heuristics if event data is unclear
  if (cause === 'unknown') {
    const prevFrame = replay.frames.length > 1 ? replay.frames[replay.frames.length - 2] : null

    // Wall check: head at or beyond typical boundary
    if (head) {
      const gridBound = estimateGridSize(replay.frames) - 1
      if (head.x <= 0 || head.y <= 0 || head.x >= gridBound || head.y >= gridBound) {
        cause = 'wall'
      } else if (prevFrame) {
        // Self-collision: check if head overlaps with own body from previous frame
        const prevBody = prevFrame.snake.slice(1)
        const selfHit = prevBody.some(s => s.x === head.x && s.y === head.y)
        if (selfHit) {
          cause = 'self'
        }
      }
    }

    // Starvation: if no words eaten for a long stretch before death
    if (cause === 'unknown' && prevFrame) {
      const wordsAtEnd = lastFrame.wordsEaten.length
      const wordsNearEnd = prevFrame.wordsEaten.length
      if (wordsAtEnd === wordsNearEnd && replay.duration > 30) {
        cause = 'starvation'
      }
    }
  }

  // Find last significant event before death
  let lastEventBeforeDeath: string | null = null
  for (let i = replay.frames.length - 2; i >= 0; i--) {
    if (replay.frames[i].event && replay.frames[i].event !== 'death') {
      lastEventBeforeDeath = replay.frames[i].event
      break
    }
  }

  // Time alive estimation based on frame indices
  const ticksAlive = lastFrame.tick - firstFrame.tick
  const duration = replay.duration > 0 ? replay.duration : Math.round(ticksAlive / 10)

  return {
    deathFrame: replay.frames.length - 1,
    deathPosition: head ? { x: head.x, y: head.y } : null,
    cause,
    timeAlive: duration,
    snakeLength,
    scoreAtDeath: lastFrame.score,
    directionAtDeath: lastFrame.direction,
    lastEventBeforeDeath,
  }
}

// ---------------------------------------------------------------------------
// 3. Word Coverage — how much of the grid was explored
// ---------------------------------------------------------------------------

export function analyzeWordCoverage(replayId: string, gridSize?: number): WordCoverageResult | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length === 0) return null

  const size = gridSize ?? estimateGridSize(replay.frames)
  const totalGridCells = size * size
  const visitCounts = new Map<string, number>()

  for (const frame of replay.frames) {
    const head = frame.snake[0]
    if (!head) continue
    const key = `${clamp(head.x, 0, size - 1)},${clamp(head.y, 0, size - 1)}`
    visitCounts.set(key, (visitCounts.get(key) ?? 0) + 1)
  }

  const uniqueCellsVisited = visitCounts.size
  const coveragePercent = (uniqueCellsVisited / totalGridCells) * 100

  // Build visited cells list
  const visitedCells = Array.from(visitCounts.entries()).map(([key, visits]) => {
    const [x, y] = key.split(',').map(Number)
    return { x, y, visits }
  })

  // Hot zones: top 5% most visited cells
  const sorted = [...visitedCells].sort((a, b) => b.visits - a.visits)
  const hotCount = Math.max(1, Math.ceil(sorted.length * 0.05))
  const hotZones = sorted.slice(0, hotCount).map(({ x, y, visits }) => ({ x, y, visits }))

  // Cold zones: cells never visited (sample up to 20)
  const coldZones: Array<{ x: number; y: number }> = []
  for (let y = 0; y < size && coldZones.length < 20; y++) {
    for (let x = 0; x < size && coldZones.length < 20; x++) {
      if (!visitCounts.has(`${x},${y}`)) {
        coldZones.push({ x, y })
      }
    }
  }

  return {
    uniqueCellsVisited,
    totalGridCells,
    coveragePercent: Math.round(coveragePercent * 100) / 100,
    visitedCells: visitedCells.map(({ x, y }) => ({ x, y })),
    hotZones,
    coldZones,
  }
}

// ---------------------------------------------------------------------------
// 4. Efficiency Score — composite performance metric
// ---------------------------------------------------------------------------

export function calculateEfficiency(replayId: string): EfficiencyResult | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length === 0) return null

  const duration = Math.max(replay.duration, 1)
  const wordsPerSecond = replay.totalWordsEaten / duration
  const scorePerSecond = replay.finalScore / duration

  // Coverage efficiency: words eaten relative to cells visited
  const coverage = analyzeWordCoverage(replayId)
  const coverageEfficiency = coverage
    ? clamp(replay.totalWordsEaten / Math.max(coverage.uniqueCellsVisited, 1), 0, 1)
    : 0

  // Combo efficiency: ratio of average combo to max combo
  const maxCombo = replay.maxCombo
  let totalComboSum = 0
  let comboFrameCount = 0
  for (const frame of replay.frames) {
    if (frame.comboCount > 0) {
      totalComboSum += frame.comboCount
      comboFrameCount++
    }
  }
  const avgCombo = comboFrameCount > 0 ? totalComboSum / comboFrameCount : 0
  const comboEfficiency = maxCombo > 0 ? avgCombo / maxCombo : 0

  // Normalize individual scores (0–100 scale)
  const wordsScore = clamp((wordsPerSecond / 0.5) * 100, 0, 100)     // 0.5 words/sec = perfect
  const scoreScore = clamp((scorePerSecond / 50) * 100, 0, 100)       // 50 score/sec = perfect
  const coverageScore = clamp(coverageEfficiency * 100, 0, 100)
  const comboScoreVal = clamp(comboEfficiency * 100, 0, 100)

  // Weighted composite
  const overallEfficiency = Math.round(
    wordsScore * 0.3 +
    scoreScore * 0.25 +
    coverageScore * 0.25 +
    comboScoreVal * 0.2
  )

  let grade: EfficiencyResult['grade'] = 'needs_work'
  if (overallEfficiency >= 85) grade = 'elite'
  else if (overallEfficiency >= 65) grade = 'great'
  else if (overallEfficiency >= 45) grade = 'good'
  else if (overallEfficiency >= 25) grade = 'average'

  return {
    wordsPerSecond: Math.round(wordsPerSecond * 1000) / 1000,
    scorePerSecond: Math.round(scorePerSecond * 100) / 100,
    coverageEfficiency: Math.round(coverageEfficiency * 100) / 100,
    comboEfficiency: Math.round(comboEfficiency * 100) / 100,
    overallEfficiency,
    grade,
  }
}

// ---------------------------------------------------------------------------
// 5. Optimal Path Score — compare to ideal path efficiency
// ---------------------------------------------------------------------------

export function compareWithOptimal(replayId: string): OptimalPathResult | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length < 2) return null

  // Calculate actual total path length (head movement)
  let actualPathLength = 0
  for (let i = 1; i < replay.frames.length; i++) {
    const prev = replay.frames[i - 1].snake[0]
    const curr = replay.frames[i].snake[0]
    if (prev && curr) {
      actualPathLength += euclideanDist(prev, curr)
    }
  }

  // Calculate "optimal" path: straight-line distance from start to end
  const startHead = replay.frames[0].snake[0]
  const endHead = replay.frames[replay.frames.length - 1].snake[0]

  if (!startHead || !endHead) return null

  // Build the list of word/food positions to visit
  const targets: Array<{ x: number; y: number }> = []
  for (const frame of replay.frames) {
    if (frame.event === 'eat_word' && frame.food) {
      targets.push({ x: frame.food.x, y: frame.food.y })
    }
  }

  // Optimal path: start → nearest food → nearest food → ... → end (greedy TSP approximation)
  let optimalPathLength = 0
  if (targets.length > 0) {
    let current = startHead
    const remaining = [...targets]

    while (remaining.length > 0) {
      let nearestIdx = 0
      let nearestDist = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const d = euclideanDist(current, remaining[i])
        if (d < nearestDist) {
          nearestDist = d
          nearestIdx = i
        }
      }
      optimalPathLength += nearestDist
      current = remaining[nearestIdx]
      remaining.splice(nearestIdx, 1)
    }
    optimalPathLength += euclideanDist(current, endHead)
  } else {
    // No food collected — optimal is just start to end
    optimalPathLength = euclideanDist(startHead, endHead)
  }

  optimalPathLength = Math.max(optimalPathLength, 0.01) // prevent division by zero
  const efficiencyRatio = clamp(optimalPathLength / actualPathLength, 0, 1)

  // Count detours: frames where direction changes significantly
  let detourCount = 0
  let detourSum = 0
  const frameInterval = Math.max(1, Math.floor(replay.frames.length / 20)) // sample every 5%
  for (let i = frameInterval; i < replay.frames.length; i += frameInterval) {
    const prev = replay.frames[i - frameInterval].snake[0]
    const curr = replay.frames[i].snake[0]
    const prevPrev = i >= frameInterval * 2
      ? replay.frames[i - frameInterval * 2].snake[0]
      : null
    if (!prev || !curr) continue

    if (prevPrev) {
      // Angle change indicates a detour
      const dx1 = prev.x - prevPrev.x
      const dy1 = prev.y - prevPrev.y
      const dx2 = curr.x - prev.x
      const dy2 = curr.y - prev.y
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      if (len1 > 0 && len2 > 0) {
        const cosAngle = (dx1 * dx2 + dy1 * dy2) / (len1 * len2)
        if (cosAngle < 0.3) {
          detourCount++
          detourSum += euclideanDist(prev, curr)
        }
      }
    }
  }

  const averageDetourLength = detourCount > 0 ? detourSum / detourCount : 0

  // Path directness: ratio of net displacement to total path length
  const netDisplacement = euclideanDist(startHead, endHead)
  const pathDirectness = actualPathLength > 0
    ? clamp(netDisplacement / actualPathLength, 0, 1)
    : 0

  return {
    actualPathLength: Math.round(actualPathLength * 100) / 100,
    optimalPathLength: Math.round(optimalPathLength * 100) / 100,
    efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
    detourCount,
    averageDetourLength: Math.round(averageDetourLength * 100) / 100,
    pathDirectness: Math.round(pathDirectness * 100) / 100,
  }
}

// ---------------------------------------------------------------------------
// 6. Replay Comparison — side-by-side stats
// ---------------------------------------------------------------------------

export function compareReplays(id1: string, id2: string): ReplayComparison | null {
  const r1 = loadReplay(id1)
  const r2 = loadReplay(id2)
  if (!r1 || !r2) return null

  const e1 = calculateEfficiency(id1)
  const e2 = calculateEfficiency(id2)
  const c1 = analyzeWordCoverage(id1)
  const c2 = analyzeWordCoverage(id2)

  const scoreDiff = r2.finalScore - r1.finalScore
  const durationDiff = r2.duration - r1.duration
  const wordsDiff = r2.totalWordsEaten - r1.totalWordsEaten
  const comboDiff = r2.maxCombo - r1.maxCombo
  const coverageDiff = (c2?.coveragePercent ?? 0) - (c1?.coveragePercent ?? 0)
  const efficiencyDiff = (e2?.overallEfficiency ?? 0) - (e1?.overallEfficiency ?? 0)

  let scoreWinner: string | null = null
  if (r1.finalScore > r2.finalScore) scoreWinner = r1.id
  else if (r2.finalScore > r1.finalScore) scoreWinner = r2.id

  // Build a human-readable summary
  const parts: string[] = []
  if (scoreDiff !== 0) {
    const better = scoreDiff > 0 ? id2.slice(-6) : id1.slice(-6)
    parts.push(`Score: ${better} wins by ${Math.abs(scoreDiff)} pts`)
  }
  if (comboDiff !== 0) {
    parts.push(`Combo: ${Math.abs(comboDiff)}x difference`)
  }
  if (efficiencyDiff > 5) {
    parts.push(`Efficiency improved by ${efficiencyDiff} points`)
  } else if (efficiencyDiff < -5) {
    parts.push(`Efficiency dropped by ${Math.abs(efficiencyDiff)} points`)
  }
  const summary = parts.length > 0 ? parts.join('. ') + '.' : 'Both replays are very similar in performance.'

  return {
    replay1Id: r1.id,
    replay2Id: r2.id,
    scoreDiff,
    scoreWinner,
    durationDiff,
    wordsDiff,
    comboDiff,
    coverageDiff: Math.round(coverageDiff * 100) / 100,
    efficiencyDiff,
    summary,
  }
}

// ---------------------------------------------------------------------------
// 7. Session Trends — aggregated stats across all replays
// ---------------------------------------------------------------------------

export function getSessionTrends(): SessionTrends {
  const replays = loadAllReplays()

  const emptyTrends: SessionTrends = {
    totalReplays: 0,
    averageScore: 0,
    medianScore: 0,
    bestScore: 0,
    worstScore: 0,
    averageDuration: 0,
    averageWordsPerGame: 0,
    averageCombo: 0,
    scoreTrend: 'stable',
    improvementRate: 0,
    consistencyScore: 0,
    favoriteDifficulty: 'normal',
    mostCommonWord: null,
    longestStreak: 0,
    recentScores: [],
  }

  if (replays.length === 0) return emptyTrends

  const scores = replays.map(r => r.finalScore)
  const durations = replays.map(r => r.duration)
  const wordCounts = replays.map(r => r.totalWordsEaten)
  const combos = replays.map(r => r.maxCombo)

  // Sorted by date ascending for trend analysis
  const chronological = [...replays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const chronologicalScores = chronological.map(r => r.finalScore)

  const totalReplays = replays.length
  const averageScore = scores.reduce((a, b) => a + b, 0) / totalReplays
  const sortedScores = [...scores].sort((a, b) => a - b)
  const medianScore = totalReplays % 2 === 0
    ? (sortedScores[totalReplays / 2 - 1] + sortedScores[totalReplays / 2]) / 2
    : sortedScores[Math.floor(totalReplays / 2)]
  const bestScore = Math.max(...scores)
  const worstScore = Math.min(...scores)
  const averageDuration = durations.reduce((a, b) => a + b, 0) / totalReplays
  const averageWordsPerGame = wordCounts.reduce((a, b) => a + b, 0) / totalReplays
  const averageCombo = combos.reduce((a, b) => a + b, 0) / totalReplays

  // Score trend: compare first-half avg to second-half avg
  let scoreTrend: SessionTrends['scoreTrend'] = 'stable'
  let improvementRate = 0
  if (chronologicalScores.length >= 4) {
    const half = Math.floor(chronologicalScores.length / 2)
    const firstHalfAvg = chronologicalScores.slice(0, half).reduce((a, b) => a + b, 0) / half
    const secondHalfAvg = chronologicalScores.slice(half).reduce((a, b) => a + b, 0) / (chronologicalScores.length - half)
    const diff = secondHalfAvg - firstHalfAvg
    const threshold = averageScore * 0.1 // 10% threshold
    if (diff > threshold) scoreTrend = 'improving'
    else if (diff < -threshold) scoreTrend = 'declining'
    improvementRate = firstHalfAvg > 0 ? ((diff / firstHalfAvg) * 100) : 0
  }

  // Consistency: inverse of coefficient of variation
  const sd = stdDev(scores)
  const cv = averageScore > 0 ? sd / averageScore : 1
  const consistencyScore = Math.round(clamp((1 - cv) * 100, 0, 100))

  // Favorite difficulty
  const diffCounts = new Map<string, number>()
  for (const r of replays) {
    diffCounts.set(r.difficulty, (diffCounts.get(r.difficulty) ?? 0) + 1)
  }
  let favoriteDifficulty = 'normal'
  let maxDiffCount = 0
  for (const entry of Array.from(diffCounts.entries())) {
    const [diff, count] = entry
    if (count > maxDiffCount) {
      maxDiffCount = count
      favoriteDifficulty = diff
    }
  }

  // Most common word collected
  const wordFreq = new Map<string, number>()
  for (const r of replays) {
    for (const w of r.wordsCollected) {
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1)
    }
  }
  let mostCommonWord: string | null = null
  let maxWordCount = 0
  for (const entry of Array.from(wordFreq.entries())) {
    const [word, count] = entry
    if (count > maxWordCount) {
      maxWordCount = count
      mostCommonWord = word
    }
  }

  // Longest streak of consecutive games above average
  let longestStreak = 0
  let currentStreak = 0
  for (const score of chronologicalScores) {
    if (score >= averageScore) {
      currentStreak++
      if (currentStreak > longestStreak) longestStreak = currentStreak
    } else {
      currentStreak = 0
    }
  }

  // Recent scores (last 10)
  const recentScores = scores.slice(0, Math.min(10, totalReplays))

  return {
    totalReplays,
    averageScore: Math.round(averageScore),
    medianScore: Math.round(medianScore),
    bestScore,
    worstScore,
    averageDuration: Math.round(averageDuration),
    averageWordsPerGame: Math.round(averageWordsPerGame * 10) / 10,
    averageCombo: Math.round(averageCombo * 10) / 10,
    scoreTrend,
    improvementRate: Math.round(improvementRate * 10) / 10,
    consistencyScore,
    favoriteDifficulty,
    mostCommonWord,
    longestStreak,
    recentScores,
  }
}

// ---------------------------------------------------------------------------
// 8. Best Moments — top 3 highlights from a replay
// ---------------------------------------------------------------------------

export function findBestMoments(replayId: string): BestMomentsResult | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length === 0) return null

  const moments: BestMoment[] = []

  // --- Moment 1: Highest combo ---
  let maxComboVal = 0
  let maxComboIdx = 0
  for (let i = 0; i < replay.frames.length; i++) {
    if (replay.frames[i].comboCount > maxComboVal) {
      maxComboVal = replay.frames[i].comboCount
      maxComboIdx = i
    }
  }
  if (maxComboVal >= 2) {
    const frame = replay.frames[maxComboIdx]
    const timestamp = replay.duration > 0
      ? Math.round((frame.tick / replay.frames[replay.frames.length - 1].tick) * replay.duration)
      : maxComboIdx * 3
    moments.push({
      type: 'highest_combo',
      label: 'Max Combo',
      description: `Hit a ${maxComboVal}x word combo!`,
      frameIndex: maxComboIdx,
      timestamp,
      value: maxComboVal,
      details: {
        scoreAtCombo: frame.score,
        wordsEatenAtCombo: frame.wordsEaten.length,
      },
    })
  }

  // --- Moment 2: Longest survival streak (most frames between first word eaten and death) ---
  let firstWordFrame = replay.frames.findIndex(f => f.event === 'eat_word')
  let lastActiveFrame = replay.frames.length - 1
  for (let i = replay.frames.length - 1; i >= 0; i--) {
    if (replay.frames[i].score > 0) {
      lastActiveFrame = i
      break
    }
  }
  const survivalFrames = lastActiveFrame - firstWordFrame
  if (survivalFrames > 10 && firstWordFrame >= 0) {
    const frame = replay.frames[lastActiveFrame]
    const timestamp = replay.duration > 0
      ? Math.round((frame.tick / replay.frames[replay.frames.length - 1].tick) * replay.duration)
      : survivalFrames * 3
    moments.push({
      type: 'longest_survival',
      label: 'Longest Run',
      description: `Survived ${survivalFrames} active frames after first word!`,
      frameIndex: lastActiveFrame,
      timestamp,
      value: survivalFrames,
      details: {
        scoreAtEnd: frame.score,
        wordsAtEnd: frame.wordsEaten.length,
        startFrame: firstWordFrame,
        endFrame: lastActiveFrame,
      },
    })
  }

  // --- Moment 3: Best power-up sequence (consecutive power_up events close together) ---
  const powerUpFrames: number[] = []
  for (let i = 0; i < replay.frames.length; i++) {
    if (replay.frames[i].event === 'power_up') {
      powerUpFrames.push(i)
    }
  }

  if (powerUpFrames.length >= 1) {
    // Find the densest cluster of power-up events within a 30-frame window
    let bestClusterStart = 0
    let bestClusterCount = 0
    for (const start of powerUpFrames) {
      const end = start + 30
      const count = powerUpFrames.filter(f => f >= start && f <= end).length
      if (count > bestClusterCount) {
        bestClusterCount = count
        bestClusterStart = start
      }
    }

    const puFrame = replay.frames[bestClusterStart]
    const timestamp = replay.duration > 0
      ? Math.round((puFrame.tick / replay.frames[replay.frames.length - 1].tick) * replay.duration)
      : bestClusterStart * 3
    moments.push({
      type: 'power_up_sequence',
      label: 'Power-Up Frenzy',
      description: bestClusterCount >= 2
        ? `Collected ${bestClusterCount} power-ups in rapid succession!`
        : 'Grabbed a power-up at a key moment!',
      frameIndex: bestClusterStart,
      timestamp,
      value: bestClusterCount,
      details: {
        totalPowerUps: powerUpFrames.length,
        powerUpTypes: powerUpFrames
          .slice(0, 5)
          .map(i => replay.frames[i].powerUp?.type ?? 'unknown'),
      },
    })
  }

  // --- Fallback moments if fewer than 3 ---
  if (moments.length < 3) {
    // Score surge: largest score increase in any 10-frame window
    let maxSurge = 0
    let surgeIdx = 0
    for (let i = 10; i < replay.frames.length; i++) {
      const surge = replay.frames[i].score - replay.frames[i - 10].score
      if (surge > maxSurge) {
        maxSurge = surge
        surgeIdx = i
      }
    }
    if (maxSurge > 0 && moments.length < 3) {
      const frame = replay.frames[surgeIdx]
      const timestamp = replay.duration > 0
        ? Math.round((frame.tick / replay.frames[replay.frames.length - 1].tick) * replay.duration)
        : surgeIdx * 3
      moments.push({
        type: 'score_surge',
        label: 'Score Surge',
        description: `Gained ${maxSurge} points in rapid succession!`,
        frameIndex: surgeIdx,
        timestamp,
        value: maxSurge,
        details: { scoreAfter: frame.score },
      })
    }

    // Rare find: any rarity/easter_egg event
    if (moments.length < 3) {
      const rareIdx = replay.frames.findIndex(
        f => f.event === 'rarity' || f.event === 'easter_egg'
      )
      if (rareIdx >= 0) {
        const frame = replay.frames[rareIdx]
        const timestamp = replay.duration > 0
          ? Math.round((frame.tick / replay.frames[replay.frames.length - 1].tick) * replay.duration)
          : rareIdx * 3
        moments.push({
          type: 'rare_find',
          label: frame.event === 'easter_egg' ? 'Easter Egg!' : 'Rare Find!',
          description: frame.event === 'easter_egg'
            ? 'Discovered a hidden easter egg!'
            : `Found a rare event: ${JSON.stringify(frame.eventData ?? {})}`,
          frameIndex: rareIdx,
          timestamp,
          value: 1,
          details: frame.eventData ?? {},
        })
      }
    }
  }

  // Sort by significance (value * type weight) and take top 3
  const typeWeight: Record<BestMomentType, number> = {
    highest_combo: 3,
    longest_survival: 2,
    power_up_sequence: 2.5,
    score_surge: 1.5,
    rare_find: 2,
  }
  moments.sort((a, b) =>
    (b.value * typeWeight[b.type]) - (a.value * typeWeight[a.type])
  )

  return {
    replayId,
    moments: moments.slice(0, 3),
  }
}

// ---------------------------------------------------------------------------
// 9. Weakness Report — areas to improve
// ---------------------------------------------------------------------------

export function generateWeaknessReport(): WeaknessReport {
  const replays = loadAllReplays()
  const weaknesses: WeaknessEntry[] = []

  const emptyReport: WeaknessReport = {
    generatedAt: new Date().toISOString(),
    totalReplaysAnalyzed: 0,
    weaknesses: [],
    overallAssessment: 'No replays to analyze yet. Play some games first!',
    priorityAction: 'Complete a few games to generate personalized insights.',
  }

  if (replays.length < 2) return emptyReport

  const totalGames = replays.length

  // --- Check 1: Wall deaths ---
  let wallDeaths = 0
  let wallDeathGames = new Set<string>()
  for (const replay of replays) {
    const death = analyzeDeath(replay.id)
    if (death && death.cause === 'wall') {
      wallDeaths++
      wallDeathGames.add(replay.id)
    }
  }
  if (wallDeaths >= 2) {
    const pct = Math.round((wallDeathGames.size / totalGames) * 100)
    weaknesses.push({
      category: 'Wall Awareness',
      severity: pct > 60 ? 'critical' : 'moderate',
      description: `You died by hitting walls in ${pct}% of your games (${wallDeaths} times).`,
      suggestion: 'Practice turning earlier near boundaries. Watch for the grid edge when chasing words.',
      affectedGames: wallDeathGames.size,
      evidence: `Wall deaths detected in ${wallDeaths}/${totalGames} replays.`,
    })
  }

  // --- Check 2: Low combo maintenance ---
  const lowComboGames = replays.filter(r => r.maxCombo <= 2)
  if (lowComboGames.length >= totalGames * 0.5) {
    weaknesses.push({
      category: 'Combo Building',
      severity: lowComboGames.length === totalGames ? 'critical' : 'moderate',
      description: `${lowComboGames.length}/${totalGames} games had max combo of 2 or less.`,
      suggestion: 'Focus on eating words in quick succession. Plan your path to chain words together instead of wandering.',
      affectedGames: lowComboGames.length,
      evidence: `Max combo ≤ 2 in ${Math.round((lowComboGames.length / totalGames) * 100)}% of games.`,
    })
  }

  // --- Check 3: Short game duration ---
  const shortGames = replays.filter(r => r.duration < 30)
  if (shortGames.length >= totalGames * 0.6) {
    weaknesses.push({
      category: 'Survival Time',
      severity: 'critical',
      description: `${shortGames.length}/${totalGames} games lasted under 30 seconds.`,
      suggestion: 'Prioritize survival over chasing words. Leave space to maneuver and avoid trapping yourself.',
      affectedGames: shortGames.length,
      evidence: `Average duration: ${Math.round(replays.reduce((s, r) => s + r.duration, 0) / totalGames)}s.`,
    })
  }

  // --- Check 4: Low word collection rate ---
  const avgWordsPerSec = replays.reduce((s, r) => s + r.totalWordsEaten, 0) /
    Math.max(replays.reduce((s, r) => s + r.duration, 0), 1)
  if (avgWordsPerSec < 0.1) {
    weaknesses.push({
      category: 'Word Collection',
      severity: 'moderate',
      description: `You collect approximately ${Math.round(avgWordsPerSec * 100) / 100} words per second on average.`,
      suggestion: 'Try to keep a mental map of where food spawns and navigate toward it efficiently.',
      affectedGames: totalGames,
      evidence: `Collection rate: ${Math.round(avgWordsPerSec * 1000) / 1000} words/sec.`,
    })
  }

  // --- Check 5: Self-collision deaths ---
  let selfDeaths = 0
  let selfDeathGames = new Set<string>()
  for (const replay of replays) {
    const death = analyzeDeath(replay.id)
    if (death && death.cause === 'self') {
      selfDeaths++
      selfDeathGames.add(replay.id)
    }
  }
  if (selfDeaths >= 2) {
    weaknesses.push({
      category: 'Self-Collision',
      severity: 'moderate',
      description: `You collided with your own tail ${selfDeaths} times.`,
      suggestion: 'Avoid making tight loops. When the snake gets long, make wider turns and be mindful of your tail position.',
      affectedGames: selfDeathGames.size,
      evidence: `Self-collision in ${selfDeaths}/${totalGames} replays.`,
    })
  }

  // --- Check 6: Low grid exploration ---
  let lowCoverageCount = 0
  for (const replay of replays) {
    const cov = analyzeWordCoverage(replay.id)
    if (cov && cov.coveragePercent < 10) {
      lowCoverageCount++
    }
  }
  if (lowCoverageCount >= totalGames * 0.5 && totalGames >= 3) {
    weaknesses.push({
      category: 'Grid Exploration',
      severity: 'minor',
      description: `${lowCoverageCount}/${totalGames} games covered less than 10% of the grid.`,
      suggestion: 'Explore more of the grid to find better word opportunities and power-ups.',
      affectedGames: lowCoverageCount,
      evidence: `Low exploration detected in ${lowCoverageCount} games.`,
    })
  }

  // --- Check 7: Inconsistency ---
  const scores = replays.map(r => r.finalScore)
  const cv = stdDev(scores) / (scores.reduce((a, b) => a + b, 0) / totalGames || 1)
  if (cv > 1.0 && totalGames >= 3) {
    weaknesses.push({
      category: 'Consistency',
      severity: 'minor',
      description: 'Your scores vary significantly between games.',
      suggestion: 'Try to develop a consistent strategy rather than improvising each game.',
      affectedGames: totalGames,
      evidence: `Coefficient of variation: ${Math.round(cv * 100)}%.`,
    })
  }

  // Sort by severity
  const severityOrder: Record<WeaknessSeverity, number> = {
    critical: 0,
    moderate: 1,
    minor: 2,
    tip: 3,
  }
  weaknesses.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  // Overall assessment
  const criticalCount = weaknesses.filter(w => w.severity === 'critical').length
  let overallAssessment: string
  if (criticalCount >= 2) {
    overallAssessment = 'Multiple critical areas need attention. Focus on survival first, then improve collection and combos.'
  } else if (weaknesses.length === 0) {
    overallAssessment = 'Looking solid! No major weaknesses detected across your recent games.'
  } else {
    overallAssessment = `Identified ${weaknesses.length} area${weaknesses.length > 1 ? 's' : ''} for improvement. Tackle the highest severity items first.`
  }

  const priorityAction = weaknesses.length > 0
    ? weaknesses[0].suggestion
    : 'Keep playing to generate more data for deeper analysis.'

  return {
    generatedAt: new Date().toISOString(),
    totalReplaysAnalyzed: totalGames,
    weaknesses,
    overallAssessment,
    priorityAction,
  }
}

// ---------------------------------------------------------------------------
// 10. Performance Grade — letter grade based on composite metrics
// ---------------------------------------------------------------------------

export function assignPerformanceGrade(replayId: string): PerformanceGradeResult | null {
  const replay = loadReplay(replayId)
  if (!replay || replay.frames.length === 0) return null

  const efficiency = calculateEfficiency(replayId)
  const death = analyzeDeath(replayId)
  const coverage = analyzeWordCoverage(replayId)

  // --- Survival Score (0–100) ---
  // Based on duration relative to difficulty expectation
  const expectedDuration: Record<string, number> = {
    easy: 120, normal: 60, hard: 45, expert: 30, insane: 20,
  }
  const expected = expectedDuration[replay.difficulty.toLowerCase()] ?? 60
  const survivalScore = Math.round(clamp((replay.duration / expected) * 50, 0, 100))

  // --- Collection Score (0–100) ---
  // Based on total words eaten and unique words
  const wordRatio = replay.totalWordsEaten / Math.max(replay.duration, 1)
  const uniqueRatio = replay.wordsCollected.length / Math.max(replay.totalWordsEaten, 1)
  const collectionScore = Math.round(clamp(wordRatio * 150 + uniqueRatio * 30, 0, 100))

  // --- Combo Score (0–100) ---
  // Based on max combo achieved
  const comboScore = Math.round(clamp(replay.maxCombo * 15, 0, 100))

  // --- Efficiency Score (0–100) ---
  const efficiencyScore = efficiency?.overallEfficiency ?? 0

  // --- Exploration Score (0–100) ---
  const coveragePercent = coverage?.coveragePercent ?? 0
  const explorationScore = Math.round(clamp(coveragePercent * 2.5, 0, 100))

  // --- Composite Score (weighted) ---
  const compositeScore = Math.round(
    survivalScore * 0.25 +
    collectionScore * 0.2 +
    comboScore * 0.2 +
    efficiencyScore * 0.2 +
    explorationScore * 0.15
  )

  // Letter grade
  let grade: PerformanceGrade
  if (compositeScore >= 90) grade = 'S'
  else if (compositeScore >= 75) grade = 'A'
  else if (compositeScore >= 55) grade = 'B'
  else if (compositeScore >= 35) grade = 'C'
  else grade = 'D'

  // Strengths & areas to improve
  const strengths: string[] = []
  const areasToImprove: string[] = []

  if (survivalScore >= 70) strengths.push('Strong survival instincts')
  else areasToImprove.push('Work on surviving longer')

  if (collectionScore >= 70) strengths.push('Excellent word collection rate')
  else if (collectionScore < 40) areasToImprove.push('Collect words more efficiently')

  if (comboScore >= 70) strengths.push('Great combo building skills')
  else if (comboScore < 40) areasToImprove.push('Build longer word combos')

  if (efficiencyScore >= 70) strengths.push('Highly efficient playstyle')
  else if (efficiencyScore < 40) areasToImprove.push('Improve overall efficiency')

  if (explorationScore >= 70) strengths.push('Good grid exploration')
  else if (explorationScore < 40) areasToImprove.push('Explore more of the grid')

  // Death-specific suggestions
  if (death) {
    if (death.cause === 'wall') areasToImprove.push('Avoid wall collisions')
    if (death.cause === 'self') areasToImprove.push('Watch out for self-collisions')
    if (death.cause === 'starvation') areasToImprove.push('Keep moving toward food to avoid starvation')
  }

  // Difficulty bonus in summary
  const diffLabel = replay.difficulty.charAt(0).toUpperCase() + replay.difficulty.slice(1)
  const summary = `Grade ${grade} (${compositeScore}/100) on ${diffLabel} difficulty. ` +
    (strengths.length > 0
      ? `Strengths: ${strengths.slice(0, 2).join(', ')}.`
      : '') +
    (areasToImprove.length > 0
      ? ` Focus on: ${areasToImprove.slice(0, 2).join(', ')}.`
      : '')

  return {
    grade,
    score: compositeScore,
    breakdown: {
      survivalScore,
      collectionScore,
      comboScore,
      efficiencyScore,
      explorationScore,
    },
    strengths,
    areasToImprove,
    summary,
  }
}

// ---------------------------------------------------------------------------
// Convenience: Quick summary for a replay
// ---------------------------------------------------------------------------

export interface ReplayQuickSummary {
  replayId: string
  grade: PerformanceGrade
  score: number
  duration: string
  wordsEaten: number
  maxCombo: number
  topMoment: string
}

export function getQuickSummary(replayId: string): ReplayQuickSummary | null {
  const replay = loadReplay(replayId)
  if (!replay) return null

  const gradeResult = assignPerformanceGrade(replayId)
  const momentsResult = findBestMoments(replayId)

  const minutes = Math.floor(replay.duration / 60)
  const seconds = replay.duration % 60
  const durationStr = minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`

  return {
    replayId: replay.id,
    grade: gradeResult?.grade ?? 'D',
    score: replay.finalScore,
    duration: durationStr,
    wordsEaten: replay.totalWordsEaten,
    maxCombo: replay.maxCombo,
    topMoment: momentsResult?.moments[0]?.description ?? 'No highlights detected.',
  }
}
