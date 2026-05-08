'use client'

// ─── Progress Dashboard Wire ────────────────────────────────────────────────
// Central aggregation layer reading from ALL game systems for a unified
// progress dashboard. Standalone exported functions, no class.

// ─── Types ──────────────────────────────────────────────────────────────────

export type ProgressGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface GameplayProgress {
  gamesPlayed: number
  totalScore: number
  bestScore: number
  hoursPlayed: number
  avgScore: number
  maxCombo: number
  powerUpsCollected: number
}

export interface CollectionProgress {
  wordsCollected: number
  totalWordsAvailable: number
  percentCollected: number
  byCategory: Record<string, number>
  rarestWords: string[]
}

export interface MasteryProgress {
  wordsMastered: number
  wordsLegendary: number
  averageMastery: number
  byLevel: Record<string, number>
  weakestCategories: string[]
  totalWordsTracked: number
}

export interface AchievementProgress {
  unlocked: number
  total: number
  byRarity: Record<string, { unlocked: number; total: number }>
  percentComplete: number
}

export interface SocialProgress {
  currentStreak: number
  longestStreak: number
  multiplayerGames: number
  tournamentWins: number
  friendsPlayedWith: number
}

export interface ExplorationProgress {
  storyChaptersCompleted: number
  storyChaptersTotal: number
  worldMapRegions: number
  worldMapRegionsTotal: number
  loreDiscovered: number
  loreTotal: number
}

export interface EconomyProgress {
  coinsEarned: number
  coinsSpent: number
  coinsBalance: number
  shopItemsPurchased: number
  shopItemsTotal: number
}

export interface BattlePassProgress {
  currentTier: number
  totalTiers: number
  seasonXP: number
  rewardsClaimed: number
  rewardsTotal: number
  isPremium: boolean
}

export interface DailyProgressDelta {
  scoreGained: number
  wordsCollected: number
  gamesPlayed: number
  achievementsUnlocked: number
  xpGained: number
}

export interface WeeklyProgress {
  gamesPlayed: number
  wordsCollected: number
  scoreGained: number
  avgScorePerGame: number
  daysActive: number
  xpGained: number
  vsLastWeek: { gamesPlayed: number; scoreGained: number; wordsCollected: number }
}

export interface MonthlyProgress {
  gamesPlayed: number
  totalScore: number
  wordsCollected: number
  achievementsUnlocked: number
  activeDays: number
}

export interface TrendPoint {
  date: string
  score: number
}

export interface Goal {
  id: string
  title: string
  description: string
  emoji: string
  target: number
  category: string
}

export interface GoalStatus {
  goal: Goal
  current: number
  percent: number
  completed: boolean
}

export interface Milestone {
  id: string
  title: string
  description: string
  emoji: string
  achievedAt: string | null
  targetValue: number
}

export interface ComparativeStat {
  label: string
  playerValue: number
  averageValue: number
  percentAbove: number
}

export interface StrengthWeakness {
  area: string
  rating: number
  label: string
  isStrength: boolean
}

export interface ImprovementSuggestion {
  area: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
}

export interface WidgetConfig {
  id: string
  title: string
  type: 'ring' | 'bar' | 'card' | 'list' | 'chart' | 'timeline'
  size: 'small' | 'medium' | 'large'
  defaultOrder: number
}

export interface DashboardLayout {
  widgets: string[]
  hidden: string[]
}

export interface ProgressRingData {
  label: string
  value: number
  max: number
  color: string
  emoji: string
}

export interface ProgressBarData {
  label: string
  value: number
  max: number
  percent: number
  color: string
}

export interface SummaryCard {
  overallScore: number
  grade: ProgressGrade
  totalGames: number
  totalWords: number
  achievementsUnlocked: number
  achievementsTotal: number
  currentStreak: number
  hoursPlayed: number
  motto: string
}

export interface DashboardOverview {
  summary: SummaryCard
  rings: ProgressRingData[]
  bars: ProgressBarData[]
  todayDelta: DailyProgressDelta
  activeGoals: number
  completedGoals: number
  nextMilestone: Milestone | null
  topStrengths: StrengthWeakness[]
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

const DASHBOARD_KEY = 'ws_progress_dashboard'
const SNAPSHOT_KEY = 'ws_progress_daily_snapshots'
const TOTAL_WORDS_EST = 2000

function gN(key: string, fb = 0): number {
  if (typeof window === 'undefined') return fb
  try { const v = localStorage.getItem(key); return v ? (parseInt(v, 10) || fb) : fb } catch { return fb }
}
function gO<T>(key: string, fb: T): T {
  if (typeof window === 'undefined') return fb
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fb } catch { return fb }
}
function sS(key: string, val: unknown): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)) } catch { /* quota */ }
}
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)) }
function dStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function readSnaps(): Record<string, number> { return gO<Record<string, number>>(SNAPSHOT_KEY, {}) }
function recordSnapshot(): void {
  try {
    const s = readSnaps(); s[dStr()] = getOverallProgressScore()
    const k = Object.keys(s).sort()
    if (k.length > 90) { const t: Record<string, number> = {}; for (const x of k.slice(-90)) t[x] = s[x]; sS(SNAPSHOT_KEY, t) }
    else sS(SNAPSHOT_KEY, s)
  } catch { /* ignore */ }
}

// ─── 1. Overall Progress Score ──────────────────────────────────────────────

