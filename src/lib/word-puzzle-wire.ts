/**
 * word-puzzle-wire.ts
 *
 * Standalone word puzzle challenges wire for the Word Snake game.
 * Provides crossword, anagram, word-search, word-scramble, and word-chain
 * mini-games, along with stats tracking, rewards, and UI helpers.
 *
 * Persistence: localStorage under key `ws_word_puzzle`.
 * NO React imports — pure TypeScript logic, all functions exported.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_word_puzzle'

const WORD_POOL_EASY = [
  'cat', 'dog', 'run', 'hat', 'cup', 'map', 'pen', 'box', 'sun', 'red',
  'big', 'top', 'fly', 'net', 'jam', 'fog', 'gem', 'log', 'rug', 'dam',
  'apple', 'beach', 'chair', 'dance', 'flame', 'grape', 'house', 'lemon',
  'music', 'plant', 'river', 'stone', 'tiger', 'whale', 'world', 'dream',
]

const WORD_POOL_MEDIUM = [
  'bridge', 'castle', 'dragon', 'engine', 'forest', 'garden', 'hammer',
  'island', 'jungle', 'knight', 'market', 'nature', 'orange', 'planet',
  'rocket', 'silver', 'temple', 'unique', 'valley', 'window', 'zombie',
  'anchor', 'basket', 'candle', 'dinner', 'fabric', 'gentle', 'hazard',
]

const WORD_POOL_HARD = [
  'abstract', 'blankets', 'calendar', 'darkness', 'elephants', 'fireplace',
  'graceful', 'handsome', 'illustrate', 'junkyard', 'keyboard', 'labyrinth',
  'machinery', 'narrative', 'obstacle', 'parachute', 'quicksand', 'rainfall',
  'skeleton', 'treasure', 'umbrella', 'vacation', 'waterfall', 'xylophone',
]

const WORD_POOL_CHAIN = [
  ...WORD_POOL_EASY, ...WORD_POOL_MEDIUM, ...WORD_POOL_HARD,
  'cat', 'tree', 'eagle', 'echo', 'orange', 'ice', 'elbow', 'owl', 'lamp',
  'pine', 'egg', 'grape', 'ear', 'rat', 'tiger', 'rose', 'elm', 'moon',
  'nest', 'toast', 'time', 'apple', 'edge', 'earth', 'tea', 'ant', 'ten',
  'net', 'top', 'pot', 'tap', 'pan', 'nap', 'kit', 'king', 'golf', 'fig',
]

const WORD_SEARCH_THEMES: Record<string, string[]> = {
  animals: ['cat', 'dog', 'lion', 'tiger', 'bear', 'wolf', 'deer', 'fox', 'owl', 'eagle', 'fish', 'frog'],
  fruits: ['apple', 'grape', 'lemon', 'mango', 'peach', 'plum', 'berry', 'kiwi', 'pear', 'lime'],
  colors: ['red', 'blue', 'green', 'pink', 'gold', 'gray', 'teal', 'cyan', 'navy', 'ruby'],
  space: ['star', 'moon', 'mars', 'sun', 'comet', 'orbit', 'venus', 'pluto', 'earth', 'nebula'],
}

const CROSSWORD_CLUES: Record<string, string> = {
  cat: 'A furry pet that purrs',
  dog: "Man's best friend",
  run: 'To move faster than walking',
  hat: 'Worn on the head',
  cup: 'You drink from this',
  map: 'Shows you where to go',
  pen: 'Used for writing in ink',
  box: 'A container with six sides',
  sun: 'The star at the center of our solar system',
  red: 'The color of a rose',
  big: 'Large in size',
  top: 'The highest point',
  fly: 'What birds do in the sky',
  net: 'Used to catch fish',
  jam: 'Spread on toast',
  fog: 'Thick mist near the ground',
  gem: 'A precious stone',
  log: 'A piece of a fallen tree',
  rug: 'A floor covering',
  dam: 'A barrier across a river',
  apple: 'A fruit that keeps the doctor away',
  beach: 'Sandy shore by the sea',
  chair: 'You sit on this',
  dance: 'Moving rhythmically to music',
  flame: 'The visible part of fire',
  grape: 'A small round fruit, often purple',
  house: 'A place to live',
  lemon: 'A sour yellow fruit',
  music: 'Organized sound, often melodic',
  plant: 'A living organism that grows in soil',
  river: 'A large natural stream of water',
  stone: 'A hard solid piece of rock',
  tiger: 'A large striped cat',
  whale: 'The largest mammal in the ocean',
  world: 'The earth and all its people',
  dream: 'Images and feelings during sleep',
  bridge: 'A structure spanning over a gap',
  castle: 'A large medieval fortified building',
  dragon: 'A mythical fire-breathing creature',
  engine: 'A machine that converts energy',
  forest: 'A large area covered with trees',
  garden: 'A plot for growing flowers or vegetables',
  hammer: 'A tool for driving nails',
  island: 'Land surrounded by water',
  jungle: 'A dense tropical forest',
  knight: 'A medieval mounted warrior',
  market: 'A place where goods are sold',
  nature: 'The phenomena of the physical world',
  orange: 'A round citrus fruit',
  planet: 'A celestial body orbiting a star',
  rocket: 'A vehicle propelled by jet engines',
  silver: 'A precious shiny metal',
  temple: 'A building for religious worship',
  unique: 'One of a kind',
  valley: 'A low area between hills or mountains',
  window: 'An opening in a wall for light and air',
  zombie: 'An undead creature in horror fiction',
  anchor: 'A heavy device to moor a ship',
  basket: 'A woven container',
  candle: 'A wax cylinder with a wick for light',
  dinner: 'The main meal of the day',
  fabric: 'Cloth or material for making clothes',
  gentle: 'Mild and kind in manner',
  hazard: 'A potential source of danger',
  abstract: 'Existing in thought, not physical',
  darkness: 'Absence of light',
  treasure: 'A collection of valuable things',
  umbrella: 'A device to protect from rain',
  waterfall: 'A cascade of water falling from height',
  calendar: 'A chart showing days, weeks, and months',
  elephants: 'The largest land animals',
  keyboard: 'A panel of keys for typing',
  machinery: 'Machines collectively',
  parachute: 'Used for slowing a fall from the sky',
  skeleton: 'The framework of bones in a body',
}

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250]

const PUZZLE_TYPES = ['crossword', 'anagram', 'wordSearch', 'scramble', 'wordChain'] as const
type PuzzleType = (typeof PUZZLE_TYPES)[number]

const DIRECTIONS = [
  { dr: 0, dc: 1 },   // right
  { dr: 1, dc: 0 },   // down
  { dr: 1, dc: 1 },   // diagonal down-right
  { dr: -1, dc: 1 },  // diagonal up-right
  { dr: 0, dc: -1 },  // left
  { dr: -1, dc: 0 },  // up
  { dr: -1, dc: -1 }, // diagonal up-left
  { dr: 1, dc: -1 },  // diagonal down-left
]

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrosswordCell {
  letter: string
  isBlank: boolean
  isRevealed: boolean
  number?: number
}

export interface CrosswordPuzzle {
  id: string
  size: number
  grid: CrosswordCell[][]
  words: Array<{ word: string; row: number; col: number; direction: 'across' | 'down' }>
  clues: { across: Array<{ number: number; clue: string; word: string }>; down: Array<{ number: number; clue: string; word: string }> }
  createdAt: number
}

export interface AnagramPuzzle {
  id: string
  original: string
  scrambled: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface WordSearchPuzzle {
  id: string
  gridSize: number
  grid: string[][]
  words: Array<{ word: string; startRow: number; startCol: number; endRow: number; endCol: number }>
  found: string[]
  theme: string
}

export interface ScramblePuzzle {
  id: string
  original: string
  scrambled: string
  difficulty: number
}

export interface WordChainState {
  words: string[]
  used: Set<string>
  category: string
  score: number
  startedAt: number
}

export interface PuzzlePlayRecord {
  type: PuzzleType
  difficulty: string
  score: number
  timeTaken: number
  solved: boolean
  timestamp: number
}

export interface PuzzleStats {
  totalPlayed: number
  solved: number
  averageTime: number
  byType: Partial<Record<PuzzleType, { played: number; solved: number; avgTime: number }>>
}

export interface PuzzleReward {
  type: PuzzleType
  score: number
  coins: number
  xp: number
  timestamp: number
}

export interface MilestoneReward {
  threshold: number
  coins: number
  xp: number
  claimed: boolean
}

export interface PuzzleCard {
  type: PuzzleType
  name: string
  description: string
  difficulty: string
  icon: string
  playedCount: number
}

export interface DailyPuzzleInfo {
  date: string
  type: PuzzleType
  puzzleId: string
  completed: boolean
}

// ── Internal persisted state ────────────────────────────────────────────────

interface PersistedState {
  crosswords: Record<string, CrosswordPuzzle>
  anagrams: Record<string, AnagramPuzzle>
  wordSearches: Record<string, WordSearchPuzzle>
  scrambles: Record<string, ScramblePuzzle>
  wordChain: WordChainState | null
  anagramStreak: number
  scrambleStats: { totalPlayed: number; solved: number; totalTime: number; streak: number }
  playHistory: PuzzlePlayRecord[]
  rewards: PuzzleReward[]
  dailyCompleted: Record<string, boolean>
}

const DEFAULT_STATE: PersistedState = {
  crosswords: {},
  anagrams: {},
  wordSearches: {},
  scrambles: {},
  wordChain: null,
  anagramStreak: 0,
  scrambleStats: { totalPlayed: 0, solved: 0, totalTime: 0, streak: 0 },
  playHistory: [],
  rewards: [],
  dailyCompleted: {},
}

// ── Storage helpers ──────────────────────────────────────────────────────────

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw)
    return {
      crosswords: parsed.crosswords ?? {},
      anagrams: parsed.anagrams ?? {},
      wordSearches: parsed.wordSearches ?? {},
      scrambles: parsed.scrambles ?? {},
      wordChain: parsed.wordChain ?? null,
      anagramStreak: parsed.anagramStreak ?? 0,
      scrambleStats: parsed.scrambleStats ?? { totalPlayed: 0, solved: 0, totalTime: 0, streak: 0 },
      playHistory: parsed.playHistory ?? [],
      rewards: parsed.rewards ?? [],
      dailyCompleted: parsed.dailyCompleted ?? {},
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function saveState(state: PersistedState): void {
  try {
    const serializable = {
      ...state,
      wordChain: state.wordChain
        ? { ...state.wordChain, used: Array.from(state.wordChain.used) as unknown as Set<string> }
        : null,
    }
    // Flatten the Set into an array for serialization
    if (serializable.wordChain) {
      ;(serializable.wordChain as unknown as Record<string, unknown>).used = Array.from(state.wordChain!.used)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // silent
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function wordRarity(word: string): number {
  return word.length <= 3 ? 1 : word.length <= 5 ? 2 : word.length <= 7 ? 3 : 4
}

// ── 1. Crossword Puzzle ──────────────────────────────────────────────────────

/**
 * Generate a crossword grid of the given size (5, 7, or 10).
 * Places words in across and down directions with intersection checks.
 */
