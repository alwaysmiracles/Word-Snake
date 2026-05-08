// ── Minigame Launcher: quick-launch mini-game modes with specialised rules ──
// Pure logic module — no React dependencies.

// ── Type Exports ──────────────────────────────────────────────────────────────

/** Identifier for each supported mini-game. */
export type MinigameType = 'scramble_blitz' | 'boss_rush' | 'quiz_marathon'

/** Immutable configuration describing a mini-game's rules and presentation. */
export interface MinigameConfig {
  type: MinigameType
  name: string
  description: string
  emoji: string
  /** Time limit in seconds. `null` means no time limit (survival). */
  timeLimit: number | null
  basePoints: number
  penaltyPoints: number
  wallWrap: boolean
  selfCollisionEnabled: boolean
  instructions: string
}

/** Result submitted after a mini-game session ends. */
export interface MinigameResult {
  score: number
  timeElapsed: number // seconds
  correctCount: number
  wrongCount: number
  accuracy: number // 0–1
  bestCombo: number
  /** Mode-specific key-value metrics (e.g. bosses defeated). */
  extras: Record<string, number>
}

/** Persisted statistics for a single mini-game type. */
export interface MinigameStats {
  bestScore: number
  timesPlayed: number
  totalScore: number
  bestTime: number // seconds (0 = never played)
  bestCombo: number
  totalCorrect: number
  leaderboard: Array<{ score: number; date: string; rank: number }>
}

/** One row in the leaderboard (rank computed at read time). */
interface LeaderboardEntry { score: number; date: string }

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'ws_minigame_'
const LEADERBOARD_MAX = 10
const ALL_TYPES: MinigameType[] = ['scramble_blitz', 'boss_rush', 'quiz_marathon']

// ── Minigame Configurations ───────────────────────────────────────────────────

const CONFIGS: Record<MinigameType, MinigameConfig> = {
  scramble_blitz: {
    type: 'scramble_blitz',
    name: 'Word Scramble Blitz',
    description: 'Unscramble words while steering the snake! Type fast, build combos, earn speed boosts.',
    emoji: '🔤',
    timeLimit: 60,
    basePoints: 50,
    penaltyPoints: 10,
    wallWrap: false,
    selfCollisionEnabled: true,
    instructions:
      'Scrambled words appear — type the correct word! +50 pts correct (×difficulty), -10 wrong. ' +
      '3+ in a row = 1.5× combo. Every 5 correct = 3-second speed boost.',
  },
  boss_rush: {
    type: 'boss_rush',
    name: 'Boss Rush',
    description: 'Defeat increasingly tough word bosses before the snake shrinks away!',
    emoji: '🐉',
    timeLimit: null,
    basePoints: 200,
    penaltyPoints: 0,
    wallWrap: false,
    selfCollisionEnabled: true,
    instructions:
      'Boss words spawn every 20 s, 3 lives each. Boss 1: 3-letter, Boss 2: 4-letter, etc. ' +
      '+200 × boss_number per defeat. Snake shrinks 1 segment every 15 s. Survive!',
  },
  quiz_marathon: {
    type: 'quiz_marathon',
    name: 'Quiz Marathon',
    description: 'Answer word-definition trivia while the snake keeps moving!',
    emoji: '🧠',
    timeLimit: 90,
    basePoints: 100,
    penaltyPoints: 50,
    wallWrap: true,
    selfCollisionEnabled: false,
    instructions:
      'Questions every 10 s — pick the right answer! +100 pts & +2 segments correct, ' +
      '-50 pts & -1 segment wrong. 3+ correct = "Brainiac" mode (2× pts, 10 s). ' +
      'No wall/self-collision deaths.',
  },
}

// ── Word Pools ────────────────────────────────────────────────────────────────

const SHORT_WORDS = [
  'joy', 'hope', 'calm', 'fire', 'wind', 'dawn', 'dusk', 'key', 'gem', 'soar',
  'glow', 'love', 'fury', 'pride', 'zeal', 'mirth', 'dread', 'tide', 'dew',
  'mist', 'swan', 'wolf', 'eagle', 'cobra', 'whale', 'sword', 'crown', 'bliss',
  'faith', 'stone', 'smoke', 'spark', 'flame', 'frost', 'storm', 'bloom',
]

