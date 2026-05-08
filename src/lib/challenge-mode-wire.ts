// Challenge Mode Wire — Standalone module for creating, tracking, and completing
// custom gameplay challenges in Word Snake. All state persisted via localStorage.
// Storage key: ws_challenge_mode_wire

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'
export type TargetType =
  | 'words_eaten'
  | 'categories_collected'
  | 'combo_streak'
  | 'survive_time'
  | 'words_without_obstacle'
  | 'category_words'
  | 'score_threshold'
  | 'consecutive_games'
  | 'custom'

export interface ChallengeReward {
  coins: number
  xp: number
  bonus?: number
}

export interface ChallengeTemplate {
  id: string
  name: string
  description: string
  icon: string
  difficulty: ChallengeDifficulty
  category: string
  targetValue: number
  targetType: TargetType
  timeLimit?: number
  reward: ChallengeReward
}

export interface ActiveChallengeState {
  templateId: string
  startedAt: number
  progress: Record<string, number>
  categoriesCollected: string[]
  obstacleHits: number
  currentCombo: number
  maxCombo: number
  consecutiveGames: number
  gamesQuit: boolean
  customCategory?: string
}

export interface ChallengeProgress {
  current: number
  target: number
  percentage: number
  estimatedTimeRemaining: number | null
}

export interface ChallengeCompletionResult {
  completed: boolean
  progress: ChallengeProgress
  message: string
}

export interface CompletedChallengeEntry {
  templateId: string
  completedAt: number
  score: number
  timeElapsed: number
  reward: ChallengeReward
  failed: boolean
}

export interface ChallengeStats {
  totalAttempted: number
  totalCompleted: number
  completionRate: number
  bestTime: number
  totalRewards: ChallengeReward
}

export interface ChallengeLeaderboardEntry {
  templateId: string
  score: number
  time: number
  achievedAt: number
}

export interface ChallengeCard {
  template: ChallengeTemplate
  isCompleted: boolean
  bestScore: number
  bestTime: number
  attempts: number
  completions: number
  recommended: boolean
}

export interface ChallengeOverview {
  active: ActiveChallengeState | null
  activeTemplate: ChallengeTemplate | null
  daily: ChallengeTemplate | null
  dailyCompleted: boolean
  dailyStreak: number
  stats: ChallengeStats
}

export interface CustomChallengeConfig {
  name: string
  description: string
  targetType: TargetType
  targetValue: number
  timeLimit?: number
  category?: string
}

export interface RewardBreakdown {
  [category: string]: { coins: number; xp: number; count: number }
}

export interface MilestoneReward {
  threshold: number
  reward: ChallengeReward
  achieved: boolean
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_challenge_mode_wire'

interface PersistedData {
  activeChallenge: ActiveChallengeState | null
  completedChallenges: CompletedChallengeEntry[]
  leaderboard: ChallengeLeaderboardEntry[]
  customChallenges: ChallengeTemplate[]
  dailyHistory: Record<string, string> // date -> templateId
}

function getDefaultData(): PersistedData {
  return {
    activeChallenge: null,
    completedChallenges: [],
    leaderboard: [],
    customChallenges: [],
    dailyHistory: {},
  }
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    /* quota or private browsing */
  }
}

function loadData(): PersistedData {
  const raw = safeGet(STORAGE_KEY)
  if (!raw) return getDefaultData()
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedData>
    return {
      ...getDefaultData(),
      ...parsed,
      completedChallenges: Array.isArray(parsed.completedChallenges)
        ? parsed.completedChallenges
        : [],
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : [],
      customChallenges: Array.isArray(parsed.customChallenges)
        ? parsed.customChallenges
        : [],
      dailyHistory: parsed.dailyHistory ?? {},
    }
  } catch {
    return getDefaultData()
  }
}

function persistData(data: PersistedData): void {
  safeSet(STORAGE_KEY, JSON.stringify(data))
}

// ─── Date Helpers ───────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr(): string {
  return fmtDate(new Date())
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return fmtDate(d)
}

function dateSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ─── Reward Constants ───────────────────────────────────────────────────────

const DIFFICULTY_REWARD_MULT: Record<ChallengeDifficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  extreme: 3,
}

const MILESTONE_THRESHOLDS = [5, 10, 25, 50, 100]

// ─── 1. Challenge Templates ─────────────────────────────────────────────────

const BUILT_IN_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Eat 15 words in 60 seconds',
    icon: '⚡',
    difficulty: 'medium',
    category: 'speed',
    targetValue: 15,
    targetType: 'words_eaten',
    timeLimit: 60,
    reward: { coins: 100, xp: 50 },
  },
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Collect words from 5 different categories in one game',
    icon: '📚',
    difficulty: 'medium',
    category: 'collection',
    targetValue: 5,
    targetType: 'categories_collected',
    reward: { coins: 150, xp: 75 },
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Achieve a 10\u00d7 combo without missing a word',
    icon: '🔥',
    difficulty: 'hard',
    category: 'combo',
    targetValue: 10,
    targetType: 'combo_streak',
    reward: { coins: 200, xp: 100 },
  },
  {
    id: 'survivalist',
    name: 'Survivalist',
    description: 'Survive for 120 seconds without dying',
    icon: '🛡️',
    difficulty: 'hard',
    category: 'survival',
    targetValue: 120,
    targetType: 'survive_time',
    reward: { coins: 250, xp: 120 },
  },
  {
    id: 'perfect_speller',
    name: 'Perfect Speller',
    description: 'Eat 20 words without hitting any obstacle',
    icon: '✨',
    difficulty: 'hard',
    category: 'precision',
    targetValue: 20,
    targetType: 'words_without_obstacle',
    reward: { coins: 200, xp: 100 },
  },
  {
    id: 'category_specialist',
    name: 'Category Specialist',
    description: 'Eat 10 science words in one game',
    icon: '🔬',
    difficulty: 'medium',
    category: 'science',
    targetValue: 10,
    targetType: 'category_words',
    reward: { coins: 150, xp: 75 },
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Eat 25 words in 90 seconds',
    icon: '📖',
    difficulty: 'hard',
    category: 'speed',
    targetValue: 25,
    targetType: 'words_eaten',
    timeLimit: 90,
    reward: { coins: 250, xp: 125 },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Score 500 points using only 5 words (rare words only)',
    icon: '💎',
    difficulty: 'extreme',
    category: 'precision',
    targetValue: 500,
    targetType: 'score_threshold',
    reward: { coins: 400, xp: 200 },
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play 3 consecutive games without quitting',
    icon: '🏃',
    difficulty: 'medium',
    category: 'endurance',
    targetValue: 3,
    targetType: 'consecutive_games',
    reward: { coins: 150, xp: 75 },
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Score 1000+ points in a single game',
    icon: '🎰',
    difficulty: 'hard',
    category: 'score',
    targetValue: 1000,
    targetType: 'score_threshold',
    reward: { coins: 300, xp: 150 },
  },
]

function getAllTemplates(): ChallengeTemplate[] {
  try {
    const data = loadData()
    return [...BUILT_IN_TEMPLATES, ...data.customChallenges]
  } catch {
    return [...BUILT_IN_TEMPLATES]
  }
}

function findTemplate(id: string): ChallengeTemplate | null {
  try {
    return getAllTemplates().find((t) => t.id === id) ?? null
  } catch {
    return null
  }
}

export function getChallengeTemplates(): ChallengeTemplate[] {
  try {
    return getAllTemplates()
  } catch {
    return [...BUILT_IN_TEMPLATES]
  }
}

// ─── 2. Active Challenge Management ─────────────────────────────────────────