export function generateCrossword(size: 5 | 7 | 10 = 5): CrosswordPuzzle {
  try {
    const pool = size <= 5 ? WORD_POOL_EASY : size <= 7 ? [...WORD_POOL_EASY, ...WORD_POOL_MEDIUM] : [...WORD_POOL_EASY, ...WORD_POOL_MEDIUM, ...WORD_POOL_HARD]
    const eligibleWords = pool.filter((w) => w.length <= size).sort((a, b) => b.length - a.length)

    const grid: CrosswordCell[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ letter: '', isBlank: true, isRevealed: false })),
    )

    const placed: Array<{ word: string; row: number; col: number; direction: 'across' | 'down' }> = []

    // Place first word horizontally in the center
    const firstWord = eligibleWords[0]
    const startCol = Math.floor((size - firstWord.length) / 2)
    const startRow = Math.floor(size / 2)
    for (let i = 0; i < firstWord.length; i++) {
      grid[startRow][startCol + i] = { letter: firstWord[i], isBlank: false, isRevealed: false }
    }
    placed.push({ word: firstWord, row: startRow, col: startCol, direction: 'across' })

    // Try to place more words
    for (const word of eligibleWords.slice(1)) {
      if (placed.length >= Math.floor(size * 1.5)) break

      let bestPlacement: { row: number; col: number; dir: 'across' | 'down' } | null = null

      for (const existing of placed) {
        for (let i = 0; i < word.length; i++) {
          for (let j = 0; j < existing.word.length; j++) {
            if (word[i].toUpperCase() !== existing.word[j].toUpperCase()) continue

            let row: number, col: number, dir: 'across' | 'down'
            if (existing.direction === 'across') {
              dir = 'down'
              row = existing.row - i
              col = existing.col + j
            } else {
              dir = 'across'
              row = existing.row + j
              col = existing.col - i
            }

            if (canPlaceWord(grid, word, row, col, dir, size)) {
              bestPlacement = { row, col, dir }
              break
            }
          }
          if (bestPlacement) break
        }
        if (bestPlacement) break
      }

      if (bestPlacement) {
        const { row, col, dir } = bestPlacement
        for (let i = 0; i < word.length; i++) {
          if (dir === 'across') {
            grid[row][col + i] = { letter: word[i], isBlank: false, isRevealed: false }
          } else {
            grid[row + i][col] = { letter: word[i], isBlank: false, isRevealed: false }
          }
        }
        placed.push({ word, row, col, direction: dir })
      }
    }

    // Assign cell numbers
    let cellNumber = 1
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c].isBlank) {
          const startsAcross = placed.some((p) => p.direction === 'across' && p.row === r && p.col === c)
          const startsDown = placed.some((p) => p.direction === 'down' && p.row === r && p.col === c)
          if (startsAcross || startsDown) {
            grid[r][c].number = cellNumber++
          }
        }
      }
    }

    // Build clues
    const acrossClues: CrosswordPuzzle['clues']['across'] = []
    const downClues: CrosswordPuzzle['clues']['down'] = []

    for (const p of placed) {
      const cell = grid[p.row][p.col]
      const clueText = CROSSWORD_CLUES[p.word] ?? `A ${p.word.length}-letter word`
      const clue = { number: cell.number ?? 0, clue: clueText, word: p.word }
      if (p.direction === 'across') acrossClues.push(clue)
      else downClues.push(clue)
    }

    acrossClues.sort((a, b) => a.number - b.number)
    downClues.sort((a, b) => a.number - b.number)

    const puzzle: CrosswordPuzzle = {
      id: generateId(),
      size,
      grid,
      words: placed,
      clues: { across: acrossClues, down: downClues },
      createdAt: Date.now(),
    }

    const state = loadState()
    state.crosswords[puzzle.id] = puzzle
    saveState(state)

    return puzzle
  } catch {
    return {
      id: generateId(), size, grid: [], words: [], clues: { across: [], down: [] }, createdAt: Date.now(),
    }
  }
}

