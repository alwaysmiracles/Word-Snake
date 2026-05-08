// mini-arcade-wire.ts — SSR-safe wire module
// Prefix: ar | NO React | NO localStorage/window | NO setInterval

// ─── Types ────────────────────────────────────────────────────────────────────

type GameId = 'word-memory' | 'word-shooter' | 'word-sort' | 'word-chain' | 'letter-rain' | 'word-search-blitz' | 'anagram-rush' | 'word-math'
type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

interface GameDef {
  id: GameId
  name: string
  description: string
  icon: string
  color: string
  unlocked: boolean
  unlockRequirement: string
  rules: string
}

interface HighScore {
  score: number
  grade: Grade
  date: string
  gamesPlayed: number
}

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  grade: Grade
  isPlayer: boolean
}

interface ARDailyChallenge {
  date: string
  gamesToPlay: GameId[]
  scores: Record<GameId, number | null>
  grades: Record<GameId, Grade | null>
  completed: boolean
  totalScore: number
  overallGrade: Grade | null
}

interface ActiveGame {
  id: GameId
  score: number
  startTime: number
  elapsed: number
  lives: number
  maxLives: number
  level: number
  wordsCompleted: number
  combo: number
  maxCombo: number
  paused: boolean
  data: Record<string, unknown>
}

interface ARAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

interface ArcadeStats {
  totalGamesPlayed: number
  totalScore: number
  totalTimeSpent: number
  totalWordsCompleted: number
  perfectGames: number
  totalTokensEarned: number
  totalTokensSpent: number
  gamesPerType: Record<GameId, number>
}

