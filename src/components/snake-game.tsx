'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { toast } from '@/hooks/use-toast'
import { getRandomWordWithCategories, getWordCountByCategory, getWordEntry, getWordEntryIncludingCustom, getCategoryInfo, CATEGORY_COLORS, type WordCategory, WORD_ENTRIES, WordRarity, RARITY_CONFIG, getRarityForPoints, getRandomRarity } from '@/lib/word-pool'
import { playEatSound, playGameOverSound, playStartSound, playPauseSound, playClickSound, playPowerUpSound, setSoundTheme, playThemePreviewSound, playEasterEggSound, decayVisualizerPulse } from '@/lib/sounds'
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
import { getSnakeSkin, getAllSkins, getSavedSkin, saveSnakeSkin, isSkinUnlocked, getSkinUnlockMap, type SnakeSkin } from '@/lib/snake-skins'
import { checkEasterEggs, hasActiveEffect, expireEasterEggEffects, resetEasterEggForNewGame, type EasterEgg, type EasterEggEffect } from '@/lib/easter-eggs'
import { getGridTheme, getAllGridThemes, getSavedGridTheme, saveGridTheme, type GridThemeId } from '@/lib/grid-themes'
import { getSavedSoundTheme, getAllSoundThemes, saveSoundTheme, type SoundThemeId } from '@/lib/sound-themes'
import { getSavedTrail, getAllTrails, saveTrail, type SnakeTrailType, spawnTrailParticles, drawTrail, updateTrailParticles, type TrailParticle } from '@/lib/snake-trails'
import KeyboardShortcutsDialog from '@/components/keyboard-shortcuts-dialog'
import { updateVisualizer, drawVisualizer, resetVisualizer, getVisualizerConfig, isVisualizerActive, type VisualizerBar } from '@/lib/sound-visualizer'
import SettingsPanel from '@/components/settings-panel'
import GameOverStats from '@/components/game-over-stats'
import { isSpeechSupported, pronounceWord } from '@/lib/word-pronunciation'
import { getSpeedRunDuration, getSpeedRunBest, saveSpeedRunResult, type SpeedRunResult } from '@/lib/speed-run'
import { getNightModeConfig, saveNightModeConfig, shouldAutoEnableNightMode, getNightModeFilter, type NightModeConfig } from '@/lib/night-mode'
import { getPlayerLevel, getDifficultyAdjustment, recordGamePerformance, type DifficultyAdjustment } from '@/lib/dynamic-difficulty'
import { calculateInGameDifficulty, getSpeedMultiplier, type InGameDifficulty } from '@/lib/in-game-difficulty'
import { downloadShareCard, type ShareCardData } from '@/lib/share-card'
import { WORD_PACKS, getActivePack, setActivePack, isPackUnlocked, getWordsFromPack, getPackWordEntry, getPackCategoryInfo, checkPackUnlocks, type WordPack, PACK_CATEGORY_INFO } from '@/lib/word-packs'
import { isTutorialCompleted, markTutorialCompleted, saveTutorialProgress, resetTutorial as resetTutorialData, createTutorialState, type TutorialState } from '@/lib/tutorial'
import { createPvPState, P2_COLORS, type PvPState } from '@/lib/pvp-mode'
import { createAiBot, calculateAiBotMove, updateAiBot, checkAiBotCollision, getAiBotDrawInfo, type AiBotState } from '@/lib/ai-bot'
import WordBook from '@/components/word-book'
import { startRecording, recordFrame, stopRecording, isRecording, getReplays, deleteReplay, getReplay, startPlayback, stopPlayback, isPlaybackActive, getPlaybackState, advancePlayback, setPlaybackSpeed, setPlaybackPlaying, getPlaybackProgress, seekPlayback, formatDuration, formatDate, clearAllReplays, type GameReplay, type ReplayFrame } from '@/lib/game-replay'
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
  GraduationCap,
  ChevronRight,
  Lock,
  Package,
  Film,
  Trash2,
  Bot,
  SkipForward,
  SkipBack,
  X,
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
  inGameDifficulty: InGameDifficulty | null
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

  // Replay dialog
  const [showReplayDialog, setShowReplayDialog] = useState(false)
  const [replayList, setReplayList] = useState<GameReplay[]>([])
  const [replayMode, setReplayMode] = useState(false)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [replayPaused, setReplayPaused] = useState(false)
  const [replayProgress, setReplayProgress] = useState(0)
  const [replayFrame, setReplayFrame] = useState<ReplayFrame | null>(null)

  // Sound theme state
  const [activeSoundTheme, setActiveSoundTheme] = useState<SoundThemeId>('default')
  const [soundWavePulse, setSoundWavePulse] = useState(false)

  // Trail state
  const [activeTrail, setActiveTrail] = useState<SnakeTrailType>('none')
  const trailParticlesRef = useRef<TrailParticle[]>([])
  const visualizerBarsRef = useRef<VisualizerBar[]>([])
  const lastFrameTimeRef = useRef(0)

  // Daily challenge state (lazy init to avoid hydration mismatch)
  const [dailyInfo, setDailyInfo] = useState<{
    challenge: DailyChallenge | null
    played: boolean
    result: { completed: boolean; score: number } | null
  }>({ challenge: null, played: false, result: null })

  // Streak state (lazy init to avoid hydration mismatch)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)

  // Active word pack state
  const [activeWordPack, setActiveWordPack] = useState<string>('default')
  const [unlockedPackIds, setUnlockedPackIds] = useState<string[]>([])
  const [wordPackToast, setWordPackToast] = useState<{ name: string; emoji: string; description: string } | null>(null)
  const wordPackToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      // Load saved skin (fallback to classic if locked)
      const savedSkin = getSavedSkin()
      const resolvedSkin = isSkinUnlocked(savedSkin) ? savedSkin : 'classic'
      gameStateRef.current.activeSkin = resolvedSkin
      setActiveSkin(resolvedSkin)
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
      // Load tutorial state
      setTutorialCompleted(isTutorialCompleted())
      // Load active word pack and unlocked packs
      const savedPack = getActivePack()
      setActiveWordPack(savedPack)
      const unlocked = WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id)
      setUnlockedPackIds(unlocked)
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
    inGameDifficulty: null,
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const p2DirectionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())
  const pvpRef = useRef<PvPState | null>(null)
  const aiBotRef = useRef<AiBotState | null>(null)
  const [showWordBook, setShowWordBook] = useState(false)
  const [aiBotActive, setAiBotActive] = useState(false)
  const floatingTextsRef = useRef<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const weatherParticlesRef = useRef<{x: number; y: number; vx: number; vy: number; size: number; alpha: number}[]>([])
  // Easter egg confetti particles (separate from game particles)
  const easterEggParticlesRef = useRef<{x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; rotation: number; rotSpeed: number}[]>([])
  const prevInGameDiffLevelRef = useRef<number>(0)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const milestoneToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tutorial state
  const [tutorialCompleted, setTutorialCompleted] = useState(false)
  const [tutorialActive, setTutorialActive] = useState(false)
  const tutorialStateRef = useRef<TutorialState | null>(null)
  const tutorialTutorialGameRef = useRef(false) // Whether the current game is a tutorial game
  const tutorialEatWordPendingRef = useRef(false) // Whether we're waiting for the player to eat a word
  const tutorialConfettiRef = useRef<{x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; life: number}[]>([])
  const tutorialConfettiActiveRef = useRef(false)
  const [tutorialJustCompleted, setTutorialJustCompleted] = useState(false)

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
    inGameDifficulty: null as InGameDifficulty | null,
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

  // Easter egg active effects display state
  const [activeEasterEggs, setActiveEasterEggs] = useState<Array<{ id: string; name: string; emoji: string; effect: EasterEggEffect; expiresAt: number }>>([])
  const easterEggCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      inGameDifficulty: gs.inGameDifficulty,
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

  // Spawn confetti particles for easter egg celebrations
  const spawnEasterEggConfetti = useCallback((x: number, y: number, count: number) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.5
      const speed = 2 + Math.random() * 5
      easterEggParticlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      })
    }
  }, [])

  const spawnWord = useCallback(() => {
    const gs = gameStateRef.current
    const occupiedPositions = new Set(gs.snake.map((s) => `${s.x},${s.y}`))
    // Include Player 2 positions in PvP mode
    const pvpSpawn = pvpRef.current
    if (pvpSpawn) {
      for (const seg of pvpSpawn.player2Snake) {
        occupiedPositions.add(`${seg.x},${seg.y}`)
      }
    }

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
      // Check if a word pack is active
      const packId = getActivePack()
      if (packId !== 'default') {
        const packWords = getWordsFromPack(packId)
        const collected = Array.from(collectedWordsRef.current)
        const available = packWords.filter((w) => !collected.includes(w.word))
        if (available.length > 0) {
          const pick = available[Math.floor(Math.random() * available.length)]
          word = pick.word
          category = pick.category as WordCategory
        } else {
          // Pack exhausted — fall back to default pool
          const pick = getRandomWordWithCategories(collected, gs.activeCategories)
          word = pick.word
          category = pick.category
        }
      } else {
        const collected = Array.from(collectedWordsRef.current)
        const pick = getRandomWordWithCategories(collected, gs.activeCategories)
        word = pick.word
        category = pick.category
      }
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

  const startPvP = useCallback(() => {
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
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    // Start replay recording
    try { startRecording() } catch { /* ignore */ }
    gs.lastAchievement = null
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null }
    if (milestoneToastTimerRef.current) { clearTimeout(milestoneToastTimerRef.current); milestoneToastTimerRef.current = null }
    gs.lastMilestone = null
    gs.extraLifeAvailable = false
    gs.weather = 'clear' // PvP always clear weather for fairness
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = getSpeedRunDuration()
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0
    // Initialize PvP state
    pvpRef.current = createPvPState()
    spawnWord()
    playSound(playStartSound)
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }
    updateUI()
  }, [spawnWord, updateUI, playSound])

  const startAiBot = useCallback(() => {
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
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    try { startRecording() } catch { /* ignore */ }
    gs.lastAchievement = null
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null }
    if (milestoneToastTimerRef.current) { clearTimeout(milestoneToastTimerRef.current); milestoneToastTimerRef.current = null }
    gs.lastMilestone = null
    gs.extraLifeAvailable = false
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = getSpeedRunDuration()
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0
    // Clear PvP state
    pvpRef.current = null
    // Initialize AI bot state
    aiBotRef.current = createAiBot(diff)
    setAiBotActive(true)
    spawnWord()
    playSound(playStartSound)
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }
    updateUI()
  }, [spawnWord, updateUI, playSound])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Helper to push direction with reverse controls support (easter egg)
  const pushDirection = useCallback((dir: Direction) => {
    if (hasActiveEffect('reverse_controls')) {
      const reverseMap: Record<Direction, Direction> = {
        UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
      }
      dir = reverseMap[dir]
    }
    directionQueueRef.current.push(dir)
    if (directionQueueRef.current.length > 2) {
      directionQueueRef.current = directionQueueRef.current.slice(-2)
    }
  }, [])

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

    // Sound visualizer (background effect behind game elements)
    if (isVisualizerActive()) {
      drawVisualizer(ctx, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, visualizerBarsRef.current)
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
    const isRainbowEgg = hasActiveEffect('rainbow_snake')
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        const headColor = isRainbowEgg
          ? `hsl(${(Date.now() / 10) % 360}, 80%, 60%)`
          : (gs.isDailyChallenge ? '#fbbf24' : skin.headColor)
        const glowColor = isRainbowEgg
          ? headColor
          : (gs.isDailyChallenge ? '#f59e0b' : skin.glowColor)
        ctx.shadowColor = glowColor
        ctx.shadowBlur = isRainbowEgg ? 18 : 12
        ctx.fillStyle = headColor
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
        if (isRainbowEgg) {
          // Easter egg rainbow: faster cycling than rainbow skin
          const hue = (index * 360 / snake.length + Date.now() / 30) % 360
          ctx.fillStyle = `hsl(${hue}, 85%, 60%)`
        } else if (gs.isDailyChallenge) {
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

    // ===== PvP: Draw Player 2 Snake =====
    const pvpDraw = pvpRef.current
    if (pvpDraw && pvpDraw.player2Snake.length > 0) {
      // P2 body trail glow
      ctx.globalAlpha = 0.04
      ctx.fillStyle = P2_COLORS.glow
      for (const seg of pvpDraw.player2Snake) {
        ctx.beginPath()
        ctx.arc(seg.x * CELL_SIZE + CELL_SIZE / 2, seg.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      pvpDraw.player2Snake.forEach((segment, index) => {
        const ratio = 1 - index / pvpDraw.player2Snake.length
        if (index === 0) {
          // P2 Head
          ctx.shadowColor = P2_COLORS.glow
          ctx.shadowBlur = 12
          ctx.fillStyle = P2_COLORS.head
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // P2 Eyes
          const eyeSize = 2.5
          const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
          const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
          let eye1x: number, eye1y: number, eye2x: number, eye2y: number
          if (pvpDraw.player2Direction === 'RIGHT') { eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5 }
          else if (pvpDraw.player2Direction === 'LEFT') { eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5 }
          else if (pvpDraw.player2Direction === 'UP') { eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4 }
          else { eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4 }
          ctx.fillStyle = P2_COLORS.eyeOuter
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = gridTheme.bgColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()

          // P2 label near head
          ctx.globalAlpha = 0.5
          ctx.fillStyle = '#06b6d4'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('P2', cx, segment.y * CELL_SIZE - 2)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        } else {
          // P2 Body - gradient from cyan to teal
          const startRgb = hexToRgb(P2_COLORS.bodyStart)
          const endRgb = hexToRgb(P2_COLORS.bodyEnd)
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(startRgb.r + (endRgb.r - startRgb.r) * ratio)
          const g = Math.floor(startRgb.g + (endRgb.g - startRgb.g) * ratio)
          const b = Math.floor(startRgb.b + (endRgb.b - startRgb.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3)
          ctx.fill()
        }
      })
    }

    // ===== AI Bot: Draw Bot Snake =====
    const aiBotDraw = aiBotRef.current
    if (aiBotDraw && aiBotDraw.snake.length > 0) {
      const botColors = getAiBotDrawInfo()
      // Bot body trail glow
      ctx.globalAlpha = 0.04
      ctx.fillStyle = botColors.glowColor
      for (const seg of aiBotDraw.snake) {
        ctx.beginPath()
        ctx.arc(seg.x * CELL_SIZE + CELL_SIZE / 2, seg.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      aiBotDraw.snake.forEach((segment, index) => {
        const ratio = 1 - index / aiBotDraw.snake.length
        if (index === 0) {
          // Bot Head
          ctx.shadowColor = botColors.glowColor
          ctx.shadowBlur = 12
          ctx.fillStyle = botColors.headColor
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5)
          ctx.fill()
          ctx.shadowBlur = 0

          // Bot Eyes
          const eyeSize = 2.5
          const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
          const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
          let eye1x: number, eye1y: number, eye2x: number, eye2y: number
          if (aiBotDraw.direction === 'RIGHT') { eye1x = cx + 4; eye1y = cy - 3.5; eye2x = cx + 4; eye2y = cy + 3.5 }
          else if (aiBotDraw.direction === 'LEFT') { eye1x = cx - 4; eye1y = cy - 3.5; eye2x = cx - 4; eye2y = cy + 3.5 }
          else if (aiBotDraw.direction === 'UP') { eye1x = cx - 3.5; eye1y = cy - 4; eye2x = cx + 3.5; eye2y = cy - 4 }
          else { eye1x = cx - 3.5; eye1y = cy + 4; eye2x = cx + 3.5; eye2y = cy + 4 }
          ctx.fillStyle = botColors.eyeWhiteColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = botColors.eyePupilColor
          ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()

          // Bot label near head
          ctx.globalAlpha = 0.5
          ctx.fillStyle = '#f97316'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('🤖', cx, segment.y * CELL_SIZE - 2)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        } else {
          // Bot Body - gradient from orange-400 to orange-700
          const startRgb = hexToRgb(botColors.bodyStartColor)
          const endRgb = hexToRgb(botColors.bodyEndColor)
          const alpha = 0.6 + ratio * 0.4
          const r = Math.floor(startRgb.r + (endRgb.r - startRgb.r) * ratio)
          const g = Math.floor(startRgb.g + (endRgb.g - startRgb.g) * ratio)
          const b = Math.floor(startRgb.b + (endRgb.b - startRgb.b) * ratio)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.beginPath()
          ctx.roundRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3)
          ctx.fill()
        }
      })
    }
    // ===== END AI Bot Drawing =====

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
    const isGiantFood = hasActiveEffect('giant_food')
    if (wordFood) {
      const { word, position, spawnTime, category } = wordFood
      const elapsed = Date.now() - spawnTime
      const giantScale = isGiantFood ? 1.6 : 1
      const pulse = (1 + Math.sin(elapsed / 300) * 0.08) * giantScale
      const catColor = CATEGORY_COLORS[category] ?? PACK_CATEGORY_INFO[category]?.color ?? '#f59e0b'

      const fontSize = isGiantFood ? 14 : 11
      ctx.font = `bold ${fontSize}px monospace`
      const wordWidth = ctx.measureText(word).width
      const padding = isGiantFood ? 12 : 8
      const boxWidth = (wordWidth + padding * 2) * pulse
      const boxHeight = (CELL_SIZE + padding) * pulse
      const boxX = position.x * CELL_SIZE + CELL_SIZE / 2 - boxWidth / 2
      const boxY = position.y * CELL_SIZE + CELL_SIZE / 2 - boxHeight / 2

      // Glow
      ctx.shadowColor = isGiantFood ? '#fbbf24' : catColor
      ctx.shadowBlur = (isGiantFood ? 28 : 16) + Math.sin(elapsed / 200) * 6

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
        ctx.fillStyle = CATEGORY_COLORS[gs.lastEatenCategory] ?? PACK_CATEGORY_INFO[gs.lastEatenCategory]?.color ?? '#f59e0b'
        ctx.font = '10px sans-serif'
        const catLabel = getCategoryInfo(gs.lastEatenCategory)?.label ?? PACK_CATEGORY_INFO[gs.lastEatenCategory]?.label ?? gs.lastEatenCategory
        ctx.fillText(`${gs.comboCount}× ${catLabel}`, CANVAS_WIDTH - 12, 36)
      }
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // In-game progressive difficulty indicator (top-left badge)
    if (gs.inGameDifficulty && gameStarted && !gameOver && !paused) {
      const igd = gs.inGameDifficulty
      const badgePulse = igd.level >= 8 ? (0.7 + Math.sin(Date.now() / 200) * 0.3) : 1
      ctx.globalAlpha = badgePulse

      // Badge background
      const badgeX = 8
      const badgeY = 6
      ctx.font = 'bold 10px sans-serif'
      const labelWidth = ctx.measureText(`${igd.emoji} ${igd.label}`).width
      const badgeW = labelWidth + 20
      const badgeH = 18

      // Glow for legendary
      if (igd.level >= 10) {
        ctx.shadowColor = igd.glowColor
        ctx.shadowBlur = 12 + Math.sin(Date.now() / 150) * 6
      } else if (igd.level >= 7) {
        ctx.shadowColor = igd.color
        ctx.shadowBlur = 6
      }

      ctx.fillStyle = `${igd.color}18`
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4)
      ctx.fill()

      // Border
      ctx.strokeStyle = `${igd.color}60`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4)
      ctx.stroke()

      ctx.shadowBlur = 0

      // Text
      ctx.fillStyle = igd.color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${igd.emoji} ${igd.label}`, badgeX + 6, badgeY + badgeH / 2)

      // Speed indicator
      ctx.fillStyle = `${igd.color}99`
      ctx.font = '8px monospace'
      ctx.fillText(`×${igd.speedMultiplier.toFixed(2)}`, badgeX + badgeW - 4, badgeY + badgeH / 2 - 7)

      // Level number
      ctx.fillStyle = igd.glowColor
      ctx.font = 'bold 8px sans-serif'
      ctx.fillText(`Lv.${igd.level}`, badgeX + badgeW - 4, badgeY + badgeH / 2 + 5)

      ctx.textBaseline = 'alphabetic'
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

    // Draw easter egg confetti particles
    const eeParticles = easterEggParticlesRef.current
    for (let i = eeParticles.length - 1; i >= 0; i--) {
      const p = eeParticles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // gravity
      p.vx *= 0.99 // air resistance
      p.life -= 0.008
      p.rotation += p.rotSpeed
      if (p.life <= 0) { eeParticles.splice(i, 1); continue }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = Math.min(1, p.life * 2)
      ctx.fillStyle = p.color
      // Draw rectangle confetti
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
      ctx.globalAlpha = 1
    }

    // PvP Score HUD (top center)
    if (pvpDraw && gameStarted) {
      const hudY = gameOver ? 10 : 10
      const barW = 200
      const barH = 22
      const barX = (CANVAS_WIDTH - barW) / 2

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(barX, hudY, barW, barH, 6)
      ctx.fill()

      // P1 score (green)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`P1: ${gs.score}`, barX + 10, hudY + barH / 2)

      // Divider
      ctx.fillStyle = '#475569'
      ctx.fillText('|', CANVAS_WIDTH / 2 - 4, hudY + barH / 2)

      // P2 score (cyan)
      ctx.fillStyle = '#22d3ee'
      ctx.textAlign = 'right'
      ctx.fillText(`P2: ${pvpDraw.player2Score}`, barX + barW - 10, hudY + barH / 2)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      // P2 words collected list (right side of canvas)
      if (!gameOver) {
        const wordsListX = CANVAS_WIDTH - 8
        const wordsListY = 40
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)'
        ctx.beginPath()
        ctx.roundRect(wordsListX - 100, wordsListY - 12, 108, Math.min(pvpDraw.player2WordsEaten.length * 14 + 18, 120), 4)
        ctx.fill()
        ctx.fillStyle = '#22d3ee'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('P2 Words', wordsListX, wordsListY - 10)
        const maxShow = 7
        const recentWords = pvpDraw.player2WordsEaten.slice(-maxShow)
        ctx.font = '9px monospace'
        ctx.fillStyle = '#94a3b8'
        recentWords.forEach((w, i) => {
          ctx.fillText(w, wordsListX, wordsListY + 4 + i * 14)
        })
        if (pvpDraw.player2WordsEaten.length > maxShow) {
          ctx.fillStyle = '#475569'
          ctx.fillText(`+${pvpDraw.player2WordsEaten.length - maxShow} more`, wordsListX, wordsListY + 4 + maxShow * 14)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }

    // AI Bot Score HUD (top center)
    if (aiBotDraw && gameStarted) {
      const hudY = gameOver ? 10 : 10
      const barW = 220
      const barH = 22
      const barX = (CANVAS_WIDTH - barW) / 2

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(barX, hudY, barW, barH, 6)
      ctx.fill()

      // Player score (green)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`You: ${gs.score}`, barX + 10, hudY + barH / 2)

      // Divider
      ctx.fillStyle = '#475569'
      ctx.fillText('|', CANVAS_WIDTH / 2 - 4, hudY + barH / 2)

      // Bot score (orange)
      ctx.fillStyle = aiBotDraw.alive ? '#f97316' : '#64748b'
      ctx.textAlign = 'right'
      ctx.fillText(`🤖 Bot: ${aiBotDraw.score}`, barX + barW - 10, hudY + barH / 2)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      // Bot words collected list (right side of canvas)
      if (!gameOver) {
        const wordsListX = CANVAS_WIDTH - 8
        const wordsListY = 40
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)'
        ctx.beginPath()
        ctx.roundRect(wordsListX - 100, wordsListY - 12, 108, Math.min(aiBotDraw.wordsEaten.length * 14 + 18, 120), 4)
        ctx.fill()
        ctx.fillStyle = '#f97316'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('🤖 Bot Words', wordsListX, wordsListY - 10)
        const maxShow = 7
        const recentWords = aiBotDraw.wordsEaten.slice(-maxShow)
        ctx.font = '9px monospace'
        ctx.fillStyle = '#94a3b8'
        recentWords.forEach((w, i) => {
          ctx.fillText(w, wordsListX, wordsListY + 4 + i * 14)
        })
        if (aiBotDraw.wordsEaten.length > maxShow) {
          ctx.fillStyle = '#475569'
          ctx.fillText(`+${aiBotDraw.wordsEaten.length - maxShow} more`, wordsListX, wordsListY + 4 + maxShow * 14)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }

    // Scanlines overlay (retro CRT effect)
    if (gridTheme.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 1)
      }
    }

    // Tutorial canvas overlay
    if (tutorialTutorialGameRef.current && gameStarted && !gameOver) {
      const ts = tutorialStateRef.current
      if (ts && ts.active) {
        const step = ts.steps[ts.currentStep]
        if (step) {
          // Dim overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          // Spotlight highlight
          const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.4
          let spotlightX = CANVAS_WIDTH / 2
          let spotlightY = CANVAS_HEIGHT / 2
          let spotlightRadius = 60

          if (step.highlight === 'snake' && snake.length > 0) {
            const head = snake[0]
            spotlightX = head.x * CELL_SIZE + CELL_SIZE / 2
            spotlightY = head.y * CELL_SIZE + CELL_SIZE / 2
            spotlightRadius = 70
          } else if (step.highlight === 'food' && wordFood) {
            spotlightX = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            spotlightY = wordFood.position.y * CELL_SIZE + CELL_SIZE / 2
            spotlightRadius = 65
          } else if (step.highlight === 'score') {
            spotlightX = CANVAS_WIDTH / 2
            spotlightY = 16
            spotlightRadius = 50
          } else if (step.highlight === 'controls') {
            spotlightX = CANVAS_WIDTH / 2
            spotlightY = CANVAS_HEIGHT - 20
            spotlightRadius = 55
          }

          if (step.highlight !== 'none') {
            // Pulsing circle
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, spotlightRadius * (0.9 + pulse * 0.1), 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(96, 165, 250, ${pulse * 0.8})`
            ctx.lineWidth = 2.5
            ctx.stroke()

            // Inner glow
            const grad = ctx.createRadialGradient(spotlightX, spotlightY, 0, spotlightX, spotlightY, spotlightRadius)
            grad.addColorStop(0, `rgba(96, 165, 250, ${pulse * 0.15})`)
            grad.addColorStop(1, 'rgba(96, 165, 250, 0)')
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, spotlightRadius, 0, Math.PI * 2)
            ctx.fill()

            // Animated ring
            const ringRadius = spotlightRadius + 5 + pulse * 8
            ctx.beginPath()
            ctx.arc(spotlightX, spotlightY, ringRadius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.3 * (1 - pulse)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }

          // "TUTORIAL" label in top-left corner of canvas
          ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(`🎓 Tutorial  ${ts.currentStep + 1}/${ts.steps.length}`, 8, 6)
          ctx.textAlign = 'start'
          ctx.textBaseline = 'alphabetic'
        }
      }
    }

    // Game over overlay
    if (gameOver) {
      // PvP game over overlay
      if (pvpDraw && pvpDraw.winner) {
        const goBg = hexToRgb(gridTheme.bgColor)
        ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        let titleText: string
        let titleColor: string
        let subtitleEmoji: string
        if (pvpDraw.winner === 'player1') {
          titleText = 'Player 1 Wins!'
          titleColor = '#4ade80'
          subtitleEmoji = '🏆'
        } else if (pvpDraw.winner === 'player2') {
          titleText = 'Player 2 Wins!'
          titleColor = '#22d3ee'
          subtitleEmoji = '🏆'
        } else {
          titleText = "It's a Tie!"
          titleColor = '#fbbf24'
          subtitleEmoji = '🤝'
        }

        // Decorative line
        const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
        lineGrad.addColorStop(0, 'rgba(148, 163, 184, 0)')
        lineGrad.addColorStop(0.5, titleColor + '99')
        lineGrad.addColorStop(1, 'rgba(148, 163, 184, 0)')
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 90); ctx.stroke()

        // Title
        ctx.fillStyle = titleColor
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${subtitleEmoji} ${titleText} ${subtitleEmoji}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

        // Score summary
        ctx.font = '18px sans-serif'
        ctx.fillStyle = '#4ade80'
        ctx.fillText(`P1: ${gs.score} pts`, CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2)
        ctx.fillStyle = '#22d3ee'
        ctx.fillText(`P2: ${pvpDraw.player2Score} pts`, CANVAS_WIDTH / 2 + 90, CANVAS_HEIGHT / 2)

        // Words eaten
        ctx.fillStyle = '#64748b'
        ctx.font = '14px sans-serif'
        ctx.fillText(`P1 ate ${gs.wordsEaten} words  •  P2 ate ${pvpDraw.player2WordsEaten.length} words  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)

        // Bottom line
        ctx.strokeStyle = lineGrad
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 60); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 60); ctx.stroke()

        const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
        ctx.fillText('Press Space or click to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      } else if (aiBotDraw) {
        // AI Bot game over overlay — compare scores
        const goBg = hexToRgb(gridTheme.bgColor)
        ctx.fillStyle = `rgba(${goBg.r}, ${goBg.g}, ${goBg.b}, 0.88)`
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        let titleText: string
        let titleColor: string
        let subtitleEmoji: string
        if (gs.score > aiBotDraw.score) {
          titleText = 'You Win!'
          titleColor = '#4ade80'
          subtitleEmoji = '🏆'
        } else if (gs.score < aiBotDraw.score) {
          titleText = 'AI Bot Wins!'
          titleColor = '#f97316'
          subtitleEmoji = '🤖'
        } else {
          titleText = "It's a Tie!"
          titleColor = '#fbbf24'
          subtitleEmoji = '🤝'
        }

        // Decorative line
        const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
        lineGrad.addColorStop(0, 'rgba(148, 163, 184, 0)')
        lineGrad.addColorStop(0.5, titleColor + '99')
        lineGrad.addColorStop(1, 'rgba(148, 163, 184, 0)')
        ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 90); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 90); ctx.stroke()

        // Title
        ctx.fillStyle = titleColor
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${subtitleEmoji} ${titleText} ${subtitleEmoji}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)

        // Score summary
        ctx.font = '18px sans-serif'
        ctx.fillStyle = '#4ade80'
        ctx.fillText(`You: ${gs.score} pts`, CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2)
        ctx.fillStyle = '#f97316'
        ctx.fillText(`🤖 Bot: ${aiBotDraw.score} pts`, CANVAS_WIDTH / 2 + 90, CANVAS_HEIGHT / 2)

        // Words eaten
        ctx.fillStyle = '#64748b'
        ctx.font = '14px sans-serif'
        ctx.fillText(`You ate ${gs.wordsEaten} words  •  Bot ate ${aiBotDraw.wordsEaten.length} words  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)

        // Bottom line
        ctx.strokeStyle = lineGrad
        ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 60); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 60); ctx.stroke()

        const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`; ctx.font = '14px sans-serif'
        ctx.fillText('Press Space or click to return to menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      } else {
        // Original single-player game over overlay
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

      // In-game difficulty reached
      if (gs.inGameDifficulty && gs.inGameDifficulty.level >= 3) {
        ctx.fillStyle = gs.inGameDifficulty.color
        ctx.font = '12px sans-serif'
        ctx.fillText(`${gs.inGameDifficulty.emoji} Peak: ${gs.inGameDifficulty.label} (Lv.${gs.inGameDifficulty.level})`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 43)
      }

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
      } // end else single-player game over
    }

    // Start screen
    if (!gameStarted) {
      const ssBg = hexToRgb(gridTheme.bgColor)
      ctx.fillStyle = `rgba(${ssBg.r}, ${ssBg.g}, ${ssBg.b}, 0.92)`
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Tutorial completion confetti
      if (tutorialConfettiActiveRef.current) {
        const confetti = tutorialConfettiRef.current
        for (let i = confetti.length - 1; i >= 0; i--) {
          const c = confetti[i]
          c.x += c.vx
          c.y += c.vy
          c.vy += 0.12
          c.rotation += c.rotSpeed
          c.life -= 0.008
          if (c.life <= 0) { confetti.splice(i, 1); continue }
          ctx.save()
          ctx.translate(c.x, c.y)
          ctx.rotate(c.rotation)
          ctx.globalAlpha = Math.min(1, c.life * 2)
          ctx.fillStyle = c.color
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
          ctx.restore()
          ctx.globalAlpha = 1
        }
      }

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
        const info = getCategoryInfo(cat) ?? { label: cat, color: '#94a3b8', emoji: '📝' }
        const col = i % catCols
        const row = Math.floor(i / catCols)
        const x = leftCenterX - (catCols * catColW) / 2 + col * catColW + 10
        const y = catStartY + row * catRowH
        ctx.fillStyle = CATEGORY_COLORS[cat] ?? PACK_CATEGORY_INFO[cat]?.color ?? '#94a3b8'
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
    p2DirectionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    collectedWordsRef.current = new Set()
    easterEggParticlesRef.current = []
    resetVisualizer()
    setActiveEasterEggs([])
    resetEasterEggForNewGame()
    setLeaderboardRank(0)
    // Clear PvP state (PvP mode is session-only, not persisted)
    pvpRef.current = null
    // Clear AI bot state
    aiBotRef.current = null
    setAiBotActive(false)

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
    // Start replay recording (not for PvP or replay mode)
    if (!pvpRef.current && !isPlaybackActive()) {
      try { startRecording() } catch { /* ignore */ }
    }
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

    // Reset in-game progressive difficulty
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0

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

      // Compute deltaTime for visualizer
      const dt = lastFrameTimeRef.current > 0
        ? Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.1)
        : 0.016
      lastFrameTimeRef.current = timestamp

      // Decay visualizer pulse and update bars
      if (isVisualizerActive()) {
        decayVisualizerPulse(dt)
        visualizerBarsRef.current = updateVisualizer(dt)
      }

      if (!gs.gameStarted || gs.gameOver || gs.paused) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Expire active power-ups
      const now = Date.now()
      gs.activePowerUps = gs.activePowerUps.filter(pu => pu.expiresAt === 0 || pu.expiresAt > now)

      // Expire easter egg effects
      expireEasterEggEffects()

      // Expire uncollected power-up on the grid after 15 seconds
      if (gs.powerUp && (now - gs.powerUp.spawnTime) > POWERUP_DESPAWN_TIME) {
        gs.powerUp = null
      }

      // Speed modifiers: base_speed → weather_modifier → slow_mo_modifier → in-game_difficulty
      let effectiveSpeed = gs.speed
      const weatherConf = WEATHER_CONFIG[gs.weather]
      if (weatherConf.speedMultiplier > 1) {
        effectiveSpeed = Math.floor(effectiveSpeed * weatherConf.speedMultiplier)
      }
      if (gs.activePowerUps.some(pu => pu.type === 'slow_mo')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 1.6) // 60% slower = speed value 1.6x higher
      }
      // Easter egg slow_mo effect (Time Lord)
      if (hasActiveEffect('slow_mo')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 1.6)
      }
      // Easter egg speed_boost effect
      if (hasActiveEffect('speed_boost')) {
        effectiveSpeed = Math.floor(effectiveSpeed * 0.75) // 25% faster
      }
      // In-game progressive difficulty: divide by speed multiplier to make game faster
      if (gs.inGameDifficulty) {
        effectiveSpeed = Math.floor(effectiveSpeed / gs.inGameDifficulty.speedMultiplier)
      }

      if (timestamp - lastRenderRef.current < effectiveSpeed) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      lastRenderRef.current = timestamp

      // ===== PvP GAME LOOP =====
      const pvp = pvpRef.current
      if (pvp) {
        // Expire P2 power-ups
        const pvpNow = Date.now()
        pvp.player2ActivePowerUps = pvp.player2ActivePowerUps.filter(pu => pu.expiresAt === 0 || pu.expiresAt > pvpNow)

        // Process P1 direction
        if (directionQueueRef.current.length > 0) {
          const newDir = directionQueueRef.current.shift()!
          const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
          if (opp[newDir] !== gs.direction) gs.direction = newDir
        }

        // Process P2 direction
        if (p2DirectionQueueRef.current.length > 0 && pvp.player2Alive) {
          const p2Dir = p2DirectionQueueRef.current.shift()!
          const opp2: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
          if (opp2[p2Dir] !== pvp.player2Direction) pvp.player2Direction = p2Dir
        }

        // Compute new head positions
        const p1Head = { ...gs.snake[0] }
        switch (gs.direction) {
          case 'UP': p1Head.y -= 1; break
          case 'DOWN': p1Head.y += 1; break
          case 'LEFT': p1Head.x -= 1; break
          case 'RIGHT': p1Head.x += 1; break
        }

        const p2Head = { ...pvp.player2Snake[0] }
        if (pvp.player2Alive) {
          switch (pvp.player2Direction) {
            case 'UP': p2Head.y -= 1; break
            case 'DOWN': p2Head.y += 1; break
            case 'LEFT': p2Head.x -= 1; break
            case 'RIGHT': p2Head.x += 1; break
          }
        }

        let p1Died = false
        let p2Died = false

        // P1 wall collision
        if (p1Head.x < 0 || p1Head.x >= GRID_WIDTH || p1Head.y < 0 || p1Head.y >= GRID_HEIGHT) {
          const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
          if (hasShield) {
            gs.activePowerUps = gs.activePowerUps.filter(pu => pu.type !== 'shield')
            if (p1Head.x < 0) p1Head.x = GRID_WIDTH - 1
            else if (p1Head.x >= GRID_WIDTH) p1Head.x = 0
            else if (p1Head.y < 0) p1Head.y = GRID_HEIGHT - 1
            else if (p1Head.y >= GRID_HEIGHT) p1Head.y = 0
            spawnFloatingText('🛡️', p1Head.x * CELL_SIZE + CELL_SIZE / 2, p1Head.y * CELL_SIZE - 10, '#60a5fa')
          } else {
            p1Died = true
          }
        }

        // P2 wall collision
        if (pvp.player2Alive && !p2Died) {
          if (p2Head.x < 0 || p2Head.x >= GRID_WIDTH || p2Head.y < 0 || p2Head.y >= GRID_HEIGHT) {
            const hasP2Shield = pvp.player2ActivePowerUps.some(pu => pu.type === 'shield')
            if (hasP2Shield) {
              pvp.player2ActivePowerUps = pvp.player2ActivePowerUps.filter(pu => pu.type !== 'shield')
              if (p2Head.x < 0) p2Head.x = GRID_WIDTH - 1
              else if (p2Head.x >= GRID_WIDTH) p2Head.x = 0
              else if (p2Head.y < 0) p2Head.y = GRID_HEIGHT - 1
              else if (p2Head.y >= GRID_HEIGHT) p2Head.y = 0
              spawnFloatingText('🛡️', p2Head.x * CELL_SIZE + CELL_SIZE / 2, p2Head.y * CELL_SIZE - 10, '#60a5fa')
            } else {
              p2Died = true
            }
          }
        }

        // P1 self collision
        if (!p1Died && gs.snake.some((s) => s.x === p1Head.x && s.y === p1Head.y)) {
          p1Died = true
        }

        // P2 self collision
        if (pvp.player2Alive && !p2Died && pvp.player2Snake.some((s) => s.x === p2Head.x && s.y === p2Head.y)) {
          p2Died = true
        }

        // Tentatively update snakes for cross-collision checks
        if (!p1Died) gs.snake = [p1Head, ...gs.snake]
        if (pvp.player2Alive && !p2Died) pvp.player2Snake = [p2Head, ...pvp.player2Snake]

        // Cross collision: P1 head on P2 body (exclude P2 head at index 0)
        if (!p1Died && !p2Died) {
          const p1OnP2Body = pvp.player2Snake.some((s, i) => i > 0 && s.x === p1Head.x && s.y === p1Head.y)
          if (p1OnP2Body) p1Died = true

          const p2OnP1Body = gs.snake.some((s, i) => i > 0 && s.x === p2Head.x && s.y === p2Head.y)
          if (p2OnP1Body) p2Died = true

          // Head-to-head
          if (p1Head.x === p2Head.x && p1Head.y === p2Head.y) {
            p1Died = true
            p2Died = true
          }
        }

        // Handle deaths
        if (p1Died || p2Died) {
          gs.gameOver = true
          if (p1Died && p2Died) pvp.winner = 'tie'
          else if (p1Died) pvp.winner = 'player2'
          else pvp.winner = 'player1'

          // Spawn death particles
          if (p1Died) {
            const hx = gs.snake[0].x * CELL_SIZE + CELL_SIZE / 2
            const hy = gs.snake[0].y * CELL_SIZE + CELL_SIZE / 2
            spawnParticles(hx, hy, '#ef4444', 20)
          }
          if (p2Died) {
            const hx = pvp.player2Snake[0].x * CELL_SIZE + CELL_SIZE / 2
            const hy = pvp.player2Snake[0].y * CELL_SIZE + CELL_SIZE / 2
            spawnParticles(hx, hy, '#06b6d4', 20)
          }
          playSound(playGameOverSound)
          updateUI()
          draw()
          animFrameRef.current = requestAnimationFrame(gameLoop)
          return
        }

        // --- Food eating ---
        let whoAte: 'p1' | 'p2' | null = null
        const { snake, direction, wordFood } = gs

        if (wordFood) {
          const fx = wordFood.position.x
          const fy = wordFood.position.y

          // Check proximity helper
          const isNear = (hx: number, hy: number) =>
            (hx === fx && hy === fy) ||
            (hx === fx + 1 && hy === fy) ||
            (hx === fx - 1 && hy === fy) ||
            (hx === fx && hy === fy + 1) ||
            (hx === fx && hy === fy - 1)

          // P1 eats food?
          if (isNear(p1Head.x, p1Head.y)) {
            const entry = getWordEntryIncludingCustom(wordFood.word)
            let points = entry ? entry.points : wordFood.word.length * 10
            const rarityConfig = RARITY_CONFIG[wordFood.rarity]
            if (rarityConfig && rarityConfig.pointMultiplier > 1) {
              points += Math.floor(points * (rarityConfig.pointMultiplier - 1))
            }
            if (gs.activePowerUps.some(pu => pu.type === 'double_points')) points *= 2
            const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
            addWord(wordFood.word)
            collectedWordsRef.current.add(wordFood.word)
            gs.score += points
            gs.wordsEaten += 1
            whoAte = 'p1'
            const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            const wy = wordFood.position.y * CELL_SIZE
            spawnFloatingText(`+${points}`, wx, wy, '#4ade80')
            spawnFloatingText(wordFood.word, wx, wy - 22, catColor)
            spawnParticles(wx, wy + CELL_SIZE / 2, catColor, 10)
            playSound(playEatSound)
          } else if (isNear(p2Head.x, p2Head.y)) {
            // P2 eats food?
            const entry = getWordEntryIncludingCustom(wordFood.word)
            let points = entry ? entry.points : wordFood.word.length * 10
            const rarityConfig = RARITY_CONFIG[wordFood.rarity]
            if (rarityConfig && rarityConfig.pointMultiplier > 1) {
              points += Math.floor(points * (rarityConfig.pointMultiplier - 1))
            }
            if (pvp.player2ActivePowerUps.some(pu => pu.type === 'double_points')) points *= 2
            pvp.player2Score += points
            pvp.player2WordsEaten.push(wordFood.word)
            addWord(wordFood.word)
            whoAte = 'p2'
            const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
            const wy = wordFood.position.y * CELL_SIZE
            const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'
            spawnFloatingText(`P2 +${points}`, wx, wy, '#06b6d4')
            spawnFloatingText(wordFood.word, wx, wy - 22, '#22d3ee')
            spawnParticles(wx, wy + CELL_SIZE / 2, '#06b6d4', 10)
            playSound(playEatSound)
          }

          // Remove tail for non-eaters; eater keeps tail (grows)
          if (whoAte === 'p1') {
            pvp.player2Snake.pop()
          } else if (whoAte === 'p2') {
            gs.snake.pop()
          } else {
            gs.snake.pop()
            pvp.player2Snake.pop()
          }
          gs.wordFood = null
          // Spawn new word (food was eaten)
          spawnWord()
        } else {
          gs.snake.pop()
          pvp.player2Snake.pop()
        }

        // Chance to spawn power-up after food eaten
        if (whoAte && !gs.powerUp) {
          if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const puType = getRandomPowerUpType()
            const occupied = new Set([
              ...gs.snake.map(s => `${s.x},${s.y}`),
              ...pvp.player2Snake.map(s => `${s.x},${s.y}`),
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
        }

        // Power-up collection for P1
        if (gs.powerUp && !p1Died) {
          const pu = gs.powerUp
          if (p1Head.x === pu.position.x && p1Head.y === pu.position.y) {
            const config = POWERUP_CONFIG[pu.type]
            if (pu.type === 'shrink') {
              const removeCount = Math.min(3, gs.snake.length - 1)
              gs.snake = gs.snake.slice(0, gs.snake.length - removeCount)
            } else {
              gs.activePowerUps.push({ type: pu.type, expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0 })
            }
            const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
            const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
            spawnFloatingText(config.emoji, px, py - 10, config.color)
            spawnParticles(px, py, config.color, 12)
            playSound(playPowerUpSound)
            gs.powerUp = null
          }
        }

        // Power-up collection for P2
        if (gs.powerUp && pvp.player2Alive && !p2Died) {
          const pu = gs.powerUp
          if (p2Head.x === pu.position.x && p2Head.y === pu.position.y) {
            const config = POWERUP_CONFIG[pu.type]
            if (pu.type === 'shrink') {
              const removeCount = Math.min(3, pvp.player2Snake.length - 1)
              pvp.player2Snake = pvp.player2Snake.slice(0, pvp.player2Snake.length - removeCount)
            } else {
              pvp.player2ActivePowerUps.push({ type: pu.type, expiresAt: config.duration > 0 ? Date.now() + config.duration * 1000 : 0 })
            }
            const px = pu.position.x * CELL_SIZE + CELL_SIZE / 2
            const py = pu.position.y * CELL_SIZE + CELL_SIZE / 2
            spawnFloatingText(`P2 ${config.emoji}`, px, py - 10, config.color)
            spawnParticles(px, py, '#06b6d4', 12)
            playSound(playPowerUpSound)
            gs.powerUp = null
          }
        }

        // Magnet effect — attract food toward the collecting player's head
        if (gs.wordFood) {
          if (gs.activePowerUps.some(pu => pu.type === 'magnet')) {
            const headPos = gs.snake[0]
            const foodPos = gs.wordFood.position
            if (Math.abs(headPos.x - foodPos.x) > 0) foodPos.x += Math.sign(headPos.x - foodPos.x)
            if (Math.abs(headPos.y - foodPos.y) > 0) foodPos.y += Math.sign(headPos.y - foodPos.y)
          } else if (pvp.player2ActivePowerUps.some(pu => pu.type === 'magnet')) {
            const headPos = pvp.player2Snake[0]
            const foodPos = gs.wordFood.position
            if (Math.abs(headPos.x - foodPos.x) > 0) foodPos.x += Math.sign(headPos.x - foodPos.x)
            if (Math.abs(headPos.y - foodPos.y) > 0) foodPos.y += Math.sign(headPos.y - foodPos.y)
          }
        }

        // Speed up over time (shared)
        const settings = DIFFICULTY_SETTINGS[gs.difficulty]
        gs.speed = Math.max(settings.minSpeed, gs.speed - 0.02)

        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }
      // ===== END PvP GAME LOOP =====

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

      // ===== AI BOT MOVEMENT =====
      const aiBot = aiBotRef.current
      if (aiBot && aiBot.alive && gs.gameStarted && !gs.gameOver) {
        // Build obstacles set from player snake + bot snake
        const obstacles = new Set<string>()
        for (const seg of gs.snake) obstacles.add(`${seg.x},${seg.y}`)
        for (const seg of aiBot.snake) obstacles.add(`${seg.x},${seg.y}`)

        // Calculate AI bot direction
        const botDir = calculateAiBotMove(
          aiBot,
          gs.wordFood?.position ?? null,
          gs.snake,
          obstacles,
        )

        // Update AI bot position
        const botResult = updateAiBot(
          aiBot,
          botDir,
          gs.wordFood?.position ?? null,
          gs.wordFood?.word,
        )

        // Check AI bot collision (wall, self, player body)
        const botAlive = checkAiBotCollision(aiBot, gs.snake)

        if (!botAlive) {
          // Bot died — show floating text and particles
          const bhx = aiBot.snake[0].x * CELL_SIZE + CELL_SIZE / 2
          const bhy = aiBot.snake[0].y * CELL_SIZE + CELL_SIZE / 2
          spawnParticles(bhx, bhy, '#f97316', 20)
          spawnFloatingText('🤖 Bot Down!', bhx, bhy - 20, '#f97316')
        } else if (botResult.ateFood) {
          // Bot ate the food — clear it so player can't eat it too
          const bwx = aiBot.snake[0].x * CELL_SIZE + CELL_SIZE / 2
          const bwy = aiBot.snake[0].y * CELL_SIZE
          spawnFloatingText('🤖 +10', bwx, bwy, '#f97316')
          if (botResult.word) {
            spawnFloatingText(botResult.word, bwx, bwy - 22, '#fdba74')
            addWord(botResult.word)
            collectedWordsRef.current.add(botResult.word)
          }
          spawnParticles(bwx, bwy + CELL_SIZE / 2, '#f97316', 10)
          gs.wordFood = null
          spawnWord()
        }
      }
      // ===== END AI BOT MOVEMENT =====

      const handleDeath = () => {
        gs.gameOver = true
        // Stop replay recording and save
        if (isRecording()) {
          try {
            const savedReplay = stopRecording({
              difficulty: gs.difficulty,
              isDailyChallenge: gs.isDailyChallenge,
              weather: gs.weather,
              wordPack: activeWordPack !== 'default' ? activeWordPack : 'classic',
            })
            if (savedReplay) {
              toast({ title: 'Replay Saved', description: `Game recorded (${formatDuration(savedReplay.duration)})`, variant: 'default' })
            }
          } catch { /* ignore */ }
        }
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
            // Check if any newly unlocked achievement unlocks a skin
            const skinMap = getSkinUnlockMap()
            for (const a of newlyUnlocked) {
              const skinUnlock = skinMap[a.id]
              if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
              }
            }
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
            // Check if any milestone unlocks a skin
            const skinMap = getSkinUnlockMap()
            for (const ms of newlyUnlockedMilestones) {
              const milestoneKey = `milestone:${ms.threshold}`
              const skinUnlock = skinMap[milestoneKey]
              if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
              }
            }
            updateUI()
          }
          // Check word pack unlocks on game over
          try {
            const newPacks = checkPackUnlocks()
            if (newPacks.length > 0) {
              setUnlockedPackIds(WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id))
              for (const packId of newPacks) {
                const pack = WORD_PACKS.find(p => p.id === packId)
                if (pack) {
                  setWordPackToast({ name: pack.name, emoji: pack.emoji, description: pack.description })
                  if (wordPackToastTimerRef.current) clearTimeout(wordPackToastTimerRef.current)
                  wordPackToastTimerRef.current = setTimeout(() => setWordPackToast(null), 5000)
                }
              }
            }
          } catch { /* ignore */ }
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

      // Player collides with AI bot body
      if (aiBot && aiBot.alive && aiBot.snake.some((s) => s.x === head.x && s.y === head.y)) {
        const hasShield = gs.activePowerUps.some(pu => pu.type === 'shield')
        if (!hasShield) {
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
          const packEntry = getPackWordEntry(wordFood.word)
          let points = packEntry ? packEntry.points : entry ? entry.points : wordFood.word.length * 10

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

          // ---- Easter egg checking ----
          const eatenWord = wordFood.word
          const triggeredEggs = checkEasterEggs(eatenWord, collectedWordsRef.current)
          if (triggeredEggs.length > 0) {
            for (const egg of triggeredEggs) {
              playSound(playEasterEggSound)

              // Show floating text on canvas
              spawnFloatingText(`🥚 ${egg.message}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, '#fbbf24')

              // Show toast notification
              toast({
                title: `${egg.emoji} Easter Egg Discovered!`,
                description: `${egg.name}: ${egg.description}`,
              })

              // Apply effects
              if (egg.effect === 'rainbow_snake' || egg.effect === 'slow_mo' || egg.effect === 'reverse_controls') {
                const expiresAt = egg.duration ? Date.now() + egg.duration : 0
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== egg.effect)
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: egg.effect, expiresAt }]
                })
                // Clean up display after duration
                if (egg.duration) {
                  setTimeout(() => {
                    setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                  }, egg.duration)
                }
              }

              if (egg.effect === 'confetti_burst') {
                spawnEasterEggConfetti(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 80)
              }

              if (egg.effect === 'color_explosion') {
                spawnEasterEggConfetti(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 120)
                // Also spawn color bursts across the grid
                for (let i = 0; i < 6; i++) {
                  const rx = Math.random() * CANVAS_WIDTH
                  const ry = Math.random() * CANVAS_HEIGHT
                  spawnParticles(rx, ry, `hsl(${Math.random() * 360}, 80%, 60%)`, 10)
                }
              }

              if (egg.effect === 'extra_life') {
                gs.extraLifeAvailable = true
                updateUI()
              }

              if (egg.effect === 'giant_food') {
                // Giant food is handled purely in rendering - set a timed display
                const expiresAt = Date.now() + 10000
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== 'giant_food')
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: 'giant_food' as EasterEggEffect, expiresAt }]
                })
                setTimeout(() => {
                  setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                }, 10000)
              }

              if (egg.effect === 'speed_boost') {
                // Temporarily make the snake faster (reduce speed by 20% for duration)
                const expiresAt = Date.now() + (egg.duration ?? 5000)
                setActiveEasterEggs(prev => {
                  const filtered = prev.filter(e => e.effect !== 'speed_boost')
                  return [...filtered, { id: egg.id, name: egg.name, emoji: egg.emoji, effect: 'speed_boost' as EasterEggEffect, expiresAt }]
                })
                setTimeout(() => {
                  setActiveEasterEggs(prev => prev.filter(e => e.id !== egg.id))
                }, egg.duration ?? 5000)
              }
            }
          }

          // Update in-game progressive difficulty
          const prevLevel = prevInGameDiffLevelRef.current
          const newDifficulty = calculateInGameDifficulty(gs.score, gs.wordsEaten, gs.snake.length, gs.elapsedTime)
          gs.inGameDifficulty = newDifficulty
          if (newDifficulty.level > prevLevel && prevLevel > 0) {
            // Level up! Show notification
            prevInGameDiffLevelRef.current = newDifficulty.level
            spawnFloatingText(`${newDifficulty.emoji} DIFFICULTY UP!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, newDifficulty.color)
            spawnFloatingText(`${newDifficulty.label}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, newDifficulty.glowColor)
            spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, newDifficulty.color, 20)
            spawnParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, newDifficulty.glowColor, 15)
          } else if (prevLevel === 0) {
            prevInGameDiffLevelRef.current = newDifficulty.level
          }

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
              // Check if any newly unlocked achievement unlocks a skin
              const skinMap = getSkinUnlockMap()
              for (const a of newlyUnlocked) {
                const skinUnlock = skinMap[a.id]
                if (skinUnlock && isSkinUnlocked(skinUnlock.skinId)) {
                  enqueueAchievements([{ title: `New Skin Unlocked: ${skinUnlock.skinName}!`, description: `Select it in Settings`, emoji: skinUnlock.skinEmoji }])
                }
              }
            }
            // Check word pack unlocks
            try {
              const newPacks = checkPackUnlocks()
              if (newPacks.length > 0) {
                setUnlockedPackIds(WORD_PACKS.filter(p => isPackUnlocked(p)).map(p => p.id))
                for (const packId of newPacks) {
                  const pack = WORD_PACKS.find(p => p.id === packId)
                  if (pack) {
                    spawnFloatingText(`📦 ${pack.emoji} ${pack.name} Pack Unlocked!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80, pack.color)
                    setWordPackToast({ name: pack.name, emoji: pack.emoji, description: pack.description })
                    if (wordPackToastTimerRef.current) clearTimeout(wordPackToastTimerRef.current)
                    wordPackToastTimerRef.current = setTimeout(() => setWordPackToast(null), 5000)
                  }
                }
              }
            } catch { /* ignore */ }
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

      // Record replay frame (throttled inside recordFrame)
      if (isRecording() && !pvpRef.current) {
        try {
          recordFrame({
            snake: gs.snake.map(s => ({ x: s.x, y: s.y })),
            direction: gs.direction,
            food: gs.wordFood ? { x: gs.wordFood.position.x, y: gs.wordFood.position.y, word: gs.wordFood.word } : null,
            powerUp: gs.powerUp ? { x: gs.powerUp.position.x, y: gs.powerUp.position.y, type: gs.powerUp.type, emoji: POWERUP_CONFIG[gs.powerUp.type].emoji } : null,
            score: gs.score,
            wordsEaten: [...collectedWordsRef.current],
            comboCount: gs.comboCount,
          })
        } catch { /* ignore */ }
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
      const isPvPActive = !!pvpRef.current
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
      // In PvP mode, skip the s/d special shortcuts (they're direction controls for P1)
      if (!isPvPActive) {
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

      // Direction controls
      if (isPvPActive) {
        // PvP: WASD -> Player 1, Arrow Keys -> Player 2
        const p1KeyToDir: Record<string, Direction> = {
          w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN',
          a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT',
        }
        const p2KeyToDir: Record<string, Direction> = {
          ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        }
        const p1Dir = p1KeyToDir[e.key]
        if (p1Dir) {
          e.preventDefault()
          directionQueueRef.current.push(p1Dir)
          if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2)
          return
        }
        const p2Dir = p2KeyToDir[e.key]
        if (p2Dir) {
          e.preventDefault()
          p2DirectionQueueRef.current.push(p2Dir)
          if (p2DirectionQueueRef.current.length > 2) p2DirectionQueueRef.current = p2DirectionQueueRef.current.slice(-2)
          return
        }
      } else {
        // Single-player: both WASD and Arrow keys control the same snake
        const keyToDir: Record<string, Direction> = {
          ArrowUp: 'UP', w: 'UP', W: 'UP',
          ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
          ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
          ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
        }

        // Easter egg: reverse controls (Chaos Mode)
        const reverseMap: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
        }
        const isReversed = hasActiveEffect('reverse_controls')

        let newDir = keyToDir[e.key]
        if (newDir && isReversed) {
          newDir = reverseMap[newDir]
        }
        if (newDir) {
          e.preventDefault()
          directionQueueRef.current.push(newDir)
          if (directionQueueRef.current.length > 2) {
            directionQueueRef.current = directionQueueRef.current.slice(-2)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGame, updateUI, playSound, startPvP, startAiBot])

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

  // === Tutorial Functions ===
  const startTutorial = useCallback(() => {
    // Create tutorial state (don't resume — always start fresh for clarity)
    const state = createTutorialState(false)
    tutorialStateRef.current = state
    tutorialTutorialGameRef.current = true
    tutorialEatWordPendingRef.current = false
    setTutorialActive(true)

    // Start a special slow-paced game (easy difficulty, slow speed)
    const gs = gameStateRef.current
    gs.snake = [
      { x: 5, y: 12 },
      { x: 4, y: 12 },
      { x: 3, y: 12 },
    ]
    gs.direction = 'RIGHT'
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.speed = 220 // Slow speed for tutorial
    gs.wordsEaten = 0
    gs.gameStarted = true
    gs.wordFood = null
    gs.startTime = Date.now()
    gs.elapsedTime = 0
    gs.difficulty = 'easy'
    directionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    collectedWordsRef.current = new Set()
    setLeaderboardRank(0)
    gs.isDailyChallenge = false
    gs.dailyChallengeWords = []
    gs.dailyWordsCollected = []
    gs.dailyTargetScore = 0
    gs.streakMultiplier = 1
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.lastEatenCategory = null
    gs.comboMultiplier = 1
    achievementQueue.clear()
    gs.lastAchievement = null
    gs.lastMilestone = null
    gs.weather = 'clear'
    weatherParticlesRef.current = []
    gs.isSpeedRun = false
    gs.speedRunTimeLeft = 60
    gs.speedRunMaxCombo = 0
    gs.speedRunPowerUpsCollected = 0
    gs.speedRunLongestSnake = gs.snake.length
    gs.wordsByCategory = {}
    gs.inGameDifficulty = null
    prevInGameDiffLevelRef.current = 0

    spawnWord()
    playSound(playStartSound)
    updateUI()
  }, [updateUI, playSound, spawnWord])

  const advanceTutorial = useCallback(() => {
    const ts = tutorialStateRef.current
    if (!ts) return
    const nextStep = ts.currentStep + 1
    if (nextStep >= ts.steps.length) {
      // Tutorial complete
      markTutorialCompleted()
      setTutorialCompleted(true)
      setTutorialActive(false)
      tutorialStateRef.current = null
      tutorialTutorialGameRef.current = false

      // Spawn confetti!
      const confettiColors = ['#60a5fa', '#f59e0b', '#4ade80', '#f472b6', '#a78bfa', '#34d399', '#fbbf24']
      const confetti = tutorialConfettiRef.current
      for (let i = 0; i < 80; i++) {
        confetti.push({
          x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
          y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 6 - 2,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          size: 3 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          life: 1,
        })
      }
      tutorialConfettiActiveRef.current = true
      setTutorialJustCompleted(true)

      // Clear confetti after 3 seconds
      setTimeout(() => {
        tutorialConfettiActiveRef.current = false
        tutorialConfettiRef.current = []
        setTutorialJustCompleted(false)
      }, 3000)

      // End the tutorial game and return to start screen
      const gs = gameStateRef.current
      gs.gameStarted = false
      gs.gameOver = false
      updateUI()
    } else {
      ts.currentStep = nextStep
      saveTutorialProgress(nextStep)

      // If the next step requires eating a word, set pending flag
      const step = ts.steps[nextStep]
      if (step.action === 'eat_word') {
        tutorialEatWordPendingRef.current = true
      } else {
        tutorialEatWordPendingRef.current = false
      }

      // Force game to be unpaused during tutorial
      const gs = gameStateRef.current
      if (gs.paused) {
        gs.paused = false
        updateUI()
      }
    }
  }, [updateUI])

  const endTutorial = useCallback(() => {
    const gs = gameStateRef.current
    gs.gameStarted = false
    gs.gameOver = false
    tutorialStateRef.current = null
    tutorialTutorialGameRef.current = false
    tutorialEatWordPendingRef.current = false
    setTutorialActive(false)
    updateUI()
  }, [updateUI])

  const handleTutorialReset = useCallback(() => {
    resetTutorialData()
    setTutorialCompleted(false)
  }, [])

  // Tutorial keyboard handler
  const handleTutorialKey = useCallback((e: KeyboardEvent) => {
    const ts = tutorialStateRef.current
    if (!ts || !ts.active) return
    const step = ts.steps[ts.currentStep]

    if (e.key === 'Enter') {
      // Advance non-action steps with Enter
      if (!step.action || step.id === 'complete') {
        advanceTutorial()
      }
      return
    }

    if (step.action === 'move_up' && (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')) {
      // The normal game key handler will process the direction. Just advance after a tick.
      setTimeout(() => advanceTutorial(), 300)
    }
  }, [advanceTutorial])

  // Tutorial key listener
  useEffect(() => {
    if (!tutorialActive) return
    window.addEventListener('keydown', handleTutorialKey)
    return () => window.removeEventListener('keydown', handleTutorialKey)
  }, [tutorialActive, handleTutorialKey])

  // Watch for word eating during tutorial
  const prevWordsEatenRef = useRef(0)
  useEffect(() => {
    if (!tutorialActive) {
      prevWordsEatenRef.current = 0
      return
    }
    const gs = gameStateRef.current
    if (tutorialEatWordPendingRef.current && gs.wordsEaten > prevWordsEatenRef.current) {
      tutorialEatWordPendingRef.current = false
      setTimeout(() => advanceTutorial(), 500)
    }
    prevWordsEatenRef.current = gs.wordsEaten
  }, [uiState.wordsEaten, tutorialActive, advanceTutorial])

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

  // Replay playback functions
  const loadAndPlayReplay = useCallback((replay: GameReplay) => {
    const gs = gameStateRef.current
    // Set up game state for replay
    gs.snake = replay.frames[0]?.snake.map(s => ({ x: s.x, y: s.y })) ?? [{ x: 5, y: 12 }, { x: 4, y: 12 }, { x: 3, y: 12 }]
    gs.direction = replay.frames[0]?.direction ?? 'RIGHT'
    gs.gameStarted = true
    gs.gameOver = false
    gs.paused = false
    gs.score = 0
    gs.wordsEaten = 0
    gs.wordFood = null
    gs.powerUp = null
    gs.activePowerUps = []
    gs.comboCount = 0
    gs.comboMultiplier = 1
    gs.weather = replay.weather as GameState['weather']
    weatherParticlesRef.current = []
    pvpRef.current = null
    // Clear tutorial, speed run
    gs.isSpeedRun = false
    gs.isDailyChallenge = false

    setReplayMode(true)
    setReplaySpeed(1)
    setReplayPaused(false)
    setReplayProgress(0)
    setReplayFrame(replay.frames[0] ?? null)
    startPlayback(replay, 1)
    updateUI()
    toast({ title: 'Replay Started', description: `Watching ${replay.difficulty} game — ${replay.finalScore} pts`, variant: 'default' })
  }, [updateUI])

  const exitReplayMode = useCallback(() => {
    stopPlayback()
    setReplayMode(false)
    setReplayPaused(false)
    setReplayProgress(0)
    setReplayFrame(null)
    const gs = gameStateRef.current
    gs.gameStarted = false
    gs.gameOver = false
    gs.paused = false
    updateUI()
  }, [updateUI])

  // Replay playback loop - advance frames
  useEffect(() => {
    if (!replayMode || replayPaused) return
    const interval = setInterval(() => {
      const frame = advancePlayback()
      if (!frame) {
        setReplayMode(false)
        stopPlayback()
        const gs = gameStateRef.current
        gs.gameStarted = false
        updateUI()
        return
      }
      const gs = gameStateRef.current
      gs.snake = frame.snake.map(s => ({ x: s.x, y: s.y }))
      gs.direction = frame.direction as Direction
      gs.score = frame.score
      gs.comboCount = frame.comboCount
      gs.wordsEaten = frame.wordsEaten.length
      if (frame.food) {
        gs.wordFood = { word: frame.food.word, position: { x: frame.food.x, y: frame.food.y }, category: 'nature', rarity: 'common' }
      } else {
        gs.wordFood = null
      }
      if (frame.powerUp) {
        gs.powerUp = { type: frame.powerUp.type as PowerUpType, position: { x: frame.powerUp.x, y: frame.powerUp.y }, spawnTime: Date.now() }
      } else {
        gs.powerUp = null
      }
      setReplayFrame(frame)
      setReplayProgress(getPlaybackProgress())
      updateUI()
    }, 60 / replaySpeed) // Base 60ms per frame, adjusted by speed
    return () => clearInterval(interval)
  }, [replayMode, replayPaused, replaySpeed, updateUI])

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
                    <Badge key={uiState.score} variant="secondary" className="bg-green-900/50 text-green-400 border-green-700 stat-counter-flash score-milestone-glow">
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

              {/* Word Pack Selector - horizontal scrollable pills */}
              {(!uiState.gameStarted || uiState.gameOver) && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">Word Pack:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {/* Default pack */}
                    <button
                      onClick={() => {
                        setActivePack('default')
                        setActiveWordPack('default')
                        playSound(playClickSound)
                      }}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${
                        activeWordPack === 'default'
                          ? 'bg-slate-600/60 text-slate-100 border-slate-400/50 shadow-sm shadow-slate-500/20'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/30 hover:text-slate-200 hover:border-slate-600/50'
                      }`}
                    >
                      <span>🐍</span>
                      <span>Classic</span>
                      <span className="text-[9px] opacity-60">{WORD_ENTRIES.length}</span>
                    </button>
                    {WORD_PACKS.map((pack) => {
                      const unlocked = unlockedPackIds.includes(pack.id)
                      const isActive = activeWordPack === pack.id
                      return (
                        <button
                          key={pack.id}
                          onClick={() => {
                            if (!unlocked) return
                            setActivePack(pack.id)
                            setActiveWordPack(pack.id)
                            playSound(playClickSound)
                          }}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border active:scale-95 ${
                            isActive && unlocked
                              ? 'text-white shadow-sm word-pack-glow'
                              : unlocked
                                ? 'text-slate-300 border-slate-700/30 hover:border-slate-600/50 hover:text-slate-100'
                                : 'text-slate-600 border-slate-700/20 cursor-not-allowed opacity-60'
                          }`}
                          style={isActive && unlocked ? {
                            backgroundColor: `${pack.color}30`,
                            borderColor: `${pack.color}60`,
                            '--pack-glow': `${pack.color}40`,
                            boxShadow: `0 0 12px ${pack.color}20`,
                          } : unlocked ? {
                            backgroundColor: `${pack.color}10`,
                          } : undefined}
                          title={!unlocked ? pack.unlockLabel : `${pack.name}: ${pack.description} (${pack.words.length} words)`}
                        >
                          <span>{pack.emoji}</span>
                          <span>{pack.name}</span>
                          <span className="text-[9px] opacity-60">{pack.words.length}</span>
                          {!unlocked && <Lock className="h-3 w-3 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                  {activeWordPack !== 'default' && (() => {
                    const activePack = WORD_PACKS.find(p => p.id === activeWordPack)
                    if (!activePack) return null
                    return (
                      <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r border border-slate-700/30" style={{ backgroundImage: `linear-gradient(to right, ${activePack.color}08, transparent)` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{activePack.emoji}</span>
                          <span className="text-xs text-slate-300 font-medium">{activePack.name}</span>
                          <span className="text-[10px] text-slate-500">{activePack.description}</span>
                        </div>
                      </div>
                    )
                  })()}
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
                    {getAllSkins().map((s) => {
                      const locked = !isSkinUnlocked(s.id)
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (locked) return
                            setActiveSkin(s.id)
                            gameStateRef.current.activeSkin = s.id
                            saveSnakeSkin(s.id)
                            setSkinBounce(true)
                            setTimeout(() => setSkinBounce(false), 400)
                            updateUI()
                          }}
                          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 border-2 ${
                            locked
                              ? 'opacity-40 pointer-events-none border-slate-700/30'
                              : activeSkin === s.id
                                ? 'border-white scale-110 shadow-lg active:scale-95'
                                : 'border-slate-700/50 hover:border-slate-500/60 active:scale-95'
                          } ${!locked && skinBounce && activeSkin === s.id ? 'skin-select-bounce' : ''}`}
                          style={{
                            backgroundColor: s.headColor + '30',
                            boxShadow: !locked && activeSkin === s.id ? `0 0 12px ${s.glowColor}40` : undefined,
                          }}
                          title={locked ? s.unlockLabel ?? 'Locked' : `${s.name}: ${s.description}`}
                        >
                          {s.emoji}
                        </button>
                      )
                    })}
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
              <div className={`relative rounded-lg overflow-hidden ring-1 ring-slate-600/50 ring-offset-1 ring-offset-slate-900 shadow-lg shadow-slate-950/50 canvas-glow-ring ${uiState.gameOver ? 'game-over-shake' : ''} ${(!uiState.gameStarted || uiState.gameOver) ? 'preview-snake-glow' : ''} ${hasActiveEffect('reverse_controls') && uiState.gameStarted && !uiState.gameOver ? 'reverse-controls-indicator ring-2' : ''}`}>
                <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-green-500/10 pointer-events-none" />
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full h-auto" />
              </div>

              {/* Tutorial overlay panel */}
              {tutorialActive && tutorialStateRef.current && (() => {
                const step = tutorialStateRef.current.steps[tutorialStateRef.current.currentStep]
                if (!step) return null
                return (
                  <div className="mt-3 rounded-lg border border-blue-500/40 bg-gradient-to-r from-blue-950/80 to-slate-900/90 backdrop-blur-sm p-4 shadow-lg shadow-blue-900/20 animate-in fade-in slide-in-from-bottom-2 duration-300 tutorial-spotlight">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-2xl">{step.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-blue-300">{step.title}</h3>
                          <span className="text-[10px] text-blue-400/50 font-mono shrink-0">
                            {tutorialStateRef.current.currentStep + 1}/{tutorialStateRef.current.steps.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                        {step.action && (
                          <p className="text-[10px] text-blue-400/70 mt-1.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            {step.action === 'move_up' && 'Press ↑ or W to try it!'}
                            {step.action === 'eat_word' && 'Move your snake to the glowing word!'}
                          </p>
                        )}
                        {!step.action && (
                          <button
                            onClick={advanceTutorial}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all"
                          >
                            Next <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Step progress dots */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {tutorialStateRef.current.steps.map((s, i) => (
                        <div
                          key={s.id}
                          className={`h-1 rounded-full transition-all duration-300 tutorial-step-progress ${
                            i < tutorialStateRef.current.currentStep
                              ? 'w-4 bg-blue-500'
                              : i === tutorialStateRef.current.currentStep
                              ? 'w-4 bg-blue-400 animate-pulse'
                              : 'w-2 bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Start / Daily buttons - side by side on larger screens */}
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {!uiState.gameStarted && (
                  <>
                    <Button onClick={() => resetGame()} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30 active:scale-95 transition-transform">
                      <Play className="h-4 w-4 mr-1" /> Start Game
                    </Button>
                    <Button
                      onClick={() => { playSound(playClickSound); startPvP() }}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/30 active:scale-95 transition-transform"
                      title="Two snakes, one arena. Keyboard-only (WASD + Arrows)"
                    >
                      ⚔️ PvP Battle
                    </Button>
                    <Button
                      onClick={() => { playSound(playClickSound); startAiBot() }}
                      className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/30 active:scale-95 transition-transform"
                      title="Challenge an AI-controlled bot opponent"
                    >
                      <Bot className="h-4 w-4 mr-1" /> vs AI Bot 🤖
                    </Button>
                    {!tutorialCompleted && (
                      <Button
                        onClick={startTutorial}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30 active:scale-95 transition-transform"
                      >
                        <GraduationCap className="h-4 w-4 mr-1" /> Tutorial
                      </Button>
                    )}
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
                      onClick={() => setShowWordBook(true)}
                      variant="outline"
                      className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 active:scale-95 transition-transform"
                      title="View your word collection"
                    >
                      📖 Word Book
                    </Button>
                    <Button
                      onClick={() => resetGame(false, true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-transform"
                      title="60-second timed challenge"
                    >
                      <Gauge className="h-4 w-4 mr-1" /> Speed Run
                    </Button>
                    <Button
                      onClick={() => { setReplayList(getReplays()); setShowReplayDialog(true) }}
                      variant="outline"
                      className="border-purple-700/50 text-purple-400 hover:bg-purple-900/20 active:scale-95 transition-transform"
                    >
                      <Film className="h-4 w-4 mr-1" /> Replays
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 active:scale-95 transition-transform"
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                    {tutorialCompleted && (
                      <button
                        onClick={() => { handleTutorialReset(); startTutorial() }}
                        className="text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors underline underline-offset-2"
                      >
                        Replay Tutorial
                      </button>
                    )}
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

              {/* PvP controls legend */}
              {!uiState.gameStarted && (
                <div className="flex items-center justify-center gap-4 mt-1 text-[11px] text-slate-600">
                  <span className="text-cyan-500">⚔️ PvP:</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-green-400 text-[10px] font-mono">WASD</kbd> P1</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px] font-mono">↑↓←→</kbd> P2</span>
                  <span className="hidden sm:inline text-slate-700">Keyboard only</span>
                </div>
              )}

              {/* On-screen D-pad for mobile - glass-morphism style */}
              <div id="mobile-dpad" className="flex justify-center mt-3 lg:hidden">
                <div className="grid grid-cols-3 gap-1.5 w-36">
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('UP') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >↑</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('LEFT') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >←</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); const gs = gameStateRef.current; if (!gs.gameStarted || gs.gameOver) { resetGame(gs.isDailyChallenge) } else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() } }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-400 text-[10px] select-none transition-transform"
                  >⏸</button>
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('RIGHT') }}
                    className="glass-dpad h-12 rounded-xl flex items-center justify-center text-slate-300 text-lg select-none transition-transform"
                  >→</button>
                  <div />
                  <button
                    onTouchStart={(e) => { e.preventDefault(); pushDirection('DOWN') }}
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
                    <span className="text-amber-400/60 ml-1">({uiState.comboCount}× {getCategoryInfo(uiState.lastEatenCategory)?.label ?? PACK_CATEGORY_INFO[uiState.lastEatenCategory]?.label ?? uiState.lastEatenCategory})</span>
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

            {/* Active easter egg effects indicator */}
            {activeEasterEggs.length > 0 && uiState.gameStarted && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {activeEasterEggs.map((ee) => {
                  const effectColors: Record<string, { bg: string; border: string; text: string }> = {
                    rainbow_snake: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
                    giant_food: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
                    reverse_controls: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
                    slow_mo: { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.4)', text: '#38bdf8' },
                    speed_boost: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' },
                    confetti_burst: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)', text: '#ec4899' },
                    extra_life: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' },
                    color_explosion: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
                  }
                  const colors = effectColors[ee.effect] ?? effectColors.rainbow_snake
                  const remaining = ee.expiresAt > 0 ? Math.max(0, Math.ceil((ee.expiresAt - Date.now()) / 1000)) : 0
                  return (
                    <div key={ee.id} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border animate-pulse easter-egg-reveal"
                      style={{ borderColor: colors.border, backgroundColor: colors.bg, color: colors.text }}>
                      <span>🥚</span>
                      <span className="font-medium">{ee.name}</span>
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
                      const packWord = getPackWordEntry(word)
                      const catColor = entry ? CATEGORY_COLORS[entry.category] : packWord ? (PACK_CATEGORY_INFO[packWord.category]?.color ?? '#94a3b8') : '#94a3b8'
                      const catInfo = entry ? getCategoryInfo(entry.category) : packWord ? getPackCategoryInfo(packWord.category) : null
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
                                    <span className={`text-[8px] ${rarity === 'legendary' ? 'rainbow-text-flow font-bold opacity-100' : 'opacity-70'}`} style={{ color: rarity !== 'legendary' ? rConf.color : undefined }}>{rConf.emoji} {rarity === 'legendary' ? 'LEGENDARY' : ''}</span>
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm egg-badge-shimmer">
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

      {/* Word Pack Unlocked toast */}
      {wordPackToast && (
        <div className="fixed top-52 right-4 z-[92] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-900/90 border border-emerald-600/50 shadow-xl shadow-emerald-900/30 backdrop-blur-sm pack-unlock-burst">
            <span className="text-2xl">{wordPackToast.emoji}</span>
            <div>
              <p className="text-emerald-300 text-sm font-bold">
                New Word Pack Unlocked!
              </p>
              <p className="text-emerald-400/80 text-xs">{wordPackToast.name} — {wordPackToast.description}</p>
            </div>
            <Package className="h-4 w-4 text-emerald-500 sparkle-spin" />
          </div>
        </div>
      )}

      {/* Settings Panel Modal */}
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        currentSkin={activeSkin}
        onSkinChange={(skin) => { if (!isSkinUnlocked(skin.id)) return; gameStateRef.current.activeSkin = skin.id; setActiveSkin(skin); saveSnakeSkin(skin.id) }}
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

      {/* Replay Dialog */}
      {showReplayDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-700/40 rounded-xl p-5 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <Film className="h-5 w-5" /> Game Replays
              </h3>
              <button onClick={() => setShowReplayDialog(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            {replayList.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 animate-float">🎬</div>
                <p className="text-slate-400 text-sm">No replays yet</p>
                <p className="text-slate-500 text-xs mt-1">Play a game to record it automatically!</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 -mx-1">
                  <div className="space-y-2 px-1">
                    {replayList.map((replay) => (
                      <div key={replay.id} className="replay-card-enter bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 hover:border-purple-600/40 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{formatDate(replay.date)}</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              replay.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                              replay.difficulty === 'hard' ? 'bg-red-900/50 text-red-400' :
                              'bg-amber-900/50 text-amber-400'
                            }`}>{replay.difficulty}</span>
                            {replay.isDailyChallenge && <span className="text-[10px] text-amber-400">📅</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold text-lg">{replay.finalScore}</span>
                            <span className="text-slate-400 text-xs ml-2">pts</span>
                            <span className="text-slate-500 text-xs ml-2">{replay.wordsCollected.length}w</span>
                            <span className="text-slate-500 text-xs ml-1">{formatDuration(replay.duration)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setShowReplayDialog(false)
                                loadAndPlayReplay(replay)
                              }}
                              className="p-1.5 bg-purple-600/80 hover:bg-purple-500 rounded-md transition-colors"
                              title="Watch replay"
                            >
                              <Play className="h-3.5 w-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => {
                                deleteReplay(replay.id)
                                setReplayList(getReplays())
                              }}
                              className="p-1.5 bg-slate-700/80 hover:bg-red-900/60 rounded-md transition-colors"
                              title="Delete replay"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        {replay.maxCombo > 1 && (
                          <span className="text-[10px] text-orange-400/70">🔥 Max combo: ×{replay.maxCombo}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{replayList.length}/10 slots</span>
                  {replayList.length > 0 && (
                    <button
                      onClick={() => { clearAllReplays(); setReplayList([]) }}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Replay Mode Overlay */}
      {replayMode && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <div className="bg-red-900/90 border border-red-600/60 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg replay-badge-glow">
            <span className="text-red-300 font-bold text-xs tracking-wider">REPLAY</span>
            <div className="w-px h-4 bg-red-700/50" />
            <button onClick={() => setReplaySpeed(s => Math.max(0.5, s - 0.5))} className="text-white/70 hover:text-white transition-colors p-0.5">
              <SkipBack className="h-3 w-3" />
            </button>
            <span className="text-white text-xs font-mono w-10 text-center">{replaySpeed}x</span>
            <button onClick={() => setReplaySpeed(s => Math.min(4, s + 0.5))} className="text-white/70 hover:text-white transition-colors p-0.5">
              <SkipForward className="h-3 w-3" />
            </button>
            <div className="w-px h-4 bg-red-700/50" />
            <button onClick={() => setReplayPaused(p => !p)} className="text-white/70 hover:text-white transition-colors p-0.5">
              {replayPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
            <button
              onClick={exitReplayMode}
              className="text-red-400 hover:text-red-300 transition-colors text-xs font-medium ml-1"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Replay Progress Bar */}
      {replayMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-sm">
          <div className="h-1 bg-slate-700 w-full">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-200 relative overflow-hidden"
              style={{ width: `${replayProgress * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent replay-progress-shine" />
            </div>
          </div>
        </div>
      )}

      {/* Word Book Overlay */}
      <WordBook isOpen={showWordBook} onClose={() => setShowWordBook(false)} />
    </div>
  )
}