function canPlaceWord(
  grid: CrosswordCell[][],
  word: string,
  row: number,
  col: number,
  dir: 'across' | 'down',
  size: number,
): boolean {
  const len = word.length
  const dr = dir === 'down' ? 1 : 0
  const dc = dir === 'across' ? 1 : 0
  const endR = row + dr * (len - 1)
  const endC = col + dc * (len - 1)

  if (row < 0 || col < 0 || endR >= size || endC >= size) return false

  // Check cell before and after word
  const beforeR = row - dr
  const beforeC = col - dc
  if (beforeR >= 0 && beforeC >= 0 && !grid[beforeR][beforeC].isBlank) return false

  const afterR = row + dr * len
  const afterC = col + dc * len
  if (afterR < size && afterC < size && !grid[afterR][afterC].isBlank) return false

  let intersections = 0
  for (let i = 0; i < len; i++) {
    const r = row + dr * i
    const c = col + dc * i
    const cell = grid[r][c]

    if (!cell.isBlank) {
      if (cell.letter !== word[i]) return false
      intersections++
    } else {
      // Check parallel neighbors for existing letters
      if (dir === 'across') {
        if (r > 0 && !grid[r - 1][c].isBlank) return false
        if (r < size - 1 && !grid[r + 1][c].isBlank) return false
      } else {
        if (c > 0 && !grid[r][c - 1].isBlank) return false
        if (c < size - 1 && !grid[r][c + 1].isBlank) return false
      }
    }
  }

  return intersections > 0
}

/** Get across and down clues for a crossword puzzle. */
export function getCrosswordClues(puzzleId: string): { across: Array<{ number: number; clue: string }>; down: Array<{ number: number; clue: string }> } {
  try {
    const state = loadState()
    const puzzle = state.crosswords[puzzleId]
    if (!puzzle) return { across: [], down: [] }
    return {
      across: puzzle.clues.across.map(({ number, clue }) => ({ number, clue })),
      down: puzzle.clues.down.map(({ number, clue }) => ({ number, clue })),
    }
  } catch {
    return { across: [], down: [] }
  }
}

/** Validate a cell answer in the crossword grid. */
export function checkCrosswordAnswer(puzzleId: string, row: number, col: number, letter: string): boolean {
  try {
    const state = loadState()
    const puzzle = state.crosswords[puzzleId]
    if (!puzzle || !puzzle.grid[row]?.[col]) return false
    return puzzle.grid[row][col].letter.toUpperCase() === letter.toUpperCase()
  } catch {
    return false
  }
}