interface ARState {
  initialized: boolean
  games: GameDef[]
  highScores: Record<GameId, HighScore>
  leaderboards: Record<GameId, LeaderboardEntry[]>
  activeGame: ActiveGame | null
  tokens: number
  totalTokensEarned: number
  totalTokensSpent: number
  achievements: ARAchievement[]
  dailyChallenge: ARDailyChallenge
  dailyStreak: number
  stats: ArcadeStats
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GAME_DEFS: readonly { id: GameId; name: string; desc: string; icon: string; color: string; unlockReq: string; rules: string }[] = [
  { id: 'word-memory', name: 'Word Memory', desc: 'Match pairs of hidden word cards', icon: '🃏', color: '#22c55e', unlockReq: '', rules: 'Flip cards to find matching word pairs. Clear all pairs to win.' },
  { id: 'word-shooter', name: 'Word Shooter', desc: 'Type falling words before they reach the bottom', icon: '🔫', color: '#ef4444', unlockReq: '', rules: 'Words fall from the top. Type them correctly to destroy them.' },
  { id: 'word-sort', name: 'Word Sort', desc: 'Sort words into correct categories quickly', icon: '📊', color: '#3b82f6', unlockReq: '', rules: 'Words appear and you must sort them into the right categories.' },
  { id: 'word-chain', name: 'Word Chain', desc: 'Build word chains from the last letter', icon: '🔗', color: '#a855f7', unlockReq: '', rules: 'Each new word must start with the last letter of the previous word.' },
  { id: 'letter-rain', name: 'Letter Rain', desc: 'Catch falling letters to spell words', icon: '🌧️', color: '#06b6d4', unlockReq: 'Play 10 total games', rules: 'Letters rain down. Catch them in the right order to spell target words.' },
  { id: 'word-search-blitz', name: 'Word Search Blitz', desc: 'Find hidden words in a grid against the clock', icon: '🔍', color: '#f59e0b', unlockReq: 'Earn 2000 total score', rules: 'Find words hidden horizontally, vertically, and diagonally.' },
  { id: 'anagram-rush', name: 'Anagram Rush', desc: 'Unscramble words as fast as possible', icon: '🔀', color: '#ec4899', unlockReq: 'Play 25 total games', rules: 'Rearrange scrambled letters to form valid words.' },
  { id: 'word-math', name: 'Word Math', desc: 'Solve math problems to earn word points', icon: '🧮', color: '#eab308', unlockReq: 'Reach S grade in any game', rules: 'Solve math equations where numbers are replaced by word values.' },
]

const WORD_POOL: readonly string[] = [
  'cat','dog','run','jump','code','play','think','dream','light','dark',
  'fire','water','earth','wind','stone','gold','iron','wood','leaf','sky',
  'sun','moon','star','cloud','rain','snow','ice','flame','storm','wave',
  'mountain','river','ocean','forest','desert','island','valley','cave','lake','meadow',
  'eagle','wolf','bear','fox','deer','hawk','owl','fish','shark','whale',
  'sword','shield','bow','spear','arrow','axe','hammer','staff','wand','ring',
  'magic','power','speed','strength','wisdom','courage','honor','glory','fate','destiny',
  'dragon','phoenix','unicorn','griffin','hydra','troll','goblin','elf','dwarf','fairy',
  'crystal','diamond','ruby','emerald','sapphire','opal','pearl','amber','jade','onyx',
  'castle','tower','bridge','gate','wall','throne','chamber','vault','garden','temple',
  'quest','journey','battle','victory','legend','myth','riddle','puzzle','secret','treasure',
  'swift','brave','fierce','gentle','bright','shadow','silent','ancient','eternal','infinite',
  'harmony','chaos','balance','spirit','cosmic','stellar','nebula','aurora','prism','spectrum',
  'velvet','thunder','lightning','blizzard','monsoon','tornado','tsunami','volcano','avalanche','earthquake',
  'compass','lantern','mirror','compass','amulet','talisman','relic','artifact','monument','statue',
  'melody','rhythm','sonnet','verse','prose','anthem','chorus','ballad','hymn','lyric',
  'summer','autumn','winter','spring','solstice','equinox','twilight','dawn','dusk','horizon',
  'phantom','specter','wraith','golem','sentry','oracle','prophet','sage','mystic','warden',
  'copper','bronze','silver','platinum','quartz','marble','granite','limestone','slate','cobalt',
  'nexus','portal','domain','realm','kingdom','empire','province','territory','frontier','outpost',
]

const MATH_WORDS: readonly string[] = [
  'two','three','four','five','six','seven','eight','nine','ten','eleven',
  'twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','thirty',
  'forty','fifty','sixty','seventy','eighty','ninety','hundred','thousand','million','billion',
]

const WORD_VALUES: Record<string, number> = {
  'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
  'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
  'eighty': 80, 'ninety': 90, 'hundred': 100,
}

const GRADE_THRESHOLDS: Record<GameId, Record<Grade, number>> = {
  'word-memory': { S: 500, A: 400, B: 300, C: 200, D: 100, F: 0 },
  'word-shooter': { S: 800, A: 600, B: 400, C: 250, D: 100, F: 0 },
  'word-sort': { S: 600, A: 450, B: 300, C: 180, D: 80, F: 0 },
  'word-chain': { S: 700, A: 500, B: 350, C: 200, D: 80, F: 0 },
  'letter-rain': { S: 900, A: 700, B: 500, C: 300, D: 150, F: 0 },
  'word-search-blitz': { S: 1000, A: 750, B: 500, C: 300, D: 150, F: 0 },
  'anagram-rush': { S: 850, A: 650, B: 450, C: 250, D: 100, F: 0 },
  'word-math': { S: 750, A: 550, B: 380, C: 220, D: 100, F: 0 },
}

const GRADE_MULTIPLIERS: Record<Grade, number> = { S: 3, A: 2.5, B: 2, C: 1.5, D: 1, F: 0.5 }

const AI_NAMES: readonly string[] = ['SpeedKing', 'WordNinja', 'ArcadeMaster', 'TokenHunter', 'HighScorer']

const ACHIEVEMENT_DEFS: readonly { id: string; name: string; desc: string; icon: string }[] = [
  { id: 'ar-first-game', name: 'First Play', desc: 'Play your first arcade game', icon: '🎮' },
  { id: 'ar-games-10', name: 'Getting Started', desc: 'Play 10 total games', icon: '🕹️' },
  { id: 'ar-games-50', name: 'Arcade Regular', desc: 'Play 50 total games', icon: '🏆' },
  { id: 'ar-games-100', name: 'Arcade Addict', desc: 'Play 100 total games', icon: '💎' },
  { id: 'ar-grade-s', name: 'S Rank!', desc: 'Get an S grade in any game', icon: '⭐' },
  { id: 'ar-grade-s-3', name: 'Triple S', desc: 'Get S grade in 3 different games', icon: '🌟' },
  { id: 'ar-grade-s-all', name: 'Perfectionist', desc: 'Get S grade in all 8 games', icon: '👑' },
  { id: 'ar-tokens-1000', name: 'Token Collector', desc: 'Earn 1000 total tokens', icon: '🪙' },
  { id: 'ar-tokens-5000', name: 'Token Tycoon', desc: 'Earn 5000 total tokens', icon: '💰' },
  { id: 'ar-unlock-all', name: 'Full Arcade', desc: 'Unlock all 8 games', icon: '🔓' },
  { id: 'ar-daily-first', name: 'Daily Challenger', desc: 'Complete a daily challenge', icon: '📅' },
  { id: 'ar-daily-streak-3', name: 'Streak Starter', desc: '3-day daily challenge streak', icon: '🔥' },
  { id: 'ar-daily-streak-7', name: 'Week Warrior', desc: '7-day daily challenge streak', icon: '💪' },
  { id: 'ar-perfect-game', name: 'Flawless', desc: 'Complete a game with 100% accuracy', icon: '🎯' },
  { id: 'ar-combo-20', name: 'Combo King', desc: 'Reach a 20 word combo in any game', icon: '🔗' },
  { id: 'ar-all-games', name: 'Renaissance Gamer', desc: 'Play at least one round of every game', icon: '🎨' },
]

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return () => { h = h ^ (h << 13); h = h ^ (h >> 17); h = h ^ (h << 5); return (h >>> 0) / 4294967296; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shuffleArray<T>(arr: T[], rng?: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng ? Math.floor(rng() * (i + 1)) : Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function calculateGrade(gameId: GameId, score: number): Grade {
  const thresholds = GRADE_THRESHOLDS[gameId]
  if (score >= thresholds.S) return 'S'
  if (score >= thresholds.A) return 'A'
  if (score >= thresholds.B) return 'B'
  if (score >= thresholds.C) return 'C'
  if (score >= thresholds.D) return 'D'
  return 'F'
}

function calculateTokens(score: number, grade: Grade): number {
  return Math.floor(score * GRADE_MULTIPLIERS[grade])
}

function buildDefaultHighScore(): Record<GameId, HighScore> {
  const result: Record<string, HighScore> = {}
  for (const g of GAME_DEFS) {
    result[g.id] = { score: 0, grade: 'F', date: '', gamesPlayed: 0 }
  }
  return result as Record<GameId, HighScore>
}

function buildDefaultLeaderboards(): Record<GameId, LeaderboardEntry[]> {
  const result: Record<string, LeaderboardEntry[]> = {}
  const rng = seededRandom('arcade-lb-' + getDateString())
  for (const g of GAME_DEFS) {
    const entries: LeaderboardEntry[] = []
    for (let i = 0; i < 5; i++) {
      const baseScore = Math.floor(200 + rng() * 600)
      entries.push({
        rank: i + 1,
        name: AI_NAMES[i],
        score: baseScore,
        grade: calculateGrade(g.id, baseScore),
        isPlayer: false,
      })
    }
    result[g.id] = entries
  }
  return result as Record<GameId, LeaderboardEntry[]>
}

function buildDefaultStats(): ArcadeStats {
  const gamesPerType: Record<string, number> = {}
  for (const g of GAME_DEFS) { gamesPerType[g.id] = 0 }
  return {
    totalGamesPlayed: 0,
    totalScore: 0,
    totalTimeSpent: 0,
    totalWordsCompleted: 0,
    perfectGames: 0,
    totalTokensEarned: 0,
    totalTokensSpent: 0,
    gamesPerType: gamesPerType as Record<GameId, number>,
  }
}

function buildDefaultAchievements(): ARAchievement[] {
  return ACHIEVEMENT_DEFS.map(a => ({ id: a.id, name: a.name, description: a.desc, icon: a.icon, unlocked: false, unlockedAt: null }))
}

function buildDailyChallenge(): ARDailyChallenge {
  const allGames: GameId[] = ['word-memory', 'word-shooter', 'word-sort', 'word-chain', 'letter-rain', 'word-search-blitz', 'anagram-rush', 'word-math']
  const scores: Record<string, number | null> = {}
  const grades: Record<string, Grade | null> = {}
  for (const g of allGames) { scores[g] = null; grades[g] = null }
  return {
    date: getDateString(),
    gamesToPlay: allGames,
    scores: scores as Record<GameId, number | null>,
    grades: grades as Record<GameId, Grade | null>,
    completed: false,
    totalScore: 0,
    overallGrade: null,
  }
}

function buildGames(): GameDef[] {
  return GAME_DEFS.map(g => ({
    id: g.id, name: g.name, description: g.desc, icon: g.icon, color: g.color,
    unlocked: g.unlockReq === '', unlockRequirement: g.unlockReq, rules: g.rules,
  }))
}

function updateGameUnlocks(s: ARState): void {
  const stats = s.stats
  const highScores = s.highScores
  for (const game of s.games) {
    if (game.unlocked) continue
    const req = game.unlockRequirement
    if (req.includes('10 total games') && stats.totalGamesPlayed >= 10) game.unlocked = true
    if (req.includes('25 total games') && stats.totalGamesPlayed >= 25) game.unlocked = true
    if (req.includes('2000 total score') && stats.totalScore >= 2000) game.unlocked = true
    if (req.includes('S grade') && Object.values(highScores).some(hs => hs.grade === 'S')) game.unlocked = true
  }
}

function updateLeaderboard(s: ARState, gameId: GameId, playerScore: number, playerGrade: Grade): void {
  const lb = s.leaderboards[gameId]
  if (!lb) return
  lb.push({ rank: 0, name: 'You', score: playerScore, grade: playerGrade, isPlayer: true })
  lb.sort((a, b) => b.score - a.score)
  if (lb.length > 10) lb.length = 10
  lb.forEach((e, i) => { e.rank = i + 1 })
}

// ─── Module State ─────────────────────────────────────────────────────────────

let state: ARState | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

function createDefaultState(): ARState {
  return {
    initialized: false,
    games: buildGames(),
    highScores: buildDefaultHighScore(),
    leaderboards: buildDefaultLeaderboards(),
    activeGame: null,
    tokens: 100,
    totalTokensEarned: 100,
    totalTokensSpent: 0,
    achievements: buildDefaultAchievements(),
    dailyChallenge: buildDailyChallenge(),
    dailyStreak: 0,
    stats: buildDefaultStats(),
  }
}

function ensureInit(): void {
  if (!state) state = createDefaultState()
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function arInit(): void {
  ensureInit()
  if (state && !state.initialized) {
    state.initialized = true
    updateGameUnlocks(state)
  }
}

export function arGetState(): ARState {
  ensureInit()
  return state!
}

export function arResetState(): void {
  state = null
}

export function arStartGame(gameId: GameId): boolean {
  ensureInit()
  if (!state) return false
  if (state.activeGame) return false
  const gameDef = state.games.find(g => g.id === gameId)
  if (!gameDef || !gameDef.unlocked) return false
  const lives = gameId === 'word-shooter' ? 5 : (gameId === 'letter-rain' ? 3 : 0)
  const data: Record<string, unknown> = {}
  if (gameId === 'word-memory') {
    const rng = seededRandom(`wm-${Date.now()}`)
    const words = shuffleArray(WORD_POOL.slice(0, 12), rng)
    const cards = [...words, ...words]
    data.cards = shuffleArray(cards, rng)
    data.flipped = [] as number[]
    data.matched = [] as number[]
    data.gridSize = 4
  }
  if (gameId === 'word-shooter') {
    const rng = seededRandom(`ws-${Date.now()}`)
    data.words = shuffleArray(WORD_POOL, rng).slice(0, 20)
    data.currentIndex = 0
    data.currentInput = ''
  }
  if (gameId === 'word-sort') {
    data.categories = ['Animals', 'Colors', 'Food', 'Nature']
    const rng = seededRandom(`wso-${Date.now()}`)
    const animalWords = shuffleArray(['cat', 'dog', 'bird', 'fish', 'bear', 'fox', 'deer', 'wolf', 'eagle', 'owl'], rng)
    const colorWords = shuffleArray(['red', 'blue', 'green', 'gold', 'dark', 'bright', 'silver', 'amber', 'jade', 'ivory'], rng)
    const foodWords = shuffleArray(['bread', 'rice', 'cake', 'apple', 'honey', 'milk', 'corn', 'pear', 'plum', 'lime'], rng)
    const natureWords = shuffleArray(['river', 'mountain', 'forest', 'ocean', 'storm', 'cave', 'lake', 'rain', 'snow', 'wind'], rng)
    data.words = shuffleArray([...animalWords, ...colorWords, ...foodWords, ...natureWords], rng)
    data.currentWordIndex = 0
    data.correct = 0
    data.incorrect = 0
  }
  if (gameId === 'word-chain') {
    const rng = seededRandom(`wc-${Date.now()}`)
    data.currentWord = WORD_POOL[Math.floor(rng() * WORD_POOL.length)]
    data.chain = [data.currentWord]
    data.timeLeft = 60
    data.lastLetter = (data.currentWord as string).slice(-1)
  }
  if (gameId === 'letter-rain') {
    data.targetWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
    data.caughtLetters = [] as string[]
    data.currentPosition = 0
    data.missedLetters = 0
  }
  if (gameId === 'word-search-blitz') {
    data.gridSize = 8
    data.wordsToFind = shuffleArray(WORD_POOL.slice(0, 8)).slice(0, 6)
    data.foundWords = [] as string[]
    data.timeLeft = 60
  }
  if (gameId === 'anagram-rush') {
    const rng = seededRandom(`arush-${Date.now()}`)
    data.anagrams = shuffleArray(WORD_POOL.filter(w => w.length >= 3 && w.length <= 7), rng).slice(0, 15)
    data.currentIndex = 0
    data.currentInput = ''
    data.correct = 0
    data.incorrect = 0
  }
  if (gameId === 'word-math') {
    data.problems = generateMathProblems(10)
    data.currentProblem = 0
    data.correct = 0
    data.incorrect = 0
    data.currentAnswer = ''
  }
  state.activeGame = {
    id: gameId,
    score: 0,
    startTime: Date.now(),
    elapsed: 0,
    lives,
    maxLives: lives,
    level: 1,
    wordsCompleted: 0,
    combo: 0,
    maxCombo: 0,
    paused: false,
    data,
  }
  return true
}

function generateMathProblems(count: number): Array<{ word1: string; word2: string; operator: string; answer: string }> {
  const problems: Array<{ word1: string; word2: string; operator: string; answer: string }> = []
  const rng = seededRandom(`math-${Date.now()}`)
  const numWords = MATH_WORDS.filter(w => WORD_VALUES[w] !== undefined)
  const operators = ['+', '-', '*']
  for (let i = 0; i < count; i++) {
    const w1 = numWords[Math.floor(rng() * numWords.length)]
    const w2 = numWords[Math.floor(rng() * numWords.length)]
    const op = operators[Math.floor(rng() * operators.length)]
    const v1 = WORD_VALUES[w1]
    const v2 = WORD_VALUES[w2]
    let answer: number
    if (op === '+') answer = v1 + v2
    else if (op === '-') answer = Math.max(0, v1 - v2)
    else answer = v1 * v2
    problems.push({ word1: w1, word2: w2, operator: op, answer: String(answer) })
  }
  return problems
}

export function arEndGame(): { score: number; grade: Grade; tokens: number; newHighScore: boolean } {
  ensureInit()
  if (!state || !state.activeGame) return { score: 0, grade: 'F', tokens: 0, newHighScore: false }
  const ag = state.activeGame
  ag.elapsed = (Date.now() - ag.startTime) / 1000
  const grade = calculateGrade(ag.id, ag.score)
  const tokens = calculateTokens(ag.score, grade)
  const hs = state.highScores[ag.id]
  const isNewHighScore = ag.score > hs.score
  if (isNewHighScore) {
    hs.score = ag.score
    hs.grade = grade
    hs.date = new Date().toISOString()
  }
  hs.gamesPlayed++
  state.tokens += tokens
  state.totalTokensEarned += tokens
  state.stats.totalGamesPlayed++
  state.stats.totalScore += ag.score
  state.stats.totalTimeSpent += ag.elapsed
  state.stats.totalWordsCompleted += ag.wordsCompleted
  state.stats.gamesPerType[ag.id] = (state.stats.gamesPerType[ag.id] || 0) + 1
  updateLeaderboard(state, ag.id, ag.score, grade)
  updateGameUnlocks(state)
  if (ag.data.incorrect === 0 && ag.wordsCompleted > 0) state.stats.perfectGames++
  if (state.dailyChallenge.date === getDateString()) {
    state.dailyChallenge.scores[ag.id] = ag.score
    state.dailyChallenge.grades[ag.id] = grade
    checkDailyCompletion()
  }
  state.activeGame = null
  checkARAchievements()
  return { score: ag.score, grade, tokens, newHighScore: isNewHighScore }
}

function checkDailyCompletion(): void {
  if (!state) return
  const dc = state.dailyChallenge
  const allPlayed = dc.gamesToPlay.every(g => dc.scores[g] !== null)
  if (allPlayed && !dc.completed) {
    dc.completed = true
    dc.totalScore = Object.values(dc.scores).reduce((sum, s) => sum + (s || 0), 0)
    const avgScore = dc.totalScore / dc.gamesToPlay.length
    dc.overallGrade = avgScore >= 600 ? 'S' : avgScore >= 450 ? 'A' : avgScore >= 300 ? 'B' : avgScore >= 150 ? 'C' : avgScore >= 80 ? 'D' : 'F'
    state.dailyStreak++
    state.tokens += 200
    state.totalTokensEarned += 200
  }
}

export function arPauseGame(): boolean {
  ensureInit()
  if (!state || !state.activeGame) return false
  state.activeGame.paused = true
  return true
}

export function arResumeGame(): boolean {
  ensureInit()
  if (!state || !state.activeGame) return false
  state.activeGame.paused = false
  return true
}

export function arGetActiveGame(): ActiveGame | null {
  ensureInit()
  if (!state) return null
  return state.activeGame
}

export function arIsGameActive(): boolean {
  ensureInit()
  if (!state) return false
  return state.activeGame !== null && !state.activeGame.paused
}

// ─── Game Actions ─────────────────────────────────────────────────────────────

export function arFlipCard(index: number): { matched: boolean; word: string; allMatched: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-memory') {
    return { matched: false, word: '', allMatched: false }
  }
  const d = state.activeGame.data
  const cards = d.cards as string[]
  const flipped = d.flipped as number[]
  const matched = d.matched as number[]
  if (matched.includes(index) || flipped.includes(index)) return { matched: false, word: '', allMatched: false }
  flipped.push(index)
  const word = cards[index]
  if (flipped.length === 2) {
    const [i1, i2] = flipped
    if (cards[i1] === cards[i2]) {
      matched.push(i1, i2)
      state.activeGame.score += 50 + (state.activeGame.combo * 10)
      state.activeGame.wordsCompleted++
      state.activeGame.combo++
      if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
      ;(d.flipped as number[]).length = 0
      const allMatched = matched.length === cards.length
      if (allMatched) state.activeGame.score += 100
      return { matched: true, word, allMatched }
    } else {
      state.activeGame.combo = 0
      ;(d.flipped as number[]).length = 0
    }
  }
  return { matched: false, word, allMatched: false }
}

export function arDestroyWord(input: string): { correct: boolean; word: string; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-shooter') {
    return { correct: false, word: '', gameOver: false }
  }
  const d = state.activeGame.data
  const words = d.words as string[]
  const idx = d.currentIndex as number
  if (idx >= words.length) return { correct: false, word: '', gameOver: true }
  const target = words[idx]
  const isCorrect = input.toLowerCase().trim() === target
  if (isCorrect) {
    state.activeGame.score += 30 + (state.activeGame.combo * 5)
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
    if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
    ;(d.currentIndex as number)++
    ;(d.currentInput as string) = ''
  } else {
    state.activeGame.lives--
    state.activeGame.combo = 0
  }
  const gameOver = state.activeGame.lives <= 0 || (d.currentIndex as number) >= words.length
  return { correct: isCorrect, word: target, gameOver }
}

export function arSortWord(word: string, category: string): { correct: boolean; nextWord: string | null; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-sort') {
    return { correct: false, nextWord: null, gameOver: false }
  }
  const d = state.activeGame.data
  const words = d.words as string[]
  const idx = d.currentWordIndex as number
  const currentWord = words[idx]
  const categoryMap: Record<string, string[]> = {
    Animals: ['cat', 'dog', 'bird', 'fish', 'bear', 'fox', 'deer', 'wolf', 'eagle', 'owl'],
    Colors: ['red', 'blue', 'green', 'gold', 'dark', 'bright', 'silver', 'amber', 'jade', 'ivory'],
    Food: ['bread', 'rice', 'cake', 'apple', 'honey', 'milk', 'corn', 'pear', 'plum', 'lime'],
    Nature: ['river', 'mountain', 'forest', 'ocean', 'storm', 'cave', 'lake', 'rain', 'snow', 'wind'],
  }
  const isCorrect = categoryMap[category]?.includes(currentWord) || false
  if (isCorrect) {
    state.activeGame.score += 25 + (state.activeGame.combo * 3)
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
    ;(d.correct as number)++
  } else {
    state.activeGame.combo = 0
    ;(d.incorrect as number)++
  }
  ;(d.currentWordIndex as number)++
  const nextIdx = d.currentWordIndex as number
  const gameOver = nextIdx >= words.length
  const nextWord = gameOver ? null : words[nextIdx]
  if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
  return { correct: isCorrect, nextWord, gameOver }
}

export function arSubmitChainWord(word: string): { valid: boolean; chainLength: number; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-chain') {
    return { valid: false, chainLength: 0, gameOver: false }
  }
  const d = state.activeGame.data
  const chain = d.chain as string[]
  const lastLetter = (chain[chain.length - 1] as string).slice(-1)
  const normalized = word.toLowerCase().trim()
  const valid = normalized.startsWith(lastLetter) && WORD_POOL.includes(normalized) && !chain.includes(normalized)
  if (valid) {
    chain.push(normalized)
    state.activeGame.score += 20 + (chain.length - 1) * 5
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
    d.lastLetter = normalized.slice(-1)
    d.currentWord = normalized
  } else {
    state.activeGame.combo = 0
    state.activeGame.lives--
  }
  if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
  const gameOver = state.activeGame.lives <= 0
  return { valid, chainLength: chain.length, gameOver }
}

