'use client'

import { getGameStats, formatPlayTime, type GameStats } from '@/lib/game-stats'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Gamepad2,
  Trophy,
  BarChart3,
  Medal,
  Clock,
  BookOpen,
  Sparkles,
  Pen,
  Palette,
  Flame,
  Zap,
  Gift,
  Star,
  Tag,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface GameStatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StatCard({ icon: Icon, value, label, valueColor = 'text-amber-400' }: {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  valueColor?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-800/50 border border-slate-700/40 min-w-0">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <span className={`text-base font-bold ${valueColor} leading-tight text-center break-words stats-value-glow`}>{value}</span>
      <span className="text-[10px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  )
}

export default function GameStatsDialog({ open, onOpenChange }: GameStatsDialogProps) {
  const [stats, setStats] = useState<GameStats | null>(null)

  useEffect(() => {
    if (open) {
      setStats(getGameStats())
    }
  }, [open])

  if (!stats) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-fancy p-6" overlayClassName="modal-backdrop-enhanced">
        <DialogHeader>
          <DialogTitle className="text-amber-400 flex items-center gap-2 text-lg">
            <span className="text-2xl">📊</span>
            Game Statistics
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Your complete gameplay metrics and records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Overall Stats */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overall Stats</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <StatCard icon={Gamepad2} value={stats.totalGamesPlayed} label="Games Played" />
              <StatCard icon={Trophy} value={stats.totalScore.toLocaleString()} label="Total Score" />
              <StatCard icon={BarChart3} value={stats.averageScore.toLocaleString()} label="Avg Score" />
              <StatCard icon={Medal} value={stats.bestScore > 0 ? `${stats.bestScore}` : '—'} label={`Best${stats.bestScoreDifficulty ? ` (${stats.bestScoreDifficulty})` : ''}`} valueColor="text-green-400" />
              <StatCard icon={Clock} value={formatPlayTime(stats.totalPlayTime)} label="Play Time" />
              <StatCard icon={BookOpen} value={stats.totalWordsEaten} label="Words Eaten" />
            </div>
          </section>

          {/* Poetry Stats */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Poetry Stats</h3>
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={Sparkles} value={stats.totalPoemsCreated} label="Poems Created" valueColor="text-purple-400" />
              <StatCard icon={Pen} value={stats.totalWordsUsedInPoems} label="Words in Poems" valueColor="text-purple-400" />
              <StatCard icon={Palette} value={stats.favoriteStyle === 'None' ? '—' : stats.favoriteStyle.replace('_', ' ')} label="Favorite Style" valueColor="text-purple-400" />
            </div>
          </section>

          {/* Challenge Stats */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Challenge Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard icon={Gamepad2} value={stats.dailyChallengesPlayed} label="Daily Played" />
              <StatCard icon={Trophy} value={stats.dailyChallengesCompleted} label="Daily Completed" valueColor="text-green-400" />
              <StatCard icon={Flame} value={`${stats.currentStreak}/${stats.longestStreak}`} label="Current / Longest Streak" valueColor="text-amber-400" />
              <StatCard icon={Medal} value={`${stats.achievementsUnlocked}/${stats.totalAchievements}`} label="Achievements" valueColor="text-amber-400" />
            </div>
          </section>

          {/* Records */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Records</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <StatCard icon={Zap} value={stats.maxCombo > 0 ? `×${stats.maxCombo}` : '—'} label="Max Combo" valueColor="text-green-400" />
              <StatCard icon={Gift} value={stats.powerUpsCollected} label="Power-ups" valueColor="text-green-400" />
              <StatCard icon={Star} value={stats.rarestWordEaten} label="Rarest Word" valueColor="text-green-400" />
              <StatCard icon={Tag} value={stats.mostEatenCategory === 'None' ? '—' : stats.mostEatenCategory.charAt(0).toUpperCase() + stats.mostEatenCategory.slice(1)} label={`Most Eaten (${stats.mostEatenCategoryCount})`} valueColor="text-green-400" />
              <StatCard icon={Palette} value={stats.skinsUsed.length} label="Skins Used" valueColor="text-green-400" />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