/** Reveal a random empty (unrevealed) cell in the crossword. */
export function revealCrosswordHint(puzzleId: string): { row: number; col: number; letter: string } | null {
  try {
    const state = loadState()
    const puzzle = state.crosswords[puzzleId]
    if (!puzzle) return null

    const emptyCells: Array<{ row: number; col: number }> = []
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (!puzzle.grid[r][c].isBlank && !puzzle.grid[r][c].isRevealed) {
          emptyCells.push({ row: r, col: c })
        }
      }
    }
    if (emptyCells.length === 0) return null

    const pick = pickRandom(emptyCells)
    puzzle.grid[pick.row][pick.col].isRevealed = true
    saveState(state)

    return { row: pick.row, col: pick.col, letter: puzzle.grid[pick.row][pick.col].letter }
  } catch {
    return null
  }
}

/** Get crossword completion percentage (0–100). */
export function getCrosswordProgress(puzzleId: string): number {
  try {
    const state = loadState()
    const puzzle = state.crosswords[puzzleId]
    if (!puzzle) return 0

    let total = 0
    let revealed = 0
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (!puzzle.grid[r][c].isBlank) {
          total++
          if (puzzle.grid[r][c].isRevealed) revealed++
        }
      }
    }
    return total === 0 ? 0 : Math.round((revealed / total) * 100)
  } catch {
    return 0
  }
}

/** Calculate crossword score based on completion and speed. */
export function crosswordScore(puzzleId: string, timeTaken: number): number {
  try {
    const progress = getCrosswordProgress(puzzleId)
    const baseScore = progress * 10
    const timeBonus = Math.max(0, Math.round(500 - timeTaken * 2))
    return baseScore + timeBonus
  } catch {
    return 0
  }
}

// ── 2. Anagram Challenge ─────────────────────────────────────────────────────

/** Create an anagram puzzle from the word pool based on difficulty. */
export function generateAnagram(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): AnagramPuzzle {
  try {
    const pool =
      difficulty === 'easy' ? WORD_POOL_EASY :
      difficulty === 'medium' ? WORD_POOL_MEDIUM :
      WORD_POOL_HARD

    const filtered = pool.filter((w) => {
      const len = w.length
      if (difficulty === 'easy') return len >= 3 && len <= 5
      if (difficulty === 'medium') return len >= 5 && len <= 7
      return len >= 7
    })

    const word = pickRandom(filtered.length > 0 ? filtered : pool)
    const scrambled = shuffle(word.split('')).join('')

    const puzzle: AnagramPuzzle = {
      id: generateId(),
      original: word,
      scrambled: scrambled === word ? shuffle(word.split('')).join('') : scrambled,
      difficulty,
      category: 'general',
    }

    const state = loadState()
    state.anagrams[puzzle.id] = puzzle
    saveState(state)

    return puzzle
  } catch {
    return { id: generateId(), original: 'word', scrambled: 'drow', difficulty, category: 'general' }
  }
}

/** Check if the answer is a valid anagram of the original word. */
export function checkAnagram(answer: string, original: string): boolean {
  try {
    const normalize = (s: string) => s.toLowerCase().trim().split('').sort().join('')
    if (answer.toLowerCase() === original.toLowerCase()) return false // Must be rearranged
    return normalize(answer) === normalize(original)
  } catch {
    return false
  }
}

/** Get a hint for an anagram: reveals first and last letter. */
export function getAnagramHint(word: string): { first: string; last: string } {
  try {
    const w = word.trim()
    return { first: w[0].toUpperCase(), last: w[w.length - 1].toUpperCase() }
  } catch {
    return { first: '?', last: '?' }
  }
}

/** Get the current anagram solving streak. */
export function getAnagramStreak(): number {
  try {
    const state = loadState()
    return state.anagramStreak
  } catch {
    return 0
  }
}

/** Calculate anagram score based on difficulty, attempts, and time. */
export function scoreAnagram(difficulty: string, attempts: number, timeTaken: number): number {
  try {
    const diffMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
    const attemptPenalty = Math.max(0, (attempts - 1) * 25)
    const timeBonus = Math.max(0, Math.round(300 - timeTaken * 3))
    return Math.max(0, 100 * diffMultiplier - attemptPenalty + timeBonus)
  } catch {
    return 0
  }
}

/** Record an anagram result — updates streak and history. */
export function recordAnagramResult(puzzleId: string, solved: boolean, timeTaken: number, attempts: number): void {
  try {
    const state = loadState()
    const puzzle = state.anagrams[puzzleId]
    if (!puzzle) return

    if (solved) {
      state.anagramStreak++
    } else {
      state.anagramStreak = 0
    }

    const score = solved ? scoreAnagram(puzzle.difficulty, attempts, timeTaken) : 0
    state.playHistory.push({
      type: 'anagram',
      difficulty: puzzle.difficulty,
      score,
      timeTaken,
      solved,
      timestamp: Date.now(),
    })

    saveState(state)
  } catch {
    // silent
  }
}

// ── 3. Word Search ──────────────────────────────────────────────────────────

