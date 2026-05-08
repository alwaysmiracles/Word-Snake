// =============================================================================
// word-bingo-wire.ts — Word Bingo (单词宾果) Game System Wire
// Pure TypeScript + Zustand store pattern. No React imports.
// Exports ~34 named functions for full game logic and UI helpers.
// =============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// =============================================================================
// Types & Interfaces
// =============================================================================

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface BingoCell {
  word: string
  index: number
  row: number
  col: number
  marked: boolean
  markedAt: number | null
  isFree: boolean
  difficulty: Difficulty
}

export interface BingoCard {
  id: string
  cells: BingoCell[]
  difficulty: Difficulty
  createdAt: number
  totalMarks: number
  completedPatterns: string[]
}

export interface BingoPattern {
  id: string
  name: string
  description: string
  difficulty: Difficulty
  rewardMultiplier: number
  check: (cells: BingoCell[]) => boolean
}

export interface BingoGame {
  id: string
  cardId: string
  startTime: number
  endTime: number | null
  score: number
  completedPatterns: string[]
  status: 'playing' | 'completed' | 'abandoned'
  unmarksRemaining: number
  comboCount: number
  lastMarkTime: number
}

export interface DailyBingo {
  date: string
  cardId: string
  completed: boolean
  progress: number
  score: number
  rewardClaimed: boolean
}

export interface BingoHistoryEntry {
  id: string
  cardId: string
  score: number
  patterns: string[]
  duration: number
  difficulty: Difficulty
  completedAt: number
  wordsMarked: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  unlockedAt: number | null
  progress: number
  target: number
}

export interface BingoState {
  cards: BingoCard[]
  activeCardId: string | null
  currentGame: BingoGame | null
  markedWords: string[]
  freeCenter: boolean
  totalBingos: number
  totalGamesPlayed: number
  totalWordsMarked: number
  bestScore: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  dailyBingo: DailyBingo | null
  lastDailyDate: string
  unlockedPatterns: string[]
  gameHistory: BingoHistoryEntry[]
  // --- Actions ---
  generateCard: (difficulty: Difficulty) => BingoCard
  shuffleCard: () => void
  markWord: (word: string) => void
  checkBingo: () => string[]
  unmarkWord: (word: string) => void
  autoMarkHint: () => string | null
  generateDailyBingo: () => void
  getDailyProgress: () => number
  getDailyStreak: () => number
  getDailyReward: () => number
  startGame: (cardId: string) => void
  endGame: () => void
  resetGame: () => void
  clearHistory: () => void
  checkAchievements: () => string[]
}

// =============================================================================
// Word Pool (200+ English words by difficulty)
// =============================================================================

const EASY_WORDS: string[] = [
  'cat', 'dog', 'run', 'big', 'red', 'sun', 'hot', 'cup', 'map', 'box',
  'pen', 'bus', 'hat', 'net', 'fan', 'jar', 'bed', 'top', 'key', 'pig',
  'fog', 'gem', 'hug', 'kit', 'log', 'mud', 'nap', 'oak', 'pie', 'rug',
  'sea', 'toe', 'van', 'wax', 'yam', 'zoo', 'ace', 'bay', 'den', 'elf',
  'fly', 'gym', 'hen', 'ice', 'joy', 'lip', 'mix', 'nut', 'owl', 'pad',
  'ram', 'sap', 'tab', 'urn', 'vet', 'web', 'yak', 'atom', 'bolt', 'crab',
  'dawn', 'echo', 'fig', 'glow', 'hive', 'iris', 'jazz', 'kite', 'lamp',
  'mint', 'nest', 'opal', 'palm', 'raft', 'silk', 'tent', 'wolf', 'youth',
]

const MEDIUM_WORDS: string[] = [
  'apple', 'brave', 'cloud', 'dance', 'eagle', 'flame', 'grape', 'heart',
  'ivory', 'jewel', 'knife', 'lemon', 'mango', 'noble', 'ocean', 'pearl',
  'queen', 'river', 'stone', 'tiger', 'unity', 'vivid', 'whale', 'xenon',
  'yield', 'zebra', 'amber', 'blaze', 'charm', 'drift', 'ember', 'frost',
  'ghost', 'haven', 'index', 'judge', 'karma', 'lunar', 'marsh', 'nerve',
  'orbit', 'pixel', 'quest', 'realm', 'solar', 'trail', 'ultra', 'valve',
  'wound', 'axiom', 'badge', 'cedar', 'delta', 'epoch', 'fiber', 'glyph',
  'helix', 'ionic', 'joker', 'knack', 'llama', 'moose', 'nexus', 'optic',
  'prism', 'quota', 'rogue', 'siege', 'theta', 'usher', 'vigor', 'wrath',
  'basin', 'canyon', 'dusk',
]

const HARD_WORDS: string[] = [
  'amazing', 'balance', 'cabinet', 'diamond', 'eclipse', 'fantasy',
  'granite', 'harvest', 'imagine', 'journey', 'kingdom', 'lantern',
  'miracle', 'network', 'observe', 'package', 'quantum', 'rainbow',
  'sanctum', 'tempest', 'uniform', 'village', 'whisper', 'pyramid',
  'crystal', 'dynasty', 'enchant', 'formula', 'gravity', 'horizon',
  'instinct', 'justice', 'kitchen', 'library', 'machine', 'natural',
  'organic', 'phantom', 'rapidly', 'shelter', 'thunder', 'unicorn',
  'voltage', 'warrior', 'extreme', 'circuit', 'complex', 'embrace',
  'fiction', 'general', 'harmony', 'impulse', 'liberty', 'mystery',
  'paradox', 'reality', 'stellar', 'triumph', 'venture', 'abundant',
  'beverage', 'carnival', 'discovery', 'elaborate', 'fabulous', 'graceful',
  'heritage', 'inferior', 'juvenile', 'labyrinth', 'magnetic', 'obstacle',
  'protocol', 'spectral', 'textile', 'vibrant', 'wildfire', 'absolute',
  'barrier',
]