export function startChallenge(templateId: string): ActiveChallengeState | null {
  try {
    const template = findTemplate(templateId)
    if (!template) return null

    const data = loadData()

    const state: ActiveChallengeState = {
      templateId,
      startedAt: Date.now(),
      progress: {},
      categoriesCollected: [],
      obstacleHits: 0,
      currentCombo: 0,
      maxCombo: 0,
      consecutiveGames: 0,
      gamesQuit: false,
      customCategory:
        template.targetType === 'category_words' ? template.category : undefined,
    }

    data.activeChallenge = state
    persistData(data)
    return state
  } catch {
    return null
  }
}

export function getActiveChallenge(): ActiveChallengeState | null {
  try {
    return loadData().activeChallenge
  } catch {
    return null
  }
}

export function cancelChallenge(): void {
  try {
    const data = loadData()
    if (!data.activeChallenge) return

    data.completedChallenges.push({
      templateId: data.activeChallenge.templateId,
      completedAt: Date.now(),
      score: 0,
      timeElapsed: 0,
      reward: { coins: 0, xp: 0 },
      failed: true,
    })

    data.activeChallenge = null
    persistData(data)
  } catch {
    /* silent */
  }
}

export function updateChallengeProgress(metric: string, value: number): void {
  try {
    const data = loadData()
    if (!data.activeChallenge) return

    const current = data.activeChallenge.progress[metric] ?? 0
    data.activeChallenge.progress[metric] = Math.max(current, value)

    // Track combo separately for combo challenges
    if (metric === 'combo') {
      data.activeChallenge.currentCombo = value
      if (value > data.activeChallenge.maxCombo) {
        data.activeChallenge.maxCombo = value
      }
    }

    // Track obstacle hits
    if (metric === 'obstacleHit') {
      data.activeChallenge.obstacleHits += 1
    }

    // Track categories
    if (metric === 'category') {
      const catKey = String(value)
      if (!data.activeChallenge.categoriesCollected.includes(catKey)) {
        data.activeChallenge.categoriesCollected.push(catKey)
      }
    }

    // Track game completion for marathon
    if (metric === 'gameCompleted') {
      data.activeChallenge.consecutiveGames += 1
    }

    if (metric === 'gameQuit') {
      data.activeChallenge.gamesQuit = true
    }

    persistData(data)
  } catch {
    /* silent */
  }
}

export function checkChallengeCompletion(): ChallengeCompletionResult {
  try {
    const data = loadData()
    if (!data.activeChallenge) {
      return {
        completed: false,
        progress: { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null },
        message: 'No active challenge',
      }
    }

    const template = findTemplate(data.activeChallenge.templateId)
    if (!template) {
      return {
        completed: false,
        progress: { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null },
        message: 'Unknown challenge template',
      }
    }

    let current = 0
    switch (template.targetType) {
      case 'words_eaten':
        current = data.activeChallenge.progress['wordsEaten'] ?? 0
        break
      case 'categories_collected':
        current = data.activeChallenge.categoriesCollected.length
        break
      case 'combo_streak':
        current = data.activeChallenge.maxCombo
        break
      case 'survive_time':
        current = data.activeChallenge.progress['survivalTime'] ?? 0
        break
      case 'words_without_obstacle':
        current = (data.activeChallenge.progress['wordsEaten'] ?? 0) - data.activeChallenge.obstacleHits
        break
      case 'category_words':
        current = data.activeChallenge.progress['categoryWords'] ?? 0
        break
      case 'score_threshold':
        current = data.activeChallenge.progress['score'] ?? 0
        break
      case 'consecutive_games':
        current = data.activeChallenge.consecutiveGames
        break
      case 'custom':
        current = data.activeChallenge.progress['custom'] ?? 0
        break
    }

    const target = template.targetValue
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
    const completed = current >= target

    const elapsed = (Date.now() - data.activeChallenge.startedAt) / 1000
    const rate = elapsed > 0 ? current / elapsed : 0
    const remaining =
      rate > 0 && !completed
        ? Math.max((target - current) / rate, 0)
        : null

    return {
      completed,
      progress: {
        current,
        target,
        percentage: Math.round(percentage * 100) / 100,
        estimatedTimeRemaining: remaining !== null ? Math.round(remaining) : null,
      },
      message: completed
        ? `Challenge complete! ${template.name} achieved.`
        : `${template.name}: ${Math.round(percentage)}% complete (${current}/${target})`,
    }
  } catch {
    return {
      completed: false,
      progress: { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null },
      message: 'Error checking challenge',
    }
  }
}