/** Generate a word search puzzle with hidden words in a grid. */
export function generateWordSearch(gridSize: number = 10, words?: string[]): WordSearchPuzzle {
  try {
    const themeKeys = Object.keys(WORD_SEARCH_THEMES)
    const theme = pickRandom(themeKeys)
    const themeWords = WORD_SEARCH_THEMES[theme]
    const selectedWords = words
      ? words.filter((w) => w.length <= gridSize)
      : shuffle(themeWords).slice(0, Math.min(6, Math.floor(gridSize / 2)))

    const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''))

    const placedWords: WordSearchPuzzle['words'] = []

    for (const word of selectedWords) {
      let wordPlaced = false
      const shuffledDirs = shuffle(DIRECTIONS)

      for (const dir of shuffledDirs) {
        if (wordPlaced) break

        const maxStartRow = gridSize - 1
        const maxStartCol = gridSize - 1

        for (let attempt = 0; attempt < 20; attempt++) {
          const startRow = Math.floor(Math.random() * maxStartRow)
          const startCol = Math.floor(Math.random() * maxStartCol)
          const endRow = startRow + dir.dr * (word.length - 1)
          const endCol = startCol + dir.dc * (word.length - 1)

          if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) continue

          let canPlace = true
          for (let i = 0; i < word.length; i++) {
            const r = startRow + dir.dr * i
            const c = startCol + dir.dc * i
            if (grid[r][c] !== '' && grid[r][c] !== word[i].toUpperCase()) {
              canPlace = false
              break
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              grid[startRow + dir.dr * i][startCol + dir.dc * i] = word[i].toUpperCase()
            }
            placedWords.push({ word: word.toUpperCase(), startRow, startCol, endRow, endCol })
            wordPlaced = true
            break
          }
        }
      }
    }

    // Fill remaining cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = alphabet[Math.floor(Math.random() * 26)]
        }
      }
    }

    const puzzle: WordSearchPuzzle = {
      id: generateId(),
      gridSize,
      grid,
      words: placedWords,
      found: [],
      theme,
    }

    const state = loadState()
    state.wordSearches[puzzle.id] = puzzle
    saveState(state)

    return puzzle
  } catch {
    const empty: WordSearchPuzzle = {
      id: generateId(), gridSize, grid: [], words: [], found: [], theme: 'general',
    }
    return empty
  }
}

/** Get the list of words to find in a word search puzzle. */
export function getWordSearchWords(puzzleId: string): string[] {
  try {
    const state = loadState()
    const puzzle = state.wordSearches[puzzleId]
    if (!puzzle) return []
    return puzzle.words.map((w) => w.word)
  } catch {
    return []
  }
}

/** Check if a word has been found in the word search. */
export function checkWordFound(puzzleId: string, word: string): boolean {
  try {
    const state = loadState()
    const puzzle = state.wordSearches[puzzleId]
    if (!puzzle) return false

    const normalized = word.toUpperCase()
    const wasAlreadyFound = puzzle.found.includes(normalized)
    const isHidden = puzzle.words.some((w) => w.word === normalized)

    if (isHidden && !wasAlreadyFound) {
      puzzle.found.push(normalized)
      saveState(state)
      return true
    }

    return wasAlreadyFound
  } catch {
    return false
  }
}

/** Get word search progress as a fraction (0–1). */
export function getWordSearchProgress(puzzleId: string): number {
  try {
    const state = loadState()
    const puzzle = state.wordSearches[puzzleId]
    if (!puzzle || puzzle.words.length === 0) return 0
    return puzzle.found.length / puzzle.words.length
  } catch {
    return 0
  }
}

/** Get list of words not yet found in the word search. */
export function getWordSearchRemaining(puzzleId: string): string[] {
  try {
    const state = loadState()
    const puzzle = state.wordSearches[puzzleId]
    if (!puzzle) return []
    return puzzle.words
      .map((w) => w.word)
      .filter((w) => !puzzle.found.includes(w))
  } catch {
    return []
  }
}

/** Calculate word search score based on words found and speed. */
export function wordSearchScore(puzzleId: string, timeTaken: number): number {
  try {
    const progress = getWordSearchProgress(puzzleId)
    const baseScore = Math.round(progress * 500)
    const timeBonus = Math.max(0, Math.round(300 - timeTaken))
    return baseScore + timeBonus
  } catch {
    return 0
  }
}

/** Record a word search completion. */
export function recordWordSearchResult(puzzleId: string, timeTaken: number): void {
  try {
    const state = loadState()
    const puzzle = state.wordSearches[puzzleId]
    if (!puzzle) return

    const progress = getWordSearchProgress(puzzleId)
    const score = wordSearchScore(puzzleId, timeTaken)

    state.playHistory.push({
      type: 'wordSearch',
      difficulty: puzzle.words.length <= 4 ? 'easy' : puzzle.words.length <= 6 ? 'medium' : 'hard',
      score,
      timeTaken,
      solved: progress >= 1,
      timestamp: Date.now(),
    })

    saveState(state)
  } catch {
    // silent
  }
}

// ── 4. Word Scramble ─────────────────────────────────────────────────────────

/** Scramble a word while keeping the first and last letter in place. */
export function generateScramble(word: string): ScramblePuzzle {
  try {
    const w = word.trim()
    if (w.length <= 2) {
      return { id: generateId(), original: w, scrambled: w, difficulty: 1 }
    }

    const first = w[0]
    const last = w[w.length - 1]
    const middle = w.slice(1, -1)

    let shuffledMiddle = shuffle(middle.split('')).join('')
    // Ensure it's actually different
    let attempts = 0
    while (shuffledMiddle === middle && attempts < 10) {
      shuffledMiddle = shuffle(middle.split('')).join('')
      attempts++
    }

    const scrambled = first + shuffledMiddle + last

    const puzzle: ScramblePuzzle = {
      id: generateId(),
      original: w,
      scrambled,
      difficulty: getScrambleDifficulty(w),
    }

    const state = loadState()
    state.scrambles[puzzle.id] = puzzle
    saveState(state)

    return puzzle
  } catch {
    return { id: generateId(), original: word, scrambled: word, difficulty: 1 }
  }
}

/** Check if the unscrambled answer matches the original word. */
export function checkScrambleAnswer(scrambled: string, original: string): boolean {
  try {
    return scrambled.trim().toLowerCase() === original.trim().toLowerCase()
  } catch {
    return false
  }
}

/** Compute scramble difficulty (1–10) based on word length and letter patterns. */
export function getScrambleDifficulty(word: string): number {
  try {
    const len = word.length
    let difficulty = 1

    if (len <= 3) difficulty = 1
    else if (len <= 5) difficulty = 3
    else if (len <= 7) difficulty = 5
    else if (len <= 9) difficulty = 7
    else difficulty = 9

    // Boost for repeated letters
    const letterCount: Record<string, number> = {}
    for (const ch of word) letterCount[ch] = (letterCount[ch] ?? 0) + 1
    const repeats = Object.values(letterCount).filter((c) => c > 1).length
    difficulty += repeats

    return Math.min(10, difficulty)
  } catch {
    return 1
  }
}