const WORD_POOL: Record<Difficulty, string[]> = {
  easy: EASY_WORDS,
  medium: MEDIUM_WORDS,
  hard: HARD_WORDS,
}

// =============================================================================
// Bingo Pattern Definitions (19 patterns)
// =============================================================================

const checkRow = (row: number) => (cells: BingoCell[]) =>
  cells.filter((c) => c.row === row).every((c) => c.marked || c.isFree)

const checkCol = (col: number) => (cells: BingoCell[]) =>
  cells.filter((c) => c.col === col).every((c) => c.marked || c.isFree)

const checkLine = (pred: (c: BingoCell) => boolean) => (cells: BingoCell[]) =>
  cells.filter(pred).every((c) => c.marked || c.isFree)

const BINGO_PATTERNS: BingoPattern[] = [
  { id: 'row-0', name: 'Top Row', description: 'Complete the entire top row', difficulty: 'easy', rewardMultiplier: 2, check: checkRow(0) },
  { id: 'row-1', name: 'Second Row', description: 'Complete the second row', difficulty: 'easy', rewardMultiplier: 2, check: checkRow(1) },
  { id: 'row-2', name: 'Middle Row', description: 'Complete the middle row', difficulty: 'easy', rewardMultiplier: 2, check: checkRow(2) },
  { id: 'row-3', name: 'Fourth Row', description: 'Complete the fourth row', difficulty: 'easy', rewardMultiplier: 2, check: checkRow(3) },
  { id: 'row-4', name: 'Bottom Row', description: 'Complete the bottom row', difficulty: 'easy', rewardMultiplier: 2, check: checkRow(4) },
  { id: 'col-0', name: 'Left Column', description: 'Complete the entire left column', difficulty: 'easy', rewardMultiplier: 2, check: checkCol(0) },
  { id: 'col-1', name: 'Second Column', description: 'Complete the second column', difficulty: 'easy', rewardMultiplier: 2, check: checkCol(1) },
  { id: 'col-2', name: 'Middle Column', description: 'Complete the middle column', difficulty: 'easy', rewardMultiplier: 2, check: checkCol(2) },
  { id: 'col-3', name: 'Fourth Column', description: 'Complete the fourth column', difficulty: 'easy', rewardMultiplier: 2, check: checkCol(3) },
  { id: 'col-4', name: 'Right Column', description: 'Complete the right column', difficulty: 'easy', rewardMultiplier: 2, check: checkCol(4) },
  {
    id: 'diag-main', name: 'Main Diagonal', description: 'Complete top-left to bottom-right diagonal',
    difficulty: 'medium', rewardMultiplier: 3, check: checkLine((c) => c.row === c.col),
  },
  {
    id: 'diag-anti', name: 'Anti Diagonal', description: 'Complete top-right to bottom-left diagonal',
    difficulty: 'medium', rewardMultiplier: 3, check: checkLine((c) => c.row + c.col === 4),
  },
  {
    id: 'four-corners', name: 'Four Corners', description: 'Mark all four corner cells',
    difficulty: 'medium', rewardMultiplier: 4, check: (cells) => [0, 4, 20, 24].every((i) => cells[i]?.marked),
  },
  {
    id: 'x-pattern', name: 'X Pattern', description: 'Complete both diagonals forming an X',
    difficulty: 'hard', rewardMultiplier: 5,
    check: (cells) =>
      checkLine((c) => c.row === c.col)(cells) && checkLine((c) => c.row + c.col === 4)(cells),
  },
  {
    id: 't-top', name: 'T-Top', description: 'Complete the top row and middle column',
    difficulty: 'medium', rewardMultiplier: 3,
    check: (cells) => checkRow(0)(cells) && checkCol(2)(cells),
  },
  {
    id: 't-bottom', name: 'T-Bottom', description: 'Complete the bottom row and middle column',
    difficulty: 'medium', rewardMultiplier: 3,
    check: (cells) => checkRow(4)(cells) && checkCol(2)(cells),
  },
  {
    id: 'plus-cross', name: 'Plus / Cross', description: 'Complete the middle row and middle column',
    difficulty: 'medium', rewardMultiplier: 4,
    check: (cells) => checkRow(2)(cells) && checkCol(2)(cells),
  },
  {
    id: 'border-frame', name: 'Border Frame', description: 'Complete all outer edge cells',
    difficulty: 'hard', rewardMultiplier: 6,
    check: (cells) =>
      cells.filter((c) => c.row === 0 || c.row === 4 || c.col === 0 || c.col === 4)
        .every((c) => c.marked || c.isFree),
  },
  {
    id: 'diamond', name: 'Diamond', description: 'Complete the diamond pattern in the center',
    difficulty: 'hard', rewardMultiplier: 7,
    check: (cells) => {
      const di: [number, number][] = [[0,2],[1,1],[1,3],[2,0],[2,4],[3,1],[3,3],[4,2]]
      return di.every(([r, c]) => { const cl = cells.find((x) => x.row === r && x.col === c); return cl?.marked || cl?.isFree })
    },
  },
  {
    id: 'blackout', name: 'Blackout', description: 'Mark every single cell on the board',
    difficulty: 'hard', rewardMultiplier: 10,
    check: (cells) => cells.every((c) => c.marked || c.isFree),
  },
]

