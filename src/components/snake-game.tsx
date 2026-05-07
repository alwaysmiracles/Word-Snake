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
  Keyboard,
  ChevronRight,
} from 'lucide-react'

// Game constants
const CELL_SIZE = 20
const GRID_WIDTH = 30
const GRID_HEIGHT = 25
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 2
const MIN_SPEED = 60

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }

interface WordFood {
  word: string
  position: Position
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
    speed: INITIAL_SPEED,
  })

  const lastRenderRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const directionQueueRef = useRef<Direction[]>([])
  const collectedWordsRef = useRef<Set<string>>(new Set())

  // Reactive state for UI
  const [uiState, setUiState] = useState({
    score: 0,
    gameStarted: false,
    gameOver: false,
    paused: false,
    wordFood: null as WordFood | null,
  })

  const updateUI = useCallback(() => {
    const gs = gameStateRef.current
    setUiState({
      score: gs.score,
      gameStarted: gs.gameStarted,
      gameOver: gs.gameOver,
      paused: gs.paused,
      wordFood: gs.wordFood,
    })
  }, [])

  const spawnWord = useCallback(() => {
    const gs = gameStateRef.current
    const occupiedPositions = new Set(gs.snake.map((s) => `${s.x},${s.y}`))
    const collected = Array.from(collectedWordsRef.current)
    const word = getRandomWord(collected)

    let pos: Position
    let attempts = 0
    do {
      pos = {
        x: Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2,
        y: Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2,
      }
      attempts++
    } while (occupiedPositions.has(`${pos.x},${pos.y}`) && attempts < 100)

    gs.wordFood = { word, position: pos }
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

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#1e293b'
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

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head - brighter green with glow
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 8
        ctx.fillStyle = '#4ade80'
        ctx.beginPath()
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          4
        )
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw eyes on the head
        ctx.fillStyle = '#0f172a'
        const eyeSize = 3
        const cx = segment.x * CELL_SIZE + CELL_SIZE / 2
        const cy = segment.y * CELL_SIZE + CELL_SIZE / 2
        let eye1x: number, eye1y: number, eye2x: number, eye2y: number

        if (direction === 'RIGHT') {
          eye1x = cx + 3; eye1y = cy - 4; eye2x = cx + 3; eye2y = cy + 4
        } else if (direction === 'LEFT') {
          eye1x = cx - 3; eye1y = cy - 4; eye2x = cx - 3; eye2y = cy + 4
        } else if (direction === 'UP') {
          eye1x = cx - 4; eye1y = cy - 3; eye2x = cx + 4; eye2y = cy - 3
        } else {
          eye1x = cx - 4; eye1y = cy + 3; eye2x = cx + 4; eye2y = cy + 3
        }
        ctx.beginPath()
        ctx.arc(eye1x, eye1y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(eye2x, eye2y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Snake body - gradient green
        const ratio = 1 - index / snake.length
        const green = Math.floor(180 + ratio * 75)
        ctx.fillStyle = `rgb(34, ${green}, 80)`
        ctx.beginPath()
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          3
        )
        ctx.fill()
      }
    })

    // Draw word food
    if (wordFood) {
      const { word, position } = wordFood
      ctx.font = 'bold 12px monospace'
      const wordWidth = ctx.measureText(word).width
      const padding = 6
      const boxWidth = wordWidth + padding * 2
      const boxHeight = CELL_SIZE + padding
      const boxX = position.x * CELL_SIZE - (boxWidth - CELL_SIZE) / 2
      const boxY = position.y * CELL_SIZE - (boxHeight - CELL_SIZE) / 2

      // Glowing background
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 12
      ctx.fillStyle = '#451a03'
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6)
      ctx.fill()
      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6)
      ctx.stroke()

      // Text
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, boxX + boxWidth / 2, boxY + boxHeight / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px sans-serif'
      ctx.fillText(`Score: ${gs.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
      ctx.fillText('Press Space to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50)
      ctx.textAlign = 'start'
    }

    // Draw start screen
    if (!gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WORD SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px sans-serif'
      ctx.fillText('Press Space to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15)
      ctx.fillText('Arrow keys to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40)
      ctx.textAlign = 'start'
    }

    // Draw pause overlay
    if (paused && gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.textAlign = 'start'
    }
  }, [])

  const resetGame = useCallback(() => {
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
    gs.speed = INITIAL_SPEED
    gs.gameStarted = true
    gs.wordFood = null
    directionQueueRef.current = []
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
        // Validate direction change
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
        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Check self collision
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        gs.gameOver = true
        setHighScore((prev) => Math.max(prev, gs.score))
        updateUI()
        draw()
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const newSnake = [head, ...snake]

      // Check if snake ate the word
      if (wordFood && head.x === wordFood.position.x && head.y === wordFood.position.y) {
        // Ate the word! Add to collection
        addWord(wordFood.word)
        collectedWordsRef.current.add(wordFood.word)
        gs.score += wordFood.word.length * 10
        gs.speed = Math.max(MIN_SPEED, gs.speed - SPEED_INCREMENT)
        gs.wordFood = null
        spawnWord()
      } else {
        // Remove tail (no growth)
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
  }, [draw, addWord, spawnWord, updateUI])

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
        // Queue the direction change
        directionQueueRef.current.push(newDir)
        // Keep queue short
        if (directionQueueRef.current.length > 2) {
          directionQueueRef.current = directionQueueRef.current.slice(-2)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetGame, updateUI])

  const wordList = getWordList()
  const totalCount = getTotalCount()

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
                  Score: {uiState.score}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="relative rounded-lg overflow-hidden border border-slate-700">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="block w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              {!uiState.gameStarted && (
                <Button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Play Again
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Arrow Keys / WASD
              </span>
              <span>Space - Start/Pause</span>
              <span>Esc - Pause</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Collection Sidebar */}
      <div className="w-full lg:w-72 shrink-0">
        <Card className="border-slate-700 bg-slate-900 h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-base">
                📚 Collected Words
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-900/50 text-amber-400 border-amber-700 text-xs">
                {totalCount} words
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {wordList.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-sm">No words collected yet</p>
                <p className="text-xs mt-1">Play the game to collect words!</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] lg:h-[460px]">
                <div className="space-y-1.5 pr-2">
                  {wordList.map(({ word, count }) => (
                    <div
                      key={word}
                      className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 group hover:bg-slate-800 hover:border-amber-700/50 transition-colors"
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