/** Get aggregate scramble stats: total played, solved, average time, streak. */
export function getScrambleStats(): { totalPlayed: number; solved: number; averageTime: number; streak: number } {
  try {
    const state = loadState()
    const s = state.scrambleStats
    const avgTime = s.totalPlayed > 0 ? Math.round(s.totalTime / s.totalPlayed) : 0
    return { totalPlayed: s.totalPlayed, solved: s.solved, averageTime: avgTime, streak: s.streak }
  } catch {
    return { totalPlayed: 0, solved: 0, averageTime: 0, streak: 0 }
  }
}

/** Record a scramble play result. */
export function recordScrambleResult(puzzleId: string, solved: boolean, timeTaken: number): void {
  try {
    const state = loadState()
    const puzzle = state.scrambles[puzzleId]

    state.scrambleStats.totalPlayed++
    state.scrambleStats.totalTime += timeTaken
    if (solved) {
      state.scrambleStats.solved++
      state.scrambleStats.streak++
    } else {
      state.scrambleStats.streak = 0
    }

    state.playHistory.push({
      type: 'scramble',
      difficulty: puzzle ? String(puzzle.difficulty) : 'unknown',
      score: solved ? Math.round(100 + (puzzle?.difficulty ?? 1) * 20 + Math.max(0, 200 - timeTaken * 2)) : 0,
      timeTaken,
      solved,
      timestamp: Date.now(),
    })

    saveState(state)
  } catch {
    // silent
  }
}

// ── 5. Word Chain ────────────────────────────────────────────────────────────

/** Start a new word chain game with an optional starting word and category. */
export function startWordChain(startWord?: string, category?: string): WordChainState {
  try {
    const word = startWord?.trim() || pickRandom(WORD_POOL_CHAIN)
    const cat = category || 'general'
    const chain: WordChainState = {
      words: [word],
      used: new Set([word.toLowerCase()]),
      category: cat,
      score: wordRarity(word) * 10,
      startedAt: Date.now(),
    }

    const state = loadState()
    state.wordChain = chain
    saveState(state)

    return chain
  } catch {
    const fallback: WordChainState = {
      words: ['snake'], used: new Set(['snake']), category: 'general', score: 20, startedAt: Date.now(),
    }
    return fallback
  }
}

/** Check if a word is valid for the current chain (starts with last letter, not used). */
export function isValidChainWord(word: string): boolean {
  try {
    const state = loadState()
    const chain = state.wordChain
    if (!chain || chain.words.length === 0) return true

    const normalized = word.toLowerCase().trim()
    if (normalized.length < 2) return false

    const lastWord = chain.words[chain.words.length - 1]
    const expectedStart = lastWord[lastWord.length - 1].toLowerCase()

    return normalized[0] === expectedStart && !chain.used.has(normalized)
  } catch {
    return false
  }
}

/** Add a valid word to the current word chain. */
export function addChainWord(word: string): boolean {
  try {
    if (!isValidChainWord(word)) return false

    const state = loadState()
    const chain = state.wordChain
    if (!chain) return false

    const normalized = word.trim()
    chain.words.push(normalized)
    chain.used.add(normalized.toLowerCase())
    chain.score += wordRarity(normalized) * 10 + chain.words.length * 5
    saveState(state)

    return true
  } catch {
    return false
  }
}

/** Get the current chain length. */
export function getChainLength(): number {
  try {
    const state = loadState()
    return state.wordChain?.words.length ?? 0
  } catch {
    return 0
  }
}

/** Get all words in the current chain. */
export function getChainWords(): string[] {
  try {
    const state = loadState()
    return state.wordChain?.words ?? []
  } catch {
    return []
  }
}

/** Get the current word chain score. */
export function getChainScore(): number {
  try {
    const state = loadState()
    return state.wordChain?.score ?? 0
  } catch {
    return 0
  }
}

/** End the current word chain and record the result. */
export function endWordChain(): number {
  try {
    const state = loadState()
    const chain = state.wordChain
    if (!chain) return 0

    const finalScore = chain.score
    const timeTaken = Math.round((Date.now() - chain.startedAt) / 1000)

    state.playHistory.push({
      type: 'wordChain',
      difficulty: chain.words.length <= 3 ? 'easy' : chain.words.length <= 7 ? 'medium' : 'hard',
      score: finalScore,
      timeTaken,
      solved: chain.words.length >= 5,
      timestamp: Date.now(),
    })

    state.wordChain = null
    saveState(state)

    return finalScore
  } catch {
    return 0
  }
}

// ── 6. Puzzle Stats ──────────────────────────────────────────────────────────

/** Get aggregate puzzle statistics. */
export function getPuzzleStats(): PuzzleStats {
  try {
    const state = loadState()
    const history = state.playHistory

    if (history.length === 0) {
      return { totalPlayed: 0, solved: 0, averageTime: 0, byType: {} }
    }

    const totalPlayed = history.length
    const solved = history.filter((h) => h.solved).length
    const totalTime = history.reduce((sum, h) => sum + h.timeTaken, 0)
    const averageTime = Math.round(totalTime / totalPlayed)

    const byType: PuzzleStats['byType'] = {}
    for (const type of PUZZLE_TYPES) {
      const typeHistory = history.filter((h) => h.type === type)
      if (typeHistory.length > 0) {
        const typeSolved = typeHistory.filter((h) => h.solved).length
        const typeTime = typeHistory.reduce((sum, h) => sum + h.timeTaken, 0)
        byType[type] = {
          played: typeHistory.length,
          solved: typeSolved,
          avgTime: Math.round(typeTime / typeHistory.length),
        }
      }
    }

    return { totalPlayed, solved, averageTime, byType }
  } catch {
    return { totalPlayed: 0, solved: 0, averageTime: 0, byType: {} }
  }
}