// =============================================================================
// Achievement Definitions
// =============================================================================

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  { id: 'first-bingo', name: 'First Bingo', description: 'Complete your first bingo pattern', icon: '🎯', condition: 'totalBingos >= 1', target: 1 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a bingo in under 2 minutes', icon: '⚡', condition: 'fastGame', target: 1 },
  { id: 'pattern-master', name: 'Pattern Master', description: 'Unlock all 19 bingo patterns', icon: '🏆', condition: 'unlockedPatterns >= 19', target: 19 },
  { id: 'blackout-king', name: 'Blackout King', description: 'Complete a blackout bingo', icon: '👑', condition: 'blackoutCount >= 1', target: 1 },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintain a 5+ daily streak', icon: '🔥', condition: 'currentStreak >= 5', target: 5 },
  { id: 'word-hunter', name: 'Word Hunter', description: 'Mark 100+ words total', icon: '📝', condition: 'totalWordsMarked >= 100', target: 100 },
  { id: 'veteran', name: 'Veteran', description: 'Play 50 games total', icon: '🎖️', condition: 'totalGamesPlayed >= 50', target: 50 },
  { id: 'high-scorer', name: 'High Scorer', description: 'Score 500+ points in a single game', icon: '💎', condition: 'bestScore >= 500', target: 500 },
  { id: 'multi-bingo', name: 'Multi-Bingo', description: 'Complete 3+ patterns in one game', icon: '🌟', condition: 'multiBingoCount >= 1', target: 1 },
  { id: 'daily-devotee', name: 'Daily Devotee', description: 'Complete 7 daily bingos', icon: '📅', condition: 'dailyStreak >= 7', target: 7 },
  { id: 'word-savant', name: 'Word Savant', description: 'Mark 500+ words total', icon: '📖', condition: 'totalWordsMarked >= 500', target: 500 },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 games', icon: '💯', condition: 'totalGamesPlayed >= 100', target: 100 },
]

// =============================================================================
// Helper Utilities
// =============================================================================