export function completeChallenge(score: number): ChallengeReward | null {
  try {
    const data = loadData()
    if (!data.activeChallenge) return null

    const template = findTemplate(data.activeChallenge.templateId)
    if (!template) return null

    const timeElapsed =
      (Date.now() - data.activeChallenge.startedAt) / 1000

    const completion = checkChallengeCompletion()
    const timeBonus =
      template.timeLimit && timeElapsed < template.timeLimit
        ? Math.round((template.timeLimit - timeElapsed) * 2)
        : 0

    const reward = calculateReward(
      data.activeChallenge.templateId,
      score,
      timeBonus,
    )

    data.completedChallenges.push({
      templateId: data.activeChallenge.templateId,
      completedAt: Date.now(),
      score,
      timeElapsed,
      reward,
      failed: !completion.completed,
    })

    // Update leaderboard
    if (completion.completed) {
      data.leaderboard.push({
        templateId: data.activeChallenge.templateId,
        score,
        time: timeElapsed,
        achievedAt: Date.now(),
      })
      // Keep only top 100 per challenge
      const entryCounts: Record<string, number> = {}
      const filtered: ChallengeLeaderboardEntry[] = []
      for (let i = data.leaderboard.length - 1; i >= 0; i--) {
        const entry = data.leaderboard[i]
        entryCounts[entry.templateId] = (entryCounts[entry.templateId] ?? 0) + 1
        if (entryCounts[entry.templateId] <= 100) {
          filtered.unshift(entry)
        }
      }
      data.leaderboard = filtered
    }

    data.activeChallenge = null
    persistData(data)
    return reward
  } catch {
    return null
  }
}

// ─── 3. Challenge Progress Tracking ─────────────────────────────────────────

export function getProgress(challengeId: string): ChallengeProgress {
  try {
    const data = loadData()
    if (!data.activeChallenge || data.activeChallenge.templateId !== challengeId) {
      return { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null }
    }

    const completion = checkChallengeCompletion()
    return completion.progress
  } catch {
    return { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null }
  }
}

export function getChallengeTimer(): number | null {
  try {
    const data = loadData()
    if (!data.activeChallenge) return null

    const template = findTemplate(data.activeChallenge.templateId)
    if (!template?.timeLimit) return null

    const elapsed = (Date.now() - data.activeChallenge.startedAt) / 1000
    return Math.max(template.timeLimit - elapsed, 0)
  } catch {
    return null
  }
}

export function isChallengeActive(): boolean {
  try {
    return loadData().activeChallenge !== null
  } catch {
    return false
  }
}

export function getChallengeModifier(): Record<string, unknown> {
  try {
    const data = loadData()
    if (!data.activeChallenge) return {}

    const template = findTemplate(data.activeChallenge.templateId)
    if (!template) return {}

    const modifiers: Record<string, unknown> = {}

    if (template.targetType === 'category_words' && template.category) {
      modifiers.categoryFilter = template.category
      modifiers.wordCategoryBoost = true
    }

    if (template.targetType === 'words_without_obstacle') {
      modifiers.obstacleSensitivity = 'high'
      modifiers.showObstacleWarning = true
    }

    if (template.difficulty === 'extreme') {
      modifiers.speedMultiplier = 1.25
    } else if (template.difficulty === 'hard') {
      modifiers.speedMultiplier = 1.1
    }

    if (template.timeLimit) {
      modifiers.timeLimit = template.timeLimit
      modifiers.showTimer = true
    }

    if (template.targetType === 'combo_streak') {
      modifiers.showComboMeter = true
      modifiers.comboSensitivity = 'strict'
    }

    if (template.targetType === 'survive_time') {
      modifiers.survivalMode = true
    }

    return modifiers
  } catch {
    return {}
  }
}