/** Get the current streak of consecutive puzzles solved. */
export function getPuzzleStreak(): number {
  try {
    const state = loadState()
    const history = [...state.playHistory].reverse()

    let streak = 0
    for (const record of history) {
      if (record.solved) streak++
      else break
    }
    return streak
  } catch {
    return 0
  }
}

/** Get top 5 scores for a given puzzle type. */
export function getBestScores(type: PuzzleType): Array<{ score: number; date: number; difficulty: string }> {
  try {
    const state = loadState()
    const typeHistory = state.playHistory
      .filter((h) => h.type === type)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return typeHistory.map((h) => ({ score: h.score, date: h.timestamp, difficulty: h.difficulty }))
  } catch {
    return []
  }
}

/** Get difficulty distribution (easy/medium/hard completion rates). */
export function getDifficultyDistribution(): Record<string, { played: number; completed: number; rate: number }> {
  try {
    const state = loadState()
    const history = state.playHistory
    const result: Record<string, { played: number; completed: number; rate: number }> = {
      easy: { played: 0, completed: 0, rate: 0 },
      medium: { played: 0, completed: 0, rate: 0 },
      hard: { played: 0, completed: 0, rate: 0 },
    }

    for (const record of history) {
      const diff = record.difficulty.toLowerCase()
      if (diff in result) {
        result[diff].played++
        if (record.solved) result[diff].completed++
      }
    }

    for (const key of Object.keys(result)) {
      const d = result[key]
      d.rate = d.played > 0 ? Math.round((d.completed / d.played) * 100) : 0
    }

    return result
  } catch {
    return { easy: { played: 0, completed: 0, rate: 0 }, medium: { played: 0, completed: 0, rate: 0 }, hard: { played: 0, completed: 0, rate: 0 } }
  }
}

/** Get a deterministic daily puzzle based on today's date. */
export function getDailyPuzzle(): DailyPuzzleInfo {
  try {
    const today = new Date().toISOString().split('T')[0]
    const state = loadState()
    const alreadyCompleted = state.dailyCompleted[today] ?? false

    // Deterministic selection based on date string hash
    let hash = 0
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0
    }
    const typeIndex = Math.abs(hash) % PUZZLE_TYPES.length
    const type = PUZZLE_TYPES[typeIndex]
    const puzzleId = `daily-${today}-${type}`

    return { date: today, type, puzzleId, completed: alreadyCompleted }
  } catch {
    return { date: new Date().toISOString().split('T')[0], type: 'crossword', puzzleId: 'daily-fallback', completed: false }
  }
}

/** Mark today's daily puzzle as completed and return the current daily streak. */
export function getDailyPuzzleStreak(): number {
  try {
    const state = loadState()
    const today = new Date().toISOString().split('T')[0]
    let streak = 0

    const checkDate = (d: string): void => {
      const date = new Date(d)
      date.setDate(date.getDate() - 1)
      const prev = date.toISOString().split('T')[0]
      if (state.dailyCompleted[prev]) {
        streak++
        checkDate(prev)
      }
    }

    if (state.dailyCompleted[today]) {
      streak = 1
      checkDate(today)
    }

    return streak
  } catch {
    return 0
  }
}

/** Mark the daily puzzle as completed. */
export function completeDailyPuzzle(): void {
  try {
    const today = new Date().toISOString().split('T')[0]
    const state = loadState()
    state.dailyCompleted[today] = true
    saveState(state)
  } catch {
    // silent
  }
}

// ── 7. Puzzle Rewards ────────────────────────────────────────────────────────

/** Claim puzzle rewards (coins + XP) based on type and score. */
export function claimPuzzleReward(type: PuzzleType, score: number): { coins: number; xp: number } {
  try {
    const coins = Math.max(1, Math.round(score / 10))
    const xp = Math.max(1, Math.round(score / 5))

    const reward: PuzzleReward = {
      type,
      score,
      coins,
      xp,
      timestamp: Date.now(),
    }

    const state = loadState()
    state.rewards.push(reward)
    saveState(state)

    return { coins, xp }
  } catch {
    return { coins: 0, xp: 0 }
  }
}

/** Get total lifetime earnings from puzzle rewards. */
export function getTotalPuzzleEarnings(): { coins: number; xp: number } {
  try {
    const state = loadState()
    const totalCoins = state.rewards.reduce((sum, r) => sum + r.coins, 0)
    const totalXp = state.rewards.reduce((sum, r) => sum + r.xp, 0)
    return { coins: totalCoins, xp: totalXp }
  } catch {
    return { coins: 0, xp: 0 }
  }
}

/** Get milestone rewards at 10, 25, 50, 100, 250 puzzles solved. */
export function getMilestoneRewards(): MilestoneReward[] {
  try {
    const stats = getPuzzleStats()
    const solved = stats.solved

    return MILESTONE_THRESHOLDS.map((threshold) => ({
      threshold,
      coins: threshold * 10,
      xp: threshold * 5,
      claimed: solved >= threshold,
    }))
  } catch {
    return MILESTONE_THRESHOLDS.map((t) => ({ threshold: t, coins: t * 10, xp: t * 5, claimed: false }))
  }
}

// ── 8. UI Helpers ────────────────────────────────────────────────────────────