export function getOverallProgressScore(): number {
  try {
    const gp = getGameplayProgress(), cp = getCollectionProgress(), mp = getMasteryProgress()
    const ap = getAchievementProgress(), sp = getSocialProgress(), ep = getExplorationProgress()
    const ec = getEconomyProgress(), bp = getBattlePassProgress()
    let s = 0
    s += clamp(gp.gamesPlayed / 100, 0, 1) * 150 + clamp(gp.totalScore / 50000, 0, 1) * 100
    s += clamp(cp.percentCollected / 100, 0, 1) * 150 + clamp(mp.averageMastery / 5, 0, 1) * 100
    s += clamp(ap.percentComplete / 100, 0, 1) * 150 + clamp(sp.currentStreak / 30, 0, 1) * 80
    s += clamp(ep.storyChaptersCompleted / ep.storyChaptersTotal, 0, 1) * 100
    s += clamp(ec.coinsEarned / 10000, 0, 1) * 70 + clamp(bp.currentTier / bp.totalTiers, 0, 1) * 100
    return Math.round(clamp(s, 0, 1000))
  } catch { return 0 }
}

export function getProgressGrade(): ProgressGrade {
  const s = getOverallProgressScore()
  if (s >= 900) return 'S'; if (s >= 750) return 'A'; if (s >= 600) return 'B'
  if (s >= 450) return 'C'; if (s >= 300) return 'D'; return 'F'
}

export function getProgressPercent(): number {
  return clamp(Math.round((getOverallProgressScore() / 1000) * 10000) / 100, 0, 100)
}

export function getProgressVelocity(): number {
  try {
    const sn = readSnaps(), cut = dStr(new Date(Date.now() - 7 * 86400000))
    const e = Object.entries(sn).filter(([d]) => d >= cut).sort(([a], [b]) => a.localeCompare(b))
    if (e.length < 2) return 0
    return Math.round((e[e.length - 1][1] - e[0][1]) / Math.max(1, e.length - 1))
  } catch { return 0 }
}

// ─── 2. Category Breakdown ──────────────────────────────────────────────────

export function getGameplayProgress(): GameplayProgress {
  try {
    const g = gN('word-snake-games'), ts = gN('word-snake-total-score'), bs = gN('word-snake-best-score', 0)
    return {
      gamesPlayed: g, totalScore: ts,
      bestScore: bs > 0 ? bs : (g > 0 ? Math.round(ts / g * 1.5) : 0),
      hoursPlayed: Math.round(gN('word-snake-total-play-time') / 3600000),
      avgScore: g > 0 ? Math.round(ts / g) : 0, maxCombo: gN('word-snake-max-combo'),
      powerUpsCollected: gN('word-snake-powerups-collected'),
    }
  } catch { return { gamesPlayed: 0, totalScore: 0, bestScore: 0, hoursPlayed: 0, avgScore: 0, maxCombo: 0, powerUpsCollected: 0 } }
}

export function getCollectionProgress(): CollectionProgress {
  try {
    const wc = gN('word-snake-total-words-eaten'), pc = clamp(Math.round((wc / TOTAL_WORDS_EST) * 10000) / 100, 0, 100)
    const rs = gO<Record<string, number>>('word-snake-rarity-stats', {})
    const rarest: string[] = []
    if ((rs['legendary'] ?? 0) > 0) rarest.push(`${rs['legendary']} Legendary`)
    if ((rs['rare'] ?? 0) > 0) rarest.push(`${rs['rare']} Rare`)
    if (!rarest.length) rarest.push('None yet')
    return { wordsCollected: wc, totalWordsAvailable: TOTAL_WORDS_EST, percentCollected: pc, byCategory: gO<Record<string, number>>('word-snake-category-stats', {}), rarestWords: rarest }
  } catch { return { wordsCollected: 0, totalWordsAvailable: TOTAL_WORDS_EST, percentCollected: 0, byCategory: {}, rarestWords: ['None yet'] } }
}

export function getMasteryProgress(): MasteryProgress {
  try {
    const raw = gO<unknown[]>('ws_mastery_data', [])
    if (!Array.isArray(raw) || !raw.length) return { wordsMastered: 0, wordsLegendary: 0, averageMastery: 0, byLevel: {}, weakestCategories: [], totalWordsTracked: 0 }
    const W: Record<string, number> = { new: 0, seen: 1, learning: 2, familiar: 3, mastered: 4, legendary: 5 }
    let wm = 0, wl = 0, tw = 0; const byL: Record<string, number> = {}; const cats = new Map<string, { s: number; c: number }>()
    for (const item of raw) {
      const m = item as Record<string, unknown>, lv = (m.masteryLevel as string) ?? 'new', cat = (m.category as string) ?? 'unknown', w = W[lv] ?? 0
      tw += w; byL[lv] = (byL[lv] ?? 0) + 1; if (lv === 'mastered') wm++; if (lv === 'legendary') wl++
      const e = cats.get(cat) ?? { s: 0, c: 0 }; e.s += w; e.c++; cats.set(cat, e)
    }
    const weak = Array.from(cats.entries()).map(([c, d]) => ({ c, a: d.c > 0 ? d.s / d.c : 0 })).sort((a, b) => a.a - b.a).slice(0, 3).map(x => x.c)
    return { wordsMastered: wm, wordsLegendary: wl, averageMastery: Math.round((tw / raw.length) * 100) / 100, byLevel: byL, weakestCategories: weak, totalWordsTracked: raw.length }
  } catch { return { wordsMastered: 0, wordsLegendary: 0, averageMastery: 0, byLevel: {}, weakestCategories: [], totalWordsTracked: 0 } }
}

export function getAchievementProgress(): AchievementProgress {
  try {
    const u = gO<string[]>('word-snake-achievements', []).length, t = Math.max(u, 25)
    return { unlocked: u, total: t, byRarity: { common: { unlocked: u, total: t }, rare: { unlocked: Math.floor(u * 0.3), total: Math.floor(t * 0.3) } }, percentComplete: clamp(Math.round((u / t) * 10000) / 100, 0, 100) }
  } catch { return { unlocked: 0, total: 25, byRarity: { common: { unlocked: 0, total: 25 } }, percentComplete: 0 } }
}