// ─── 4. Challenge History & Stats ────────────────────────────────────────────

export function getChallengeHistory(): CompletedChallengeEntry[] {
  try {
    const data = loadData()
    return [...data.completedChallenges].sort(
      (a, b) => b.completedAt - a.completedAt,
    )
  } catch {
    return []
  }
}

export function getChallengeStats(): ChallengeStats {
  try {
    const history = getChallengeHistory()
    const totalAttempted = history.length
    const successful = history.filter((h) => !h.failed)
    const totalCompleted = successful.length

    const completionRate =
      totalAttempted > 0 ? totalCompleted / totalAttempted : 0

    const completedTimes = successful
      .map((h) => h.timeElapsed)
      .filter((t) => t > 0)
    const bestTime =
      completedTimes.length > 0 ? Math.min(...completedTimes) : 0

    const totalCoins = successful.reduce((s, h) => s + h.reward.coins, 0)
    const totalXp = successful.reduce((s, h) => s + h.reward.xp, 0)
    const totalBonus = successful.reduce(
      (s, h) => s + (h.reward.bonus ?? 0),
      0,
    )

    return {
      totalAttempted,
      totalCompleted,
      completionRate: Math.round(completionRate * 10000) / 100,
      bestTime: Math.round(bestTime * 100) / 100,
      totalRewards: { coins: totalCoins, xp: totalXp, bonus: totalBonus },
    }
  } catch {
    return {
      totalAttempted: 0,
      totalCompleted: 0,
      completionRate: 0,
      bestTime: 0,
      totalRewards: { coins: 0, xp: 0, bonus: 0 },
    }
  }
}

export function getCompletedChallenges(): Set<string> {
  try {
    const history = getChallengeHistory()
    return new Set(
      history.filter((h) => !h.failed).map((h) => h.templateId),
    )
  } catch {
    return new Set()
  }
}

export function getCompletionRate(): number {
  try {
    return getChallengeStats().completionRate
  } catch {
    return 0
  }
}

export function getChallengeStreak(): number {
  try {
    const history = getChallengeHistory()
    let streak = 0
    for (const entry of history) {
      if (!entry.failed) {
        streak++
      } else {
        break
      }
    }
    return streak
  } catch {
    return 0
  }
}

export function getMostFailedChallenge(): ChallengeTemplate | null {
  try {
    const history = getChallengeHistory()
    const failures: Record<string, number> = {}

    for (const entry of history) {
      if (entry.failed) {
        failures[entry.templateId] = (failures[entry.templateId] ?? 0) + 1
      }
    }

    let maxFailures = 0
    let mostFailedId: string | null = null
    for (const [id, count] of Object.entries(failures)) {
      if (count > maxFailures) {
        maxFailures = count
        mostFailedId = id
      }
    }

    if (!mostFailedId) return null
    return findTemplate(mostFailedId)
  } catch {
    return null
  }
}

// ─── 5. Daily Challenges ────────────────────────────────────────────────────

export function getDailyChallenge(): ChallengeTemplate | null {
  try {
    const today = todayStr()
    const seed = dateSeed(today)
    const templates = BUILT_IN_TEMPLATES
    const index = seed % templates.length
    return templates[index]
  } catch {
    return null
  }
}

export function getDailyChallengeProgress(): ChallengeProgress {
  try {
    const daily = getDailyChallenge()
    if (!daily)
      return { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null }

    const data = loadData()
    const today = todayStr()
    const completedTemplateId = data.dailyHistory[today]

    if (completedTemplateId === daily.id) {
      return { current: daily.targetValue, target: daily.targetValue, percentage: 100, estimatedTimeRemaining: null }
    }

    // Check if currently active on daily
    if (data.activeChallenge?.templateId === daily.id) {
      return getProgress(daily.id)
    }

    return { current: 0, target: daily.targetValue, percentage: 0, estimatedTimeRemaining: null }
  } catch {
    return { current: 0, target: 0, percentage: 0, estimatedTimeRemaining: null }
  }
}