export function arCatchLetter(letter: string): { correct: boolean; wordProgress: string; wordComplete: boolean; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'letter-rain') {
    return { correct: false, wordProgress: '', wordComplete: false, gameOver: false }
  }
  const d = state.activeGame.data
  const target = d.targetWord as string
  const pos = d.currentPosition as number
  if (pos >= target.length) return { correct: false, wordProgress: target, wordComplete: true, gameOver: false }
  const expected = target[pos]
  const isCorrect = letter.toLowerCase() === expected
  if (isCorrect) {
    ;(d.currentPosition as number)++
    const progress = target.slice(0, (d.currentPosition as number))
    if (d.currentPosition as number >= target.length) {
      state.activeGame.score += 40 + (state.activeGame.combo * 5)
      state.activeGame.wordsCompleted++
      state.activeGame.combo++
      d.targetWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]
      ;(d.currentPosition as number) = 0
      ;(d.caughtLetters as string[]).length = 0
      return { correct: true, wordProgress: target, wordComplete: true, gameOver: false }
    }
    return { correct: true, wordProgress: progress, wordComplete: false, gameOver: false }
  } else {
    state.activeGame.lives--
    state.activeGame.combo = 0
    ;(d.missedLetters as number)++
    return { correct: false, wordProgress: target.slice(0, pos), wordComplete: false, gameOver: state.activeGame.lives <= 0 }
  }
}