export function getSocialProgress(): SocialProgress {
  try {
    const st = gO<{ currentStreak: number; longestStreak: number }>('word-snake-streak', { currentStreak: 0, longestStreak: 0 })
    return { currentStreak: st.currentStreak ?? 0, longestStreak: st.longestStreak ?? 0, multiplayerGames: gN('word-snake-pvp-games-played', 0), tournamentWins: gN('word-snake-tournament-wins', 0), friendsPlayedWith: gO<string[]>('word-snake-friends-played', []).length }
  } catch { return { currentStreak: 0, longestStreak: 0, multiplayerGames: 0, tournamentWins: 0, friendsPlayedWith: 0 } }
}

export function getExplorationProgress(): ExplorationProgress {
  try {
    const sr = gO<{ completedLevels?: string[] }>('word-snake-story-progress', {}), sd = sr.completedLevels?.length ?? 0
    const md = gO<{ unlockedRegions?: string[]; unlockedLore?: string[] }>('ws_world_map_explorer', {})
    return { storyChaptersCompleted: Math.min(sd, 20), storyChaptersTotal: 20, worldMapRegions: (md.unlockedRegions ?? []).length, worldMapRegionsTotal: 8, loreDiscovered: (md.unlockedLore ?? []).length, loreTotal: 24 }
  } catch { return { storyChaptersCompleted: 0, storyChaptersTotal: 20, worldMapRegions: 0, worldMapRegionsTotal: 8, loreDiscovered: 0, loreTotal: 24 } }
}

export function getEconomyProgress(): EconomyProgress {
  try {
    const b = gO<{ coins: number; totalEarned: number; totalSpent: number }>('word-snake-coins', { coins: 0, totalEarned: 0, totalSpent: 0 })
    return { coinsEarned: b.totalEarned ?? 0, coinsSpent: b.totalSpent ?? 0, coinsBalance: b.coins ?? 0, shopItemsPurchased: Object.values(gO<Record<string, number>>('word-snake-shop-purchases', {})).reduce((s, c) => s + c, 0), shopItemsTotal: 12 }
  } catch { return { coinsEarned: 0, coinsSpent: 0, coinsBalance: 0, shopItemsPurchased: 0, shopItemsTotal: 12 } }
}

export function getBattlePassProgress(): BattlePassProgress {
  try {
    const xp = gO<{ totalSeasonXP: number }>('ws_battle_pass_wire', { totalSeasonXP: 0 }).totalSeasonXP ?? 0
    const tier = Math.min(Math.floor(xp / 500) + 1, 25)
    return { currentTier: tier, totalTiers: 25, seasonXP: xp, rewardsClaimed: Math.min(tier * 2, 50), rewardsTotal: 50, isPremium: false }
  } catch { return { currentTier: 0, totalTiers: 25, seasonXP: 0, rewardsClaimed: 0, rewardsTotal: 50, isPremium: false } }
}

// ─── 3. Time-based Analysis ─────────────────────────────────────────────────

export function getTodayProgress(): DailyProgressDelta {
  try {
    const sn = readSnaps(), ys = dStr(new Date(Date.now() - 86400000))
    return { scoreGained: Math.max(0, (sn[dStr()] ?? 0) - (sn[ys] ?? 0)), wordsCollected: gN('word-snake-today-words', 0), gamesPlayed: gN('word-snake-today-games', 0), achievementsUnlocked: gN('word-snake-today-achievements', 0), xpGained: gN('word-snake-today-xp', 0) }
  } catch { return { scoreGained: 0, wordsCollected: 0, gamesPlayed: 0, achievementsUnlocked: 0, xpGained: 0 } }
}

export function getWeeklyProgress(): WeeklyProgress {
  try {
    const gp = getGameplayProgress(), sn = readSnaps(), now = new Date(), ws = new Date(now); ws.setDate(now.getDate() - now.getDay())
    const lws = new Date(ws); lws.setDate(ws.getDate() - 7)
    let tw = 0, td = 0, lw = 0; const ak = Object.keys(sn).sort()
    for (const k of ak) { if (k >= dStr(ws)) { tw += sn[k]; td++ } else if (k >= dStr(lws)) lw += sn[k] }
    return { gamesPlayed: Math.min(gp.gamesPlayed, 50), wordsCollected: Math.min(gN('word-snake-total-words-eaten'), 200), scoreGained: Math.min(gp.totalScore, 10000), avgScorePerGame: gp.gamesPlayed > 0 ? Math.round(gp.totalScore / gp.gamesPlayed) : 0, daysActive: td, xpGained: tw, vsLastWeek: { gamesPlayed: td - Math.min(7, Math.floor(ak.length / 2)), scoreGained: tw - lw, wordsCollected: Math.round((tw - lw) / 10) } }
  } catch { return { gamesPlayed: 0, wordsCollected: 0, scoreGained: 0, avgScorePerGame: 0, daysActive: 0, xpGained: 0, vsLastWeek: { gamesPlayed: 0, scoreGained: 0, wordsCollected: 0 } } }
}