const MEDIUM_WORDS = [
  'river', 'ocean', 'flower', 'breeze', 'sunset', 'meadow', 'valley', 'island',
  'desert', 'aurora', 'nature', 'blossom', 'peace', 'dream', 'wonder', 'courage',
  'grace', 'valor', 'sorrow', 'water', 'earth', 'light', 'shadow', 'crystal',
  'ember', 'quartz', 'moment', 'season', 'dragon', 'falcon', 'tiger', 'raven',
  'wisdom', 'beauty', 'magic', 'power', 'honor', 'truth', 'shield', 'mirror',
  'compass', 'anchor', 'prism', 'scroll', 'lantern', 'feather', 'whisper',
]

const LONG_WORDS = [
  'mountain', 'rainbow', 'thunder', 'glacier', 'serenity', 'volcano', 'prairie',
  'tundra', 'waterfall', 'horizon', 'nostalgia', 'ecstasy', 'anguish', 'lightning',
  'monsoon', 'solstice', 'twilight', 'eternity', 'heartbeat', 'millennium',
  'aftermath', 'interlude', 'dolphin', 'phoenix', 'strength', 'freedom',
  'resilience', 'harmony', 'ambition', 'loyalty', 'flourish',
]

// ── Quiz Question Bank ────────────────────────────────────────────────────────

interface QuizQ {
  question: string
  options: string[]
  correctIndex: number
  word: string
  category: string
}

const QUIZ_BANK: QuizQ[] = [
  { question: 'What is a large body of salt water?', options: ['Ocean', 'Forest', 'Glacier', 'Desert'], correctIndex: 0, word: 'ocean', category: 'nature' },
  { question: 'A very slow-moving river of ice is called a…?', options: ['Canyon', 'Glacier', 'Volcano', 'Meadow'], correctIndex: 1, word: 'glacier', category: 'nature' },
  { question: 'A brightly coloured arc in the sky after rain is a…?', options: ['Thunder', 'Aurora', 'Rainbow', 'Horizon'], correctIndex: 2, word: 'rainbow', category: 'nature' },
  { question: 'Which word means "a treeless area with very little rainfall"?', options: ['Oasis', 'Desert', 'Prairie', 'Tundra'], correctIndex: 1, word: 'desert', category: 'nature' },
  { question: 'What is a gently rolling grassy plain called?', options: ['Valley', 'Tundra', 'Meadow', 'Prairie'], correctIndex: 3, word: 'prairie', category: 'nature' },
  { question: 'Frozen water vapour is called…?', options: ['Dew', 'Mist', 'Frost', 'Ember'], correctIndex: 2, word: 'frost', category: 'element' },
  { question: 'A hot glowing fragment from a fire is a…?', options: ['Spark', 'Flame', 'Ember', 'Smoke'], correctIndex: 2, word: 'ember', category: 'element' },
  { question: 'A sudden flash of light in the sky during a storm is…?', options: ['Thunder', 'Monsoon', 'Eclipse', 'Lightning'], correctIndex: 3, word: 'lightning', category: 'element' },
  { question: 'A thin cloud of tiny water droplets near the ground is…?', options: ['Smoke', 'Mist', 'Tide', 'Dew'], correctIndex: 1, word: 'mist', category: 'element' },
  { question: 'Which mythical bird rises from its own ashes?', options: ['Eagle', 'Falcon', 'Phoenix', 'Raven'], correctIndex: 2, word: 'phoenix', category: 'creature' },
  { question: 'What is the largest member of the cat family?', options: ['Wolf', 'Panther', 'Tiger', 'Cobra'], correctIndex: 2, word: 'tiger', category: 'creature' },
  { question: 'Which sea mammal is known for its intelligence?', options: ['Whale', 'Dolphin', 'Swan', 'Mantis'], correctIndex: 1, word: 'dolphin', category: 'creature' },
  { question: 'What is the ability to recover quickly from difficulties?', options: ['Courage', 'Resilience', 'Ambition', 'Harmony'], correctIndex: 1, word: 'resilience', category: 'quality' },
  { question: 'Which word means "a strong desire to achieve something"?', options: ['Loyalty', 'Wisdom', 'Ambition', 'Grace'], correctIndex: 2, word: 'ambition', category: 'quality' },
  { question: 'What do we call deep understanding and good judgement?', options: ['Beauty', 'Truth', 'Wisdom', 'Honor'], correctIndex: 2, word: 'wisdom', category: 'quality' },
  { question: 'What is the feeling of extreme happiness?', options: ['Bliss', 'Dread', 'Sorrow', 'Anguish'], correctIndex: 0, word: 'bliss', category: 'emotion' },
  { question: 'Which word means "a bittersweet longing for the past"?', options: ['Ecstasy', 'Nostalgia', 'Zeal', 'Mirth'], correctIndex: 1, word: 'nostalgia', category: 'emotion' },
  { question: 'The moment when the sun first appears in the sky is…?', options: ['Dusk', 'Twilight', 'Dawn', 'Epoch'], correctIndex: 2, word: 'dawn', category: 'time' },
  { question: 'Which word means "time without beginning or end"?', options: ['Moment', 'Season', 'Interlude', 'Eternity'], correctIndex: 3, word: 'eternity', category: 'time' },
  { question: 'Which object is used to find direction?', options: ['Mirror', 'Compass', 'Prism', 'Anchor'], correctIndex: 1, word: 'compass', category: 'object' },
  { question: 'A triangular piece of glass that separates white light is a…?', options: ['Prism', 'Lantern', 'Scroll', 'Shield'], correctIndex: 0, word: 'prism', category: 'object' },
]

