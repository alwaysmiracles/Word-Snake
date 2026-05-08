'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  X,
  Trophy,
  Clock,
  Target,
  Zap,
  Star,
  Flame,
  Sword,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Timer,
  BarChart3,
  Award,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { getGameStats, type GameStats } from '@/lib/game-stats'
import { getLeaderboard, type Difficulty } from '@/lib/leaderboard'
import { getStreak, type StreakInfo } from '@/lib/streak'
import { getAllDefinitions } from '@/lib/word-definitions'
import { useWordStore } from '@/lib/word-store'
import { formatPlayTime } from '@/lib/game-stats'
import { getCategoryInfo, type WordCategory } from '@/lib/word-pool'

// ─── Types ───────────────────────────────────────────────────────
interface StatsComparisonProps {
  isOpen: boolean
  onClose: () => void
}

interface RadarAxis {
  label: string
  value: number
  max: number
  icon: LucideIcon
}

interface RecordCard {
  label: string
  value: string | number
  icon: LucideIcon
  gradient: string
}

// ─── Category metadata ───────────────────────────────────────────
const ALL_CATEGORIES: WordCategory[] = [
  'nature', 'emotion', 'element', 'time', 'creature', 'quality', 'object', 'action',
]

const DIFFICULTY_META: { key: Difficulty; label: string; color: string }[] = [
  { key: 'easy', label: 'Easy', color: '#22c55e' },
  { key: 'medium', label: 'Medium', color: '#eab308' },
  { key: 'hard', label: 'Hard', color: '#f43f5e' },
]

// ─── Helper: read category stats from localStorage ───────────────
function getCategoryStats(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('word-snake-category-stats')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// ─── Radar chart drawing ────────────────────────────────────────
function drawRadarChart(
  canvas: HTMLCanvasElement,
  axes: RadarAxis[],
  animated = false
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const cssW = 280
  const cssH = 280
  canvas.width = cssW * dpr
  canvas.height = cssH * dpr
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  ctx.scale(dpr, dpr)

  const cx = cssW / 2
  const cy = cssH / 2
  const maxR = 100
  const levels = 4
  const n = axes.length
  const angleStep = (Math.PI * 2) / n
  const startAngle = -Math.PI / 2 // top

  ctx.clearRect(0, 0, cssW, cssH)

  // Grid rings
  for (let i = 1; i <= levels; i++) {
    const r = (maxR / levels) * i
    ctx.beginPath()
    for (let j = 0; j <= n; j++) {
      const a = startAngle + angleStep * j
      const x = cx + r * Math.cos(a)
      const y = cy + r * Math.sin(a)
      if (j === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Level labels
    if (i === levels) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`${i * 25}`, cx + 4, cy - r + 10)
    }
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const a = startAngle + angleStep * i
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a))
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Data polygon
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const norm = Math.min(1, axes[i].max > 0 ? axes[i].value / axes[i].max : 0)
    const r = maxR * norm
    const a = startAngle + angleStep * i
    points.push({
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    })
  }

  // Gradient fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)')
  grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)')

  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y)
    else ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Data points (glowing dots)
  for (const pt of points) {
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'
    ctx.fill()
  }

  // Axis labels
  for (let i = 0; i < n; i++) {
    const a = startAngle + angleStep * i
    const labelR = maxR + 28
    const lx = cx + labelR * Math.cos(a)
    const ly = cy + labelR * Math.sin(a)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(axes[i].label, lx, ly - 7)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px sans-serif'
    const displayVal =
      axes[i].value >= 1000
        ? `${(axes[i].value / 1000).toFixed(1)}k`
        : Math.round(axes[i].value).toString()
    ctx.fillText(displayVal, lx, ly + 7)
  }
}