export function getMonthlyProgress(): MonthlyProgress {
  try {
    const ms = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`, sn = readSnaps()
    let ad = 0; for (const k of Object.keys(sn)) if (k >= ms) ad++
    return { gamesPlayed: gN('word-snake-games'), totalScore: gN('word-snake-total-score'), wordsCollected: gN('word-snake-total-words-eaten'), achievementsUnlocked: gO<string[]>('word-snake-achievements', []).length, activeDays: ad }
  } catch { return { gamesPlayed: 0, totalScore: 0, wordsCollected: 0, achievementsUnlocked: 0, activeDays: 0 } }
}

export function getProgressTrend(days: number): TrendPoint[] {
  try { const sn = readSnaps(), r: TrendPoint[] = [], n = new Date(); for (let i = days - 1; i >= 0; i--) { const d = new Date(n); d.setDate(d.getDate() - i); const k = dStr(d); r.push({ date: k, score: sn[k] ?? 0 }) } return r } catch { return [] }
}

export function getMostProductiveHour(): number {
  try { const h = gO<Record<string, number>>('ws_progress_hourly_stats', {}); let bh = 19, bc = 0; for (let i = 0; i < 24; i++) { const c = h[String(i)] ?? 0; if (c > bc) { bc = c; bh = i } } return bh } catch { return 19 }
}

export function getPlaytimeDistribution(): Record<string, number> {
  try { return gO<Record<string, number>>('ws_progress_dow_stats', { Sun: 14, Mon: 12, Tue: 10, Wed: 14, Thu: 12, Fri: 18, Sat: 20 }) } catch { return { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 } }
}

// ─── 4. Goals & Targets ─────────────────────────────────────────────────────

const GOALS: Goal[] = [
  { id: 'play_100_games', title: 'Play 100 games', description: 'Complete 100 game sessions', emoji: '🎮', target: 100, category: 'gameplay' },
  { id: 'collect_500_words', title: 'Collect 500 words', description: 'Eat 500 words across all games', emoji: '📝', target: 500, category: 'collection' },
  { id: 'collect_2000_words', title: 'Complete the lexicon', description: 'Collect all 2000 available words', emoji: '📚', target: 2000, category: 'collection' },
  { id: 'unlock_all_achievements', title: 'Unlock all achievements', description: 'Earn every achievement in the game', emoji: '🏆', target: 25, category: 'achievement' },
  { id: 'complete_story', title: 'Complete story mode', description: 'Finish all 20 story levels', emoji: '📖', target: 20, category: 'exploration' },
  { id: 'master_100_words', title: 'Master 100 words', description: 'Reach mastery level on 100 words', emoji: '🧠', target: 100, category: 'mastery' },
  { id: 'reach_30_day_streak', title: '30-day streak', description: 'Play for 30 consecutive days', emoji: '🔥', target: 30, category: 'social' },
  { id: 'earn_10000_coins', title: 'Earn 10,000 coins', description: 'Accumulate 10,000 coins total', emoji: '🪙', target: 10000, category: 'economy' },
  { id: 'reach_tier_25', title: 'Max battle pass tier', description: 'Reach tier 25 in the battle pass', emoji: '⭐', target: 25, category: 'battle_pass' },
  { id: 'explore_all_regions', title: 'Explore all regions', description: 'Unlock all 8 world map regions', emoji: '🗺️', target: 8, category: 'exploration' },
  { id: 'score_500_best', title: 'Score 500+', description: 'Achieve a best score of 500+', emoji: '💎', target: 500, category: 'gameplay' },
  { id: 'legendary_10_words', title: 'Legendary 10 words', description: 'Raise 10 words to legendary mastery', emoji: '🌟', target: 10, category: 'mastery' },
]

export function getDefaultGoals(): Goal[] { return [...GOALS] }

function goalCur(g: Goal): number {
  try {
    switch (g.id) {
      case 'play_100_games': return gN('word-snake-games')
      case 'collect_500_words': case 'collect_2000_words': return gN('word-snake-total-words-eaten')
      case 'unlock_all_achievements': return gO<string[]>('word-snake-achievements', []).length
      case 'complete_story': return gO<{ completedLevels?: string[] }>('word-snake-story-progress', {}).completedLevels?.length ?? 0
      case 'master_100_words': return getMasteryProgress().wordsMastered
      case 'reach_30_day_streak': return gO<{ longestStreak: number }>('word-snake-streak', { longestStreak: 0 }).longestStreak ?? 0
      case 'earn_10000_coins': return getEconomyProgress().coinsEarned
      case 'reach_tier_25': return getBattlePassProgress().currentTier
      case 'explore_all_regions': return getExplorationProgress().worldMapRegions
      case 'score_500_best': return getGameplayProgress().bestScore
      case 'legendary_10_words': return getMasteryProgress().wordsLegendary
      default: return 0
    }
  } catch { return 0 }
}

export function getGoalProgress(goalId: string): GoalStatus {
  try {
    const g = GOALS.find(x => x.id === goalId)
    if (!g) return { goal: { id: goalId, title: 'Unknown', description: '', emoji: '❓', target: 1, category: 'unknown' }, current: 0, percent: 0, completed: false }
    const c = goalCur(g), p = clamp(Math.round((c / Math.max(1, g.target)) * 10000) / 100, 0, 100)
    return { goal: g, current: c, percent: p, completed: p >= 100 }
  } catch { return { goal: { id: '', title: 'Unknown', description: '', emoji: '❓', target: 1, category: 'unknown' }, current: 0, percent: 0, completed: false } }
}

export function getAllGoalsProgress(): GoalStatus[] { try { return GOALS.map(g => getGoalProgress(g.id)) } catch { return [] } }
export function getCompletedGoals(): GoalStatus[] { return getAllGoalsProgress().filter(g => g.completed) }
export function getActiveGoals(): GoalStatus[] { return getAllGoalsProgress().filter(g => !g.completed) }
export function getGoalRecommendation(): GoalStatus | null { try { const a = getActiveGoals().sort((a, b) => b.percent - a.percent); return a[0] ?? null } catch { return null } }

// ─── 5. Milestones Timeline ─────────────────────────────────────────────────

const MILES: Milestone[] = [
  { id: 'first_game', title: 'First Steps', description: 'Play your first game', emoji: '🎮', achievedAt: null, targetValue: 1 },
  { id: 'first_10_words', title: 'Getting Started', description: 'Collect 10 words', emoji: '📝', achievedAt: null, targetValue: 10 },
  { id: 'first_100_words', title: 'Word Collector', description: 'Collect 100 words', emoji: '📚', achievedAt: null, targetValue: 100 },
  { id: 'first_500_words', title: 'Lexicon Builder', description: 'Collect 500 words', emoji: '📖', achievedAt: null, targetValue: 500 },
  { id: 'first_achievement', title: 'Achiever', description: 'Unlock your first achievement', emoji: '🏆', achievedAt: null, targetValue: 1 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Reach a 7-day streak', emoji: '🔥', achievedAt: null, targetValue: 7 },
  { id: 'streak_30', title: 'Monthly Devotee', description: 'Reach a 30-day streak', emoji: '🌟', achievedAt: null, targetValue: 30 },
  { id: 'score_100', title: 'Century Score', description: 'Score 100 in a single game', emoji: '💯', achievedAt: null, targetValue: 100 },
  { id: 'score_500', title: 'High Roller', description: 'Score 500 in a single game', emoji: '💎', achievedAt: null, targetValue: 500 },
  { id: 'chapter_1_done', title: 'The Awakening', description: 'Complete Chapter 1', emoji: '🌅', achievedAt: null, targetValue: 4 },
  { id: 'story_complete', title: 'Story Master', description: 'Complete all story levels', emoji: '👑', achievedAt: null, targetValue: 20 },
  { id: 'master_50_words', title: 'Mastery Scholar', description: 'Master 50 words', emoji: '🎓', achievedAt: null, targetValue: 50 },
  { id: 'earn_5000_coins', title: 'Treasure Hunter', description: 'Earn 5,000 coins', emoji: '🪙', achievedAt: null, targetValue: 5000 },
  { id: 'battle_pass_10', title: 'Battle Pass Climber', description: 'Reach tier 10', emoji: '⚔️', achievedAt: null, targetValue: 10 },
  { id: 'explore_4_regions', title: 'Explorer', description: 'Unlock 4 world map regions', emoji: '🗺️', achievedAt: null, targetValue: 4 },
]

function computeMiles(): Milestone[] {
  try {
    const ach = gO<string[]>('word-snake-achievements', []).length, we = gN('word-snake-total-words-eaten')
    const ls = gO<{ longestStreak: number }>('word-snake-streak', { longestStreak: 0 }).longestStreak ?? 0
    const bs = getGameplayProgress().bestScore, sd = gO<{ completedLevels?: string[] }>('word-snake-story-progress', {}).completedLevels?.length ?? 0
    const checks: Record<string, boolean> = {
      first_game: gN('word-snake-games') >= 1, first_10_words: we >= 10, first_100_words: we >= 100, first_500_words: we >= 500,
      first_achievement: ach >= 1, streak_7: ls >= 7, streak_30: ls >= 30, score_100: bs >= 100, score_500: bs >= 500,
      chapter_1_done: sd >= 4, story_complete: sd >= 20, master_50_words: getMasteryProgress().wordsMastered >= 50,
      earn_5000_coins: getEconomyProgress().coinsEarned >= 5000, battle_pass_10: getBattlePassProgress().currentTier >= 10,
      explore_4_regions: getExplorationProgress().worldMapRegions >= 4,
    }
    const now = new Date().toISOString()
    return MILES.map(m => ({ ...m, achievedAt: checks[m.id] ? now : null }))
  } catch { return MILES }
}

export function getMilestones(): Milestone[] { return computeMiles() }
export function getNextMilestone(): Milestone | null { try { return computeMiles().find(m => !m.achievedAt) ?? null } catch { return null } }
export function getMilestoneTimeline(): Milestone[] {
  try { return computeMiles().sort((a, b) => { if (a.achievedAt && b.achievedAt) return a.achievedAt.localeCompare(b.achievedAt); if (a.achievedAt) return -1; if (b.achievedAt) return 1; return 0 }) } catch { return [] }
}
export function getTimeSinceLastMilestone(): number {
  try { const tl = getMilestoneTimeline(), last = tl.filter(m => m.achievedAt).pop(); if (!last?.achievedAt) return Infinity; return Math.max(0, Math.floor((Date.now() - new Date(last.achievedAt).getTime()) / 86400000)) } catch { return Infinity }
}

// ─── 6. Comparative Analysis ────────────────────────────────────────────────

export function compareWithAverage(): ComparativeStat[] {
  try {
    const gp = getGameplayProgress(), cp = getCollectionProgress(), sp = getSocialProgress(), mp = getMasteryProgress()
    const stats: ComparativeStat[] = [
      { label: 'Games Played', playerValue: gp.gamesPlayed, averageValue: 45, percentAbove: 0 },
      { label: 'Best Score', playerValue: gp.bestScore, averageValue: 200, percentAbove: 0 },
      { label: 'Words Collected', playerValue: cp.wordsCollected, averageValue: 350, percentAbove: 0 },
      { label: 'Current Streak', playerValue: sp.currentStreak, averageValue: 5, percentAbove: 0 },
      { label: 'Avg Mastery', playerValue: Math.round(mp.averageMastery * 100), averageValue: 150, percentAbove: 0 },
      { label: 'Hours Played', playerValue: gp.hoursPlayed, averageValue: 8, percentAbove: 0 },
    ]
    for (const s of stats) { const a = Math.max(1, s.averageValue); s.percentAbove = clamp(Math.round(((s.playerValue - a) / a) * 10000) / 100, -100, 500) }
    return stats
  } catch { return [] }
}

export function getPercentile(): number { try { return clamp(Math.min(99, Math.round((getOverallProgressScore() / 1000) * 120)), 5, 99) } catch { return 50 } }

export function getStrengthsAndWeaknesses(): StrengthWeakness[] {
  try {
    const gp = getGameplayProgress(), cp = getCollectionProgress(), mp = getMasteryProgress()
    const sp = getSocialProgress(), ep = getExplorationProgress(), ap = getAchievementProgress()
    return [
      { area: 'gameplay', rating: clamp(gp.gamesPlayed / 50, 0, 1), label: 'Gameplay Volume', isStrength: gp.gamesPlayed >= 50 },
      { area: 'skill', rating: clamp(gp.bestScore / 500, 0, 1), label: 'Game Skill', isStrength: gp.bestScore >= 300 },
      { area: 'collection', rating: clamp(cp.percentCollected / 50, 0, 1), label: 'Word Collection', isStrength: cp.percentCollected >= 30 },
      { area: 'mastery', rating: clamp(mp.averageMastery / 3, 0, 1), label: 'Word Mastery', isStrength: mp.averageMastery >= 2 },
      { area: 'streak', rating: clamp(sp.currentStreak / 14, 0, 1), label: 'Consistency', isStrength: sp.currentStreak >= 7 },
      { area: 'exploration', rating: clamp(ep.storyChaptersCompleted / ep.storyChaptersTotal, 0, 1), label: 'Exploration', isStrength: ep.storyChaptersCompleted >= 10 },
      { area: 'achievement', rating: clamp(ap.percentComplete / 50, 0, 1), label: 'Achievements', isStrength: ap.percentComplete >= 30 },
    ].sort((a, b) => b.rating - a.rating)
  } catch { return [] }
}

export function getImprovementSuggestions(): ImprovementSuggestion[] {
  try {
    const s: ImprovementSuggestion[] = [], gp = getGameplayProgress(), cp = getCollectionProgress()
    const sp = getSocialProgress(), mp = getMasteryProgress(), ep = getExplorationProgress()
    if (gp.gamesPlayed < 10) s.push({ area: 'gameplay', priority: 'high', suggestion: 'Play more games to build your foundation. Aim for at least 10.' })
    if (sp.currentStreak === 0) s.push({ area: 'streak', priority: 'high', suggestion: 'Start a daily streak today! Consistency is key.' })
    if (sp.currentStreak > 0 && sp.currentStreak < 3) s.push({ area: 'streak', priority: 'medium', suggestion: 'Keep your streak going — 3 days until bonus multiplier.' })
    if (cp.percentCollected < 10) s.push({ area: 'collection', priority: 'medium', suggestion: 'Focus on collecting words from unexplored categories.' })
    if (mp.averageMastery < 1 && mp.totalWordsTracked > 0) s.push({ area: 'mastery', priority: 'medium', suggestion: 'Revisit words seen only once to improve mastery.' })
    if (ep.storyChaptersCompleted < 4) s.push({ area: 'exploration', priority: 'low', suggestion: 'Try story mode for guided progression.' })
    if (gp.bestScore < 100) s.push({ area: 'skill', priority: 'medium', suggestion: 'Practice longer word chains to boost your score.' })
    if (mp.weakestCategories.length > 0) s.push({ area: 'mastery', priority: 'low', suggestion: `Practice words in ${mp.weakestCategories[0]} to improve your weakest category.` })
    if (!s.length) s.push({ area: 'general', priority: 'low', suggestion: 'Great progress! Try new game modes to keep growing.' })
    return s
  } catch { return [{ area: 'general', priority: 'low', suggestion: 'Keep playing to unlock suggestions!' }] }
}

// ─── 7. Dashboard Widgets ───────────────────────────────────────────────────

const WIDGETS: WidgetConfig[] = [
  { id: 'overall_score', title: 'Overall Score', type: 'ring', size: 'medium', defaultOrder: 1 },
  { id: 'grade', title: 'Progress Grade', type: 'card', size: 'small', defaultOrder: 2 },
  { id: 'gameplay', title: 'Gameplay Stats', type: 'bar', size: 'medium', defaultOrder: 3 },
  { id: 'collection', title: 'Word Collection', type: 'ring', size: 'medium', defaultOrder: 4 },
  { id: 'mastery', title: 'Word Mastery', type: 'bar', size: 'medium', defaultOrder: 5 },
  { id: 'achievements', title: 'Achievements', type: 'ring', size: 'small', defaultOrder: 6 },
  { id: 'social', title: 'Social & Streak', type: 'card', size: 'small', defaultOrder: 7 },
  { id: 'exploration', title: 'Exploration', type: 'bar', size: 'medium', defaultOrder: 8 },
  { id: 'economy', title: 'Economy', type: 'bar', size: 'small', defaultOrder: 9 },
  { id: 'battle_pass', title: 'Battle Pass', type: 'bar', size: 'medium', defaultOrder: 10 },
  { id: 'goals', title: 'Goals', type: 'list', size: 'large', defaultOrder: 11 },
  { id: 'milestones', title: 'Milestones', type: 'timeline', size: 'large', defaultOrder: 12 },
  { id: 'trend', title: 'Progress Trend', type: 'chart', size: 'medium', defaultOrder: 13 },
  { id: 'comparison', title: 'vs Average', type: 'bar', size: 'medium', defaultOrder: 14 },
  { id: 'suggestions', title: 'Suggestions', type: 'list', size: 'small', defaultOrder: 15 },
]

export function getAvailableWidgets(): WidgetConfig[] { return [...WIDGETS] }
export function getDefaultLayout(): DashboardLayout { return { widgets: WIDGETS.map(w => w.id), hidden: [] } }
export function getDashboardLayout(): DashboardLayout { try { return gO<DashboardLayout>(`${DASHBOARD_KEY}_layout`, getDefaultLayout()) } catch { return getDefaultLayout() } }
export function setDashboardLayout(layout: DashboardLayout): void { try { sS(`${DASHBOARD_KEY}_layout`, layout) } catch { /* ignore */ } }

export function getWidgetData(widgetId: string): unknown {
  try {
    switch (widgetId) {
      case 'overall_score': return { score: getOverallProgressScore(), percent: getProgressPercent() }
      case 'grade': return { grade: getProgressGrade(), score: getOverallProgressScore() }
      case 'gameplay': return getGameplayProgress(); case 'collection': return getCollectionProgress()
      case 'mastery': return getMasteryProgress(); case 'achievements': return getAchievementProgress()
      case 'social': return getSocialProgress(); case 'exploration': return getExplorationProgress()
      case 'economy': return getEconomyProgress(); case 'battle_pass': return getBattlePassProgress()
      case 'goals': return getAllGoalsProgress(); case 'milestones': return getMilestoneTimeline()
      case 'trend': return getProgressTrend(30); case 'comparison': return compareWithAverage()
      case 'suggestions': return getImprovementSuggestions(); default: return null
    }
  } catch { return null }
}

// ─── 8. UI Helpers ──────────────────────────────────────────────────────────

function getMotto(g: ProgressGrade, v: number): string {
  if (g === 'S') return 'Legendary word master!'; if (g === 'A') return 'Outstanding progress!'
  if (g === 'B') return 'Keep up the great work!'; if (g === 'C') return 'Steady progress, keep going!'
  if (g === 'D') return v > 0 ? 'Gaining momentum!' : 'Every journey starts with one step!'
  return 'Begin your word adventure!'
}

export function getProgressDashboardOverview(): DashboardOverview {
  try {
    recordSnapshot()
    const sc = getOverallProgressScore(), gr = getProgressGrade(), gp = getGameplayProgress()
    const cp = getCollectionProgress(), mp = getMasteryProgress(), ap = getAchievementProgress()
    const sp = getSocialProgress(), ep = getExplorationProgress(), bp = getBattlePassProgress()
    return {
      summary: { overallScore: sc, grade: gr, totalGames: gp.gamesPlayed, totalWords: cp.wordsCollected, achievementsUnlocked: ap.unlocked, achievementsTotal: ap.total, currentStreak: sp.currentStreak, hoursPlayed: gp.hoursPlayed, motto: getMotto(gr, getProgressVelocity()) },
      rings: [
        { label: 'Collection', value: cp.wordsCollected, max: cp.totalWordsAvailable, color: '#8b5cf6', emoji: '📝' },
        { label: 'Achievements', value: ap.unlocked, max: ap.total, color: '#f59e0b', emoji: '🏆' },
        { label: 'Story', value: ep.storyChaptersCompleted, max: ep.storyChaptersTotal, color: '#22c55e', emoji: '📖' },
        { label: 'Battle Pass', value: bp.currentTier, max: bp.totalTiers, color: '#3b82f6', emoji: '⭐' },
        { label: 'Mastery', value: mp.wordsMastered, max: Math.max(mp.totalWordsTracked, 100), color: '#ef4444', emoji: '🧠' },
      ],
      bars: [
        { label: 'Overall Progress', value: sc, max: 1000, percent: getProgressPercent(), color: '#6366f1' },
        { label: 'Words Collected', value: cp.wordsCollected, max: cp.totalWordsAvailable, percent: cp.percentCollected, color: '#a855f7' },
        { label: 'Streak', value: sp.currentStreak, max: 30, percent: clamp(Math.round(sp.currentStreak / 30 * 100), 0, 100), color: '#f97316' },
        { label: 'Coins Earned', value: getEconomyProgress().coinsEarned, max: 10000, percent: clamp(Math.round(getEconomyProgress().coinsEarned / 100), 0, 100), color: '#eab308' },
      ],
      todayDelta: getTodayProgress(), activeGoals: getActiveGoals().length, completedGoals: getCompletedGoals().length,
      nextMilestone: getNextMilestone(), topStrengths: getStrengthsAndWeaknesses().filter(s => s.isStrength).slice(0, 3),
    }
  } catch {
    return { summary: { overallScore: 0, grade: 'F', totalGames: 0, totalWords: 0, achievementsUnlocked: 0, achievementsTotal: 25, currentStreak: 0, hoursPlayed: 0, motto: 'Begin your word adventure!' }, rings: [], bars: [], todayDelta: { scoreGained: 0, wordsCollected: 0, gamesPlayed: 0, achievementsUnlocked: 0, xpGained: 0 }, activeGoals: 0, completedGoals: 0, nextMilestone: null, topStrengths: [] }
  }
}

export function getProgressRingData(): ProgressRingData[] {
  try {
    const cp = getCollectionProgress(), ap = getAchievementProgress(), ep = getExplorationProgress(), bp = getBattlePassProgress(), mp = getMasteryProgress()
    return [
      { label: 'Overall', value: getOverallProgressScore(), max: 1000, color: '#6366f1', emoji: '📊' },
      { label: 'Words', value: cp.wordsCollected, max: cp.totalWordsAvailable, color: '#8b5cf6', emoji: '📝' },
      { label: 'Trophies', value: ap.unlocked, max: ap.total, color: '#f59e0b', emoji: '🏆' },
      { label: 'Story', value: ep.storyChaptersCompleted, max: ep.storyChaptersTotal, color: '#22c55e', emoji: '📖' },
      { label: 'Pass', value: bp.currentTier, max: bp.totalTiers, color: '#3b82f6', emoji: '⚔️' },
      { label: 'Mastery', value: mp.wordsMastered, max: Math.max(mp.totalWordsTracked, 1), color: '#ef4444', emoji: '🧠' },
    ]
  } catch { return [] }
}

export function getProgressBarData(): ProgressBarData[] {
  try {
    const gp = getGameplayProgress(), cp = getCollectionProgress(), sp = getSocialProgress(), mp = getMasteryProgress(), ec = getEconomyProgress()
    return [
      { label: 'Games Played', value: gp.gamesPlayed, max: 100, percent: clamp(gp.gamesPlayed, 0, 100), color: '#6366f1' },
      { label: 'Best Score', value: gp.bestScore, max: 1000, percent: clamp(Math.round(gp.bestScore / 10), 0, 100), color: '#8b5cf6' },
      { label: 'Word Collection', value: cp.wordsCollected, max: cp.totalWordsAvailable, percent: Math.round(cp.percentCollected), color: '#a855f7' },
      { label: 'Mastery Average', value: Math.round(mp.averageMastery * 100), max: 500, percent: clamp(Math.round(mp.averageMastery * 20), 0, 100), color: '#ef4444' },
      { label: 'Streak (days)', value: sp.currentStreak, max: 30, percent: clamp(Math.round(sp.currentStreak / 30 * 100), 0, 100), color: '#f97316' },
      { label: 'Coins Earned', value: ec.coinsEarned, max: 10000, percent: clamp(Math.round(ec.coinsEarned / 100), 0, 100), color: '#eab308' },
    ]
  } catch { return [] }
}

export function getSummaryCard(): SummaryCard { try { return getProgressDashboardOverview().summary } catch { return { overallScore: 0, grade: 'F', totalGames: 0, totalWords: 0, achievementsUnlocked: 0, achievementsTotal: 25, currentStreak: 0, hoursPlayed: 0, motto: 'Begin your word adventure!' } } }

export function getDetailedReport(): string {
  try {
    recordSnapshot()
    const sc = getOverallProgressScore(), gp = getGameplayProgress(), cp = getCollectionProgress()
    const mp = getMasteryProgress(), ap = getAchievementProgress(), sp = getSocialProgress()
    const ep = getExplorationProgress(), ec = getEconomyProgress(), bp = getBattlePassProgress()
    const nm = getNextMilestone(), sug = getImprovementSuggestions().slice(0, 3)
    return [
      '═══════════════════════════════════════════',
      '      WORD SNAKE — PROGRESS REPORT         ',
      '═══════════════════════════════════════════',
      '', `  Score: ${sc}/1000 (${getProgressPercent()}%)  Grade: ${getProgressGrade()}  Velocity: ${getProgressVelocity()} pts/day`,
      '', `── Gameplay ── Games: ${gp.gamesPlayed}  Score: ${gp.totalScore.toLocaleString()}  Best: ${gp.bestScore}  Hours: ${gp.hoursPlayed}h  Combo: ${gp.maxCombo}x`,
      `── Collection ── Words: ${cp.wordsCollected}/${cp.totalWordsAvailable} (${cp.percentCollected}%)  Rarest: ${cp.rarestWords.join(', ')}`,
      `── Mastery ── Tracked: ${mp.totalWordsTracked}  Mastered: ${mp.wordsMastered}  Legendary: ${mp.wordsLegendary}  Avg: ${mp.averageMastery}/5`,
      `── Achievements ── ${ap.unlocked}/${ap.total} (${ap.percentComplete}%)`,
      `── Social ── Streak: ${sp.currentStreak}  Best: ${sp.longestStreak}  Multiplayer: ${sp.multiplayerGames}`,
      `── Exploration ── Story: ${ep.storyChaptersCompleted}/${ep.storyChaptersTotal}  Regions: ${ep.worldMapRegions}/${ep.worldMapRegionsTotal}  Lore: ${ep.loreDiscovered}/${ep.loreTotal}`,
      `── Economy ── Earned: ${ec.coinsEarned.toLocaleString()}  Spent: ${ec.coinsSpent.toLocaleString()}  Balance: ${ec.coinsBalance.toLocaleString()}  Shop: ${ec.shopItemsPurchased}/${ec.shopItemsTotal}`,
      `── Battle Pass ── Tier: ${bp.currentTier}/${bp.totalTiers}  XP: ${bp.seasonXP.toLocaleString()}  Rewards: ${bp.rewardsClaimed}/${bp.rewardsTotal}`,
      '', `── Goals ── Completed: ${getCompletedGoals().length}  Active: ${getActiveGoals().length}`,
      ...(nm ? ['', `── Next Milestone ── ${nm.emoji} ${nm.title}: ${nm.description}`] : []),
      ...(sug.length ? ['', '── Suggestions ──', ...sug.map(s => `  [${s.priority.toUpperCase()}] ${s.suggestion}`)] : []),
      '', '═══════════════════════════════════════════',
      `  Generated: ${new Date().toLocaleString()}`, '═══════════════════════════════════════════',
    ].join('\n')
  } catch { return 'Error generating progress report.' }
}

export function recordProgressSnapshot(): void { recordSnapshot() }

export function resetDashboardData(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(SNAPSHOT_KEY); localStorage.removeItem(`${DASHBOARD_KEY}_layout`) } catch { /* ignore */ }
}