// ── Internal Helpers ──────────────────────────────────────────────────────────

/** Safe browser check. */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Safe localStorage getter — returns null when unavailable. */
function lsGet(key: string): string | null {
  if (!isBrowser()) return null
  try { return localStorage.getItem(key) } catch { return null }
}

/** Safe localStorage setter — silently swallows errors. */
function lsSet(key: string, value: string): void {
  if (!isBrowser()) return
  try { localStorage.setItem(key, value) } catch { /* quota / access error */ }
}

/** Compute the current day-of-year (1–366) for daily challenge rotation. */
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

/** Fisher-Yates shuffle (in-place). */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Shuffle a word's characters so the result differs from the original.
 * Returns the original if all letters are identical (e.g. "aaa").
 */
function shuffleWord(word: string): string {
  const letters = word.split('')
  for (let attempt = 0; attempt < 20; attempt++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    if (letters.join('') !== word) return letters.join('')
  }
  return word
}

/** Default empty stats for a never-played minigame. */
function emptyStats(): MinigameStats {
  return { bestScore: 0, timesPlayed: 0, totalScore: 0, bestTime: 0, bestCombo: 0, totalCorrect: 0, leaderboard: [] }
}

/** Serialise stats for localStorage (strip computed `rank`). */
function serialiseStats(stats: MinigameStats): string {
  return JSON.stringify({
    ...stats,
    leaderboard: stats.leaderboard.map(({ score, date }) => ({ score, date })),
  })
}

/** Parse raw localStorage JSON into MinigameStats. Corrupt data → emptyStats. */
function deserialiseStats(raw: string | null): MinigameStats {
  if (!raw) return emptyStats()
  try {
    const d = JSON.parse(raw)
    const lb: Array<{ score: number; date: string }> = Array.isArray(d.leaderboard) ? d.leaderboard : []
    const sorted = [...lb].sort((a, b) => b.score - a.score)
    return {
      bestScore: typeof d.bestScore === 'number' ? d.bestScore : 0,
      timesPlayed: typeof d.timesPlayed === 'number' ? d.timesPlayed : 0,
      totalScore: typeof d.totalScore === 'number' ? d.totalScore : 0,
      bestTime: typeof d.bestTime === 'number' ? d.bestTime : 0,
      bestCombo: typeof d.bestCombo === 'number' ? d.bestCombo : 0,
      totalCorrect: typeof d.totalCorrect === 'number' ? d.totalCorrect : 0,
      leaderboard: sorted.map((e, i) => ({ score: e.score, date: e.date, rank: i + 1 })),
    }
  } catch { return emptyStats() }
}

/** Difficulty multiplier: ramps from 1.0 → 2.0 as elapsed approaches timeLimit. */
function diffMultiplier(elapsed: number, timeLimit: number): number {
  return 1 + Math.min(1, elapsed / timeLimit)
}

