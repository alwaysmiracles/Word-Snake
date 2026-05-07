'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getRandomWord, getWordEntry, getCategoryInfo, CATEGORY_COLORS, type WordCategory } from '@/lib/word-pool'
import { playEatSound, playGameOverSound, playStartSound, playPauseSound, playClickSound } from '@/lib/sounds'
import { checkAchievements, type AchievementStats } from '@/lib/achievements'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Play,
  RotateCcw,
  Pause,
  Trophy,
  ChevronRight,
  Zap,
  Timer,
  Volume2,
  VolumeX,
  Clock,
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
  activeCategory: WordCategory | 'all'
  lastAchievement: { title: string; description: string; emoji: string } | null
}

const DIFFICULTY_SETTINGS = {
  easy: { speed: 180, speedInc: 1, minSpeed: 90, label: 'Easy' },
  medium: { speed: 140, speedInc: 2, minSpeed: 65, label: 'Medium' },
  hard: { speed: 100, speedInc: 3, minSpeed: 45, label: 'Hard' },
}


export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addWord, getWordList, getTotalCount } = useWordStore()
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('word-snake-highscore')
      return stored ? parseInt(stored, 10) : 0
    }
    return 0
  })

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
    activeCategory: 'all',
    lastAchievement: null,
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())
  const floatingTextsRef = useRef<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    activeCategory: 'all' as WordCategory | 'all',
    lastAchievement: null as { title: string; description: string; emoji: string } | null,
  })

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
      activeCategory: gs.activeCategory,
      lastAchievement: gs.lastAchievement ?? null,
    })
  }, [])

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
    const collected = Array.from(collectedWordsRef.current)
    const word = getRandomWord(collected)
    const entry = getWordEntry(word)
    const category = entry?.category ?? 'nature'

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

    gs.wordFood = { word, position: pos, spawnTime: Date.now(), category }
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

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw subtle grid dots
    ctx.fillStyle = '#1e293b'
    for (let x = 0; x <= GRID_WIDTH; x++) {
      for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath()
        ctx.arc(x * CELL_SIZE, y * CELL_SIZE, 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw border glow
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0)
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)')
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2)

    // Draw snake body trail (faint glow behind snake)
    if (snake.length > 1) {
      ctx.globalAlpha = 0.04
      ctx.fillStyle = '#22c55e'
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

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 12
        ctx.fillStyle = '#4ade80'
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
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#0f172a'
        ctx.beginPath(); ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2); ctx.fill()
      } else {
        // Body
        const ratio = 1 - index / snake.length
        const green = Math.floor(160 + ratio * 95)
        const alpha = 0.6 + ratio * 0.4
        ctx.fillStyle = `rgba(34, ${green}, 80, ${alpha})`

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
    })

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

      // Text
      ctx.fillStyle = catColor
      ctx.font = `bold ${11 * pulse}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, boxX + boxWidth / 2 + 3, boxY + boxHeight / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
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

    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
      lineGrad.addColorStop(0, 'rgba(239, 68, 68, 0)')
      lineGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)')
      lineGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')

      ctx.strokeStyle = lineGrad; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 70); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 70); ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 40px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30)

      ctx.fillStyle = '#94a3b8'; ctx.font = '18px sans-serif'
      ctx.fillText(`Score: ${gs.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10)

      ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'
      ctx.fillText(`${gs.wordsEaten} words collected  •  ${formatTime(gs.elapsedTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35)

      ctx.strokeStyle = lineGrad
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 55); ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 55); ctx.stroke()

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80)
      ctx.textAlign = 'start'
    }

    // Start screen
    if (!gameStarted) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 20
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 38px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WORD SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60)
      ctx.shadowBlur = 0

      ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'
      ctx.fillText('Eat words, collect them, make poetry', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 25)

      // Category legend
      const categories: WordCategory[] = ['nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action']
      const cols = 4
      const startY = CANVAS_HEIGHT / 2 + 5
      const rowH = 18
      const colW = 140
      categories.forEach((cat, i) => {
        const info = getCategoryInfo(cat)
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = CANVAS_WIDTH / 2 - (cols * colW) / 2 + col * colW + 10
        const y = startY + row * rowH
        ctx.fillStyle = CATEGORY_COLORS[cat]
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(info.label, x + 8, y + 4)
      })

      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'
      ctx.fillText('Arrow Keys / WASD  •  Space to start  •  Swipe on mobile', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 75)

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`; ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Press Space or click to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 105)
      ctx.textAlign = 'start'
    }

    // Pause overlay
    if (paused && gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
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
  }, [])

  const resetGame = useCallback(() => {
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
    spawnWord()
    playSound(playStartSound)
    // Track games played
    try {
      const games = parseInt(localStorage.getItem('word-snake-games') ?? '0', 10) + 1
      localStorage.setItem('word-snake-games', String(games))
    } catch { /* ignore */ }
    updateUI()
  }, [spawnWord, updateUI, playSound])

  // Timer interval
  useEffect(() => {
    const tick = () => {
      const gs = gameStateRef.current
      if (gs.gameStarted && !gs.gameOver && !gs.paused) {
        gs.elapsedTime = Date.now() - gs.startTime
        updateUI()
      }
    }
    timerIntervalRef.current = setInterval(tick, 200)
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [updateUI])

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const gs = gameStateRef.current

      if (!gs.gameStarted || gs.gameOver || gs.paused) {
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      if (timestamp - lastRenderRef.current < gs.speed) {
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
        setHighScore((prev) => Math.max(prev, gs.score))
        const hx = snake[0].x * CELL_SIZE + CELL_SIZE / 2
        const hy = snake[0].y * CELL_SIZE + CELL_SIZE / 2
        spawnParticles(hx, hy, '#ef4444', 20)
        playSound(playGameOverSound)
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
            const first = newlyUnlocked[0]
            gs.lastAchievement = { title: first.title, description: first.description, emoji: first.emoji }
          }
        } catch { /* ignore */ }
        updateUI()
      }

      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        handleDeath()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        handleDeath()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
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
          const entry = getWordEntry(wordFood.word)
          const points = entry ? entry.points : wordFood.word.length * 10
          const catColor = CATEGORY_COLORS[wordFood.category] ?? '#f59e0b'

          addWord(wordFood.word)
          collectedWordsRef.current.add(wordFood.word)
          gs.score += points
          gs.speed = Math.max(settings.minSpeed, gs.speed - settings.speedInc)
          gs.wordsEaten += 1
          gs.wordFood = null

          const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
          const wy = wordFood.position.y * CELL_SIZE
          spawnFloatingText(`+${points}`, wx, wy, '#4ade80')
          spawnFloatingText(wordFood.word, wx, wy - 22, catColor)
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
              const first = newlyUnlocked[0]
              gs.lastAchievement = { title: first.title, description: first.description, emoji: first.emoji }
              // Show floating achievement text on canvas
              spawnFloatingText(`🏆 ${first.title}`, wx, wy - 44, '#fbbf24')
            }
          } catch { /* ignore */ }

          spawnWord()
        } else {
          newSnake.pop()
        }
      } else {
        newSnake.pop()
      }

      gs.snake = newSnake
      updateUI()
      draw()
      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [draw, addWord, spawnWord, updateUI, spawnFloatingText, spawnParticles, playSound])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current
      if (e.key === ' ') {
        e.preventDefault()
        if (gs.gameOver) { resetGame() }
        else if (!gs.gameStarted) { resetGame() }
        else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }
        return
      }
      if (e.key === 'Escape') { gs.paused = !gs.paused; playSound(playPauseSound); updateUI(); return }
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

  // Touch controls
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
        if (!gs.gameStarted || gs.gameOver) { resetGame() }
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

  // Canvas click to start
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleClick = () => {
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver) resetGame()
    }
    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [resetGame])

  const wordList = getWordList()
  const totalCount = getTotalCount()

  const changeDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return
    gs.difficulty = diff
    playSound(playClickSound)
    updateUI()
  }

  const toggleSound = () => {
    const gs = gameStateRef.current
    gs.soundEnabled = !gs.soundEnabled
    updateUI()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto">
      {/* Game Area */}
      <div className="flex-1 min-w-0">
        <Card className="overflow-hidden border-slate-700 bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-400 flex items-center gap-2">
                <span className="text-2xl">🐍</span> Word Snake
              </CardTitle>
              <div className="flex items-center gap-2">
                {uiState.gameStarted && !uiState.gameOver && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{formatTime(uiState.elapsedTime)}</span>
                  </div>
                )}
                {highScore > 0 && (
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>Best: {highScore}</span>
                  </div>
                )}
                <Badge variant="secondary" className="bg-green-900/50 text-green-400 border-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  {uiState.score}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                  onClick={toggleSound}
                  title={uiState.soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
                >
                  {uiState.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {/* Difficulty selector */}
            {(!uiState.gameStarted || uiState.gameOver) && (
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">Difficulty:</span>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => changeDifficulty(diff)}
                    className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                      uiState.difficulty === diff
                        ? diff === 'easy'
                          ? 'bg-green-900/60 text-green-400 border border-green-700/50'
                          : diff === 'medium'
                          ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50'
                          : 'bg-red-900/60 text-red-400 border border-red-700/50'
                        : 'bg-slate-800/60 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                    }`}
                  >
                    {DIFFICULTY_SETTINGS[diff].label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative rounded-lg overflow-hidden border border-slate-700/80 shadow-lg shadow-slate-950/50">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block w-full h-auto" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              {!uiState.gameStarted && (
                <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30">
                  <Play className="h-4 w-4 mr-1" /> Start Game
                </Button>
              )}
              {uiState.gameStarted && !uiState.gameOver && (
                <Button onClick={() => { const gs = gameStateRef.current; gs.paused = !gs.paused; playSound(playPauseSound); updateUI() }} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  {uiState.paused ? <><Play className="h-4 w-4 mr-1" /> Resume</> : <><Pause className="h-4 w-4 mr-1" /> Pause</>}
                </Button>
              )}
              {uiState.gameOver && (
                <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30">
                  <RotateCcw className="h-4 w-4 mr-1" /> Play Again
                </Button>
              )}
            </div>

            {/* Mobile D-pad */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
                / WASD
              </span>
              <span>Space - Start/Pause</span>
              <span className="hidden sm:inline">Swipe on mobile</span>
            </div>

            {/* On-screen D-pad for mobile */}
            <div className="flex justify-center mt-3 lg:hidden">
              <div className="grid grid-cols-3 gap-1.5 w-36">
                <div />
                <button
                  onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('UP'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                  className="h-12 rounded-lg bg-slate-800 border border-slate-600 active:bg-slate-700 flex items-center justify-center text-slate-300 text-lg select-none"
                >↑</button>
                <div />
                <button
                  onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('LEFT'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                  className="h-12 rounded-lg bg-slate-800 border border-slate-600 active:bg-slate-700 flex items-center justify-center text-slate-300 text-lg select-none"
                >←</button>
                <button
                  onTouchStart={(e) => { e.preventDefault(); const gs = gameStateRef.current; if (!gs.gameStarted || gs.gameOver) { resetGame() } else { gs.paused = !gs.paused; playSound(playPauseSound); updateUI() } }}
                  className="h-12 rounded-lg bg-slate-800 border border-slate-600 active:bg-slate-700 flex items-center justify-center text-slate-400 text-[10px] select-none"
                >⏸</button>
                <button
                  onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('RIGHT'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                  className="h-12 rounded-lg bg-slate-800 border border-slate-600 active:bg-slate-700 flex items-center justify-center text-slate-300 text-lg select-none"
                >→</button>
                <div />
                <button
                  onTouchStart={(e) => { e.preventDefault(); directionQueueRef.current.push('DOWN'); if (directionQueueRef.current.length > 2) directionQueueRef.current = directionQueueRef.current.slice(-2) }}
                  className="h-12 rounded-lg bg-slate-800 border border-slate-600 active:bg-slate-700 flex items-center justify-center text-slate-300 text-lg select-none"
                >↓</button>
                <div />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Collection Sidebar */}
      <div className="w-full lg:w-72 shrink-0">
        <Card className="border-slate-700 bg-slate-900 h-full">
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
            {/* Stats row */}
            {uiState.gameStarted && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="px-2 py-1.5 rounded-md bg-green-900/20 border border-green-800/30 text-center">
                  <div className="text-green-400 text-xs font-bold">{uiState.wordsEaten}</div>
                  <div className="text-green-600 text-[9px] uppercase tracking-wider">Words</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-purple-900/20 border border-purple-800/30 text-center">
                  <div className="text-purple-400 text-xs font-bold">{uiState.score}</div>
                  <div className="text-purple-600 text-[9px] uppercase tracking-wider">Score</div>
                </div>
                <div className="px-2 py-1.5 rounded-md bg-cyan-900/20 border border-cyan-800/30 text-center">
                  <div className="text-cyan-400 text-xs font-bold">{formatTime(uiState.elapsedTime)}</div>
                  <div className="text-cyan-600 text-[9px] uppercase tracking-wider">Time</div>
                </div>
              </div>
            )}

            {wordList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-sm">No words collected yet</p>
                <p className="text-xs mt-1">Play the game to collect words!</p>
              </div>
            ) : (
              <ScrollArea className="h-[340px] lg:h-[400px]">
                <div className="space-y-1 pr-2">
                  {wordList.map(({ word, count }) => {
                    const entry = getWordEntry(word)
                    const catColor = entry ? CATEGORY_COLORS[entry.category] : '#94a3b8'
                    const catInfo = entry ? getCategoryInfo(entry.category) : null
                    return (
                      <div
                        key={word}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200"
                      >
                        <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                            title={catInfo?.label ?? ''}
                          />
                          {word}
                        </span>
                        <div className="flex items-center gap-1.5">
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
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement toast */}
      {uiState.lastAchievement && (
        <div className="fixed top-20 right-4 z-[90] animate-in slide-in-from-right-5 fade-in duration-500">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-900/90 border border-amber-600/50 shadow-xl shadow-amber-900/30 backdrop-blur-sm">
            <span className="text-2xl">{uiState.lastAchievement.emoji}</span>
            <div>
              <p className="text-amber-300 text-sm font-bold">{uiState.lastAchievement.title}</p>
              <p className="text-amber-400/80 text-xs">{uiState.lastAchievement.description}</p>
            </div>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
        </div>
      )}
    </div>
  )
}