// ─── Main Component ─────────────────────────────────────────────
export default function StatsComparison({ isOpen, onClose }: StatsComparisonProps) {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})
  const [totalDefinitions, setTotalDefinitions] = useState(0)
  const [uniqueWords, setUniqueWords] = useState(0)
  const [difficultyCounts, setDifficultyCounts] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  })
  const [recentTrend, setRecentTrend] = useState<'improving' | 'stable' | 'declining'>('stable')
  const [recentAvg, setRecentAvg] = useState(0)
  const [mounted, setMounted] = useState(false)

  const radarRef = useRef<HTMLCanvasElement>(null)
  const collectedWords = useWordStore((s) => s.collectedWords)

  // Load all data
  const loadData = useCallback(() => {
    const s = getGameStats()
    setStats(s)
    setStreakInfo(getStreak())
    setCategoryStats(getCategoryStats())
    setTotalDefinitions(getAllDefinitions().length)
    setUniqueWords(Object.keys(collectedWords).length)

    // Difficulty distribution from leaderboard
    const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
    for (const diff of ['easy', 'medium', 'hard'] as Difficulty[]) {
      counts[diff] = getLeaderboard(diff).length
    }
    setDifficultyCounts(counts)

    // Recent trend: get all scores sorted by date, take last 5
    const allEntries = getLeaderboard()
    if (allEntries.length >= 2) {
      const sorted = [...allEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const lastN = Math.min(5, sorted.length)
      const recentScores = sorted.slice(0, lastN).map((e) => e.score)
      const olderScores = sorted.slice(lastN, lastN * 2).map((e) => e.score)

      const recentMean =
        recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      setRecentAvg(Math.round(recentMean))

      if (olderScores.length > 0) {
        const olderMean =
          olderScores.reduce((a, b) => a + b, 0) / olderScores.length
        const diff = recentMean - olderMean
        if (diff > olderMean * 0.1) setRecentTrend('improving')
        else if (diff < -olderMean * 0.1) setRecentTrend('declining')
        else setRecentTrend('stable')
      }
    } else if (allEntries.length === 1) {
      setRecentAvg(allEntries[0].score)
    }
  }, [collectedWords])

  useEffect(() => {
    if (!isOpen) return
    setMounted(false)
    loadData()
    // Small delay for transition
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [isOpen, loadData])

  // Draw radar chart
  useEffect(() => {
    if (!isOpen || !stats || !radarRef.current) return
    const timer = setTimeout(() => {
      const axes: RadarAxis[] = [
        {
          label: 'Speed',
          value: stats.averageScore,
          max: 500,
          icon: Zap,
        },
        {
          label: 'Endurance',
          value: Math.round(stats.totalPlayTime / 60000),
          max: 600,
          icon: Timer,
        },
        {
          label: 'Knowledge',
          value: uniqueWords,
          max: totalDefinitions || 1,
          icon: Brain,
        },
        {
          label: 'Strategy',
          value: stats.maxCombo,
          max: 50,
          icon: Target,
        },
        {
          label: 'Consistency',
          value: stats.totalGamesPlayed,
          max: 200,
          icon: BarChart3,
        },
      ]
      if (radarRef.current) {
        drawRadarChart(radarRef.current, axes)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [isOpen, stats, uniqueWords, totalDefinitions])

  // ─── Derived values ─────────────────────────────────────────
  if (!isOpen || !stats) return null

  const totalGames = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard

  const maxCategoryCount = Math.max(1, ...Object.values(categoryStats))

  const records: RecordCard[] = [
    {
      label: 'Best Score',
      value: stats.bestScore.toLocaleString(),
      icon: Trophy,
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
    {
      label: 'Longest Streak',
      value: `${streakInfo?.longestStreak ?? stats.longestStreak} days`,
      icon: Flame,
      gradient: 'from-red-500/20 to-pink-500/20',
    },
    {
      label: 'Most Words (All Time)',
      value: stats.totalWordsEaten.toLocaleString(),
      icon: BookOpen,
      gradient: 'from-emerald-500/20 to-cyan-500/20',
    },
    {
      label: 'Highest Combo',
      value: `${stats.maxCombo}x`,
      icon: Zap,
      gradient: 'from-yellow-500/20 to-amber-500/20',
    },
    {
      label: 'Current Streak',
      value: `${streakInfo?.currentStreak ?? stats.currentStreak} days`,
      icon: Star,
      gradient: 'from-purple-500/20 to-violet-500/20',
    },
    {
      label: 'Unique Words',
      value: `${uniqueWords} / ${totalDefinitions}`,
      icon: Layers,
      gradient: 'from-cyan-500/20 to-teal-500/20',
    },
  ]

  const trendConfig = {
    improving: {
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      label: 'Improving',
    },
    stable: {
      icon: Minus,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      label: 'Stable',
    },
    declining: {
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      label: 'Declining',
    },
  }

  const trend = trendConfig[recentTrend]
  const TrendIcon = trend.icon

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        mounted
          ? 'opacity-100'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl shadow-black/40">
        {/* Custom scrollbar */}
        <style>{`
          .stats-scroll::-webkit-scrollbar { width: 6px; }
          .stats-scroll::-webkit-scrollbar-track { background: transparent; }
          .stats-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 3px; }
          .stats-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.35); }
        `}</style>

        <div className="stats-scroll overflow-y-auto max-h-[85vh] p-5 sm:p-8 space-y-6">
          {/* ── Close button ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
            aria-label="Close dashboard"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ══════════════════════════════════════════════════════════
              SECTION 1: HEADER
          ══════════════════════════════════════════════════════════ */}
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-50 tracking-tight">
                  Performance Dashboard
                </h2>
                <p className="text-sm text-slate-400">
                  Your Word Snake journey at a glance
                </p>
              </div>
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: Layers,
                  label: 'Games Played',
                  value: totalGames,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-400/10',
                },
                {
                  icon: Star,
                  label: 'Total Score',
                  value: stats.totalScore.toLocaleString(),
                  color: 'text-amber-400',
                  bg: 'bg-amber-400/10',
                },
                {
                  icon: Clock,
                  label: 'Play Time',
                  value: formatPlayTime(stats.totalPlayTime),
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-400/10',
                },
                {
                  icon: Award,
                  label: 'Achievements',
                  value: `${stats.achievementsUnlocked}/${stats.totalAchievements}`,
                  color: 'text-purple-400',
                  bg: 'bg-purple-400/10',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-slate-800/60 border border-slate-700/40 px-4 py-3"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                    <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 truncate">{item.label}</p>
                    <p className="text-lg font-bold text-slate-50 leading-tight">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </header>

          {/* ══════════════════════════════════════════════════════════
              SECTION 2 & 4: RADAR + DIFFICULTY DISTRIBUTION (side by side)
          ══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Radar Chart */}
            <section className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Performance Radar
              </h3>
              <div className="flex justify-center">
                <canvas ref={radarRef} className="max-w-full" />
              </div>
            </section>

            {/* Difficulty Distribution */}
            <section className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                Difficulty Distribution
              </h3>

              <div className="space-y-5 mt-6">
                {DIFFICULTY_META.map((diff) => {
                  const count = difficultyCounts[diff.key]
                  const pct =
                    totalGames > 0 ? Math.round((count / totalGames) * 100) : 0

                  return (
                    <div key={diff.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-300 font-medium">
                          {diff.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {count} game{count !== 1 ? 's' : ''} · {pct}%
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-700/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${mounted ? pct : 0}%`,
                            backgroundColor: diff.color,
                            boxShadow: `0 0 12px ${diff.color}40`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}

                {totalGames === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No games played yet
                  </p>
                )}
              </div>

              {/* Donut-like visual */}
              {totalGames > 0 && (
                <div className="flex items-center justify-center mt-6">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                      {(() => {
                        let offset = 0
                        return DIFFICULTY_META.map((diff) => {
                          const count = difficultyCounts[diff.key]
                          const pct =
                            totalGames > 0
                              ? (count / totalGames) * 100
                              : 0
                          const el = (
                            <circle
                              key={diff.key}
                              cx="18"
                              cy="18"
                              r="14"
                              fill="none"
                              stroke={diff.color}
                              strokeWidth="4"
                              strokeDasharray={`${pct} ${100 - pct}`}
                              strokeDashoffset={`${-offset}`}
                              strokeLinecap="round"
                              opacity={0.85}
                            />
                          )
                          offset += pct
                          return el
                        })
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-slate-50">
                        {totalGames}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        games
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SECTION 3: CATEGORY BREAKDOWN BAR CHART
          ══════════════════════════════════════════════════════════ */}
          <section className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-pink-400" />
              Category Breakdown
            </h3>

            <div className="space-y-3">
              {ALL_CATEGORIES.map((cat) => {
                const info = getCategoryInfo(cat)
                const count = categoryStats[cat] ?? 0
                const pct =
                  maxCategoryCount > 0
                    ? Math.round((count / maxCategoryCount) * 100)
                    : 0

                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" role="img" aria-label={info.label}>
                          {info.emoji}
                        </span>
                        <span className="text-sm text-slate-300 font-medium">
                          {info.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {count}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-700/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-100 opacity-85"
                        style={{
                          width: `${mounted ? pct : 0}%`,
                          backgroundColor: info.color,
                          boxShadow: `0 0 8px ${info.color}30`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              {Object.keys(categoryStats).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No words collected yet — start playing to see your category breakdown!
                </p>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              SECTION 5: PERSONAL RECORDS GRID
          ══════════════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Personal Records
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {records.map((card) => (
                <div
                  key={card.label}
                  className={`group relative overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-br ${card.gradient} p-4 transition-all duration-200 hover:border-slate-600/60 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                      {card.label}
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-50 leading-tight">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              SECTION 6: RECENT TREND
          ══════════════════════════════════════════════════════════ */}
          <section className="rounded-2xl bg-slate-800/60 border border-slate-700/40 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Recent Trend
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${trend.bg}`}
                >
                  <TrendIcon className={`h-5 w-5 ${trend.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-300">
                    Last 5 games average:{' '}
                    <span className="font-bold text-slate-50">
                      {recentAvg > 0 ? recentAvg.toLocaleString() : '—'}
                    </span>
                  </p>
                  <p className={`text-xs font-medium ${trend.color}`}>
                    {trend.label}
                  </p>
                </div>
              </div>

              {/* Simple sparkline from leaderboard scores */}
              {(() => {
                const entries = getLeaderboard()
                if (entries.length < 2) return null
                const sorted = [...entries].sort(
                  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                const last10 = sorted.slice(-10)
                const scores = last10.map((e) => e.score)
                const maxScore = Math.max(...scores, 1)

                return (
                  <div className="flex-1 max-w-xs">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                      Score History ({last10.length} games)
                    </p>
                    <div className="flex items-end gap-[3px] h-10">
                      {scores.map((score, i) => {
                        const h = Math.max(4, (score / maxScore) * 100)
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-sm transition-all duration-500"
                            style={{
                              height: `${mounted ? h : 0}%`,
                              backgroundColor:
                                i === scores.length - 1
                                  ? '#10b981'
                                  : 'rgba(16, 185, 129, 0.35)',
                              transitionDelay: `${i * 50}ms`,
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </section>

          {/* Footer spacer */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  )
}