/** Pick a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Minigame Launcher Interface ───────────────────────────────────────────────

/**
 * Public API surface. All stats are automatically persisted to localStorage
 * under keys of the form `ws_minigame_{type}`.
 */
export interface MinigameLauncher {
  getMinigameConfig(type: MinigameType): MinigameConfig
  getAllMinigames(): Array<{ type: MinigameType; config: MinigameConfig; bestScore: number; timesPlayed: number }>
  startMinigame(type: MinigameType): { gameStateOverrides: Record<string, unknown>; instructions: string }
  recordMinigameResult(type: MinigameType, result: MinigameResult): void
  getMinigameStats(type: MinigameType): MinigameStats
  getLeaderboard(type: MinigameType): Array<{ score: number; date: string; rank: number }>
  getDailyChallenge(): { type: MinigameType; seed: number }
  isMinigameActive(): boolean
  getCurrentMinigame(): MinigameType | null
  endMinigame(): void
  generateScrambledWord(word: string): string
  generateQuizQuestion(category?: string): { question: string; options: string[]; correctIndex: number; word: string }
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a MinigameLauncher instance. Multiple calls share the same localStorage
 * backing store; in-memory state (active session) is per-instance.
 */
export function createMinigameLauncher(): MinigameLauncher {
  let activeMinigame: MinigameType | null = null

  const load = (type: MinigameType): MinigameStats =>
    deserialiseStats(lsGet(`${STORAGE_PREFIX}${type}`))

  const save = (type: MinigameType, stats: MinigameStats): void =>
    lsSet(`${STORAGE_PREFIX}${type}`, serialiseStats(stats))

  function getMinigameConfig(type: MinigameType): MinigameConfig {
    return CONFIGS[type]
  }

  function getAllMinigames(): Array<{
    type: MinigameType; config: MinigameConfig; bestScore: number; timesPlayed: number
  }> {
    return ALL_TYPES.map((t) => {
      const s = load(t)
      return { type: t, config: CONFIGS[t], bestScore: s.bestScore, timesPlayed: s.timesPlayed }
    })
  }

  /**
   * Start a minigame. Returns state overrides to spread onto the game state
   * and a player-facing instruction string.
   */
  function startMinigame(
    type: MinigameType,
  ): { gameStateOverrides: Record<string, unknown>; instructions: string } {
    const cfg = CONFIGS[type]
    activeMinigame = type

    const overrides: Record<string, unknown> = {
      minigameActive: true,
      minigameType: type,
      wallWrap: cfg.wallWrap,
      selfCollisionEnabled: cfg.selfCollisionEnabled,
      minigameTimeLimit: cfg.timeLimit,
      minigameBasePoints: cfg.basePoints,
      minigamePenaltyPoints: cfg.penaltyPoints,
      minigameCombo: 0,
      minigameBestCombo: 0,
      minigameCorrectCount: 0,
      minigameWrongCount: 0,
      // Boss Rush state
      minigameBossNumber: 0,
      minigameBossLives: 0,
      minigameBossesDefeated: 0,
      // Quiz Marathon state
      minigameBrainiacMode: false,
      minigameBrainiacExpires: 0,
      minigameNextQuestionTime: 10,
      // Scramble Blitz state
      minigameCurrentScramble: null,
      minigameWordsForSpeedBoost: 0,
    }

    return { gameStateOverrides: overrides, instructions: cfg.instructions }
  }

  /** Record a completed session — updates bests, appends to leaderboard. */
  function recordMinigameResult(type: MinigameType, result: MinigameResult): void {
    const stats = load(type)
    stats.timesPlayed += 1
    stats.totalScore += result.score
    stats.totalCorrect += result.correctCount
    if (result.score > stats.bestScore) stats.bestScore = result.score
    if (result.timeElapsed > stats.bestTime) stats.bestTime = result.timeElapsed
    if (result.bestCombo > stats.bestCombo) stats.bestCombo = result.bestCombo

    // Insert and trim leaderboard (top 10 by score, descending)
    stats.leaderboard.push({ score: result.score, date: new Date().toISOString(), rank: 0 })
    stats.leaderboard.sort((a, b) => b.score - a.score)
    stats.leaderboard = stats.leaderboard.slice(0, LEADERBOARD_MAX)
    stats.leaderboard.forEach((e, i) => { e.rank = i + 1 })

    save(type, stats)
    activeMinigame = null
  }

  function getMinigameStats(type: MinigameType): MinigameStats { return load(type) }

  function getLeaderboard(type: MinigameType): Array<{ score: number; date: string; rank: number }> {
    return load(type).leaderboard
  }

  /** Daily mini-game rotation based on day-of-year, with a deterministic seed. */
  function getDailyChallenge(): { type: MinigameType; seed: number } {
    const day = getDayOfYear()
    return { type: ALL_TYPES[day % ALL_TYPES.length], seed: day * 7919 + 104729 }
  }

  function isMinigameActive(): boolean { return activeMinigame !== null }
  function getCurrentMinigame(): MinigameType | null { return activeMinigame }
  function endMinigame(): void { activeMinigame = null }

  /** Shuffle a word's letters (uppercased) so it differs from the original. */
  function generateScrambledWord(word: string): string {
    return shuffleWord(word.toUpperCase())
  }

  /** Generate a random quiz question, optionally filtered by category. */
  function generateQuizQuestion(category?: string): {
    question: string; options: string[]; correctIndex: number; word: string
  } {
    let pool = category ? QUIZ_BANK.filter((q) => q.category === category) : [...QUIZ_BANK]
    if (pool.length === 0) pool = [...QUIZ_BANK]

    const q = pick(pool)
    const correctAnswer = q.options[q.correctIndex]
    const shuffled = shuffleArray([...q.options])
    return { question: q.question, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer), word: q.word }
  }