export function getDailyChallengeStreak(): number {
  try {
    const data = loadData()
    let streak = 0
    const cursor = new Date()

    while (true) {
      const key = fmtDate(cursor)
      if (data.dailyHistory[key]) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  } catch {
    return 0
  }
}

export function getDailyRewardBonus(): number {
  try {
    const streak = getDailyChallengeStreak()
    if (streak >= 7) return 3
    if (streak >= 5) return 2.5
    if (streak >= 3) return 2
    if (streak >= 1) return 1.5
    return 1
  } catch {
    return 1
  }
}

export function getWeeklyDailyProgress(): number {
  try {
    const data = loadData()
    let count = 0
    for (let i = 0; i < 7; i++) {
      const key = daysAgo(i)
      if (data.dailyHistory[key]) count++
    }
    return count
  } catch {
    return 0
  }
}

// ─── 6. Challenge Rewards ───────────────────────────────────────────────────

export function calculateReward(
  templateId: string,
  score: number,
  timeBonus: number,
): ChallengeReward {
  try {
    const template = findTemplate(templateId)
    const difficulty = template?.difficulty ?? 'medium'
    const baseCoins = template?.reward.coins ?? 100
    const baseXp = template?.reward.xp ?? 50

    const mult = DIFFICULTY_REWARD_MULT[difficulty]

    const dailyBonus = 1 // base multiplier
    const scoreBonus = Math.floor(score / 100) * 10
    const totalBonus = timeBonus + scoreBonus

    const coins = Math.round(baseCoins * mult) + totalBonus
    const xp = Math.round(baseXp * mult) + Math.floor(scoreBonus / 2)

    return {
      coins: Math.max(coins, 0),
      xp: Math.max(xp, 0),
      bonus: Math.max(totalBonus, 0),
    }
  } catch {
    return { coins: 50, xp: 25, bonus: 0 }
  }
}

export function getTotalRewardsEarned(): ChallengeReward {
  try {
    const history = getChallengeHistory()
    const successful = history.filter((h) => !h.failed)
    return {
      coins: successful.reduce((s, h) => s + h.reward.coins, 0),
      xp: successful.reduce((s, h) => s + h.reward.xp, 0),
      bonus: successful.reduce((s, h) => s + (h.reward.bonus ?? 0), 0),
    }
  } catch {
    return { coins: 0, xp: 0, bonus: 0 }
  }
}

export function getRewardBreakdown(): RewardBreakdown {
  try {
    const history = getChallengeHistory()
    const successful = history.filter((h) => !h.failed)
    const breakdown: RewardBreakdown = {}

    for (const entry of successful) {
      const template = findTemplate(entry.templateId)
      const category = template?.category ?? 'other'

      if (!breakdown[category]) {
        breakdown[category] = { coins: 0, xp: 0, count: 0 }
      }

      breakdown[category].coins += entry.reward.coins
      breakdown[category].xp += entry.reward.xp
      breakdown[category].count += 1
    }

    return breakdown
  } catch {
    return {}
  }
}

export function getMilestoneRewards(): MilestoneReward[] {
  try {
    const totalCompleted = getChallengeStats().totalCompleted

    return MILESTONE_THRESHOLDS.map((threshold) => {
      const coins = threshold * 50
      const xp = threshold * 25
      return {
        threshold,
        reward: { coins, xp },
        achieved: totalCompleted >= threshold,
      }
    })
  } catch {
    return MILESTONE_THRESHOLDS.map((threshold) => ({
      threshold,
      reward: { coins: threshold * 50, xp: threshold * 25 },
      achieved: false,
    }))
  }
}

// ─── 7. Custom Challenge Creation ───────────────────────────────────────────

export function createCustomChallenge(
  config: CustomChallengeConfig,
): ChallengeTemplate | null {
  try {
    const data = loadData()

    const difficulty = estimateCustomDifficulty(config)

    const template: ChallengeTemplate = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: config.name,
      description: config.description,
      icon: '🎯',
      difficulty,
      category: config.category ?? 'custom',
      targetValue: config.targetValue,
      targetType: config.targetType,
      timeLimit: config.timeLimit,
      reward: estimateCustomReward(config, difficulty),
    }

    data.customChallenges.push(template)
    persistData(data)
    return template
  } catch {
    return null
  }
}