export function arFindWord(word: string): { found: boolean; wordsRemaining: number; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-search-blitz') {
    return { found: false, wordsRemaining: 0, gameOver: false }
  }
  const d = state.activeGame.data
  const wordsToFind = d.wordsToFind as string[]
  const foundWords = d.foundWords as string[]
  const isFound = wordsToFind.includes(word.toLowerCase()) && !foundWords.includes(word.toLowerCase())
  if (isFound) {
    foundWords.push(word.toLowerCase())
    state.activeGame.score += 50 + (foundWords.length - 1) * 10
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
  } else {
    state.activeGame.combo = 0
  }
  if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
  const remaining = wordsToFind.length - foundWords.length
  const gameOver = remaining === 0
  return { found: isFound, wordsRemaining: remaining, gameOver }
}

export function arSolveAnagram(input: string): { correct: boolean; word: string; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'anagram-rush') {
    return { correct: false, word: '', gameOver: false }
  }
  const d = state.activeGame.data
  const anagrams = d.anagrams as string[]
  const idx = d.currentIndex as number
  if (idx >= anagrams.length) return { correct: false, word: '', gameOver: true }
  const target = anagrams[idx]
  const normalized = input.toLowerCase().trim()
  const isCorrect = normalized === target || isAnagram(normalized, target)
  if (isCorrect) {
    state.activeGame.score += 35 + (state.activeGame.combo * 5)
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
    ;(d.currentIndex as number)++
    ;(d.correct as number)++
  } else {
    state.activeGame.combo = 0
    ;(d.incorrect as number)++
  }
  if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
  const gameOver = (d.currentIndex as number) >= anagrams.length
  return { correct: isCorrect, word: target, gameOver }
}

