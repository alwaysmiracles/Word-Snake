'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWordStore } from '@/lib/word-store'
import { getRandomWord } from '@/lib/word-pool'
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
  spawnTime: number // for pulse animation
}

interface FloatingText {
  text: string
  x: number
  y: number
  opacity: number
  vy: number
  color: string
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
}

const DIFFICULTY_SETTINGS = {
  easy: { speed: 180, speedInc: 1, minSpeed: 90, label: 'Easy' },
  medium: { speed: 140, speedInc: 2, minSpeed: 65, label: 'Medium' },
  hard: { speed: 100, speedInc: 3, minSpeed: 45, label: 'Hard' },
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addWord, getWordList, getTotalCount } = useWordStore()
  const [highScore, setHighScore] = useState(0)

  // Use refs for all game state to avoid stale closures
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
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())
  const floatingTextsRef = useRef<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Reactive state for UI
  const [uiState, setUiState] = useState({
    score: 0,
    gameStarted: false,
    gameOver: false,
    paused: false,
    wordFood: null as WordFood | null,
    wordsEaten: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
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
    })
  }, [])

  const spawnFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      text,
      x,
      y,
      opacity: 1,
      vy: -1.5,
      color,
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

    // Keep word away from edges to avoid overflow
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

    gs.wordFood = { word, position: pos, spawnTime: Date.now() }
  }, [])

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

    // Draw subtle grid dots instead of lines for cleaner look
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

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head - brighter green with glow
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

        // Draw eyes on the head
        ctx.fillStyle = '#0f172a'
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
        // Eye whites
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(eye1x, eye1y, eyeSize + 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(eye2x, eye2y, eyeSize + 1, 0, Math.PI * 2)
        ctx.fill()
        // Pupils
        ctx.fillStyle = '#0f172a'
        ctx.beginPath()
        ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Snake body - gradient green with connecting segments
        const ratio = 1 - index / snake.length
        const green = Math.floor(160 + ratio * 95)
        const alpha = 0.6 + ratio * 0.4
        ctx.fillStyle = `rgba(34, ${green}, 80, ${alpha})`

        // Connect to previous segment
        const prev = snake[index - 1]
        const dx = prev.x - segment.x
        const dy = prev.y - segment.y

        // Draw connecting piece
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

    // Draw word food with pulse animation
    if (wordFood) {
      const { word, position, spawnTime } = wordFood
      const elapsed = Date.now() - spawnTime
      const pulse = 1 + Math.sin(elapsed / 300) * 0.08

      ctx.font = 'bold 11px monospace'
      const wordWidth = ctx.measureText(word).width
      const padding = 8
      const boxWidth = (wordWidth + padding * 2) * pulse
      const boxHeight = (CELL_SIZE + padding) * pulse
      const boxX = position.x * CELL_SIZE + CELL_SIZE / 2 - boxWidth / 2
      const boxY = position.y * CELL_SIZE + CELL_SIZE / 2 - boxHeight / 2

      // Glow effect
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 16 + Math.sin(elapsed / 200) * 6

      // Background
      const bgGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight)
      bgGrad.addColorStop(0, '#451a03')
      bgGrad.addColorStop(1, '#78350f')
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.fill()
      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.6 + Math.sin(elapsed / 250) * 0.3})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8)
      ctx.stroke()

      // Inner highlight
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4, 6)
      ctx.stroke()

      // Text
      ctx.fillStyle = '#fbbf24'
      ctx.font = `bold ${11 * pulse}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, boxX + boxWidth / 2, boxY + boxHeight / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw floating texts
    const ft = floatingTextsRef.current
    for (let i = ft.length - 1; i >= 0; i--) {
      const f = ft[i]
      f.y += f.vy
      f.opacity -= 0.015
      if (f.opacity <= 0) {
        ft.splice(i, 1)
        continue
      }
      ctx.globalAlpha = f.opacity
      ctx.fillStyle = f.color
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(f.text, f.x, f.y)
      ctx.textAlign = 'start'
      ctx.globalAlpha = 1
    }

    // Draw particles
    const pts = particlesRef.current
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.025
      p.vy += 0.03 // gravity
      if (p.life <= 0) {
        pts.splice(i, 1)
        continue
      }
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Draw game over overlay with blur effect
    if (gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Decorative line
      const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0)
      lineGrad.addColorStop(0, 'rgba(239, 68, 68, 0)')
      lineGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)')
      lineGrad.addColorStop(1, 'rgba(239, 68, 68, 0)')
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 - 55)
      ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 - 55)
      ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 40px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '18px sans-serif'
      ctx.fillText(`Score: ${gs.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15)

      ctx.fillStyle = '#64748b'
      ctx.font = '14px sans-serif'
      ctx.fillText(`${gs.wordsEaten} words collected`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40)

      // Decorative line
      ctx.strokeStyle = lineGrad
      ctx.beginPath()
      ctx.moveTo(CANVAS_WIDTH * 0.15, CANVAS_HEIGHT / 2 + 58)
      ctx.lineTo(CANVAS_WIDTH * 0.85, CANVAS_HEIGHT / 2 + 58)
      ctx.stroke()

      ctx.fillStyle = '#4ade80'
      ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or click to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80)
      ctx.textAlign = 'start'
    }

    // Draw start screen
    if (!gameStarted) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Title with glow
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 20
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 38px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WORD SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)
      ctx.shadowBlur = 0

      // Subtitle
      ctx.fillStyle = '#94a3b8'
      ctx.font = '15px sans-serif'
      ctx.fillText('Eat words, collect them, make poetry', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15)

      // Instructions
      ctx.fillStyle = '#64748b'
      ctx.font = '13px sans-serif'
      ctx.fillText('Arrow Keys / WASD to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25)
      ctx.fillText('Space to start / pause', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45)
      ctx.fillText('Swipe on mobile', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65)

      // Pulsing start prompt
      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Press Space or click to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100)
      ctx.textAlign = 'start'
    }

    // Draw pause overlay
    if (paused && gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 15
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10)
      ctx.shadowBlur = 0

      const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.3
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`
      ctx.font = '14px sans-serif'
      ctx.fillText('Press Space or Esc to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25)
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
    directionQueueRef.current = []
    floatingTextsRef.current = []
    particlesRef.current = []
    spawnWord()
    updateUI()
  }, [spawnWord, updateUI])

  // Game loop using ref-based approach
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

      // Process direction queue
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

      // Calculate new head position
      const head = { ...snake[0] }
      switch (direction) {
        case 'UP': head.y -= 1; break
        case 'DOWN': head.y += 1; break
        case 'LEFT': head.x -= 1; break
        case 'RIGHT': head.x += 1; break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        gs.gameOver = true
        setHighScore((prev) => Math.max(prev, gs.score))
        // Death particles
        const hx = snake[0].x * CELL_SIZE + CELL_SIZE / 2
        const hy = snake[0].y * CELL_SIZE + CELL_SIZE / 2
        spawnParticles(hx, hy, '#ef4444', 20)
        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Check self collision
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        gs.gameOver = true
        setHighScore((prev) => Math.max(prev, gs.score))
        const hx = snake[0].x * CELL_SIZE + CELL_SIZE / 2
        const hy = snake[0].y * CELL_SIZE + CELL_SIZE / 2
        spawnParticles(hx, hy, '#ef4444', 20)
        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const newSnake = [head, ...snake]

      // Check if snake ate the word - check with expanded hitbox for multi-cell words
      const diff = gs.difficulty
      const settings = DIFFICULTY_SETTINGS[diff]
      if (wordFood) {
        const fx = wordFood.position.x
        const fy = wordFood.position.y
        // Check head against food position and adjacent cells (more forgiving hitbox)
        const ate = (
          (head.x === fx && head.y === fy) ||
          (head.x === fx + 1 && head.y === fy) ||
          (head.x === fx - 1 && head.y === fy) ||
          (head.x === fx && head.y === fy + 1) ||
          (head.x === fx && head.y === fy - 1)
        )

        if (ate) {
          // Ate the word! Add to collection
          addWord(wordFood.word)
          collectedWordsRef.current.add(wordFood.word)
          gs.score += wordFood.word.length * 10
          gs.speed = Math.max(settings.minSpeed, gs.speed - settings.speedInc)
          gs.wordsEaten += 1
          gs.wordFood = null

          // Visual feedback
          const wx = wordFood.position.x * CELL_SIZE + CELL_SIZE / 2
          const wy = wordFood.position.y * CELL_SIZE
          spawnFloatingText(`+${wordFood.word.length * 10}`, wx, wy, '#4ade80')
          spawnFloatingText(wordFood.word, wx, wy - 20, '#fbbf24')
          spawnParticles(wx, wy + CELL_SIZE / 2, '#fbbf24', 12)
          spawnParticles(wx, wy + CELL_SIZE / 2, '#4ade80', 8)

          spawnWord()
        } else {
          // Remove tail (no growth)
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
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [draw, addWord, spawnWord, updateUI, spawnFloatingText, spawnParticles])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current

      if (e.key === ' ') {
        e.preventDefault()
        if (gs.gameOver) {
          resetGame()
        } else if (!gs.gameStarted) {
          resetGame()
        } else {
          gs.paused = !gs.paused
          updateUI()
        }
        return
      }

      if (e.key === 'Escape') {
        gs.paused = !gs.paused
        updateUI()
        return
      }

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
  }, [resetGame, updateUI])

  // Touch / swipe controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const minSwipe = 20

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
        // Tap - start/pause
        const gs = gameStateRef.current
        if (!gs.gameStarted || gs.gameOver) {
          resetGame()
        } else {
          gs.paused = !gs.paused
          updateUI()
        }
        touchStartRef.current = null
        return
      }

      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver || gs.paused) return

      let newDir: Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        newDir = dx > 0 ? 'RIGHT' : 'LEFT'
      } else {
        newDir = dy > 0 ? 'DOWN' : 'UP'
      }
      directionQueueRef.current.push(newDir)
      if (directionQueueRef.current.length > 2) {
        directionQueueRef.current = directionQueueRef.current.slice(-2)
      }
      touchStartRef.current = null
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [resetGame, updateUI])

  // Canvas click to start
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleClick = () => {
      const gs = gameStateRef.current
      if (!gs.gameStarted || gs.gameOver) {
        resetGame()
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [resetGame])

  const wordList = getWordList()
  const totalCount = getTotalCount()

  const changeDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    const gs = gameStateRef.current
    if (gs.gameStarted && !gs.gameOver) return // Can't change during active game
    gs.difficulty = diff
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
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {/* Difficulty selector */}
            {!uiState.gameStarted || uiState.gameOver ? (
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
            ) : null}

            <div className="relative rounded-lg overflow-hidden border border-slate-700/80 shadow-lg shadow-slate-950/50">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="block w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              {!uiState.gameStarted && (
                <Button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Game
                </Button>
              )}
              {uiState.gameStarted && !uiState.gameOver && (
                <Button
                  onClick={() => {
                    const gs = gameStateRef.current
                    gs.paused = !gs.paused
                    updateUI()
                  }}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {uiState.paused ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              )}
              {uiState.gameOver && (
                <Button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Play Again
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">↑↓←→</kbd>
                / WASD
              </span>
              <span>Space - Start/Pause</span>
              <span className="hidden sm:inline">Swipe on mobile</span>
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
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="px-2.5 py-1.5 rounded-md bg-green-900/20 border border-green-800/30 text-center">
                  <div className="text-green-400 text-sm font-bold">{uiState.wordsEaten}</div>
                  <div className="text-green-600 text-[10px] uppercase tracking-wider">Words Eaten</div>
                </div>
                <div className="px-2.5 py-1.5 rounded-md bg-purple-900/20 border border-purple-800/30 text-center">
                  <div className="text-purple-400 text-sm font-bold">{uiState.score}</div>
                  <div className="text-purple-600 text-[10px] uppercase tracking-wider">Score</div>
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
              <ScrollArea className="h-[360px] lg:h-[420px]">
                <div className="space-y-1 pr-2">
                  {wordList.map(({ word, count }) => (
                    <div
                      key={word}
                      className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-all duration-200"
                    >
                      <span className="text-amber-300 text-sm font-mono flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {word}
                      </span>
                      {count > 1 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-800/40 text-amber-300 text-xs h-5 min-w-[20px] flex items-center justify-center"
                        >
                          ×{count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