/** Get pre-computed dashboard overview data. */
export function getPuzzleOverview(): {
  totalPlayed: number
  totalSolved: number
  solveRate: number
  currentStreak: number
  dailyCompleted: boolean
  topType: PuzzleType | null
  totalEarnings: { coins: number; xp: number }
  nextMilestone: { threshold: number; progress: number } | null
} {
  try {
    const stats = getPuzzleStats()
    const streak = getPuzzleStreak()
    const daily = getDailyPuzzle()
    const earnings = getTotalPuzzleEarnings()
    const milestones = getMilestoneRewards()

    const solveRate = stats.totalPlayed > 0 ? Math.round((stats.solved / stats.totalPlayed) * 100) : 0

    // Find most-played type
    let topType: PuzzleType | null = null
    let maxPlayed = 0
    for (const type of PUZZLE_TYPES) {
      const typeStats = stats.byType[type]
      if (typeStats && typeStats.played > maxPlayed) {
        maxPlayed = typeStats.played
        topType = type
      }
    }

    // Next milestone
    const nextUnclaimed = milestones.find((m) => !m.claimed)
    const nextMilestone = nextUnclaimed
      ? { threshold: nextUnclaimed.threshold, progress: Math.min(100, Math.round((stats.solved / nextUnclaimed.threshold) * 100)) }
      : null

    return {
      totalPlayed: stats.totalPlayed,
      totalSolved: stats.solved,
      solveRate,
      currentStreak: streak,
      dailyCompleted: daily.completed,
      topType,
      totalEarnings: earnings,
      nextMilestone,
    }
  } catch {
    return {
      totalPlayed: 0, totalSolved: 0, solveRate: 0, currentStreak: 0,
      dailyCompleted: false, topType: null, totalEarnings: { coins: 0, xp: 0 }, nextMilestone: null,
    }
  }
}

/** Get a list of available puzzle types with their difficulty levels. */
export function getAvailablePuzzles(): Array<{ type: PuzzleType; name: string; difficulty: string; description: string }> {
  return [
    { type: 'crossword', name: 'Crossword', difficulty: 'Medium', description: 'Fill in the grid using across and down clues' },
    { type: 'anagram', name: 'Anagram', difficulty: 'Easy', description: 'Rearrange letters to form a valid word' },
    { type: 'wordSearch', name: 'Word Search', difficulty: 'Easy', description: 'Find hidden words in the letter grid' },
    { type: 'scramble', name: 'Word Scramble', difficulty: 'Medium', description: 'Unscramble a word with fixed first and last letters' },
    { type: 'wordChain', name: 'Word Chain', difficulty: 'Hard', description: 'Build a chain where each word starts with the last letter' },
  ]
}

/** Get a formatted card for a specific puzzle type. */
export function getPuzzleCard(type: PuzzleType): PuzzleCard {
  try {
    const stats = getPuzzleStats()
    const typeStats = stats.byType[type]
    const bestScores = getBestScores(type)

    const cards: Record<PuzzleType, PuzzleCard> = {
      crossword: {
        type: 'crossword', name: 'Crossword', description: 'Fill the grid with interlocking words',
        difficulty: 'Medium', icon: '🧩', playedCount: typeStats?.played ?? 0,
      },
      anagram: {
        type: 'anagram', name: 'Anagram', description: 'Rearrange the letters to find the word',
        difficulty: 'Easy', icon: '🔀', playedCount: typeStats?.played ?? 0,
      },
      wordSearch: {
        type: 'wordSearch', name: 'Word Search', description: 'Find all hidden words in the grid',
        difficulty: 'Easy', icon: '🔍', playedCount: typeStats?.played ?? 0,
      },
      scramble: {
        type: 'scramble', name: 'Word Scramble', description: 'Unscramble letters while first and last stay put',
        difficulty: 'Medium', icon: '🔤', playedCount: typeStats?.played ?? 0,
      },
      wordChain: {
        type: 'wordChain', name: 'Word Chain', description: 'Link words by their last letter',
        difficulty: 'Hard', icon: '⛓️', playedCount: typeStats?.played ?? 0,
      },
    }

    return cards[type]
  } catch {
    return { type, name: type, description: '', difficulty: 'Medium', icon: '❓', playedCount: 0 }
  }
}

/** Get a random quick-play puzzle of any type. */
export function getQuickPuzzle(): { type: PuzzleType; puzzleId: string; data: unknown } {
  try {
    const type = pickRandom([...PUZZLE_TYPES])

    switch (type) {
      case 'crossword': {
        const puzzle = generateCrossword(5)
        return { type, puzzleId: puzzle.id, data: puzzle }
      }
      case 'anagram': {
        const puzzle = generateAnagram('easy')
        return { type, puzzleId: puzzle.id, data: puzzle }
      }
      case 'wordSearch': {
        const puzzle = generateWordSearch(8)
        return { type, puzzleId: puzzle.id, data: puzzle }
      }
      case 'scramble': {
        const word = pickRandom([...WORD_POOL_MEDIUM, ...WORD_POOL_EASY])
        const puzzle = generateScramble(word)
        return { type, puzzleId: puzzle.id, data: puzzle }
      }
      case 'wordChain': {
        const chain = startWordChain()
        return { type, puzzleId: `chain-${Date.now()}`, data: chain }
      }
    }
  } catch {
    const fallbackAnagram = generateAnagram('easy')
    return { type: 'anagram', puzzleId: fallbackAnagram.id, data: fallbackAnagram }
  }
}

/** Get today's daily challenge puzzle. */
export function getDailyChallenge(): { type: PuzzleType; puzzleId: string; data: unknown } {
  try {
    const daily = getDailyPuzzle()

    switch (daily.type) {
      case 'crossword': {
        const puzzle = generateCrossword(7)
        return { type: daily.type, puzzleId: daily.puzzleId, data: puzzle }
      }
      case 'anagram': {
        const puzzle = generateAnagram('medium')
        return { type: daily.type, puzzleId: daily.puzzleId, data: puzzle }
      }
      case 'wordSearch': {
        const puzzle = generateWordSearch(10)
        return { type: daily.type, puzzleId: daily.puzzleId, data: puzzle }
      }
      case 'scramble': {
        const word = pickRandom(WORD_POOL_HARD)
        const puzzle = generateScramble(word)
        return { type: daily.type, puzzleId: daily.puzzleId, data: puzzle }
      }
      case 'wordChain': {
        const chain = startWordChain(undefined, 'daily')
        return { type: daily.type, puzzleId: daily.puzzleId, data: chain }
      }
    }
  } catch {
    const fallback = generateAnagram('medium')
    return { type: 'anagram', puzzleId: 'daily-fallback', data: fallback }
  }
}