function isAnagram(input: string, target: string): boolean {
  if (input.length !== target.length) return false
  const sortedInput = input.split('').sort().join('')
  const sortedTarget = target.split('').sort().join('')
  return sortedInput === sortedTarget
}

export function arSolveMath(answer: string): { correct: boolean; problem: { word1: string; word2: string; operator: string }; gameOver: boolean } {
  ensureInit()
  if (!state || !state.activeGame || state.activeGame.id !== 'word-math') {
    return { correct: false, problem: { word1: '', word2: '', operator: '' }, gameOver: false }
  }
  const d = state.activeGame.data
  const problems = d.problems as Array<{ word1: string; word2: string; operator: string; answer: string }>
  const idx = d.currentProblem as number
  if (idx >= problems.length) return { correct: false, problem: { word1: '', word2: '', operator: '' }, gameOver: true }
  const problem = problems[idx]
  const isCorrect = answer.trim() === problem.answer
  if (isCorrect) {
    const v1 = WORD_VALUES[problem.word1] || 0
    const v2 = WORD_VALUES[problem.word2] || 0
    const points = v1 + v2 + (state.activeGame.combo * 5)
    state.activeGame.score += points
    state.activeGame.wordsCompleted++
    state.activeGame.combo++
    ;(d.correct as number)++
  } else {
    state.activeGame.combo = 0
    ;(d.incorrect as number)++
  }
  ;(d.currentProblem as number)++
  if (state.activeGame.combo > state.activeGame.maxCombo) state.activeGame.maxCombo = state.activeGame.combo
  const gameOver = (d.currentProblem as number) >= problems.length
  return { correct: isCorrect, problem: { word1: problem.word1, word2: problem.word2, operator: problem.operator }, gameOver }
}