function generateId(): string {
  return `bingo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function dateToSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) | 0
  return Math.abs(hash) || 1
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function pickWords(difficulty: Difficulty, count: number, rng: () => number): string[] {
  return [...WORD_POOL[difficulty]].sort(() => rng() - 0.5).slice(0, count)
}

function wordScore(word: string, difficulty: Difficulty): number {
  const base = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 50
  return base + Math.min(word.length - 3, 4) * 5
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function buildCells(words: string[], difficulty: Difficulty, rng?: () => number): BingoCell[] {
  const cells: BingoCell[] = []
  let wordIdx = 0
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col
      if (row === 2 && col === 2) {
        cells.push({ word: 'FREE', index, row, col, marked: true, markedAt: Date.now(), isFree: true, difficulty: 'easy' })
      } else {
        cells.push({
          word: words[wordIdx] || 'WORD', index, row, col,
          marked: false, markedAt: null, isFree: false, difficulty,
        })
        wordIdx++
      }
    }
  }
  return cells
}

// =============================================================================
// Zustand Store
// =============================================================================

export const useBingoStore = create<BingoState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      cards: [],
      activeCardId: null,
      currentGame: null,
      markedWords: [],
      freeCenter: true,
      totalBingos: 0,
      totalGamesPlayed: 0,
      totalWordsMarked: 0,
      bestScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      dailyBingo: null,
      lastDailyDate: '',
      unlockedPatterns: [],
      gameHistory: [],

      // =====================================================================
      // Card Generation
      // =====================================================================

      generateCard: (difficulty: Difficulty): BingoCard => {
        const id = generateId()
        const words = pickWords(difficulty, 24, Math.random)
        const cells = buildCells(words, difficulty)

        const card: BingoCard = {
          id, cells, difficulty, createdAt: Date.now(), totalMarks: 1, completedPatterns: [],
        }

        set((state) => ({ cards: [...state.cards, card], activeCardId: id }))
        return card
      },

      shuffleCard: () => {
        const { cards, activeCardId } = get()
        if (!activeCardId) return
        const idx = cards.findIndex((c) => c.id === activeCardId)
        if (idx === -1) return

        const card = cards[idx]
        const nonFree = card.cells.filter((c) => !c.isFree)
        const freeCell = card.cells.find((c) => c.isFree)!

        const reordered = [...nonFree].sort(() => Math.random() - 0.5)
        const newCells: BingoCell[] = []
        let ri = 0
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            if (row === 2 && col === 2) {
              newCells.push(freeCell)
            } else {
              const src = reordered[ri++]
              if (src) newCells.push({ ...src, index: row * 5 + col, row, col })
            }
          }
        }

        const updated = [...cards]
        updated[idx] = { ...card, cells: newCells }
        set({ cards: updated })
      },

      // =====================================================================
      // Word Marking
      // =====================================================================

      markWord: (word: string) => {
        const { cards, activeCardId, currentGame } = get()
        if (!activeCardId || !currentGame) return

        const cardIdx = cards.findIndex((c) => c.id === activeCardId)
        if (cardIdx === -1) return

        const card = cards[cardIdx]
        const cellIdx = card.cells.findIndex(
          (c) => c.word.toLowerCase() === word.toLowerCase() && !c.marked && !c.isFree
        )
        if (cellIdx === -1) return

        const now = Date.now()
        const cell = card.cells[cellIdx]
        const newCells = [...card.cells]
        newCells[cellIdx] = { ...cell, marked: true, markedAt: now }

        const points = wordScore(word, cell.difficulty)
        const timeSince = now - currentGame.lastMarkTime
        const combo = currentGame.lastMarkTime > 0 && timeSince < 5000
          ? Math.min(currentGame.comboCount + 1, 10) : 1
        const comboBonus = combo > 1 ? combo * 5 : 0

        const updatedCard: BingoCard = {
          ...card, cells: newCells, totalMarks: card.totalMarks + 1,
        }

        const newPatterns = get().checkBingo()
        updatedCard.completedPatterns = Array.from(new Set([...card.completedPatterns, ...newPatterns]))

        const patternBonus = newPatterns.reduce((sum, pid) => {
          const p = BINGO_PATTERNS.find((bp) => bp.id === pid)
          return sum + (p ? p.rewardMultiplier * 50 : 0)
        }, 0)

        const newlyUnlocked = newPatterns.filter((p) => !get().unlockedPatterns.includes(p))
        const updatedCards = [...cards]
        updatedCards[cardIdx] = updatedCard

        set((state) => ({
          cards: updatedCards,
          markedWords: [...state.markedWords, word],
          currentGame: {
            ...currentGame,
            score: currentGame.score + points + comboBonus + patternBonus,
            completedPatterns: Array.from(new Set([...currentGame.completedPatterns, ...newPatterns])),
            comboCount: combo, lastMarkTime: now,
          },
          totalWordsMarked: state.totalWordsMarked + 1,
          unlockedPatterns: Array.from(new Set([...state.unlockedPatterns, ...newlyUnlocked])),
        }))
      },

      checkBingo: (): string[] => {
        const { cards, activeCardId } = get()
        if (!activeCardId) return []
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return []
        return BINGO_PATTERNS.filter(
          (p) => p.check(card.cells) && !card.completedPatterns.includes(p.id)
        ).map((p) => p.id)
      },

      unmarkWord: (word: string) => {
        const { cards, activeCardId, currentGame } = get()
        if (!activeCardId || !currentGame || currentGame.unmarksRemaining <= 0) return

        const cardIdx = cards.findIndex((c) => c.id === activeCardId)
        if (cardIdx === -1) return

        const card = cards[cardIdx]
        const cellIdx = card.cells.findIndex(
          (c) => c.word.toLowerCase() === word.toLowerCase() && c.marked && !c.isFree
        )
        if (cellIdx === -1) return

        const cell = card.cells[cellIdx]
        const newCells = [...card.cells]
        newCells[cellIdx] = { ...cell, marked: false, markedAt: null }

        const updatedCards = [...cards]
        updatedCards[cardIdx] = { ...card, cells: newCells, totalMarks: Math.max(0, card.totalMarks - 1) }

        set((state) => ({
          cards: updatedCards,
          markedWords: state.markedWords.filter((w) => w.toLowerCase() !== word.toLowerCase()),
          currentGame: {
            ...currentGame,
            unmarksRemaining: currentGame.unmarksRemaining - 1,
            score: Math.max(0, currentGame.score - 10),
          },
        }))
      },

      autoMarkHint: (): string | null => {
        const { cards, activeCardId } = get()
        if (!activeCardId) return null
        const card = cards.find((c) => c.id === activeCardId)
        if (!card) return null

        const unmarked = card.cells.filter((c) => !c.marked && !c.isFree)
        if (unmarked.length === 0) return null

        let bestWord: string | null = null
        let bestScore = -1

        for (const cell of unmarked) {
          const hypo = card.cells.map((c) =>
            c.index === cell.index ? { ...c, marked: true } : c
          )
          let contribution = 0
          for (const pattern of BINGO_PATTERNS) {
            if (card.completedPatterns.includes(pattern.id)) continue
            if (pattern.check(hypo as BingoCell[])) {
              contribution += pattern.rewardMultiplier * 10
            } else {
              contribution += pattern.rewardMultiplier
            }
          }
          if (contribution > bestScore) {
            bestScore = contribution
            bestWord = cell.word
          }
        }
        return bestWord
      },

      // =====================================================================
      // Daily Bingo
      // =====================================================================

      generateDailyBingo: () => {
        const today = getTodayString()
        const { lastDailyDate, dailyBingo } = get()
        if (lastDailyDate === today && dailyBingo) return

        const rng = seededRandom(dateToSeed(today))
        const seededWords = pickWords('medium', 24, rng)
        const id = generateId()
        const cells = buildCells(seededWords, 'medium', rng)

        const card: BingoCard = {
          id, cells, difficulty: 'medium', createdAt: Date.now(), totalMarks: 1, completedPatterns: [],
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        const isNewStreak = lastDailyDate === yesterdayStr
        const newStreak = isNewStreak ? get().currentStreak + 1 : 1

        set((state) => ({
          cards: [...state.cards, card],
          activeCardId: id,
          dailyBingo: { date: today, cardId: id, completed: false, progress: 0, score: 0, rewardClaimed: false },
          lastDailyDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
        }))
      },

      getDailyProgress: (): number => {
        const { cards, dailyBingo } = get()
        if (!dailyBingo) return 0
        const card = cards.find((c) => c.id === dailyBingo.cardId)
        if (!card) return 0
        return Math.round((card.cells.filter((c) => c.marked || c.isFree).length / 25) * 100)
      },

      getDailyStreak: (): number => get().currentStreak,

      getDailyReward: (): number => {
        const { dailyBingo, currentStreak } = get()
        if (!dailyBingo || !dailyBingo.completed) return 0
        return 100 + currentStreak * 10
      },

      // =====================================================================
      // Game Lifecycle
      // =====================================================================

      startGame: (cardId: string) => {
        set({
          activeCardId: cardId,
          currentGame: {
            id: generateId(), cardId, startTime: Date.now(), endTime: null,
            score: 0, completedPatterns: [], status: 'playing',
            unmarksRemaining: 3, comboCount: 0, lastMarkTime: 0,
          },
          markedWords: [],
        })
      },

      endGame: () => {
        const { currentGame, cards, activeCardId } = get()
        if (!currentGame || !activeCardId) return

        const card = cards.find((c) => c.id === activeCardId)
        const duration = Date.now() - currentGame.startTime
        const isCompleted = currentGame.completedPatterns.length > 0

        const entry: BingoHistoryEntry = {
          id: generateId(), cardId: activeCardId, score: currentGame.score,
          patterns: currentGame.completedPatterns, duration,
          difficulty: card?.difficulty || 'medium', completedAt: Date.now(),
          wordsMarked: currentGame.completedPatterns.length,
        }

        const isDaily = get().dailyBingo?.cardId === activeCardId

        set((state) => ({
          currentGame: { ...currentGame, endTime: Date.now(), status: isCompleted ? 'completed' : 'abandoned' },
          totalBingos: state.totalBingos + currentGame.completedPatterns.length,
          totalGamesPlayed: state.totalGamesPlayed + 1,
          bestScore: Math.max(state.bestScore, currentGame.score),
          gameHistory: [entry, ...state.gameHistory].slice(0, 100),
          dailyBingo: isDaily && isCompleted
            ? { ...state.dailyBingo!, completed: true, score: currentGame.score }
            : state.dailyBingo,
        }))

        get().checkAchievements()
      },

      resetGame: () => set({ currentGame: null, markedWords: [] }),

      clearHistory: () => set({
        gameHistory: [], totalBingos: 0, totalGamesPlayed: 0,
        totalWordsMarked: 0, bestScore: 0, achievements: [], unlockedPatterns: [],
      }),

      // =====================================================================
      // Achievements
      // =====================================================================

      checkAchievements: (): string[] => {
        const state = get()
        const newlyUnlocked: string[] = []

        for (const def of ACHIEVEMENT_DEFS) {
          if (state.achievements.includes(def.id)) continue
          let unlocked = false
          switch (def.id) {
            case 'first-bingo': unlocked = state.totalBingos >= 1; break
            case 'speed-demon': unlocked = state.gameHistory.some((h) => h.duration < 120_000 && h.patterns.length > 0); break
            case 'pattern-master': unlocked = state.unlockedPatterns.length >= 19; break
            case 'blackout-king': unlocked = state.unlockedPatterns.includes('blackout'); break
            case 'streak-master': unlocked = state.currentStreak >= 5; break
            case 'word-hunter': unlocked = state.totalWordsMarked >= 100; break
            case 'veteran': unlocked = state.totalGamesPlayed >= 50; break
            case 'high-scorer': unlocked = state.bestScore >= 500; break
            case 'multi-bingo': unlocked = state.gameHistory.some((h) => h.patterns.length >= 3); break
            case 'daily-devotee': unlocked = state.currentStreak >= 7; break
            case 'word-savant': unlocked = state.totalWordsMarked >= 500; break
            case 'centurion': unlocked = state.totalGamesPlayed >= 100; break
          }
          if (unlocked) newlyUnlocked.push(def.id)
        }

        if (newlyUnlocked.length > 0) {
          set((s) => ({ achievements: [...s.achievements, ...newlyUnlocked] }))
        }
        return newlyUnlocked
      },
    }),
    {
      name: 'word-bingo-storage',
      partialize: (state) => ({
        cards: state.cards, activeCardId: state.activeCardId,
        totalBingos: state.totalBingos, totalGamesPlayed: state.totalGamesPlayed,
        totalWordsMarked: state.totalWordsMarked, bestScore: state.bestScore,
        currentStreak: state.currentStreak, longestStreak: state.longestStreak,
        achievements: state.achievements, dailyBingo: state.dailyBingo,
        lastDailyDate: state.lastDailyDate, unlockedPatterns: state.unlockedPatterns,
        gameHistory: state.gameHistory,
      }),
    }
  )
)

// =============================================================================
// UI Helper Functions — return JSX-ready data structures
// =============================================================================

/** Stats summary for header/dashboard. */
export function getBingoOverview(): {
  totalGames: number; totalBingos: number; bestScore: number
  currentStreak: number; totalWords: number; winRate: number
} {
  const s = useBingoStore.getState()
  const completed = s.gameHistory.filter((h) => h.patterns.length > 0).length
  return {
    totalGames: s.totalGamesPlayed, totalBingos: s.totalBingos,
    bestScore: s.bestScore, currentStreak: s.currentStreak,
    totalWords: s.totalWordsMarked,
    winRate: s.totalGamesPlayed > 0 ? Math.round((completed / s.totalGamesPlayed) * 100) : 0,
  }
}

/** Full card data with 5×5 grid, marked status, and highlighting. */
export function getBingoCard(cardId?: string): {
  id: string; grid: BingoCell[][]; marked: Set<string>
  patternsCompleted: string[]; difficulty: Difficulty
} | null {
  const s = useBingoStore.getState()
  const tid = cardId || s.activeCardId
  if (!tid) return null
  const card = s.cards.find((c) => c.id === tid)
  if (!card) return null

  const grid: BingoCell[][] = []
  for (let r = 0; r < 5; r++) grid.push(card.cells.slice(r * 5, r * 5 + 5))
  const marked = new Set(card.cells.filter((c) => c.marked || c.isFree).map((c) => c.word))

  return { id: card.id, grid, marked, patternsCompleted: card.completedPatterns, difficulty: card.difficulty }
}

/** All 19 patterns with completion status and metadata. */
export function getPatternGrid(): Array<{
  id: string; name: string; description: string
  difficulty: Difficulty; rewardMultiplier: number; completed: boolean
}> {
  const s = useBingoStore.getState()
  return BINGO_PATTERNS.map((p) => ({
    id: p.id, name: p.name, description: p.description,
    difficulty: p.difficulty, rewardMultiplier: p.rewardMultiplier,
    completed: s.unlockedPatterns.includes(p.id),
  }))
}

/** Current game card with live score info. */
export function getActiveGameCard(): {
  card: BingoCard | null; game: BingoGame | null
  markedWords: string[]; unmarksLeft: number; comboCount: number; elapsed: string
} {
  const s = useBingoStore.getState()
  const card = s.activeCardId ? s.cards.find((c) => c.id === s.activeCardId) ?? null : null
  return {
    card, game: s.currentGame, markedWords: s.markedWords,
    unmarksLeft: s.currentGame?.unmarksRemaining ?? 0,
    comboCount: s.currentGame?.comboCount ?? 0,
    elapsed: s.currentGame ? formatDuration(Date.now() - s.currentGame.startTime) : '0:00',
  }
}

/** Daily bingo card data with progress. */
export function getDailyBingoCard(): {
  daily: DailyBingo | null; card: BingoCard | null
  progress: number; streak: number; reward: number
} {
  const s = useBingoStore.getState()
  const card = s.dailyBingo ? s.cards.find((c) => c.id === s.dailyBingo.cardId) ?? null : null
  return { daily: s.dailyBingo, card, progress: s.getDailyProgress(), streak: s.currentStreak, reward: s.getDailyReward() }
}

/** 8-stat grid for dashboard layout. */
export function getStatsGrid(): Array<{ label: string; value: number | string; sublabel: string }> {
  const s = useBingoStore.getState()
  const completed = s.gameHistory.filter((h) => h.patterns.length > 0)
  const avgScore = completed.length > 0 ? Math.round(completed.reduce((sum, h) => sum + h.score, 0) / completed.length) : 0
  const avgTime = completed.length > 0 ? formatDuration(completed.reduce((sum, h) => sum + h.duration, 0) / completed.length) : '0:00'
  return [
    { label: 'Games Played', value: s.totalGamesPlayed, sublabel: 'all time' },
    { label: 'Bingos Achieved', value: s.totalBingos, sublabel: 'total patterns' },
    { label: 'Best Score', value: s.bestScore, sublabel: 'personal best' },
    { label: 'Daily Streak', value: s.currentStreak, sublabel: `longest: ${s.longestStreak}` },
    { label: 'Win Rate', value: `${getBingoOverview().winRate}%`, sublabel: 'completed games' },
    { label: 'Avg Score', value: avgScore, sublabel: 'per completed game' },
    { label: 'Avg Time', value: avgTime, sublabel: 'per completed game' },
    { label: 'Words Marked', value: s.totalWordsMarked, sublabel: 'total' },
  ]
}

/** Recent game history entries, newest first. */
export function getHistoryList(limit: number = 20): Array<{
  id: string; score: number; patterns: string[]; duration: string
  difficulty: Difficulty; completedAt: string; wordsMarked: number
}> {
  return useBingoStore.getState().gameHistory.slice(0, limit).map((h) => ({
    id: h.id, score: h.score, patterns: h.patterns,
    duration: formatDuration(h.duration), difficulty: h.difficulty,
    completedAt: new Date(h.completedAt).toLocaleString(), wordsMarked: h.wordsMarked,
  }))
}

/** All achievements with progress and unlock status. */
export function getAchievementGrid(): Array<{
  id: string; name: string; description: string; icon: string
  unlocked: boolean; progress: number; target: number
}> {
  const s = useBingoStore.getState()
  const progressMap: Record<string, number> = {
    'first-bingo': Math.min(s.totalBingos, 1),
    'speed-demon': s.gameHistory.some((h) => h.duration < 120_000 && h.patterns.length > 0) ? 1 : 0,
    'pattern-master': s.unlockedPatterns.length,
    'blackout-king': s.unlockedPatterns.includes('blackout') ? 1 : 0,
    'streak-master': s.currentStreak,
    'word-hunter': s.totalWordsMarked,
    'veteran': s.totalGamesPlayed,
    'high-scorer': s.bestScore,
    'multi-bingo': s.gameHistory.some((h) => h.patterns.length >= 3) ? 1 : 0,
    'daily-devotee': s.currentStreak,
    'word-savant': s.totalWordsMarked,
    'centurion': s.totalGamesPlayed,
  }
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id, name: def.name, description: def.description, icon: def.icon,
    unlocked: s.achievements.includes(def.id),
    progress: progressMap[def.id] ?? 0, target: def.target,
  }))
}

/** AI-suggested next words to mark, ordered by strategic value. */
export function getSuggestedWords(count: number = 5): Array<{ word: string; score: number; reason: string }> {
  const hint = useBingoStore.getState().autoMarkHint()
  const s = useBingoStore.getState()
  const card = s.activeCardId ? s.cards.find((c) => c.id === s.activeCardId) : null
  if (!card) return []

  const unmarked = card.cells.filter((c) => !c.marked && !c.isFree)
  const scored = unmarked.map((cell) => {
    const hypo = card.cells.map((c) =>
      c.index === cell.index ? { ...c, marked: true } : c
    )
    let patternScore = 0
    for (const pattern of BINGO_PATTERNS) {
      if (card.completedPatterns.includes(pattern.id)) continue
      patternScore += pattern.check(hypo as BingoCell[])
        ? pattern.rewardMultiplier * 10 : pattern.rewardMultiplier
    }
    return { word: cell.word, score: patternScore }
  })
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, count).map((s, i) => ({
    word: s.word, score: s.score,
    reason: i === 0 && hint === s.word ? 'Best strategic move' : 'Helps patterns',
  }))
}

/** Returns the word pool, optionally filtered by difficulty. */
export function getWordPoolByDifficulty(difficulty?: Difficulty): Record<Difficulty, string[]> {
  if (difficulty) return { easy: [], medium: [], hard: [], [difficulty]: WORD_POOL[difficulty] }
  return { ...WORD_POOL }
}

/** Calculates the final score with all bonuses applied. */
export function calculateScore(
  baseScore: number, patterns: string[], durationMs: number, comboMax: number
): { base: number; patternBonus: number; speedBonus: number; comboBonus: number; total: number } {
  const patternBonus = patterns.reduce((sum, pid) => {
    const p = BINGO_PATTERNS.find((bp) => bp.id === pid)
    return sum + (p ? p.rewardMultiplier * 50 : 0)
  }, 0)
  const speedBonus = durationMs < 60_000 ? 200 : durationMs < 120_000 ? 100 : durationMs < 300_000 ? 50 : 0
  const comboBonus = comboMax * 15
  return { base: baseScore, patternBonus, speedBonus, comboBonus, total: baseScore + patternBonus + speedBonus + comboBonus }
}

/** Returns definition and metadata for a specific pattern by ID. */
export function getPatternDefinition(patternId: string): BingoPattern | null {
  return BINGO_PATTERNS.find((p) => p.id === patternId) ?? null
}

/** Returns aggregated weekly stats (last 7 days). */
export function getWeeklyStats(): {
  gamesPlayed: number; bingosAchieved: number; wordsMarked: number; avgScore: number; topScore: number
} {
  const s = useBingoStore.getState()
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const games = s.gameHistory.filter((h) => h.completedAt > weekAgo)
  const completed = games.filter((h) => h.patterns.length > 0)
  return {
    gamesPlayed: games.length,
    bingosAchieved: games.reduce((sum, h) => sum + h.patterns.length, 0),
    wordsMarked: completed.reduce((sum, h) => sum + h.wordsMarked, 0),
    avgScore: completed.length > 0 ? Math.round(completed.reduce((sum, h) => sum + h.score, 0) / completed.length) : 0,
    topScore: completed.length > 0 ? Math.max(...completed.map((h) => h.score)) : 0,
  }
}

/** Returns aggregated monthly stats (last 30 days). */
export function getMonthlyStats(): {
  gamesPlayed: number; bingosAchieved: number; wordsMarked: number
  avgScore: number; topScore: number; uniquePatterns: number
} {
  const s = useBingoStore.getState()
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const games = s.gameHistory.filter((h) => h.completedAt > monthAgo)
  const completed = games.filter((h) => h.patterns.length > 0)
  return {
    gamesPlayed: games.length,
    bingosAchieved: games.reduce((sum, h) => sum + h.patterns.length, 0),
    wordsMarked: completed.reduce((sum, h) => sum + h.wordsMarked, 0),
    avgScore: completed.length > 0 ? Math.round(completed.reduce((sum, h) => sum + h.score, 0) / completed.length) : 0,
    topScore: completed.length > 0 ? Math.max(...completed.map((h) => h.score)) : 0,
    uniquePatterns: new Set(games.flatMap((h) => h.patterns)).size,
  }
}

/** Validates a bingo card (25 cells, unique words, FREE center). */
export function validateCard(cardId: string): { valid: boolean; errors: string[] } {
  const card = useBingoStore.getState().cards.find((c) => c.id === cardId)
  if (!card) return { valid: false, errors: ['Card not found'] }
  const errors: string[] = []
  if (card.cells.length !== 25) errors.push(`Expected 25 cells, got ${card.cells.length}`)
  const nonFree = card.cells.filter((c) => !c.isFree).map((c) => c.word.toLowerCase())
  if (new Set(nonFree).size !== nonFree.length) errors.push('Duplicate words detected')
  if (!card.cells.some((c) => c.isFree && c.row === 2 && c.col === 2)) errors.push('Missing FREE center cell')
  return { valid: errors.length === 0, errors }
}

/** Returns the total number of bingo cards generated. */
export function getCardCount(): number {
  return useBingoStore.getState().cards.length
}

/** Formats milliseconds into a human-readable game time string. */
export function formatGameTime(ms: number): string {
  return formatDuration(ms)
}

/** Checks if any game is currently active. */
export function isGameActive(): boolean {
  const g = useBingoStore.getState().currentGame
  return g !== null && g.status === 'playing'
}

/** Returns word frequency map across all game history. */
export function getWordFrequency(): Map<string, number> {
  const s = useBingoStore.getState()
  const freq = new Map<string, number>()
  for (const entry of s.gameHistory) {
    const card = s.cards.find((c) => c.id === entry.cardId)
    if (!card) continue
    for (const cell of card.cells.filter((c) => c.marked && !c.isFree)) {
      const w = cell.word.toLowerCase()
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  return freq
}

/** Returns a human-readable label for a difficulty level. */
export function getDifficultyLabel(d: Difficulty): string {
  return d === 'easy' ? 'Easy (Common)' : d === 'medium' ? 'Medium (Mixed)' : 'Hard (Rare)'
}

/** Returns all pattern IDs and names as a flat list (for selects/lists). */
export function getAllPatternIds(): Array<{ id: string; name: string; difficulty: Difficulty }> {
  return BINGO_PATTERNS.map((p) => ({ id: p.id, name: p.name, difficulty: p.difficulty }))
}

/** Returns the count of unlocked achievements. */
export function getRecentAchievementCount(): number {
  const s = useBingoStore.getState()
  if (s.achievements.length === 0) return 0
  return s.achievements.length
}

/** Returns how many cells remain unmarked on the active card. */
export function getRemainingCellCount(): number {
  const s = useBingoStore.getState()
  if (!s.activeCardId) return 0
  const card = s.cards.find((c) => c.id === s.activeCardId)
  if (!card) return 0
  return card.cells.filter((c) => !c.marked && !c.isFree).length
}

/** Returns the top N most-used words across all history. */
export function getTopWords(limit: number = 10): Array<{ word: string; count: number }> {
  const freq = getWordFrequency()
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}

// =============================================================================
// Extended UI Helper Functions — Advanced Analysis & Display
// =============================================================================

/**
 * Returns detailed per-pattern progress for the active card.
 * Each entry shows how many cells out of total are marked for that pattern.
 */
export function getPatternProgressMap(): Array<{
  id: string
  name: string
  total: number
  marked: number
  completed: boolean
  percent: number
}> {
  const s = useBingoStore.getState()
  if (!s.activeCardId) return []

  const card = s.cards.find((c) => c.id === s.activeCardId)
  if (!card) return []

  return BINGO_PATTERNS.map((pattern) => {
    // Count cells involved in this pattern
    const involved = new Set<number>()
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const cell = card.cells[row * 5 + col]
        const hypo = card.cells.map((c, i) =>
          i === row * 5 + col ? { ...c, marked: false } : c
        )
        // Check if removing this cell breaks the pattern
        const fullCheck = pattern.check(card.cells)
        const withoutCheck = pattern.check(hypo as BingoCell[])
        if (fullCheck !== withoutCheck) {
          involved.add(row * 5 + col)
        }
      }
    }

    // If pattern is not yet checkable, count based on pattern type
    let total = involved.size || 5
    const marked = card.cells.filter(
      (c) => involved.has(c.index) && (c.marked || c.isFree)
    ).length

    return {
      id: pattern.id,
      name: pattern.name,
      total,
      marked,
      completed: card.completedPatterns.includes(pattern.id),
      percent: total > 0 ? Math.round((marked / total) * 100) : 0,
    }
  })
}

/**
 * Returns a detailed score breakdown for the current active game.
 * Includes base, pattern, speed, and combo components.
 */
export function getScoreBreakdown(): {
  base: number
  patternBonus: number
  estimatedCombo: number
  estimatedSpeed: number
  total: number
} | null {
  const s = useBingoStore.getState()
  if (!s.currentGame) return null

  const { score, completedPatterns, comboCount, startTime } = s.currentGame
  const elapsed = Date.now() - startTime

  const patternBonus = completedPatterns.reduce((sum, pid) => {
    const p = BINGO_PATTERNS.find((bp) => bp.id === pid)
    return sum + (p ? p.rewardMultiplier * 50 : 0)
  }, 0)

  const estimatedCombo = comboCount * 15
  const estimatedSpeed =
    elapsed < 60_000 ? 200 : elapsed < 120_000 ? 100 : elapsed < 300_000 ? 50 : 0

  const base = score - patternBonus - estimatedCombo - estimatedSpeed

  return {
    base: Math.max(0, base),
    patternBonus,
    estimatedCombo,
    estimatedSpeed,
    total: score,
  }
}

/**
 * Returns a detailed analysis of a completed game from history.
 * Includes patterns completed, words per minute, and scoring efficiency.
 */
export function getGameAnalysis(
  historyEntryId: string
): {
  found: boolean
  score: number
  duration: string
  patternsCompleted: number
  patternNames: string[]
  wordsPerMinute: number
  scoringEfficiency: number
  difficulty: string
} {
  const s = useBingoStore.getState()
  const entry = s.gameHistory.find((h) => h.id === historyEntryId)

  if (!entry) {
    return {
      found: false, score: 0, duration: '0:00',
      patternsCompleted: 0, patternNames: [],
      wordsPerMinute: 0, scoringEfficiency: 0, difficulty: 'N/A',
    }
  }

  const durationMin = entry.duration / 60_000
  const wordsPerMinute = durationMin > 0
    ? Math.round(entry.wordsMarked / durationMin)
    : 0

  // Scoring efficiency: score per word marked
  const scoringEfficiency = entry.wordsMarked > 0
    ? Math.round(entry.score / entry.wordsMarked)
    : 0

  const patternNames = entry.patterns.map((pid) => {
    const p = BINGO_PATTERNS.find((bp) => bp.id === pid)
    return p ? p.name : pid
  })

  return {
    found: true,
    score: entry.score,
    duration: formatDuration(entry.duration),
    patternsCompleted: entry.patterns.length,
    patternNames,
    wordsPerMinute,
    scoringEfficiency,
    difficulty: getDifficultyLabel(entry.difficulty),
  }
}

/**
 * Returns all words currently on the active card as a flat array.
 */
export function getActiveCardWords(): Array<{
  word: string
  row: number
  col: number
  marked: boolean
  isFree: boolean
}> {
  const s = useBingoStore.getState()
  if (!s.activeCardId) return []

  const card = s.cards.find((c) => c.id === s.activeCardId)
  if (!card) return []

  return card.cells.map((c) => ({
    word: c.word,
    row: c.row,
    col: c.col,
    marked: c.marked || c.isFree,
    isFree: c.isFree,
  }))
}

/**
 * Returns unmarked words remaining on the active card.
 */
export function getUnmarkedWordsOnCard(): string[] {
  const words = getActiveCardWords()
  return words.filter((w) => !w.marked && !w.isFree).map((w) => w.word)
}

/**
 * Returns the overall completion rate across all pattern types.
 * E.g., if 8 of 19 patterns have been unlocked, returns ~42%.
 */
export function getPatternCompletionRate(): {
  unlocked: number
  total: number
  percent: number
} {
  const s = useBingoStore.getState()
  const total = BINGO_PATTERNS.length
  const unlocked = s.unlockedPatterns.length
  return {
    unlocked,
    total,
    percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  }
}

/**
 * Returns recent game history filtered by a specific difficulty.
 */
export function getRecentGamesByDifficulty(
  difficulty: Difficulty,
  limit: number = 10
): Array<{
  id: string
  score: number
  patterns: string[]
  duration: string
  completedAt: string
}> {
  const s = useBingoStore.getState()
  return s.gameHistory
    .filter((h) => h.difficulty === difficulty)
    .slice(0, limit)
    .map((h) => ({
      id: h.id,
      score: h.score,
      patterns: h.patterns,
      duration: formatDuration(h.duration),
      completedAt: new Date(h.completedAt).toLocaleString(),
    }))
}

/**
 * Returns the current game's elapsed time in milliseconds.
 * Useful for displaying a live timer in the UI.
 */
export function getGameElapsedMs(): number {
  const s = useBingoStore.getState()
  if (!s.currentGame) return 0
  return Date.now() - s.currentGame.startTime
}

/**
 * Returns the daily bingo status for today — whether it's been generated,
 * completed, and how many cells are marked.
 */
export function getTodayDailyStatus(): {
  generated: boolean
  completed: boolean
  markedCells: number
  totalCells: number
  percent: number
  reward: number
} {
  const s = useBingoStore.getState()
  const today = getTodayString()

  if (!s.dailyBingo || s.dailyBingo.date !== today) {
    return {
      generated: false, completed: false,
      markedCells: 0, totalCells: 25, percent: 0, reward: 0,
    }
  }

  const card = s.cards.find((c) => c.id === s.dailyBingo.cardId)
  const markedCells = card
    ? card.cells.filter((c) => c.marked || c.isFree).length
    : 0

  return {
    generated: true,
    completed: s.dailyBingo.completed,
    markedCells,
    totalCells: 25,
    percent: Math.round((markedCells / 25) * 100),
    reward: s.dailyBingo.completed ? s.getDailyReward() : 0,
  }
}

// Standalone wrappers for store actions
export function doGenerateCard(difficulty: string) { return useBingoStore.getState().generateCard(difficulty as any) }
export function doShuffleCard() { useBingoStore.getState().shuffleCard() }
export function doMarkWord(word: string) { useBingoStore.getState().markWord(word) }
export function doCheckBingo() { return useBingoStore.getState().checkBingo() }
export function doUnmarkWord(word: string) { useBingoStore.getState().unmarkWord(word) }
export function doGetAutoMarkHint() { return useBingoStore.getState().autoMarkHint() }
export function doStartGame(cardId: string) { useBingoStore.getState().startGame(cardId) }
export function doEndGame() { useBingoStore.getState().endGame() }
export function doResetGame() { useBingoStore.getState().resetGame() }
export function doInitBingoSystem() { /* no-op, zustand auto-initializes */ }
