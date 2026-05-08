'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getRandomWordWithCategories, getWordCountByCategory, getWordEntry, getWordEntryIncludingCustom, getCategoryInfo, CATEGORY_COLORS, type WordCategory, WORD_ENTRIES, WordRarity, RARITY_CONFIG, getRarityForPoints, getRandomRarity } from '@/lib/word-pool'
import { playEatSound, playGameOverSound, playStartSound, playPauseSound, playClickSound, playPowerUpSound, setSoundTheme, playThemePreviewSound } from '@/lib/sounds'
import { checkAchievements, type AchievementStats } from '@/lib/achievements'
import { AchievementQueue, type AchievementNotification } from '@/lib/achievement-queue'
import { checkMilestones, getActiveMilestoneBonuses, MILESTONE_CONFIG, type MilestoneConfig } from '@/lib/achievement-milestones'
import AchievementGallery from '@/components/achievement-gallery'
import GameStatsDialog from '@/components/game-stats'
import CustomWordsDialog from '@/components/custom-words-dialog'
import { getCustomWordCount } from '@/lib/custom-words'
import { getDailyChallenge, getDailyChallengeResult, saveDailyChallengeResult, isDailyChallengePlayed, type DailyChallenge } from '@/lib/daily-challenge'
import { getStreak, updateStreak, getStreakMultiplier, getActiveStreakBonus, applyStreakBonus, STREAK_BONUSES, type StreakInfo } from '@/lib/streak'
import { addLeaderboardEntry, getBestScore, getEntryCount, type Difficulty } from '@/lib/leaderboard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { getWordDefinition } from '@/lib/word-definitions'
import { POWERUP_CONFIG, getRandomPowerUpType, POWERUP_SPAWN_CHANCE, POWERUP_DESPAWN_TIME, type PowerUpType, type PowerUpConfig } from '@/lib/powerups'
import { trackGameEnd, trackWordEaten, trackPowerUpCollected, trackCombo, trackDailyPlayed } from '@/lib/game-stats'
import { getSnakeSkin, getAllSkins, getSavedSkin, saveSnakeSkin, type SnakeSkin } from '@/lib/snake-skins'
import { getGridTheme, getAllGridThemes, getSavedGridTheme, saveGridTheme, type GridThemeId } from '@/lib/grid-themes'
import { getSavedSoundTheme, getAllSoundThemes, saveSoundTheme, type SoundThemeId } from '@/lib/sound-themes'
import { getSavedTrail, getAllTrails, saveTrail, type SnakeTrailType, spawnTrailParticles, drawTrail, updateTrailParticles, type TrailParticle } from '@/lib/snake-trails'
import KeyboardShortcutsDialog from '@/components/keyboard-shortcuts-dialog'
import SettingsPanel from '@/components/settings-panel'
import GameOverStats from '@/components/game-over-stats'
import { isSpeechSupported, pronounceWord } from '@/lib/word-pronunciation'
import { getSpeedRunDuration, getSpeedRunBest, saveSpeedRunResult, type SpeedRunResult } from '@/lib/speed-run'
import { getNightModeConfig, saveNightModeConfig, shouldAutoEnableNightMode, getNightModeFilter, type NightModeConfig } from '@/lib/night-mode'
import { getPlayerLevel, getDifficultyAdjustment, recordGamePerformance, type DifficultyAdjustment } from '@/lib/dynamic-difficulty'
import { downloadShareCard, type ShareCardData } from '@/lib/share-card'
import {
  Play,
  RotateCcw,
  Pause,
  Trophy,
  Zap,
  Timer,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Settings,
  Gauge,
  Volume1,
  Moon,
  Share2,
} from 'lucide-react'

// Game constants
const CELL_SIZE = 20
const GRID_WIDTH = 30
const GRID_HEIGHT = 25
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }

interface WordFood {
  word: string
  position: Position
  spawnTime: number
  category: WordCategory
  rarity: WordRarity
}

interface FloatingText {
  text: string
  x: number
  y: number
  opacity: number
  vy: number
  color: string
  scale: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface PowerUp {
  type: PowerUpType
  position: Position
  spawnTime: number
}

interface ActivePowerUp {
  type: PowerUpType
  expiresAt: number // Date.now() when it expires, 0 for instant
}

interface GameState {
  snake: Position[]
  direction: Direction
  wordFood: WordFood | null
  gameStarted: boolean
  gameOver: boolean
  paused: boolean
  score: number
  speed: number
  wordsEaten: number
  difficulty: 'easy' | 'medium' | 'hard'
  startTime: number
  elapsedTime: number
  soundEnabled: boolean
  activeCategories: Set<WordCategory>
  lastAchievement: { title: string; description: string; emoji: string } | null
  isDailyChallenge: boolean
  dailyChallengeWords: string[]
  dailyWordsCollected: string[]
  dailyTargetScore: number
  streakMultiplier: number
  powerUp: PowerUp | null
  activePowerUps: ActivePowerUp[]
  comboCount: number
  lastEatenCategory: WordCategory | null
  comboMultiplier: number
  weather: 'clear' | 'rain' | 'snow' | 'stars'
  activeSkin: SnakeSkin
  showMiniMap: boolean
  gridTheme: GridThemeId
  extraLifeAvailable: boolean
  lastMilestone: { name: string; emoji: string; description: string } | null
  isSpeedRun: boolean
  speedRunTimeLeft: number // seconds remaining
  speedRunMaxCombo: number
  speedRunPowerUpsCollected: number
  speedRunLongestSnake: number
  wordsByCategory: Record<string, number>
}

const DIFFICULTY_SETTINGS = {
  easy: { speed: 180, speedInc: 1, minSpeed: 90, label: 'Easy', dotColor: 'bg-green-400' },
  medium: { speed: 140, speedInc: 2, minSpeed: 65, label: 'Medium', dotColor: 'bg-amber-400' },
  hard: { speed: 100, speedInc: 3, minSpeed: 45, label: 'Hard', dotColor: 'bg-red-400' },
}

const DIFFICULTY_THRESHOLDS = { easy: 0, medium: 50, hard: 150 }

const ALL_CATEGORIES: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']

// Weather gameplay configuration
const WEATHER_CONFIG: Record<GameState['weather'], {
  emoji: string
  label: string
  effect: string
  speedMultiplier: number // 1.0 = normal, higher = slower tick
  pointMultiplier: number // 1.0 = normal, higher = more points
  badgeBg: string
}> = {
  clear: { emoji: '☀️', label: 'Clear', effect: '', speedMultiplier: 1.0, pointMultiplier: 1.0, badgeBg: 'bg-slate-700' },
  rain: { emoji: '🌧️', label: 'Rain', effect: '-10% speed', speedMultiplier: 1.1, pointMultiplier: 1.0, badgeBg: 'bg-blue-900/50' },
  snow: { emoji: '❄️', label: 'Snow', effect: 'Fog & -5% speed', speedMultiplier: 1.05, pointMultiplier: 1.0, badgeBg: 'bg-cyan-900/50' },
  stars: { emoji: '⭐', label: 'Stars', effect: '+20% points', speedMultiplier: 1.0, pointMultiplier: 1.2, badgeBg: 'bg-amber-900/50' },
}

// Module-level achievement queue for cascading toasts
const achievementQueue = new AchievementQueue()

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

function loadActiveCategories(): Set<WordCategory> {
  if (typeof window === 'undefined') return new Set(ALL_CATEGORIES)
  try {
    const stored = localStorage.getItem('word-snake-categories')
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      const valid = parsed.filter((c): c is WordCategory => ALL_CATEGORIES.includes(c as WordCategory))
      if (valid.length > 0) return new Set(valid)
    }
  } catch { /* ignore */ }
  return new Set(ALL_CATEGORIES)
}

function saveActiveCategories(categories: Set<WordCategory>) {
  try {
    localStorage.setItem('word-snake-categories', JSON.stringify([...categories]))
  } catch { /* ignore */ }
}

// Draw a tiny preview of a grid theme on a small canvas
function drawThemePreview(canvas: HTMLCanvasElement, theme: { bgColor: string; gridColor: string; gridType: string; scanlines?: boolean; borderColor: string }) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height

  ctx.fillStyle = theme.bgColor
  ctx.fillRect(0, 0, w, h)

  // Draw simplified grid pattern
  const step = 4
  ctx.fillStyle = theme.gridColor

  if (theme.gridType === 'dots') {
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(x, y, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (theme.gridType === 'lines') {
    ctx.strokeStyle = theme.gridColor
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  } else if (theme.gridType === 'crosshatch') {
    ctx.strokeStyle = theme.gridColor
    ctx.globalAlpha = 0.12
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
    ctx.globalAlpha = 0.06
    for (let d = -h; d < w + h; d += 4) {
      ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d - h, h); ctx.stroke()
    }
  } else if (theme.gridType === 'organic') {
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        const hash = ((x * 7919 + y * 104729 + 42) % 100) / 100
        ctx.globalAlpha = 0.2 + hash * 0.3
        ctx.beginPath()
        ctx.arc(x, y, 0.5 + hash, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1

  // Border
  ctx.strokeStyle = theme.borderColor
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
  ctx.globalAlpha = 1

  // Scanlines for retro theme
  if (theme.scanlines) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1)
    }
  }
}