// ─── Getters ─────────────────────────────────────────────────────────────────

export function arGetScore(): number {
  ensureInit()
  if (!state || !state.activeGame) return 0
  return state.activeGame.score
}

export function arGetHighScores(gameId?: GameId): Record<GameId, HighScore> | HighScore {
  ensureInit()
  if (!state) return gameId ? buildDefaultHighScore()[gameId] : buildDefaultHighScore()
  if (gameId) return state.highScores[gameId]
  return state.highScores
}

export function arGetGameGrade(gameId: GameId): Grade {
  ensureInit()
  if (!state) return 'F'
  return state.highScores[gameId].grade
}

export function arGetAllHighScores(): Array<{ gameId: GameId; name: string; icon: string; score: number; grade: Grade; gamesPlayed: number }> {
  ensureInit()
  if (!state) return []
  return GAME_DEFS.map(g => {
    const hs = state!.highScores[g.id]
    return {
      gameId: g.id,
      name: g.name,
      icon: g.icon,
      score: hs.score,
      grade: hs.grade,
      gamesPlayed: hs.gamesPlayed,
    }
  })
}

export function arGetTokens(): number {
  ensureInit()
  if (!state) return 100
  return state.tokens
}

export function arEarnTokens(amount: number): number {
  ensureInit()
  if (!state) return 100
  state.tokens += amount
  state.totalTokensEarned += amount
  return state.tokens
}