function estimateCustomDifficulty(
  config: CustomChallengeConfig,
): ChallengeDifficulty {
  let score = 0

  if (config.targetValue >= 25) score += 3
  else if (config.targetValue >= 15) score += 2
  else if (config.targetValue >= 8) score += 1

  if (config.timeLimit && config.timeLimit <= 30) score += 3
  else if (config.timeLimit && config.timeLimit <= 60) score += 2
  else if (config.timeLimit) score += 1

  if (
    config.targetType === 'words_without_obstacle' ||
    config.targetType === 'combo_streak'
  ) {
    score += 2
  }

  if (score >= 6) return 'extreme'
  if (score >= 4) return 'hard'
  if (score >= 2) return 'medium'
  return 'easy'
}

function estimateCustomReward(
  config: CustomChallengeConfig,
  difficulty: ChallengeDifficulty,
): ChallengeReward {
  const mult = DIFFICULTY_REWARD_MULT[difficulty]
  return {
    coins: Math.round(80 * mult),
    xp: Math.round(40 * mult),
  }
}

export function getCustomChallenges(): ChallengeTemplate[] {
  try {
    return [...loadData().customChallenges]
  } catch {
    return []
  }
}

export function deleteCustomChallenge(id: string): boolean {
  try {
    if (!id.startsWith('custom_')) return false

    const data = loadData()
    const before = data.customChallenges.length
    data.customChallenges = data.customChallenges.filter((c) => c.id !== id)
    persistData(data)
    return data.customChallenges.length < before
  } catch {
    return false
  }
}

export function shareChallenge(id: string): string | null {
  try {
    const template = findTemplate(id)
    if (!template) return null

    const payload = {
      n: template.name,
      d: template.description,
      t: template.targetType,
      v: template.targetValue,
      tl: template.timeLimit,
      c: template.category,
    }
    return btoa(JSON.stringify(payload))
  } catch {
    return null
  }
}

// ─── 8. Challenge Leaderboard ───────────────────────────────────────────────

export function getChallengeLeaderboard(
  templateId: string,
): ChallengeLeaderboardEntry[] {
  try {
    const data = loadData()
    return data.leaderboard
      .filter((e) => e.templateId === templateId)
      .sort((a, b) => b.score - a.score || a.time - b.time)
      .slice(0, 50)
  } catch {
    return []
  }
}

export function submitChallengeScore(
  templateId: string,
  score: number,
  time: number,
): void {
  try {
    const data = loadData()
    data.leaderboard.push({
      templateId,
      score,
      time,
      achievedAt: Date.now(),
    })
    persistData(data)
  } catch {
    /* silent */
  }
}

export function getPersonalBest(
  templateId: string,
): ChallengeLeaderboardEntry | null {
  try {
    const entries = getChallengeLeaderboard(templateId)
    return entries.length > 0 ? entries[0] : null
  } catch {
    return null
  }
}

// ─── 9. UI Helpers ──────────────────────────────────────────────────────────

export function getChallengeOverview(): ChallengeOverview {
  try {
    const data = loadData()
    const activeState = data.activeChallenge
    const activeTemplate = activeState
      ? findTemplate(activeState.templateId)
      : null
    const daily = getDailyChallenge()
    const today = todayStr()
    const dailyCompleted = data.dailyHistory[today] !== undefined

    return {
      active: activeState,
      activeTemplate,
      daily,
      dailyCompleted,
      dailyStreak: getDailyChallengeStreak(),
      stats: getChallengeStats(),
    }
  } catch {
    return {
      active: null,
      activeTemplate: null,
      daily: null,
      dailyCompleted: false,
      dailyStreak: 0,
      stats: {
        totalAttempted: 0,
        totalCompleted: 0,
        completionRate: 0,
        bestTime: 0,
        totalRewards: { coins: 0, xp: 0, bonus: 0 },
      },
    }
  }
}

