'use client'

import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'

interface GameOverStatsProps {
  score: number
  wordsEaten: number
  timeElapsed: number
  difficulty: string
  maxCombo: number
  longestSnake: number
  powerUpsCollected: number
  wordsByCategory: Record<string, number>
  weather: string
  isDailyChallenge: boolean
  dailyCompleted: boolean
  streakMultiplier: number
  rank: number
  entryCount: number
  isNewHighScore: boolean
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function getCategoryBreakdown(wordsByCategory: Record<string, number>): { category: string; count: number; color: string }[] {
  const CATEGORY_META: Record<string, { label: string; color: string }> = {
    nature: { label: 'Nature', color: '#22c55e' },
    emotion: { label: 'Emotion', color: '#f43f5e' },
    element: { label: 'Element', color: '#3b82f6' },
    time: { label: 'Time', color: '#a855f7' },
    creature: { label: 'Creature', color: '#f59e0b' },
    quality: { label: 'Quality', color: '#06b6d4' },
    object: { label: 'Object', color: '#ec4899' },
    action: { label: 'Action', color: '#f97316' },
  }
  return Object.entries(wordsByCategory)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({
      category: CATEGORY_META[cat]?.label ?? cat,
      count,
      color: CATEGORY_META[cat]?.color ?? '#94a3b8',
    }))
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 stat-breathe-enhanced">
      <span className="text-base">{icon}</span>
      <span className={`text-sm font-bold ${accent ?? 'text-slate-100'} number-pop`}>{value}</span>
      <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export default function GameOverStats({ stats }: { stats: GameOverStatsProps }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  const categoryBreakdown = getCategoryBreakdown(stats.wordsByCategory)
  const totalCategoryWords = categoryBreakdown.reduce((sum, c) => sum + c.count, 0)

  // Calculate performance rating
  const perfScore = Math.min(5, Math.floor(
    (stats.wordsEaten * 0.5 + stats.maxCombo * 0.3 + stats.powerUpsCollected * 0.5 + (stats.isNewHighScore ? 2 : 0))
  ))
  const ratingEmojis = ['', ' bronze-star', ' silver-star', ' gold-star', ' platinum-star', ' legendary-star']
  const ratingLabels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Legendary']
  const ratingColors = ['', '#cd7f32', '#c0c0c0', '#ffd700', '#e5e4e2', '#b9f2ff']

  return (
    <div ref={containerRef} className="space-y-4 w-full">
      {/* Performance Rating */}
      <div className="text-center py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
        <div className="text-2xl mb-1">
          {stats.isNewHighScore ? '🏆' : stats.isDailyChallenge && stats.dailyCompleted ? '🎉' : '📊'}
        </div>
        <div
          className="text-lg font-bold mb-0.5"
          style={{ color: ratingColors[perfScore] || '#94a3b8' }}
        >
          {ratingLabels[perfScore] || 'Beginner'}
        </div>
        <div className="text-[10px] text-slate-500">
          {stats.isNewHighScore ? 'New Personal Best!' : stats.isDailyChallenge && stats.dailyCompleted ? 'Daily Challenge Complete!' : 'Performance Rating'}
        </div>
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Score" value={stats.score} icon="⭐" accent="text-amber-400" />
        <StatCard label="Words" value={stats.wordsEaten} icon="📝" accent="text-green-400" />
        <StatCard label="Time" value={formatTime(stats.timeElapsed)} icon="⏱️" accent="text-cyan-400" />
        <StatCard label="Max Combo" value={`×${stats.maxCombo.toFixed(1)}`} icon="🔥" accent="text-orange-400" />
        <StatCard label="Longest" value={stats.longestSnake} icon="📏" accent="text-purple-400" />
        <StatCard label="Power-ups" value={stats.powerUpsCollected} icon="💎" accent="text-blue-400" />
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Category Breakdown
          </h4>
          <div className="space-y-1.5">
            {categoryBreakdown.map(({ category, count, color }) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-300 flex-1">{category}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalCategoryWords > 0 ? (count / totalCategoryWords) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Info Row */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        <Badge variant="secondary" className="text-[9px] bg-slate-800 text-slate-400 border-slate-700/50">
          {stats.difficulty === 'easy' ? '🟢' : stats.difficulty === 'medium' ? '🟡' : '🔴'} {stats.difficulty}
        </Badge>
        <Badge variant="secondary" className="text-[9px] bg-slate-800 text-slate-400 border-slate-700/50">
          {stats.weather === 'clear' ? '☀️' : stats.weather === 'rain' ? '🌧️' : stats.weather === 'snow' ? '❄️' : '⭐'} {stats.weather}
        </Badge>
        {stats.isDailyChallenge && (
          <Badge variant="secondary" className="text-[9px] bg-amber-900/40 text-amber-400 border-amber-700/50">
            📅 Daily
          </Badge>
        )}
        {stats.streakMultiplier > 1 && (
          <Badge variant="secondary" className="text-[9px] bg-orange-900/40 text-orange-400 border-orange-700/50">
            🔥 ×{stats.streakMultiplier}
          </Badge>
        )}
        {stats.rank > 0 && (
          <Badge variant="secondary" className="text-[9px] bg-slate-800 text-slate-400 border-slate-700/50">
            🏅 Rank #{stats.rank}/{stats.entryCount}
          </Badge>
        )}
      </div>
    </div>
  )
}