export function arSpendTokens(amount: number): boolean {
  ensureInit()
  if (!state || state.tokens < amount) return false
  state.tokens -= amount
  state.totalTokensSpent += amount
  return true
}

export function arGetDailyChallenge(): ARDailyChallenge {
  ensureInit()
  if (!state) return buildDailyChallenge()
  return state.dailyChallenge
}

export function arStartDaily(): boolean {
  ensureInit()
  if (!state) return false
  if (state.dailyChallenge.date !== getDateString()) {
    state.dailyChallenge = buildDailyChallenge()
  }
  return !state.dailyChallenge.completed
}

export function arGetDailyProgress(): { completed: number; total: number; percent: number; scores: Record<GameId, number | null>; grades: Record<GameId, Grade | null> } {
  ensureInit()
  if (!state) return { completed: 0, total: 8, percent: 0, scores: {}, grades: {} }
  const dc = state.dailyChallenge
  const completed = dc.gamesToPlay.filter(g => dc.scores[g] !== null).length
  return {
    completed,
    total: dc.gamesToPlay.length,
    percent: Math.round((completed / dc.gamesToPlay.length) * 100),
    scores: dc.scores,
    grades: dc.grades,
  }
}

export function arIsDailyCompleted(): boolean {
  ensureInit()
  if (!state) return false
  return state.dailyChallenge.completed
}

export function arGetAchievements(): ARAchievement[] {
  ensureInit()
  if (!state) return buildDefaultAchievements()
  return state.achievements
}

export function arCheckAchievements(): void {
  ensureInit()
  if (!state) return
  checkARAchievements()
}

function checkARAchievements(): void {
  if (!state) return
  const s = state
  const check = (id: string, cond: boolean) => {
    const a = s.achievements.find(x => x.id === id)
    if (a && !a.unlocked && cond) { a.unlocked = true; a.unlockedAt = new Date().toISOString() }
  }
  check('ar-first-game', s.stats.totalGamesPlayed >= 1)
  check('ar-games-10', s.stats.totalGamesPlayed >= 10)
  check('ar-games-50', s.stats.totalGamesPlayed >= 50)
  check('ar-games-100', s.stats.totalGamesPlayed >= 100)
  const sGrades = Object.values(s.highScores).filter(hs => hs.grade === 'S').length
  check('ar-grade-s', sGrades >= 1)
  check('ar-grade-s-3', sGrades >= 3)
  check('ar-grade-s-all', sGrades >= 8)
  check('ar-tokens-1000', s.totalTokensEarned >= 1000)
  check('ar-tokens-5000', s.totalTokensEarned >= 5000)
  check('ar-unlock-all', s.games.every(g => g.unlocked))
  check('ar-daily-first', s.dailyChallenge.completed)
  check('ar-daily-streak-3', s.dailyStreak >= 3)
  check('ar-daily-streak-7', s.dailyStreak >= 7)
  check('ar-perfect-game', s.stats.perfectGames >= 1)
  check('ar-combo-20', Object.values(s.highScores).some(hs => true) || s.stats.totalWordsCompleted >= 20)
  check('ar-all-games', Object.values(s.stats.gamesPerType).every(n => n > 0))
}

export function arGetArcadeStats(): ArcadeStats {
  ensureInit()
  if (!state) return buildDefaultStats()
  return state.stats
}

export function arGetArcadeOverview() {
  ensureInit()
  if (!state) return getDefaultOverview()
  const s = state
  return {
    totalGamesPlayed: s.stats.totalGamesPlayed,
    totalScore: s.stats.totalScore,
    tokens: s.tokens,
    totalTokensEarned: s.totalTokensEarned,
    gamesUnlocked: s.games.filter(g => g.unlocked).length,
    gamesTotal: s.games.length,
    achievementsUnlocked: s.achievements.filter(a => a.unlocked).length,
    achievementsTotal: s.achievements.length,
    dailyStreak: s.dailyStreak,
    dailyCompleted: s.dailyChallenge.completed,
    bestGrade: getBestGrade(s.highScores),
    favoriteGame: getFavoriteGame(s.stats),
  }
}

function getDefaultOverview() {
  return {
    totalGamesPlayed: 0, totalScore: 0, tokens: 100, totalTokensEarned: 100,
    gamesUnlocked: 4, gamesTotal: 8, achievementsUnlocked: 0, achievementsTotal: 16,
    dailyStreak: 0, dailyCompleted: false, bestGrade: 'F' as Grade, favoriteGame: 'None yet',
  }
}

function getBestGrade(hs: Record<GameId, HighScore>): Grade {
  const grades: Grade[] = ['F', 'D', 'C', 'B', 'A', 'S']
  let best: Grade = 'F'
  for (const h of Object.values(hs)) {
    if (grades.indexOf(h.grade) > grades.indexOf(best)) best = h.grade
  }
  return best
}

function getFavoriteGame(stats: ArcadeStats): string {
  let maxGames = 0
  let favorite = 'None yet'
  for (const g of GAME_DEFS) {
    const count = stats.gamesPerType[g.id] || 0
    if (count > maxGames) { maxGames = count; favorite = g.name }
  }
  return favorite
}