export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addWord, getWordList, getTotalCount } = useWordStore()
  const [highScore, setHighScore] = useState(0)
  const [leaderboardRank, setLeaderboardRank] = useState(0)

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Achievement gallery
  const [showAchievementGallery, setShowAchievementGallery] = useState(false)

  // Game stats dialog
  const [showGameStats, setShowGameStats] = useState(false)

  // Custom words dialog
  const [showCustomWords, setShowCustomWords] = useState(false)

  // Keyboard shortcuts dialog
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Sound theme state
  const [activeSoundTheme, setActiveSoundTheme] = useState<SoundThemeId>('default')
  const [soundWavePulse, setSoundWavePulse] = useState(false)

  // Trail state
  const [activeTrail, setActiveTrail] = useState<SnakeTrailType>('none')
  const trailParticlesRef = useRef<TrailParticle[]>([])

  // Daily challenge state (lazy init to avoid hydration mismatch)
  const [dailyInfo, setDailyInfo] = useState<{
    challenge: DailyChallenge | null
    played: boolean
    result: { completed: boolean; score: number } | null
  }>({ challenge: null, played: false, result: null })

  // Streak state (lazy init to avoid hydration mismatch)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)

  // Track if mounted (client-side only data loading)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Load client-only state after mount using microtask to avoid cascading render lint
  useEffect(() => {
    if (!mounted) return
    const loadData = () => {
      const stored = localStorage.getItem('word-snake-highscore')
      if (stored) setHighScore(parseInt(stored, 10))
      // Load difficulty-specific best score
      const gs = gameStateRef.current
      const diffBest = getBestScore(gs.difficulty)
      if (diffBest > 0) setHighScore(diffBest)
      setDailyInfo({
        challenge: getDailyChallenge(),
        played: isDailyChallengePlayed(),
        result: getDailyChallengeResult(),
      })
      setStreakInfo(getStreak())
      // Load saved skin
      const savedSkin = getSavedSkin()
      gameStateRef.current.activeSkin = savedSkin
      setActiveSkin(savedSkin)
      // Load saved grid theme
      const savedTheme = getSavedGridTheme()
      gameStateRef.current.gridTheme = savedTheme
      setActiveGridTheme(savedTheme)
      // Load mini-map visibility
      try {
        const mapPref = localStorage.getItem('word-snake-minimap')
        if (mapPref !== null) {
          const showMap = mapPref === 'true'
          gameStateRef.current.showMiniMap = showMap
          updateUI()
        }
      } catch { /* ignore */ }
      // Load saved sound theme
      const savedSoundTheme = getSavedSoundTheme()
      setSoundTheme(savedSoundTheme)
      setActiveSoundTheme(savedSoundTheme)
      // Load saved trail
      const savedTrail = getSavedTrail()
      setActiveTrail(savedTrail)
      // Load speed run best
      const srBest = getSpeedRunBest()
      setSpeedRunBest({ bestScore: srBest.bestScore, totalRuns: srBest.totalRuns })
      // Load night mode config
      const nmConfig = getNightModeConfig()
      if (nmConfig.autoEnabled && typeof window !== 'undefined') {
        nmConfig.enabled = isNightTime()
      }
      setNightMode(nmConfig)
      // Load dynamic difficulty
      setDynDiff(getDifficultyAdjustment())
    }
    const id = requestAnimationFrame(loadData)
    return () => cancelAnimationFrame(id)
  }, [mounted])

  const gameStateRef = useRef<GameState>({
    snake: [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ],
    direction: 'RIGHT',
    wordFood: null,
    gameStarted: false,
    gameOver: false,
    paused: false,
    score: 0,
    speed: DIFFICULTY_SETTINGS.medium.speed,
    wordsEaten: 0,
    difficulty: 'medium',
    startTime: 0,
    elapsedTime: 0,
    soundEnabled: true,
    activeCategories: loadActiveCategories(),
    lastAchievement: null,
    isDailyChallenge: false,
    dailyChallengeWords: [],
    dailyWordsCollected: [],
    dailyTargetScore: 0,
    streakMultiplier: 1,
    powerUp: null,
    activePowerUps: [],
    comboCount: 0,
    lastEatenCategory: null,
    comboMultiplier: 1,
    weather: 'clear' as const,
    activeSkin: 'classic' as SnakeSkin,
    showMiniMap: true,
    gridTheme: 'classic' as GridThemeId,
    extraLifeAvailable: false,
    lastMilestone: null,
    isSpeedRun: false,
    speedRunTimeLeft: 60,
    speedRunMaxCombo: 0,
    speedRunPowerUpsCollected: 0,
    speedRunLongestSnake: 0,
    wordsByCategory: {},
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())
  const floatingTextsRef = useRef<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const weatherParticlesRef = useRef<{x: number; y: number; vx: number; vy: number; size: number; alpha: number}[]>([])
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const milestoneToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [uiState, setUiState] = useState({
    score: 0,
    gameStarted: false,
    gameOver: false,
    paused: false,
    wordFood: null as WordFood | null,
    wordsEaten: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    elapsedTime: 0,
    soundEnabled: true,
    activeCategories: loadActiveCategories(),
    lastAchievement: null as { title: string; description: string; emoji: string } | null,
    achievementQueueSize: 0,
    isDailyChallenge: false,
    dailyChallengeWords: [] as string[],
    dailyWordsCollected: [] as string[],
    dailyTargetScore: 0,
    streakMultiplier: 1,
    powerUp: null as PowerUp | null,
    activePowerUps: [] as ActivePowerUp[],
    comboCount: 0,
    lastEatenCategory: null as WordCategory | null,
    comboMultiplier: 1,
    weather: 'clear' as GameState['weather'],
    activeSkin: 'classic' as SnakeSkin,
    showMiniMap: true,
    gridTheme: 'classic' as GridThemeId,
    extraLifeAvailable: false,
    lastMilestone: null as { name: string; emoji: string; description: string } | null,
    isSpeedRun: false,
    speedRunTimeLeft: 60,
    speedRunMaxCombo: 0,
    speedRunPowerUpsCollected: 0,
    speedRunLongestSnake: 0,
    wordsByCategory: {} as Record<string, number>,
  })

  // Skin state
  const [activeSkin, setActiveSkin] = useState<SnakeSkin>('classic')

  // Grid theme state
  const [activeGridTheme, setActiveGridTheme] = useState<GridThemeId>('classic')

  // Settings dialog
  const [showSettings, setShowSettings] = useState(false)

  // Speed run state
  const [speedRunBest, setSpeedRunBest] = useState<{ bestScore: number; totalRuns: number }>({ bestScore: 0, totalRuns: 0 })

  // Night mode state
  const [nightMode, setNightMode] = useState<NightModeConfig>({ enabled: false, warmth: 40, dimLevel: 20, autoEnabled: false })

  // Dynamic difficulty state
  const [dynDiff, setDynDiff] = useState<DifficultyAdjustment>(getDifficultyAdjustment(5))

  // Track word additions for entrance animation - key increments trigger re-render with animation
  const [newWordKey, setNewWordKey] = useState(0)

  // Skin bounce state for temporary class
  const [skinBounce, setSkinBounce] = useState(false)

  // Grid theme switch ripple state for temporary class
  const [themeSwitchRipple, setThemeSwitchRipple] = useState(false)

  const updateUI = useCallback(() => {
    const gs = gameStateRef.current
    setUiState({
      score: gs.score,
      gameStarted: gs.gameStarted,
      gameOver: gs.gameOver,
      paused: gs.paused,
      wordFood: gs.wordFood,
      wordsEaten: gs.wordsEaten,
      difficulty: gs.difficulty,
      elapsedTime: gs.elapsedTime,
      soundEnabled: gs.soundEnabled,
      activeCategories: gs.activeCategories,
      lastAchievement: gs.lastAchievement ?? null,
      achievementQueueSize: achievementQueue.size,
      isDailyChallenge: gs.isDailyChallenge,
      dailyChallengeWords: gs.dailyChallengeWords,
      dailyWordsCollected: gs.dailyWordsCollected,
      dailyTargetScore: gs.dailyTargetScore,
      streakMultiplier: gs.streakMultiplier,
      powerUp: gs.powerUp,
      activePowerUps: gs.activePowerUps,
      comboCount: gs.comboCount,
      lastEatenCategory: gs.lastEatenCategory,
      comboMultiplier: gs.comboMultiplier,
      weather: gs.weather,
      activeSkin: gs.activeSkin,
      showMiniMap: gs.showMiniMap,
      gridTheme: gs.gridTheme,
      extraLifeAvailable: gs.extraLifeAvailable,
      lastMilestone: gs.lastMilestone,
      isSpeedRun: gs.isSpeedRun,
      speedRunTimeLeft: gs.speedRunTimeLeft,
      speedRunMaxCombo: gs.speedRunMaxCombo,
      speedRunPowerUpsCollected: gs.speedRunPowerUpsCollected,
      speedRunLongestSnake: gs.speedRunLongestSnake,
      wordsByCategory: gs.wordsByCategory,
    })
  }, [])

  const showNextAchievement = useCallback(() => {
    const next = achievementQueue.dequeue()
    if (next) {
      gameStateRef.current.lastAchievement = next
      updateUI()
      // Auto-dismiss after 4 seconds
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => {
        gameStateRef.current.lastAchievement = null
        updateUI()
        // If more in queue, show next after 500ms delay
        if (!achievementQueue.isEmpty()) {
          toastTimerRef.current = setTimeout(() => {
            showNextAchievement()
          }, 500)
        }
      }, 4000)
    }
  }, [updateUI])

  const enqueueAchievements = useCallback((newlyUnlocked: AchievementNotification[]) => {
    const wasEmpty = achievementQueue.isEmpty() && !gameStateRef.current.lastAchievement
    for (const a of newlyUnlocked) {
      achievementQueue.enqueue(a)
    }
    if (wasEmpty) {
      showNextAchievement()
    }
    updateUI()
  }, [showNextAchievement, updateUI])

  const playSound = useCallback((soundFn: () => void) => {
    if (gameStateRef.current.soundEnabled) {
      soundFn()
    }
  }, [])

  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      text,
      x,
      y,
      opacity: 1,
      vy: -1.5,
      color,
      scale: 1,
    })
  }, [])

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 1 + Math.random() * 2
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3,
      })
    }
  }, [])

  const spawnWord = useCallback(() => {
    const gs = gameStateRef.current
    const occupiedPositions = new Set(gs.snake.map((s) => `${s.x},${s.y}`))

    let word: string
    let category: WordCategory

    if (gs.isDailyChallenge && gs.dailyChallengeWords.length > 0) {
      const remaining = gs.dailyChallengeWords.filter(
        (w) => !gs.dailyWordsCollected.includes(w)
      )
      const pool = remaining.length > 0 ? remaining : gs.dailyChallengeWords
      word = pool[Math.floor(Math.random() * pool.length)]
      const entry = getWordEntry(word)
      category = entry?.category ?? 'nature'
    } else {
      const collected = Array.from(collectedWordsRef.current)
      const pick = getRandomWordWithCategories(collected, gs.activeCategories)
      word = pick.word
      category = pick.category
    }

    const margin = 3
    let pos: Position
    let attempts = 0
    do {
      pos = {
        x: Math.floor(Math.random() * (GRID_WIDTH - margin * 2)) + margin,
        y: Math.floor(Math.random() * (GRID_HEIGHT - margin * 2)) + margin,
      }
      attempts++
    } while (occupiedPositions.has(`${pos.x},${pos.y}`) && attempts < 100)

    const rarity = getRandomRarity()
    gs.wordFood = { word, position: pos, spawnTime: Date.now(), category, rarity }
  }, [])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gs = gameStateRef.current
    const { snake, direction, wordFood, gameStarted, gameOver, paused } = gs

    // Get grid theme
    const gridTheme = getGridTheme(gs.gridTheme)

    // Clear canvas with theme background
    ctx.fillStyle = gridTheme.bgColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid based on theme gridType
    ctx.fillStyle = gridTheme.gridColor
    if (gridTheme.gridType === 'dots') {
      for (let x = 0; x <= GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT; y++) {
          ctx.beginPath()
          ctx.arc(x * CELL_SIZE, y * CELL_SIZE, 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (gridTheme.gridType === 'lines') {
      ctx.strokeStyle = gridTheme.gridColor
      ctx.globalAlpha = 0.15
      ctx.lineWidth = 0.5
      for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (gridTheme.gridType === 'crosshatch') {
      ctx.strokeStyle = gridTheme.gridColor
      ctx.globalAlpha = 0.08
      ctx.lineWidth = 0.5
      // Vertical lines
      for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      // Horizontal lines
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE)
        ctx.stroke()
      }
      // Diagonal lines for crosshatch
      ctx.globalAlpha = 0.04
      for (let d = -GRID_HEIGHT; d <= GRID_WIDTH + GRID_HEIGHT; d += 2) {
        ctx.beginPath()
        ctx.moveTo(d * CELL_SIZE, 0)
        ctx.lineTo((d - GRID_HEIGHT) * CELL_SIZE, CANVAS_HEIGHT)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (gridTheme.gridType === 'organic') {
      // Organic moss-like dot pattern with varied sizes and opacity
      const seed = 42
      for (let x = 0; x <= GRID_WIDTH; x++) {
        for (let y = 0; y <= GRID_HEIGHT; y++) {
          const hash = ((x * 7919 + y * 104729 + seed) % 100) / 100
          const radius = 0.5 + hash * 1.5
          ctx.globalAlpha = 0.15 + hash * 0.25
          ctx.beginPath()
          ctx.arc(x * CELL_SIZE, y * CELL_SIZE, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    // Weather effects
    if (gs.weather !== 'clear' && gameStarted && !gameOver) {
      const wp = weatherParticlesRef.current
      
      // Initialize weather particles if empty
      if (wp.length === 0) {
        const count = gs.weather === 'rain' ? 80 : gs.weather === 'snow' ? 50 : 30
        for (let i = 0; i < count; i++) {
          wp.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            vx: gs.weather === 'rain' ? -1 : gs.weather === 'snow' ? (Math.random() - 0.5) * 0.5 : 0,
            vy: gs.weather === 'rain' ? 4 + Math.random() * 3 : gs.weather === 'snow' ? 0.5 + Math.random() * 1 : 0,
            size: gs.weather === 'rain' ? 1 : gs.weather === 'snow' ? 2 + Math.random() * 2 : 1 + Math.random(),
            alpha: gs.weather === 'stars' ? Math.random() : 0.3 + Math.random() * 0.4,
          })
        }
      }
      
      // Update and draw weather particles
      for (const p of wp) {
        p.x += p.vx
        p.y += p.vy
        
        if (gs.weather === 'rain') {
          if (p.y > CANVAS_HEIGHT) { p.y = -5; p.x = Math.random() * CANVAS_WIDTH }
          ctx.globalAlpha = p.alpha
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2)
          ctx.stroke()
        } else if (gs.weather === 'snow') {
          if (p.y > CANVAS_HEIGHT) { p.y = -5; p.x = Math.random() * CANVAS_WIDTH }
          p.vx = Math.sin(Date.now() / 1000 + p.x) * 0.3
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = '#e2e8f0'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (gs.weather === 'stars') {
          p.alpha = 0.3 + Math.sin(Date.now() / 500 + p.x + p.y) * 0.3
          if (p.alpha > 0) {
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = '#fbbf24'
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // Snow fog overlay (blizzard effect)
    if (gs.weather === 'snow' && gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(200, 220, 240, 0.12)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // Draw border glow
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0)
    if (gs.isDailyChallenge && gameStarted) {
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)')
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)')
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0.15)')
    } else {
      gradient.addColorStop(0, gridTheme.borderColor)
      gradient.addColorStop(0.5, gridTheme.borderGlowColor)
      gradient.addColorStop(1, gridTheme.borderColor)
    }
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2)

    // Daily challenge banner during gameplay
    if (gs.isDailyChallenge && gameStarted && !gameOver && !paused) {
      const remaining = gs.dailyChallengeWords.filter(
        (w) => !gs.dailyWordsCollected.includes(w)
      ).length
      const total = gs.dailyChallengeWords.length

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, 28)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `📅 Daily Challenge  •  ${gs.dailyTargetScore} pts target  •  ${remaining}/${total} words remaining`,
        CANVAS_WIDTH / 2,
        14
      )
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw snake body trail (faint glow behind snake)
    if (snake.length > 1) {
      ctx.globalAlpha = 0.04
      const skin = getSnakeSkin(gs.activeSkin)
      ctx.fillStyle = gs.isDailyChallenge ? '#f59e0b' : skin.glowColor
      for (const seg of snake) {
        ctx.beginPath()
        ctx.arc(
          seg.x * CELL_SIZE + CELL_SIZE / 2,
          seg.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE * 0.8,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // Draw custom trail effects
    drawTrail(ctx, activeTrail, snake, trailParticlesRef.current, CELL_SIZE, gs.isDailyChallenge ? '#f59e0b' : getSnakeSkin(gs.activeSkin).headColor, Date.now())

    // Draw snake
    const skin = getSnakeSkin(gs.activeSkin)
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.shadowColor = gs.isDailyChallenge ? '#f59e0b' : skin.glowColor
        ctx.shadowBlur = 12
        ctx.fillStyle = gs.isDailyChallenge ? '#fbbf24' : skin.headColor
        ctx.beginPath()
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          5
        )
        ctx.fill()
        ctx.shadowBlur = 0

        // Eyes
        const eyeSize = 2.5
        const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
        const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
        let eye1x: number, eye1y: number, eye2x: number, eye2y: number

        if (direction === 'RIGHT') {
          eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5
        } else if (direction === 'LEFT') {
          eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5
        } else if (direction === 'UP') {
          eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4
        } else {
          eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4
        }
        ctx.fillStyle = gs.isDailyChallenge ? '#ffffff' : skin.eyeColor
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = gridTheme.bgColor
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()
      } else {
        // Body
        const ratio = 1 - index / snake.length

        // Determine fill color based on pattern
        if (gs.isDailyChallenge) {
          const red = Math.floor(160 + ratio * 95)
          const alpha = 0.6 + ratio * 0.4
          ctx.fillStyle = `rgba(${red}, 158, 34, ${alpha})`
        } else if (skin.pattern === 'rainbow') {
          const hue = (index * 360 / snake.length + Date.now() / 50) % 360
          ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
        } else if (skin.pattern === 'gradient') {
          // Interpolate from bodyGradient[0] to bodyGradient[1]
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else if (skin.pattern === 'striped') {
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = (0.6 + ratio * 0.4) * (index % 2 === 0 ? 1 : 0.55)
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else if (skin.pattern === 'dotted') {
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        } else {
          // solid pattern (classic + shadow)
          const c0 = hexToRgb(skin.bodyGradient[0])
          const c1 = hexToRgb(skin.bodyGradient[1])
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
          const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
          const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        // Draw connector between adjacent segments (for all patterns)
        if (skin.pattern !== 'dotted') {
          const prev = snake[index - 1]
          const dx = prev.x - segment.x
          const dy = prev.y - segment.y
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            ctx.fillRect(
              Math.min(prev.x, segment.x) * CELL_SIZE + 2,
              Math.min(prev.y, segment.y) * CELL_SIZE + 2,
              (Math.abs(dx) + 1) * CELL_SIZE - 4,
              (Math.abs(dy) + 1) * CELL_SIZE - 4
            )
          }
        }

        // Draw segment shape based on pattern
        if (skin.pattern === 'dotted') {
          // Small circles instead of rectangles
          ctx.beginPath()
          ctx.arc(
            segment.x * CELL_SIZE + CELL_SIZE / 2,
            segment.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 3,
            0,
            Math.PI * 2
          )
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.roundRect(
            segment.x * CELL_SIZE + 2,
            segment.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4,
            3
          )
          ctx.fill()
        }
      }
    })

    // Platinum milestone: golden sparkle particle trail behind snake head
    if (gameStarted && !gameOver && !paused && snake.length > 0) {
      try {
        const bonuses = getActiveMilestoneBonuses()
        if (bonuses.hasGoldenTrail) {
          const headSeg = snake[0]
          const hx = headSeg.x * CELL_SIZE + CELL_SIZE / 2
          const hy = headSeg.y * CELL_SIZE + CELL_SIZE / 2
          // Spawn 1-2 golden sparkle particles each frame
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 0.3 + Math.random() * 0.8
            particlesRef.current.push({
              x: hx + (Math.random() - 0.5) * 8,
              y: hy + (Math.random() - 0.5) * 8,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 0.6 + Math.random() * 0.4,
              maxLife: 1,
              color: Math.random() > 0.5 ? '#ffd700' : '#fff8dc',
              size: 1.5 + Math.random() * 2,
            })
          }
        }
      } catch { /* ignore */ }

      // Spawn trail particles
      const skin = getSnakeSkin(gs.activeSkin)
      spawnTrailParticles(activeTrail, trailParticlesRef.current, snake, CELL_SIZE, gs.isDailyChallenge ? '#f59e0b' : skin.headColor, Date.now())
      // Update trail particles
      updateTrailParticles(trailParticlesRef.current, 0.016)
    }

    // Draw word food with category-based coloring
    if (wordFood) {
      const { word, position, spawnTime, category } = wordFood
      const elapsed = Date.now() - spawnTime
      const pulse = 1 + Math.sin(elapsed / 300) * 0.08
      const catColor = CATEGORY_COLORS[category] ?? '#f59e0b'

      ctx.font = 'bold 11px monospace'
      const wordWidth = ctx.measureText(word).width
      const padding = 8
      const boxWidth = (wordWidth + padding * 2) * pulse
      const boxHeight = (CELL_SIZE + padding) * pulse
      const boxX = position.x * CELL_SIZE + CELL_SIZE / 2 - boxWidth / 2
      const boxY = position.y * CELL_SIZE + CELL_SIZE / 2 - boxHeight / 2

      // Glow
      ctx.shadowColor = catColor
      ctx.shadowBlur = 16 + Math.sin(elapsed / 200) * 6

      // Background
      const bgGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight)
      bgGrad.addColorStop(0, '#1a1a2e')
      bgGrad.addColorStop(1, '#2d2d44')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.fill()
      ctx.shadowBlur = 0

      // Category-colored border
      ctx.strokeStyle = catColor
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6 + Math.sin(elapsed / 250) * 0.3
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Inner highlight
      ctx.strokeStyle = `${catColor}26`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4, 6)
      ctx.stroke()

      // Category indicator dot
      ctx.fillStyle = catColor
      ctx.beginPath()
      ctx.arc(boxX + 8, boxY + boxHeight / 2, 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Rarity effects
      const rarity = wordFood.rarity
      const rarityConf = RARITY_CONFIG[rarity]
      if (rarity !== 'common' && rarityConf) {
        // Extra glow for uncommon/rare/legendary
        ctx.shadowColor = rarityConf.color
        ctx.shadowBlur = rarity === 'legendary' ? 30 : rarity === 'rare' ? 22 : 14
        
        // Legendary: rotating rays
        if (rarity === 'legendary') {
          const rayAngle = elapsed / 1000
          ctx.save()
          ctx.translate(boxX + boxWidth / 2, boxY + boxHeight / 2)
          for (let r = 0; r < 8; r++) {
            const angle = rayAngle + (r * Math.PI) / 4
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 + Math.sin(elapsed / 200 + r) * 0.1})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10)
            ctx.lineTo(Math.cos(angle) * (boxWidth / 2 + 8), Math.sin(angle) * (boxHeight / 2 + 8))
            ctx.stroke()
          }
          ctx.restore()
        }
        
        // Rare: sparkle particles around the word
        if (rarity === 'rare') {
          for (let s = 0; s < 4; s++) {
            const sparkleAngle = elapsed / 500 + s * Math.PI / 2
            const sparkleX = boxX + boxWidth / 2 + Math.cos(sparkleAngle) * (boxWidth / 2 + 4)
            const sparkleY = boxY + boxHeight / 2 + Math.sin(sparkleAngle) * (boxHeight / 2 + 4)
            const sparkleAlpha = 0.4 + Math.sin(elapsed / 200 + s) * 0.3
            ctx.globalAlpha = sparkleAlpha
            ctx.fillStyle = rarityConf.color
            ctx.beginPath()
            ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }
        
        // Rarity indicator badge (small colored diamond in top-right of word box)
        ctx.fillStyle = rarityConf.color
        ctx.font = `bold 8px sans-serif`
        ctx.textAlign = 'right'
        ctx.fillText(rarityConf.emoji || '◆', boxX + boxWidth - 4, boxY + 10)
        ctx.textAlign = 'start'
        
        ctx.shadowBlur = 0
      }

      // Text
      ctx.fillStyle = catColor
      ctx.font = `bold ${11 * pulse}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, boxX + boxWidth / 2 + 3, boxY + boxHeight / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw power-up
    if (gs.powerUp) {
      const pu = gs.powerUp
      const config = POWERUP_CONFIG[pu.type]
      const elapsed = Date.now() - pu.spawnTime
      const pulse = 1 + Math.sin(elapsed / 250) * 0.12

      const cx = pu.position.x * CELL_SIZE + CELL_SIZE / 2
      const cy = pu.position.y * CELL_SIZE + CELL_SIZE / 2

      // Outer glow
      ctx.shadowColor = config.color
      ctx.shadowBlur = 20 + Math.sin(elapsed / 200) * 8

      // Background circle
      ctx.fillStyle = `${config.color}25`
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE * pulse, 0, Math.PI * 2)
      ctx.fill()

      // Border ring
      ctx.strokeStyle = config.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.5 + Math.sin(elapsed / 200) * 0.3
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE * pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Emoji
      ctx.font = `${14 * pulse}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.emoji, cx, cy)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
      ctx.shadowBlur = 0
    }

    // Combo indicator
    if (gs.comboCount > 1 && gameStarted && !gameOver && !paused) {
      const comboAlpha = Math.min(1, 0.5 + Math.sin(Date.now() / 300) * 0.3)
      ctx.globalAlpha = comboAlpha
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`🔥 ×${gs.comboMultiplier.toFixed(1)} COMBO`, CANVAS_WIDTH - 12, 22)
      if (gs.lastEatenCategory) {
        ctx.fillStyle = CATEGORY_COLORS[gs.lastEatenCategory] ?? '#f59e0b'
        ctx.font = '10px sans-serif'
        ctx.fillText(`${gs.comboCount}× ${getCategoryInfo(gs.lastEatenCategory).label}`, CANVAS_WIDTH - 12, 36)
      }
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Active power-ups HUD at bottom
    if (gs.activePowerUps.length > 0 && gameStarted && !gameOver) {
      const hudY = CANVAS_HEIGHT - 24
      gs.activePowerUps.forEach((apu, i) => {
        const config = POWERUP_CONFIG[apu.type]
        const remaining = apu.expiresAt > 0 ? Math.max(0, Math.ceil((apu.expiresAt - Date.now()) / 1000)) : 0
        const x = 12 + i * 70

        ctx.fillStyle = `${config.color}30`
        ctx.beginPath()
        ctx.roundRect(x, hudY - 8, 60, 18, 4)
        ctx.fill()

        ctx.fillStyle = config.color
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${config.emoji} ${remaining > 0 ? remaining + 's' : '✓'}`, x + 4, hudY + 4)
      })
      ctx.textAlign = 'start'
    }

    // Speed Run Timer on canvas
    if (gs.isSpeedRun && gameStarted && !gameOver) {
      const timerColor = gs.speedRunTimeLeft <= 10 ? '#ef4444' : '#fb7185'
      const pulse = gs.speedRunTimeLeft <= 10 ? 0.7 + Math.sin(Date.now() / 200) * 0.3 : 1
      ctx.globalAlpha = pulse
      ctx.fillStyle = timerColor
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`⏱ ${gs.speedRunTimeLeft}s`, CANVAS_WIDTH / 2, 18)
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Mini-map (only during active gameplay)
    if (gs.showMiniMap && gameStarted && !gameOver) {
      const MAP_W = 120
      const MAP_H = 100
      const MAP_PAD = 10
      // Position above active power-ups HUD if present
      const mapBottomOffset = gs.activePowerUps.length > 0 ? 44 : MAP_PAD
      const mapX = CANVAS_WIDTH - MAP_W - MAP_PAD
      const mapY = CANVAS_HEIGHT - MAP_H - mapBottomOffset

      // Dim during pause
      if (paused) {
        ctx.globalAlpha = 0.4
      }

      // Background
      const mmBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${mmBg.r}, ${mmBg.g}, ${mmBg.b}, 0.85)`
      ctx.beginPath()
      ctx.roundRect(mapX, mapY, MAP_W, MAP_H, 6)
      ctx.fill()

      // Border
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(mapX, mapY, MAP_W, MAP_H, 6)
      ctx.stroke()

      // "MAP" label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('MAP', mapX + 4, mapY + 3)

      // Scale: grid (30×25) → map (120×100), so cellW = 4, cellH = 4
      const cellW = MAP_W / GRID_WIDTH
      const cellH = MAP_H / GRID_HEIGHT

      // Draw word food as a small colored dot
      if (wordFood) {
        const wfCatColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
        ctx.fillStyle = wfCatColor
        ctx.beginPath()
        ctx.arc(
          mapX + wordFood.position.x * cellW + cellW / 2,
          mapY + wordFood.position.y * cellH + cellH / 2,
          3, 0, Math.PI * 2
        )
        ctx.fill()
      }

      // Draw power-up as a small colored dot
      if (gs.powerUp) {
        const puConfig = POWERUP_CONFIG[gs.powerUp.type]
        ctx.fillStyle = puConfig.color
        ctx.beginPath()
        ctx.arc(
          mapX + gs.powerUp.position.x * cellW + cellW / 2,
          mapY + gs.powerUp.position.y * cellH + cellH / 2,
          3, 0, Math.PI * 2
        )
        ctx.fill()
      }

      // Draw snake as small dots — head in headColor, body in bodyGradient[1]
      const mapSkin = getSnakeSkin(gs.activeSkin)
      snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = gs.isDailyChallenge ? '#fbbf24' : mapSkin.headColor
        } else {
          ctx.fillStyle = gs.isDailyChallenge ? '#f59e0b' : mapSkin.bodyGradient[1]
        }
        ctx.beginPath()
        ctx.arc(
          mapX + segment.x * cellW + cellW / 2,
          mapY + segment.y * cellH + cellH / 2,
          index === 0 ? 3 : 2,
          0, Math.PI * 2
        )
        ctx.fill()
      })

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      if (paused) {
        ctx.globalAlpha = 1
      }
    }

    // Draw floating texts
    const ft = floatingTextsRef.current
    for (let i = ft.length - 1; i >= 0; i--) {
      const f = ft[i]
      f.y += f.vy
      f.opacity -= 0.012
      f.scale = Math.min(1, f.scale + 0.05)
      if (f.opacity <= 0) { ft.splice(i, 1); continue }
      ctx.globalAlpha = f.opacity
      ctx.fillStyle = f.color
      ctx.font = `bold ${14 * f.scale}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(f.text, f.x, f.y)
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Draw particles
    const pts = particlesRef.current
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      p.x += p.vx; p.y += p.vy; p.life -= 0.025; p.vy += 0.03
      if (p.life <= 0) { pts.splice(i, 1); continue }
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Scanlines overlay (retro CRT effect)
    if (gridTheme.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 1)
      }
    }

    // Game over overlay
    if (gameOver) {
      const goBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
      lineGrad.addColorStop(0, 'rgba(239, 68, 68, 0)')
      lineGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)')
      lineGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')

      ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 80); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 80); ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 40px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40)

      // Score with streak bonus
      const bonusInfo = applyStreakBonus(gs.score, streakInfo?.currentStreak ?? 0)
      ctx.fillStyle = '#94a3b8'; ctx.font = '18px sans-serif'
      if (bonusInfo.multiplier > 1) {
        ctx.fillText(`Score: ${gs.score} (×${bonusInfo.multiplier} streak bonus)`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      } else {
        ctx.fillText(`Score: ${gs.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      }

      ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'
      ctx.fillText(`${gs.wordsEaten} words collected  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25)

      // Daily challenge result
      if (gs.isDailyChallenge) {
        const dailyCompleted = gs.score >= gs.dailyTargetScore
        ctx.fillStyle = dailyCompleted ? '#4ade80' : '#f87171'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(
          dailyCompleted
            ? 'Daily Complete! 🎉'
            : `Target missed (${gs.dailyTargetScore} pts needed)`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 55
        )
      }

      // Leaderboard rank
      if (leaderboardRank > 0) {
        const rankY = gs.isDailyChallenge ? CANVAS_HEIGHT / 2 + 75 : CANVAS_HEIGHT / 2 + 55
        const totalEntries = getEntryCount(gs.difficulty)
        if (leaderboardRank === 1) {
          ctx.fillStyle = '#fbbf24'
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText('New High Score! 🏆', CANVAS_WIDTH / 2, rankY)
        } else {
          ctx.fillStyle = '#94a3b8'
          ctx.font = '14px sans-serif'
          ctx.fillText(`Rank #${leaderboardRank} of ${totalEntries}`, CANVAS_WIDTH / 2, rankY)
        }
      }

      ctx.strokeStyle = lineGrad
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 90); ctx.stroke()

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 115)
      ctx.textAlign = 'start'
    }

    // Start screen
    if (!gameStarted) {
      const ssBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${ssBg.r}, ${ssBg.g}, ${ssBg.b}, 0.92)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const startSkin = getSnakeSkin(gs.activeSkin)

      // === LEFT COLUMN: Title, legends, info ===
      const leftCenterX = CANVAS_WIDTH * 0.33

      // Title
      ctx.shadowColor = startSkin.glowColor; ctx.shadowBlur = 20
      ctx.fillStyle = startSkin.headColor; ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WORD SNAKE', leftCenterX, 68)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#94a3b8'; ctx.font = '13px sans-serif'
      ctx.fillText('Eat words, collect them, make poetry', leftCenterX, 92)

      // Category legend (2 columns on left side)
      const categories: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']
      const catCols = 2
      const catStartY = 116
      const catRowH = 18
      const catColW = 130
      categories.forEach((cat, i) => {
        const info = getCategoryInfo(cat)
        const col = i % catCols
        const row = Math.floor(i / catCols)
        const x = leftCenterX - (catCols * catColW) / 2 + col * catColW + 10
        const y = catStartY + row * catRowH
        ctx.fillStyle = CATEGORY_COLORS[cat]
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(info.label, x + 8, y + 4)
      })

      // Rarity legend
      const rarityY = catStartY + (Math.ceil(categories.length / catCols)) * catRowH + 8
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText('Rarity:', leftCenterX - 70, rarityY)
      const rarities: WordRarity[] = ['common', 'uncommon', 'rare', 'legendary']
      let rx = leftCenterX - 42
      rarities.forEach((r) => {
        const rc = RARITY_CONFIG[r]
        ctx.fillStyle = rc.color
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${rc.emoji || '•'} ${rc.label}`, rx, rarityY)
        rx += 60
      })
      ctx.textAlign = 'start'

      // Weather info note
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText('Weather changes each game', leftCenterX, rarityY + 16)
      ctx.fillText('Rain slows · Snow fogs · Stars boost', leftCenterX, rarityY + 30)
      ctx.textAlign = 'start'

      // Streak bonus legend
      if (streakInfo && streakInfo.currentStreak > 0) {
        const activeBonus = getActiveStreakBonus(streakInfo.currentStreak)
        const bonusY = rarityY + 48
        ctx.textAlign = 'center'
        ctx.fillStyle = '#f59e0b'; ctx.font = '11px sans-serif'
        if (activeBonus) {
          ctx.fillText(`🔥 ${streakInfo.currentStreak}-day streak: ${activeBonus.name}`, leftCenterX, bonusY)
          ctx.fillStyle = '#d97706'; ctx.font = '10px sans-serif'
          ctx.fillText(`×${activeBonus.multiplier} bonus`, leftCenterX, bonusY + 14)
        } else {
          const next = STREAK_BONUSES.find((b) => b.days > streakInfo.currentStreak)
          if (next) {
            ctx.fillText(`🔥 ${streakInfo.currentStreak}-day streak`, leftCenterX, bonusY)
            ctx.fillStyle = '#d97706'; ctx.font = '10px sans-serif'
            ctx.fillText(`${next.days - streakInfo.currentStreak} days to ${next.name}`, leftCenterX, bonusY + 14)
          }
        }
        ctx.textAlign = 'start'
      }

      // === RIGHT COLUMN: Animated Snake Skin Preview ===
      const previewCenterX = CANVAS_WIDTH * 0.72
      const previewCenterY = 195
      const previewSegments = 10
      const segSize = 18
      const segGap = 22
      const time = Date.now()

      // Generate S-curve positions with gentle wave animation
      const previewPositions: { x: number; y: number }[] = []
      for (let i = 0; i < previewSegments; i++) {
        const t = i / (previewSegments - 1) // 0 to 1
        const baseX = previewCenterX - (previewSegments / 2 - i) * segGap * 0.6
        // S-curve: sine wave offset, animated gently
        const waveOffset = Math.sin(t * Math.PI * 2 + time / 1200) * 28
        const microWave = Math.sin(t * Math.PI * 3 + time / 800 + i * 0.3) * 4
        previewPositions.push({
          x: baseX + Math.sin(t * Math.PI * 1.2) * 15,
          y: previewCenterY + waveOffset + microWave,
        })
      }

      // Draw glow behind preview snake
      ctx.globalAlpha = 0.06
      ctx.fillStyle = startSkin.glowColor
      for (const seg of previewPositions) {
        ctx.beginPath()
        ctx.arc(seg.x, seg.y, segSize * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Draw preview snake segments (body first, then head on top)
      for (let i = previewSegments - 1; i >= 0; i--) {
        const seg = previewPositions[i]

        if (i === 0) {
          // Head
          ctx.shadowColor = startSkin.glowColor
          ctx.shadowBlur = 10
          ctx.fillStyle = startSkin.headColor
          ctx.beginPath()
          ctx.roundRect(seg.x - segSize / 2 + 1, seg.y - segSize / 2 + 1, segSize - 2, segSize - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // Eyes - facing right-ish (toward next segment direction)
          const nextSeg = previewPositions[1]
          const dx = nextSeg.x - seg.x
          const dy = nextSeg.y - seg.y
          const eyeAngle = Math.atan2(dy, dx)
          const eyeOffset = 4
          const eyePerpOffset = 3.5

          const eye1x = seg.x + Math.cos(eyeAngle) * eyeOffset + Math.cos(eyeAngle + Math.PI / 2) * eyePerpOffset
          const eye1y = seg.y + Math.sin(eyeAngle) * eyeOffset + Math.sin(eyeAngle + Math.PI / 2) * eyePerpOffset
          const eye2x = seg.x + Math.cos(eyeAngle) * eyeOffset + Math.cos(eyeAngle - Math.PI / 2) * eyePerpOffset
          const eye2y = seg.y + Math.sin(eyeAngle) * eyeOffset + Math.sin(eyeAngle - Math.PI / 2) * eyePerpOffset

          ctx.fillStyle = startSkin.eyeColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, 3, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, 3, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = gridTheme.bgColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, 1.8, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, 1.8, 0, Math.PI * 2); ctx.fill()
        } else {
          // Body segment
          const ratio = 1 - i / previewSegments

          // Determine fill color based on pattern (same logic as gameplay snake)
          if (startSkin.pattern === 'rainbow') {
            const hue = (i * 360 / previewSegments + time / 50) % 360
            ctx.fillStyle = `hsl(${hue}, 70%, 55%)`
          } else if (startSkin.pattern === 'gradient') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else if (startSkin.pattern === 'striped') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = (0.6 + ratio * 0.4) * (i % 2 === 0 ? 1 : 0.55)
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else if (startSkin.pattern === 'dotted') {
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          } else {
            // solid pattern
            const c0 = hexToRgb(startSkin.bodyGradient[0])
            const c1 = hexToRgb(startSkin.bodyGradient[1])
            const alpha = 0.6 + ratio * 0.4
            const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
            const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
            const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          }

          // Draw connector between adjacent segments (except dotted)
          if (startSkin.pattern !== 'dotted' && i > 0) {
            const prev = previewPositions[i - 1]
            ctx.fillRect(
              Math.min(prev.x, seg.x) - segSize / 2 + 3,
              Math.min(prev.y, seg.y) - segSize / 2 + 3,
              Math.abs(prev.x - seg.x) + segSize - 6,
              Math.abs(prev.y - seg.y) + segSize - 6
            )
          }

          // Draw segment shape
          if (startSkin.pattern === 'dotted') {
            ctx.beginPath()
            ctx.arc(seg.x, seg.y, segSize / 2 - 3, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.roundRect(seg.x - segSize / 2 + 2, seg.y - segSize / 2 + 2, segSize - 4, segSize - 4, 3)
            ctx.fill()
          }
        }
      }

      // Skin name below the preview snake
      ctx.textAlign = 'center'
      ctx.fillStyle = startSkin.headColor; ctx.font = 'bold 14px sans-serif'
      ctx.fillText(startSkin.name, previewCenterX, previewCenterY + 85)
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText(startSkin.description, previewCenterX, previewCenterY + 100)
      ctx.textAlign = 'start'

      // === BOTTOM: Controls and start prompt ===
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'
      ctx.fillText('Arrow Keys / WASD  •  Space to start  •  Swipe on mobile', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Press Space or click to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 25)
      ctx.textAlign = 'start'
    }

    // Pause overlay
    if (paused && gameStarted && !gameOver) {
      const poBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${poBg.r}, ${poBg.g}, ${poBg.b}, 0.78)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'
      ctx.fillText(`${formatTime(gs.elapsedTime)}  •  ${gs.wordsEaten} words  •  ${gs.score} pts`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15)

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or Esc to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45)
      ctx.textAlign = 'start'
    }
  }, [streakInfo, leaderboardRank])

  const resetGame = useCallback((isDaily: boolean = false, isSpeedRun: boolean = false) => {
    const gs = gameStateRef.current
    const diff = gs.difficulty
    const settings = DIFFICULTY_SETTINGS[diff]
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = settings.speed
    gs.wordsEaten = 0
    gs.gameStarted = true
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    directionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    collectedWordsRef.current = new Set()
    setLeaderboardRank(0)

    // Daily challenge setup
    if (isDaily) {
      const challenge = getDailyChallenge()
      gs.isDailyChallenge = true
      gs.dailyChallengeWords = challenge.words
      gs.dailyWordsCollected = []
      gs.dailyTargetScore = challenge.targetScore
    } else {
      gs.isDailyChallenge = false
      gs.dailyChallengeWords = []
      gs.dailyWordsCollected = []
      gs.dailyTargetScore = 0
    }

    // Streak multiplier
    const streak = getStreak()
    gs.streakMultiplier = getStreakMultiplier(streak.currentStreak)

    // Reset power-ups and combo
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1

    // Clear achievement queue and toast
    achievementQueue.clear()
    gs.lastAchievement = null
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }

    // Reset milestone state and set extra life from Silver milestone
    gs.lastMilestone = null
    if (milestoneToastTimerRef.current) {
      clearTimeout(milestoneToastTimerRef.current)
      milestoneToastTimerRef.current = null
    }
    const milestoneBonuses = getActiveMilestoneBonuses()
    gs.extraLifeAvailable = milestoneBonuses.extraLife > 0

    // Random weather
    const weathers: GameState['weather'][] = ['clear', 'rain', 'snow', 'stars']
    gs.weather = weathers[Math.floor(Math.random() * weathers.length)]
    weatherParticlesRef.current = []

    // Speed run and words-by-category reset
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}

    // If speed run, set timer
    if (isSpeedRun) {
      gs.isSpeedRun = true
      gs.speedRunTimeLeft = getSpeedRunDuration()
    } else {
      gs.isSpeedRun = false
      gs.speedRunTimeLeft = getSpeedRunDuration()
    }

    spawnWord()
    playSound(playStartSound)

    // Track games played & update streak
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }

    // Update streak
    const updatedStreak = updateStreak()
    setStreakInfo(updatedStreak)

    updateUI()
  }, [spawnWord, updateUI, playSound])

  // Timer interval
  useEffect(() => {
    const tick = () => {
      const gs = gameStateRef.current
      if (gs.gameStarted && !gs.gameOver && !gs.paused) {
        gs.elapsedTime = Date.now() - gs.startTime
        // Speed run countdown (decrement every second using elapsed time)
        if (gs.isSpeedRun) {
          const elapsed = Math.floor(gs.elapsedTime / 1000)
          gs.speedRunTimeLeft = Math.max(0, getSpeedRunDuration() - elapsed)
          if (gs.speedRunTimeLeft <= 0) {
            // Time's up — trigger game over
            gs.gameOver = true
            // Save speed run result
            const result: SpeedRunResult = {
              score: gs.score,
              wordsEaten: gs.wordsEaten,
              maxCombo: gs.speedRunMaxCombo,
              powerUpsCollected: gs.speedRunPowerUpsCollected,
              longestSnake: gs.speedRunLongestSnake,
              difficulty: gs.difficulty,
              date: new Date().toISOString(),
              survived: true,
            }
            const best = saveSpeedRunResult(result)
            setSpeedRunBest({ bestScore: best.bestScore, totalRuns: best.totalRuns })
            playSound(playGameOverSound)
            trackGameEnd(gs.score, gs.wordsEaten, gs.difficulty, gs.elapsedTime, false)
            // Record for dynamic difficulty adjustment
            recordGamePerformance(gs.score, gs.wordsEaten, gs.elapsedTime, gs.difficulty)
            // Update dynamic difficulty level display
            setDynDiff(getDifficultyAdjustment())
          }
        }
        updateUI()
      }
    }
    timerIntervalRef.current = setInterval(tick, 200)
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [updateUI, playSound])

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const gs = gameStateRef.current

      if (!gs.gameStarted || gs.gameOver || gs.paused) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Expire active power-ups
      const now = Date.now()
      gs.activePowerUps = gs.activePowerUps.filter(pu => pu.expiresAt === 0 || pu.expiresAt > now)

      // Expire uncollected power-up on the grid after 15 seconds
      if (gs.powerUp && (now - gs.powerUp.spawnTime) > POWERUP_DESPAWN_TIME) {
        gs.powerUp = null
      }

      // Speed modifiers: base_speed → weather_modifier → slow_mo_modifier
      let effectiveSpeed = gs.speed
      const weatherConf = WEATHER_CONFIG[gs.weather]
      if (weatherConf.speedMultiplier > 1) {
        effectiveSpeed = Math.floor(effectiveSpeed * weatherConf.speedMultiplier)
      }
      if (gs.activePowerUps.some(pu => pu.type === 'slow_mo')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 1.6) // 60% slower = speed value 1.6x higher
      }

      if (timestamp - lastRenderRef.current < effectiveSpeed) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      lastRenderRef.current = timestamp

      if (directionQueueRef.current.length > 0) {
        const newDir = directionQueueRef.current.shift()!
        const opposites: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
        }
        if (opposites[newDir] !== gs.direction) {
          gs.direction = newDir
        }
      }

      const { snake, direction, wordFood } = gs
      const head = { ...snake[0] }
      switch (direction) {
        case 'UP': head.y -= 1; break
        case 'DOWN': head.y += 1; break
        case 'LEFT': head.x -= 1; break
        case 'RIGHT': head.x += 1; break
      }

      const handleDeath = () => {
        gs.gameOver = true
        const stored = typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10) : 0
        if (gs.score > stored) {
          localStorage.setItem('word-snake-highscore', String(gs.score))
        }

        // Save to leaderboard
        const rank = addLeaderboardEntry({
          score: gs.score,
          wordsEaten: gs.wordsEaten,
          difficulty: gs.difficulty,
          date: new Date().toISOString(),
          isDailyChallenge: gs.isDailyChallenge,
        })
        setLeaderboardRank(rank)

        // Update high score to difficulty-specific best
        const diffBest = getBestScore(gs.difficulty)
        setHighScore(Math.max(diffBest, gs.score))
        const hx = snake[0].x * CELL_SIZE + CELL_SIZE / 2
        const hy = snake[0].y * CELL_SIZE + CELL_SIZE / 2
        spawnParticles(hx, hy, '#ef4444', 20)
        playSound(playGameOverSound)

        // Save daily challenge result if applicable
        if (gs.isDailyChallenge) {
          const completed = gs.score >= gs.dailyTargetScore
          saveDailyChallengeResult(completed, gs.score)
          setDailyInfo((prev) => ({
            ...prev,
            played: true,
            result: { completed, score: gs.score },
          }))
        }

        // Track game end stats
        trackGameEnd(gs.score, gs.wordsEaten, gs.difficulty, gs.elapsedTime, gs.isDailyChallenge)
        // Record for dynamic difficulty
        recordGamePerformance(gs.score, gs.wordsEaten, gs.elapsedTime, gs.difficulty)
        setDynDiff(getDifficultyAdjustment())

        // Check achievements
        try {
          const wordList = Object.entries(useWordStore.getState().collectedWords)
          const categories = [...new Set(wordList.map(([w]) => { const e = getWordEntry(w); return e?.category }).filter(Boolean))] as string[]
          const stats: AchievementStats = {
            totalWordsCollected: wordList.reduce((s, [, c]) => s + c, 0),
            totalWordsEaten: gs.wordsEaten,
            poemsCreated: 0,
            highScore: Math.max(gs.score, stored),
            categories,
            gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
          }
          const newlyUnlocked = checkAchievements(stats)
          if (newlyUnlocked.length > 0) {
            const notifications = newlyUnlocked.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
            enqueueAchievements(notifications)
          }
          // Also check milestones on game over
          const newlyUnlockedMilestones = checkMilestones()
          if (newlyUnlockedMilestones.length > 0) {
            for (const ms of newlyUnlockedMilestones) {
              gs.lastMilestone = { name: ms.name, emoji: ms.emoji, description: ms.description }
              if (milestoneToastTimerRef.current) clearTimeout(milestoneToastTimerRef.current)
              milestoneToastTimerRef.current = setTimeout(() => {
                gameStateRef.current.lastMilestone = null
                updateUI()
              }, 5000)
            }
            updateUI()
          }
        } catch { /* ignore */ }
      }

      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        if (hasShield) {
          gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
          // Wrap to opposite side
          if (head.x < 0) head.x = GRID_WIDTH - 1
          else if (head.x >= GRID_WIDTH) head.x = 0
          else if (head.y < 0) head.y = GRID_HEIGHT - 1
          else if (head.y >= GRID_HEIGHT) head.y = 0
          spawnFloatingText('🛡️', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
        } else {
          handleDeath()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }
      }

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        if (hasShield) {
          gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
          spawnFloatingText('🛡️', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 10, '#60a5fa')
          // Let it pass through — the head overlaps one body segment for one frame
        } else if (gs.extraLifeAvailable) {
          // Silver milestone: extra life — remove 3 tail segments instead of dying
          gs.extraLifeAvailable = false
          const removeCount = Math.min(3, snake.length - 1)
          if (removeCount > 0) {
            snake.splice(snake.length - removeCount, removeCount)
          }
          spawnFloatingText('EXTRA LIFE!', head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE - 30, '#fbbf24')
          spawnParticles(head.x * CELL_SIZE + CELL_SIZE / 2, head.y * CELL_SIZE + CELL_SIZE / 2, '#fbbf24', 20)
          // Let it pass through — the head overlaps one body segment for one frame
        } else {
          handleDeath()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }
      }

      const newSnake = [head, ...snake]

      if (wordFood) {
        const fx = wordFood.position.x
        const fy = wordFood.position.y
        const ate = (
          (head.x === fx && head.y === fy) ||
          (head.x === fx + 1 && head.y === fy) ||
          (head.x === fx - 1 && head.y === fy) ||
          (head.x === fx && head.y === fy + 1) ||
          (head.x === fx && head.y === fy - 1)
        )

        if (ate) {
          const diff = gs.difficulty
          const settings = DIFFICULTY_SETTINGS[diff]
          const entry = getWordEntryIncludingCustom(wordFood.word)
          let points = entry ? entry.points : wordFood.word.length * 10

          // Bronze milestone bonus: +5 points per word before multipliers
          const mBonuses = getActiveMilestoneBonuses()
          points += mBonuses.pointsPerWord

          // Double Points power-up
          if (gs.activePowerUps.some(pu => pu.type === 'double_points')) {
            points *= 2
          }

          // Rarity multiplier
          const rarityConfig = RARITY_CONFIG[wordFood.rarity]
          if (rarityConfig && rarityConfig.pointMultiplier > 1) {
            const rarityBonus = Math.floor(points * (rarityConfig.pointMultiplier - 1))
            points += rarityBonus
          }

          // Weather point multiplier (e.g. Stars gives +20%)
          const weatherPtConf = WEATHER_CONFIG[gs.weather]
          if (weatherPtConf.pointMultiplier > 1) {
            points = Math.floor(points * weatherPtConf.pointMultiplier)
          }

          // Combo chain logic
          if (wordFood.category === gs.lastEatenCategory) {
            gs.comboCount += 1
            gs.comboMultiplier = 1 + 0.5 * (gs.comboCount - 1)
          } else {
            gs.comboCount = 1
            gs.comboMultiplier = 1
            gs.lastEatenCategory = wordFood.category
          }
          // Apply combo multiplier to points
          const comboPoints = Math.floor(points * gs.comboMultiplier)

          const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'

          addWord(wordFood.word)
          collectedWordsRef.current.add(wordFood.word)
          gs.score += comboPoints
          gs.speed = Math.max(settings.minSpeed, gs.speed - settings.speedInc)
          gs.wordsEaten += 1
          gs.wordFood = null

          // Track words by category
          if (!gs.wordsByCategory[wordFood.category]) gs.wordsByCategory[wordFood.category] = 0
          gs.wordsByCategory[wordFood.category] += 1

          // Track speed run stats
          if (gs.isSpeedRun) {
            gs.speedRunMaxCombo = Math.max(gs.speedRunMaxCombo, gs.comboMultiplier)
            gs.speedRunLongestSnake = Math.max(gs.speedRunLongestSnake, gs.snake.length)
          }

          // Track word eaten for stats
          trackWordEaten(wordFood.category, wordFood.rarity)
          trackCombo(gs.comboCount)

          // Track daily challenge words
          if (gs.isDailyChallenge && !gs.dailyWordsCollected.includes(wordFood.word)) {
            gs.dailyWordsCollected.push(wordFood.word)
          }

          // Trigger word entrance animation
          setNewWordKey((k) => k + 1)

          const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
          const wy = wordFood.position.y * CELL_SIZE
          spawnFloatingText(`+${comboPoints}${gs.weather === 'stars' ? ' ⭐' : ''}`, wx, wy, '#4ade80')
          if (rarityConfig && rarityConfig.pointMultiplier > 1) {
            spawnFloatingText(`${rarityConfig.emoji} ${rarityConfig.label}!`, wx, wy - 66, rarityConfig.color)
          }
          spawnFloatingText(wordFood.word, wx, wy - 22, catColor)
          if (gs.comboCount > 1) {
            spawnFloatingText(`🔥 ×${gs.comboMultiplier.toFixed(1)}`, wx, wy - 44, '#f59e0b')
          }
          spawnParticles(wx, wy + CELL_SIZE / 2, catColor, 12)
          spawnParticles(wx, wy + CELL_SIZE / 2, '#4ade80', 8)
          playSound(playEatSound)

          // Check achievements after eating a word
          try {
            const wl = Object.entries(useWordStore.getState().collectedWords)
            const cats = [...new Set(wl.map(([w]) => { const e = getWordEntry(w); return e?.category }).filter(Boolean))] as string[]
            const stats: AchievementStats = {
              totalWordsCollected: wl.reduce((s, [, c]) => s + c, 0),
              totalWordsEaten: gs.wordsEaten,
              poemsCreated: 0,
              highScore: Math.max(gs.score, parseInt(localStorage.getItem('word-snake-highscore') ?? '0', 10)),
              categories: cats,
              gamesPlayed: parseInt(localStorage.getItem('word-snake-games') ?? '0', 10),
            }
            const newlyUnlocked = checkAchievements(stats)
            if (newlyUnlocked.length > 0) {
              const notifications = newlyUnlocked.map(a => ({ title: a.title, description: a.description, emoji: a.emoji }))
              enqueueAchievements(notifications)
              spawnFloatingText(`🏆 ${newlyUnlocked[0].title}`, wx, wy - 44, '#fbbf24')
            }
          } catch { /* ignore */ }

          // Check streak milestones
          const currentStreak = streakInfo?.currentStreak ?? 0
          for (const bonus of STREAK_BONUSES) {
            if (currentStreak === bonus.days) {
              spawnFloatingText(`🔥 ${bonus.name}!`, wx, wy - 66, '#f59e0b')
              break
            }
          }

          // Check achievement milestones
          try {
            const newlyUnlockedMilestones = checkMilestones()
            if (newlyUnlockedMilestones.length > 0) {
              for (const ms of newlyUnlockedMilestones) {
                spawnFloatingText(`${ms.emoji} ${ms.name}!`, wx, wy - 88, ms.color)
                // Show milestone toast
                gs.lastMilestone = { name: ms.name, emoji: ms.emoji, description: ms.description }
                if (milestoneToastTimerRef.current) clearTimeout(milestoneToastTimerRef.current)
                milestoneToastTimerRef.current = setTimeout(() => {
                  gameStateRef.current.lastMilestone = null
                  updateUI()
                }, 5000)
                // Apply Silver milestone extra life if just unlocked
                if (ms.bonusType === 'extra_life') {
                  gs.extraLifeAvailable = true
                }
              }
              updateUI()
            }
          } catch { /* ignore */ }

          spawnWord()

          // Chance to spawn power-up — Gold milestone doubles spawn rate
          const effectiveSpawnChance = POWERUP_SPAWN_CHANCE * mBonuses.spawnRateMultiplier
          if (Math.random() < effectiveSpawnChance && !gs.powerUp) {
            const puType = getRandomPowerUpType()
            // Find empty position (not on snake, not on word food)
            const occupied = new Set([
              ...gs.snake.map(s => `${s.x},${s.y}`),
              gs.wordFood ? `${gs.wordFood.position.x},${gs.wordFood.position.y}` : '',
            ])
            let puPos: Position
            let attempts = 0
            do {
              puPos = {
                x: Math.floor(Math.random() * (GRID_WIDTH - 6)) + 3,
                y: Math.floor(Math.random() * (GRID_HEIGHT - 6)) + 3,
              }
              attempts++
            } while (occupied.has(`${puPos.x},${puPos.y}`) && attempts < 50)
            gs.powerUp = { type: puType, position: puPos, spawnTime: Date.now() }
          }
        } else {
          newSnake.pop()
        }
      } else {
        newSnake.pop()
      }

      gs.snake = newSnake

      // Power-up collection check
      if (gs.powerUp) {
        const pu = gs.powerUp
        const puAte = (
          head.x === pu.position.x && head.y === pu.position.y
        )
        if (puAte) {
          const config = POWERUP_CONFIG[pu.type]
          // Apply instant effects
          if (pu.type === 'shrink') {
            const removeCount = Math.min(3, gs.snake.length - 1)
            gs.snake = gs.snake.slice(0, gs.snake.length - removeCount)
          } else {
            // Add timed effect
            gs.activePowerUps.push({
              type: pu.type,
              expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0,
            })
          }
          // Effects
          const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
          const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
          spawnFloatingText(config.emoji, px, py - 10, config.color)
          spawnFloatingText(config.label, px, py - 30, config.color)
          spawnParticles(px, py, config.color, 15)
          playSound(playPowerUpSound)
          gs.powerUp = null
          trackPowerUpCollected()
          if (gs.isSpeedRun) gs.speedRunPowerUpsCollected += 1
        }
      }

      // Magnet: move word food closer to snake head
      if (gs.activePowerUps.some(pu => pu.type === 'magnet') && gs.wordFood) {
        const headPos = gs.snake[0]
        const foodPos = gs.wordFood.position
        const dx = headPos.x - foodPos.x
        const dy = headPos.y - foodPos.y
        if (Math.abs(dx) > 0) foodPos.x += Math.sign(dx)
        if (Math.abs(dy) > 0) foodPos.y += Math.sign(dy)
      }

      updateUI()
      draw()
      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw, addWord, spawnWord, updateUI, spawnFloatingText, spawnParticles, playSound, streakInfo])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current
      if (e.key === ' ') {
        e.preventDefault()
        if (gs.gameOver) { resetGame(gs.isDailyChallenge) }
        else if (!gs.gameStarted) { resetGame() }
        else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }
        return
      }
      if (e.key === 'Escape') { gs.paused = !gs.paused; playSound(playPauseSound); updateUI(); return }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        if (gs.gameOver) resetGame(gs.isDailyChallenge)
        else if (!gs.gameStarted) resetGame()
        return
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        gs.soundEnabled = !gs.soundEnabled
        updateUI()
        return
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        if (!gs.gameStarted) resetGame()
        return
      }
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        if (!gs.gameStarted) { resetGame(true) }
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        gs.showMiniMap = !gs.showMiniMap
        try { localStorage.setItem('word-snake-minimap', String(gs.showMiniMap)) } catch { /* ignore */ }
        updateUI()
        return
      }
      if (e.key === '?' || e.key === '/') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
        return
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        const themes = getAllGridThemes()
        const currentIdx = themes.findIndex(t => t.id === gs.gridTheme)
        const nextIdx = (currentIdx + 1) % themes.length
        const nextTheme = themes[nextIdx]
        gs.gridTheme = nextTheme.id
        saveGridTheme(nextTheme.id)
        setActiveGridTheme(nextTheme.id)
        setThemeSwitchRipple(true)
        setTimeout(() => setThemeSwitchRipple(false), 500)
        updateUI()
        return
      }
      if (e.key === '1') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('easy'); return }
      if (e.key === '2') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('medium'); return }
      if (e.key === '3') { e.preventDefault(); if (!gs.gameStarted || gs.gameOver) changeDifficulty('hard'); return }
      if (!gs.gameStarted || gs.gameOver || gs.paused) return

      const keyToDir: Record<string, Direction> = {
        ArrowUp: 'UP', w: 'UP', W: 'UP',
        ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
        ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
        ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
      }
      const newDir = keyToDir[e.key]
      if (newDir) {
        e.preventDefault()
        directionQueueRef.current.push(newDir)
        if (directionQueueRef.current.length > 2) {
          directionQueueRef.current = directionQueueRef.current.slice(-2)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGame, updateUI, playSound])

  // Touch controls - also prevent page scroll
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y
      const minSwipe = 20
      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
        const gs = gameStateRef.current
        if (!gs.gameStarted || gs.gameOver) { resetGame(gs.isDailyChallenge) }
        else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }
        touchStartRef.current = null
        return
      }
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver || gs.paused) return
      const newDir: Direction = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? 'RIGHT' : 'LEFT')
        : (dy > 0 ? 'DOWN' : 'UP')
      directionQueueRef.current.push(newDir)
      if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2)
      touchStartRef.current = null
    }
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [resetGame, updateUI, playSound])

  // Prevent page scroll when touching D-pad
  useEffect(() => {
    const dpadContainer = document.getElementById('mobile-dpad')
    if (!dpadContainer) return
    const prevent = (e: TouchEvent) => e.preventDefault()
    dpadContainer.addEventListener('touchmove', prevent, { passive: false })
    return () => dpadContainer.removeEventListener('touchmove', prevent)
  }, [])

  // Canvas click to start
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleClick = () => {
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver) resetGame(gs.isDailyChallenge)
    }
    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [resetGame])

  // Clean up achievement queue on unmount
  useEffect(() => {
    return () => {
      achievementQueue.clear()
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const wordList = getWordList()
  const totalCount = getTotalCount()

  const changeDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    gs.difficulty = diff
    // Update best score for the new difficulty
    const diffBest = getBestScore(diff)
    setHighScore(diffBest)
    playSound(playClickSound)
    updateUI()
  }

  const toggleSound = () => {
    const gs = gameStateRef.current
    gs.soundEnabled = !gs.soundEnabled
    updateUI()
  }

  const toggleMiniMap = () => {
    const gs = gameStateRef.current
    gs.showMiniMap = !gs.showMiniMap
    try {
      localStorage.setItem('word-snake-minimap', String(gs.showMiniMap))
    } catch { /* ignore */ }
    updateUI()
  }

  const toggleCategory = (cat: WordCategory) => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    const current = gs.activeCategories
    if (current.size <= 1 && current.has(cat)) return
    if (current.has(cat)) {
      current.delete(cat)
    } else {
      current.add(cat)
    }
    saveActiveCategories(current)
    playSound(playClickSound)
    updateUI()
  }

  const toggleAllCategories = () => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    const current = gs.activeCategories
    if (current.size === ALL_CATEGORIES.length) {
      gs.activeCategories = new Set([ALL_CATEGORIES[0]])
    } else {
      gs.activeCategories = new Set(ALL_CATEGORIES)
    }
    saveActiveCategories(gs.activeCategories)
    playSound(playClickSound)
    updateUI()
  }

  const handleDailyChallenge = () => {
    playSound(playClickSound)
    resetGame(true)
  }

  // Streak display data
  const streakDisplay = streakInfo && streakInfo.currentStreak > 0
    ? getActiveStreakBonus(streakInfo.currentStreak)
    : null

  // Score progress to next difficulty threshold
  const scoreProgress = (() => {
    const thresholds = [
      { score: DIFFICULTY_THRESHOLDS.hard, label: 'Hard' },
      { score: DIFFICULTY_THRESHOLDS.medium, label: 'Medium' },
      { score: DIFFICULTY_THRESHOLDS.easy, label: 'Easy' },
    ]
    const next = thresholds.find((t) => uiState.score < t.score)
    if (!next) return { percent: 100, label: 'Max' }
    const prev = thresholds.find((t) => t.score < next.score)
    const base = prev ? prev.score : 0
    const range = next.score - base
    const current = uiState.score - base
    return { percent: Math.min(100, Math.round((current / range) * 100)), label: next.label }
  })()

  return (
    <div className={`flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto transition-all duration-700 ${nightMode.enabled ? 'night-mode-active' : ''}`}
      style={nightMode.enabled ? { filter: getNightModeFilter(nightMode) } : undefined}
    >
      {/* Game Area */}
      <div className="flex-1 min-w-0">
        {/* Aurora background behind card */}
        <div className="relative">
          <div className="absolute -inset-2 aurora-bg rounded-xl pointer-events-none" />
          <Card className="overflow-hidden border-slate-700 bg-slate-900 relative card-shimmer-border card-hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <span className="text-2xl">🐍</span> Word Snake
                  {uiState.isDailyChallenge && uiState.gameStarted && (
                    <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-xs ml-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Daily
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Streak indicator */}
                  {streakInfo && streakInfo.currentStreak > 0 && (
                    <div className={`flex items-center gap-1 text-sm float-badge ${streakDisplay ? 'text-amber-400' : 'text-slate-500'} streak-fire`}>
                      <Flame className="h-4 w-4" />
                      <span className="font-bold">{streakInfo.currentStreak}</span>
                    </div>
                  )}
                  {uiState.gameStarted && !uiState.gameOver && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{formatTime(uiState.elapsedTime)}</span>
                    </div>
                  )}
                  {/* Speed Run Timer */}
                  {uiState.gameStarted && !uiState.gameOver && uiState.isSpeedRun && (
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${uiState.speedRunTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-rose-400'}`}>
                      <Gauge className="h-3 w-3" />
                      <span className="font-mono">{uiState.speedRunTimeLeft}s</span>
                    </div>
                  )}
                  {/* Weather badge pill */}
                  {uiState.gameStarted && !uiState.gameOver && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${WEATHER_CONFIG[uiState.weather].badgeBg} text-slate-300 border border-slate-600/30 ${uiState.weather === 'rain' ? 'weather-badge-rain' : uiState.weather === 'snow' ? 'weather-badge-snow' : uiState.weather === 'stars' ? 'weather-badge-stars' : ''}`}>
                      <span>{WEATHER_CONFIG[uiState.weather].emoji}</span>
                      <span>{WEATHER_CONFIG[uiState.weather].label}</span>
                      {WEATHER_CONFIG[uiState.weather].effect && (
                        <span className="text-slate-400">: {WEATHER_CONFIG[uiState.weather].effect}</span>
                      )}
                    </span>
                  )}
                  {highScore > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Trophy className="h-4 w-4" />
                      <span>Best ({DIFFICULTY_SETTINGS[uiState.difficulty].label}): {highScore}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Badge key={uiState.score} variant="secondary" className="bg-green-900/50 text-green-400 border-green-700 stat-counter-flash">
                      <Zap className="h-3 w-3 mr-1" />
                      {uiState.score}
                    </Badge>
                    {/* Mini progress bar under score badge */}
                    {uiState.gameStarted && !uiState.gameOver && (
                      <div className="absolute -bottom-1.5 left-1 right-1 h-0.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${scoreProgress.percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 header-btn-press"
                    onClick={() => setShowShortcuts(true)}
                    title="Keyboard shortcuts"
                  >
                    <span className="text-sm font-bold">?</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 header-btn-press"
                    onClick={toggleSound}
                    title={uiState.soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
                  >
                    {uiState.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 header-btn-press ${uiState.showMiniMap ? 'text-slate-200' : 'text-slate-500'}`}
                    onClick={toggleMiniMap}
                    title={uiState.showMiniMap ? 'Hide mini-map' : 'Show mini-map'}
                  >
                    <span className="text-sm">🗺️</span>
                  </Button>
                  {/* Night Mode toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 header-btn-press ${nightMode.enabled ? 'text-amber-300' : 'text-slate-500'}`}
                    onClick={() => {
                      const updated = { ...nightMode, enabled: !nightMode.enabled }
                      setNightMode(updated)
                      saveNightModeConfig(updated)
                    }}
                    title={nightMode.enabled ? 'Disable Night Mode' : 'Enable Night Mode'}
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {/* Dynamic Difficulty indicator */}
              {mounted && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] text-slate-500">AI Difficulty:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                    dynDiff.level >= 8 ? 'bg-red-900/40 text-red-400 border border-red-700/40' :
                    dynDiff.level >= 6 ? 'bg-orange-900/40 text-orange-400 border border-orange-700/40' :
                    dynDiff.level >= 4 ? 'bg-amber-900/30 text-amber-300 border border-amber-700/30' :
                    dynDiff.level <= 2 ? 'bg-green-900/40 text-green-400 border border-green-700/40' :
                    'bg-slate-800/40 text-slate-300 border border-slate-700/30'
                  }`}>
                    {dynDiff.emoji} {dynDiff.description}
                  </span>
                  <span className="text-[9px] text-slate-600">Lv.{dynDiff.level}</span>
                </div>
              )}
              {/* Difficulty selector with colored dots */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Timer className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">Difficulty:</span>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => changeDifficulty(diff)}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all duration-200 active:scale-95 ${
                        uiState.difficulty === diff
                          ? diff === 'easy'
                            ? 'bg-green-900/60 text-green-400 border border-green-700/50'
                            : diff === 'medium'
                            ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50'
                            : 'bg-red-900/60 text-red-400 border border-red-700/50'
                          : 'bg-slate-800/60 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_SETTINGS[diff].dotColor} ${uiState.difficulty === diff ? 'opacity-100' : 'opacity-40'}`} />
                      {DIFFICULTY_SETTINGS[diff].label}
                    </button>
                  ))}

                  {/* Daily challenge status */}
                  {dailyInfo.played && dailyInfo.result && (
                    <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                      ✅ Today&apos;s challenge: {dailyInfo.result.score} pts
                    </span>
                  )}
                </div>
              )}

              {/* Category Filter - wraps on small screens */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    <span className="text-xs text-slate-500 font-medium">Categories:</span>
                    <button
                      onClick={toggleAllCategories}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-200 active:scale-95 ${
                        uiState.activeCategories.size === ALL_CATEGORIES.length
                          ? 'bg-slate-600/60 text-slate-200 border border-slate-500/50'
                          : 'bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATEGORIES.map((cat) => {
                      const info = getCategoryInfo(cat)
                      const color = CATEGORY_COLORS[cat]
                      const active = uiState.activeCategories.has(cat)
                      const count = getWordCountByCategory(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`category-bounce flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border active:scale-95 ${
                            active
                              ? `border-current`
                              : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                          }`}
                          style={active ? {
                            backgroundColor: `${color}15`,
                            borderColor: `${color}50`,
                            color: color,
                          } : undefined}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${active ? 'scale-100' : 'scale-75 opacity-50'}`}
                            style={{ backgroundColor: color }}
                          />
                          {info.label}
                          <span className="text-[9px] opacity-60">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Trail Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">✨ Trail</span>
                    <span className="text-[10px] text-slate-600">— {getAllTrails().find(t => t.id === activeTrail)?.description ?? 'No trail'}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllTrails().map((tr) => (
                      <button
                        key={tr.id}
                        onClick={() => {
                          setActiveTrail(tr.id)
                          saveTrail(tr.id)
                          trailParticlesRef.current = []
                          playSound(playClickSound)
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 active:scale-95 ${
                          activeTrail === tr.id
                            ? 'border-white scale-110 shadow-lg trail-option-glow'
                            : 'border-slate-700/50 hover:border-slate-500/60'
                        }`}
                        style={
                          activeTrail === tr.id
                            ? { '--trail-glow-color': tr.glowColor } as React.CSSProperties
                            : undefined
                        }
                        title={`${tr.name}: ${tr.description}`}
                      >
                        {tr.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🎨 Skins</span>
                    <span className="text-[10px] text-slate-600">— {getSnakeSkin(activeSkin).name}: {getSnakeSkin(activeSkin).description}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllSkins().map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSkin(s.id)
                          gameStateRef.current.activeSkin = s.id
                          saveSnakeSkin(s.id)
                          setSkinBounce(true)
                          setTimeout(() => setSkinBounce(false), 400)
                          updateUI()
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 active:scale-95 ${
                          activeSkin === s.id
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700/50 hover:border-slate-500/60'
                        } ${skinBounce && activeSkin === s.id ? 'skin-select-bounce' : ''}`}
                        style={{
                          backgroundColor: s.headColor + '30',
                          boxShadow: activeSkin === s.id ? `0 0 12px ${s.glowColor}40` : undefined,
                        }}
                        title={`${s.name}: ${s.description}`}
                      >
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid Theme Selector with Preview Canvases */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🖥️ Theme</span>
                    <span className="text-[10px] text-slate-600">— {getGridTheme(activeGridTheme).name}: {getGridTheme(activeGridTheme).description}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllGridThemes().map((t) => (
                      <div key={t.id} className="shrink-0">
                        <button
                          onClick={() => {
                            setActiveGridTheme(t.id)
                            gameStateRef.current.gridTheme = t.id
                            saveGridTheme(t.id)
                            setThemeSwitchRipple(true)
                            setTimeout(() => setThemeSwitchRipple(false), 500)
                            updateUI()
                          }}
                          className={`w-[72px] rounded-lg flex flex-col items-center p-1.5 gap-1 transition-all duration-200 border-2 active:scale-95 ${
                            activeGridTheme === t.id
                              ? 'border-white scale-105 shadow-lg grid-theme-badge-glow'
                              : 'border-slate-700/50 hover:border-slate-500/60'
                          } ${themeSwitchRipple && activeGridTheme === t.id ? 'theme-switch-ripple' : ''}`}
                          style={{
                            backgroundColor: t.bgColor + 'cc',
                          }}
                          title={`${t.name}: ${t.description}`}
                        >
                          <span className="text-lg">{t.emoji}</span>
                          <canvas
                            ref={(el) => {
                              if (el) drawThemePreview(el, t)
                            }}
                            width={56}
                            height={28}
                            className="rounded theme-preview-shine"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sound Theme Selector */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">🔊 Sound</span>
                    <span className="text-[10px] text-slate-600">— {getAllSoundThemes().find(s => s.id === activeSoundTheme)?.description ?? 'Default'}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {getAllSoundThemes().map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setActiveSoundTheme(st.id)
                          setSoundTheme(st.id)
                          saveSoundTheme(st.id)
                          playThemePreviewSound(st.id)
                          setSoundWavePulse(true)
                          setTimeout(() => setSoundWavePulse(false), 600)
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 active:scale-95 ${
                          activeSoundTheme === st.id
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700/50 hover:border-slate-500/60'
                        } ${soundWavePulse && activeSoundTheme === st.id ? 'sound-wave-pulse' : ''}`}
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        }}
                        title={`${st.name}: ${st.description}`}
                      >
                        {st.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Canvas with dramatic border and inner glow */}
              <div className={`relative rounded-lg overflow-hidden ring-1 ring-slate-600/50 ring-offset-1 ring-offset-slate-900 shadow-lg shadow-slate-950/50 canvas-glow-ring ${uiState.gameOver ? 'game-over-shake' : ''} ${(!uiState.gameStarted || uiState.gameOver) ? 'preview-snake-glow' : ''}`}>
                <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-green-500/10 pointer-events-none" />
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full h-auto" />
              </div>

              {/* Start / Daily buttons - side by side on larger screens */}
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {!uiState.gameStarted && (
                  <>
                    <Button onClick={() => resetGame()} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 active:scale-95 transition-transform">
                      <Play className="h-4 w-4 mr-1" /> Start Game
                    </Button>
                    <Button
                      onClick={handleDailyChallenge}
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/30 active:scale-95 transition-transform"
                      title={mounted && dailyInfo.challenge ? `${dailyInfo.challenge.category} — ${dailyInfo.challenge.targetScore} pts target` : 'Daily Challenge'}
                    >
                      <Calendar className="h-4 w-4 mr-1" /> Daily Challenge
                    </Button>
                    <Button
                      onClick={() => setShowAchievementGallery(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                    >
                      🏆 Achievements
                    </Button>
                    <Button
                      onClick={() => setShowGameStats(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      📊 Stats
                    </Button>
                    <Button
                      onClick={() => setShowCustomWords(true)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform"
                    >
                      ✏️ Words{getCustomWordCount() > 0 && <span className="ml-1 text-[10px] opacity-70">({getCustomWordCount()})</span>}
                    </Button>
                    <Button
                      onClick={() => resetGame(false, true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-transform"
                      title="60-second timed challenge"
                    >
                      <Gauge className="h-4 w-4 mr-1" /> Speed Run
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                  </>
                )}
                {uiState.gameStarted && !uiState.gameOver && (
                  <Button onClick={() => { const gs = gameStateRef.current; gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 active:scale-95 transition-transform">
                    {uiState.paused ? <><Play className="h-4 w-4 mr-1" /> Resume</> : <><Pause className="h-4 w-4 mr-1" /> Pause</>}
                  </Button>
                )}
                {uiState.gameOver && (
                  <>
                    <Button onClick={() => resetGame(uiState.isDailyChallenge)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 active:scale-95 transition-transform">
                      <RotateCcw className="h-4 w-4 mr-1" /> Play Again
                    </Button>
                    <Button
                      onClick={() => setShowAchievementGallery(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                    >
                      🏆 Achievements
                    </Button>
                    <Button
                      onClick={() => setShowGameStats(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      📊 Stats
                    </Button>
                    <Button
                      onClick={() => setShowCustomWords(true)}
                      variant="outline"
                      className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 active:scale-95 transition-transform"
                    >
                      ✏️ Words{getCustomWordCount() > 0 && <span className="ml-1 text-[10px] opacity-70">({getCustomWordCount()})</span>}
                    </Button>
                    <Button
                      onClick={() => {
                        const shareData: ShareCardData = {
                          score: uiState.score,
                          wordsEaten: uiState.wordsEaten,
                          timeElapsed: uiState.elapsedTime,
                          difficulty: uiState.difficulty,
                          maxCombo: dynDiff.level >= 6 ? uiState.comboMultiplier : 1,
                          longestSnake: uiState.isSpeedRun ? dynDiff.level : 0,
                          powerUpsCollected: 0,
                          weather: uiState.weather,
                          isDailyChallenge: uiState.isDailyChallenge,
                          dailyCompleted: false,
                          isSpeedRun: uiState.isSpeedRun,
                          speedRunTimeLeft: uiState.speedRunTimeLeft,
                          wordsByCategory: uiState.wordsByCategory,
                          date: new Date().toISOString(),
                        }
                        downloadShareCard(shareData)
                      }}
                      variant="outline"
                      className="border-purple-600/50 text-purple-400 hover:bg-purple-900/20 active:scale-95 transition-transform"
                      title="Download share card image"
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Share Card
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
                  / WASD
                </span>
                <span>Space - Start/Pause</span>
                <span className="hidden sm:inline">Swipe on mobile</span>
              </div>

              {/* On-screen D-pad for mobile - glass-morphism style */}
              <div id="mobile-dpad" className="flex justify-center mt-3 lg:hidden">
                <div className="grid grid-cols-3 gap-1.5 w-36">
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('UP'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >↑</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('LEFT'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >←</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); const gs = gameStateRef.current; if (!gs.gameStarted || gs.gameOver) { resetGame(gs.isDailyChallenge) } else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() } }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-400 text-[10px] select-none transition-transform"
                  >⏸</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('RIGHT'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >→</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('DOWN'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >↓</button>
                  <div />
                </div>
              </div>

              {/* Mobile sidebar toggle */}
              <div className="flex justify-center mt-2 lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-400 hover:text-slate-200 text-xs gap-1 active:scale-95 transition-transform"
                >
                  {sidebarOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {sidebarOpen ? 'Hide Words' : `Show Words (${totalCount})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Word Collection Sidebar - collapsible on mobile */}
      <div className={`w-full lg:w-72 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <Card className="border-slate-700 bg-slate-900 h-full ring-1 ring-slate-700/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-base flex items-center gap-2">
                📚 Collected Words
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs">
                {totalCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Stats row with gradient backgrounds */}
            {uiState.gameStarted && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-green-900/30 to-green-950/20 border border-green-800/30 text-center shadow-inner shadow-green-950/20">
                  <div className="text-green-400 text-xs font-bold">{uiState.wordsEaten}</div>
                  <div className="text-green-600 text-[9px] uppercase tracking-wider">Words</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-800/30 text-center shadow-inner shadow-purple-950/20">
                  <div className="text-purple-400 text-xs font-bold">{uiState.score}</div>
                  <div className="text-purple-600 text-[9px] uppercase tracking-wider">Score</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-800/30 text-center shadow-inner shadow-cyan-950/20">
                  <div className="text-cyan-400 text-xs font-bold">{formatTime(uiState.elapsedTime)}</div>
                  <div className="text-cyan-600 text-[9px] uppercase tracking-wider">Time</div>
                </div>
              </div>
            )}

            {/* Streak bonus indicator */}
            {streakInfo && streakInfo.currentStreak > 0 && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-amber-900/20 to-orange-900/10 border border-amber-800/30 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400 shrink-0 streak-fire" />
                <div className="text-xs">
                  <span className="text-amber-300 font-bold streak-fire">{streakInfo.currentStreak}-day streak</span>
                  {streakDisplay && (
                    <span className="text-amber-400/80"> — {streakDisplay.name} (×{streakDisplay.multiplier})</span>
                  )}
                </div>
              </div>
            )}

            {/* Extra life indicator (Silver milestone) */}
            {uiState.extraLifeAvailable && uiState.gameStarted && (
              <div className="mb-3 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-600/30 flex items-center gap-2">
                <span className="extra-life-shield inline-block text-base">🛡️</span>
                <div className="text-xs">
                  <span className="text-slate-300 font-bold">Extra Life</span>
                  <span className="text-slate-500 ml-1">— Silver milestone</span>
                </div>
              </div>
            )}

            {/* Combo indicator */}
            {uiState.comboCount > 1 && uiState.gameStarted && (
              <div className="mb-2 px-2 py-1.5 rounded-md bg-gradient-to-r from-orange-900/20 to-amber-900/10 border border-amber-700/30 flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <div className="text-xs">
                  <span className="text-amber-300 font-bold">×{uiState.comboMultiplier.toFixed(1)} Combo</span>
                  {uiState.lastEatenCategory && (
                    <span className="text-amber-400/60 ml-1">({uiState.comboCount}× {getCategoryInfo(uiState.lastEatenCategory).label})</span>
                  )}
                </div>
              </div>
            )}

            {/* Active power-ups indicator */}
            {uiState.activePowerUps.length > 0 && uiState.gameStarted && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {uiState.activePowerUps.map((apu, i) => {
                  const config = POWERUP_CONFIG[apu.type]
                  const remaining = apu.expiresAt > 0 ? Math.max(0, Math.ceil((apu.expiresAt - Date.now()) / 1000)) : 0
                  return (
                    <div key={`${apu.type}-${i}`} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border"
                      style={{ borderColor: `${config.color}40`, backgroundColor: `${config.color}15`, color: config.color }}>
                      <span>{config.emoji}</span>
                      <span className="font-medium">{config.label}</span>
                      {remaining > 0 && <span className="opacity-70">{remaining}s</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Daily challenge words */}
            {uiState.isDailyChallenge && uiState.gameStarted && (
              <div className="mb-3 px-2.5 py-2 rounded-md bg-amber-900/15 border border-amber-700/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold">Daily Challenge Words</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {uiState.dailyChallengeWords.map((w) => {
                    const collected = uiState.dailyWordsCollected.includes(w)
                    const entry = getWordEntry(w)
                    const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                    return (
                      <span
                        key={w}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-all ${
                          collected
                            ? 'bg-amber-900/30 text-amber-300 border-amber-600/30'
                            : 'bg-slate-800/50 text-slate-500 border-slate-700/30'
                        }`}
                      >
                        {collected && '✓ '}{w}
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full ml-1"
                          style={{ backgroundColor: catColor }}
                        />
                      </span>
                    )
                  })}
                </div>
                <div className="text-[10px] text-amber-500/60 mt-1.5">
                  Target: {uiState.dailyTargetScore} pts
                </div>
              </div>
            )}

            {wordList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2 gentle-float">🎯</p>
                <p className="text-sm">No words collected yet</p>
                <p className="text-xs mt-1">Play the game to collect words!</p>
              </div>
            ) : (
              <TooltipProvider delayDuration={250}>
                <ScrollArea className="h-[340px] lg:h-[400px]">
                  <div className="space-y-1 pr-2 custom-scrollbar">
                    {wordList.map(({ word, count }, idx) => {
                      const entry = getWordEntry(word)
                      const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                      const catInfo = entry ? getCategoryInfo(entry.category) : null
                      const wordDef = getWordDefinition(word)
                      const isNew = idx === 0 && newWordKey > 0
                      return (
                        <Tooltip key={`${word}-${newWordKey}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200 cursor-default word-item-highlight ${isNew ? 'word-entrance' : ''}`}
                            >
                              <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 transition-all duration-200 group-hover:scale-125"
                                  style={{ backgroundColor: catColor }}
                                />
                                {word}
                                {/* Category emoji on hover */}
                                {catInfo && (
                                  <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-200">
                                    {catInfo.emoji}
                                  </span>
                                )}
                                {/* Rarity indicator */}
                                {(() => {
                                  const rarity = entry ? getRarityForPoints(entry.points) : 'common'
                                  const rConf = RARITY_CONFIG[rarity]
                                  return rarity !== 'common' ? (
                                    <span className="text-[8px] opacity-70" style={{ color: rConf.color }}>{rConf.emoji}</span>
                                  ) : null
                                })()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {/* Pronunciation button */}
                                {isSpeechSupported() && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); pronounceWord(word) }}
                                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity duration-200 text-slate-400 hover:text-cyan-400"
                                    title="Pronounce word"
                                  >
                                    <Volume1 className="h-3 w-3" />
                                  </button>
                                )}
                                {entry && (
                                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                                    {entry.points}pt{entry.points !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {count > 1 && (
                                  <Badge variant="secondary" className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center">
                                    ×{count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            align="center"
                            className="bg-slate-900 border border-slate-700 text-slate-200 shadow-xl shadow-slate-900/50 rounded-lg px-3 py-2.5 max-w-[240px]"
                          >
                            {wordDef ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                  <span className="font-bold text-sm text-white">{word}</span>
                                  {catInfo && (
                                    <span className="text-[10px] text-slate-400 ml-0.5">{catInfo.label}</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{wordDef.definition}</p>
                                <p className="text-xs text-slate-400 italic leading-relaxed">&ldquo;{wordDef.example}&rdquo;</p>
                                {wordDef.etymology && (
                                  <p className="text-[10px] text-slate-500 mt-1 etymology-highlight">📖 {wordDef.etymology}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-white">{word}</span>
                                {catInfo && (
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                    <span className="text-[10px] text-slate-400">{catInfo.label}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </ScrollArea>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Stats Modal */}
      <GameStatsDialog
        open={showGameStats}
        onOpenChange={setShowGameStats}
      />

      {/* Custom Words Modal */}
      <CustomWordsDialog
        open={showCustomWords}
        onOpenChange={setShowCustomWords}
      />

      {/* Achievement Gallery Modal */}
      <AchievementGallery
        open={showAchievementGallery}
        onOpenChange={setShowAchievementGallery}
        stats={{
          totalWordsCollected: getTotalCount(),
          totalWordsEaten: getTotalCount(),
          poemsCreated: typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-poems-count') ?? '0', 10) : 0,
          highScore,
          categories: [...new Set(getWordList().map(({ word }) => {
            const entry = getWordEntry(word)
            return entry?.category
          }).filter(Boolean))] as string[],
          gamesPlayed: typeof window !== 'undefined' ? parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) : 0,
        }}
      />

      {/* Achievement toast with rotating sparkle */}
      {uiState.lastAchievement && (
        <div className="fixed top-20 right-4 z-[90] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm">
            <span className="text-2xl">{uiState.lastAchievement.emoji}</span>
            <div>
              <p className="text-amber-300 text-sm font-bold">
                {uiState.lastAchievement.title}
                {uiState.achievementQueueSize > 0 && (
                  <span className="text-amber-400/70 text-xs font-normal ml-1.5">(+{uiState.achievementQueueSize} more)</span>
                )}
              </p>
              <p className="text-amber-400/80 text-xs">{uiState.lastAchievement.description}</p>
            </div>
            <Sparkles className="h-4 w-4 text-amber-500 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Milestone celebration toast */}
      {uiState.lastMilestone && (
        <div className="fixed top-36 right-4 z-[91] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-yellow-900/95 via-amber-900/95 to-yellow-900/95 border-2 border-yellow-500/60 shadow-2xl shadow-yellow-600/30 backdrop-blur-sm">
            <span className="text-3xl">{uiState.lastMilestone.emoji}</span>
            <div>
              <p className="text-yellow-300 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Milestone Unlocked!
              </p>
              <p className="text-yellow-200 text-sm font-bold">
                {uiState.lastMilestone.name}
              </p>
              <p className="text-yellow-400/80 text-xs">{uiState.lastMilestone.description}</p>
            </div>
            <Sparkles className="h-5 w-5 text-yellow-400 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Settings Panel Modal */}
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        currentSkin={activeSkin}
        onSkinChange={(skin) => { gameStateRef.current.activeSkin = skin.id; setActiveSkin(skin); saveSnakeSkin(skin.id) }}
        currentGridTheme={activeGridTheme}
        onGridThemeChange={(theme) => { gameStateRef.current.gridTheme = theme; setActiveGridTheme(theme); saveGridTheme(theme) }}
        currentSoundTheme={activeSoundTheme}
        onSoundThemeChange={(theme) => { setSoundTheme(theme); setActiveSoundTheme(theme); saveSoundTheme(theme) }}
        currentTrail={activeTrail}
        onTrailChange={(trail) => { setActiveTrail(trail); saveTrail(trail) }}
      />

      {/* Speed Run best score display */}
      {mounted && speedRunBest.totalRuns > 0 && !uiState.gameStarted && (
        <div className="text-center mt-1">
          <span className="text-[10px] text-rose-400/60">
            Speed Run Best: {speedRunBest.bestScore} pts ({speedRunBest.totalRuns} runs)
          </span>
        </div>
      )}
    </div>
  )
}