  return {
    getMinigameConfig, getAllMinigames, startMinigame, recordMinigameResult,
    getMinigameStats, getLeaderboard, getDailyChallenge,
    isMinigameActive, getCurrentMinigame, endMinigame,
    generateScrambledWord, generateQuizQuestion,
  }
}

// ── Scoring Helpers (exported for live score computation) ─────────────────────

/**
 * Compute score for a correct Scramble Blitz answer.
 * Base 50 × difficulty ramp (1.0→2.0). 3+ combo = 1.5×. Every 5th = speed boost.
 */
export function computeScrambleScore(
  elapsed: number, timeLimit: number, combo: number, wordsCorrect: number,
): { points: number; newCombo: number; grantSpeedBoost: boolean } {
  let points = Math.round(50 * diffMultiplier(elapsed, timeLimit))
  const newCombo = combo + 1
  if (newCombo >= 3) points = Math.round(points * 1.5)
  return { points, newCombo, grantSpeedBoost: (wordsCorrect + 1) % 5 === 0 }
}

/** Boss Rush defeat score: +200 × boss wave number. */
export function computeBossDefeatScore(bossNumber: number): number {
  return 200 * bossNumber
}

/**
 * Quiz Marathon score delta.
 * Correct: +100 (×2 in brainiac mode) + snake +2.
 * Wrong: -50 + snake -1 + streak reset.
 */
export function computeQuizScore(
  correct: boolean, currentStreak: number, brainiacActive: boolean,
): { points: number; newStreak: number; brainiacActive: boolean; snakeDelta: number } {
  if (correct) {
    const newStreak = currentStreak + 1
    const brainiac = newStreak >= 3
    const mult = (brainiacActive || brainiac) ? 2 : 1
    return { points: 100 * mult, newStreak, brainiacActive: brainiac, snakeDelta: 2 }
  }
  return { points: -50, newStreak: 0, brainiacActive: false, snakeDelta: -1 }
}

/** Boss Rush: cumulative segments to shrink (1 per 15 s elapsed). */
export function bossRushShrinkSegments(elapsedSeconds: number): number {
  return Math.floor(elapsedSeconds / 15)
}

/** Minimum word length for a given boss wave (Boss 1 → 3 letters, Boss 2 → 4, …). */
export function bossWordMinLength(bossNumber: number): number {
  return 2 + bossNumber
}

/** Check if brainiac mode is still active (10 s window). */
export function isBrainiacActive(activatedAt: number, now: number): boolean {
  return now - activatedAt < 10_000
}