export function arGetGameCard(gameId: GameId): { id: GameId; name: string; icon: string; description: string; color: string; unlocked: boolean; highScore: number; grade: Grade; gamesPlayed: number; rules: string } {
  ensureInit()
  if (!state) {
    const def = GAME_DEFS.find(g => g.id === gameId)
    return {
      id: gameId, name: def?.name || gameId, icon: def?.icon || '🎮',
      description: def?.desc || '', color: def?.color || '#9ca3af',
      unlocked: def?.unlockReq === '' || false, highScore: 0, grade: 'F', gamesPlayed: 0,
      rules: def?.rules || '',
    }
  }
  const game = state.games.find(g => g.id === gameId)
  const hs = state.highScores[gameId]
  return {
    id: gameId,
    name: game?.name || gameId,
    icon: game?.icon || '🎮',
    description: game?.description || '',
    color: game?.color || '#9ca3af',
    unlocked: game?.unlocked || false,
    highScore: hs?.score || 0,
    grade: hs?.grade || 'F',
    gamesPlayed: hs?.gamesPlayed || 0,
    rules: game?.rules || '',
  }
}

export function arGetGameGrid(): Array<{ id: GameId; name: string; icon: string; color: string; unlocked: boolean; highScore: number; grade: Grade }> {
  ensureInit()
  if (!state) return GAME_DEFS.map(g => ({ id: g.id, name: g.name, icon: g.icon, color: g.color, unlocked: g.unlockReq === '', highScore: 0, grade: 'F' as Grade }))
  return state.games.map(g => {
    const hs = state!.highScores[g.id]
    return { id: g.id, name: g.name, icon: g.icon, color: g.color, unlocked: g.unlocked, highScore: hs.score, grade: hs.grade }
  })
}

export function arGetStatsGrid() {
  ensureInit()
  if (!state) return getDefaultStatsGrid()
  const s = state
  return {
    totalGamesPlayed: s.stats.totalGamesPlayed,
    totalScore: s.stats.totalScore,
    totalTimeSpent: Math.round(s.stats.totalTimeSpent),
    totalWordsCompleted: s.stats.totalWordsCompleted,
    perfectGames: s.stats.perfectGames,
    tokens: s.tokens,
    tokensEarned: s.totalTokensEarned,
    tokensSpent: s.totalTokensSpent,
    gamesUnlocked: s.games.filter(g => g.unlocked).length,
    gamesTotal: s.games.length,
    achievementsUnlocked: s.achievements.filter(a => a.unlocked).length,
    achievementsTotal: s.achievements.length,
    dailyStreak: s.dailyStreak,
    bestGrade: getBestGrade(s.highScores),
    sGrades: Object.values(s.highScores).filter(hs => hs.grade === 'S').length,
    winRate: s.stats.totalGamesPlayed > 0 ? Math.round((s.stats.perfectGames / s.stats.totalGamesPlayed) * 100) : 0,
  }
}

function getDefaultStatsGrid() {
  return {
    totalGamesPlayed: 0, totalScore: 0, totalTimeSpent: 0, totalWordsCompleted: 0,
    perfectGames: 0, tokens: 100, tokensEarned: 100, tokensSpent: 0,
    gamesUnlocked: 4, gamesTotal: 8, achievementsUnlocked: 0, achievementsTotal: 16,
    dailyStreak: 0, bestGrade: 'F' as Grade, sGrades: 0, winRate: 0,
  }
}

export function arGetAchievementGrid(): ARAchievement[] {
  ensureInit()
  if (!state) return buildDefaultAchievements()
  return state.achievements
}

export function arGetLeaderboardCard(gameId: GameId): { gameId: GameId; gameName: string; entries: LeaderboardEntry[] } {
  ensureInit()
  if (!state) {
    const def = GAME_DEFS.find(g => g.id === gameId)
    return { gameId, gameName: def?.name || gameId, entries: [] }
  }
  return {
    gameId,
    gameName: state.games.find(g => g.id === gameId)?.name || gameId,
    entries: state.leaderboards[gameId] || [],
  }
}

export function arGetDailyCard() {
  ensureInit()
  if (!state) return { date: getDateString(), completed: false, totalScore: 0, overallGrade: null as Grade | null, streak: 0, gamesToPlay: 8, gamesCompleted: 0 }
  const dc = state.dailyChallenge
  return {
    date: dc.date,
    completed: dc.completed,
    totalScore: dc.totalScore,
    overallGrade: dc.overallGrade,
    streak: state.dailyStreak,
    gamesToPlay: dc.gamesToPlay.length,
    gamesCompleted: dc.gamesToPlay.filter(g => dc.scores[g] !== null).length,
  }
}

export function arGetTokenCard(): { tokens: number; totalEarned: number; totalSpent: number; netBalance: number } {
  ensureInit()
  if (!state) return { tokens: 100, totalEarned: 100, totalSpent: 0, netBalance: 100 }
  return {
    tokens: state.tokens,
    totalEarned: state.totalTokensEarned,
    totalSpent: state.totalTokensSpent,
    netBalance: state.tokens,
  }
}

export function arGetGamesPlayed(): number {
  ensureInit()
  if (!state) return 0
  return state.stats.totalGamesPlayed
}

export function arGetTotalTime(): number {
  ensureInit()
  if (!state) return 0
  return Math.round(state.stats.totalTimeSpent)
}

export function arGetWinRate(): number {
  ensureInit()
  if (!state || state.stats.totalGamesPlayed === 0) return 0
  return Math.round((state.stats.perfectGames / state.stats.totalGamesPlayed) * 100)
}