export function getAvailableChallenges(): ChallengeTemplate[] {
  try {
    const completed = getCompletedChallenges()
    return getAllTemplates().filter((t) => {
      if (completed.has(t.id)) {
        // Completed challenges are repeatable only for hard/extreme
        return t.difficulty === 'hard' || t.difficulty === 'extreme'
      }
      return true
    })
  } catch {
    return getAllTemplates()
  }
}

export function getRecommendedChallenges(): ChallengeTemplate[] {
  try {
    const stats = getChallengeStats()
    const completed = getCompletedChallenges()
    const all = getAllTemplates()

    // Determine player skill level from completion rate
    let skillLevel: ChallengeDifficulty
    if (stats.completionRate >= 80) {
      skillLevel = 'extreme'
    } else if (stats.completionRate >= 50) {
      skillLevel = 'hard'
    } else if (stats.totalAttempted > 0) {
      skillLevel = 'medium'
    } else {
      skillLevel = 'easy'
    }

    const targetDifficulties: ChallengeDifficulty[] = []
    if (skillLevel === 'easy') {
      targetDifficulties.push('easy', 'medium')
    } else if (skillLevel === 'medium') {
      targetDifficulties.push('medium', 'hard')
    } else if (skillLevel === 'hard') {
      targetDifficulties.push('hard', 'extreme')
    } else {
      targetDifficulties.push('extreme', 'hard')
    }

    // Prefer uncompleted challenges
    const uncompleted = all.filter((t) => !completed.has(t.id))

    const candidates = uncompleted.length > 0 ? uncompleted : all

    return candidates
      .filter((t) => targetDifficulties.includes(t.difficulty))
      .slice(0, 5)
  } catch {
    return getAllTemplates().slice(0, 5)
  }
}

export function getChallengeCard(templateId: string): ChallengeCard | null {
  try {
    const template = findTemplate(templateId)
    if (!template) return null

    const completed = getCompletedChallenges()
    const history = getChallengeHistory()
    const successful = history.filter(
      (h) => h.templateId === templateId && !h.failed,
    )
    const attempts = history.filter(
      (h) => h.templateId === templateId,
    ).length

    const scores = successful.map((h) => h.score)
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0

    const times = successful
      .map((h) => h.timeElapsed)
      .filter((t) => t > 0)
    const bestTime =
      times.length > 0 ? Math.min(...times) : 0

    // Simple recommendation heuristic: not completed, matches skill level
    const isRecommended = !completed.has(templateId) && attempts < 3

    return {
      template,
      isCompleted: completed.has(templateId),
      bestScore,
      bestTime: Math.round(bestTime * 100) / 100,
      attempts,
      completions: successful.length,
      recommended: isRecommended,
    }
  } catch {
    return null
  }
}

// ─── Daily Completion Tracking (used internally by completeChallenge) ────────

/**
 * Mark today's daily challenge as completed. Call this after successfully
 * finishing the daily challenge to track streaks.
 */
export function markDailyChallengeCompleted(templateId: string): void {
  try {
    const daily = getDailyChallenge()
    if (!daily) return

    const data = loadData()
    const today = todayStr()

    if (daily.id === templateId || data.activeChallenge?.templateId === templateId) {
      data.dailyHistory[today] = templateId
      persistData(data)
    }
  } catch {
    /* silent */
  }
}

/**
 * Reset all challenge data. Useful for testing or fresh starts.
 */
export function resetChallengeData(): void {
  try {
    persistData(getDefaultData())
  } catch {
    /* silent */
  }
}
